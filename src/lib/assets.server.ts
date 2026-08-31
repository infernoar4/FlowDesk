import { createServerFn } from "@tanstack/react-start";
import {
  ASSET_CATEGORIES,
  type AssetCategory,
  type AssetRequest,
  type AssetStatus,
} from "@/data/assets";
import {
  requireAuthenticatedUser,
  getCurrentEmployee,
  getCurrentSupportEngineer,
} from "./authorization.server";
import { db } from "./db";

/**
 * Database-backed asset request data used by the existing asset UI shape.
 * Dates remain in their database representation so callers can format them
 * consistently with the rest of the application.
 */
export type DatabaseAssetComment = {
  author: string;
  message: string;
  created_at: Date | string;
};

export type DatabaseAssetRequest = {
  id: string;
  employee: string;
  category: AssetCategory;
  reason: string;
  requested_on: Date | string;
  status: AssetStatus;
  reviewed_by: string | null;
  reviewed_on: Date | string | null;
  rejection_reason: string | null;
  asset_id: string | null;
  asset_name: string | null;
  assigned_on: Date | string | null;
  return_requested_on: Date | string | null;
  returned_on: Date | string | null;
};

export type DatabaseAssetRequestDetail = DatabaseAssetRequest & {
  comments: DatabaseAssetComment[];
};

export type DatabasePhysicalAsset = {
  id: string;
  name: string;
  category: AssetCategory;
  status: "available" | "assigned" | "maintenance" | "retired";
  assigned_to: string | null;
  assigned_on: Date | string | null;
};

export type EmployeeAssetDashboard = {
  employeeName: string;
  assignedAssetCount: number;
  pendingRequestCount: number;
  recentRequests: DatabaseAssetRequest[];
};

export type SupportAssetDashboard = {
  pendingRequestCount: number;
  assignedTodayCount: number;
  returnedTodayCount: number;
  availableAssetCount: number;
  pendingRequests: DatabaseAssetRequest[];
};

function formatAssetDate(value: Date | string | null): string | undefined {
  if (!value) return undefined;

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);

  // MySQL DATE values represent a calendar date. Preserve its components so
  // a browser/server timezone cannot shift the date displayed by the UI.
  const calendarDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(calendarDate);
}

export function mapDatabaseAssetRequest(request: DatabaseAssetRequest): AssetRequest {
  return {
    id: request.id,
    employee: request.employee,
    category: request.category,
    reason: request.reason,
    requestedOn: formatAssetDate(request.requested_on) ?? "",
    status: request.status,
    reviewedBy: request.reviewed_by ?? undefined,
    reviewedOn: formatAssetDate(request.reviewed_on),
    rejectionReason: request.rejection_reason ?? undefined,
    assetId: request.asset_id ?? undefined,
    assetName: request.asset_name ?? undefined,
    assignedOn: formatAssetDate(request.assigned_on),
    returnRequestedOn: formatAssetDate(request.return_requested_on),
    returnedOn: formatAssetDate(request.returned_on),
  };
}

export function mapDatabaseAssetRequestDetail(request: DatabaseAssetRequestDetail): AssetRequest {
  return {
    ...mapDatabaseAssetRequest(request),
    comments: request.comments.map((comment) => ({
      author: comment.author,
      message: comment.message,
      date: formatAssetDate(comment.created_at) ?? "",
    })),
  };
}

const ASSET_REQUEST_SELECT = `
  SELECT
    ar.id,
    employee.full_name AS employee,
    ar.category,
    ar.reason,
    ar.requested_on,
    ar.status,
    reviewer.full_name AS reviewed_by,
    ar.reviewed_on,
    ar.rejection_reason,
    ar.asset_id,
    ar.asset_name,
    ar.assigned_on,
    ar.return_requested_on,
    ar.returned_on
  FROM asset_requests ar
  JOIN users employee ON ar.employee_id = employee.id
  LEFT JOIN users reviewer ON ar.reviewed_by = reviewer.id
`;

async function getAssetComments(requestId: string): Promise<DatabaseAssetComment[]> {
  const [rows] = await db.query(
    `
      SELECT
        author.full_name AS author,
        ac.message,
        ac.created_at
      FROM asset_comments ac
      JOIN users author ON ac.author_id = author.id
      WHERE ac.asset_request_id = ?
      ORDER BY ac.created_at, ac.id
    `,
    [requestId],
  );

  return rows as DatabaseAssetComment[];
}

/** Employee-only request list, scoped by the fixed demo employee identity. */
export const getEmployeeAssetRequests = createServerFn({ method: "GET" }).handler(async () => {
  const employee = await getCurrentEmployee();
  const [rows] = await db.query(
    `${ASSET_REQUEST_SELECT}
       WHERE ar.employee_id = ?
       ORDER BY ar.requested_on DESC, ar.id DESC`,
    [employee.id],
  );
  return rows as DatabaseAssetRequest[];
});

/** Employee-only detail read. A non-owned request is indistinguishable from missing. */
export const getEmployeeAssetRequestById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const [rows] = await db.query(
      `${ASSET_REQUEST_SELECT}
       WHERE ar.id = ? AND ar.employee_id = ?
       LIMIT 1`,
      [data.id, employee.id],
    );
    const request = (rows as DatabaseAssetRequest[])[0];
    if (!request) return null;

    return {
      ...request,
      comments: await getAssetComments(request.id),
    } satisfies DatabaseAssetRequestDetail;
  });

/** Support-only queue. The selected demo engineer is verified against users.role. */
export const getSupportAssetRequests = createServerFn({ method: "GET" }).handler(async () => {
  await getCurrentSupportEngineer();
  const [rows] = await db.query(
    `${ASSET_REQUEST_SELECT}
       ORDER BY ar.requested_on DESC, ar.id DESC`,
  );
  return rows as DatabaseAssetRequest[];
});

/** Support-only request detail, including the persisted request comments. */
export const getSupportAssetRequestById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await getCurrentSupportEngineer();
    const [rows] = await db.query(
      `${ASSET_REQUEST_SELECT}
       WHERE ar.id = ?
       LIMIT 1`,
      [data.id],
    );
    const request = (rows as DatabaseAssetRequest[])[0];
    if (!request) return null;

    return {
      ...request,
      comments: await getAssetComments(request.id),
    } satisfies DatabaseAssetRequestDetail;
  });

/** Support-only inventory read for later asset-assignment UI wiring. */
export const getAvailablePhysicalAssets = createServerFn({ method: "GET" }).handler(async () => {
  await getCurrentSupportEngineer();
  const [rows] = await db.query(
    `
        SELECT
          pa.id,
          pa.name,
          pa.category,
          pa.status,
          assignee.full_name AS assigned_to,
          pa.assigned_on
        FROM physical_assets pa
        LEFT JOIN users assignee ON pa.assigned_to = assignee.id
        WHERE pa.status = 'available'
        ORDER BY pa.category, pa.name, pa.id
      `,
  );
  return rows as DatabasePhysicalAsset[];
});

/** Employee-only dashboard reads, scoped to the current placeholder employee. */
export const getEmployeeAssetDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const employee = await getCurrentEmployee();
  const [countRows, recentRows] = await Promise.all([
    db.query(
      `
          SELECT
            COALESCE(SUM(status IN ('assigned', 'return_requested')), 0) AS assigned_asset_count,
            COALESCE(SUM(status = 'pending'), 0) AS pending_request_count
          FROM asset_requests
          WHERE employee_id = ?
        `,
      [employee.id],
    ),
    db.query(
      `${ASSET_REQUEST_SELECT}
         WHERE ar.employee_id = ?
         ORDER BY ar.requested_on DESC, ar.id DESC
         LIMIT 4`,
      [employee.id],
    ),
  ]);
  const counts = (
    countRows[0] as {
      assigned_asset_count: number | string;
      pending_request_count: number | string;
    }[]
  )[0];

  return {
    employeeName: employee.fullName,
    assignedAssetCount: Number(counts?.assigned_asset_count ?? 0),
    pendingRequestCount: Number(counts?.pending_request_count ?? 0),
    recentRequests: recentRows[0] as DatabaseAssetRequest[],
  } satisfies EmployeeAssetDashboard;
});

/** Support-only operational dashboard reads using database dates, not UI strings. */
export const getSupportAssetDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await getCurrentSupportEngineer();
  const [requestCountRows, assetCountRows, pendingRows] = await Promise.all([
    db.query(`
        SELECT
          COALESCE(SUM(status = 'pending'), 0) AS pending_request_count,
          COALESCE(SUM(assigned_on = CURDATE()), 0) AS assigned_today_count,
          COALESCE(SUM(returned_on = CURDATE()), 0) AS returned_today_count
        FROM asset_requests
      `),
    db.query(
      "SELECT COUNT(*) AS available_asset_count FROM physical_assets WHERE status = 'available'",
    ),
    db.query(`
        ${ASSET_REQUEST_SELECT}
        WHERE ar.status = 'pending'
        ORDER BY ar.requested_on DESC, ar.id DESC
      `),
  ]);
  const requestCounts = (
    requestCountRows[0] as {
      pending_request_count: number | string;
      assigned_today_count: number | string;
      returned_today_count: number | string;
    }[]
  )[0];
  const assetCounts = (
    assetCountRows[0] as {
      available_asset_count: number | string;
    }[]
  )[0];

  return {
    pendingRequestCount: Number(requestCounts?.pending_request_count ?? 0),
    assignedTodayCount: Number(requestCounts?.assigned_today_count ?? 0),
    returnedTodayCount: Number(requestCounts?.returned_today_count ?? 0),
    availableAssetCount: Number(assetCounts?.available_asset_count ?? 0),
    pendingRequests: pendingRows[0] as DatabaseAssetRequest[],
  } satisfies SupportAssetDashboard;
});

const MAX_ASSET_REASON_LENGTH = 2_000;
const MAX_ASSET_COMMENT_LENGTH = 2_000;

function validateAssetReason(value: string): string {
  const reason = value.trim();
  if (!reason) throw new Error("A reason for the asset request is required.");
  if (reason.length > MAX_ASSET_REASON_LENGTH) {
    throw new Error("Asset request reasons must be 2,000 characters or fewer.");
  }
  return reason;
}

function validateAssetComment(value: string, label = "Comment"): string {
  const message = value.trim();
  if (!message) throw new Error(`${label} is required.`);
  if (message.length > MAX_ASSET_COMMENT_LENGTH) {
    throw new Error(`${label} must be 2,000 characters or fewer.`);
  }
  return message;
}

async function insertAssetComment(
  connection: Awaited<ReturnType<typeof db.getConnection>>,
  requestId: string,
  authorId: number,
  message: string,
) {
  await connection.query(
    `
      INSERT INTO asset_comments (asset_request_id, author_id, message, created_at)
      VALUES (?, ?, ?, NOW())
    `,
    [requestId, authorId, message],
  );
}

async function acquireAssetRequestIdLock(
  connection: Awaited<ReturnType<typeof db.getConnection>>,
): Promise<boolean> {
  const [lockRows] = await connection.query(
    "SELECT GET_LOCK('flowdesk_asset_requests', 10) AS acquired",
  );
  return (lockRows as { acquired: number }[])[0]?.acquired === 1;
}

async function allocateAssetRequestId(
  connection: Awaited<ReturnType<typeof db.getConnection>>,
): Promise<string> {
  const [idRows] = await connection.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)), 0) + 1 AS next_id FROM asset_requests",
  );
  const nextId = (idRows as { next_id: number }[])[0]?.next_id ?? 1;
  return `AR-${String(nextId).padStart(4, "0")}`;
}

async function assertNoActiveAssetAssignment(
  connection: Awaited<ReturnType<typeof db.getConnection>>,
  employeeId: number,
  category: AssetCategory,
) {
  const [rows] = await connection.query(
    `
      SELECT id FROM asset_requests
      WHERE employee_id = ?
        AND category = ?
        AND status IN ('assigned', 'return_requested')
      LIMIT 1
      FOR UPDATE
    `,
    [employeeId, category],
  );
  if ((rows as { id: string }[]).length > 0) {
    throw new Error(
      `You already have a ${category.toLowerCase()} assigned. Return it before requesting another.`,
    );
  }
}

/** Creates a new employee-owned request. This is placeholder identity, not real authentication. */
export const createAssetRequest = createServerFn({ method: "POST" })
  .validator((input: { category: AssetCategory; reason: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    if (!ASSET_CATEGORIES.includes(data.category)) {
      throw new Error("Invalid asset category.");
    }
    const reason = validateAssetReason(data.reason);
    const connection = await db.getConnection();
    let transactionStarted = false;
    let lockAcquired = false;

    try {
      lockAcquired = await acquireAssetRequestIdLock(connection);
      if (!lockAcquired) throw new Error("Unable to create the asset request. Please try again.");
      await connection.beginTransaction();
      transactionStarted = true;
      await assertNoActiveAssetAssignment(connection, employee.id, data.category);
      const id = await allocateAssetRequestId(connection);

      await connection.query(
        `
          INSERT INTO asset_requests
            (id, employee_id, category, reason, requested_on, status)
          VALUES (?, ?, ?, ?, CURDATE(), 'pending')
        `,
        [id, employee.id, data.category, reason],
      );

      const [rows] = await connection.query(`${ASSET_REQUEST_SELECT} WHERE ar.id = ? LIMIT 1`, [
        id,
      ]);
      const request = (rows as DatabaseAssetRequest[])[0];
      if (!request) throw new Error("Unable to load the new asset request.");
      await connection.commit();
      return request;
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      if (lockAcquired) await connection.query("SELECT RELEASE_LOCK('flowdesk_asset_requests')");
      connection.release();
    }
  });

export const reviewAssetRequest = createServerFn({ method: "POST" })
  .validator(
    (input: { id: string; decision: "approve" | "reject"; rejectionReason?: string }) => input,
  )
  .handler(async ({ data }) => {
    const support = await getCurrentSupportEngineer();
    if (data.decision !== "approve" && data.decision !== "reject") {
      throw new Error("Invalid asset review decision.");
    }
    const rejectionReason =
      data.decision === "reject"
        ? validateAssetComment(data.rejectionReason ?? "", "A rejection reason")
        : null;
    const approvalComment =
      data.decision === "approve" && data.rejectionReason?.trim()
        ? validateAssetComment(data.rejectionReason, "Support comment")
        : null;
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [requestRows] = await connection.query(
        "SELECT id, status FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (requestRows as { id: string; status: AssetStatus }[])[0];
      if (!request || request.status !== "pending") {
        throw new Error("This asset request is no longer awaiting review.");
      }

      const [result] = await connection.query(
        `
          UPDATE asset_requests
          SET status = ?, reviewed_by = ?, reviewed_on = CURDATE(), rejection_reason = ?
          WHERE id = ? AND status = 'pending'
        `,
        [
          data.decision === "approve" ? "approved" : "rejected",
          support.id,
          rejectionReason,
          data.id,
        ],
      );
      if ((result as unknown as { affectedRows: number }).affectedRows !== 1) {
        throw new Error("This asset request is no longer awaiting review.");
      }

      await insertAssetComment(
        connection,
        data.id,
        support.id,
        data.decision === "reject"
          ? rejectionReason!
          : (approvalComment ?? "Approved asset request."),
      );
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

export const assignPhysicalAsset = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      assetId: string;
      assetName?: string;
      assignedDate?: string;
      supportComment?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const support = await getCurrentSupportEngineer();
    const assetId = data.assetId.trim();
    if (!assetId) throw new Error("Select a physical asset to assign.");
    const supportComment = data.supportComment?.trim()
      ? validateAssetComment(data.supportComment, "Support comment")
      : null;
    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [requestRows] = await connection.query(
        "SELECT id, employee_id, category, status FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (
        requestRows as {
          id: string;
          employee_id: number;
          category: AssetCategory;
          status: AssetStatus;
        }[]
      )[0];
      if (!request || request.status !== "approved") {
        throw new Error("Only approved asset requests can be assigned.");
      }

      const [assetRows] = await connection.query(
        "SELECT id, name, category, status, assigned_to FROM physical_assets WHERE id = ? FOR UPDATE",
        [assetId],
      );
      const asset = (
        assetRows as {
          id: string;
          name: string;
          category: AssetCategory;
          status: string;
          assigned_to: number | null;
        }[]
      )[0];
      if (!asset) throw new Error("Selected physical asset was not found.");
      if (asset.status !== "available")
        throw new Error("Selected physical asset is no longer available.");
      if (asset.category !== request.category)
        throw new Error("Selected physical asset does not match the requested category.");

      const [requestResult] = await connection.query(
        `
          UPDATE asset_requests
          SET status = 'assigned', asset_id = ?, asset_name = ?, assigned_on = CURDATE()
          WHERE id = ? AND status = 'approved'
        `,
        [asset.id, asset.name, request.id],
      );
      if ((requestResult as unknown as { affectedRows: number }).affectedRows !== 1) {
        throw new Error("Only approved asset requests can be assigned.");
      }
      const [assetResult] = await connection.query(
        `
          UPDATE physical_assets
          SET status = 'assigned', assigned_to = ?, assigned_on = CURDATE()
          WHERE id = ? AND status = 'available'
        `,
        [request.employee_id, asset.id],
      );
      if ((assetResult as unknown as { affectedRows: number }).affectedRows !== 1) {
        throw new Error("Selected physical asset is no longer available.");
      }

      await insertAssetComment(
        connection,
        request.id,
        support.id,
        supportComment ?? `Assigned ${asset.name} (${asset.id}).`,
      );
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

export const requestAssetReturn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [rows] = await connection.query(
        "SELECT id, employee_id, status FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (rows as { id: string; employee_id: number; status: AssetStatus }[])[0];
      if (!request || request.employee_id !== employee.id)
        throw new Error("Asset request not found.");
      if (request.status !== "assigned") throw new Error("Only assigned assets can be returned.");
      const [result] = await connection.query(
        "UPDATE asset_requests SET status = 'return_requested', return_requested_on = CURDATE() WHERE id = ? AND employee_id = ? AND status = 'assigned'",
        [request.id, employee.id],
      );
      if ((result as unknown as { affectedRows: number }).affectedRows !== 1)
        throw new Error("Only assigned assets can be returned.");
      await insertAssetComment(
        connection,
        request.id,
        employee.id,
        "Requested return of the asset.",
      );
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

export const cancelAssetRequest = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [rows] = await connection.query(
        "SELECT id, employee_id, status FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (rows as { id: string; employee_id: number; status: AssetStatus }[])[0];
      if (!request || request.employee_id !== employee.id)
        throw new Error("Asset request not found.");
      if (request.status !== "pending")
        throw new Error("Only pending asset requests can be cancelled.");
      const [result] = await connection.query(
        "UPDATE asset_requests SET status = 'cancelled' WHERE id = ? AND employee_id = ? AND status = 'pending'",
        [request.id, employee.id],
      );
      if ((result as unknown as { affectedRows: number }).affectedRows !== 1)
        throw new Error("Only pending asset requests can be cancelled.");
      await insertAssetComment(connection, request.id, employee.id, "Cancelled asset request.");
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

export const completeAssetReturn = createServerFn({ method: "POST" })
  .validator((input: { id: string; supportComment?: string }) => input)
  .handler(async ({ data }) => {
    const support = await getCurrentSupportEngineer();
    const supportComment = data.supportComment?.trim()
      ? validateAssetComment(data.supportComment, "Support comment")
      : null;
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [requestRows] = await connection.query(
        "SELECT id, employee_id, asset_id, asset_name, status FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (
        requestRows as {
          id: string;
          employee_id: number;
          asset_id: string | null;
          asset_name: string | null;
          status: AssetStatus;
        }[]
      )[0];
      if (!request || request.status !== "return_requested")
        throw new Error("This asset return is no longer awaiting verification.");
      if (!request.asset_id) throw new Error("This asset request has no assigned physical asset.");

      const [assetRows] = await connection.query(
        "SELECT id, name, status, assigned_to FROM physical_assets WHERE id = ? FOR UPDATE",
        [request.asset_id],
      );
      const asset = (
        assetRows as { id: string; name: string; status: string; assigned_to: number | null }[]
      )[0];
      if (!asset || asset.status !== "assigned" || asset.assigned_to !== request.employee_id) {
        throw new Error("The assigned physical asset relationship could not be verified.");
      }

      const [requestResult] = await connection.query(
        "UPDATE asset_requests SET status = 'returned', returned_on = CURDATE() WHERE id = ? AND status = 'return_requested'",
        [request.id],
      );
      if ((requestResult as unknown as { affectedRows: number }).affectedRows !== 1)
        throw new Error("This asset return is no longer awaiting verification.");
      const [assetResult] = await connection.query(
        "UPDATE physical_assets SET status = 'available', assigned_to = NULL, assigned_on = NULL WHERE id = ? AND status = 'assigned' AND assigned_to = ?",
        [asset.id, request.employee_id],
      );
      if ((assetResult as unknown as { affectedRows: number }).affectedRows !== 1)
        throw new Error("The assigned physical asset relationship could not be verified.");
      await insertAssetComment(
        connection,
        request.id,
        support.id,
        supportComment ?? `Return verified for ${asset.name} (${asset.id}).`,
      );
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

export const requestAssetAgain = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const connection = await db.getConnection();
    let transactionStarted = false;
    let lockAcquired = false;
    try {
      lockAcquired = await acquireAssetRequestIdLock(connection);
      if (!lockAcquired)
        throw new Error("Unable to create the new asset request. Please try again.");
      await connection.beginTransaction();
      transactionStarted = true;
      const [sourceRows] = await connection.query(
        "SELECT category, reason, status FROM asset_requests WHERE id = ? AND employee_id = ? FOR UPDATE",
        [data.id, employee.id],
      );
      const source = (
        sourceRows as { category: AssetCategory; reason: string; status: AssetStatus }[]
      )[0];
      if (!source) throw new Error("Asset request not found.");
      if (source.status !== "rejected" && source.status !== "cancelled") {
        throw new Error("Only rejected or cancelled asset requests can be submitted again.");
      }
      await assertNoActiveAssetAssignment(connection, employee.id, source.category);
      const id = await allocateAssetRequestId(connection);
      await connection.query(
        "INSERT INTO asset_requests (id, employee_id, category, reason, requested_on, status) VALUES (?, ?, ?, ?, CURDATE(), 'pending')",
        [id, employee.id, source.category, validateAssetReason(source.reason)],
      );
      await connection.commit();
      return { id };
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      if (lockAcquired) await connection.query("SELECT RELEASE_LOCK('flowdesk_asset_requests')");
      connection.release();
    }
  });

/** Adds an activity comment after resolving the employee or support author server-side. */
export const addAssetComment = createServerFn({ method: "POST" })
  .validator((input: { id: string; message: string }) => input)
  .handler(async ({ data }) => {
    const message = validateAssetComment(data.message);
    const currentUser = await requireAuthenticatedUser();
    const author =
      currentUser.role === "support"
        ? await getCurrentSupportEngineer()
        : currentUser.role === "employee"
          ? await getCurrentEmployee()
          : null;
    if (!author) throw new Error("You are not authorized to comment on asset requests.");
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [rows] = await connection.query(
        "SELECT id, employee_id FROM asset_requests WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const request = (rows as { id: string; employee_id: number }[])[0];
      if (!request || (author.role === "employee" && request.employee_id !== author.id)) {
        throw new Error("Asset request not found.");
      }
      await insertAssetComment(connection, request.id, author.id, message);
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

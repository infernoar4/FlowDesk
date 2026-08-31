import { createServerFn } from "@tanstack/react-start";

import { LEAVE_TYPES, type LeaveBalance, type LeaveRequest, type LeaveType } from "@/data/leaves";
import { db } from "./db";
import {
  getCurrentEmployee,
  getCurrentManager,
  requireAuthenticatedUser,
} from "./authorization.server";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string): Date {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error("Invalid leave dates.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid leave dates.");
  }

  return date;
}

async function validateLeaveInput(data: {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  if (!LEAVE_TYPES.includes(data.type)) {
    throw new Error("Invalid leave type.");
  }

  const startDate = parseDateOnly(data.startDate);
  const endDate = parseDateOnly(data.endDate);
  if (endDate < startDate) {
    throw new Error("End date must not precede start date.");
  }
  if (data.type === "Half Day" && data.startDate !== data.endDate) {
    throw new Error("Half Day leave must start and end on the same date.");
  }

  const reason = data.reason.trim();
  if (!reason) throw new Error("A leave reason is required.");

  const [todayRows] = await db.query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today");
  const today = (todayRows as { today?: string }[])[0]?.today;
  if (!today || data.startDate < today) {
    throw new Error("Start date cannot be in the past.");
  }

  const days =
    data.type === "Half Day"
      ? 0.5
      : Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

  return { days, reason };
}

export type DatabaseLeaveRequest = {
  id: string;
  employee: string;
  leave_type: LeaveRequest["type"];
  start_date: Date | string;
  end_date: Date | string;
  days: number | string;
  reason: string;
  applied_on: Date | string;
  status: LeaveRequest["status"];
  reviewed_by: string | null;
  reviewed_on: Date | string | null;
  manager_comment: string | null;
  rejection_reason: string | null;
};

export type DatabaseLeaveBalance = {
  leave_type: LeaveBalance["type"];
  remaining: number | string | null;
  total: number | string | null;
};

export type ManagerLeaveDashboard = {
  pendingCount: number;
  approvedTodayCount: number;
  rejectedTodayCount: number;
  onLeaveTodayCount: number;
  pendingRequests: DatabaseLeaveRequest[];
};

function formatDate(value: Date | string | null): string | undefined {
  if (!value) return undefined;

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);

  // MySQL DATE values are returned as local-midnight Date objects. Preserve
  // their local calendar components before formatting, rather than converting
  // that instant to UTC and shifting the displayed day.
  const calendarDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(calendarDate);
}

export function mapDatabaseLeaveRequest(leave: DatabaseLeaveRequest): LeaveRequest {
  return {
    id: leave.id,
    employee: leave.employee,
    type: leave.leave_type,
    startDate: formatDate(leave.start_date) ?? "",
    endDate: formatDate(leave.end_date) ?? "",
    days: Number(leave.days),
    reason: leave.reason,
    appliedOn: formatDate(leave.applied_on) ?? "",
    status: leave.status,
    reviewedBy: leave.reviewed_by ?? undefined,
    reviewedOn: formatDate(leave.reviewed_on),
    managerComment: leave.manager_comment ?? undefined,
    rejectionReason: leave.rejection_reason ?? undefined,
  };
}

export function mapDatabaseLeaveBalance(balance: DatabaseLeaveBalance): LeaveBalance {
  const remaining = balance.remaining === null ? "Unlimited" : Number(balance.remaining);
  const total = balance.total === null ? "Unlimited" : Number(balance.total);

  return { type: balance.leave_type, remaining, total };
}

export const getLeaveRequests = createServerFn({ method: "GET" }).handler(async () => {
  const currentUser = await requireAuthenticatedUser();
  const managerView = currentUser.role === "manager";
  const employee = currentUser.role === "employee" ? await getCurrentEmployee() : null;
  if (managerView) await getCurrentManager();
  if (!employee && !managerView) throw new Error("You are not authorized to view leave requests.");
  const [rows] = await db.query(
    `
      SELECT
        lr.id,
        employee.full_name AS employee,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.days,
        lr.reason,
        lr.applied_on,
        lr.status,
        reviewer.full_name AS reviewed_by,
        lr.reviewed_on,
        lr.manager_comment,
        lr.rejection_reason
      FROM leave_requests lr
      JOIN users employee ON employee.id = lr.employee_id
      LEFT JOIN users reviewer ON reviewer.id = lr.reviewed_by
      ${employee ? "WHERE lr.employee_id = ?" : ""}
      ORDER BY lr.applied_on DESC, lr.id DESC
    `,
    employee ? [employee.id] : [],
  );

  return rows as DatabaseLeaveRequest[];
});

export const getLeaveBalances = createServerFn({ method: "GET" }).handler(async () => {
  const employee = await getCurrentEmployee();
  const [rows] = await db.query(
    `
        SELECT lb.leave_type, lb.remaining, lb.total
        FROM leave_balances lb
        JOIN users employee ON employee.id = lb.employee_id
        WHERE employee.id = ?
        ORDER BY lb.id
      `,
    [employee.id],
  );

  return rows as DatabaseLeaveBalance[];
});

export const getEmployeePendingLeaveCount = createServerFn({ method: "GET" }).handler(async () => {
  const employee = await getCurrentEmployee();

  const [countRows] = await db.query(
    "SELECT COUNT(*) AS pending_count FROM leave_requests WHERE employee_id = ? AND status = 'pending'",
    [employee.id],
  );
  const count = (countRows as { pending_count: number | string }[])[0];

  return { pendingCount: Number(count?.pending_count ?? 0) };
});

export const getManagerLeaveDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await getCurrentManager();

  const [countRows, pendingRows] = await Promise.all([
    db.query(`
        SELECT
          COALESCE(SUM(status = 'pending'), 0) AS pending_count,
          COALESCE(SUM(status = 'approved' AND reviewed_on = CURDATE()), 0) AS approved_today_count,
          COALESCE(SUM(status = 'rejected' AND reviewed_on = CURDATE()), 0) AS rejected_today_count,
          COALESCE(SUM(status = 'approved' AND start_date <= CURDATE() AND end_date >= CURDATE()), 0) AS on_leave_today_count
        FROM leave_requests
      `),
    db.query(`
        SELECT
          lr.id,
          employee.full_name AS employee,
          lr.leave_type,
          lr.start_date,
          lr.end_date,
          lr.days,
          lr.reason,
          lr.applied_on,
          lr.status,
          reviewer.full_name AS reviewed_by,
          lr.reviewed_on,
          lr.manager_comment,
          lr.rejection_reason
        FROM leave_requests lr
        JOIN users employee ON employee.id = lr.employee_id
        LEFT JOIN users reviewer ON reviewer.id = lr.reviewed_by
        WHERE lr.status = 'pending'
        ORDER BY lr.applied_on DESC, lr.id DESC
      `),
  ]);

  const counts = (
    countRows[0] as {
      pending_count: number | string;
      approved_today_count: number | string;
      rejected_today_count: number | string;
      on_leave_today_count: number | string;
    }[]
  )[0];

  return {
    pendingCount: Number(counts?.pending_count ?? 0),
    approvedTodayCount: Number(counts?.approved_today_count ?? 0),
    rejectedTodayCount: Number(counts?.rejected_today_count ?? 0),
    onLeaveTodayCount: Number(counts?.on_leave_today_count ?? 0),
    pendingRequests: pendingRows[0] as DatabaseLeaveRequest[],
  } satisfies ManagerLeaveDashboard;
});

export const createLeaveRequest = createServerFn({ method: "POST" })
  .validator(
    (input: { type: LeaveType; startDate: string; endDate: string; reason: string }) => input,
  )
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const { days, reason } = await validateLeaveInput(data);
    const connection = await db.getConnection();
    let transactionStarted = false;
    let lockAcquired = false;

    try {
      const [lockRows] = await connection.query(
        "SELECT GET_LOCK('flowdesk_leave_requests', 10) AS acquired",
      );
      lockAcquired = (lockRows as { acquired: number }[])[0]?.acquired === 1;
      if (!lockAcquired) {
        throw new Error("Unable to submit the leave request. Please try again.");
      }

      await connection.beginTransaction();
      transactionStarted = true;

      const [overlaps] = await connection.query(
        `
          SELECT id
          FROM leave_requests
          WHERE employee_id = ?
            AND status NOT IN ('rejected', 'cancelled')
            AND start_date <= ?
            AND end_date >= ?
          LIMIT 1
        `,
        [employee.id, data.endDate, data.startDate],
      );
      if ((overlaps as { id: string }[]).length > 0) {
        throw new Error("This overlaps an existing leave request.");
      }

      const [idRows] = await connection.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(id, 4) AS UNSIGNED)), 0) + 1 AS next_id FROM leave_requests",
      );
      const nextId = (idRows as { next_id: number }[])[0]?.next_id ?? 1;
      const id = `LR-${String(nextId).padStart(4, "0")}`;

      await connection.query(
        `
          INSERT INTO leave_requests
            (id, employee_id, leave_type, start_date, end_date, days, reason, applied_on, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'pending')
        `,
        [id, employee.id, data.type, data.startDate, data.endDate, days, reason],
      );

      await connection.commit();
      return { id };
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      if (lockAcquired) {
        await connection.query("SELECT RELEASE_LOCK('flowdesk_leave_requests')");
      }
      connection.release();
    }
  });

export const updateLeaveRequest = createServerFn({ method: "POST" })
  .validator(
    (input: {
      leaveId: string;
      type: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const { days, reason } = await validateLeaveInput(data);
    const connection = await db.getConnection();
    let transactionStarted = false;
    let lockAcquired = false;

    try {
      const [lockRows] = await connection.query(
        "SELECT GET_LOCK('flowdesk_leave_requests', 10) AS acquired",
      );
      lockAcquired = (lockRows as { acquired: number }[])[0]?.acquired === 1;
      if (!lockAcquired) {
        throw new Error("Unable to update the leave request. Please try again.");
      }

      await connection.beginTransaction();
      transactionStarted = true;

      const [requests] = await connection.query(
        "SELECT employee_id FROM leave_requests WHERE id = ? AND status = 'pending' FOR UPDATE",
        [data.leaveId],
      );
      const request = (requests as { employee_id: number }[])[0];
      if (!request) {
        throw new Error("Only pending leave requests can be edited.");
      }
      if (request.employee_id !== employee.id) throw new Error("Leave request not found.");

      const [overlaps] = await connection.query(
        `
          SELECT id
          FROM leave_requests
          WHERE employee_id = ?
            AND id <> ?
            AND status NOT IN ('rejected', 'cancelled')
            AND start_date <= ?
            AND end_date >= ?
          LIMIT 1
        `,
        [request.employee_id, data.leaveId, data.endDate, data.startDate],
      );
      if ((overlaps as { id: string }[]).length > 0) {
        throw new Error("This overlaps an existing leave request.");
      }

      const [result] = await connection.query(
        `
          UPDATE leave_requests
          SET leave_type = ?, start_date = ?, end_date = ?, days = ?, reason = ?
          WHERE id = ? AND employee_id = ? AND status = 'pending'
        `,
        [data.type, data.startDate, data.endDate, days, reason, data.leaveId, employee.id],
      );

      if ((result as unknown as { affectedRows: number }).affectedRows !== 1) {
        throw new Error("Only pending leave requests can be edited.");
      }

      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      if (lockAcquired) {
        await connection.query("SELECT RELEASE_LOCK('flowdesk_leave_requests')");
      }
      connection.release();
    }
  });

export const cancelLeaveRequest = createServerFn({ method: "POST" })
  .validator((input: { leaveId: string }) => input)
  .handler(async ({ data }) => {
    const employee = await getCurrentEmployee();
    const [result] = await db.query(
      `
        UPDATE leave_requests
        SET status = 'cancelled'
        WHERE id = ?
          AND employee_id = ?
          AND (
            status = 'pending'
            OR (status = 'approved' AND start_date > CURDATE())
          )
      `,
      [data.leaveId, employee.id],
    );

    if ((result as unknown as { affectedRows: number }).affectedRows !== 1) {
      throw new Error("This leave request can no longer be cancelled.");
    }
  });

export const reviewLeaveRequest = createServerFn({ method: "POST" })
  .validator((input: { leaveId: string; action: "approve" | "reject"; comment: string }) => input)
  .handler(async ({ data }) => {
    const manager = await getCurrentManager();
    if (data.action !== "approve" && data.action !== "reject") {
      throw new Error("Invalid leave review action.");
    }

    const comment = data.comment.trim();
    if (data.action === "reject" && !comment) {
      throw new Error("A rejection reason is required.");
    }

    const [result] = await db.query(
      `
        UPDATE leave_requests
        SET
          status = ?,
          reviewed_by = ?,
          reviewed_on = CURDATE(),
          manager_comment = ?,
          rejection_reason = ?
        WHERE id = ? AND status = 'pending'
      `,
      [
        data.action === "approve" ? "approved" : "rejected",
        manager.id,
        data.action === "approve" ? comment || null : null,
        data.action === "reject" ? comment : null,
        data.leaveId,
      ],
    );

    if ((result as unknown as { affectedRows: number }).affectedRows !== 1) {
      throw new Error("This leave request is no longer awaiting review.");
    }
  });

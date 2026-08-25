import { createServerFn } from "@tanstack/react-start";

import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/data/tickets";

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
const SAFE_ATTACHMENT_URL_PATTERN = /^\/uploads\/tickets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpe?g|gif|webp|pdf|txt|docx?|xlsx?)$/i;

function assertSafeAttachmentUrl(value: string): string {
  if (!SAFE_ATTACHMENT_URL_PATTERN.test(value)) {
    throw new Error("Invalid ticket attachment reference.");
  }

  return value;
}

export type DatabaseTicket = {
  id: string;
  title: string;
  description: string;
  category: Ticket["category"];
  status: Ticket["status"];
  priority: Ticket["priority"];
  assignee: Ticket["assignee"] | null;
  reporter: string;
  attachment: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type DatabaseTicketComment = {
  author: string;
  role: Ticket["comments"][number]["role"];
  message: string;
  created_at: Date | string;
};

export type DatabaseTicketInternalNote = {
  author: Ticket["internalNotes"][number]["author"];
  message: string;
  created_at: Date | string;
};

export type DatabaseTicketDetail = DatabaseTicket & {
  comments: DatabaseTicketComment[];
  internalNotes: DatabaseTicketInternalNote[];
};

export type EmployeeTicketDashboard = {
  employeeName: string;
  openTicketCount: number;
  activeTicketCount: number;
  recentTickets: DatabaseTicket[];
};

export type SupportTicketDashboard = {
  openTicketCount: number;
  waitingForAssignmentCount: number;
  assignedToMeCount: number;
  highPriorityCount: number;
  resolvedTodayCount: number;
  waitingForAssignmentTickets: DatabaseTicket[];
  assignedTickets: DatabaseTicket[];
  recentlyUpdatedTickets: DatabaseTicket[];
};

export function mapDatabaseTicket(ticket: DatabaseTicket): Ticket {
  return {
    id: String(ticket.id),
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee ?? null,
    createdAt: String(ticket.created_at),
    updatedAt: String(ticket.updated_at),
    reporter: ticket.reporter,
    attachment: ticket.attachment ?? undefined,
    comments: [],
    internalNotes: [],
  };
}

export function mapDatabaseTicketDetail(ticket: DatabaseTicketDetail): Ticket {
  return {
    ...mapDatabaseTicket(ticket),
    comments: ticket.comments.map((comment) => ({
      author: comment.author,
      role: comment.role,
      message: comment.message,
      at: String(comment.created_at),
    })),
    internalNotes: ticket.internalNotes.map((note) => ({
      author: note.author,
      message: note.message,
      at: String(note.created_at),
    })),
  };
}

export const getTickets = createServerFn({ method: "GET" })
  .handler(async () => {
        const { db } = await import("./db");
    const {
      requireAuthenticatedUser,
      getCurrentEmployee,
      getCurrentSupportEngineer,
    } = await import("./authorization.server");
    const currentUser = await requireAuthenticatedUser();
    const employee = currentUser.role === "employee" ? await getCurrentEmployee() : null;
    if (currentUser.role === "support") await getCurrentSupportEngineer();
    if (!employee && currentUser.role !== "support") throw new Error("You are not authorized to view tickets.");
    const [rows] = await db.query(`
        SELECT
            t.id,
            t.title,
            t.description,
            t.category,
            t.status,
            t.priority,
            t.assignee_id,
            t.reporter_id,
            t.attachment,
            t.created_at,
            t.updated_at,
            reporter.full_name AS reporter,
            assignee.full_name AS assignee
        FROM tickets t
                 JOIN users reporter
                      ON t.reporter_id = reporter.id
                 LEFT JOIN users assignee
                           ON t.assignee_id = assignee.id
        ${employee ? "WHERE t.reporter_id = ?" : ""}
        ORDER BY t.created_at DESC
    `, employee ? [employee.id] : []);

    return rows as DatabaseTicket[];
  });

export const getEmployeeTicketDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
        const { db } = await import("./db");
    const { getCurrentEmployee } = await import("./authorization.server");
    const employee = await getCurrentEmployee();

    const [countRows, recentRows] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE(SUM(status = 'open'), 0) AS open_ticket_count,
            COALESCE(SUM(status <> 'closed'), 0) AS active_ticket_count
          FROM tickets
          WHERE reporter_id = ?
        `,
        [employee.id],
      ),
      db.query(
        `
          SELECT
            t.id,
            t.title,
            t.description,
            t.category,
            t.status,
            t.priority,
            t.attachment,
            t.created_at,
            t.updated_at,
            reporter.full_name AS reporter,
            assignee.full_name AS assignee
          FROM tickets t
          JOIN users reporter ON t.reporter_id = reporter.id
          LEFT JOIN users assignee ON t.assignee_id = assignee.id
          WHERE t.reporter_id = ?
          ORDER BY t.created_at DESC, t.id DESC
          LIMIT 4
        `,
        [employee.id],
      ),
    ]);

    const counts = (countRows[0] as {
      open_ticket_count: number | string;
      active_ticket_count: number | string;
    }[])[0];

    return {
      employeeName: employee.fullName,
      openTicketCount: Number(counts?.open_ticket_count ?? 0),
      activeTicketCount: Number(counts?.active_ticket_count ?? 0),
      recentTickets: recentRows[0] as DatabaseTicket[],
    } satisfies EmployeeTicketDashboard;
  },
);

export const getSupportTicketDashboard = createServerFn({ method: "GET" })
  .handler(async () => {
        const { db } = await import("./db");
    const { getCurrentSupportEngineer } = await import("./authorization.server");
    const engineer = await getCurrentSupportEngineer();

    const [countRows, waitingRows, assignedRows, recentRows] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE(SUM(status = 'open'), 0) AS open_ticket_count,
            COALESCE(SUM(status = 'open' AND assignee_id IS NULL), 0) AS waiting_for_assignment_count,
            COALESCE(SUM(assignee_id = ? AND status <> 'closed'), 0) AS assigned_to_me_count,
            COALESCE(SUM(priority IN ('High', 'Critical') AND status <> 'closed'), 0) AS high_priority_count,
            COALESCE(SUM(status = 'resolved' AND DATE(updated_at) = CURDATE()), 0) AS resolved_today_count
          FROM tickets
        `,
        [engineer.id],
      ),
      db.query(`
        SELECT
          t.id,
          t.title,
          t.description,
          t.category,
          t.status,
          t.priority,
          t.attachment,
          t.created_at,
          t.updated_at,
          reporter.full_name AS reporter,
          assignee.full_name AS assignee
        FROM tickets t
        JOIN users reporter ON t.reporter_id = reporter.id
        LEFT JOIN users assignee ON t.assignee_id = assignee.id
        WHERE t.status = 'open' AND t.assignee_id IS NULL
        ORDER BY t.created_at DESC, t.id DESC
      `),
      db.query(
        `
          SELECT
            t.id,
            t.title,
            t.description,
            t.category,
            t.status,
            t.priority,
            t.attachment,
            t.created_at,
            t.updated_at,
            reporter.full_name AS reporter,
            assignee.full_name AS assignee
          FROM tickets t
          JOIN users reporter ON t.reporter_id = reporter.id
          LEFT JOIN users assignee ON t.assignee_id = assignee.id
          WHERE t.assignee_id = ? AND t.status <> 'closed'
          ORDER BY t.updated_at DESC, t.id DESC
        `,
        [engineer.id],
      ),
      db.query(`
        SELECT
          t.id,
          t.title,
          t.description,
          t.category,
          t.status,
          t.priority,
          t.attachment,
          t.created_at,
          t.updated_at,
          reporter.full_name AS reporter,
          assignee.full_name AS assignee
        FROM tickets t
        JOIN users reporter ON t.reporter_id = reporter.id
        LEFT JOIN users assignee ON t.assignee_id = assignee.id
        ORDER BY t.updated_at DESC, t.id DESC
        LIMIT 4
      `),
    ]);

    const counts = (countRows[0] as {
      open_ticket_count: number | string;
      waiting_for_assignment_count: number | string;
      assigned_to_me_count: number | string;
      high_priority_count: number | string;
      resolved_today_count: number | string;
    }[])[0];

    return {
      openTicketCount: Number(counts?.open_ticket_count ?? 0),
      waitingForAssignmentCount: Number(counts?.waiting_for_assignment_count ?? 0),
      assignedToMeCount: Number(counts?.assigned_to_me_count ?? 0),
      highPriorityCount: Number(counts?.high_priority_count ?? 0),
      resolvedTodayCount: Number(counts?.resolved_today_count ?? 0),
      waitingForAssignmentTickets: waitingRows[0] as DatabaseTicket[],
      assignedTickets: assignedRows[0] as DatabaseTicket[],
      recentlyUpdatedTickets: recentRows[0] as DatabaseTicket[],
    } satisfies SupportTicketDashboard;
  });

export const getTicketById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
        const { db } = await import("./db");
    const {
      requireAuthenticatedUser,
      getCurrentEmployee,
    } = await import("./authorization.server");

    const currentUser = await requireAuthenticatedUser();
    const employee = currentUser.role === "employee" ? await getCurrentEmployee() : null;
    const isSupport = currentUser.role === "support";
    if (!employee && !isSupport) throw new Error("You are not authorized to view tickets.");
    const [ticketRows] = await db.query(
      `
        SELECT
          t.id,
          t.title,
          t.description,
          t.category,
          t.status,
          t.priority,
          t.attachment,
          t.created_at,
          t.updated_at,
          reporter.full_name AS reporter,
          assignee.full_name AS assignee
        FROM tickets t
        JOIN users reporter ON t.reporter_id = reporter.id
        LEFT JOIN users assignee ON t.assignee_id = assignee.id
        WHERE t.id = ?${employee ? " AND t.reporter_id = ?" : ""}
        LIMIT 1
      `,
      employee ? [data.id, employee.id] : [data.id],
    );
    const ticket = (ticketRows as DatabaseTicket[])[0];

    if (!ticket) return null;

    const [commentRows] = await db.query(
      `
        SELECT
          author.full_name AS author,
          tc.role,
          tc.message,
          tc.created_at
        FROM ticket_comments tc
        JOIN users author ON tc.author_id = author.id
        WHERE tc.ticket_id = ?
        ORDER BY tc.created_at, tc.id
      `,
      [data.id],
    );

    const [noteRows] = isSupport ? await db.query(
      `
        SELECT
          author.full_name AS author,
          tin.message,
          tin.created_at
        FROM ticket_internal_notes tin
        JOIN users author ON tin.author_id = author.id
        WHERE tin.ticket_id = ?
        ORDER BY tin.created_at, tin.id
      `,
      [data.id],
    ) : [[]];

    return {
      ...ticket,
      comments: commentRows as DatabaseTicketComment[],
      internalNotes: noteRows as DatabaseTicketInternalNote[],
    } satisfies DatabaseTicketDetail;
  });

export const addTicketComment = createServerFn({ method: "POST" })
  .validator(
    (input: {
      ticketId: string;
      message: string;
    }) => input,
  )
  .handler(async ({ data }) => {
        const { db } = await import("./db");
    const {
      requireAuthenticatedUser,
      getCurrentSupportEngineer,
      getCurrentEmployee,
    } = await import("./authorization.server");
    const message = data.message.trim();
    if (!message) throw new Error("A comment message is required.");

    const [tickets] = await db.query(
      "SELECT id FROM tickets WHERE id = ? LIMIT 1",
      [data.ticketId],
    );
    if ((tickets as { id: string }[]).length === 0) {
      throw new Error("Ticket not found.");
    }

    const currentUser = await requireAuthenticatedUser();
    const author = currentUser.role === "support"
      ? await getCurrentSupportEngineer()
      : currentUser.role === "employee"
        ? await getCurrentEmployee()
        : null;
    if (!author) throw new Error("You are not authorized to comment on tickets.");
    const role = author.role === "support" ? "Support" : "Employee";

    if (author.role === "employee") {
      const [ownedTickets] = await db.query(
        "SELECT id FROM tickets WHERE id = ? AND reporter_id = ? LIMIT 1",
        [data.ticketId, author.id],
      );
      if ((ownedTickets as { id: string }[]).length === 0) {
        throw new Error("Ticket not found.");
      }
    }

    const [result] = await db.query(
      `
        INSERT INTO ticket_comments (ticket_id, author_id, role, message, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `,
      [data.ticketId, author.id, role, message],
    );

    return { id: (result as { insertId: number }).insertId };
  });

export const addTicketInternalNote = createServerFn({ method: "POST" })
  .validator(
    (input: {
      ticketId: string;
      message: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db } = await import("./db");
    const { getCurrentSupportEngineer } = await import("./authorization.server");

    const message = data.message.trim();
    if (!message) throw new Error("An internal note is required.");

    const [tickets] = await db.query(
      "SELECT id FROM tickets WHERE id = ? LIMIT 1",
      [data.ticketId],
    );

    if ((tickets as { id: string }[]).length === 0) {
      throw new Error("Ticket not found.");
    }

    const author = await getCurrentSupportEngineer();

    const [result] = await db.query(
      `
        INSERT INTO ticket_internal_notes (ticket_id, author_id, message, created_at)
        VALUES (?, ?, ?, NOW())
      `,
      [data.ticketId, author.id, message],
    );

    return { id: (result as { insertId: number }).insertId };
  });

export const uploadTicketAttachment = createServerFn({ method: "POST" })
  .validator((input: FormData) => input)
  .handler(async ({ data }) => {
    const { getCurrentEmployee } = await import("./authorization.server");

    // Only authenticated employees can upload ticket attachments.
    await getCurrentEmployee();

    if (process.env.NODE_ENV === "production") {
      throw new Error("Local ticket attachments are unavailable in production.");
    }

    const entry = data.get("file");

    if (
      !entry ||
      typeof entry === "string" ||
      typeof entry.arrayBuffer !== "function"
    ) {
      throw new Error("Select a file to upload.");
    }

    const file = entry as File;

    if (file.size === 0) {
      throw new Error("The selected file is empty.");
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      throw new Error("Attachments must be 5 MB or smaller.");
    }

    const fileName = file.name ?? "";
    const extension = fileName
      .slice(fileName.lastIndexOf("."))
      .toLowerCase();

    const expectedMimeType = ALLOWED_ATTACHMENT_TYPES[extension];

    if (!expectedMimeType || file.type !== expectedMimeType) {
      throw new Error("This attachment type is not allowed.");
    }

    const [{ mkdir, writeFile }, path, { randomUUID }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
      import("node:crypto"),
    ]);

    const uploadDirectory = path.resolve(
      process.cwd(),
      "public",
      "uploads",
      "tickets",
    );

    const safeFileName = `${randomUUID()}${extension}`;
    const destination = path.resolve(
      uploadDirectory,
      safeFileName,
    );

    if (!destination.startsWith(`${uploadDirectory}${path.sep}`)) {
      throw new Error("Invalid attachment path.");
    }

    await mkdir(uploadDirectory, { recursive: true });

    await writeFile(
      destination,
      new Uint8Array(await file.arrayBuffer()),
      {
        flag: "wx",
      },
    );

    return {
      url: `/uploads/tickets/${safeFileName}`,
    };
  });

export const deleteTicketAttachment = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => input)
  .handler(async ({ data }) => {
    const { db } = await import("./db");
    const { getCurrentEmployee } = await import("./authorization.server");

    await getCurrentEmployee();

    if (process.env.NODE_ENV === "production") {
      return { deleted: false };
    }

    const url = assertSafeAttachmentUrl(data.url);

    const [referencingTickets] = await db.query(
      "SELECT id FROM tickets WHERE attachment = ? LIMIT 1",
      [url],
    );

    if ((referencingTickets as { id: string }[]).length > 0) {
      throw new Error("Cannot delete an attachment that is in use.");
    }

    const [{ unlink }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);

    const uploadDirectory = path.resolve(
      process.cwd(),
      "public",
      "uploads",
      "tickets",
    );

    const destination = path.resolve(
      uploadDirectory,
      path.basename(url),
    );

    if (!destination.startsWith(`${uploadDirectory}${path.sep}`)) {
      throw new Error("Invalid attachment path.");
    }

    try {
      await unlink(destination);
      return { deleted: true };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { deleted: false };
      }

      throw error;
    }
  });

export const createTicket = createServerFn({ method: "POST" })
  .validator(
    (input: {
      title: string;
      description: string;
      category: TicketCategory;
      priority?: TicketPriority;
      attachment?: string | null;
    }) => input,
  )
  
  .handler(async ({ data }) => {
    const { db } = await import("./db");
const { getCurrentEmployee } =
  await import("./authorization.server");
    const title = data.title.trim();
    const description = data.description.trim();
    const priority = data.priority ?? "Medium";
    const attachment = data.attachment?.trim() || null;

    if (!title) throw new Error("A ticket title is required.");
    if (!description) throw new Error("A ticket description is required.");
    if (!TICKET_CATEGORIES.includes(data.category)) {
      throw new Error("Invalid ticket category.");
    }
    if (!TICKET_PRIORITIES.includes(priority)) {
      throw new Error("Invalid ticket priority.");
    }
    if (attachment) assertSafeAttachmentUrl(attachment);

    const reporter = await getCurrentEmployee();

    const connection = await db.getConnection();
    let transactionStarted = false;
    let lockAcquired = false;

    try {
      const [lockRows] = await connection.query(
        "SELECT GET_LOCK('flowdesk_ticket_id', 10) AS acquired",
      );
      lockAcquired = (lockRows as { acquired: number }[])[0]?.acquired === 1;
      if (!lockAcquired) throw new Error("Unable to allocate a ticket ID. Please try again.");

      await connection.beginTransaction();
      transactionStarted = true;

      const [idRows] = await connection.query(
        "SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 0) + 1 AS next_id FROM tickets",
      );
      const nextId = (idRows as { next_id: number }[])[0]?.next_id ?? 1;
      const id = `TKT-${String(nextId).padStart(4, "0")}`;

      await connection.query(
        `
          INSERT INTO tickets
            (id, title, description, category, status, priority, assignee_id, reporter_id, attachment, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'open', ?, NULL, ?, ?, NOW(), NOW())
        `,
        [id, title, description, data.category, priority, reporter.id, attachment],
      );

      await connection.commit();
      return { id };
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      if (lockAcquired) {
        await connection.query("SELECT RELEASE_LOCK('flowdesk_ticket_id')");
      }
      connection.release();
    }
  });

export const updateTicket = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      status: TicketStatus;
      priority: TicketPriority;
      assigneeName: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { db } = await import("./db");
const { getCurrentSupportEngineer } =
  await import("./authorization.server");
    await getCurrentSupportEngineer();
    if (!TICKET_STATUSES.includes(data.status)) {
      throw new Error("Invalid ticket status.");
    }
    if (!TICKET_PRIORITIES.includes(data.priority)) {
      throw new Error("Invalid ticket priority.");
    }

    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const [ticketRows] = await connection.query(
        "SELECT status, assignee_id FROM tickets WHERE id = ? FOR UPDATE",
        [data.id],
      );
      const ticket = (ticketRows as {
        status: TicketStatus;
        assignee_id: number | null;
      }[])[0];

      if (!ticket) throw new Error("Ticket not found.");
      if (ticket.status === "closed") {
        throw new Error("Closed tickets cannot be modified by support.");
      }

      let assigneeId: number | null = null;

      if (data.assigneeName) {
        const [users] = await connection.query(
          "SELECT id FROM users WHERE full_name = ? AND role = 'support' LIMIT 1",
          [data.assigneeName],
        );
        const assignee = (users as { id: number }[])[0];

        if (!assignee) {
          throw new Error("Assign the ticket to a valid support engineer.");
        }

        assigneeId = assignee.id;
      }

      const isStatusChange = data.status !== ticket.status;
      const allowedNextStatus: Partial<Record<TicketStatus, TicketStatus>> = {
        open: "assigned",
        assigned: "in_progress",
        in_progress: "resolved",
      };

      if (isStatusChange) {
        if (data.status === "closed") {
          throw new Error("Only employee verification can close a resolved ticket.");
        }

        if (allowedNextStatus[ticket.status] !== data.status) {
          throw new Error(
            `Invalid status transition from ${ticket.status} to ${data.status}.`,
          );
        }
      }

      if (
        (data.status === "assigned" ||
          data.status === "in_progress" ||
          data.status === "resolved") &&
        !assigneeId
      ) {
        throw new Error("Assigned, in-progress, and resolved tickets require a support engineer.");
      }

      await connection.query(
        `
            UPDATE tickets
            SET
                status = ?,
                priority = ?,
                assignee_id = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
        [data.status, data.priority, assigneeId, data.id],
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

/**
 * Employee verifies that the issue has been resolved.
 * A ticket can only be closed if it is currently resolved.
 */
export const closeTicket = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { db } = await import("./db");
  const { getCurrentEmployee } =
    await import("./authorization.server");
    const employee = await getCurrentEmployee();
    const [result] = await db.query(
      `
        UPDATE tickets
        SET
          status = 'closed',
          updated_at = NOW()
        WHERE id = ?
          AND status = 'resolved'
          AND reporter_id = ?
      `,
      [data.id, employee.id],
    );

    const affectedRows = (result as { affectedRows?: number }).affectedRows ?? 0;

    if (affectedRows === 0) {
      throw new Error(
        "Ticket cannot be closed. It must be in Resolved status first.",
      );
    }

    return { success: true };
  });

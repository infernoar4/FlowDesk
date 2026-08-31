import { deleteCookie, getCookie, setCookie } from "@tanstack/start-server-core";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import { db } from "./db";

const SESSION_COOKIE_NAME = "flowdesk_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_COST = 12;

export type AuthenticatedRole = "employee" | "support" | "manager";

export type AuthenticatedUser = {
  id: number;
  employeeId: string;
  fullName: string;
  companyEmail: string;
  username: string;
  role: AuthenticatedRole;
  accountStatus: "active";
  department: string | null;
  designation: string | null;
  phone: string | null;
  location: string | null;
  photoUrl: string | null;
  lastLogin: Date | string | null;
  inAppNotifications: boolean;
  emailNotifications: boolean;
};

type UserRow = Omit<AuthenticatedUser, "inAppNotifications" | "emailNotifications"> & {
  account_status: "active" | "inactive";
  in_app_notifications: number;
  email_notifications: number;
};

let schemaPromise: Promise<void> | undefined;

export function ensureAuthenticationSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.query(`CREATE TABLE IF NOT EXISTS user_credentials (
        user_id INT NOT NULL, password_hash VARCHAR(255) NOT NULL,
        password_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id), CONSTRAINT user_credentials_user_id_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
      await db.query(`CREATE TABLE IF NOT EXISTS user_sessions (
        id BIGINT NOT NULL AUTO_INCREMENT, token_hash CHAR(64) NOT NULL,
        user_id INT NOT NULL, expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY user_sessions_token_hash_unique (token_hash),
        KEY user_sessions_user_id_idx (user_id), KEY user_sessions_expires_at_idx (expires_at),
        CONSTRAINT user_sessions_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

function toAuthenticatedUser(row: UserRow): AuthenticatedUser {
  return {
    id: row.id,
    employeeId: row.employeeId,
    fullName: row.fullName,
    companyEmail: row.companyEmail,
    username: row.username,
    role: row.role,
    accountStatus: "active",
    department: row.department,
    designation: row.designation,
    phone: row.phone,
    location: row.location,
    photoUrl: row.photoUrl,
    lastLogin: row.lastLogin,
    inAppNotifications: Boolean(row.in_app_notifications),
    emailNotifications: Boolean(row.email_notifications),
  };
}

const SAFE_USER_SELECT = `
  SELECT u.id, u.employee_id AS employeeId, u.full_name AS fullName,
    u.company_email AS companyEmail, u.username, u.role, u.account_status,
    u.department, u.designation, u.phone, u.location, u.photo_url AS photoUrl,
    u.last_login AS lastLogin, u.in_app_notifications, u.email_notifications
  FROM users u`;

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  await ensureAuthenticationSchema();
  const token = getCookie(SESSION_COOKIE_NAME);
  if (!token) return null;
  const [rows] = await db.query(
    `${SAFE_USER_SELECT} JOIN user_sessions s ON s.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.account_status = 'active' LIMIT 1`,
    [hashSessionToken(token)],
  );
  const row = (rows as UserRow[])[0];
  if (!row) {
    await db.query("DELETE FROM user_sessions WHERE token_hash = ?", [hashSessionToken(token)]);
    deleteCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
    return null;
  }
  return toAuthenticatedUser(row);
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Authentication is required.");
  return user;
}

export async function requireRole(role: AuthenticatedRole): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== role) throw new Error("You are not authorized for this action.");
  return user;
}

export const requireEmployee = () => requireRole("employee");
export const requireSupportEngineer = () => requireRole("support");
export const requireManager = () => requireRole("manager");

export async function loginWithCredentials(data: {
  identifier: string;
  password: string;
}): Promise<AuthenticatedUser> {
  const identifier = data.identifier.trim().toLowerCase();
  if (!identifier || !data.password || data.password.length > 1024) {
    throw new Error("Invalid email, username, or password.");
  }
  try {
    await ensureAuthenticationSchema();
    const [rows] = await db.query(
      `${SAFE_USER_SELECT.replace("FROM users u", ", c.password_hash FROM users u")}
        JOIN user_credentials c ON c.user_id = u.id
        WHERE (LOWER(u.company_email) = ? OR LOWER(u.username) = ?) LIMIT 1`,
      [identifier, identifier],
    );
    const row = (rows as (UserRow & { password_hash: string })[])[0];
    if (
      !row ||
      row.account_status !== "active" ||
      !(await bcrypt.compare(data.password, row.password_hash))
    ) {
      throw new Error("Invalid email, username, or password.");
    }
    const token = randomBytes(32).toString("base64url");
    const connection = await db.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      await connection.query(
        "INSERT INTO user_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND), NOW())",
        [hashSessionToken(token), row.id, SESSION_MAX_AGE_SECONDS],
      );
      await connection.query("UPDATE users SET last_login = NOW() WHERE id = ?", [row.id]);
      await connection.commit();
    } catch (error) {
      if (transactionStarted) await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    setCookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return toAuthenticatedUser({ ...row, lastLogin: new Date() });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid email, username, or password.")
      throw error;
    throw new Error("Unable to sign in. Please try again.");
  }
}

export async function logoutCurrentUser() {
  await ensureAuthenticationSchema();
  const token = getCookie(SESSION_COOKIE_NAME);
  if (token)
    await db.query("DELETE FROM user_sessions WHERE token_hash = ?", [hashSessionToken(token)]);
  deleteCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
  return { success: true };
}

/** Used only by the explicit development setup command, never by a route. */
export async function setInitialPassword(identifier: string, password: string): Promise<void> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier || password.length < 12 || password.length > 1024) {
    throw new Error("Use a valid account identifier and a password of at least 12 characters.");
  }
  await ensureAuthenticationSchema();
  const [rows] = await db.query(
    "SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(company_email) = ? LIMIT 1",
    [normalizedIdentifier, normalizedIdentifier],
  );
  const user = (rows as { id: number }[])[0];
  if (!user) throw new Error("No matching FlowDesk user exists.");
  const hash = await bcrypt.hash(password, PASSWORD_COST);
  await db.query(
    `INSERT INTO user_credentials (user_id, password_hash, password_updated_at) VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), password_updated_at = NOW()`,
    [user.id, hash],
  );
}

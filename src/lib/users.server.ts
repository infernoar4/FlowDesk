import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";

export type DatabaseUser = {
  id: number;
  employee_id: string;
  full_name: string;
  company_email: string;
  username: string;
  password: string;
  role: "employee" | "support" | "manager";
  department: string | null;
  designation: string | null;
  phone: string | null;
  location: string | null;
  initials: string | null;
  account_status: "active" | "inactive";
  created_at: string;
};

export const getUserByEmail = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const [rows] = await db.query(
      "SELECT * FROM users WHERE company_email = ? OR username = ? LIMIT 1",
      [cleanEmail, cleanEmail],
    );

    const user = (rows as DatabaseUser[])[0];
    return user || null;
  });

export const getAllUsers = createServerFn({ method: "GET" }).handler(async () => {
  const [rows] = await db.query(
    "SELECT id, employee_id, full_name, company_email, username, role, department, designation, phone, location, initials, account_status, created_at FROM users ORDER BY id ASC",
  );
  return (rows as DatabaseUser[]) || [];
});

export const createDatabaseUser = createServerFn({ method: "POST" })
  .validator(
    (input: {
      fullName: string;
      companyEmail: string;
      username: string;
      password: string;
      role: "employee" | "support" | "manager";
      department?: string;
      designation?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const cleanEmail = data.companyEmail.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase();

    // Check if user already exists in MySQL
    const [existing] = await db.query(
      "SELECT id FROM users WHERE company_email = ? OR username = ? LIMIT 1",
      [cleanEmail, cleanUsername],
    );

    if ((existing as { id: number }[]).length > 0) {
      throw new Error("An account with this email or username already exists.");
    }

    const empId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const initials = data.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const department = data.department || "Engineering";
    const designation = data.designation || "Software Engineer";
    const location = "Main HQ";
    const phone = "+1 555-0199";

    const [result] = await db.query(
      `
        INSERT INTO users 
          (employee_id, full_name, company_email, username, password, role, department, designation, phone, location, initials, account_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
      [
        empId,
        data.fullName,
        cleanEmail,
        cleanUsername,
        data.password,
        data.role,
        department,
        designation,
        phone,
        location,
        initials,
      ],
    );

    const insertId = (result as unknown as { insertId: number }).insertId;

    return {
      id: insertId,
      employeeId: empId,
      fullName: data.fullName,
      companyEmail: cleanEmail,
      username: cleanUsername,
      role: data.role,
      department,
      designation,
      phone,
      location,
      initials,
    };
  });

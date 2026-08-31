import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "flowdesk";

async function verifyUsers() {
  console.log(`Connecting to MySQL database '${dbName}' at ${dbHost}:${dbPort}...`);

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    const [rows] = await connection.query(
      "SELECT id, employee_id, full_name, company_email, role, department, designation, account_status, created_at FROM users ORDER BY id ASC",
    );

    console.log(
      "\n==========================================================================================",
    );
    console.log(
      `📊 LIVE MYSQL DATABASE USER RECORDS (${rows.length} Users Found in MySQL Table 'users'):`,
    );
    console.log(
      "==========================================================================================",
    );
    console.table(rows);

    await connection.end();
  } catch (err) {
    console.error("❌ Error fetching MySQL users:", err.message);
  }
}

verifyUsers();

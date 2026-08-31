import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "flowdesk",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn("[FlowDesk DB] Could not initialize MySQL pool:", err);
}

export const db = {
  async query(sql: string, values?: unknown[]): Promise<[unknown[], unknown]> {
    if (pool) {
      try {
        const [rows, fields] = await pool.query(sql, values);
        return [rows as unknown[], fields];
      } catch (err) {
        console.error("[FlowDesk MySQL Query Error]:", (err as Error).message);
        throw err;
      }
    }
    console.warn("[FlowDesk DB] MySQL query invoked in offline/standalone mode.");
    return [[], null];
  },

  async getConnection() {
    if (pool) {
      return await pool.getConnection();
    }
    return {
      async query(_sql: string, _values?: unknown[]) {
        return [[], null];
      },
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      release() {},
    };
  },
};

import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.SPRING_DATASOURCE_URL || "";
const isPostgres =
  connectionString.startsWith("postgres://") ||
  connectionString.startsWith("postgresql://") ||
  connectionString.includes("neon.tech");

let mysqlPool: mysql.Pool | null = null;
let pgPool: pg.Pool | null = null;

if (isPostgres) {
  try {
    const cleanUrl = connectionString.replace(/^jdbc:postgresql:\/\//, "postgresql://");
    const sslMode = cleanUrl.includes("sslmode=require");
    pgPool = new pg.Pool({
      connectionString: cleanUrl,
      ssl: sslMode ? { rejectUnauthorized: false } : false,
    });
  } catch (err) {
    console.warn("[FlowDesk DB] Could not initialize PostgreSQL pool:", err);
  }
} else {
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

  try {
    mysqlPool = mysql.createPool(dbConfig);
  } catch (err) {
    console.warn("[FlowDesk DB] Could not initialize MySQL pool:", err);
  }
}

export const db = {
  async query(sql: string, values?: unknown[]): Promise<[unknown[], unknown]> {
    if (pgPool) {
      try {
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        const res = await pgPool.query(pgSql, values as unknown[]);
        return [res.rows, null];
      } catch (err) {
        console.error("[FlowDesk PG Query Error]:", (err as Error).message);
        throw err;
      }
    }
    if (mysqlPool) {
      try {
        const [rows, fields] = await mysqlPool.query(sql, values);
        return [rows as unknown[], fields];
      } catch (err) {
        console.error("[FlowDesk MySQL Query Error]:", (err as Error).message);
        throw err;
      }
    }
    console.warn("[FlowDesk DB] Query invoked in standalone mode.");
    return [[], null];
  },

  async getConnection() {
    if (pgPool) {
      const client = await pgPool.connect();
      return {
        async query(sql: string, values?: unknown[]) {
          let paramIndex = 1;
          const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
          const res = await client.query(pgSql, values as unknown[]);
          return [res.rows, null];
        },
        async beginTransaction() {
          await client.query("BEGIN");
        },
        async commit() {
          await client.query("COMMIT");
        },
        async rollback() {
          await client.query("ROLLBACK");
        },
        release() {
          client.release();
        },
      };
    }
    if (mysqlPool) {
      return await mysqlPool.getConnection();
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


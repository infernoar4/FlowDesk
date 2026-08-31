import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "flowdesk";

const targetTable = process.argv[2]?.toLowerCase() || "all";

async function viewDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    });

    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map((row) => Object.values(row)[0]);

    if (targetTable === "all" || targetTable === "tables") {
      console.log("\n=================================================================");
      console.log(`🗄️ FLOWDESK MYSQL TABLES LIST (${tableNames.length} Tables Found):`);
      console.log("=================================================================");
      console.table(tableNames.map((t) => ({ TableName: t })));
      console.log("\n💡 Tip: To view contents of a specific table, run:");
      console.log("   node scripts/db_viewer.js users");
      console.log("   node scripts/db_viewer.js tickets");
      console.log("   node scripts/db_viewer.js leave_requests");
      console.log("   node scripts/db_viewer.js asset_requests");
      console.log("   node scripts/db_viewer.js room_bookings\n");
    } else {
      const match = tableNames.find(
        (t) => t.toLowerCase() === targetTable || t.toLowerCase().includes(targetTable),
      );
      if (!match) {
        console.error(
          `❌ Table '${targetTable}' not found in database '${dbName}'. Available tables: ${tableNames.join(", ")}`,
        );
        await connection.end();
        return;
      }

      const [rows] = await connection.query(`SELECT * FROM ${match} LIMIT 50`);
      console.log("\n=================================================================");
      console.log(`📊 MYSQL TABLE CONTENTS: '${match}' (${rows.length} rows found)`);
      console.log("=================================================================");
      if (rows.length === 0) {
        console.log("(Table is currently empty)");
      } else {
        console.table(rows);
      }
    }

    await connection.end();
  } catch (err) {
    console.error("❌ Database Viewer Error:", err.message);
  }
}

viewDatabase();

import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";

async function setupDatabase() {
  console.log(`Connecting to MySQL server at ${dbHost}:${dbPort} as user '${dbUser}'...`);

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true,
    });

    console.log("Successfully connected to MySQL server!");

    const schemaPath = path.resolve(process.cwd(), "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Executing schema.sql to create database and seed tables...");
    await connection.query(sql);

    console.log("✅ MySQL Database 'flowdesk' setup and initial users seeded successfully!");
    await connection.end();
  } catch (err) {
    console.error("❌ Error setting up MySQL database:", err.message);
    console.log(
      "\nPlease ensure MySQL is running on your machine and check your database credentials in .env",
    );
  }
}

setupDatabase();

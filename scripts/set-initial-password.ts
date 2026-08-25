import { existsSync, readFileSync } from "node:fs";

// Vite loads .env for the web runtime; this explicit setup command runs in
// Node, so it loads only the existing DB_* values without printing them.
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

const [identifier] = process.argv.slice(2);
const password = process.env.FLOWDESK_INITIAL_PASSWORD;

if (!identifier || !password) {
  console.error("Usage: FLOWDESK_INITIAL_PASSWORD=<at-least-12-character-secret> npm run auth:set-password -- <username-or-email>");
  process.exitCode = 1;
} else {
  const [{ setInitialPassword }, { db }] = await Promise.all([
    import("../src/lib/auth-session.server"),
    import("../src/lib/db"),
  ]);
  try {
    await setInitialPassword(identifier, password);
    console.log("Password initialized successfully.");
  } finally {
    await db.end();
  }
}

// Applies the SQL migrations in ./drizzle to DATABASE_URL_UNPOOLED (or DATABASE_URL).
//
//   npm run db:migrate

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connect } from "./lib/db";

async function main() {
  const { db, close } = connect();
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

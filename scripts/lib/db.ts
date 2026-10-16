import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../src/db/schema";

// Database connection for the command-line scripts (they can't use src/db,
// which is server-only). Prefers Neon's direct connection for long jobs.

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export function connect() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
    process.exit(1);
  }
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}

export { schema };

import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl, isProduction } from "@/lib/env";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// One client per server instance (and across dev hot reloads). Created lazily
// so nothing connects unless DATABASE_URL is set and a query actually runs.
const globalForDb = globalThis as unknown as { __gwDb?: Database };

function createDb(): Database {
  const client = postgres(databaseUrl(), {
    // Neon's pooler (PgBouncer, transaction mode) does not support prepared statements.
    prepare: false,
    max: isProduction ? 5 : 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

export function getDb(): Database {
  if (!globalForDb.__gwDb) globalForDb.__gwDb = createDb();
  return globalForDb.__gwDb;
}

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbOrTx = Database | Transaction;

export { schema };

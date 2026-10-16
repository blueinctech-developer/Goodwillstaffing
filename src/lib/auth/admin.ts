import "server-only";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getDb } from "@/db";
import { admins, type AdminRole } from "@/db/schema";
import { hasDatabase } from "@/lib/env";
import { readSession } from "./session";

// The data access layer for admin identity. Every admin page calls
// requireAdminPage() and every admin Server Action calls requireAdmin(), so
// authorization never depends on the proxy's optimistic cookie check.

export type CurrentAdmin = { id: string; email: string; name: string; role: AdminRole; sessionId: string };

export class AuthError extends Error {
  constructor(public readonly code: "unauthenticated" | "forbidden") {
    super(
      code === "unauthenticated"
        ? "Your session has expired. Please sign in again."
        : "You don't have permission to do that.",
    );
    this.name = "AuthError";
  }
}

/** The signed-in, active admin for this request (memoised per request). */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  if (!hasDatabase()) return null;
  const session = await readSession();
  if (!session) return null;
  const [admin] = await getDb()
    .select({ id: admins.id, email: admins.email, name: admins.name, role: admins.role })
    .from(admins)
    .where(and(eq(admins.id, session.adminId), eq(admins.isActive, true)))
    .limit(1);
  return admin ? { ...admin, sessionId: session.sessionId } : null;
});

/** For pages: redirect to sign-in without a session, to the dashboard without the role. */
export async function requireAdminPage(role?: "owner"): Promise<CurrentAdmin> {
  // Always decide at request time, even when DATABASE_URL was unset at build.
  await connection();
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login/");
  if (role === "owner" && admin.role !== "owner") redirect("/admin/?denied=1");
  return admin;
}

/** For Server Actions and route handlers: throws AuthError instead of redirecting. */
export async function requireAdmin(role?: "owner"): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthError("unauthenticated");
  if (role === "owner" && admin.role !== "owner") throw new AuthError("forbidden");
  return admin;
}

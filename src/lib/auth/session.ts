import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { adminSessions } from "@/db/schema";
import { isProduction } from "@/lib/env";
import { generateToken, sha256 } from "@/lib/security/crypto";
import type { RequestContext } from "@/lib/security/request";

/**
 * Database-backed admin sessions. The browser holds a random 256-bit token in
 * an HTTP-only cookie scoped to /admin; only its SHA-256 hash is stored.
 * Sessions have an absolute lifetime and a sliding idle timeout.
 */

export const SESSION_COOKIE = "gw_admin_session";
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const IDLE_MS = 2 * 60 * 60 * 1000;
/** Only extend the idle window if it was last extended more than this long ago. */
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type ActiveSession = { sessionId: string; adminId: string };

export async function createSession(adminId: string, ctx: RequestContext): Promise<void> {
  const token = generateToken();
  const now = Date.now();
  const expiresAt = new Date(now + ABSOLUTE_MS);
  await getDb()
    .insert(adminSessions)
    .values({
      adminId,
      tokenHash: sha256(token),
      expiresAt,
      idleExpiresAt: new Date(now + IDLE_MS),
      ipHash: ctx.ipHash,
      userAgent: ctx.userAgent,
    });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

/** Validates the session cookie against the DB. Null when missing, expired or revoked. */
export async function readSession(): Promise<ActiveSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32 || token.length > 128) return null;

  const now = new Date();
  const [row] = await getDb()
    .select({
      id: adminSessions.id,
      adminId: adminSessions.adminId,
      expiresAt: adminSessions.expiresAt,
      idleExpiresAt: adminSessions.idleExpiresAt,
    })
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.tokenHash, sha256(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, now),
        gt(adminSessions.idleExpiresAt, now),
      ),
    )
    .limit(1);
  if (!row) return null;

  const nextIdle = new Date(Math.min(now.getTime() + IDLE_MS, row.expiresAt.getTime()));
  if (nextIdle.getTime() - row.idleExpiresAt.getTime() > TOUCH_INTERVAL_MS) {
    await getDb().update(adminSessions).set({ idleExpiresAt: nextIdle }).where(eq(adminSessions.id, row.id));
  }
  return { sessionId: row.id, adminId: row.adminId };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb()
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(adminSessions.tokenHash, sha256(token)));
  }
  jar.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/** Revoke every session for an admin (deactivated, or password reset). */
export async function revokeAllSessions(adminId: string): Promise<void> {
  await getDb()
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSessions.adminId, adminId), isNull(adminSessions.revokedAt)));
}

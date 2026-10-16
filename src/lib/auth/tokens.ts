import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, type DbOrTx } from "@/db";
import { admins, adminTokens } from "@/db/schema";
import { appUrl } from "@/lib/env";
import { generateToken, sha256 } from "@/lib/security/crypto";

/**
 * Invitation and password-reset tokens: 256-bit random, stored as SHA-256,
 * single-use and short-lived. Issuing a new token of the same purpose
 * invalidates earlier unused ones.
 */

export type TokenPurpose = "invite" | "reset";

export const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  invite: 7 * 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

export async function issueToken(
  adminId: string,
  purpose: TokenPurpose,
  createdById: string | null,
  db: DbOrTx = getDb(),
): Promise<string> {
  const token = generateToken();
  const now = new Date();
  await db
    .update(adminTokens)
    .set({ consumedAt: now })
    .where(and(eq(adminTokens.adminId, adminId), eq(adminTokens.purpose, purpose), isNull(adminTokens.consumedAt)));
  await db.insert(adminTokens).values({
    adminId,
    purpose,
    tokenHash: sha256(token),
    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS[purpose]),
    createdById,
  });
  return token;
}

const plausible = (token: string) => token.length >= 32 && token.length <= 128;

function validToken(purpose: TokenPurpose, token: string) {
  return and(
    eq(adminTokens.tokenHash, sha256(token)),
    eq(adminTokens.purpose, purpose),
    isNull(adminTokens.consumedAt),
    gt(adminTokens.expiresAt, new Date()),
  );
}

/** Look a token up without consuming it (to render the set-password page). */
export async function inspectToken(purpose: TokenPurpose, token: string) {
  if (!plausible(token)) return null;
  const [row] = await getDb()
    .select({ adminId: admins.id, email: admins.email, name: admins.name, isActive: admins.isActive })
    .from(adminTokens)
    .innerJoin(admins, eq(admins.id, adminTokens.adminId))
    .where(validToken(purpose, token))
    .limit(1);
  return row?.isActive ? { adminId: row.adminId, email: row.email, name: row.name } : null;
}

/** Atomically consume a token; returns the admin id, or null if invalid, used or expired. */
export async function consumeToken(purpose: TokenPurpose, token: string, db: DbOrTx = getDb()): Promise<string | null> {
  if (!plausible(token)) return null;
  const [row] = await db
    .update(adminTokens)
    .set({ consumedAt: new Date() })
    .where(validToken(purpose, token))
    .returning({ adminId: adminTokens.adminId });
  return row?.adminId ?? null;
}

export function tokenLink(purpose: TokenPurpose, token: string): string {
  const page = purpose === "invite" ? "accept-invite" : "reset-password";
  return `${appUrl()}/admin/${page}/?token=${encodeURIComponent(token)}`;
}

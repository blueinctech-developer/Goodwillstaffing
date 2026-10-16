import "server-only";
import { eq, sql } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { emailButton, emailLayout, escapeHtml, sendEmail, type EmailResult } from "@/lib/aws/ses";
import { hmac } from "@/lib/security/crypto";
import { logger } from "@/lib/security/logger";
import { rateLimitAll } from "@/lib/security/rate-limit";
import type { RequestContext } from "@/lib/security/request";
import { hashPassword, verifyAgainstDummy, verifyPassword } from "./password";
import { createSession, revokeAllSessions } from "./session";
import { consumeToken, issueToken, tokenLink, TOKEN_TTL_MS, type TokenPurpose } from "./tokens";

// Email + password sign-in with lockout, emailed password resets and
// invitations. The Server Actions in app/admin/_actions/auth.ts validate input
// and call these.

export type AuthResult = { ok: true; redirectTo: string } | { ok: false; error: string };
export type PlainResult = { ok: true } | { ok: false; error: string };

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
const HOME = "/admin/";
const INVALID = "Incorrect email or password.";

const emailKey = (email: string) => hmac("rl-email", email).slice(0, 32);

async function findByEmail(email: string) {
  const [row] = await getDb().select().from(admins).where(eq(admins.email, email)).limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------- sign in

export async function loginWithPassword(opts: {
  email: string;
  password: string;
  next?: string | null;
  ctx: RequestContext;
}): Promise<AuthResult> {
  const { email, password, ctx } = opts;
  const limited = await rateLimitAll([
    ["loginByEmail", emailKey(email)],
    ["loginByIp", ctx.ipHash ?? "unknown"],
  ]);
  if (!limited.success)
    return { ok: false, error: "Too many sign-in attempts. Please wait a few minutes and try again." };

  const admin = await findByEmail(email);
  if (!admin || !admin.isActive || !admin.passwordHash) {
    await verifyAgainstDummy(password);
    return { ok: false, error: INVALID };
  }
  if (admin.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
    await verifyAgainstDummy(password);
    return {
      ok: false,
      error: "This account is temporarily locked after too many attempts. Try again later or reset your password.",
    };
  }

  if (!(await verifyPassword(password, admin.passwordHash))) {
    const [row] = await getDb()
      .update(admins)
      .set({ failedLoginAttempts: sql`${admins.failedLoginAttempts} + 1` })
      .where(eq(admins.id, admin.id))
      .returning({ n: admins.failedLoginAttempts });
    if ((row?.n ?? 0) >= MAX_FAILED_LOGINS) {
      await getDb()
        .update(admins)
        .set({ lockedUntil: new Date(Date.now() + LOCKOUT_MS), failedLoginAttempts: 0 })
        .where(eq(admins.id, admin.id));
    }
    return { ok: false, error: INVALID };
  }

  await getDb()
    .update(admins)
    .set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(admins.id, admin.id));
  await createSession(admin.id, ctx);
  const next = opts.next && opts.next.startsWith("/admin/") && !opts.next.startsWith("//") ? opts.next : HOME;
  return { ok: true, redirectTo: next };
}

// ---------------------------------------------------------------- emails

function resetEmail(name: string, link: string) {
  const minutes = TOKEN_TTL_MS.reset / 60_000;
  return {
    subject: "Reset your Goodwill admin password",
    text: `Hi ${name},\n\nUse this link to choose a new password for the Goodwill Staffing admin. It expires in ${minutes} minutes and works once.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: emailLayout(
      "Reset your password",
      `<p>Hi ${escapeHtml(name)},</p><p>Use this link to choose a new password for the Goodwill Staffing admin. It expires in ${minutes} minutes and works once.</p>${emailButton(link, "Choose a new password")}<p style="color:#757478;font-size:13px">If you didn't ask for this, you can ignore this email.</p>`,
    ),
  };
}

function inviteEmail(name: string, inviter: string, link: string) {
  const days = TOKEN_TTL_MS.invite / 86_400_000;
  return {
    subject: "You're invited to the Goodwill Staffing admin",
    text: `Hi ${name},\n\n${inviter} invited you to manage the goodwillstaffing.ca website. Set your password with this link (valid for ${days} days):\n\n${link}`,
    html: emailLayout(
      "You're invited",
      `<p>Hi ${escapeHtml(name)},</p><p>${escapeHtml(inviter)} invited you to manage the goodwillstaffing.ca website. Set your password to get started. The link is valid for ${days} days.</p>${emailButton(link, "Accept invitation")}`,
    ),
  };
}

/** Email an invitation (new admins, or admins who never set a password). */
export async function sendInvite(
  adminId: string,
  invitedBy: { id: string; name: string },
): Promise<EmailResult & { link: string }> {
  const [target] = await getDb()
    .select({ email: admins.email, name: admins.name })
    .from(admins)
    .where(eq(admins.id, adminId));
  if (!target) throw new Error("Admin not found");
  const link = tokenLink("invite", await issueToken(adminId, "invite", invitedBy.id));
  const result = await sendEmail([target.email], inviteEmail(target.name, invitedBy.name, link));
  return { ...result, link };
}

/** Create a reset link on an owner's behalf (shown to the owner to pass on). */
export async function createResetLink(adminId: string, createdById: string): Promise<string> {
  return tokenLink("reset", await issueToken(adminId, "reset", createdById));
}

// ---------------------------------------------------------------- reset

/** "Forgot password". Always reports success so it can't be used to discover accounts. */
export async function requestPasswordReset(opts: { email: string; ctx: RequestContext }): Promise<PlainResult> {
  const limited = await rateLimitAll([
    ["passwordResetByEmail", emailKey(opts.email)],
    ["passwordResetByIp", opts.ctx.ipHash ?? "unknown"],
  ]);
  if (!limited.success) return { ok: false, error: "Too many requests. Please wait a while and try again." };

  // Look up and send after responding so timing doesn't reveal registration.
  after(async () => {
    try {
      const admin = await findByEmail(opts.email);
      if (!admin || !admin.isActive) return;
      // An invited admin who never set a password gets a fresh invitation.
      if (!admin.passwordHash) {
        await sendInvite(admin.id, { id: admin.invitedById ?? admin.id, name: "An administrator" });
        return;
      }
      const link = tokenLink("reset", await issueToken(admin.id, "reset", null));
      await sendEmail([admin.email], resetEmail(admin.name, link));
    } catch (err) {
      logger.error("Password reset request failed", { err });
    }
  });
  return { ok: true };
}

/** Complete a reset or accept an invitation: set the password and sign in. */
export async function redeemToken(opts: {
  purpose: TokenPurpose;
  token: string;
  password: string;
  ctx: RequestContext;
}): Promise<AuthResult> {
  const limited = await rateLimitAll([["tokenRedeemByIp", opts.ctx.ipHash ?? "unknown"]]);
  if (!limited.success) return { ok: false, error: "Too many attempts. Please wait a few minutes." };

  const passwordHash = await hashPassword(opts.password);
  const adminId = await getDb().transaction(async (tx) => {
    const id = await consumeToken(opts.purpose, opts.token, tx);
    if (!id) return null;
    await tx
      .update(admins)
      .set({ passwordHash, passwordUpdatedAt: new Date(), failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(admins.id, id));
    return id;
  });
  const [admin] = adminId ? await getDb().select().from(admins).where(eq(admins.id, adminId)) : [];
  if (!admin?.isActive) {
    return {
      ok: false,
      error:
        opts.purpose === "invite"
          ? "This invitation is invalid or has expired. Ask an owner to send a new one."
          : "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  // End every existing session (possibly an attacker's), then sign in fresh.
  await revokeAllSessions(admin.id);
  await getDb().update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  await createSession(admin.id, opts.ctx);
  return { ok: true, redirectTo: HOME };
}

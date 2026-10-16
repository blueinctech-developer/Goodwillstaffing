"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { adminAction, invalid } from "@/lib/admin/action";
import type { ActionState } from "@/lib/admin/types";
import { emailButton, emailLayout, escapeHtml, sendEmail } from "@/lib/aws/ses";
import { createResetLink, sendInvite } from "@/lib/auth/service";
import { revokeAllSessions } from "@/lib/auth/session";

// Owner-only account management. Links are shown to the owner only when the
// email couldn't be sent (SES not configured yet), so they can pass them on.

const OWNER = { role: "owner" } as const;

export async function inviteAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async (owner) => {
    const parsed = z
      .object({
        name: z.string().trim().min(1, { error: "Enter a name" }).max(100),
        email: z
          .string()
          .trim()
          .toLowerCase()
          .max(254)
          .pipe(z.email({ error: "Enter a valid email address" })),
        role: z.enum(["owner", "editor"]),
      })
      .safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);

    const db = getDb();
    const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, parsed.data.email));
    if (existing)
      return { status: "error", message: "An admin with this email already exists.", errors: { email: "Taken" } };

    const [created] = await db
      .insert(admins)
      .values({ ...parsed.data, invitedById: owner.id })
      .returning({ id: admins.id });
    const sent = await sendInvite(created.id, { id: owner.id, name: owner.name });
    refresh();
    return sent.status === "sent"
      ? { status: "ok", message: `Invitation sent to ${parsed.data.email}.` }
      : {
          status: "ok",
          message: "Admin created, but the email couldn't be sent. Share this link with them:",
          data: { link: sent.link },
        };
  }, OWNER);
}

const idSchema = z.object({ id: z.uuid() });

export async function setAdminActive(active: boolean, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async (owner) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);
    if (parsed.data.id === owner.id) return { status: "error", message: "You can't deactivate your own account." };
    await getDb().update(admins).set({ isActive: active }).where(eq(admins.id, parsed.data.id));
    if (!active) await revokeAllSessions(parsed.data.id);
    refresh();
    return { status: "ok", message: active ? "Account reactivated." : "Account deactivated and signed out." };
  }, OWNER);
}

export async function changeRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async (owner) => {
    const parsed = idSchema.extend({ role: z.enum(["owner", "editor"]) }).safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);
    if (parsed.data.id === owner.id) return { status: "error", message: "Ask another owner to change your role." };
    await getDb()
      .update(admins)
      .set({ role: parsed.data.role })
      .where(and(eq(admins.id, parsed.data.id), ne(admins.id, owner.id)));
    refresh();
    return { status: "ok", message: "Role updated." };
  }, OWNER);
}

/** Email a password reset link, or a fresh invitation if they never set a password. */
export async function sendAccessLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async (owner) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return invalid(parsed.error);
    const [target] = await getDb().select().from(admins).where(eq(admins.id, parsed.data.id));
    if (!target?.isActive) return { status: "error", message: "Reactivate the account first." };

    if (!target.passwordHash) {
      const sent = await sendInvite(target.id, { id: owner.id, name: owner.name });
      return sent.status === "sent"
        ? { status: "ok", message: `New invitation sent to ${target.email}.` }
        : {
            status: "ok",
            message: "The email couldn't be sent. Share this invitation link:",
            data: { link: sent.link },
          };
    }
    const link = await createResetLink(target.id, owner.id);
    const result = await sendEmail([target.email], {
      subject: "Reset your Goodwill admin password",
      text: `Hi ${target.name},\n\n${owner.name} sent you a link to set a new password for the Goodwill Staffing admin. It expires in an hour:\n\n${link}`,
      html: emailLayout(
        "Set a new password",
        `<p>Hi ${escapeHtml(target.name)},</p><p>${escapeHtml(owner.name)} sent you a link to set a new password for the Goodwill Staffing admin. It expires in an hour.</p>${emailButton(link, "Choose a new password")}`,
      ),
    });
    return result.status === "sent"
      ? { status: "ok", message: `Reset link sent to ${target.email}.` }
      : {
          status: "ok",
          message: "The email couldn't be sent. Share this reset link (valid for an hour):",
          data: { link },
        };
  }, OWNER);
}

"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { adminAction, invalid } from "@/lib/admin/action";
import { setStatus } from "@/lib/admin/submissions";
import type { ActionState } from "@/lib/admin/types";
import { deleteObject } from "@/lib/aws/s3";
import { hasS3 } from "@/lib/env";
import { logger } from "@/lib/security/logger";

const ids = z.array(z.uuid()).min(1, { error: "Select at least one submission" }).max(500);
const status = z.enum(["new", "read", "archived", "spam"]);

/** Bulk (or single) status change: mark read/unread, archive, spam. */
export async function updateStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async () => {
    const parsed = z.object({ ids, status }).safeParse({ ids: formData.getAll("ids"), status: formData.get("status") });
    if (!parsed.success) return invalid(parsed.error);
    await setStatus(parsed.data.ids, parsed.data.status);
    refresh();
    const n = parsed.data.ids.length;
    return { status: "ok", message: `${n} submission${n === 1 ? "" : "s"} marked ${parsed.data.status}.` };
  });
}

export async function saveNotes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async () => {
    const parsed = z
      .object({ id: z.uuid(), notes: z.string().max(10_000) })
      .safeParse({ id: formData.get("id"), notes: formData.get("notes") ?? "" });
    if (!parsed.success) return invalid(parsed.error);
    await getDb()
      .update(submissions)
      .set({ notes: parsed.data.notes.trim() || null })
      .where(eq(submissions.id, parsed.data.id));
    refresh();
    return { status: "ok", message: "Notes saved." };
  });
}

/** Permanently delete a submission and its stored files. */
export async function deleteSubmission(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await adminAction(async () => {
    const parsed = z.uuid().safeParse(formData.get("id"));
    if (!parsed.success) return { status: "error", message: "Unknown submission." };
    const [row] = await getDb()
      .delete(submissions)
      .where(eq(submissions.id, parsed.data))
      .returning({ files: submissions.files });
    if (!row) return { status: "error", message: "This submission was already deleted." };
    if (hasS3()) {
      for (const file of row.files) {
        if (!file.key) continue;
        await deleteObject(file.key).catch((err) => logger.error("Failed to delete submission file", { err }));
      }
    }
    return { status: "ok", message: "Deleted." };
  });
  if (result.status === "ok") redirect("/admin/submissions/");
  return result;
}

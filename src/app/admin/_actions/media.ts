"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { adminAction } from "@/lib/admin/action";
import { listMedia, prepareMediaUpload } from "@/lib/admin/media";
import type { ActionState, MediaItem } from "@/lib/admin/types";
import { deleteObject, MEDIA_PREFIX } from "@/lib/aws/s3";
import { hasS3 } from "@/lib/env";
import { logger } from "@/lib/security/logger";

// Media library actions, used by the /admin/media page and the image pickers
// in the post and page editors.

export type MediaPage = { ok: true; items: MediaItem[]; nextCursor: string | null } | { ok: false; error: string };

export async function browseMedia(folder: string, cursor: string | null): Promise<MediaPage> {
  try {
    await requireAdmin();
    if (!hasS3()) return { ok: false, error: "S3 isn't configured (S3_BUCKET, S3_REGION)." };
    const page = await listMedia(String(folder ?? "").slice(0, 200), cursor ?? undefined);
    return { ok: true, ...page };
  } catch (err) {
    logger.error("Media listing failed", { err });
    return {
      ok: false,
      error: err instanceof Error && err.name === "AuthError" ? err.message : "Couldn't load media.",
    };
  }
}

export type MediaTicket =
  | { ok: true; url: string; contentType: string; cacheControl: string; item: MediaItem }
  | { ok: false; error: string };

export async function requestMediaUpload(file: { name: string; type: string; size: number }): Promise<MediaTicket> {
  try {
    await requireAdmin();
    if (!hasS3()) return { ok: false, error: "S3 isn't configured (S3_BUCKET, S3_REGION)." };
    const ticket = await prepareMediaUpload({
      name: String(file?.name ?? "file").slice(0, 200),
      type: String(file?.type ?? ""),
      size: Number(file?.size ?? 0),
    });
    if ("error" in ticket) return { ok: false, error: ticket.error ?? "Upload refused." };
    return {
      ok: true,
      url: ticket.url,
      contentType: ticket.contentType,
      cacheControl: ticket.cacheControl,
      item: ticket.item,
    };
  } catch (err) {
    logger.error("Media upload presign failed", { err });
    return {
      ok: false,
      error: err instanceof Error && err.name === "AuthError" ? err.message : "Couldn't start the upload.",
    };
  }
}

export async function deleteMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async () => {
    const key = String(formData.get("key") ?? "");
    if (!key.startsWith(MEDIA_PREFIX) || key.includes("..")) return { status: "error", message: "Unknown file." };
    await deleteObject(key);
    refresh();
    return { status: "ok", message: "File deleted. Pages that used it will show a broken image." };
  });
}

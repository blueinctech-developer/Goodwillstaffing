import "server-only";
import {
  headObject,
  listObjects,
  MEDIA_CACHE_CONTROL,
  MEDIA_PREFIX,
  presignPut,
  publicObjectUrl,
  safeFileName,
} from "@/lib/aws/s3";
import type { MediaItem } from "./types";

// The media library: public site media under media/ in S3. Content refers to
// objects as "/media/<path>", which src/lib/media.ts maps to
// NEXT_PUBLIC_MEDIA_URL (the bucket's public media/ URL) at render time.

export const MEDIA_TYPES: Record<string, { kind: MediaItem["kind"]; maxSize: number }> = {
  "image/jpeg": { kind: "image", maxSize: 20 * 1024 * 1024 },
  "image/png": { kind: "image", maxSize: 20 * 1024 * 1024 },
  "image/webp": { kind: "image", maxSize: 20 * 1024 * 1024 },
  "image/gif": { kind: "image", maxSize: 20 * 1024 * 1024 },
  "image/avif": { kind: "image", maxSize: 20 * 1024 * 1024 },
  "video/mp4": { kind: "video", maxSize: 256 * 1024 * 1024 },
  "video/webm": { kind: "video", maxSize: 256 * 1024 * 1024 },
  "application/pdf": { kind: "pdf", maxSize: 25 * 1024 * 1024 },
};

const KIND_BY_EXT: Record<string, MediaItem["kind"]> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  avif: "image",
  svg: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  pdf: "pdf",
};

export function mediaItem(object: { key: string; size: number; lastModified: string | null }): MediaItem {
  const name = object.key.split("/").pop() ?? object.key;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return {
    key: object.key,
    path: `/${object.key}`,
    url: publicObjectUrl(object.key),
    name,
    size: object.size,
    lastModified: object.lastModified,
    kind: KIND_BY_EXT[ext] ?? "other",
  };
}

/** "2025/01" style folder filter -> S3 prefix under media/. */
export function mediaPrefix(folder: string): string {
  const clean = folder
    .replace(/^\/+|\/+$/g, "")
    .replace(/^media\/?/, "")
    .replace(/[^\w./-]/g, "");
  return MEDIA_PREFIX + (clean ? `${clean}${/\.\w+$/.test(clean) ? "" : "/"}` : "");
}

export async function listMedia(folder: string, cursor?: string) {
  const { objects, nextCursor } = await listObjects(mediaPrefix(folder), cursor, 60);
  return { items: objects.map(mediaItem), nextCursor };
}

/** Presign an upload to media/<yyyy>/<mm>/<name>, picking a free name. */
export async function prepareMediaUpload(file: { name: string; type: string; size: number }) {
  const rule = MEDIA_TYPES[file.type];
  if (!rule) return { error: "Upload JPG, PNG, WebP, GIF or AVIF images, MP4 or WebM video, or PDF files." } as const;
  if (!(file.size > 0) || file.size > rule.maxSize) {
    return { error: `That file is larger than the ${Math.round(rule.maxSize / 1024 / 1024)} MB limit.` } as const;
  }
  const now = new Date();
  const folder = `${MEDIA_PREFIX}${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/`;
  const name = safeFileName(file.name);
  let key = folder + name;
  for (let n = 2; (await headObject(key)) && n < 50; n++) key = folder + name.replace(/(\.[^.]*)?$/, `-${n}$1`);
  const url = await presignPut(key, file.type, { cacheControl: MEDIA_CACHE_CONTROL });
  const item = mediaItem({ key, size: file.size, lastModified: now.toISOString() });
  return { key, url, contentType: file.type, cacheControl: MEDIA_CACHE_CONTROL, item } as const;
}

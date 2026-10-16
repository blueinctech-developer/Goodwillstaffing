import "server-only";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsCredentials, s3Config } from "@/lib/env";

// One bucket, two halves:
//   media/    public-read site media (the WordPress uploads mirror + admin uploads)
//   private/  form uploads, only reachable through short-lived presigned GETs
// Browser uploads first land under private/tmp/ and are moved into place once
// the submission they belong to is stored. Add a lifecycle rule to expire
// private/tmp/ after a day (see README).

export const MEDIA_PREFIX = "media/";
export const PRIVATE_PREFIX = "private/";
export const TMP_PREFIX = "private/tmp/";

const globalForS3 = globalThis as unknown as { __gwS3?: S3Client };

export function s3(): S3Client {
  if (!globalForS3.__gwS3) {
    const { region } = s3Config();
    globalForS3.__gwS3 = new S3Client({ region, credentials: awsCredentials() });
  }
  return globalForS3.__gwS3;
}

const bucket = () => s3Config().bucket;

/** Public URL of a media/ object (S3_PUBLIC_URL, e.g. a CloudFront domain, or the bucket endpoint). */
export function publicObjectUrl(key: string): string {
  return `${s3Config().publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** File name safe for an S3 key: ASCII letters, digits, dot, dash, underscore. */
export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const dot = base.lastIndexOf(".");
  const stem = (dot > 0 ? base.slice(0, dot) : base)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  const ext =
    dot > 0
      ? base
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 10)
      : "";
  return `${stem || "file"}${ext ? `.${ext}` : ""}`;
}

/** Long-lived caching for public media (file names never change content). */
export const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

/**
 * Presigned PUT for a direct browser upload. The browser must send the same
 * Content-Type (and Cache-Control, when given) headers.
 */
export function presignPut(key: string, contentType: string, opts: { cacheControl?: string; expiresIn?: number } = {}) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType, CacheControl: opts.cacheControl }),
    { expiresIn: opts.expiresIn ?? 15 * 60 },
  );
}

/** Presigned GET that downloads under the original file name. */
export function presignGet(key: string, fileName?: string, expiresIn = 5 * 60): Promise<string> {
  const disposition = fileName
    ? `attachment; filename="${fileName.replace(/["\\\r\n]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    : undefined;
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: disposition }),
    { expiresIn },
  );
}

export async function headObject(key: string): Promise<{ size: number; contentType: string } | null> {
  try {
    const res = await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return { size: res.ContentLength ?? 0, contentType: res.ContentType ?? "application/octet-stream" };
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404 || status === 403) return null;
    throw err;
  }
}

export async function putObject(key: string, body: Uint8Array, contentType: string, cacheControl?: string) {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl,
    }),
  );
}

/** Server-side copy then delete (S3 has no rename). Single-request copy handles up to 5 GB. */
export async function moveObject(from: string, to: string) {
  await s3().send(
    new CopyObjectCommand({
      Bucket: bucket(),
      Key: to,
      CopySource: `${bucket()}/${from.split("/").map(encodeURIComponent).join("/")}`,
    }),
  );
  await deleteObject(from);
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export type ListedObject = { key: string; size: number; lastModified: string | null };

export async function listObjects(prefix: string, cursor?: string, max = 60) {
  const res = await s3().send(
    new ListObjectsV2Command({
      Bucket: bucket(),
      Prefix: prefix,
      ContinuationToken: cursor || undefined,
      MaxKeys: max,
    }),
  );
  const objects: ListedObject[] = (res.Contents ?? [])
    .filter((o) => o.Key && !o.Key.endsWith("/"))
    .map((o) => ({ key: o.Key!, size: o.Size ?? 0, lastModified: o.LastModified?.toISOString() ?? null }));
  return { objects, nextCursor: res.IsTruncated ? (res.NextContinuationToken ?? null) : null };
}

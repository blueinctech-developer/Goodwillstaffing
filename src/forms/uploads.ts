import "server-only";
import { hasS3 } from "@/lib/env";
import { headObject, moveObject, presignPut, putObject, safeFileName, TMP_PREFIX } from "@/lib/aws/s3";
import type { StoredFile } from "@/db/schema";
import type { FileField, FormDefinition, FormErrors, FormFiles, UploadRef } from "./types";
import { fileError } from "./validate";

// Form uploads in S3.
//
// Direct uploads (any size up to the field's limit):
//   1. FormClient asks `requestUpload` (actions.ts) for a presigned PUT, which
//      checks the field, file type and size and returns a key under
//      private/tmp/<formId>/<field>/<uuid>/<name>.
//   2. The browser PUTs the file to S3, then submits { key, name, size, type }
//      in place of the File.
//   3. `verifyUploads` checks each key belongs to this form and field, and
//      reads the real size with HeadObject before anything is stored.
//   4. `storeFiles` moves the objects to private/submissions/<yyyy>/<mm>/<id>/.
// Without S3 configured the browser posts the File itself (small files only,
// see serverActions.bodySizeLimit) and the sink records it without a key.

export const directUploadsEnabled = hasS3;

function fileField(definition: FormDefinition, name: string): FileField | undefined {
  const field = definition.fields.find((f) => f.name === name);
  return field?.type === "file" ? field : undefined;
}

export type UploadTicket = { key: string; url: string; contentType: string };

/** Validate a planned upload and presign it. Returns an error message when refused. */
export async function prepareUpload(
  definition: FormDefinition,
  fieldName: string,
  file: { name: string; size: number; type: string },
): Promise<UploadTicket | { error: string }> {
  const field = fileField(definition, fieldName);
  if (!field) return { error: "This upload is not accepted." };
  if (!(file.size > 0)) return { error: `"${file.name}" is empty.` };
  const error = fileError(field, file);
  if (error) return { error };
  const contentType = /^[\w.+-]+\/[\w.+-]+$/.test(file.type) ? file.type : "application/octet-stream";
  const key = `${TMP_PREFIX}${definition.id}/${field.name}/${crypto.randomUUID()}/${safeFileName(file.name)}`;
  return { key, url: await presignPut(key, contentType), contentType };
}

const isRef = (file: File | UploadRef): file is UploadRef => typeof (file as UploadRef).key === "string";

/**
 * Confirm every referenced upload exists under this form's tmp prefix and
 * respects the field's limit, replacing the client's claimed size and type
 * with S3's. Plain Files pass through unchanged.
 */
export async function verifyUploads(
  definition: FormDefinition,
  files: FormFiles,
): Promise<{ ok: true; files: FormFiles } | { ok: false; errors: FormErrors }> {
  const errors: FormErrors = {};
  const out: FormFiles = {};
  for (const [name, list] of Object.entries(files)) {
    const field = fileField(definition, name);
    out[name] = [];
    for (const file of list) {
      if (!isRef(file)) {
        out[name].push(file);
        continue;
      }
      const head =
        field && hasS3() && file.key.startsWith(`${TMP_PREFIX}${definition.id}/${name}/`)
          ? await headObject(file.key)
          : null;
      if (!field || !head) {
        errors[name] = `"${file.name}" didn't finish uploading. Please choose the file again.`;
        break;
      }
      const error = fileError(field, { name: file.name, size: head.size });
      if (error) {
        errors[name] = error;
        break;
      }
      out[name].push({ ...file, size: head.size, type: head.contentType });
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, files: out };
}

/**
 * Put every file in its final private location. Files that can't be stored
 * are kept in the list with `key: null` so the admin can see what was lost.
 */
export async function storeFiles(
  submissionId: string,
  createdAt: Date,
  files: FormFiles,
): Promise<{ files: StoredFile[]; status: "stored" | "partial" | "skipped" | "failed"; error?: string }> {
  const entries = Object.entries(files).flatMap(([field, list]) => list.map((file) => ({ field, file })));
  if (entries.length === 0) return { files: [], status: "stored" };

  const yyyy = createdAt.getUTCFullYear();
  const mm = String(createdAt.getUTCMonth() + 1).padStart(2, "0");
  const base = `private/submissions/${yyyy}/${mm}/${submissionId}/`;
  const used = new Set<string>();
  const stored: StoredFile[] = [];
  let failures = 0;
  let lastError: string | undefined;

  for (const { field, file } of entries) {
    let name = safeFileName(file.name);
    for (let n = 2; used.has(name); n++) name = name.replace(/(\.[^.]*)?$/, `-${n}$1`);
    used.add(name);
    const record: StoredFile = {
      field,
      key: null,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    };
    if (!hasS3()) {
      stored.push(record);
      failures++;
      lastError = "S3 not configured";
      continue;
    }
    try {
      const key = base + name;
      if (isRef(file)) await moveObject(file.key, key);
      else await putObject(key, new Uint8Array(await file.arrayBuffer()), record.type);
      stored.push({ ...record, key });
    } catch (err) {
      stored.push(record);
      failures++;
      lastError = err instanceof Error ? err.name : "Upload failed";
    }
  }
  const status = !hasS3() ? "skipped" : failures === 0 ? "stored" : failures === entries.length ? "failed" : "partial";
  return { files: stored, status, error: lastError };
}

// Uploads the WordPress uploads mirror to s3://$S3_BUCKET/media/, keeping the
// <year>/<month>/<file> paths the content refers to ("/media/2025/01/x.jpg").
// Resumable: objects that already exist with the same size are skipped, so
// re-run it after an interruption or to sync new files.
//
//   npm run media:upload                                  # default folder below
//   npm run media:upload -- "D:\path\to\media" --dry-run
//
// Needs S3_BUCKET, S3_REGION and AWS credentials (AWS_ACCESS_KEY_ID /
// AWS_SECRET_ACCESS_KEY or any profile the AWS SDK picks up).

import fs from "node:fs";
import path from "node:path";
import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const DEFAULT_DIR = "C:\\Users\\DELL\\goodwill-export\\media";
const PREFIX = "media/";
const CONCURRENCY = 8;
const CACHE_CONTROL = "public, max-age=31536000, immutable";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  ogv: "video/ogg",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  pdf: "application/pdf",
  json: "application/json",
  txt: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  xml: "application/xml",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dir = path.resolve(args.find((a) => !a.startsWith("--")) ?? DEFAULT_DIR);

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
if (!bucket || !region) {
  console.error("Set S3_BUCKET and S3_REGION (and AWS credentials) in .env.local first.");
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      : undefined,
});

function walk(root: string): { file: string; key: string; size: number }[] {
  const out: { file: string; key: string; size: number }[] = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && !entry.name.startsWith(".") && entry.name !== "Thumbs.db") {
        const rel = path.relative(root, full).split(path.sep).join("/");
        out.push({ file: full, key: PREFIX + rel, size: fs.statSync(full).size });
      }
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

async function existingObjects(): Promise<Map<string, number>> {
  const sizes = new Map<string, number>();
  let token: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX, ContinuationToken: token }));
    for (const o of res.Contents ?? []) if (o.Key) sizes.set(o.Key, o.Size ?? -1);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return sizes;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function main() {
  if (!fs.existsSync(dir)) throw new Error(`Folder not found: ${dir}`);
  const files = walk(dir);
  console.log(`${files.length} files (${mb(files.reduce((s, f) => s + f.size, 0))}) in ${dir}`);

  const existing = await existingObjects();
  const todo = files.filter((f) => existing.get(f.key) !== f.size);
  console.log(
    `${files.length - todo.length} already in s3://${bucket}/${PREFIX}, ${todo.length} to upload (${mb(todo.reduce((s, f) => s + f.size, 0))})`,
  );
  if (dryRun) {
    todo.slice(0, 20).forEach((f) => console.log(`  would upload ${f.key}`));
    if (todo.length > 20) console.log(`  … and ${todo.length - 20} more`);
    return;
  }

  let done = 0;
  let failed = 0;
  const queue = [...todo];
  async function worker() {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const ext = path.extname(item.file).slice(1).toLowerCase();
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: item.key,
            Body: fs.createReadStream(item.file),
            ContentLength: item.size,
            ContentType: TYPES[ext] ?? "application/octet-stream",
            CacheControl: CACHE_CONTROL,
          }),
        );
        done++;
        if (done % 25 === 0 || done === todo.length) console.log(`  ${done}/${todo.length} uploaded`);
      } catch (err) {
        failed++;
        console.error(`  failed ${item.key}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Done: ${done} uploaded, ${failed} failed.${failed ? " Re-run to retry the failures." : ""}`);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

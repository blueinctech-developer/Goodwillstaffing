import "server-only";
import { SITE_URL } from "./site";

// Server environment, read lazily per service so the public site builds and
// runs with none of it set. Each integration has a `has*()` check for graceful
// fallbacks and a config getter that throws a descriptive error when used
// without its variables. Never log the values returned here.

const read = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

export class ConfigurationError extends Error {
  constructor(service: string, missing: string[]) {
    super(`${service} is not configured. Missing: ${missing.join(", ")}`);
    this.name = "ConfigurationError";
  }
}

function need<K extends string>(service: string, names: K[]): Record<K, string> {
  const missing = names.filter((n) => !read(n));
  if (missing.length) throw new ConfigurationError(service, missing);
  return Object.fromEntries(names.map((n) => [n, read(n)!])) as Record<K, string>;
}

export const isProduction = process.env.NODE_ENV === "production";

/** Absolute origin used in emailed links (admin invites, notifications). */
export function appUrl(): string {
  const url = read("APP_URL") ?? (isProduction ? SITE_URL : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

// ---------------------------------------------------------------- database

export const hasDatabase = () => Boolean(read("DATABASE_URL"));

export function databaseUrl(): string {
  return need("Database", ["DATABASE_URL"]).DATABASE_URL;
}

/**
 * Key for HMACs over identifiers (IP hashes for rate limits and submission
 * meta). Required once the database is in use in production; otherwise a
 * fixed key keeps local runs and the DB-less public site working.
 */
export function sessionSecret(): Buffer {
  const value = read("SESSION_SECRET");
  if (!value) {
    if (isProduction && hasDatabase()) throw new ConfigurationError("Sessions", ["SESSION_SECRET"]);
    return Buffer.from("development-only-session-secret-change-me");
  }
  const key = Buffer.from(value, "base64");
  if (key.length < 32) throw new ConfigurationError("Sessions", ["SESSION_SECRET (must be >= 32 bytes, base64)"]);
  return key;
}

// ---------------------------------------------------------------- AWS

/** S3 needs a bucket and region; credentials come from AWS_ACCESS_KEY_ID/SECRET or the default AWS chain. */
export const hasS3 = () => Boolean(read("S3_BUCKET") && read("S3_REGION"));

export function s3Config() {
  const { S3_BUCKET, S3_REGION } = need("S3", ["S3_BUCKET", "S3_REGION"]);
  const publicUrl = (read("S3_PUBLIC_URL") ?? `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`).replace(/\/+$/, "");
  return { bucket: S3_BUCKET, region: S3_REGION, publicUrl };
}

export const hasSes = () => Boolean(read("MAIL_FROM") && (read("SES_REGION") || read("S3_REGION")));

export function sesConfig() {
  const { MAIL_FROM } = need("Email (SES)", ["MAIL_FROM"]);
  const region = read("SES_REGION") ?? read("S3_REGION");
  if (!region) throw new ConfigurationError("Email (SES)", ["SES_REGION"]);
  return { from: MAIL_FROM, region };
}

/** Static AWS keys when set; otherwise the SDK's default provider chain. */
export function awsCredentials() {
  const accessKeyId = read("AWS_ACCESS_KEY_ID");
  const secretAccessKey = read("AWS_SECRET_ACCESS_KEY");
  return accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
}

// ---------------------------------------------------------------- forms

/** Recipients for a form's notify group: FORM_NOTIFY_<KEY>, else FORM_NOTIFY_DEFAULT. */
export function notifyRecipients(key: string): string[] {
  const list = read(`FORM_NOTIFY_${key.toUpperCase()}`) ?? read("FORM_NOTIFY_DEFAULT") ?? "";
  return list
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Database schema for the admin: accounts and sessions, form submissions, and
// the editable site content (pages, posts, categories) that replaces the JSON
// files in src/content once seeded. Kept free of "server-only" so the scripts
// in scripts/ can import it.

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const adminRole = pgEnum("admin_role", ["owner", "editor"]);
export const submissionStatus = pgEnum("submission_status", ["new", "read", "archived", "spam"]);
export const submissionSource = pgEnum("submission_source", ["web", "legacy_import"]);
export const contentStatus = pgEnum("content_status", ["published", "draft"]);

export type AdminRole = (typeof adminRole.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatus.enumValues)[number];
export type ContentStatus = (typeof contentStatus.enumValues)[number];

// ---------------------------------------------------------------- admins

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Always lower-cased. */
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: adminRole("role").notNull().default("editor"),
    isActive: boolean("is_active").notNull().default(true),
    /** scrypt hash; null until an invited admin accepts and sets a password. */
    passwordHash: text("password_hash"),
    passwordUpdatedAt: timestamp("password_updated_at", { withTimezone: true }),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    invitedById: uuid("invited_by_id"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("admins_email_idx").on(t.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    /** SHA-256 of the cookie token; the token itself is never stored. */
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    idleExpiresAt: timestamp("idle_expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("admin_sessions_token_idx").on(t.tokenHash), index("admin_sessions_admin_idx").on(t.adminId)],
);

/** Single-use, hashed tokens for invitations and password resets. */
export const adminTokens = pgTable(
  "admin_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    /** "invite" | "reset" */
    purpose: text("purpose").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdById: uuid("created_by_id"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("admin_tokens_hash_idx").on(t.tokenHash), index("admin_tokens_admin_idx").on(t.adminId)],
);

/** Fixed-window rate-limit counters (no Redis needed). */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] }), index("rate_limits_window_idx").on(t.windowStart)],
);

// ---------------------------------------------------------------- submissions

/** One stored upload. `key` is the private S3 object; null if it could not be stored. */
export type StoredFile = { field: string; key: string | null; name: string; size: number; type: string };

export type SubmissionMetaRecord = {
  ipHash?: string | null;
  userAgent?: string | null;
  /** Page the form was submitted from. */
  pagePath?: string | null;
  salesforce?: "skipped" | "sent" | "failed";
  email?: { status: "sent" | "skipped" | "failed"; recipients?: number; error?: string };
  files?: { status: "stored" | "partial" | "skipped" | "failed"; error?: string };
  /** Legacy imports: the original Gravity Forms meta columns (entry date, source URL, ...). */
  legacy?: Record<string, string>;
};

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: text("form_id").notNull(),
    formTitle: text("form_title").notNull(),
    status: submissionStatus("status").notNull().default("new"),
    /** Field name -> value, as validated by src/forms/validate.ts. */
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    files: jsonb("files").$type<StoredFile[]>().notNull().default([]),
    meta: jsonb("meta").$type<SubmissionMetaRecord>().notNull().default({}),
    source: submissionSource("source").notNull().default("web"),
    legacyEntryId: text("legacy_entry_id"),
    notes: text("notes"),
    createdAt: createdAt(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [
    index("submissions_form_created_idx").on(t.formId, t.createdAt),
    index("submissions_status_idx").on(t.status),
    index("submissions_created_idx").on(t.createdAt),
    uniqueIndex("submissions_legacy_entry_idx").on(t.legacyEntryId),
  ],
);

// ---------------------------------------------------------------- content

// JSON columns mirror the types in src/lib/content.ts (validated by the admin
// on save), typed loosely here so this file stays importable by scripts.

export const pages = pgTable(
  "pages",
  {
    slug: text("slug").primaryKey(),
    title: text("title").notNull(),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull(),
    hero: jsonb("hero").$type<Record<string, unknown>>().notNull(),
    blocks: jsonb("blocks").$type<Record<string, unknown>[]>().notNull().default([]),
    status: contentStatus("status").notNull().default("published"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    updatedBy: uuid("updated_by").references(() => admins.id, { onDelete: "set null" }),
  },
  (t) => [index("pages_status_idx").on(t.status)],
);

export const posts = pgTable(
  "posts",
  {
    slug: text("slug").primaryKey(),
    title: text("title").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    modified: timestamp("modified", { withTimezone: true }).notNull(),
    excerpt: text("excerpt").notNull().default(""),
    categories: text("categories")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    featuredImage: jsonb("featured_image").$type<Record<string, unknown> | null>(),
    seo: jsonb("seo").$type<Record<string, unknown>>().notNull(),
    html: text("html").notNull().default(""),
    status: contentStatus("status").notNull().default("published"),
    createdAt: createdAt(),
    updatedBy: uuid("updated_by").references(() => admins.id, { onDelete: "set null" }),
  },
  (t) => [index("posts_status_date_idx").on(t.status, t.date)],
);

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
});

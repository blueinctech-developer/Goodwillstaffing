import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { submissions, type StoredFile, type SubmissionMetaRecord } from "@/db/schema";
import { emailButton, emailLayout, escapeHtml, sendEmail, type EmailResult } from "@/lib/aws/ses";
import { appUrl, hasDatabase, notifyRecipients } from "@/lib/env";
import { hashIp } from "@/lib/security/crypto";
import { logger } from "@/lib/security/logger";
import { formatBytes } from "./validate";
import { fieldLabel, labelledValues } from "./format";
import type { FormDefinition, FormFiles, FormValues, NotifyKey } from "./types";
import { storeFiles } from "./uploads";

// The single seam between validated submissions and storage/notification.
//
// With DATABASE_URL set (`dbSink`):
//   1. Insert the row into Neon first, so nothing a visitor sends is lost.
//   2. Store files in S3 (private/submissions/<yyyy>/<mm>/<id>/<name>).
//   3. Email the staff group for `definition.notify` through SES.
//   Each side effect's outcome is written to the row's `meta`; a failed upload
//   or email never fails the submission.
// Without it, `logSink` logs the submission (local development).

export type SubmissionMeta = {
  submittedAt: string;
  ip?: string;
  userAgent?: string;
  /** Page the form was submitted from. */
  referer?: string;
};

export type SubmissionInput = {
  definition: FormDefinition;
  values: FormValues;
  files: FormFiles;
  meta: SubmissionMeta;
};

export type SubmissionReceipt = { id: string; stored: boolean };

export interface SubmissionSink {
  /** Persist the submission and notify staff. Throw to report failure to the visitor. */
  save(input: SubmissionInput): Promise<SubmissionReceipt>;
}

/** Fallback without a database: logs the submission and reports success. */
const logSink: SubmissionSink = {
  async save({ definition, values, files, meta }) {
    const id = crypto.randomUUID();
    const fileSummary = Object.fromEntries(
      Object.entries(files).map(([field, list]) => [
        field,
        list.map((f) => `${f.name} (${f.type || "?"}, ${f.size} B)`),
      ]),
    );
    if (process.env.NODE_ENV === "production") {
      // Keep personal data out of production logs.
      console.warn(`[forms] ${definition.id} submission ${id} received but NOT stored (DATABASE_URL is not set)`);
    } else {
      console.info(`[forms] ${definition.id} submission ${id} -> notify:${definition.notify}`, {
        values,
        files: fileSummary,
        meta,
      });
    }
    return { id, stored: false };
  },
};

function pathOf(referer: string | undefined): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname.slice(0, 300);
  } catch {
    return null;
  }
}

/** Contact form messages from employers and agencies go to the staffing team. */
function notifyKeyFor(definition: FormDefinition, values: FormValues): NotifyKey {
  if (definition.id === "contact") {
    const category = values.contactCategory;
    if (category === "I am an Employer" || category === "I am an Agency") return "staffing";
  }
  return definition.notify;
}

function firstEmail(definition: FormDefinition, values: FormValues): string | undefined {
  const field = definition.fields.find((f) => f.type === "email" && typeof values[f.name] === "string");
  const value = field && (values[field.name] as string);
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;
}

function notificationEmail(definition: FormDefinition, id: string, values: FormValues, files: StoredFile[]) {
  const rows = labelledValues(definition, values).filter((r) => r.value !== "");
  const link = `${appUrl()}/admin/submissions/${id}/`;
  const fileLines = files.map(
    (f) => `${fieldLabel(definition, f.field)}: ${f.name} (${formatBytes(f.size)})${f.key ? "" : " [not stored]"}`,
  );
  const text = [
    `New ${definition.title} submission`,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    ...(fileLines.length ? ["", "Files (download from the admin):", ...fileLines] : []),
    "",
    `View in the admin: ${link}`,
  ].join("\n");
  const cell = "padding:6px 12px 6px 0;vertical-align:top;border-bottom:1px solid #f0edf5";
  const html = emailLayout(
    `New ${definition.title} submission`,
    `<table style="border-collapse:collapse;width:100%;font-size:14px">${rows
      .map(
        (r) =>
          `<tr><th align="left" style="${cell};color:#757478;font-weight:600;width:40%">${escapeHtml(r.label)}</th><td style="${cell};white-space:pre-wrap">${escapeHtml(r.value)}</td></tr>`,
      )
      .join("")}</table>${
      fileLines.length
        ? `<p style="margin:16px 0 4px;font-weight:600">Files</p><ul style="margin:0;padding-left:20px">${fileLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
        : ""
    }${emailButton(link, "Open in admin")}`,
  );
  return { subject: definition.notifySubject ?? `New ${definition.title} submission`, text, html };
}

/** Merge keys into a submission's meta without overwriting the rest. */
export async function recordSubmissionOutcome(id: string, patch: SubmissionMetaRecord): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await getDb()
      .update(submissions)
      .set({ meta: sql`${submissions.meta} || ${JSON.stringify(patch)}::jsonb` })
      .where(eq(submissions.id, id));
  } catch (err) {
    logger.error("Failed to record submission outcome", { id, err });
  }
}

const dbSink: SubmissionSink = {
  async save({ definition, values, files, meta }) {
    const createdAt = new Date(meta.submittedAt);
    const [row] = await getDb()
      .insert(submissions)
      .values({
        formId: definition.id,
        formTitle: definition.title,
        data: values,
        meta: {
          ipHash: hashIp(meta.ip),
          userAgent: meta.userAgent?.slice(0, 400) ?? null,
          pagePath: pathOf(meta.referer),
        },
        createdAt,
      })
      .returning({ id: submissions.id });

    // Side effects: stored row first, so failures below are recorded, not lost.
    let stored: Awaited<ReturnType<typeof storeFiles>> = { files: [], status: "stored" };
    try {
      stored = await storeFiles(row.id, createdAt, files);
      if (stored.files.length)
        await getDb().update(submissions).set({ files: stored.files }).where(eq(submissions.id, row.id));
    } catch (err) {
      logger.error("Failed to store submission files", { id: row.id, err });
      stored = { files: [], status: "failed", error: err instanceof Error ? err.name : "Unknown error" };
    }

    let email: EmailResult = { status: "skipped" };
    const recipients = notifyRecipients(notifyKeyFor(definition, values));
    try {
      email = await sendEmail(recipients, notificationEmail(definition, row.id, values, stored.files), {
        replyTo: firstEmail(definition, values),
      });
    } catch (err) {
      email = { status: "failed", error: err instanceof Error ? err.name : "Unknown error" };
    }

    await recordSubmissionOutcome(row.id, {
      email: { status: email.status, recipients: recipients.length, ...(email.error ? { error: email.error } : {}) },
      ...(stored.files.length
        ? { files: { status: stored.status, ...(stored.error ? { error: stored.error } : {}) } }
        : {}),
    });
    return { id: row.id, stored: true };
  },
};

let override: SubmissionSink | null = null;

/** Swap the sink (tests). By default the database sink is used whenever DATABASE_URL is set. */
export function setSubmissionSink(next: SubmissionSink | null) {
  override = next;
}

export function handleSubmission(
  definition: FormDefinition,
  values: FormValues,
  files: FormFiles,
  meta: SubmissionMeta,
): Promise<SubmissionReceipt> {
  const sink = override ?? (hasDatabase() ? dbSink : logSink);
  return sink.save({ definition, values, files, meta });
}

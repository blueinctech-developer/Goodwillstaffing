import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSubmission, updateStatus } from "@/app/admin/_actions/submissions";
import styles from "@/components/admin/admin.module.css";
import { NotesForm } from "@/components/admin/Forms";
import { ActionButton, StatusBadge } from "@/components/admin/ui";
import { getForm } from "@/forms";
import { fieldLabel, labelledValues } from "@/forms/format";
import { formatBytes } from "@/forms/validate";
import { formatDateTime, getSubmission, setStatus } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Submission" };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  // Opening a new submission marks it read.
  if (submission.status === "new") await setStatus([submission.id], "read");
  const status = submission.status === "new" ? "read" : submission.status;

  const definition = getForm(submission.formId);
  const values = labelledValues(definition, submission.data);
  const meta = submission.meta;
  const legacy = meta.legacy ?? {};

  return (
    <>
      <Link className={styles.crumb} href={`/admin/submissions/?form=${encodeURIComponent(submission.formId)}`}>
        ← {submission.formTitle}
      </Link>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>
          {submission.formTitle} <StatusBadge status={status} />
        </h1>
        <div className={styles.actions}>
          <ActionButton action={updateStatus} fields={{ ids: submission.id, status: "new" }}>
            Mark unread
          </ActionButton>
          {status !== "archived" && (
            <ActionButton action={updateStatus} fields={{ ids: submission.id, status: "archived" }}>
              Archive
            </ActionButton>
          )}
          {status !== "spam" && (
            <ActionButton action={updateStatus} fields={{ ids: submission.id, status: "spam" }}>
              Spam
            </ActionButton>
          )}
          {(status === "archived" || status === "spam") && (
            <ActionButton action={updateStatus} fields={{ ids: submission.id, status: "read" }}>
              Move to inbox
            </ActionButton>
          )}
          <ActionButton
            action={deleteSubmission}
            fields={{ id: submission.id }}
            variant="danger"
            confirm="Delete this submission and its files permanently?"
          >
            Delete
          </ActionButton>
        </div>
      </div>

      <div className={styles.editorGrid}>
        <div className={styles.stack}>
          <div className={styles.card}>
            <dl className={styles.dl}>
              {values.map((v) => (
                <div key={v.name} style={{ display: "contents" }}>
                  <dt>{v.label}</dt>
                  <dd>{v.value || <span className={styles.muted}>—</span>}</dd>
                </div>
              ))}
            </dl>
          </div>

          {submission.files.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.h2}>Files</h2>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {submission.files.map((file, i) => (
                  <li key={`${file.field}-${i}`} style={{ marginBottom: "0.375rem" }}>
                    <span className={styles.muted}>{fieldLabel(definition, file.field)}:</span>{" "}
                    {file.key ? (
                      <a href={`/admin/submissions/${submission.id}/file/?i=${i}`} target="_blank" rel="noopener">
                        {file.name}
                      </a>
                    ) : (
                      <span>
                        {file.name} <span className={styles.fieldError}>(not stored)</span>
                      </span>
                    )}{" "}
                    <span className={styles.muted}>{formatBytes(file.size)}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.hint}>Download links are private and expire after five minutes.</p>
            </div>
          )}
        </div>

        <div className={styles.stack}>
          <div className={styles.card}>
            <NotesForm id={submission.id} notes={submission.notes ?? ""} />
          </div>
          <div className={styles.card}>
            <h2 className={styles.h2}>Details</h2>
            <dl className={styles.dl} style={{ gridTemplateColumns: "7rem 1fr", fontSize: "0.8125rem" }}>
              <dt>Received</dt>
              <dd>{formatDateTime(submission.createdAt)}</dd>
              <dt>Source</dt>
              <dd>
                {submission.source === "legacy_import"
                  ? `Gravity Forms import (entry ${submission.legacyEntryId})`
                  : "Website"}
              </dd>
              {meta.pagePath && (
                <>
                  <dt>Page</dt>
                  <dd>{meta.pagePath}</dd>
                </>
              )}
              {meta.email && (
                <>
                  <dt>Email alert</dt>
                  <dd>
                    {meta.email.status}
                    {meta.email.recipients !== undefined &&
                      ` (${meta.email.recipients} recipient${meta.email.recipients === 1 ? "" : "s"})`}
                    {meta.email.error && ` · ${meta.email.error}`}
                  </dd>
                </>
              )}
              {meta.files && (
                <>
                  <dt>Files</dt>
                  <dd>
                    {meta.files.status}
                    {meta.files.error && ` · ${meta.files.error}`}
                  </dd>
                </>
              )}
              {meta.salesforce && (
                <>
                  <dt>Salesforce</dt>
                  <dd>{meta.salesforce}</dd>
                </>
              )}
              {meta.userAgent && (
                <>
                  <dt>Browser</dt>
                  <dd className={styles.small}>{meta.userAgent}</dd>
                </>
              )}
              {Object.entries(legacy).map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

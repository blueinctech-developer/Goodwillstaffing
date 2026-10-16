import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { StatusBadge } from "@/components/admin/ui";
import { FORMS } from "@/forms";
import { countsByForm, formatDateTime, recentSubmissions, submissionSummary } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";
import { hasS3, hasSes } from "@/lib/env";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminPage();
  const { denied } = await searchParams;
  const [counts, recent] = await Promise.all([countsByForm(), recentSubmissions(8)]);
  const byForm = new Map(counts.map((c) => [c.formId, c]));
  // Known forms first (in site order), then any others found in the data (legacy imports).
  const formIds = [
    ...FORMS.map((f) => f.id),
    ...counts.map((c) => c.formId).filter((id) => !FORMS.some((f) => f.id === id)),
  ];
  const title = (id: string) => FORMS.find((f) => f.id === id)?.title ?? byForm.get(id)?.formTitle ?? id;

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Hello, {admin.name.split(" ")[0]}</h1>
        <div className={styles.actions}>
          <Link className={styles.button} href="/admin/posts/new/">
            New blog post
          </Link>
          <Link className={`${styles.button} ${styles.secondary}`} href="/admin/submissions/">
            All submissions
          </Link>
        </div>
      </div>

      {denied && <p className={styles.error}>Only owners can open that page.</p>}
      {(!hasS3() || !hasSes()) && (
        <p className={styles.notice}>
          {!hasS3() && "S3 isn't configured, so form uploads aren't stored and the media library is unavailable. "}
          {!hasSes() && "SES isn't configured, so notification and password emails aren't sent. "}
          See the README&apos;s &ldquo;Going live&rdquo; checklist.
        </p>
      )}

      <h2 className={styles.h2}>New submissions by form</h2>
      <div className={styles.stats}>
        {formIds.map((id) => (
          <Link key={id} className={styles.stat} href={`/admin/submissions/?form=${encodeURIComponent(id)}`}>
            <span className={styles.statValue}>{byForm.get(id)?.new ?? 0}</span>
            <span className={styles.statLabel}>
              {title(id)} · {byForm.get(id)?.total ?? 0} total
            </span>
          </Link>
        ))}
      </div>

      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <h2 className={styles.h2}>Recent submissions</h2>
        {recent.length === 0 ? (
          <p className={styles.muted}>Nothing yet.</p>
        ) : (
          <table className={styles.table}>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className={s.status === "new" ? styles.unread : undefined}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <Link href={`/admin/submissions/${s.id}/`}>{formatDateTime(s.createdAt)}</Link>
                  </td>
                  <td>{s.formTitle}</td>
                  <td>{submissionSummary(s.data)}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.grid2} style={{ marginTop: "1rem" }}>
        <div className={styles.card}>
          <h2 className={styles.h2}>Content</h2>
          <p className={styles.actions}>
            <Link href="/admin/posts/">Blog posts</Link> · <Link href="/admin/pages/">Pages</Link> ·{" "}
            <Link href="/admin/categories/">Categories</Link> · <Link href="/admin/media/">Media library</Link>
          </p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.h2}>Exports</h2>
          <p className={styles.muted}>
            Filter submissions by form, then use &ldquo;Export CSV&rdquo; on the submissions page.
          </p>
        </div>
      </div>
    </>
  );
}

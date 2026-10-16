import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { SubmissionsTable } from "@/components/admin/Forms";
import { FORMS } from "@/forms";
import {
  filterQuery,
  formatDateTime,
  listSubmissions,
  PAGE_SIZE,
  parseFilters,
  STATUS_VIEWS,
  submissionSummary,
} from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Submissions" };

const VIEW_LABELS: Record<(typeof STATUS_VIEWS)[number], string> = {
  inbox: "Inbox",
  new: "Unread",
  read: "Read",
  archived: "Archived",
  spam: "Spam",
  all: "All",
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const filters = parseFilters(await searchParams);
  const { rows, total } = await listSubmissions(filters);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Submissions</h1>
        <a
          className={`${styles.button} ${styles.secondary}`}
          href={`/admin/submissions/export/${filterQuery({ ...filters, page: 1 })}`}
        >
          Export CSV
        </a>
      </div>

      <nav className={styles.tabs} aria-label="Status">
        {STATUS_VIEWS.map((view) => (
          <Link
            key={view}
            className={styles.tab}
            href={`/admin/submissions/${filterQuery({ ...filters, view, page: 1 })}`}
            aria-current={filters.view === view ? "page" : undefined}
          >
            {VIEW_LABELS[view]}
          </Link>
        ))}
      </nav>

      <form className={styles.filters} method="get">
        {filters.view !== "inbox" && <input type="hidden" name="view" value={filters.view} />}
        <label className={styles.field}>
          <span className={styles.label}>Form</span>
          <select className={styles.select} name="form" defaultValue={filters.form}>
            <option value="">All forms</option>
            {FORMS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.label}>From</span>
          <input className={styles.input} type="date" name="from" defaultValue={filters.from} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>To</span>
          <input className={styles.input} type="date" name="to" defaultValue={filters.to} />
        </label>
        <label className={styles.field} style={{ flex: 1, minWidth: "12rem" }}>
          <span className={styles.label}>Search</span>
          <input
            className={styles.input}
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Name, email, any answer or note"
          />
        </label>
        <button type="submit" className={styles.button}>
          Filter
        </button>
        <Link className={`${styles.button} ${styles.secondary}`} href="/admin/submissions/">
          Reset
        </Link>
      </form>

      {rows.length === 0 ? (
        <p className={styles.card}>No submissions match these filters.</p>
      ) : (
        <SubmissionsTable
          showForm={!filters.form}
          rows={rows.map((r) => ({
            id: r.id,
            formTitle: r.formTitle,
            status: r.status,
            summary: submissionSummary(r.data),
            date: formatDateTime(r.createdAt),
            files: r.files.length,
            legacy: r.source === "legacy_import",
          }))}
        />
      )}

      <div className={styles.pagination}>
        <span className={styles.muted}>
          {total} submission{total === 1 ? "" : "s"} · page {filters.page} of {pages}
        </span>
        <span className={styles.actions}>
          {filters.page > 1 && (
            <Link
              className={`${styles.button} ${styles.secondary} ${styles.sm}`}
              href={`/admin/submissions/${filterQuery({ ...filters, page: filters.page - 1 })}`}
            >
              Previous
            </Link>
          )}
          {filters.page < pages && (
            <Link
              className={`${styles.button} ${styles.secondary} ${styles.sm}`}
              href={`/admin/submissions/${filterQuery({ ...filters, page: filters.page + 1 })}`}
            >
              Next
            </Link>
          )}
        </span>
      </div>
    </>
  );
}

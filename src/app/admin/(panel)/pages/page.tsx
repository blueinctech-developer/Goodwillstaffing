import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { NewPageForm } from "@/components/admin/Forms";
import { StatusBadge } from "@/components/admin/ui";
import { listPagesAdmin } from "@/lib/admin/content";
import { formatDateTime } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 200) : "";
  const pages = await listPagesAdmin(query);

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Pages</h1>
      </div>
      <p className={styles.muted} style={{ marginTop: "-0.5rem" }}>
        The home page and About Us have their own layouts in code; the pages here use the hero + blocks layout.
      </p>
      <form className={styles.filters} method="get">
        <label className={styles.field} style={{ flex: 1, maxWidth: "24rem" }}>
          <span className={styles.label}>Search</span>
          <input className={styles.input} type="search" name="q" defaultValue={query} placeholder="Title or address" />
        </label>
        <button className={`${styles.button} ${styles.secondary}`} type="submit">
          Search
        </button>
      </form>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Last edit</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}>
                <td>
                  <Link href={`/admin/pages/${p.slug}/`}>{p.title}</Link>
                  <div className={`${styles.muted} ${styles.small}`}>/{p.slug}/</div>
                </td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className={styles.small}>
                  {formatDateTime(p.updatedAt)}
                  {p.updatedBy && <div className={styles.muted}>{p.updatedBy}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <h2 className={styles.h2}>New page</h2>
        <NewPageForm />
      </div>
    </>
  );
}

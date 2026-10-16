import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { StatusBadge } from "@/components/admin/ui";
import { listCategoriesAdmin, listPostsAdmin } from "@/lib/admin/content";
import { formatDateTime } from "@/lib/admin/submissions";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Blog posts" };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const { q, deleted } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 200) : "";
  const [posts, categories] = await Promise.all([listPostsAdmin(query), listCategoriesAdmin()]);
  const names = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Blog posts</h1>
        <Link className={styles.button} href="/admin/posts/new/">
          New post
        </Link>
      </div>
      {deleted && <p className={styles.success}>Post deleted.</p>}
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
              <th>Categories</th>
              <th>Date</th>
              <th>Status</th>
              <th>Last edit</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td>
                  <Link href={`/admin/posts/${p.slug}/`}>{p.title}</Link>
                  <div className={`${styles.muted} ${styles.small}`}>/{p.slug}/</div>
                </td>
                <td className={styles.small}>{p.categories.map((c) => names.get(c) ?? c).join(", ")}</td>
                <td className={styles.small} style={{ whiteSpace: "nowrap" }}>
                  {p.date.toISOString().slice(0, 10)}
                </td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className={styles.small}>
                  {formatDateTime(p.modified)}
                  {p.updatedBy && <div className={styles.muted}>{p.updatedBy}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {posts.length === 0 && <p className={styles.muted}>No posts found.</p>}
    </>
  );
}

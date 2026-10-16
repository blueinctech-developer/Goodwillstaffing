import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/admin.module.css";
import { PostEditor } from "@/components/admin/PostEditor";
import { StatusBadge } from "@/components/admin/ui";
import { getPostAdmin, listCategoriesAdmin } from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const [{ slug }, { saved }] = await Promise.all([params, searchParams]);
  const [found, categories] = await Promise.all([getPostAdmin(decodeURIComponent(slug)), listCategoriesAdmin()]);
  if (!found) notFound();

  return (
    <>
      <Link className={styles.crumb} href="/admin/posts/">
        ← Blog posts
      </Link>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>
          {found.post.title} <StatusBadge status={found.status} />
        </h1>
      </div>
      {/* Keyed so a rename (new URL) remounts the editor with fresh state. */}
      <PostEditor
        key={found.post.slug}
        post={found.post}
        status={found.status}
        categories={categories}
        saved={Boolean(saved)}
      />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { PostEditor } from "@/components/admin/PostEditor";
import { listCategoriesAdmin } from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireAdminPage();
  const categories = await listCategoriesAdmin();
  return (
    <>
      <Link className={styles.crumb} href="/admin/posts/">
        ← Blog posts
      </Link>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>New post</h1>
      </div>
      <PostEditor categories={categories} />
    </>
  );
}

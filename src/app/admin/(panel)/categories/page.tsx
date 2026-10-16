import type { Metadata } from "next";
import styles from "@/components/admin/admin.module.css";
import { CategoryForm, DeleteCategoryButton } from "@/components/admin/Forms";
import { listCategoriesAdmin, listPostsAdmin } from "@/lib/admin/content";
import { requireAdminPage } from "@/lib/auth/admin";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdminPage();
  const [categories, posts] = await Promise.all([listCategoriesAdmin(), listPostsAdmin()]);
  const counts = new Map<string, number>();
  for (const p of posts) for (const c of p.categories) counts.set(c, (counts.get(c) ?? 0) + 1);

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Categories</h1>
      </div>
      <div className={styles.card}>
        <h2 className={styles.h2}>Add a category</h2>
        <CategoryForm />
      </div>
      {categories.map((c) => (
        <div key={c.slug} className={styles.card}>
          <div className={styles.pageHead} style={{ marginBottom: "0.5rem" }}>
            <strong>
              {c.name}{" "}
              <span className={styles.muted}>
                · /category/{c.slug}/ · {counts.get(c.slug) ?? 0} post{counts.get(c.slug) === 1 ? "" : "s"}
              </span>
            </strong>
            <DeleteCategoryButton slug={c.slug} name={c.name} />
          </div>
          <CategoryForm category={c} />
        </div>
      ))}
    </>
  );
}

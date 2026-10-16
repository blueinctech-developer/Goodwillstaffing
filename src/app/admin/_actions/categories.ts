"use server";

import { eq, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { categories, posts } from "@/db/schema";
import { adminAction, invalid } from "@/lib/admin/action";
import { SLUG_RE, slugify } from "@/lib/admin/slugs";
import type { ActionState } from "@/lib/admin/types";
import { plainText } from "@/lib/sanitize";

// Blog categories (/category/<slug>/). Renaming a slug or deleting a category
// also updates the posts that use it.

const categorySchema = z.object({
  name: z.string().trim().min(1, { error: "Enter a name" }).max(100),
  slug: z.string().trim().max(100),
  description: z.string().max(1000).transform(plainText),
});

export async function saveCategory(
  originalSlug: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return adminAction(async () => {
    const parsed = categorySchema.safeParse({
      name: formData.get("name") ?? "",
      slug: formData.get("slug") ?? "",
      description: formData.get("description") ?? "",
    });
    if (!parsed.success) return invalid(parsed.error);
    const slug = parsed.data.slug ? parsed.data.slug.toLowerCase() : slugify(parsed.data.name);
    if (!SLUG_RE.test(slug))
      return { status: "error", message: "Use lower-case letters, numbers and dashes.", errors: { slug: "Invalid" } };

    const db = getDb();
    const [clash] = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, slug));
    if (clash && clash.slug !== originalSlug)
      return { status: "error", message: "Another category uses this slug.", errors: { slug: "Taken" } };

    const values = { slug, name: parsed.data.name, description: parsed.data.description };
    if (originalSlug) {
      await db.transaction(async (tx) => {
        await tx.update(categories).set(values).where(eq(categories.slug, originalSlug));
        if (slug !== originalSlug) {
          await tx
            .update(posts)
            .set({ categories: sql`array_replace(${posts.categories}, ${originalSlug}, ${slug})` })
            .where(sql`${originalSlug} = any(${posts.categories})`);
        }
      });
      if (slug !== originalSlug) updateTag("posts");
    } else {
      await db.insert(categories).values(values);
    }
    updateTag("categories");
    refresh();
    return { status: "ok", message: originalSlug ? "Category saved." : "Category added." };
  });
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async () => {
    const slug = String(formData.get("slug") ?? "");
    await getDb().transaction(async (tx) => {
      await tx.delete(categories).where(eq(categories.slug, slug));
      await tx
        .update(posts)
        .set({ categories: sql`array_remove(${posts.categories}, ${slug})` })
        .where(sql`${slug} = any(${posts.categories})`);
    });
    updateTag("categories");
    updateTag("posts");
    refresh();
    return { status: "ok", message: "Category deleted." };
  });
}

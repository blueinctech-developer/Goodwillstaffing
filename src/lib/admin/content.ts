import "server-only";
import { asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { admins, categories, pages, posts } from "@/db/schema";
import { pageFromRow, postFromRow } from "@/lib/content";

// Uncached reads for the admin, drafts included. The public site only ever
// uses the cached, published-only readers in src/lib/content.ts.

const like = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function listPagesAdmin(q = "") {
  return getDb()
    .select({
      slug: pages.slug,
      title: pages.title,
      status: pages.status,
      updatedAt: pages.updatedAt,
      updatedBy: admins.name,
    })
    .from(pages)
    .leftJoin(admins, eq(admins.id, pages.updatedBy))
    .where(q ? or(ilike(pages.title, like(q)), ilike(pages.slug, like(q))) : undefined)
    .orderBy(asc(pages.title));
}

export async function getPageAdmin(slug: string) {
  const [row] = await getDb().select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return row ? { page: pageFromRow(row), status: row.status, updatedAt: row.updatedAt } : null;
}

export async function listPostsAdmin(q = "") {
  return getDb()
    .select({
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      date: posts.date,
      modified: posts.modified,
      categories: posts.categories,
      updatedBy: admins.name,
    })
    .from(posts)
    .leftJoin(admins, eq(admins.id, posts.updatedBy))
    .where(q ? or(ilike(posts.title, like(q)), ilike(posts.slug, like(q))) : undefined)
    .orderBy(desc(posts.date));
}

export async function getPostAdmin(slug: string) {
  const [row] = await getDb().select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return row ? { post: postFromRow(row), status: row.status } : null;
}

export async function listCategoriesAdmin() {
  return getDb().select().from(categories).orderBy(asc(categories.name));
}

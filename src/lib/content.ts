import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getDb } from "@/db";
import * as db from "@/db/schema";
import { hasDatabase } from "./env";

// Content imported from goodwillstaffing.ca by scripts/import-wordpress.mjs.
// With DATABASE_URL set these readers serve the admin-edited content from
// Neon (published rows only, so drafts never reach the public site); without
// it they read the JSON files in src/content. Same names, types and cache
// tags either way, so public components don't care which source is live.

export type Image = { src: string; alt?: string; width?: number; height?: number };
export type Cta = { text: string; href: string };

export type Card = { title: string; text: string; href?: string; cta?: string; image?: Image };
export type FaqItem = { question: string; answer: string };

export type Block =
  | { type: "heading"; level: number; text: string; href?: string }
  | { type: "rich"; html: string }
  | { type: "image"; src: string; alt: string; width?: number; height?: number; href?: string }
  | { type: "buttons"; items: Cta[] }
  | { type: "cards"; items: Card[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "list"; items: { text: string; href?: string }[] }
  | { type: "faq"; items: FaqItem[] }
  | { type: "video"; src?: string; youtubeId?: string }
  | { type: "gallery"; images: Image[] }
  | { type: "form"; formId: number | string }
  | { type: "reviews" }
  | { type: "posts" }
  | { type: "custom"; component: string };

export type HeroLayout = "cover" | "split" | "plain";

export type Seo = { title: string; description: string; image?: Image; noindex?: boolean };

export type Page = {
  slug: string;
  title: string;
  modified: string;
  seo: Seo;
  hero: {
    /** cover: photo behind centred text; split: copy beside the photo; plain: teal band. */
    layout: HeroLayout;
    title: string;
    eyebrow?: string;
    subtitle?: string;
    image?: Image;
    ctas: Cta[];
    breadcrumbs?: { text: string; href?: string }[];
  };
  blocks: Block[];
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  modified: string;
  excerpt: string;
  categories: string[];
  featuredImage?: Image;
  seo: Seo;
  html: string;
};

export type Category = { slug: string; name: string; description: string };

const ROOT = path.join(process.cwd(), "src/content");

async function readJson<T>(rel: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8")) as T;
  } catch {
    return null;
  }
}

async function listSlugs(dir: string): Promise<string[]> {
  const files = await fs.readdir(path.join(ROOT, dir));
  return files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
}

/** "2024-03-01T12:00:00" (UTC, no zone), the format the WordPress import uses. */
export function toContentDate(date: Date): string {
  return date.toISOString().slice(0, 19);
}

export function pageFromRow(row: typeof db.pages.$inferSelect): Page {
  return {
    slug: row.slug,
    title: row.title,
    modified: toContentDate(row.updatedAt),
    seo: row.seo as Seo,
    hero: row.hero as Page["hero"],
    blocks: row.blocks as Block[],
  };
}

export function postFromRow(row: typeof db.posts.$inferSelect): Post {
  return {
    slug: row.slug,
    title: row.title,
    date: toContentDate(row.date),
    modified: toContentDate(row.modified),
    excerpt: row.excerpt,
    categories: row.categories,
    ...(row.featuredImage ? { featuredImage: row.featuredImage as Image } : {}),
    seo: row.seo as Seo,
    html: row.html,
  };
}

// Cached per entry and tagged so admin edits can revalidate just what changed.
export async function getPage(slug: string) {
  "use cache";
  cacheTag("pages", `page:${slug}`);
  if (!hasDatabase()) return readJson<Page>(`pages/${slug}.json`);
  const [row] = await getDb()
    .select()
    .from(db.pages)
    .where(and(eq(db.pages.slug, slug), eq(db.pages.status, "published")))
    .limit(1);
  return row ? pageFromRow(row) : null;
}

export async function getPost(slug: string) {
  "use cache";
  cacheTag("posts", `post:${slug}`);
  if (!hasDatabase()) return readJson<Post>(`posts/${slug}.json`);
  const [row] = await getDb()
    .select()
    .from(db.posts)
    .where(and(eq(db.posts.slug, slug), eq(db.posts.status, "published")))
    .limit(1);
  return row ? postFromRow(row) : null;
}

export async function listPageSlugs() {
  "use cache";
  cacheTag("pages");
  if (!hasDatabase()) return listSlugs("pages");
  const rows = await getDb().select({ slug: db.pages.slug }).from(db.pages).where(eq(db.pages.status, "published"));
  return rows.map((r) => r.slug);
}

export async function listPosts(): Promise<Post[]> {
  "use cache";
  cacheTag("posts");
  if (hasDatabase()) {
    const rows = await getDb().select().from(db.posts).where(eq(db.posts.status, "published")).orderBy(desc(db.posts.date));
    return rows.map(postFromRow);
  }
  const posts = await Promise.all((await listSlugs("posts")).map((s) => getPost(s)));
  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function listCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");
  if (hasDatabase()) {
    return getDb().select().from(db.categories).orderBy(db.categories.name);
  }
  return (await readJson<Category[]>("categories.json")) ?? [];
}

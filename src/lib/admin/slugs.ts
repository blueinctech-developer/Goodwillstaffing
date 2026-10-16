import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, posts } from "@/db/schema";

// Pages and posts share the root URL namespace (/<slug>/), as on WordPress,
// so a slug must be unique across both tables and avoid app routes and the
// redirects in next.config.ts.

const RESERVED = new Set([
  "admin",
  "blog",
  "category",
  "about",
  "media",
  "api",
  "feed",
  "wp-admin",
  "wp-content",
  "wp-login.php",
  "sitemap.xml",
  "robots.txt",
  "goodwill-blog",
  "employer-blog",
  "client-solutions",
  "faq",
  "nunavut",
  "northwest-territories",
  "yukon",
  "smart-apply",
  "ai-recruiter",
  "chatbot-page",
  "wpwbot-mobile-app",
]);

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip accents left by NFKD
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Returns an error message when `slug` can't be used, else null. */
export async function slugProblem(
  slug: string,
  current?: { type: "page" | "post"; slug: string },
): Promise<string | null> {
  if (!SLUG_RE.test(slug)) return "Use lower-case letters, numbers and single dashes.";
  if (RESERVED.has(slug)) return "This address is reserved by the site.";
  const db = getDb();
  const [page] = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(current?.type === "page" ? and(eq(pages.slug, slug), ne(pages.slug, current.slug)) : eq(pages.slug, slug))
    .limit(1);
  if (page) return "A page already uses this address.";
  const [post] = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(current?.type === "post" ? and(eq(posts.slug, slug), ne(posts.slug, current.slug)) : eq(posts.slug, slug))
    .limit(1);
  if (post) return "A post already uses this address.";
  return null;
}

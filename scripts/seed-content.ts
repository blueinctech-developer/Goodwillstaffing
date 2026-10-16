// Loads the imported WordPress content (src/content/**/*.json) into Neon.
// Idempotent: rows are upserted by slug, so it can be re-run after a fresh
// import. By default rows already edited in the admin (updated_by set) are
// left alone; pass --force to overwrite them too.
//
//   npm run db:seed
//   npm run db:seed -- --force

import fs from "node:fs";
import path from "node:path";
import { isNull, sql } from "drizzle-orm";
import { connect, schema } from "./lib/db";

const ROOT = path.join(process.cwd(), "src/content");
const force = process.argv.includes("--force");

const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, "utf8")) as T;
const listJson = (dir: string) =>
  fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(ROOT, dir, f));

/** Content dates are UTC without a zone ("2024-03-01T12:00:00"). */
const toDate = (value: string | undefined) =>
  value ? new Date(/Z|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`) : new Date();

type PageJson = { slug: string; title: string; modified?: string; seo: object; hero: object; blocks: object[] };
type PostJson = {
  slug: string;
  title: string;
  date: string;
  modified?: string;
  excerpt?: string;
  categories?: string[];
  featuredImage?: object;
  seo: object;
  html?: string;
};
type CategoryJson = { slug: string; name: string; description?: string };

/** On conflict: overwrite, unless an admin has edited the row (and not --force). */
const onlyUnedited = (table: typeof schema.pages | typeof schema.posts) =>
  force ? undefined : isNull(table.updatedBy);

async function main() {
  const { db, close } = connect();
  try {
    const categories = readJson<CategoryJson[]>(path.join(ROOT, "categories.json"));
    for (const c of categories) {
      await db
        .insert(schema.categories)
        .values({ slug: c.slug, name: c.name, description: c.description ?? "" })
        .onConflictDoUpdate({
          target: schema.categories.slug,
          set: { name: sql`excluded.name`, description: sql`excluded.description` },
        });
    }
    console.log(`categories: ${categories.length}`);

    const pages = listJson("pages").map((f) => readJson<PageJson>(f));
    for (const p of pages) {
      await db
        .insert(schema.pages)
        .values({
          slug: p.slug,
          title: p.title,
          seo: p.seo as Record<string, unknown>,
          hero: p.hero as Record<string, unknown>,
          blocks: p.blocks as Record<string, unknown>[],
          status: "published",
          updatedAt: toDate(p.modified),
        })
        .onConflictDoUpdate({
          target: schema.pages.slug,
          set: {
            title: sql`excluded.title`,
            seo: sql`excluded.seo`,
            hero: sql`excluded.hero`,
            blocks: sql`excluded.blocks`,
            updatedAt: sql`excluded.updated_at`,
          },
          setWhere: onlyUnedited(schema.pages),
        });
    }
    console.log(`pages: ${pages.length}`);

    const posts = listJson("posts").map((f) => readJson<PostJson>(f));
    for (const p of posts) {
      await db
        .insert(schema.posts)
        .values({
          slug: p.slug,
          title: p.title,
          date: toDate(p.date),
          modified: toDate(p.modified ?? p.date),
          excerpt: p.excerpt ?? "",
          categories: p.categories ?? [],
          featuredImage: (p.featuredImage as Record<string, unknown> | undefined) ?? null,
          seo: p.seo as Record<string, unknown>,
          html: p.html ?? "",
          status: "published",
        })
        .onConflictDoUpdate({
          target: schema.posts.slug,
          set: {
            title: sql`excluded.title`,
            date: sql`excluded.date`,
            modified: sql`excluded.modified`,
            excerpt: sql`excluded.excerpt`,
            categories: sql`excluded.categories`,
            featuredImage: sql`excluded.featured_image`,
            seo: sql`excluded.seo`,
            html: sql`excluded.html`,
          },
          setWhere: onlyUnedited(schema.posts),
        });
    }
    console.log(`posts: ${posts.length}`);
    console.log(
      force
        ? "Done (admin edits overwritten)."
        : "Done. Rows edited in the admin were kept (use --force to overwrite).",
    );
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

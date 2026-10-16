import type { MetadataRoute } from "next";
import { listCategories, listPageSlugs, listPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Replaces Yoast's sitemap_index.xml.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts, categories] = await Promise.all([listPageSlugs(), listPosts(), listCategories()]);
  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/about-us/"), changeFrequency: "monthly" },
    { url: url("/blog/"), changeFrequency: "weekly" },
    { url: url("/smart-apply/"), changeFrequency: "monthly" },
    { url: url("/ai-recruiter/"), changeFrequency: "monthly" },
    ...pages.filter((slug) => slug !== "about-us").map((slug) => ({ url: url(`/${slug}/`), changeFrequency: "monthly" as const })),
    ...categories.map((c) => ({ url: url(`/category/${c.slug}/`), changeFrequency: "weekly" as const })),
    ...posts.map((p) => ({ url: url(`/${p.slug}/`), lastModified: `${p.modified}Z` })),
  ];
}

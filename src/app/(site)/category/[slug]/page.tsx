import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/content/BlogIndex";
import { listCategories, listPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

// Keeps WordPress's /category/<slug>/ archive URLs.

const SUBTITLES: Record<string, string> = {
  "goodwill-blog": "Guides and advice for nurses and healthcare professionals building their careers in Canada.",
  "employer-blog": "Staffing insights for hospitals, clinics and care homes facing workforce challenges.",
};

export async function generateStaticParams() {
  return (await listCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await listCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return pageMetadata({
    title: `${category.name} | Goodwill Staffing & Recruitment`,
    description: SUBTITLES[slug] ?? `Articles about ${category.name.toLowerCase()} from Goodwill Staffing & Recruitment.`,
    path: `/category/${slug}/`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([listPosts(), listCategories()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <BlogIndex
      title={category.name}
      subtitle={SUBTITLES[slug] ?? `Articles about ${category.name.toLowerCase()}.`}
      posts={posts.filter((p) => p.categories.includes(slug))}
      categories={categories}
      active={slug}
    />
  );
}

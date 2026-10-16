import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/content/Blocks";
import { ClosingCta } from "@/components/content/ClosingCta";
import { PageHero } from "@/components/content/PageHero";
import { PostView } from "@/components/content/PostView";
import { getPage, getPost, listPageSlugs, listPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

// WordPress served pages and posts from the same root namespace
// (/staffing-solutions-ontario/, /become-a-travel-nurse/), so this one route
// resolves both and every existing URL keeps working.

// Pages whose content forms its own call to action, or that have a dedicated route.
const NO_CLOSING_CTA = new Set(["contact-us", "apply-now", "request-staffing", "careers", "privacy-policy", "terms-and-conditions", "cookie-policy"]);

// Imported pages that a dedicated route renders instead.
const OWN_ROUTE = new Set(["about-us", "smart-apply", "ai-recruiter", "travel-nurse-in-canada"]);

export async function generateStaticParams() {
  const [pages, posts] = await Promise.all([listPageSlugs(), listPosts()]);
  return [...pages.filter((slug) => !OWN_ROUTE.has(slug)), ...posts.map((p) => p.slug)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  const entry = page ?? (await getPost(slug));
  if (!entry) return {};
  return pageMetadata({
    title: entry.seo.title,
    description: entry.seo.description,
    path: `/${slug}/`,
    image: entry.seo.image?.src,
    type: page ? "website" : "article",
    noindex: entry.seo.noindex,
  });
}

export default async function ContentPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;

  const page = await getPage(slug);
  if (page) {
    return (
      <>
        <PageHero hero={page.hero} />
        <Blocks blocks={page.blocks} />
        {!NO_CLOSING_CTA.has(slug) && <ClosingCta />}
      </>
    );
  }

  const post = await getPost(slug);
  if (post) return <PostView post={post} />;

  notFound();
}

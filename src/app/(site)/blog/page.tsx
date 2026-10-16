import { BlogIndex } from "@/components/content/BlogIndex";
import { listCategories, listPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Goodwill Staffing Blog | Healthcare Careers & Staffing Insights",
  description:
    "Travel nursing guides, healthcare career advice and staffing insights for Canadian healthcare professionals and employers from Goodwill Staffing & Recruitment.",
  path: "/blog/",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([listPosts(), listCategories()]);
  return (
    <BlogIndex
      title="The Goodwill Blog"
      subtitle="Travel nursing guides, career advice and staffing insights for healthcare professionals and employers across Canada."
      posts={posts}
      categories={categories}
    />
  );
}

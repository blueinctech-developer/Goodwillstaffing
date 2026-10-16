import Link from "next/link";
import { listCategories, listPosts, type Post } from "@/lib/content";
import { mediaUrl, rewriteMediaInHtml } from "@/lib/media";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ClosingCta } from "./ClosingCta";
import { formatDate, PostGrid } from "./PostCard";
import blockStyles from "./Blocks.module.css";
import styles from "./PostView.module.css";

export async function PostView({ post }: { post: Post }) {
  const [categories, posts] = await Promise.all([listCategories(), listPosts()]);
  const names = new Map(categories.map((c) => [c.slug, c.name]));
  const related = posts
    .filter((p) => p.slug !== post.slug && p.categories.some((c) => post.categories.includes(c)))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: `${post.date}Z`,
    dateModified: `${post.modified}Z`,
    image: post.featuredImage ? [new URL(mediaUrl(post.featuredImage.src), SITE_URL).href] : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${post.slug}/`,
  };

  return (
    <>
      <article>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href="/blog/">Blog</Link>
              {post.categories.slice(0, 2).map((c) => (
                <Link key={c} href={`/category/${c}/`}>
                  {names.get(c) ?? c}
                </Link>
              ))}
            </nav>
            <h1 className={styles.title}>{post.title}</h1>
            <time dateTime={post.date} className={styles.date}>
              {formatDate(post.date)}
            </time>
          </div>
        </header>
        <div className={styles.body}>
          {post.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element -- imported WordPress media of unknown size
            <img
              src={mediaUrl(post.featuredImage.src)}
              alt={post.featuredImage.alt ?? ""}
              width={post.featuredImage.width}
              height={post.featuredImage.height}
              className={styles.featured}
              fetchPriority="high"
            />
          )}
          <div className={blockStyles.prose} dangerouslySetInnerHTML={{ __html: rewriteMediaInHtml(post.html) }} />
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </article>
      {related.length > 0 && (
        <section className={styles.related}>
          <div className={styles.relatedInner}>
            <h2 className={blockStyles.h2}>Keep reading</h2>
            <PostGrid posts={related} />
          </div>
        </section>
      )}
      <ClosingCta />
    </>
  );
}

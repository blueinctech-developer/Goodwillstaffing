import Link from "next/link";
import type { Post } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import styles from "./PostCard.module.css";

export const formatDate = (iso: string) =>
  new Date(`${iso}Z`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export function PostCard({ post }: { post: Post }) {
  return (
    <article className={styles.card}>
      <Link href={`/${post.slug}/`} className={`${styles.link} focus-ring`}>
        <div className={styles.thumb}>
          {post.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element -- imported WordPress media of unknown size
            <img src={mediaUrl(post.featuredImage.src)} alt="" loading="lazy" />
          )}
        </div>
        <div className={styles.body}>
          <time dateTime={post.date} className={styles.date}>
            {formatDate(post.date)}
          </time>
          <h3 className={styles.title}>{post.title}</h3>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

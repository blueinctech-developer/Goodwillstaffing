import Link from "next/link";
import type { Category, Post } from "@/lib/content";
import { ClosingCta } from "./ClosingCta";
import { PageHero } from "./PageHero";
import { PostGrid } from "./PostCard";
import styles from "./BlogIndex.module.css";

type Props = {
  title: string;
  subtitle: string;
  posts: Post[];
  categories: Category[];
  /** Slug of the category being shown; undefined on /blog/. */
  active?: string;
};

export function BlogIndex({ title, subtitle, posts, categories, active }: Props) {
  return (
    <>
      <PageHero hero={{ layout: "plain", title, subtitle, ctas: [] }} />
      <section className={styles.section}>
        <div className={styles.inner}>
          <nav aria-label="Blog categories">
            <ul className={styles.filters}>
              <li>
                <Link href="/blog/" className={styles.filter} aria-current={active ? undefined : "page"}>
                  All articles
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}/`}
                    className={styles.filter}
                    aria-current={active === c.slug ? "page" : undefined}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <PostGrid posts={posts} />
        </div>
      </section>
      <ClosingCta />
    </>
  );
}

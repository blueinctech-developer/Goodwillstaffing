"use client";

import { useActionState, useState } from "react";
import { deletePost, savePost } from "@/app/admin/_actions/posts";
import { IDLE } from "@/lib/admin/types";
import type { Category, Post } from "@/lib/content";
import styles from "./admin.module.css";
import { ImageField, type ImageValue } from "./Media";
import { RichTextEditor } from "./RichTextEditor";
import { ActionButton, ActionMessage, FieldError, SubmitButton, cx } from "./ui";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip accents left by NFKD
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function PostEditor({
  post,
  status,
  categories,
  saved,
}: {
  /** Undefined for a new post. */
  post?: Post;
  status?: "published" | "draft";
  categories: Category[];
  saved?: boolean;
}) {
  const originalSlug = post?.slug ?? null;
  const [state, formAction] = useActionState(savePost.bind(null, originalSlug), IDLE);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [html, setHtml] = useState(post?.html ?? "");
  const [image, setImage] = useState<ImageValue | undefined>(post?.featuredImage);
  const effectiveSlug = slugTouched ? slug : slugify(title);

  return (
    <>
      <form action={formAction}>
        {saved && state.status === "idle" && <p className={styles.success}>Saved.</p>}
        <ActionMessage state={state} />
        <div className={styles.editorGrid}>
          <div className={styles.card}>
            <label className={styles.field}>
              <span className={styles.label}>Title</span>
              <input
                className={styles.input}
                name="title"
                required
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <FieldError state={state} name="title" />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Address</span>
              <div className={styles.inline}>
                <span className={styles.muted}>goodwillstaffing.ca/</span>
                <input
                  className={styles.input}
                  style={{ flex: 1, minWidth: "12rem" }}
                  name="slug"
                  maxLength={100}
                  value={effectiveSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase());
                  }}
                  aria-invalid={state.status === "error" && Boolean(state.errors?.slug)}
                />
                <span className={styles.muted}>/</span>
              </div>
              {post && effectiveSlug !== post.slug && (
                <span className={styles.hint}>
                  Changing the address breaks existing links; add a redirect in next.config.ts if the post was shared.
                </span>
              )}
              <FieldError state={state} name="slug" />
            </label>
            <div className={styles.field}>
              <span className={styles.label}>Body</span>
              <RichTextEditor value={post?.html ?? ""} onChange={setHtml} tall label="Post body" />
              <input type="hidden" name="html" value={html} />
            </div>
            <label className={styles.field}>
              <span className={styles.label}>Excerpt</span>
              <textarea
                className={styles.textarea}
                name="excerpt"
                maxLength={2000}
                defaultValue={post?.excerpt ?? ""}
              />
              <span className={styles.hint}>Shown on blog cards. Plain text.</span>
            </label>
          </div>

          <div className={cx(styles.stack, styles.sticky)}>
            <div className={styles.card}>
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select className={styles.select} name="status" defaultValue={status ?? "draft"}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Publish date</span>
                <input
                  className={styles.input}
                  type="datetime-local"
                  name="date"
                  required
                  defaultValue={(post?.date ?? new Date().toISOString()).slice(0, 16)}
                />
                <span className={styles.hint}>UTC, like the imported posts.</span>
              </label>
              <div className={styles.actions}>
                <SubmitButton>Save</SubmitButton>
                {post && status === "published" && (
                  <a
                    className={cx(styles.button, styles.secondary)}
                    href={`/${post.slug}/`}
                    target="_blank"
                    rel="noopener"
                  >
                    View
                  </a>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <span className={styles.label}>Categories</span>
              <div className={styles.checks} style={{ marginTop: "0.375rem" }}>
                {categories.map((c) => (
                  <label key={c.slug} className={styles.check}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={c.slug}
                      defaultChecked={post?.categories.includes(c.slug)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <ImageField label="Featured image" value={image} onChange={setImage} />
              <input type="hidden" name="featuredSrc" value={image?.src ?? ""} />
              <input type="hidden" name="featuredAlt" value={image?.alt ?? ""} />
              <input type="hidden" name="featuredWidth" value={image?.width ?? ""} />
              <input type="hidden" name="featuredHeight" value={image?.height ?? ""} />
            </div>

            <div className={styles.card}>
              <label className={styles.field}>
                <span className={styles.label}>SEO title</span>
                <input
                  className={styles.input}
                  name="seoTitle"
                  maxLength={200}
                  defaultValue={post?.seo.title ?? ""}
                  placeholder={title}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>SEO description</span>
                <textarea
                  className={styles.textarea}
                  name="seoDescription"
                  maxLength={500}
                  defaultValue={post?.seo.description ?? ""}
                />
                <span className={styles.hint}>About 150 characters. Defaults to the excerpt.</span>
              </label>
            </div>
          </div>
        </div>
      </form>
      {post && (
        <div className={styles.card} style={{ marginTop: "1rem" }}>
          <ActionButton
            action={deletePost}
            fields={{ slug: post.slug }}
            variant="danger"
            confirm={`Delete "${post.title}" permanently? Its URL will stop working.`}
          >
            Delete post
          </ActionButton>
        </div>
      )}
    </>
  );
}

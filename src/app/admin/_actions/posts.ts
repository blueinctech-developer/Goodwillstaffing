"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { adminAction, invalid } from "@/lib/admin/action";
import { imageSchema } from "@/lib/admin/content-schema";
import { slugProblem, slugify } from "@/lib/admin/slugs";
import type { ActionState } from "@/lib/admin/types";
import { plainText, sanitizeRichHtml } from "@/lib/sanitize";

// Blog post create/update/delete. Saving refreshes the cached public readers
// with updateTag (read-your-own-writes): "posts" for lists and related posts,
// "post:<slug>" for the post itself (old and new slug when renamed).

const postSchema = z.object({
  title: z.string().trim().min(1, { error: "Give the post a title" }).max(300),
  slug: z.string().trim().max(100),
  status: z.enum(["published", "draft"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, { error: "Choose a publish date" })
    .transform((v) => new Date(`${v.slice(0, 16)}:00Z`)),
  excerpt: z.string().max(2000).transform(plainText),
  categories: z.array(z.string().max(100)).max(20),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().max(500).transform(plainText),
  featuredSrc: z.string().trim().max(500),
  featuredAlt: z.string().trim().max(300),
  featuredWidth: z.string().optional(),
  featuredHeight: z.string().optional(),
  html: z.string().max(500_000).transform(sanitizeRichHtml),
});

function readForm(formData: FormData) {
  const get = (k: string) => (formData.get(k) ?? "") as string;
  return {
    title: get("title"),
    slug: get("slug"),
    status: get("status"),
    date: get("date"),
    excerpt: get("excerpt"),
    categories: formData.getAll("categories").map(String),
    seoTitle: get("seoTitle"),
    seoDescription: get("seoDescription"),
    featuredSrc: get("featuredSrc"),
    featuredAlt: get("featuredAlt"),
    featuredWidth: get("featuredWidth"),
    featuredHeight: get("featuredHeight"),
    html: get("html"),
  };
}

/** Create (originalSlug null) or update a post. */
export async function savePost(
  originalSlug: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let destination: string | null = null;
  const result = await adminAction(async (admin) => {
    const parsed = postSchema.safeParse(readForm(formData));
    if (!parsed.success) return invalid(parsed.error);
    const input = parsed.data;

    const slug = input.slug ? input.slug.toLowerCase() : slugify(input.title);
    const problem = await slugProblem(slug, originalSlug ? { type: "post", slug: originalSlug } : undefined);
    if (problem) return { status: "error", message: problem, errors: { slug: problem } };

    let featuredImage: z.infer<typeof imageSchema> | null = null;
    if (input.featuredSrc) {
      const image = imageSchema.safeParse({
        src: input.featuredSrc,
        alt: input.featuredAlt,
        width: input.featuredWidth,
        height: input.featuredHeight,
      });
      if (!image.success)
        return {
          status: "error",
          message: "The featured image URL isn't valid.",
          errors: { featuredSrc: "Invalid image" },
        };
      featuredImage = image.data;
    }

    const values = {
      slug,
      title: input.title,
      status: input.status,
      date: input.date,
      modified: new Date(),
      excerpt: input.excerpt,
      categories: input.categories,
      featuredImage,
      seo: {
        title: input.seoTitle || input.title,
        description: input.seoDescription || input.excerpt.slice(0, 160),
        ...(featuredImage ? { image: featuredImage } : {}),
      },
      html: input.html,
      updatedBy: admin.id,
    };

    if (originalSlug) {
      const updated = await getDb()
        .update(posts)
        .set(values)
        .where(eq(posts.slug, originalSlug))
        .returning({ slug: posts.slug });
      if (updated.length === 0) return { status: "error", message: "This post no longer exists." };
      updateTag(`post:${originalSlug}`);
    } else {
      await getDb().insert(posts).values(values);
    }
    updateTag("posts");
    updateTag(`post:${slug}`);

    if (slug !== originalSlug) destination = `/admin/posts/${slug}/?saved=1`;
    return { status: "ok", message: input.status === "published" ? "Saved and published." : "Saved as draft." };
  });
  if (destination) redirect(destination);
  return result;
}

export async function deletePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await adminAction(async () => {
    const slug = String(formData.get("slug") ?? "");
    const deleted = await getDb().delete(posts).where(eq(posts.slug, slug)).returning({ slug: posts.slug });
    if (deleted.length === 0) return { status: "error", message: "This post was already deleted." };
    updateTag("posts");
    updateTag(`post:${slug}`);
    return { status: "ok", message: "Deleted." };
  });
  if (result.status === "ok") redirect("/admin/posts/?deleted=1");
  return result;
}

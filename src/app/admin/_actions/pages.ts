"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { pages } from "@/db/schema";
import { adminAction, invalid } from "@/lib/admin/action";
import { pageInputSchema } from "@/lib/admin/content-schema";
import { slugProblem, slugify } from "@/lib/admin/slugs";
import type { ActionState } from "@/lib/admin/types";

// Page create and update. The editor posts the whole page as one JSON
// payload; pageInputSchema validates every block and sanitizes rich HTML.

export async function savePage(slug: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  return adminAction(async (admin) => {
    let payload: unknown;
    try {
      payload = JSON.parse(String(formData.get("payload") ?? ""));
    } catch {
      return { status: "error", message: "The editor sent an unreadable page. Reload and try again." };
    }
    const parsed = pageInputSchema.safeParse(payload);
    if (!parsed.success) return invalid(parsed.error);

    const [before] = await getDb().select({ status: pages.status }).from(pages).where(eq(pages.slug, slug));
    if (!before) return { status: "error", message: "This page no longer exists." };

    const { title, status, seo, hero, blocks } = parsed.data;
    await getDb()
      .update(pages)
      .set({ title, status, seo, hero, blocks: blocks as Record<string, unknown>[], updatedBy: admin.id })
      .where(eq(pages.slug, slug));

    updateTag(`page:${slug}`);
    // Publishing or unpublishing changes the page list (sitemap, routes).
    if (before.status !== status) updateTag("pages");
    return { status: "ok", message: status === "published" ? "Saved and published." : "Saved as draft." };
  });
}

export async function createPage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let destination: string | null = null;
  const result = await adminAction(async (admin) => {
    const parsed = z
      .object({
        title: z.string().trim().min(1, { error: "Give the page a title" }).max(300),
        slug: z.string().trim().max(100),
      })
      .safeParse({ title: formData.get("title") ?? "", slug: formData.get("slug") ?? "" });
    if (!parsed.success) return invalid(parsed.error);
    const slug = parsed.data.slug ? parsed.data.slug.toLowerCase() : slugify(parsed.data.title);
    const problem = await slugProblem(slug);
    if (problem) return { status: "error", message: problem, errors: { slug: problem } };

    await getDb()
      .insert(pages)
      .values({
        slug,
        title: parsed.data.title,
        status: "draft",
        seo: { title: parsed.data.title, description: "" },
        hero: { title: parsed.data.title, ctas: [] },
        blocks: [],
        updatedBy: admin.id,
      });
    destination = `/admin/pages/${slug}/`;
    return { status: "ok", message: "Created." };
  });
  if (destination) redirect(destination);
  return result;
}

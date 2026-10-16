import "server-only";
import { z } from "zod";
import { getForm } from "@/forms";
import type { Block, Page, Seo } from "@/lib/content";
import { normalizeMediaSrc, plainText, sanitizeRichHtml } from "@/lib/sanitize";

// zod schemas for content saved from the admin. They mirror the types in
// src/lib/content.ts and clean as they parse: rich HTML is sanitized, media
// URLs are stored as "/media/...", text fields are trimmed.

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Keep this under ${max} characters` });
const required = (max: number) => text(max).min(1, { error: "Required" });

/** Internal path, anchor, or http(s)/mailto/tel URL. */
const href = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(v), {
    error: "Use a /path, https:// URL, mailto: or tel:",
  });

const src = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^(\/|https:\/\/)/.test(v), { error: "Pick an image from the media library or use an https:// URL" })
  .transform(normalizeMediaSrc);

const dimension = z.coerce.number().int().positive().max(20000).optional().catch(undefined);

export const imageSchema = z.object({ src, alt: text(300).optional(), width: dimension, height: dimension });
const optionalImage = imageSchema
  .optional()
  .nullable()
  .transform((v) => v ?? undefined);

const cta = z.object({ text: required(120), href: href.refine((v) => v !== "", { error: "Required" }) });
const rich = z.string().max(200_000).transform(sanitizeRichHtml);

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.coerce.number().int().min(1).max(6), text: required(300) }),
  z.object({ type: z.literal("rich"), html: rich }),
  z.object({
    type: z.literal("image"),
    src,
    alt: text(300).default(""),
    width: dimension,
    height: dimension,
    href: href.optional().transform((v) => v || undefined),
  }),
  z.object({ type: z.literal("buttons"), items: z.array(cta).max(6) }),
  z.object({
    type: z.literal("cards"),
    items: z
      .array(
        z.object({
          title: required(200),
          text: text(2000).default(""),
          href: href.optional().transform((v) => v || undefined),
          cta: text(80)
            .optional()
            .transform((v) => v || undefined),
          image: optionalImage,
        }),
      )
      .max(24),
  }),
  z.object({
    type: z.literal("stats"),
    items: z.array(z.object({ value: required(40), label: required(200) })).max(12),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.object({ text: required(500), href: href.optional().transform((v) => v || undefined) })).max(100),
  }),
  z.object({
    type: z.literal("faq"),
    items: z.array(z.object({ question: required(500), answer: rich })).max(60),
  }),
  z.object({
    type: z.literal("video"),
    src: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((v) => (v ? normalizeMediaSrc(v) : undefined)),
    youtubeId: z
      .string()
      .trim()
      .max(20)
      .optional()
      .refine((v) => !v || /^[\w-]{6,20}$/.test(v), { error: "Paste the YouTube video id (the part after v=)" })
      .transform((v) => v || undefined),
  }),
  z.object({ type: z.literal("gallery"), images: z.array(imageSchema).max(60) }),
  z.object({
    type: z.literal("form"),
    formId: z.union([z.string(), z.number()]).refine((v) => Boolean(getForm(v)), { error: "Choose a form" }),
  }),
  z.object({ type: z.literal("reviews") }),
  z.object({ type: z.literal("posts") }),
  z.object({ type: z.literal("custom"), component: required(80) }),
]);

export const seoSchema = z.object({
  title: required(200),
  description: text(500).transform(plainText),
  image: optionalImage,
  noindex: z
    .boolean()
    .optional()
    .transform((v) => v || undefined),
});

export const heroSchema = z.object({
  layout: z.enum(["cover", "split", "plain"]).default("plain"),
  title: required(300),
  eyebrow: text(200)
    .optional()
    .transform((v) => v || undefined),
  subtitle: text(1000)
    .optional()
    .transform((v) => v || undefined),
  image: optionalImage,
  ctas: z.array(cta).max(4).default([]),
  breadcrumbs: z
    .array(z.object({ text: required(120), href: href.optional() }))
    .max(6)
    .optional()
    .transform((v) => (v?.length ? v : undefined)),
});

export const pageInputSchema = z.object({
  title: required(300),
  status: z.enum(["published", "draft"]),
  seo: seoSchema,
  hero: heroSchema,
  blocks: z.array(blockSchema).max(300),
});

export type PageInput = { title: string; status: "published" | "draft"; seo: Seo; hero: Page["hero"]; blocks: Block[] };

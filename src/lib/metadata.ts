import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { mediaUrl } from "@/lib/media";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path relative to the site root, with a trailing slash ("/about/"). */
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

const DEFAULT_IMAGE = "/media/2025/01/goodwill-home.jpg";

// Next replaces `openGraph` and `twitter` wholesale per route, so every page
// builds the full set here, mirroring the Yoast tags on the WordPress site.
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex,
}: PageMetadataInput): Metadata {
  const images = [mediaUrl(image)];
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex && { robots: { index: false } }),
    openGraph: { title, description, url: path, siteName: SITE_NAME, locale: "en_CA", type, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

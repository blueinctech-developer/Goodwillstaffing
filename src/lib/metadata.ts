import type { Metadata } from "next";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Path relative to the site root, with a trailing slash ("/about/"). */
  path: string;
  image: string;
};

// Next replaces `openGraph` and `twitter` wholesale per route, so every page
// builds the full set here, mirroring the tags on the live site.
export function pageMetadata({ title, description, path, image }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Vivian Health",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary",
      site: "@vivianhealthapp",
      title,
      description,
      images: [image],
    },
  };
}

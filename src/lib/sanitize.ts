import "server-only";
import sanitizeHtml from "sanitize-html";

// Server-side sanitizer for HTML saved from the admin (Tiptap output for posts
// and rich blocks). The allowlist matches what scripts/import-wordpress.mjs
// keeps, plus the few marks Tiptap's toolbar can produce, so edited content
// renders with the same prose styles as imported content.

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "");

/** Store media as "/media/..." whatever host the editor displayed it from. */
function localMedia(src: string): string {
  if (MEDIA_BASE && src.startsWith(`${MEDIA_BASE}/`)) return `/media/${src.slice(MEDIA_BASE.length + 1)}`;
  return src;
}

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "br",
      "blockquote",
      "code",
      "pre",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "figure",
      "figcaption",
      "iframe",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "title", "allow", "allowfullscreen"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: {
      h1: "h2",
      a: (_tag, attribs) => ({
        tagName: "a",
        attribs: {
          href: localMedia(attribs.href ?? ""),
          ...(attribs.target === "_blank" ? { target: "_blank" } : {}),
          // Keep imported rel values (nofollow on review widgets); new-tab links get noopener.
          ...(attribs.rel ? { rel: attribs.rel } : attribs.target === "_blank" ? { rel: "noopener noreferrer" } : {}),
        },
      }),
      img: (_tag, attribs) => ({
        tagName: "img",
        attribs: {
          src: localMedia(attribs.src ?? ""),
          alt: attribs.alt ?? "",
          ...(attribs.width && { width: attribs.width }),
          ...(attribs.height && { height: attribs.height }),
        },
      }),
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  })
    .replace(/<p>\s*(&nbsp;)?\s*<\/p>/g, "")
    .trim();
}

/** Plain text (for excerpts and SEO fields). */
export function plainText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

/** Media path as stored in content: "/media/..." for site media, else the URL as given. */
export function normalizeMediaSrc(src: string): string {
  return localMedia(src.trim());
}

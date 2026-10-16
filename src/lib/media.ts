// Imported content references WordPress uploads as "/media/<year>/<month>/<file>".
// Locally those files sit in public/media (gitignored); in production they are
// served from the S3 bucket named by NEXT_PUBLIC_MEDIA_URL.
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "");

export function mediaUrl(src: string): string {
  if (!MEDIA_BASE || !src.startsWith("/media/")) return src;
  return `${MEDIA_BASE}/${src.slice("/media/".length)}`;
}

/** Rewrites every /media/ reference inside sanitized HTML. */
export function rewriteMediaInHtml(html: string): string {
  if (!MEDIA_BASE) return html;
  return html.replace(/(src|href)="\/media\//g, `$1="${MEDIA_BASE}/`);
}

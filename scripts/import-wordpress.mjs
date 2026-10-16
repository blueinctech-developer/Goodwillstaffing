// Converts the goodwillstaffing.ca WordPress REST export into the JSON content
// files under src/content/. Pages are Elementor layouts, so each widget is
// mapped to a structured block the new templates render; posts are Gutenberg
// HTML and are sanitized as-is.
//
//   node scripts/import-wordpress.mjs <export-dir>
//
// The export dir holds pages-N.json, posts-N.json, media-N.json and
// categories-N.json as returned by /wp-json/wp/v2/<type>?per_page=100&page=N.

import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";
import sanitizeHtml from "sanitize-html";

const exportDir = process.argv[2];
if (!exportDir) {
  console.error("usage: node scripts/import-wordpress.mjs <export-dir>");
  process.exit(1);
}

const OUT = path.resolve(import.meta.dirname, "../src/content");
const ORIGIN = "https://goodwillstaffing.ca";
const UPLOADS = `${ORIGIN}/wp-content/uploads/`;

// Pages that are empty shells, plugin artefacts or replaced by app routes.
// Each is redirected in next.config.ts.
const SKIP_PAGES = new Set([
  "wpwbot-mobile-app", "chatbot-page", "blog", "ai-recruiter", "smart-apply",
  "goodwill-blog", "employer-blog", "nunavut", "northwest-territories", "yukon",
  // WordPress's static front page; the live site 301s it to / and the new
  // homepage is built from src/data/home.ts.
  "goodwill-staffing-and-recruitment",
]);

// Interactive pages whose WordPress versions are inline scripts; the new site
// renders a React component instead.
// Pages whose live template shows the theme breadcrumb above the content.
const THEME_CRUMBS = new Set([
  "canada-healthcare-workforce-data-hub", "cookie-policy", "register-travel-nurse-jobs-canada", "staffing-cost-calculator",
]);

const CUSTOM_PAGES = { "staffing-cost-calculator": "StaffingCostCalculator" };

function load(type) {
  return fs
    .readdirSync(exportDir)
    .filter((f) => new RegExp(`^${type}-\\d+\\.json$`).test(f))
    .flatMap((f) => {
      const j = JSON.parse(fs.readFileSync(path.join(exportDir, f), "utf8"));
      return Array.isArray(j) ? j : [];
    });
}

// A <br> inside a button or heading separates words ("Request Staff in<br>Nova Scotia").
const decode = (s = "") =>
  parse(`<p>${s.replace(/<br\s*\/?>/gi, " ")}</p>`).text.replace(/ /g, " ").replace(/\s+/g, " ").trim();

// Old URLs the live site still links to; WordPress (Yoast/Redirection) 301s
// them, so point straight at the final page instead of through a redirect.
const LIVE_REDIRECTS = {
  "/contact/": "/contact-us/",
  "/faq/": "/faqs/",
  "/events/": "/register-travel-nurse-jobs-canada/",
  "/client-solutions/": "/healthcare-staffing-solutions-across-canada/",
  "/goodwill-blog/": "/category/goodwill-blog/",
  "/employer-blog/": "/category/employer-blog/",
  "/travel-nurse-jobs-in-ontario/": "/travel-nursing-jobs-in-ontario/",
  "/travel-nursing-jobs-by-specialty/": "/travel-nursing-jobs-by-specialty-in-canada/",
  "/travel-allied-health-jobs-by-specialty/": "/travel-allied-health-jobs-by-specialty-2/",
  // A Redirection-plugin rule on the live site (it really does land on New Brunswick).
  "/manitoba/": "/staffing-solutions-new-brunswick/",
  "/cool-places-to-visit-in-saskatchewan/": "/best-places-to-visit-in-saskatchewan/",
  "/finding-community-and-support-in-the-healthcare-field/": "/community-and-support-in-healthcare/",
  "/from-burnout-to-breakthrough-how-travel-nurses-tackle-mental-health/": "/how-travel-nurses-tackle-mental-health/",
  "/how-to-prepare-for-a-12-hour-shift/": "/prepare-for-a-12-hour-shift/",
  "/living-your-best-travel-nurse-life-in-canada-goodwill-staffing/": "/make-the-most-of-your-assignments-as-a-travel-nurse/",
  "/the-license-to-heal-a-travel-nurses-guide-to-multi-province-licensing-in-canada/": "/travel-nurses-multiple-province-licensing/",
  "/tips-to-avoid-burnout/": "/tips-to-avoid-burnout-as-nurse/",
};

// WordPress ids → slugs, so draft/preview links (/?p=123&preview=true) resolve
// to the published URL the way WordPress redirects them. Filled in below.
const slugById = new Map();

export function localUrl(href = "") {
  if (!href) return href;
  // Leftover from the theme's demo content; the live button leaves the site for
  // the theme vendor's demo, so send it to Goodwill's own contact page instead.
  if (/^https?:\/\/finpath\.keydesign\.xyz\/.*contact/.test(href)) return "/contact-us/";
  // Same site whatever the scheme or www prefix.
  href = href.trim().replace(/^https?:\/\/(www\.)?goodwillstaffing\.ca(?=[/?#]|$)/i, ORIGIN);
  if (href.startsWith(UPLOADS)) return `/media/${href.slice(UPLOADS.length).split("?")[0]}`;
  if (href.startsWith(ORIGIN) || /^\/(?!\/)/.test(href)) {
    const u = new URL(href, ORIGIN);
    let p = u.pathname || "/";
    if (p.startsWith("/media/") || p.startsWith("/cdn-cgi/")) return href;
    // The new site uses trailing slashes; adding one saves a redirect.
    if (!p.endsWith("/") && !/\.[a-z0-9]{2,5}$/i.test(p)) p += "/";
    p = LIVE_REDIRECTS[p] ?? p;
    const id = p === "/" && Number(u.searchParams.get("p") || u.searchParams.get("page_id"));
    if (id && slugById.has(id)) return `/${slugById.get(id)}/${u.hash}`;
    return p + u.search + u.hash;
  }
  return href;
}

const sanitize = (html) =>
  sanitizeHtml(html, {
    allowedTags: [
      "p", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a", "strong", "em", "b", "i", "br",
      "blockquote", "table", "thead", "tbody", "tr", "th", "td", "img", "figure", "figcaption", "iframe", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      // Heading ids are the targets of in-post tables of contents (href="#…").
      ...Object.fromEntries(["h2", "h3", "h4", "h5", "h6"].map((h) => [h, ["id"]])),
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "title", "allow", "allowfullscreen"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.vimeo.com"],
    transformTags: {
      h1: "h2",
      a: (tag, attribs) => ({ tagName: "a", attribs: { ...attribs, href: localUrl(attribs.href) } }),
      img: (tag, attribs) => ({
        tagName: "img",
        attribs: {
          src: localUrl(attribs["data-lazy-src"] || attribs["data-src"] || attribs.src),
          alt: attribs.alt || "",
          ...(attribs.width && { width: attribs.width }),
          ...(attribs.height && { height: attribs.height }),
        },
      }),
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length) ||
      (frame.tag === "img" && !frame.attribs.src),
  })
    .replace(/<p>\s*(&nbsp;)?\s*<\/p>/g, "")
    .trim();

const text = (n) => (n ? decode(n.innerHTML) : "");
const img = (n) => {
  const i = n?.querySelector("img");
  if (!i) return null;
  const src = i.getAttribute("data-lazy-src") || i.getAttribute("data-src") || i.getAttribute("src");
  if (!src || src.startsWith("data:")) return null;
  return {
    src: localUrl(src),
    alt: i.getAttribute("alt") || "",
    width: Number(i.getAttribute("width")) || undefined,
    height: Number(i.getAttribute("height")) || undefined,
  };
};
// The first real link: ElementsKit wraps boxes in a placeholder <a href="#">
// even when the box holds a real one (a mailto, say).
const link = (n) => {
  const anchors = n?.tagName === "A" ? [n] : n?.querySelectorAll("a[href]") ?? [];
  const href = anchors.map((a) => a.getAttribute("href")?.trim()).find((h) => h && !h.startsWith("#"));
  return href ? localUrl(href) : undefined;
};

// Forms built outside Gravity Forms, keyed to src/forms definitions.
const NON_GRAVITY_FORMS = [
  [/mc4wp-form-1\b/, "candidate-newsletter"],
  [/mc4wp-form-2\b/, "client-newsletter"],
  [/id="multiPageForm"/, "nurse-lead"],
];

const IGNORED = new Set([
  "container", "wrap", "spacer", "divider", "divider--view-line", "icon", "mobile", "tablet",
  "elementskit-advanced-search", "hotspot",
  "elementskit-contact-form7",
]);

function widgetBlock(kind, el) {
  const inner = el.querySelector(".elementor-widget-container") || el;
  const html = inner.innerHTML;
  const form = html.match(/gform_wrapper_(\d+)|gform_(\d+)/);
  if (form) return { type: "form", formId: Number(form[1] || form[2]) };
  for (const [pattern, formId] of NON_GRAVITY_FORMS) if (pattern.test(html)) return { type: "form", formId };
  // Popups only matter for the forms they hold (handled above).
  if (kind === "elementskit-popup-modal") return null;

  switch (kind) {
    case "heading":
    case "animated-headline":
    case "elementskit-heading": {
      // ElementsKit renders its subtitle as an <h6> ahead of the real title.
      const h = inner.querySelector(".elementskit-section-title, .ekit-heading--title") || inner.querySelector("h1,h2,h3,h4,h5,h6");
      if (!h) return null;
      // Headings can be links ("Apply Today!", "Send your photos to …").
      const href = link(h) ?? (h.closest("a") ? link(h.closest("a")) : undefined);
      const level = Number(h.tagName[1]);
      const blocks =
        level >= 5 && !href
          ? [{ type: "rich", html: `<p>${text(h)}</p>` }]
          : [{ type: "heading", level, text: text(h), ...(href && { href }) }];
      const sub = inner.querySelector(".elementskit-section-subtitle, .ekit-heading__subtitle");
      // ElementsKit's description can hold whole sections of copy, not just one <p>.
      const para = inner.querySelector(".ekit-heading__description") || inner.querySelector("p, .ekit-heading--description");
      if (sub && text(sub)) blocks.unshift({ type: "eyebrow", text: text(sub) });
      if (para && text(para) && para !== h) blocks.push({ type: "rich", html: sanitize(para.outerHTML) });
      return blocks;
    }
    case "text-editor":
    case "html":
    case "elementskit-business-hours":
    case "shortcode": {
      // Candidate pages' custom "trust-section": icon + short phrase per item.
      const trust = inner.querySelectorAll(".trust-item");
      if (trust.length) {
        const sentences = trust.map((t) => text(t).replace(/[.\s]+$/, "")).filter(Boolean);
        return sentences.length ? { type: "rich", html: `<p>${sentences.map((t) => `${t}.`).join(" ")}</p>` } : null;
      }
      if (/<script|<style/.test(html) && kind !== "text-editor") {
        const cleaned = sanitize(html);
        return cleaned && parse(cleaned).text.trim() ? { type: "rich", html: cleaned } : null;
      }
      const cleaned = sanitize(html);
      return cleaned ? { type: "rich", html: cleaned } : null;
    }
    case "button":
    case "elementskit-button": {
      const t = text(inner.querySelector(".elementor-button-text") || inner.querySelector("a"));
      const href = link(inner);
      return t ? { type: "button", text: t, href: href || "/contact-us/" } : null;
    }
    case "image": {
      const i = img(inner);
      if (!i || /\/arrow[-_]/i.test(i.src)) return null;
      return { type: "image", ...i, href: link(inner) };
    }
    case "icon-box":
    case "elementskit-icon-box":
    case "call-to-action":
    case "elementskit-team":
    case "elementskit-testimonial": {
      const title = text(inner.querySelector("h1,h2,h3,h4,h5,h6,.elementor-cta__title"));
      const body = inner.querySelector("p, .elementor-icon-box-description, .elementor-cta__description");
      const btn = inner.querySelector(".elementor-cta__button, .ekit-btn-wraper a, a.elementskit-btn");
      if (!title && !body) return null;
      return {
        type: "card",
        title,
        text: body ? text(body) : "",
        href: link(inner),
        cta: btn ? text(btn) : undefined,
        image: img(inner) || undefined,
      };
    }
    case "counter": {
      const value = text(inner.querySelector(".elementor-counter-number-wrapper")) ||
        `${inner.querySelector(".elementor-counter-number")?.getAttribute("data-to-value") || ""}`;
      const label = text(inner.querySelector(".elementor-counter-title"));
      const suffix = text(inner.querySelector(".elementor-counter-number-suffix"));
      const to = inner.querySelector(".elementor-counter-number")?.getAttribute("data-to-value");
      return { type: "stat", value: to ? `${to}${suffix}` : value, label };
    }
    case "icon-list":
    case "elementskit-stylish-list": {
      const items = inner.querySelectorAll("li").map((li) => ({ text: text(li), href: link(li) })).filter((i) => i.text);
      return items.length ? { type: "list", items } : null;
    }
    case "n-accordion":
    case "elementskit-accordion":
    case "elementskit-simple-tab": {
      let items = inner.querySelectorAll("details").map((d) => ({
        question: text(d.querySelector("summary .e-n-accordion-item-title-text") || d.querySelector("summary")),
        answer: sanitize(d.querySelector("[role=region]")?.innerHTML || ""),
      }));
      if (!items.length) {
        const titles = inner.querySelectorAll(".elementskit-btn-link, .ekit-accordion--title, .elementskit-tab-nav a, .ekit--tab__nav a");
        const panels = inner.querySelectorAll(".elementskit-card-body, .elementskit-tab-pane, .ekit--tab__post__details");
        items = titles.map((t, i) => ({ question: text(t), answer: sanitize(panels[i]?.innerHTML || "") }));
      }
      items = items.filter((i) => i.question);
      return items.length ? { type: "faq", items } : null;
    }
    case "video":
    case "elementskit-video": {
      const settings = el.getAttribute("data-settings") || "";
      const yt = (html + settings).match(/youtube\.com\/(?:embed\/|watch\?v=)([\w-]{11})|youtu\.be\/([\w-]{11})/);
      if (yt) return { type: "video", youtubeId: yt[1] || yt[2] };
      const mp4 = (html + settings.replaceAll("\\/", "/")).match(/https:\/\/goodwillstaffing\.ca\/wp-content\/uploads\/[^"'\s]+\.mp4/);
      return mp4 ? { type: "video", src: localUrl(mp4[0]) } : null;
    }
    case "image-carousel": {
      const images = inner.querySelectorAll("img").map((i) => ({
        src: localUrl(i.getAttribute("data-src") || i.getAttribute("src")),
        alt: i.getAttribute("alt") || "",
      })).filter((i) => i.src && !i.src.startsWith("data:"));
      return images.length ? { type: "gallery", images: [...new Map(images.map((i) => [i.src, i])).values()] } : null;
    }
    case "elementskit-breadcrumb": {
      // Home is the hero's icon link; keep the trail after it.
      const items = inner.querySelectorAll("li").filter((li) => !li.classList.contains("brd_sep")).slice(1)
        .map((li) => ({ text: text(li), href: link(li) })).filter((i) => i.text);
      // The REST export renders only "Home"; the page title is filled in later.
      return { type: "crumbs", items };
    }
    case "reviews":
    case "google":
      return { type: "reviews" };
    case "posts":
      return { type: "posts" };
    case "pp-gravity-forms":
      return null;
    default:
      return null;
  }
}

// Top-level Elementor sections (flexbox containers or legacy sections), in
// document order, skipping the ones hidden on desktop.
function topSections(root) {
  const out = [];
  const walk = (node) => {
    for (const el of node.childNodes) {
      if (el.nodeType !== 1) continue;
      const cls = el.getAttribute("class") || "";
      // node-html-parser closes a section early on some malformed markup, which
      // strands its later containers at the top level; keep those as sections too.
      if (/(^|\s)(e-parent|elementor-top-section)(\s|$)/.test(cls) || /(^|\s)(e-con|elementor-section|elementor-widget)(\s|$)/.test(cls)) {
        if (!/elementor-hidden-desktop/.test(cls)) out.push(el);
        continue;
      }
      walk(el);
    }
  };
  walk(root);
  return out;
}

function extractBlocks(htmlOrNode) {
  const root = typeof htmlOrNode === "string" ? parse(htmlOrNode) : htmlOrNode;
  const blocks = [];
  const walk = (node) => {
    for (const el of node.childNodes) {
      if (el.nodeType !== 1) continue;
      const cls = el.getAttribute("class") || "";
      // Elementor duplicates sections per breakpoint; keep the desktop version.
      if (/elementor-hidden-desktop/.test(cls)) continue;
      if (/elementor-location-popup|elementskit-modal/.test(cls)) continue;
      const kinds = [...cls.matchAll(/elementor-widget-([a-z0-9-]+)/g)].map((m) => m[1]).filter((k) => !IGNORED.has(k));
      // `elementor-widget-wrap` is a column wrapper, not a widget.
      const isWidget = /(^|\s)elementor-widget(\s|$)/.test(cls) || kinds.length > 0;
      if (isWidget) {
        if (kinds.length) {
          const b = widgetBlock(kinds[0], el);
          if (b) blocks.push(...[b].flat());
        }
        continue;
      }
      walk(el);
    }
  };
  walk(root);
  return blocks;
}

const GROUPS = { card: "cards", button: "buttons", stat: "stats" };

function groupBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    // Drop exact repeats Elementor leaves behind (same widget in two columns).
    if (prev && JSON.stringify(prev) === JSON.stringify(b)) continue;
    const group = GROUPS[b.type];
    if (group) {
      const { type, ...item } = b;
      if (prev?.type === group) prev.items.push(item);
      else out.push({ type: group, items: [item] });
      continue;
    }
    out.push(b);
  }
  // A lone button repeated straight after the same button group is noise.
  return out.filter((b, i) => !(b.type === "buttons" && JSON.stringify(b) === JSON.stringify(out[i - 2])));
}

// Builds the hero from the first desktop-visible section (the one the live
// site shows above the fold). Its photo and layout come from
// hero-media.json, produced from the page's Elementor CSS; anything else the
// section holds (extra copy, cards) flows into the body.
function splitHero(heroBlocks, bodyBlocks, media) {
  let titleAt = heroBlocks.findIndex((b) => b.type === "heading");
  // Two headings back to back: the first is a kicker line over the real title.
  const kicker = titleAt >= 0 && heroBlocks[titleAt + 1]?.type === "heading" ? heroBlocks[titleAt] : undefined;
  if (kicker) titleAt += 1;
  const hero = { layout: "plain", title: "", ctas: [], breadcrumbs: undefined };
  const rest = [];
  if (titleAt < 0) return { hero, blocks: [...heroBlocks, ...bodyBlocks].filter((b) => b.type !== "crumbs") };

  hero.title = heroBlocks[titleAt].text;
  const before = heroBlocks.slice(0, titleAt);
  // Icon lists ahead of the title, or an ElementsKit breadcrumb anywhere in the hero.
  const crumbs = [...before.filter((b) => b.type === "list"), ...heroBlocks.filter((b) => b.type === "crumbs")].flatMap((b) => b.items);
  // The last crumb is the current page and renders as plain text; the live
  // site often points it at the wrong page (/alberta/ on every province), so drop it.
  if (crumbs.length) crumbs[crumbs.length - 1] = { text: crumbs[crumbs.length - 1].text };
  if (crumbs.length || heroBlocks.some((b) => b.type === "crumbs")) hero.breadcrumbs = crumbs;
  const eyebrow = before.find((b) => b.type === "eyebrow");
  if (eyebrow) hero.eyebrow = eyebrow.text;
  if (kicker) hero.eyebrow = kicker.text;

  for (const b of heroBlocks.slice(titleAt + 1)) {
    if (b.type === "rich" && !hero.subtitle && parse(b.html).text.trim().length < 400) hero.subtitle = parse(b.html).text.trim();
    else if (b.type === "buttons" && !hero.ctas.length) hero.ctas = b.items;
    else if (b.type === "image" && media?.image && b.src === localUrl(media.image)) continue;
    else if (b.type !== "eyebrow") rest.push(b);
  }

  if (media?.image) {
    hero.layout = media.layout;
    hero.image = { src: localUrl(media.image), alt: media.alt || "" };
  } else {
    // A photo widget inside the hero section still makes it a split hero.
    const photo = rest.findIndex((b) => b.type === "image");
    if (photo >= 0) {
      const [b] = rest.splice(photo, 1);
      hero.layout = "split";
      hero.image = { src: b.src, alt: b.alt, width: b.width, height: b.height };
    }
  }
  return { hero, blocks: [...rest, ...bodyBlocks].filter((b) => b.type !== "eyebrow" && b.type !== "crumbs") };
}

function seoOf(item) {
  const y = item.yoast_head_json || {};
  const og = y.og_image?.[0];
  return {
    title: decode(y.title || item.title.rendered),
    description: decode(y.description || y.og_description || ""),
    image: og ? { src: localUrl(og.url), width: og.width, height: og.height } : undefined,
    noindex: y.robots?.index === "noindex" || undefined,
  };
}

function write(rel, data) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

fs.rmSync(path.join(OUT, "pages"), { recursive: true, force: true });
fs.rmSync(path.join(OUT, "posts"), { recursive: true, force: true });

for (const item of [...load("pages"), ...load("posts")]) slugById.set(item.id, item.slug);
const media = new Map(load("media").map((m) => [m.id, m]));
const categories = load("categories").filter((c) => c.count > 0 && c.slug !== "uncategorized");
write("categories.json", categories.map((c) => ({ slug: c.slug, name: decode(c.name), description: decode(c.description) })));
const catSlug = new Map(load("categories").map((c) => [c.id, c.slug]));

// Optional: hero layouts/photos from goodwill-export/tools/hero-bg.mjs.
const heroMediaFile = path.join(exportDir, "hero-media.json");
const heroMedia = fs.existsSync(heroMediaFile) ? JSON.parse(fs.readFileSync(heroMediaFile, "utf8")) : {};

const pageIndex = [];
for (const p of load("pages")) {
  if (SKIP_PAGES.has(p.slug) || p.status !== "publish") continue;
  const seo = seoOf(p);
  const html = p.content.rendered;
  let hero;
  let blocks;
  if (CUSTOM_PAGES[p.slug]) {
    hero = { layout: "plain", title: "", ctas: [] };
    blocks = [{ type: "custom", component: CUSTOM_PAGES[p.slug] }];
  } else if (/elementor-widget/.test(html)) {
    const sections = topSections(parse(html));
    const heroAt = sections.findIndex((s) => s.querySelector("h1,h2,h3"));
    const heroBlocks = heroAt >= 0 ? groupBlocks(extractBlocks(sections[heroAt])) : [];
    const bodyBlocks = groupBlocks(sections.filter((_, i) => i !== heroAt).flatMap((s) => extractBlocks(s)));
    ({ hero, blocks } = splitHero(heroBlocks, bodyBlocks, heroMedia[p.slug]));
    // Candidate pages (built with the trust-section) and every Client Solutions
    // page share one hero: copy beside the photo.
    const clientPage = hero.breadcrumbs?.some((c) => c.text === "Client Solutions");
    if ((/trust-item/.test(html) || clientPage) && hero.image) hero.layout = "split";
  } else {
    // Pages built outside Elementor (policies, the data hub) are plain HTML.
    hero = { layout: "plain", title: "", ctas: [] };
    blocks = [{ type: "rich", html: sanitize(html) }];
  }
  if (!hero.title) hero.title = decode(p.title.rendered);
  // The theme's own "Home › Title" trail shows on these pages.
  if ((THEME_CRUMBS.has(p.slug) && !hero.breadcrumbs) || hero.breadcrumbs?.length === 0) {
    hero.breadcrumbs = [{ text: decode(p.title.rendered) }];
  }
  write(`pages/${p.slug}.json`, {
    slug: p.slug,
    title: decode(p.title.rendered),
    modified: p.modified_gmt,
    seo,
    hero,
    blocks,
  });
  pageIndex.push({ slug: p.slug, title: decode(p.title.rendered), blocks: blocks.length });
}

for (const p of load("posts")) {
  if (p.status !== "publish") continue;
  const fm = media.get(p.featured_media);
  const seo = seoOf(p);
  write(`posts/${p.slug}.json`, {
    slug: p.slug,
    title: decode(p.title.rendered),
    date: p.date_gmt,
    modified: p.modified_gmt,
    excerpt: decode(p.excerpt.rendered).replace(/\s*\[&hellip;\]|\s*\[…\]/, "…"),
    categories: p.categories.map((id) => catSlug.get(id)).filter((s) => s && s !== "uncategorized"),
    featuredImage: fm
      ? { src: localUrl(fm.source_url), alt: fm.alt_text || "", width: fm.media_details?.width, height: fm.media_details?.height }
      : seo.image && { ...seo.image, alt: "" },
    seo,
    html: sanitize(p.content.rendered),
  });
}

console.log(`pages: ${pageIndex.length}, posts: ${load("posts").length}, categories: ${categories.length}`);
for (const p of pageIndex.filter((p) => p.blocks < 3)) console.log(`  thin page: ${p.slug} (${p.blocks} blocks)`);

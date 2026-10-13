# vivian-web

Rebuild of [vivian.com](https://www.vivian.com/) on Next.js 16 (App Router, Cache Components). The homepage is done; other routes are still to come.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

| Path | What |
| --- | --- |
| `src/app/layout.tsx` | Fonts, metadata, header and footer shell |
| `src/app/page.tsx` | Homepage, assembled from `src/components/home/*` |
| `src/components/layout/` | Header (desktop dropdowns, mobile drawer) and footer |
| `src/data/home.ts` | Homepage copy, testimonials, logos, job-type labels |
| `src/data/*.json` | Snapshot of the live job counts and the "Explore top healthcare jobs" link tree |
| `src/lib/site.ts` | URLs, nav and footer links, video locations |
| `src/fonts/` | Balto (body) and Spezia (display), loaded with `next/font/local` |
| `public/images`, `public/svg` | Photos, employer and press logos, store badges, all taken from the live site |
| `public/lottie` | The four "Vivian empowers you" animations (desktop and mobile) |
| `public/videos` | The 14.5 MB hero loop |

## Things to know

- **Job counts are a snapshot** taken on 2026-10-13 from the live site's server props. Replace the JSON imports in `src/data/home.ts` with a cached fetch (`"use cache"` plus `cacheLife`) once the jobs API is connected.
- **The full-length video (315 MB) is not in the repo.** It streams from `marketing-assets.vivian.com` (see `HERO_FULL_VIDEO_URL` in `src/lib/site.ts`). If that bucket moves, update the constant.
- **Fonts:** Balto and Spezia are commercial typefaces. Confirm that Vivian's web licences cover this deployment.
- **URLs keep their trailing slash** (`trailingSlash: true`) to match the existing indexed URLs.
- **Links to pages that aren't built yet** (`/register/`, `/browse-jobs/`, `/nursing/...`) return 404 until those routes exist.
- Styles are CSS Modules ported rule by rule from the production stylesheet. Colour tokens are in `src/app/globals.css`.

# goodwillstaffing.ca

The Goodwill Staffing & Recruitment website, migrated off WordPress onto Next.js 16 (App Router,
Cache Components), with an admin at `/admin` for form submissions and site content.

Stack: Neon Postgres (drizzle-orm), AWS S3 (media and private uploads), AWS SES (email), Vercel.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

No environment variables are needed for the public site: without `DATABASE_URL` content comes from
`src/content/*.json`, form submissions are logged to the console, and `/admin` shows a setup notice.
See `.env.example` for every variable.

## Where things live

| Path | What |
| --- | --- |
| `src/app/(site)/` | Public routes (`/`, `/[slug]/` for pages and posts, `/blog/`, `/category/[slug]/`, `/about-us/`) and their header/footer layout |
| `src/app/admin/` | The admin: `(auth)/` sign-in, reset and invite pages; `(panel)/` everything behind sign-in; `_actions/` Server Actions |
| `src/proxy.ts` | Optimistic `/admin` gate (no session cookie, so sign in) and `X-Robots-Tag: noindex` |
| `src/content/` | WordPress import (pages, posts, categories JSON) from `scripts/import-wordpress.mjs`; the DB seed source |
| `src/lib/content.ts` | Public content readers (`"use cache"` + tags); DB when `DATABASE_URL` is set, else JSON |
| `src/db/` | Drizzle schema and client; migrations in `drizzle/` |
| `src/lib/auth/` | scrypt passwords, DB sessions, invite/reset tokens, `requireAdmin*()` |
| `src/lib/admin/` | Admin queries, zod content schemas, slug rules, action wrapper |
| `src/lib/aws/` | S3 (presign, move, list) and SES clients |
| `src/forms/` | Form definitions, validation, sink (DB + S3 + SES), direct uploads; see `src/forms/README.md` |
| `src/components/admin/` | Admin UI: Tiptap editor, page/post editors, media library |
| `scripts/` | Migrate, seed, create admin, upload media, import Gravity Forms entries |

## npm scripts

| Script | What |
| --- | --- |
| `npm run db:generate` | Generate a SQL migration from `src/db/schema.ts` (no database needed) |
| `npm run db:migrate` | Apply `drizzle/` migrations to `DATABASE_URL_UNPOOLED` (or `DATABASE_URL`) |
| `npm run db:seed` | Upsert `src/content` into pages/posts/categories. Keeps rows edited in the admin; `-- --force` overwrites them |
| `npm run admin:create` | Create (or reset) an owner account; asks for the password |
| `npm run media:upload` | Upload `C:\Users\DELL\goodwill-export\media` (or a path argument) to `s3://$S3_BUCKET/media/`; resumable, `-- --dry-run` to preview |
| `npm run gf:import` | Import Gravity Forms CSV exports (default `C:\Users\DELL\goodwill-export\gf-entries`) as legacy submissions; see the header of `scripts/import-gravity-entries.ts` |
| `npm run typecheck` / `npm run lint` | `tsc --noEmit` / ESLint |

## Admin

- **Accounts:** email + password (scrypt). Sessions live in `admin_sessions` (hashed token in an
  HTTP-only cookie scoped to `/admin`, 12 h absolute, 2 h idle). Five wrong passwords lock an account
  for 15 minutes; logins and resets are rate limited in Postgres. Roles: **owner** (also manages admins)
  and **editor**. Owners invite admins from `/admin/admins/`; invitations and resets are emailed links.
- **Submissions:** inbox, filters (form, status, dates, full-text over answers and notes), bulk
  status changes, detail with private file downloads (5-minute presigned links), notes, delete, CSV export
  that follows the current filters.
- **Content:** blog posts (Tiptap editor, categories, featured image, SEO, draft/publish, slug rename
  checked against pages, posts and reserved routes), pages (hero + block editor), categories, media library.
  Saving calls `updateTag()` for `posts`/`post:<slug>` or `page:<slug>` so the public site updates at once.
  HTML is sanitized server-side with `sanitize-html` (same allowlist as the WordPress import).
- Drafts never reach the public site: the public readers only select `status = 'published'`.

## Going live

1. **Neon:** create a project (region close to Vercel's, e.g. `aws-us-east-1` or Canada if offered). Copy
   the pooled string to `DATABASE_URL` and the direct one to `DATABASE_URL_UNPOOLED`.
2. **Env:** copy `.env.example` to `.env.local` and fill in the database, `SESSION_SECRET`, AWS, SES
   and `FORM_NOTIFY_*` values.
3. `npm run db:migrate`
4. `npm run db:seed` (loads the 66 pages, 57 posts and 9 categories)
5. `npm run admin:create` and sign in at `/admin/login/`. Invite the rest of the team from Admins.
6. `npm run media:upload` (about 1,090 files / 310 MB; safe to re-run).
7. Set `NEXT_PUBLIC_MEDIA_URL` to `<S3_PUBLIC_URL>/media` (it is read at build time; rebuild after setting it).
8. **S3 bucket:**
   - Block Public Access: allow bucket policies (keep ACLs blocked), then add a policy that makes **only
     `media/` public**:

     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadMedia",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::YOUR_BUCKET/media/*"
         }
       ]
     }
     ```

     `private/` stays private; admins download those files through presigned URLs.
   - CORS, so browsers can upload directly with presigned PUTs (form uploads and the media library):

     ```json
     [
       {
         "AllowedOrigins": ["https://goodwillstaffing.ca", "https://www.goodwillstaffing.ca", "http://localhost:3000"],
         "AllowedMethods": ["PUT", "GET", "HEAD"],
         "AllowedHeaders": ["Content-Type", "Cache-Control"],
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3600
       }
     ]
     ```

     Add your Vercel preview domain if you test uploads there.
   - Lifecycle rule: expire objects under `private/tmp/` after 1 day (abandoned form uploads).
   - IAM user policy for the app: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on
     `arn:aws:s3:::YOUR_BUCKET/*`, `s3:ListBucket` on `arn:aws:s3:::YOUR_BUCKET`, and `ses:SendEmail`.
9. **SES:** verify the `goodwillstaffing.ca` domain (DKIM records in DNS), set `MAIL_FROM` to an address on
   it, and request production access (out of the sandbox) so mail reaches any recipient.
10. **Vercel:** add every variable from `.env.local` to the project (Production and Preview; set `APP_URL`
    per environment), deploy, then submit each form once and check `/admin/submissions/`, the alert email
    and the stored files.
11. Optional: `npm run gf:import` with Gravity Forms CSV exports to bring the old entries across, and download
    any Gravity upload files you need before WordPress is switched off (the import keeps their old URLs).

## Things to know

- **URLs keep their trailing slash** (`trailingSlash: true`) to match the indexed WordPress URLs; WordPress
  redirects (feeds, `/wp-admin`, Yoast sitemaps, `/wp-content/uploads/...`) are in `next.config.ts`.
- **Uploads:** with S3 configured the browser uploads files straight to S3 (presigned PUT to
  `private/tmp/...`), so the 256 MB video limits work despite Vercel's 4.5 MB request cap. Without S3 they
  travel with the Server Action (`serverActions.bodySizeLimit` 4 MB) and are recorded but not stored.
- **Public pages are prerendered** from the database at build time when `DATABASE_URL` is set, so the
  build needs database access; admin edits refresh the cache by tag without a redeploy.
- **Redirects for renamed slugs** are not managed in the admin; add them to `next.config.ts`.
- `src/app/(site)/about/` and `src/components/about/` are the old vivian.com About page (pending removal);
  they currently fail type checking and block `next build`.

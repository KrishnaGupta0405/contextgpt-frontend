# On-Demand ISR — Implementation Record

## Currently not working -> ?

## Paused (2026-07-13)

After fully deploying this to Vercel, it turned out that **both** scenarios — a cache hit and an
on-demand revalidation — invoke a Vercel Edge Function, and that happens across all 4 blog-related
routes: `/blog`, `/blog/[slug]`, `/blog/author/[name]`, and `/api/revalidate`. That drains the Edge
Function invocation quota much faster than expected. Since Vercel's **build-time** limit is
unlimited (only Edge Function invocations are metered tightly), ISR is paused for now, on both the
Backend Dashboard and the Frontend Dashboard. All the ISR/revalidation code described below has been
commented out (not deleted) in both projects. Blog posts are back to being read from the `content/`
folder and built/served the old way — plain static HTML/CSS generated at build time, no on-demand
DB-backed rendering at request time. To bring a post live now requires adding/editing the `.mdx`
file in `content/blog/` and running a rebuild + redeploy, same as before this feature existed.

This documents the work done to move the blog off build-time static generation onto **On-Demand Incremental Static Regeneration (ISR)**: create/update/publish/unpublish/delete a post and the change goes live within seconds — no `npm run build`, no redeploy.

## Why

Before this work, blog posts were entirely static-file based: MDX files in `content/blog/*.mdx`, read via `fs.readFileSync`, pre-rendered at build time via `generateStaticParams()`. There was no backend blog table, route, or controller anywhere in the codebase. Any content change required a full rebuild + redeploy.

## Architecture

```
blog_admin_dashboard (new, standalone, no-auth admin tool)
        │  POST/PATCH/DELETE /api/v1/blog/posts
        ▼
Backend Dashboard  (blog_posts table, CRUD controller)
        │  on every mutation, fire-and-forget:
        │  POST /api/revalidate  { paths: ["/blog", "/blog/<slug>", ...] }
        ▼
Frontend Dashboard  (Next.js /api/revalidate → revalidatePath/revalidateTag)
        │
        ▼
/blog and /blog/[slug] regenerate on next request, served from cache after
```

Public reads (`/blog`, `/blog/[slug]`, RSS, author pages) fetch published posts from the backend's public API. Local `.mdx` files in `content/blog/` remain as a **dev-only authoring shortcut** — merged in ahead of API results only when `NODE_ENV !== 'production'`.

---

## Backend (`Backend Dashboard`)

### Database

New table `blog_posts` (SQL run manually by the user, then synced into `drizzle/schema.ts` via `npx drizzle-kit pull`, per this repo's rule of never hand-editing `schema.ts`):

- `id`, `slug` (unique), `title`, `description`, `content` (MDX/markdown body)
- `status` (`DRAFT` | `PUBLISHED`, CHECK constraint)
- `tags`, `keywords` (jsonb arrays), `category`, `featured`, `noindex`
- `author_slugs` (jsonb array — references the frontend's static author registry, no `authors` table)
- `cover_image`, `canonical_url`, `series_name`, `series_part`
- `published_at`, `created_at`, `updated_at`
- Indexes on `status` and `published_at`

No slug-change history table — `updated_at` is enough; an old slug simply 404s the moment a rename is saved (same behavior as renaming a `.mdx` file).

### Files added

| File                                   | Purpose                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/controllers/blog.controller.js`   | Admin CRUD: `createPost`, `listPosts` (paginated, includes drafts), `getPostById`, `updatePost` (partial update, detects slug changes), `deletePost`. Follows this repo's existing conventions (`asyncHandler`, `callDb`, `ApiError`/`ApiResponse`, manual whitelist validation — no zod on the backend).                |
| `src/routes/blog.routes.js`            | Mounts the CRUD routes at `/api/v1/blog/posts`. **No auth middleware** — intentional, per user decision, since this is an admin-only tool used solely by the site owner. Must not be exposed publicly without adding auth back.                                                                                          |
| `src/utils/frontendRevalidate.util.js` | `triggerFrontendRevalidate({ paths, tags })` — fire-and-forget POST to the frontend's `/api/revalidate`, native `fetch` + `AbortController` timeout (8s), matches the style of the existing `webhookDispatch.util.js`. Never throws; logs and swallows failures so a revalidation outage can never fail a blog mutation. |

### Files modified

| File                                    | Change                                                                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app.js`                            | Mounted `blogRouter` at `/api/v1/blog`.                                                                                                                                                                        |
| `src/controllers/website.controller.js` | Added `getPublicBlogPosts` and `getPublicBlogPostBySlug` — public, unauthenticated reads of **published-only** posts, for the public-facing frontend.                                                          |
| `src/routes/website.route.js`           | Wired the two new public routes: `GET /blog/posts`, `GET /blog/posts/:slug`.                                                                                                                                   |
| `.env`                                  | Added `FRONTEND_REVALIDATE_SECRET` (shared secret with the frontend); added `http://localhost:3002` to `CORS_ORIGIN` for the new admin dashboard's origin. Reused existing `FRONTEND_URL`/`PROD_FRONTEND_URL`. |

### Revalidation trigger points

Every mutation in `blog.controller.js` calls `triggerFrontendRevalidate` after a successful DB write:

- **Create** → revalidates `/blog` + `/blog/<slug>`
- **Update** (content/metadata, no slug change) → `/blog` + `/blog/<slug>`
- **Update** (slug changed) → `/blog` + old slug + new slug (so the old URL's cache clears too)
- **Publish/unpublish** (via `status` field in update) → same as update
- **Delete** → `/blog` + `/blog/<slug>`

---

## Frontend (`Frontend Dashboard`)

### Files added

| File                              | Purpose                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/revalidate/route.js` | Secret-protected endpoint (`x-revalidate-secret` header, checked against `process.env.FRONTEND_REVALIDATE_SECRET`). Calls `revalidatePath`/`revalidateTag` for each path/tag in the request body. This is what the backend calls after every mutation. Modeled on the existing secret-gated pattern in `src/app/api/indexnow/route.js`. |
| `scripts/seed-blog-posts.js`      | One-time migration script. Reads every `content/blog/*.mdx` file, parses frontmatter with `gray-matter` (same parser already used by `src/lib/blog.js`), and `POST`s each one to the backend's create endpoint — skips slugs that already exist in the DB. Run once via `node scripts/seed-blog-posts.js` from `Frontend Dashboard/`.   |

### Files modified

| File                                                      | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/blog.js`                                         | Rewritten. All exported functions (`getAllPosts`, `getPostBySlug`, `getAdjacentPosts`, `getRelatedPosts`, `getFeaturedPosts`, `getSeriesPosts`, `getAllCategories`, `getPostsByCategory`, `getAllAuthors`, `getPostsByAuthor`, `getSearchIndex`) are now `async`. Posts are sourced by merging two normalized sources: local `.mdx` files (via `fs`, gated to `NODE_ENV !== 'production'`, local wins on slug collision) and the backend's public API (`fetch` with `next: { revalidate: 3600, tags: [...] }`). In production only the API source is ever used. |
| `src/app/(not-protected)/blog/page.jsx`                   | Added `export const revalidate = 3600` (TTL safety net; on-demand is the primary mechanism). Component is now `async`, all data calls `await`ed.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/app/(not-protected)/blog/[slug]/page.jsx`            | Removed `generateStaticParams()`. Added `export const dynamicParams = true` (new slugs render on first request instead of requiring a rebuild) and `export const revalidate = 3600`. All data calls `await`ed.                                                                                                                                                                                                                                                                                                                                                  |
| `src/app/(not-protected)/blog/author/[name]/page.jsx`     | Same treatment: removed `generateStaticParams()`, added `dynamicParams = true` + `revalidate = 3600`, `await`ed all data calls.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/app/(not-protected)/blog/rss.xml/route.js`           | Added `export const revalidate = 3600`; `await`ed `getAllPosts()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/app/(not-protected)/blog/[slug]/opengraph-image.jsx` | Added `export const revalidate = 3600`; `await`ed `getPostBySlug()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `.env`                                                    | Added `FRONTEND_REVALIDATE_SECRET` (must match the backend's value). Reused existing `NEXT_PUBLIC_BACKEND_API_URL`.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `GUIDE.md` (this directory)                               | Documented the new DB-backed workflow, the two ways to publish (local-file dev shortcut vs. the admin dashboard), the seed script, and a frontmatter-field → DB-column mapping.                                                                                                                                                                                                                                                                                                                                                                                 |

---

## New standalone project: `blog_admin_dashboard`

A separate, minimal Next.js app (peer directory to `Frontend Dashboard` / `Backend Dashboard`) — the actual tool used to manage posts day-to-day. No login/JWT, since it's a personal/admin-only local tool talking directly to the unauthenticated `/api/v1/blog/*` routes.

| Path                               | Purpose                                                                                                                                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/api.js`                   | Thin fetch wrapper for the backend's blog endpoints (`listPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`). Never throws — always resolves `{ ok, status, body }` so the UI can render the raw server response either way. |
| `src/app/page.jsx`                 | Paginated post list (10/page, Prev/Next), status badges, links to each post's detail page.                                                                                                                                             |
| `src/app/posts/new/page.jsx`       | Create-post form.                                                                                                                                                                                                                      |
| `src/app/posts/[id]/page.jsx`      | Fetches full post content by id, pre-fills the same form for editing (change `status` to publish/unpublish), plus a Delete button with confirmation.                                                                                   |
| `src/components/PostForm.jsx`      | Shared form used by both create and edit pages.                                                                                                                                                                                        |
| `src/components/ResponsePanel.jsx` | Renders the raw JSON server response (status + body) under every action, success or failure.                                                                                                                                           |

Runs on `http://localhost:3002` (`npm run dev` → `next dev -p 3002`), configured via its own `.env` (`NEXT_PUBLIC_BACKEND_API_URL`).

---

## End-to-end flow (create → publish → live)

1. Write/iterate the post's MDX content — either as a local `content/blog/*.mdx` file (instant preview, dev-only) or directly in the Blog Admin Dashboard's textarea.
2. Submit via the dashboard: `POST /api/v1/blog/posts` with `status: "DRAFT"` or `"PUBLISHED"`.
3. Backend inserts the row, then fires `triggerFrontendRevalidate` (fire-and-forget, never blocks the response).
4. Frontend's `/api/revalidate` validates the shared secret and calls `revalidatePath("/blog")` + `revalidatePath("/blog/<slug>")`.
5. Next request to `/blog` or `/blog/<slug>` regenerates from the DB; subsequent requests are served from cache until the next mutation or the 3600s TTL.
6. Editing, publishing/unpublishing (`status` field), renaming the slug, or deleting all repeat steps 3–5 with the appropriate affected paths.

No step in this flow requires `npm run build` or a redeploy.

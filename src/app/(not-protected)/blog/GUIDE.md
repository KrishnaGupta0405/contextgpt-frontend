# Writing a Blog Post

Most important -> While writing try to make ContextGPT as the superior one, and write the same using flirty language.

## Where posts actually live (read this first)

Blog posts are stored in the backend database (`blog_posts` table in **Backend Dashboard**), not in this repo. In production, `/blog` and `/blog/[slug]` are served entirely from the DB via on-demand ISR — publishing, editing, or deleting a post takes effect within seconds, **with no `npm run build` and no redeploy**.

`content/blog/*.mdx` still exists, but only as a **local, dev-only authoring shortcut** — see the next section. Everything below about frontmatter, headings, components, etc. applies identically whether the MDX source is a local file or a DB row, since both are compiled through the same `compileMdx()` function.

### The two ways to publish a post

1. **Local-file draft → DB (recommended for writing)**
   Drop a `.mdx` file in `content/blog/` and iterate on it exactly as described in this guide — instant preview at `/blog/your-slug` in `npm run dev`, zero backend calls, fastest feedback loop for content/formatting. This path is automatically disabled in production (`NODE_ENV === 'production'`), so it can never accidentally go live on its own.
   Once you're happy with it, publish it to the DB (see below) and **delete the local `.mdx` file** — otherwise the local file keeps shadowing the DB version in your own dev environment (local files win on slug collision).

2. **Directly via the Blog Admin Dashboard**
   A separate, standalone app — [`blog_admin_dashboard`](../../../../../../blog_admin_dashboard) (peer folder to this project) — talks straight to the backend's CRUD API. Run it with `npm run dev` (serves on `http://localhost:3002`, backend must be running on `:8000`). No login/JWT — it's an admin-only local tool, not meant to be deployed publicly.
   - `/` — paginated list of all posts (drafts + published)
   - `/posts/new` — create a post (paste your finished MDX content into the `content` field)
   - `/posts/[id]` — view/edit full content, change `status` to `PUBLISHED`/`DRAFT` to publish or unpublish, or delete
   - Every action shows the raw server response so you can confirm exactly what happened.

   Publishing (setting `status: PUBLISHED`) or editing a post through the dashboard automatically triggers the frontend's revalidation endpoint (`/api/revalidate`) — the change is live on `/blog` and `/blog/[slug]` within seconds.

### Syncing local posts into the DB

`Frontend Dashboard/scripts/seed-blog-posts.js` reads every `content/blog/*.mdx` file and syncs it to the DB: creates a new row (via the backend's create endpoint) for slugs that don't exist yet, and updates the existing row (via the update endpoint, matched by `id`) for slugs that already exist — so re-running it after editing a local `.mdx` file pushes those edits to the DB. Run it from `Frontend Dashboard/`:

```bash
node scripts/seed-blog-posts.js
```

### Frontmatter fields → DB columns

If you're publishing through the admin dashboard instead of a `.mdx` file, the same frontmatter concepts apply, just as form fields / request body keys instead of YAML: `title`, `slug` (optional, derived from title), `description`, `content` (the MDX body), `status` (`DRAFT`/`PUBLISHED` — replaces the old `draft: true/false` flag), `tags`, `category`, `keywords`, `featured`, `noindex`, `authorSlugs` (array of author registry ids — same registry described below), `coverImage`, `ogImage`, `canonicalUrl`, `seriesName`/`seriesPart`. `publishedAt` and `updatedAt` are set automatically by the backend (first publish time, and every save, respectively) rather than hand-written.

---

Everything below describes writing the MDX content itself — same rules whether the source is a local `.mdx` file (dev-only) or a `content` field submitted through the admin dashboard (DB-backed, production).

Blog posts written as local files live in `content/blog/*.mdx`. Each file is one post. The filename (minus `.mdx`) becomes the URL slug, e.g. `my-post.mdx` → `/blog/my-post`. (A DB-stored post's slug comes from its `slug` field instead of a filename — same rule, same result.)

### `slug` frontmatter vs. filename

`slug` in frontmatter is **optional**. If you omit it, the filename is used as the slug automatically (`src/lib/blog.js` — `readLocalPostFile`):

```js
slug: frontmatter.slug || filenameSlug
```

Two things worth knowing:

- **Set `slug` explicitly when you want a URL that differs from the filename** — e.g. a long, descriptive filename like `chatbot-vs-forms-what-does-customer-prefer.mdx` paired with a shorter `slug: "chatbots-vs-forms"` for a cleaner `/blog/chatbots-vs-forms` URL. Filenames are free to be long/descriptive for your own organization; the `slug` field is what actually becomes the URL.
- **The filename also works as a backup URL even when `slug` is set.** `getPostBySlug` resolves `/blog/<param>` by first checking whether a file named `<param>.mdx` exists — if it does, that file is served directly, regardless of what its frontmatter `slug` says. So in the example above, both `/blog/chatbots-vs-forms` (the frontmatter slug) and `/blog/chatbot-vs-forms-what-does-customer-prefer` (the filename) render the same post. This exists so that old/incoming links built off a filename never 404 just because the frontmatter later added a shorter slug.

Everywhere else in the app (post cards, related posts, prev/next, sitemap, RSS, JSON-LD) always links using `post.slug` — the resolved/canonical one — never the filename, so this fallback is purely a safety net for direct URL access, not something you need to link to on purpose.

## Frontmatter

Every post starts with a YAML frontmatter block:

```mdx
---
title: "How to Reduce Support Tickets by 60% with AI"
description: "Real strategies and data on how businesses are using AI chatbots to deflect repetitive tickets."
author: "krishna-gupta"
publishedAt: "2026-03-10"
updatedAt: "2026-04-01"
tags: ["Customer Support"]
category: "Guides"
keywords: ["ai chatbot", "support automation"]
coverImage: "/icons/Contextgpt_icon.svg"
ogImage: null
draft: false
featured: false
noindex: false
canonicalUrl: null
series: null
---
```

Frontmatter is validated with a Zod schema (`src/lib/blogSchema.js`) when the post is read. **A missing required field or wrong type throws a build error** naming the offending file — you'll see it immediately in `npm run dev`/`npm run build` output, not as a silently broken page.

| Field          | Required | Notes                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | yes      | Page `<title>` and `<h1>`-equivalent metadata.                                                                                                                                                                                                                                                                                                                                |
| `slug`         | no       | URL slug. Defaults to the filename (minus `.mdx`) if omitted. See [`slug` frontmatter vs. filename](#slug-frontmatter-vs-filename) above — the filename also stays reachable as a backup URL even after you set an explicit `slug`.                                                                                                                                       |
| `description`  | yes      | Used for SEO meta description, OG, and Twitter cards.                                                                                                                                                                                                                                                                                                                         |
| `publishedAt`  | yes      | ISO date string (`YYYY-MM-DD`). Posts are sorted newest-first by this field.                                                                                                                                                                                                                                                                                                  |
| `author`       | no       | Author id string, e.g. `"krishna-gupta"`, or an array of ids for co-authored posts, e.g. `["krishna-gupta", "jane-doe"]` — each must match a key in the author registry (`src/lib/authors.js`). Defaults to the registry's `DEFAULT_AUTHOR_SLUG` if omitted. The first author is treated as the primary author (`post.author`); the full list is available as `post.authors`. |
| `updatedAt`    | no       | ISO date string. Shown as "last modified" if present.                                                                                                                                                                                                                                                                                                                         |
| `tags`         | no       | Array of strings. Used for tag pills, related posts, and as a fallback category filter if `category` isn't set anywhere.                                                                                                                                                                                                                                                      |
| `category`     | no       | Single string. Once any post has a `category`, the blog index filter switches from tag-based to category-based.                                                                                                                                                                                                                                                               |
| `keywords`     | no       | Array of strings. Passed through to page `<meta name="keywords">`.                                                                                                                                                                                                                                                                                                            |
| `coverImage`   | no       | Path under `/public` or an absolute URL (e.g. ImageKit), used as the in-page cover/hero image. Also used as the OG/Twitter card image fallback if `ogImage` isn't set.                                                                                                                                                                                                        |
| `ogImage`      | no       | Path under `/public` or an absolute URL, used specifically for OG/Twitter card images, JSON-LD `image`, sitemap `<image:image>`, and RSS item image. Takes precedence over `coverImage` for those; falls back to `coverImage`, then to an auto-generated OG image if both are omitted.                                                                                        |
| `draft`        | no       | `true`/`false`, default `false`. **Local `.mdx` files only** — draft posts are visible in `npm run dev` but excluded from production, the blog index, sitemap, RSS feed, and related posts. For DB-stored posts (admin dashboard), the equivalent is the `status` field: `DRAFT` vs `PUBLISHED`.                                                                              |
| `featured`     | no       | `true`/`false`, default `false`. Featured posts render in a highlighted section above the regular grid on `/blog`.                                                                                                                                                                                                                                                            |
| `noindex`      | no       | `true`/`false`, default `false`. Sets `robots: noindex` and excludes the post from `sitemap-blog.xml`.                                                                                                                                                                                                                                                                        |
| `canonicalUrl` | no       | Overrides the default canonical URL (`/blog/[slug]`) — use for cross-posted content.                                                                                                                                                                                                                                                                                          |
| `series`       | no       | Object `{ name, part }`. Posts sharing a `series.name` get a series navigation box, ordered by `part`.                                                                                                                                                                                                                                                                        |

## Headings

Use `##` and `###` (h2/h3). Only these two levels are picked up by the **Table of Contents** sidebar — `#` (h1) and `####+` are not indexed. Headings automatically get slugified `id`s and become clickable anchors.

```mdx
## Section title

### Sub-section title
```

### Component form (`<Heading2>`/`<Heading3>`)

If you need to pass extra props to a heading — a custom `className`, or anything else `##` syntax can't carry — use the `Heading1`–`Heading4` components instead (registered in `MDXComponents.jsx`). They render identically to `h1`–`h4` (same styles, same auto-linking anchor), but **you must supply the `id` yourself**, since `rehype-slug` only auto-generates ids for real Markdown headings, not JSX components:

```mdx
<Heading2 id="what-is-a-chatbot" className="text-brand-600">
  What is a Chatbot & Why Your Company Needs This?
</Heading2>
```

Only `Heading2`/`Heading3` are picked up by the Table of Contents (matching the `##`/`###` rule above) — `Heading1`/`Heading4` render but aren't indexed. If you forget the `id` prop, the heading renders fine but silently won't appear in the ToC.

Optionally add a `toc` prop to show different (usually shorter) text in the sidebar than what's actually rendered in the heading itself:

```mdx
<Heading2 id="what-is-a-chatbot" toc="Know about chatbot">
  What is a Chatbot & Why Your Company Needs This?
</Heading2>
```

The page still shows the full heading text; only the Table of Contents entry uses `toc`. Omit it to have the ToC just use the heading's own text (the default, unchanged behavior).

### Section / subsection structure for the animated ToC line

The sidebar ([TableOfContents.jsx](../../../components/blog/TableOfContents.jsx)) draws a single stepped line down the `##`/`###` outline, with an animated blue segment that highlights your current position as you scroll. To get the intended effect:

- Treat every `##` as a **section** and every `###` under it as that section's **subsections** — write them in that nesting, not as flat headings.
- A section can have zero, one, or many subsections; each is fine and renders correctly (a section with no subsections just gets a dot marker, no fill line).
- The line steps left/right at each depth change, so keep heading depth consistent — don't skip from `##` straight to a deeper level or mix h4 in, since only h2/h3 are indexed.

Example outline:

```mdx
## Section A

### Subsection 1

### Subsection 2

## Section B

### Subsection 1

## Section C
```

As the reader scrolls, the highlighted line fills from a section's heading down to whichever of its subsections is currently active, then resets when they reach the next section — so write each section's subsections as a coherent, self-contained group rather than reusing one subsection across multiple sections.

## Paragraphs

Plain text separated by a blank line becomes a paragraph, rendered via a registered `p` override in `MDXComponents.jsx`.

If your source text has inconsistent line-wrapping (e.g. copy-pasted from a doc with hard-wrapped lines instead of blank lines between paragraphs), a single `\n` won't start a new paragraph — Markdown only breaks paragraphs on a truly blank line, so wrapped text collapses into one paragraph.

To sidestep this, wrap each paragraph explicitly in a `<Paragraph>` component instead of relying on blank-line detection:

```mdx
<Paragraph>
  Hello everyone! If you've landed here, it's likely because you're eager to
  learn the ins and outs of building a chatbot.
</Paragraph>

<Paragraph>
  You might be asking yourself, "What is the actual value of having a chatbot?"
</Paragraph>
```

Each `<Paragraph>` renders as its own separate block regardless of internal line wrapping, and accepts a `className` prop for one-off styling. Internally it renders a `<div>` (not a `<p>`) — MDX auto-wraps the text you put inside it in its own `<p>`, so wrapping that in another `<p>` would be invalid, hydration-breaking HTML.

## Basic Markdown

Standard Markdown is supported, plus GitHub Flavored Markdown (`remark-gfm`):

- **Bold**, _italic_, ~~strikethrough~~
- Bullet and numbered lists
- Tables
- Footnotes (`Some text[^1]` ... `[^1]: The footnote.`)

### Lists

Plain `-`/`*` (bullet) and `1.`/`2.` (numbered) Markdown lists render via registered `ul`/`ol`/`li` overrides in `MDXComponents.jsx`, styled to match paragraph typography — no special component needed for the common case:

```mdx
- A website URL
- A single page
- A sitemap
- Documents you upload
```

```mdx
| Before   | After  |
| -------- | ------ |
| 1,200/mo | 480/mo |
```

- Task lists: `- [ ] todo`, `- [x] done`
- Autolinked bare URLs (`https://example.com`)

## Math

Inline and block math via KaTeX (`remark-math` + `rehype-katex`):

```mdx
Inline: $E = mc^2$

Block:

$$
\sum_{i=1}^n i = \frac{n(n+1)}{2}
$$
```

## Links

```mdx
[Internal page](/pricing)
[External site](https://example.com)
```

- Links starting with `/` or `#` are treated as internal and rendered with Next.js `<Link>`.
- Any other link opens in a new tab with `rel="noopener noreferrer"` automatically.
- `npm run lint:blog` checks for internal `/blog/[slug]` links pointing at slugs that don't exist, and images missing alt text.

## Images

```mdx
![Alt text](/images/screenshot.png)
```

- Path should be relative to `/public`.
- Rendered via `next/image` at 1200×630, wrapped in a rounded/bordered container. Always provide meaningful alt text — `npm run lint:blog` flags images without it.

### Component form (`<BlogImage>`)

For a `className` on the wrapper, or an optional caption below the image, use the `BlogImage` component instead:

```mdx
<BlogImage
  src="/images/screenshot.png"
  alt="Dashboard screenshot showing the chatbot builder"
  caption="The ContextGPT chatbot builder"
  className="my-10"
/>
```

### Hosting images on ImageKit

Blog images (cover images and in-post images) should be hosted on **ImageKit** instead of `/public` — keeps the repo/deploy bundle small and gets CDN delivery + automatic format optimization.

1. Upload the image directly via the [ImageKit dashboard](https://imagekit.io/dashboard) (drag-and-drop) — no upload tooling exists in this repo, and none is needed.
2. Copy the resulting file URL (looks like `https://ik.imagekit.io/your-id/blog/my-image.png`).
3. Use it directly as `coverImage` in frontmatter, or in an `![alt](url)` tag in the post body — same as any other image:

   ```mdx
   coverImage: "https://ik.imagekit.io/your-id/blog/my-image.png"
   ```

`ik.imagekit.io` is whitelisted in `next.config.mjs` under `images.remotePatterns`, so `next/image` (used by `BlogList`, `AuthorCard`, `AuthorBar`, etc.) can optimize it like any other remote image. If you switch to a different ImageKit account/custom domain, add its hostname there too.

## Code Blocks

Fenced code blocks with a language tag get syntax highlighting (`rehype-pretty-code`, GitHub Dark theme):

````mdx
```ts
const x: number = 42;
```
````

Plain/untagged blocks (e.g. \`\`\`text) render as plain formatted output — useful for sample data or terminal output:

````mdx
```text
Ticket volume before AI:  1,200 / month
Ticket volume after AI:     480 / month
```
````

## Callouts

Blockquotes starting with a special marker render as styled callout boxes instead of plain quotes:

```mdx
> [!NOTE]
> Neutral, informational callout (blue).

> [!TIP]
> Helpful tip or best practice (green).

> [!WARNING]
> Something the reader should be careful about (amber).
```

A plain blockquote without one of these markers renders as a normal italic quote:

```mdx
> Just a regular quote.
```

### Component form (`<Callout>`)

If you need a `className` or want to avoid the `[!KIND]` text-prefix convention, use the `Callout` component directly:

```mdx
<Callout kind="TIP" className="my-8">
  Helpful tip or best practice (green).
</Callout>
```

`kind` is one of `NOTE` (blue, default), `TIP` (green), or `WARNING` (amber) — same three styles as the blockquote markers above.

## Interactive components

These are registered globally (`src/components/blog/MDXComponents.jsx`) — use them directly as JSX inside `.mdx` files.

**Heading1 / Heading2 / Heading3 / Heading4, Paragraph, Callout, BlogImage** — component equivalents of plain-Markdown headings/paragraphs/callouts/images for when you need extra props (`className`, `id`, `caption`, etc.). See the [Headings](#component-form-heading2heading3), [Paragraphs](#paragraphs), [Callouts](#component-form-callout), and [Images](#component-form-blogimage) sections above for usage — documented there instead of duplicated here since they mirror existing Markdown syntax rather than being new interactive widgets.

**Tabs**

````mdx
<Tabs>
  <Tab label="npm">```bash npm install contextgpt ```</Tab>
  <Tab label="pnpm">```bash pnpm add contextgpt ```</Tab>
</Tabs>
````

**Accordion**

```mdx
<Accordion>
  <AccordionItem title="Do I need a credit card?">
    No, the free plan doesn't require one.
  </AccordionItem>
  <AccordionItem title="Can I cancel anytime?">
    Yes, from your billing settings.
  </AccordionItem>
</Accordion>
```

**CodeGroup** — multiple named code panes with a tab strip:

````mdx
<CodeGroup>
  <CodeGroupItem title="app.ts">```ts console.log("hello"); ```</CodeGroupItem>
  <CodeGroupItem title="app.py">```python print("hello") ```</CodeGroupItem>
</CodeGroup>
````

**FileTree**

```mdx
<FileTree>
  <FileTreeItem name="src" folder>
    <FileTreeItem name="index.ts" />
    <FileTreeItem name="utils.ts" />
  </FileTreeItem>
  <FileTreeItem name="package.json" />
</FileTree>
```

**YouTube embed**

```mdx
<YouTube id="dQw4w9WgXcQ" title="Demo video" />
```

## Manually linking a related post

`RelatedPosts.jsx` (plural) is the automatic, tag-based "Related posts" section shown at the bottom of every post — see [What's automatic](#whats-automatic-dont-set-manually) below.

For a **one-off manual link** to a specific post (e.g. referencing a specific guide inline in the body, outside the automatic section), use the `RelatedPost` component (singular) — takes just a `title` and `link`:

```jsx
<RelatedPost
  title="How to Reduce Support Tickets by 60% with AI"
  link="/blog/reduce-support-tickets-with-ai"
/>
```

Source: [RelatedPost.jsx](../../../components/blog/RelatedPost.jsx). It is not currently registered in `MDXComponents.jsx`, so import it directly wherever you need it in JSX (not usable bare inside `.mdx` content until registered).

## Categories & Featured Posts

- Set `category` in frontmatter to group posts under a single label. The `/blog` filter bar switches to category mode automatically once any post has one; otherwise it falls back to filtering by `tags`.
- Set `featured: true` to pin a post in the highlighted section at the top of `/blog`.

## Series

Give each post in a series the same `series.name` and an increasing `series.part`:

```mdx
series: { name: "Migrating to ContextGPT", part: 1 }
```

Every post in that series shows a series navigation box listing all parts, with the current one highlighted.

## Authors

Authors are defined centrally in `src/lib/authors.js`, not embedded per-post. Each entry is keyed by an id (slug) and can carry `name`, `avatar`, `title`, `bio`, and `socials` (`twitter`, `linkedin`, `website`).

To add a new author:

1. Open `src/lib/authors.js` and add an entry to the `AUTHORS` object, keyed by a short kebab-case id:

   ```js
   "krishna-gupta": {
     slug: "krishna-gupta",
     name: "Krishna Gupta",
     avatar: null, // or a path under /public
     title: "Founder @ ContextGPT",
     bio: "A short bio shown on the author's page.",
     socials: { twitter: null, linkedin: null, website: null },
   },
   ```

2. Reference that id in a post's frontmatter:

   ```mdx
   author: "krishna-gupta"
   ```

   For co-authored posts, use an array of ids instead:

   ```mdx
   author: ["krishna-gupta", "jane-doe"]
   ```

That's it — `author` in frontmatter is just the registry key as a string (or an array of keys), not an inline object. Each id is resolved to the full author record at read time via `getAuthorBySlug()`, so every post exposes `post.author` (the primary/first author, as `{ slug, name, avatar, title, bio, socials }`) and `post.authors` (the full array, same shape, always at least one entry) regardless of what's in the MDX file.

Each author automatically gets an archive page at `/blog/author/[slug]` (avatar, title, bio, social links, and a grid of their posts). The author name in the post header (`AuthorBar`) links there automatically. Authors with zero posts still get a page (with an empty state) as long as they exist in the registry.

## SEO fields

- `canonicalUrl` — set when cross-posting content elsewhere; overrides the default `/blog/[slug]` canonical.
- `noindex` — excludes the post from search indexing and from `sitemap-blog.xml`.
- `keywords` — array passed to the page's `<meta name="keywords">` (low SEO weight — Google ignores this tag) **and** to the JSON-LD `keywords` property (combined with `tags`), which AI crawlers and answer engines use for topical classification. Still worth filling in for GEO/AEO purposes even though it doesn't move classic search rankings.

## What's automatic (don't set manually)

- **Reading time** — computed from word count.
- **Table of Contents** — built from all `##`/`###` headings, plus any `<Heading2 id="...">`/`<Heading3 id="...">` components that have an explicit `id` prop.
- **Related posts** — computed from shared `tags` (falls back to filling with other recent posts if fewer than 3 matches).
- **Prev/Next navigation** — based on `publishedAt` order across all posts.
- **JSON-LD structured data** — generated from frontmatter via `src/lib/seo.js`, emitted as two `<script>` blocks on every post:
  - `BlogPosting` — includes a `Person` author (name, author-archive URL, and `sameAs` links built from the author's `socials` in `src/lib/authors.js`), a `publisher` (ContextGPT org + logo), `image` (resolved via `getPostImageUrl`: `ogImage` → `coverImage` → auto-generated OG image, so it's never missing), `inLanguage`, `wordCount`, `timeRequired` (derived from reading time), and combined `tags`+`keywords`.
  - `BreadcrumbList` — Home → Blog → post title.
- **Sitemap image/priority** — `sitemap-blog.xml` includes an `<image:image>` tag per post (using the same `getPostImageUrl` resolution as JSON-LD) and boosts `priority` to `0.9` for `featured: true` posts (`0.6` otherwise).
- **RSS feed image & freshness** — each `/blog/rss.xml` item includes an image (via `getPostImageUrl`) and uses `updatedAt` (falling back to `publishedAt`) as its date, so feed readers see accurate freshness.
- **Missing alt-text warning** — in `npm run dev`, an image without `alt` text logs a console warning naming the file, in addition to the hard `npm run lint:blog` check.
- **Search index** — the `/blog` search box fuzzy-matches title/description/tags client-side (Fuse.js); no manual indexing needed.
- **Pagination** — the blog index paginates at 9 posts/page automatically once there are enough posts.
- **OG image** — resolved via `getPostImageUrl` (`src/lib/seo.js`): `ogImage` takes precedence, then `coverImage`, then an auto-generated fallback (`opengraph-image.jsx`) from the title/author when neither is set.
- **RSS feed** — available at `/blog/rss.xml`, generated from all non-draft posts.
- **Sitemap** — non-draft, non-`noindex` posts are included in `/sitemap-blog.xml` automatically.
- **robots.txt** — served from `src/app/robots.js`, points at `/sitemap.xml`.

## Adding a new post checklist

1. Create `content/blog/your-slug.mdx` and iterate locally (see [The two ways to publish a post](#the-two-ways-to-publish-a-post) above).
2. Fill in frontmatter (`title`, `description`, `publishedAt` at minimum). Invalid or missing required fields will fail the build with a clear error naming the file.
3. Write content using `##`/`###` headings so the TOC works.
4. Use `[!NOTE]` / `[!TIP]` / `[!WARNING]` callouts, `<Tabs>`, `<Accordion>`, `<CodeGroup>`, etc. where useful instead of plain emphasis.
5. Run `npm run lint:blog` to catch missing image alt text or broken internal links.
6. Preview `/blog/your-slug` locally, then publish it via the [Blog Admin Dashboard](#the-two-ways-to-publish-a-post) (paste the content in, set `status: PUBLISHED`) — this is what actually makes it live in production, since production only reads from the DB.
7. Delete the local `content/blog/your-slug.mdx` file once it's live in the DB, so it doesn't shadow the published version in future local dev sessions.

## Known gap

`NewsletterCTA` (rendered at the bottom of every post) is UI-only — its submit handler isn't wired to an email service yet. Hook it up in `src/components/blog/NewsletterCTA.jsx` before relying on it to actually collect subscribers.

## Do also add some refference website

Website that talk about some similar topic to our blog should be added like IMB, medium, etc. these should be unicorn companies

add the link with utm param is must -> https://example.com/?utm_source=contextgpt&utm_medium=referral&utm_campaign=blog

Or for a specific blog:

https://example.com/?utm_source=contextgpt&utm_medium=blog&utm_campaign=ai_chatbot_guide
Common UTM parameters
Parameter Purpose Example
utm_source Who sent the traffic contextgpt
utm_medium Type of traffic referral, blog, partner
utm_campaign Marketing campaign summer_launch, chatbot_guide
utm_content Different link/button variants cta_button, footer_link
utm_term Paid search keyword (mostly ads) ai+chatbot

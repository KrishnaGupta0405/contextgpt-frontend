# Writing a Blog Post

Blog posts live in `content/blog/*.mdx`. Each file is one post. The filename (minus `.mdx`) becomes the URL slug, e.g. `my-post.mdx` → `/blog/my-post`.

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
draft: false
featured: false
noindex: false
canonicalUrl: null
series: null
---
```

Frontmatter is validated with a Zod schema (`src/lib/blogSchema.js`) when the post is read. **A missing required field or wrong type throws a build error** naming the offending file — you'll see it immediately in `npm run dev`/`npm run build` output, not as a silently broken page.

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Page `<title>` and `<h1>`-equivalent metadata. |
| `description` | yes | Used for SEO meta description, OG, and Twitter cards. |
| `publishedAt` | yes | ISO date string (`YYYY-MM-DD`). Posts are sorted newest-first by this field. |
| `author` | no | Author id string, e.g. `"krishna-gupta"` — must match a key in the author registry (`src/lib/authors.js`). Defaults to the registry's `DEFAULT_AUTHOR_SLUG` if omitted. |
| `updatedAt` | no | ISO date string. Shown as "last modified" if present. |
| `tags` | no | Array of strings. Used for tag pills, related posts, and as a fallback category filter if `category` isn't set anywhere. |
| `category` | no | Single string. Once any post has a `category`, the blog index filter switches from tag-based to category-based. |
| `keywords` | no | Array of strings. Passed through to page `<meta name="keywords">`. |
| `coverImage` | no | Path under `/public`, e.g. `/icons/foo.svg`. Used for OG/Twitter card images and falls back to an auto-generated OG image if omitted. |
| `draft` | no | `true`/`false`, default `false`. Draft posts are visible in `npm run dev` but excluded from production builds, the blog index, sitemap, RSS feed, and related posts. |
| `featured` | no | `true`/`false`, default `false`. Featured posts render in a highlighted section above the regular grid on `/blog`. |
| `noindex` | no | `true`/`false`, default `false`. Sets `robots: noindex` and excludes the post from `sitemap-blog.xml`. |
| `canonicalUrl` | no | Overrides the default canonical URL (`/blog/[slug]`) — use for cross-posted content. |
| `series` | no | Object `{ name, part }`. Posts sharing a `series.name` get a series navigation box, ordered by `part`. |

## Headings

Use `##` and `###` (h2/h3). Only these two levels are picked up by the **Table of Contents** sidebar — `#` (h1) and `####+` are not indexed. Headings automatically get slugified `id`s and become clickable anchors.

```mdx
## Section title
### Sub-section title
```

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

## Basic Markdown

Standard Markdown is supported, plus GitHub Flavored Markdown (`remark-gfm`):

- **Bold**, *italic*, ~~strikethrough~~
- Bullet and numbered lists
- Tables
- Footnotes (`Some text[^1]` ... `[^1]: The footnote.`)

```mdx
| Before | After |
|---|---|
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

## Interactive components

These are registered globally (`src/components/blog/MDXComponents.jsx`) — use them directly as JSX inside `.mdx` files.

**Tabs**

```mdx
<Tabs>
  <Tab label="npm">
    ```bash
    npm install contextgpt
    ```
  </Tab>
  <Tab label="pnpm">
    ```bash
    pnpm add contextgpt
    ```
  </Tab>
</Tabs>
```

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

```mdx
<CodeGroup>
  <CodeGroupItem title="app.ts">
    ```ts
    console.log("hello");
    ```
  </CodeGroupItem>
  <CodeGroupItem title="app.py">
    ```python
    print("hello")
    ```
  </CodeGroupItem>
</CodeGroup>
```

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

That's it — `author` in frontmatter is just the registry key as a string, not an inline object. `getAuthorBySlug()` resolves it to the full author record at read time, so every post exposes `post.author` as `{ slug, name, avatar, title, bio, socials }` regardless of what's in the MDX file.

Each author automatically gets an archive page at `/blog/author/[slug]` (avatar, title, bio, social links, and a grid of their posts). The author name in the post header (`AuthorBar`) links there automatically. Authors with zero posts still get a page (with an empty state) as long as they exist in the registry.

## SEO fields

- `canonicalUrl` — set when cross-posting content elsewhere; overrides the default `/blog/[slug]` canonical.
- `noindex` — excludes the post from search indexing and from `sitemap-blog.xml`.
- `keywords` — array passed to the page's `<meta name="keywords">` (low SEO weight — Google ignores this tag) **and** to the JSON-LD `keywords` property (combined with `tags`), which AI crawlers and answer engines use for topical classification. Still worth filling in for GEO/AEO purposes even though it doesn't move classic search rankings.

## What's automatic (don't set manually)

- **Reading time** — computed from word count.
- **Table of Contents** — built from all `##`/`###` headings.
- **Related posts** — computed from shared `tags` (falls back to filling with other recent posts if fewer than 3 matches).
- **Prev/Next navigation** — based on `publishedAt` order across all posts.
- **JSON-LD structured data** — generated from frontmatter via `src/lib/seo.js`, emitted as two `<script>` blocks on every post:
  - `BlogPosting` — includes a `Person` author (name, author-archive URL, and `sameAs` links built from the author's `socials` in `src/lib/authors.js`), a `publisher` (ContextGPT org + logo), `image` (falls back to the auto-generated OG image when `coverImage` isn't set, so it's never missing), `inLanguage`, `wordCount`, `timeRequired` (derived from reading time), and combined `tags`+`keywords`.
  - `BreadcrumbList` — Home → Blog → post title.
- **Sitemap image/priority** — `sitemap-blog.xml` includes an `<image:image>` tag per post (using the same cover/OG-fallback image as JSON-LD) and boosts `priority` to `0.9` for `featured: true` posts (`0.6` otherwise).
- **RSS feed image & freshness** — each `/blog/rss.xml` item includes an image (cover or OG fallback) and uses `updatedAt` (falling back to `publishedAt`) as its date, so feed readers see accurate freshness.
- **Missing alt-text warning** — in `npm run dev`, an image without `alt` text logs a console warning naming the file, in addition to the hard `npm run lint:blog` check.
- **Search index** — the `/blog` search box fuzzy-matches title/description/tags client-side (Fuse.js); no manual indexing needed.
- **Pagination** — the blog index paginates at 9 posts/page automatically once there are enough posts.
- **OG image** — auto-generated per post (`opengraph-image.jsx`) from the title/author when `coverImage` isn't set; `coverImage` takes precedence when present.
- **RSS feed** — available at `/blog/rss.xml`, generated from all non-draft posts.
- **Sitemap** — non-draft, non-`noindex` posts are included in `/sitemap-blog.xml` automatically.
- **robots.txt** — served from `src/app/robots.js`, points at `/sitemap.xml`.

## Adding a new post checklist

1. Create `content/blog/your-slug.mdx`.
2. Fill in frontmatter (`title`, `description`, `publishedAt` at minimum). Invalid or missing required fields will fail the build with a clear error naming the file.
3. Write content using `##`/`###` headings so the TOC works.
4. Use `[!NOTE]` / `[!TIP]` / `[!WARNING]` callouts, `<Tabs>`, `<Accordion>`, `<CodeGroup>`, etc. where useful instead of plain emphasis.
5. Run `npm run lint:blog` to catch missing image alt text or broken internal links.
6. Ask a teammate to run the dev server and preview `/blog/your-slug` before publishing — this repo's workflow does not auto-verify pages.

## Known gap

`NewsletterCTA` (rendered at the bottom of every post) is UI-only — its submit handler isn't wired to an email service yet. Hook it up in `src/components/blog/NewsletterCTA.jsx` before relying on it to actually collect subscribers.

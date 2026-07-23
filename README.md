# Frontend Dashboard

## Cloudflare Workers deploy — size limit incident (2026-07-23)

**Problem**: `npm run deploy` (OpenNext → Cloudflare Workers) started failing with:

```
Your Worker exceeded the size limit of 3 MiB. [code: 10027]
```

`handler.mjs` (the bundled server function) was ~28 MB raw. Cloudflare checks the
**gzip-compressed** size against the limit (3 MiB free tier / 10 MiB paid), not the raw
file size — so this only started failing once real content pushed it over that
compressed threshold.

**Root cause** (found via `handler.mjs.meta.json`, the esbuild metafile — inspect with
`outputs["<path>/handler.mjs"].inputs`, sorted by `bytesInOutput`):

1. `rehype-pretty-code` + `shiki` — pulled in via `src/lib/mdx.js` for MDX code-block
   syntax highlighting. Shiki's top-level package (`import { createHighlighter } from
   "shiki"`) statically re-exports its *full* language bundle (`@shikijs/langs/dist/*`,
   100+ languages including things like `emacs-lisp.mjs` at 761 KiB) — esbuild can't
   tree-shake that away even if you only request a handful of langs at runtime.
2. `rehype-katex` + `remark-math` + `katex` — math rendering support, plus a stray
   `import "katex/dist/katex.min.css"` in `blog/layout.jsx`.
3. **None of the 4 existing blog posts in `content/blog/` use code fences or math
   syntax** — this tooling was 100% dead weight for actual content.
4. `next/og` (`ImageResponse`) in `blog/[slug]/opengraph-image.jsx` — bundles
   `resvg.wasm` (1.3 MB) + `yoga.wasm` (87 KB) + a font file, used to dynamically
   render OG share images. Turned out to be dead code too: every post's frontmatter
   already sets `ogImage` (a pre-made `.avif`/`.png` hosted on ImageKit CDN), and
   `getPostImageUrl()` in `src/lib/seo.js` prefers that over the dynamic route — so
   the dynamic OG route never actually fired in production.

**Fix applied**:

- Uninstalled `rehype-katex`, `remark-math`, `katex`, `rehype-pretty-code`, `shiki`.
- Stripped the math/code-highlighting plugin wiring out of `src/lib/mdx.js` (now just
  `remarkGfm` + `rehypeSlug` + `rehypeAutolinkHeadings` + heading-extraction).
- Removed the dead `katex/dist/katex.min.css` import from `blog/layout.jsx`.
- Deleted `blog/[slug]/opengraph-image.jsx` entirely; `getPostImageUrl()` now falls
  back to a static `public/og-img.png` instead of the dynamic route when a post has
  no `ogImage`/`coverImage` set.
- Rewrote `src/components/ui/ShikiCodeBlock.jsx` (used on dashboard/installation
  panel pages, unrelated to blog) to a plain Tailwind-styled `<pre>` block with no
  syntax highlighting, since shiki is no longer a dependency.

**Result**: `handler.mjs` went from ~28 MB → ~13 MB raw. Deploy now succeeds —
gzip upload total is **~3 MB**, comfortably under the paid-plan 10 MiB limit.

**Where we stand**:

- Blog posts currently use only plain markdown + `BlogImage`/`Paragraph`/
  `Heading2`–`4`/`RelatedPost`. Other registered MDX components (`Tabs`, `Accordion`,
  `CodeGroup`, `FileTree`, `YouTube`, `Giphy`, `Callout`, code-fence `pre` override)
  exist in `src/components/blog/MDXComponents.jsx` but aren't used by any post yet —
  they're cheap (no heavy deps), so left in place.
- If a future post needs syntax-highlighted code blocks or math, don't just
  `npm install shiki`/`katex` again — use shiki's fine-grained bundle
  (`shiki/core` + `shiki/engine/*` + individual `@shikijs/langs/*` imports) scoped to
  only the languages actually needed, not the `"shiki"` convenience package.
- **Growth expectation**: adding more blog posts (`.mdx` files) or simple service
  pages is cheap — they reuse the same shared chunks (Next runtime, Framer Motion,
  Radix UI, etc.) already in the bundle, so the gzip size grows only marginally per
  page. What actually grows the bundle meaningfully is adding a *new heavy dependency*
  that isn't already shared elsewhere (e.g. a charting lib, a wasm-based tool). When in
  doubt, check the `Total Upload: ... / gzip: ...` line printed at the end of
  `npm run deploy`.

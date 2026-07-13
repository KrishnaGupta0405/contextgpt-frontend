// Sync script: reads every content/blog/*.mdx file and creates or updates the
// matching row in the backend's blog_posts table via the admin CRUD API.
// Run from Frontend Dashboard/: node scripts/seed-blog-posts.js
//
// The /api/v1/blog/* routes have no auth (admin-only tool, not publicly exposed).
//
// Usage:
//   BACKEND_API_URL=http://localhost:8000/api/v1 node scripts/seed-blog-posts.js

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8000/api/v1";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchExistingPosts() {
  const res = await fetch(`${API_BASE_URL}/blog/posts?limit=1000`);
  if (!res.ok) throw new Error(`Failed to list existing posts: ${res.status}`);
  const json = await res.json();
  const posts = json?.data?.posts ?? [];
  return new Map(posts.map((p) => [p.slug, p.id]));
}

async function createPost(body) {
  const res = await fetch(`${API_BASE_URL}/blog/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

async function updatePost(id, body) {
  const res = await fetch(`${API_BASE_URL}/blog/posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.log("No content/blog directory found, nothing to seed.");
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  console.log(`Found ${files.length} local .mdx files.`);

  const existingPosts = await fetchExistingPosts();

  let created = 0;
  let updated = 0;

  for (const filename of files) {
    const slug = slugify(filename.replace(/\.mdx$/, ""));
    const existingId = existingPosts.get(slug);

    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
    const { data, content } = matter(raw);
    const authorField = data.author ?? [];
    const authorSlugs = Array.isArray(authorField) ? authorField : [authorField];

    const body = {
      slug,
      title: data.title,
      description: data.description,
      content,
      status: data.draft ? "DRAFT" : "PUBLISHED",
      tags: data.tags ?? [],
      keywords: data.keywords ?? [],
      category: data.category ?? undefined,
      featured: data.featured ?? false,
      noindex: data.noindex ?? false,
      authorSlugs,
      coverImage: data.coverImage ?? undefined,
      ogImage: data.ogImage ?? undefined,
      canonicalUrl: data.canonicalUrl ?? undefined,
      seriesName: data.series?.name,
      seriesPart: data.series?.part,
      publishedAt: data.publishedAt,
    };

    try {
      if (existingId) {
        await updatePost(existingId, body);
        console.log(`UPDATE ${slug}`);
        updated++;
      } else {
        await createPost(body);
        console.log(`OK    ${slug}`);
        created++;
      }
    } catch (err) {
      console.error(`FAIL  ${slug}: ${err.message}`);
    }
  }

  console.log(`\nDone. Created ${created}, updated ${updated} of ${files.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

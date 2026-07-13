import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { blogFrontmatterSchema } from './blogSchema';
import { getAuthorBySlug, getAllAuthorEntries } from './authors';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1';

// Local .mdx files are a dev-only authoring convenience: drop a file in
// content/blog/ to preview instantly without touching the DB. In production
// only DB-backed (API) posts are ever served.
const LOCAL_FILES_ENABLED = process.env.NODE_ENV !== 'production';

function readLocalPostFile(filename) {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  let frontmatter;
  try {
    frontmatter = blogFrontmatterSchema.parse(data);
  } catch (err) {
    throw new Error(`Invalid frontmatter in content/blog/${filename}: ${err.message}`);
  }

  return normalizePost({
    slug,
    content,
    ...frontmatter,
    authorSlugs: frontmatter.author,
    updatedAt: frontmatter.updatedAt,
    source: 'local',
  });
}

function readAllLocalPostFiles() {
  if (!LOCAL_FILES_ENABLED || !fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(readLocalPostFile);
}

// Normalizes either a local-file post or a DB API post into one shared shape.
function normalizePost(raw) {
  const authorSlugs = raw.authorSlugs?.length ? raw.authorSlugs : [];
  const authors = authorSlugs.length ? authorSlugs.map(getAuthorBySlug) : [getAuthorBySlug()];

  const stats = readingTime(raw.content || '');

  return {
    slug: raw.slug,
    content: raw.content,
    title: raw.title,
    description: raw.description,
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt ?? null,
    canonicalUrl: raw.canonicalUrl ?? null,
    coverImage: raw.coverImage ?? null,
    tags: raw.tags ?? [],
    category: raw.category ?? null,
    keywords: raw.keywords ?? [],
    draft: raw.draft ?? false,
    featured: raw.featured ?? false,
    noindex: raw.noindex ?? false,
    series: raw.series ?? null,
    author: authors[0],
    authors,
    readingTime: stats.text,
    source: raw.source,
  };
}

function mapApiPostToRaw(post) {
  return {
    slug: post.slug,
    content: post.content,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    canonicalUrl: post.canonicalUrl,
    coverImage: post.coverImage,
    tags: post.tags ?? [],
    category: post.category,
    keywords: post.keywords ?? [],
    draft: post.status !== 'PUBLISHED',
    featured: post.featured ?? false,
    noindex: post.noindex ?? false,
    series: post.seriesName ? { name: post.seriesName, part: post.seriesPart } : null,
    authorSlugs: post.authorSlugs ?? [],
    source: 'api',
  };
}

async function fetchAllApiPosts() {
  try {
    const res = await fetch(`${API_BASE_URL}/website/blog/posts`, {
      next: { revalidate: 3600, tags: ['blog-posts'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const posts = json?.data?.posts ?? [];
    return posts.map((p) => normalizePost(mapApiPostToRaw(p)));
  } catch (err) {
    console.error('[blog] Failed to fetch posts from API:', err.message);
    return [];
  }
}

async function fetchApiPostBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/website/blog/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600, tags: ['blog-posts', `blog-post-${slug}`] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const post = json?.data?.post;
    return post ? normalizePost(mapApiPostToRaw(post)) : null;
  } catch (err) {
    console.error(`[blog] Failed to fetch post "${slug}" from API:`, err.message);
    return null;
  }
}

async function readAllPosts() {
  const localPosts = readAllLocalPostFiles();
  const apiPosts = await fetchAllApiPosts();

  const localSlugs = new Set(localPosts.map((p) => p.slug));
  const merged = [...localPosts, ...apiPosts.filter((p) => !localSlugs.has(p.slug))];

  return merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export async function getAllPosts() {
  const posts = await readAllPosts();
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? posts.filter((p) => !p.draft) : posts;
}

export async function getPostBySlug(slug) {
  if (LOCAL_FILES_ENABLED) {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return readLocalPostFile(`${slug}.mdx`);
    }
  }
  return fetchApiPostBySlug(slug);
}

export async function getAdjacentPosts(slug) {
  const posts = await getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export async function getRelatedPosts(post, limit = 3) {
  const posts = (await getAllPosts()).filter((p) => p.slug !== post.slug);

  const scored = posts
    .map((p) => ({
      post: p,
      score: p.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const related = scored.map((entry) => entry.post);

  if (related.length < limit) {
    const fillers = posts.filter((p) => !related.includes(p));
    related.push(...fillers.slice(0, limit - related.length));
  }

  return related.slice(0, limit);
}

export async function getFeaturedPosts() {
  return (await getAllPosts()).filter((p) => p.featured);
}

export async function getAllCategories() {
  const categories = new Set();
  (await getAllPosts()).forEach((p) => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories);
}

export async function getPostsByCategory(category) {
  return (await getAllPosts()).filter((p) => p.category === category);
}

export async function getSeriesPosts(seriesName) {
  return (await getAllPosts())
    .filter((p) => p.series?.name === seriesName)
    .sort((a, b) => a.series.part - b.series.part);
}

export async function getAllAuthors() {
  const posts = await getAllPosts();
  return getAllAuthorEntries().map((author) => ({
    ...author,
    postCount: posts.filter((p) => p.authors.some((a) => a.slug === author.slug)).length,
  }));
}

export async function getPostsByAuthor(authorSlug) {
  return (await getAllPosts()).filter((p) => p.authors.some((a) => a.slug === authorSlug));
}

export async function getSearchIndex() {
  return (await getAllPosts()).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    category: p.category,
  }));
}

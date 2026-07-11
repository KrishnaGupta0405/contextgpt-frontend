import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { blogFrontmatterSchema } from './blogSchema';
import { getAuthorBySlug, getAllAuthorEntries } from './authors';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function readPostFile(filename) {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  let frontmatter;
  try {
    frontmatter = blogFrontmatterSchema.parse(data);
  } catch (err) {
    throw new Error(`Invalid frontmatter in content/blog/${filename}: ${err.message}`);
  }

  const stats = readingTime(content);

  return {
    slug,
    content,
    ...frontmatter,
    author: getAuthorBySlug(frontmatter.author),
    readingTime: stats.text,
  };
}

function readAllPostFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(readPostFile)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getAllPosts() {
  const posts = readAllPostFiles();
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? posts.filter((p) => !p.draft) : posts;
}

export function getPostBySlug(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readPostFile(`${slug}.mdx`);
}

export function getAdjacentPosts(slug) {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export function getRelatedPosts(post, limit = 3) {
  const posts = getAllPosts().filter((p) => p.slug !== post.slug);

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

export function getFeaturedPosts() {
  return getAllPosts().filter((p) => p.featured);
}

export function getAllCategories() {
  const categories = new Set();
  getAllPosts().forEach((p) => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories);
}

export function getPostsByCategory(category) {
  return getAllPosts().filter((p) => p.category === category);
}

export function getSeriesPosts(seriesName) {
  return getAllPosts()
    .filter((p) => p.series?.name === seriesName)
    .sort((a, b) => a.series.part - b.series.part);
}

export function getAllAuthors() {
  const posts = getAllPosts();
  return getAllAuthorEntries().map((author) => ({
    ...author,
    postCount: posts.filter((p) => p.author.slug === author.slug).length,
  }));
}

export function getPostsByAuthor(authorSlug) {
  return getAllPosts().filter((p) => p.author.slug === authorSlug);
}

export function getSearchIndex() {
  return getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    category: p.category,
  }));
}

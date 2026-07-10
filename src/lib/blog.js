import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function readPostFile(filename) {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    content,
    title: data.title,
    description: data.description,
    author: data.author ?? { name: 'ContextGPT Team' },
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt ?? null,
    tags: data.tags ?? [],
    coverImage: data.coverImage ?? null,
    readingTime: stats.text,
  };
}

export function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(readPostFile)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
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

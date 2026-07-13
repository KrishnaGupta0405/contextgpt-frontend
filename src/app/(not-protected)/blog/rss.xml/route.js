import { Feed } from "feed";
import { getAllPosts } from "@/lib/blog";
import { getPostImageUrl } from "@/lib/seo";

// ISR paused: see ISR_implementation.md for the Vercel Edge Function quota reasoning.
// export const revalidate = false;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = await getAllPosts();

  const feed = new Feed({
    title: "ContextGPT Blog",
    description: "Tips, guides, and insights on AI chatbots, customer support automation, and lead generation.",
    id: `${baseUrl}/blog`,
    link: `${baseUrl}/blog`,
    language: "en",
    favicon: `${baseUrl}/icons/Contextgpt_icon.svg`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ContextGPT`,
    feedLinks: { rss: `${baseUrl}/blog/rss.xml` },
  });

  posts
    .filter((post) => !post.noindex)
    .forEach((post) => {
      feed.addItem({
        title: post.title,
        id: `${baseUrl}/blog/${post.slug}`,
        link: `${baseUrl}/blog/${post.slug}`,
        description: post.description,
        author: (post.authors ?? [post.author]).map((author) => ({ name: author.name })),
        date: new Date(post.updatedAt ?? post.publishedAt),
        image: getPostImageUrl(post, baseUrl),
        category: post.tags.map((tag) => ({ name: tag })),
      });
    });

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/xml" },
  });
}

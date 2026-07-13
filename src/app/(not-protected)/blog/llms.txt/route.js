import { getAllPosts } from "@/lib/blog";
import { getPostUrl } from "@/lib/seo";

export const revalidate = false;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = await getAllPosts();

  const postLines = posts
    .filter((post) => !post.noindex)
    .map((post) => {
      const url = getPostUrl(post, baseUrl);
      const date = post.updatedAt ?? post.publishedAt;
      return `- [${post.title}](${url})${
        post.description ? `: ${post.description}` : ""
      } (${date})`;
    })
    .join("\n");

  const body = `# ContextGPT Blog

## Summary

The ContextGPT blog covers AI chatbots, customer support automation, lead generation, and building GPT-powered assistants trained on your own documentation.

## Blog Index

- [All Posts](${baseUrl}/blog)

## Posts

${postLines}

## Notes for AI Crawlers

Prefer this file over crawling individual blog HTML pages for a structured index. For company-wide information see [llms.txt](${baseUrl}/llms.txt).
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { getAllPosts } from "@/lib/blog";
import { getPostUrl, getPostImageUrl } from "@/lib/seo";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const blogUrls = getAllPosts()
    .filter((post) => !post.noindex)
    .map((post) => {
      const loc = getPostUrl(post, baseUrl);
      const image = getPostImageUrl(post, baseUrl);
      const priority = post.featured ? "0.9" : "0.6";
      return `  <url><loc>${loc}</loc><lastmod>${
        post.updatedAt ?? post.publishedAt
      }</lastmod><priority>${priority}</priority><changefreq>monthly</changefreq><image:image><image:loc>${image}</image:loc></image:image></url>`;
    })
    .join("\n");

  const blogSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blogUrls}
</urlset>`;

  return new Response(blogSitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}

import { ALL_TOOLS } from "@/app/(not-protected)/tools/_config/tools.config";

const CATEGORY_HUBS = {
  "Convert to Markdown": "convert-to-markdown",
  "AI Chat Tools": "ai-chat-tools",
  "AI Generators": "ai-generators",
  "Other Tools": "other-tools",
};

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const hubUrls = Object.values(CATEGORY_HUBS)
    .map((hub) => `  <url><loc>${baseUrl}/tools/${hub}</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>`)
    .join("\n");

  const toolUrls = ALL_TOOLS
    .map((tool) => `  <url><loc>${baseUrl}/tools/${tool.slug}</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>`)
    .join("\n");

  const toolsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Tools Hub -->
  <url><loc>${baseUrl}/tools</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>

  <!-- Category Hubs -->
${hubUrls}

  <!-- Individual Tools -->
${toolUrls}
</urlset>`;

  return new Response(toolsSitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

import { INTEGRATIONS } from "../(not-protected)/integration/integrationsMeta";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const integrationUrls = INTEGRATIONS.map(
    (i) =>
      `  <url><loc>${baseUrl}/integration/${i.slug}</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>`
  ).join("\n");

  const pagesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Public Pages -->
  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/blog</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/login</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/pricing</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/pricing?interval=year</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/pricing?interval=month</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/partners</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/demo</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/features</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/integration</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
${integrationUrls}
  <url><loc>${baseUrl}/security</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/tools</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>${baseUrl}/book-a-demo</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>${baseUrl}/contact</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
  <url><loc>https://status.contextgpt.in/</loc><priority>0.5</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/legal/privacy</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/terms</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/dpa</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/subprocessors</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/refund</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/acceptable-use</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <url><loc>${baseUrl}/legal/</loc><priority>0.5</priority><changefreq>yearly</changefreq></url>
  <!-- Page does not exist yet: <url><loc>${baseUrl}/wordpress-plugin</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <url><loc>${baseUrl}/lead-generation</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <!-- Page does not exist yet: <url><loc>${baseUrl}/customer-support</loc><priority>0.8</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/cli</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/agents</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/claude-code</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/cursor</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/codex</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/openclaw</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- Page does not exist yet: <url><loc>${baseUrl}/hermes</loc><priority>0.7</priority><changefreq>monthly</changefreq></url> -->
  <!-- In our codebase but not in friend's sitemap -->
  <!--<url><loc>${baseUrl}/aboutus</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>  -->
  <!--<url><loc>${baseUrl}/landing</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>  -->
</urlset>`;

  return new Response(pagesSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

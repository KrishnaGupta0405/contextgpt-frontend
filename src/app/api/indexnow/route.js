import { submitToIndexNow } from "@/lib/indexNow";

// Manually trigger: POST /api/indexnow?secret=YOUR_CRON_SECRET
// Submits all public marketing/tools/blog pages to IndexNow (Bing, Yandex, etc.)
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.INDEXNOW_TRIGGER_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contextgpt.co";
  const rootDomain = new URL(baseUrl).hostname.replace(/^www\./, "");

  const extractLocs = (xml) =>
    [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

  const isOwnDomain = (u) => {
    try {
      const host = new URL(u).hostname;
      return host === rootDomain || host.endsWith(`.${rootDomain}`);
    } catch {
      return false;
    }
  };

  const indexRes = await fetch(`${baseUrl}/sitemap.xml`);
  const childSitemapUrls = extractLocs(await indexRes.text()).filter(
    isOwnDomain
  );

  const pageUrlLists = await Promise.all(
    childSitemapUrls.map(async (sitemapUrl) => {
      const res = await fetch(sitemapUrl);
      return extractLocs(await res.text());
    })
  );

  const urls = [...new Set(pageUrlLists.flat())].filter(isOwnDomain);

  const result = await submitToIndexNow(urls);

  return Response.json({ submitted: urls.length, result });
}

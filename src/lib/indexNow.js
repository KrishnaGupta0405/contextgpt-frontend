const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// Submits one or more absolute URLs to IndexNow (Bing + Yandex + other participants).
// Docs: https://www.bing.com/indexnow/getstarted#implementation
export async function submitToIndexNow(urls) {
  const urlList = Array.isArray(urls) ? urls : [urls];
  if (!INDEXNOW_KEY || urlList.length === 0) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contextgpt.in";
  const host = new URL(baseUrl).host;

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  return { status: res.status, ok: res.ok };
}

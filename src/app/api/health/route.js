// Uptime probe for BetterStack — runs on the Edge runtime so it's billed as
// an edge request instead of a serverless function invocation on Vercel
export const runtime = "edge";

export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

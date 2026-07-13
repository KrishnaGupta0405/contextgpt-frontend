// Uptime probe for BetterStack — confirms the Next.js server is up and responding
export async function GET() {
  return Response.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

import { revalidatePath, revalidateTag } from "next/cache";

// Secured on-demand ISR endpoint, called by the backend after blog post
// create/update/publish/unpublish/delete/slug-change.
// POST /api/revalidate  header: x-revalidate-secret  body: { paths?: string[], tags?: string[] }
export async function POST(request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.FRONTEND_REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  const { paths = [], tags = [] } = await request.json().catch(() => ({}));

  for (const path of paths) {
    revalidatePath(path);
  }
  for (const tag of tags) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true, paths, tags, now: Date.now() });
}

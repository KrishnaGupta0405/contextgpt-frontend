// ISR paused: every route touching the blog (/blog, /blog/[slug], /blog/author/[name],
// and this /api/revalidate endpoint) was invoking a Vercel Edge Function on both cache-hit
// and revalidation, draining the Edge Function quota far faster than expected. Since Vercel's
// build-time limit is unlimited, blog content is now built at build time from the content/
// folder and served as plain static HTML/CSS, the old way. This endpoint is disabled until
// ISR is re-enabled — see ISR_implementation.md for the full writeup.

// import { revalidatePath, revalidateTag } from "next/cache";

// // Secured on-demand ISR endpoint, called by the backend after blog post
// // create/update/publish/unpublish/delete/slug-change.
// // POST /api/revalidate  header: x-revalidate-secret  body: { paths?: string[], tags?: string[] }
// export async function POST(request) {
//   const secret = request.headers.get("x-revalidate-secret");
//   if (!secret || secret !== process.env.FRONTEND_REVALIDATE_SECRET) {
//     return Response.json({ message: "Invalid secret" }, { status: 401 });
//   }
//
//   const { paths = [], tags = [] } = await request.json().catch(() => ({}));
//
//   for (const path of paths) {
//     revalidatePath(path);
//   }
//   for (const tag of tags) {
//     revalidateTag(tag);
//   }
//
//   return Response.json({ revalidated: true, paths, tags, now: Date.now() });
// }

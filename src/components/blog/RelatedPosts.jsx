import Link from "next/link";
import { Clock, Tag } from "lucide-react";

export default function RelatedPosts({ posts }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-100 pt-10">
      <h2 className="mb-6 text-xl font-bold text-slate-900">Related posts</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-md"
          >
            {post.tags[0] && (
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <Tag className="h-3 w-3" />
                {post.tags[0]}
              </span>
            )}
            <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-blue-600">
              {post.title}
            </h3>
            <span className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {post.readingTime}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

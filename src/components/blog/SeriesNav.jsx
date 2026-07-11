import Link from "next/link";
import { Layers } from "lucide-react";

export default function SeriesNav({ series, posts, currentSlug }) {
  if (!series || posts.length < 2) return null;

  return (
    <div className="my-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Layers className="h-4 w-4" />
        Series: {series.name}
      </div>
      <ol className="space-y-1.5">
        {posts.map((post) => (
          <li key={post.slug}>
            {post.slug === currentSlug ? (
              <span className="text-sm font-medium text-blue-700">
                {post.series.part}. {post.title}
              </span>
            ) : (
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm text-slate-600 hover:text-blue-700"
              >
                {post.series.part}. {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

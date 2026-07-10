import { Clock } from "lucide-react";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuthorBar({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 pb-6 text-sm text-slate-500">
      <span className="font-medium text-slate-700">{post.author.name}</span>
      <span>Published {formatDate(post.publishedAt)}</span>
      {post.updatedAt && <span>Updated {formatDate(post.updatedAt)}</span>}
      <span className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {post.readingTime}
      </span>
    </div>
  );
}

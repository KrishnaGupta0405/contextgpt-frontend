import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PrevNextNav({ prev, next }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-4 border-t border-slate-100 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <span className="mt-1 font-semibold text-slate-900 group-hover:text-blue-700">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col rounded-xl border border-slate-200 p-4 text-right transition-colors hover:border-blue-300 hover:bg-blue-50 sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1 text-xs font-medium text-slate-400">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="mt-1 font-semibold text-slate-900 group-hover:text-blue-700">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

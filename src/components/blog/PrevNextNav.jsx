import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PrevNextNav({ prev, next }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-4 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col items-start rounded-xl border border-slate-200 p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <span className="mt-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col items-end rounded-xl border border-slate-200 p-5 text-right no-underline transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="mt-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-700">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

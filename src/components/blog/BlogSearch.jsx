"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";

export default function BlogSearch({ index }) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: ["title", "description", "tags"],
        threshold: 0.35,
      }),
    [index]
  );

  const results = query.trim() ? fuse.search(query).slice(0, 8) : [];

  return (
    <section className="px-4 pt-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-full border border-slate-200 py-3 pl-11 pr-11 text-sm outline-none focus:border-blue-300"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {query.trim() && (
          <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No posts found.</p>
            ) : (
              results.map(({ item }) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="block border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

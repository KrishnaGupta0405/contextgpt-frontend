"use client";

import { useEffect, useState } from "react";

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        On this page
      </p>
      <ul className="space-y-2 border-l border-slate-200 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: (heading.depth - 2) * 12 + 12 }}>
            <a
              href={`#${heading.id}`}
              className={`block border-l-2 -ml-px pl-3 transition-colors ${
                activeId === heading.id
                  ? "border-blue-600 font-medium text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

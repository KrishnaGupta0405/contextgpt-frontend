"use client";

import { Children, useState } from "react";

export function CodeGroupItem({ title, children }) {
  return children;
}

export function CodeGroup({ children }) {
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);

  return (
    <div className="my-6">
      <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-slate-800 bg-[#0d1117] p-1.5">
        {items.map((item, i) => (
          <button
            key={item.props?.title ?? i}
            onClick={() => setActive(i)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              active === i
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {item.props?.title ?? `File ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="[&_div]:my-0 [&_div]:rounded-t-none">{items[active]}</div>
    </div>
  );
}

"use client";

import { Children, useState } from "react";

export function Tab({ children }) {
  return children;
}

export function Tabs({ children }) {
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-200">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
        {items.map((item, i) => (
          <button
            key={item.props.label ?? i}
            onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active === i
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item.props.label ?? `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="p-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {items[active]}
      </div>
    </div>
  );
}

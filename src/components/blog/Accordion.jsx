"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-semibold text-slate-900"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({ children }) {
  return (
    <div className="my-6 rounded-xl border border-slate-200 px-4">
      {children}
    </div>
  );
}

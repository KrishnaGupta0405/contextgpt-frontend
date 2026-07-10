"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = children?.props?.children ?? "";
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117]">
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute right-3 top-3 z-10 rounded-md border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre {...props} className="overflow-x-auto p-4 text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

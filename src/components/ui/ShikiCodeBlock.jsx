"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function ShikiCodeBlock({ code, lang = "html", className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative overflow-hidden rounded-[8px] text-[12.5px] leading-relaxed ${className}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between bg-[#1f2428] px-4 py-2 border-b border-white/10">
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest select-none">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-semibold text-white/50 transition-colors hover:bg-white/10 hover:text-white/90"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" strokeWidth={2.5} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code area */}
      <pre className="scrollbar-thin overflow-x-auto bg-[#0d1117] p-4 text-[12.5px] leading-relaxed text-slate-300 [scrollbar-color:#30363d_#0d1117] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#0d1117] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#30363d]">
        {code.trim()}
      </pre>
    </div>
  );
}

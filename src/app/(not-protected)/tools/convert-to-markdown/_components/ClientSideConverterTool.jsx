"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Client-side converters (no backend call)
// ---------------------------------------------------------------------------

function csvToMarkdown(csv) {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return "";
  const parse = (line) =>
    line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = parse(lines[0]);
  const separator = headers.map(() => "---");
  const rows = lines.slice(1).map(parse);
  const toRow = (cols) => `| ${cols.join(" | ")} |`;
  return [toRow(headers), toRow(separator), ...rows.map(toRow)].join("\n");
}

function jsonToMarkdown(jsonStr) {
  let obj;
  try {
    obj = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON — please check your input.");
  }

  const renderValue = (val, depth = 0) => {
    const indent = "  ".repeat(depth);
    if (val === null) return "`null`";
    if (typeof val === "boolean") return `\`${val}\``;
    if (typeof val === "number") return `\`${val}\``;
    if (typeof val === "string") return val;
    if (Array.isArray(val)) {
      if (val.length === 0) return "_empty array_";
      if (typeof val[0] === "object" && val[0] !== null && !Array.isArray(val[0])) {
        const keys = Object.keys(val[0]);
        const header = `| ${keys.join(" | ")} |`;
        const sep = `| ${keys.map(() => "---").join(" | ")} |`;
        const rows = val.map(
          (row) => `| ${keys.map((k) => String(row[k] ?? "")).join(" | ")} |`
        );
        return [header, sep, ...rows].join("\n");
      }
      return val.map((v) => `${indent}- ${renderValue(v, depth + 1)}`).join("\n");
    }
    if (typeof val === "object") {
      return Object.entries(val)
        .map(([k, v]) => {
          const child = renderValue(v, depth + 1);
          const multiLine = child.includes("\n");
          return multiLine
            ? `${"#".repeat(depth + 3)} ${k}\n\n${child}`
            : `**${k}**: ${child}`;
        })
        .join("\n\n");
    }
    return String(val);
  };

  return renderValue(obj);
}

function xmlToMarkdown(xml) {
  const clean = xml
    .replace(/<\?xml[^?]*\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  const lines = [];
  let depth = 0;

  clean.replace(/(<[^>]+>|[^<]+)/g, (token) => {
    const trimmed = token.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("</")) {
      depth = Math.max(0, depth - 1);
    } else if (trimmed.startsWith("<") && !trimmed.startsWith("</")) {
      const tag = trimmed.replace(/^</, "").replace(/\/?>$/, "").split(/\s/)[0];
      const selfClose = trimmed.endsWith("/>");
      lines.push(`${"  ".repeat(depth)}- **${tag}**`);
      if (!selfClose) depth++;
    } else {
      lines.push(`${"  ".repeat(depth)}${trimmed}`);
    }
  });

  return lines.join("\n");
}

function pasteToMarkdown(text) {
  const hasHtml = /<[a-z][\s\S]*>/i.test(text);
  if (!hasHtml) return text;
  return text
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, c) =>
      `${"#".repeat(Number(l))} ${c.replace(/<[^>]+>/g, "").trim()}`
    )
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "_$1_")
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ClientSideConverterTool({ tool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(null);

  const handleConvert = () => {
    if (!input.trim()) return toast.error("Please enter some content first.");
    setError("");
    setElapsed(null);
    const startTime = Date.now();
    try {
      let result = "";
      switch (tool.converterType) {
        case "csv":   result = csvToMarkdown(input); break;
        case "json":  result = jsonToMarkdown(input); break;
        case "xml":   result = xmlToMarkdown(input); break;
        case "paste": result = pasteToMarkdown(input); break;
        default:      result = input;
      }
      setOutput(result);
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
      toast.success("Converted successfully!");
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    }
  };

  const handleReset = () => { setInput(""); setOutput(""); setError(""); setElapsed(null); };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const baseName = `${tool.converterType || "converted"}-output`;
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          {tool.inputLabel}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tool.inputPlaceholder}
          rows={10}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 placeholder:font-sans placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" /> {tool.actionLabel}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">Markdown Output</p>
              {elapsed && <span className="text-xs text-gray-400">({elapsed}s)</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" /> Download .md
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            rows={14}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

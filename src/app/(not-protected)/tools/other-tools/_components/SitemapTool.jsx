"use client";

import { useState } from "react";
import { RotateCcw, ArrowRight, Copy, Check, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function SitemapTool({ tool }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(null);

  const handleSubmit = async () => {
    if (!url.trim()) return toast.error("Please enter a URL.");
    setLoading(true);
    setResult(null);
    setElapsed(null);
    const startTime = Date.now();
    try {
      const res = await api.post(tool.apiEndpoint, { url: url.trim() });
      setResult(res.data.data);
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
      toast.success("Done!");
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response.data?.message || "Free usage limit reached. Sign up for unlimited access.");
      } else {
        toast.error(err.response?.data?.message || "Request failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setUrl(""); setResult(null); setElapsed(null); };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">{tool.inputLabel}</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={tool.inputPlaceholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <button onClick={handleSubmit} disabled={!url.trim() || loading} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Working...</>
          ) : (
            <><ArrowRight className="h-4 w-4" /> {tool.actionLabel}</>
          )}
        </button>
      </div>

      {elapsed && (
        <p className="text-xs text-gray-400 text-right">Completed in {elapsed}s</p>
      )}

      {result && (
        <div className="space-y-4">
          {tool.sitemapMode === "find" && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Found {result.found?.length || 0} sitemap(s) — checked {result.checked} locations</p>
              {result.found?.length === 0 ? (
                <p className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">No sitemaps found. The site may not have a sitemap.</p>
              ) : (
                <div className="space-y-2">
                  {result.found.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.url}</p>
                        <p className="text-xs text-gray-500">{item.type} — {(item.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Open</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tool.sitemapMode === "validate" && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${result.isValid ? "bg-green-50" : "bg-red-50"}`}>
                {result.isValid ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                <div>
                  <p className={`text-sm font-semibold ${result.isValid ? "text-green-800" : "text-red-800"}`}>{result.isValid ? "Valid Sitemap" : "Invalid Sitemap"}</p>
                  <p className="text-xs text-gray-500">{result.urlCount} URLs found</p>
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Errors</p>
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-red-500" />
                      <p className="text-xs text-red-700">{e}</p>
                    </div>
                  ))}
                </div>
              )}
              {result.warnings?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600">Warnings</p>
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-yellow-50 px-3 py-2">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-yellow-500" />
                      <p className="text-xs text-yellow-700">{w}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tool.sitemapMode === "generate" && result.sitemap && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Generated Sitemap — {result.urlCount} URLs</p>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(result.sitemap)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                  </button>
                  <button onClick={() => handleDownload(result.sitemap, "sitemap.xml")} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
              <textarea readOnly value={result.sitemap} rows={14} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 focus:outline-none" />
            </div>
          )}

          {(tool.sitemapMode === "extract-urls" || tool.sitemapMode === "website-urls") && result.urls && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">{result.count} URLs {tool.sitemapMode === "extract-urls" ? "extracted" : "found"}</p>
                <button onClick={() => handleCopy(result.urls.join("\n"))} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy All
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1">
                {result.urls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-blue-600 hover:underline">{u}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

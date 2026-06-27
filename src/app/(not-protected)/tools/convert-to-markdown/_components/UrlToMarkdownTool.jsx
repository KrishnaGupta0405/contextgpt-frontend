"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, RotateCcw, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
// import { useGoogleReCaptcha } from "react-google-recaptcha-v3"; // BYPASSED
import api from "@/lib/axios";
import { useConversionJob } from "@/hooks/useConversionJob";
import QueueStatus from "./QueueStatus";

export default function UrlToMarkdownTool({ tool }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(null);
  const startTimeRef = useRef(null);

  // const { executeRecaptcha } = useGoogleReCaptcha(); // BYPASSED
  const { status, position, markdown, error, submitJob, reset } =
    useConversionJob();

  const loading = status === "queued" || status === "processing";

  // Start timer when processing begins, stop when markdown arrives
  useEffect(() => {
    if (status === "processing") {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  useEffect(() => {
    if (markdown && startTimeRef.current) {
      setElapsed(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
      startTimeRef.current = null;
    }
  }, [markdown]);

  const handleConvert = async () => {
    if (!url.trim()) return toast.error("Please enter a URL.");

    try {
      // reCAPTCHA BYPASSED for dev
      // let recaptchaToken = "";
      // if (executeRecaptcha) {
      //   recaptchaToken = await executeRecaptcha("convert");
      // }

      const res = await api.post(
        tool.apiEndpoint,
        { url: url.trim() },
      );

      const { jobId, position: initialPosition } = res.data.data;

      // 3. Subscribe to Socket.io for real-time updates
      submitJob(jobId, initialPosition);
    } catch (err) {
      console.error("Convert error:", err, err.response);
      if (err.response?.status === 429) {
        toast.error(err.response.data?.message || "Free usage limit reached. Sign up for unlimited access.");
      } else {
        toast.error(err.response?.data?.message || "Failed to submit job.");
      }
    }
  };

  const handleReset = () => {
    setUrl("");
    setElapsed(null);
    startTimeRef.current = null;
    reset();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let baseName = "converted";
    try {
      const hostname = new URL(url.trim()).hostname.replace(/^www\./, "");
      baseName = hostname.replace(/\./g, "-");
    } catch (_) {}
    const blob = new Blob([markdown], { type: "text/markdown" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${baseName}.md`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="space-y-5">
      {/* URL input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          {tool.inputLabel}
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleConvert()}
          placeholder={tool.inputPlaceholder}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {tool.inputHint && (
          <p className="text-xs text-gray-400">{tool.inputHint}</p>
        )}
      </div>

      {/* Queue / processing status */}
      <QueueStatus
        status={status}
        position={position}
        error={error}
        onRetry={handleConvert}
      />

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
          disabled={!url.trim() || loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {status === "queued" ? "In Queue..." : "Converting..."}
            </>
          ) : (
            <><ArrowRight className="h-4 w-4" /> {tool.actionLabel}</>
          )}
        </button>
      </div>

      {/* Output */}
      {markdown && (
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
            value={markdown}
            rows={16}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

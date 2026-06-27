"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Copy, Check, RotateCcw, CloudUpload, Download } from "lucide-react";
import { toast } from "sonner";
// import { useGoogleReCaptcha } from "react-google-recaptcha-v3"; // BYPASSED
import api from "@/lib/axios";
import { useConversionJob } from "@/hooks/useConversionJob";
import QueueStatus from "./QueueStatus";

export default function FileToMarkdownTool({ tool }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(null);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  // const { executeRecaptcha } = useGoogleReCaptcha(); // BYPASSED
  const { status, position, page, totalPages, markdown, error, submitJob, reset } =
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

  const handleFile = (f) => {
    if (!f) return;
    const allowed = tool.acceptedFileTypes
      .split(",")
      .map((e) => e.trim().replace(".", ""));
    const ext = f.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error(`Invalid file type. Allowed: ${tool.acceptedFileTypes}`);
      return;
    }
    setFile(f);
    reset(); // clear any previous job state
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return toast.error("Please select a file first.");

    try {
      // reCAPTCHA BYPASSED for dev
      // let recaptchaToken = "";
      // if (executeRecaptcha) {
      //   recaptchaToken = await executeRecaptcha("convert");
      // }

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post(tool.apiEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { jobId, position: initialPosition } = res.data.data;

      // Store original filename for download later
      const baseName = file.name.replace(/\.[^.]+$/, "");
      sessionStorage.setItem("convert_original_filename", baseName);

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
    setFile(null);
    setElapsed(null);
    startTimeRef.current = null;
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const baseName = sessionStorage.getItem("convert_original_filename") || "converted";
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : file
            ? "border-blue-300 bg-blue-50/50"
            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
      >
        <CloudUpload className="mb-3 h-10 w-10 text-gray-400" />
        {file ? (
          <>
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
            <p className="mt-1 text-xs text-gray-400">
              {(file.size / 1024).toFixed(1)} KB — click to change
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">
              Choose a file or drag &amp; drop it here.
            </p>
            <p className="mt-1 text-xs text-gray-400">{tool.fileHint}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={tool.acceptedFileTypes}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Queue / processing status */}
      <QueueStatus
        status={status}
        position={position}
        page={page}
        totalPages={totalPages}
        error={error}
        onRetry={handleConvert}
      />

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </span>
        </button>
        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {status === "queued" ? "In Queue..." : "Converting..."}
            </>
          ) : (
            <><Upload className="h-4 w-4" /> {tool.actionLabel}</>
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

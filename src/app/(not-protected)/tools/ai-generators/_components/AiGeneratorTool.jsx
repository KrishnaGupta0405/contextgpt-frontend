"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function AiGeneratorTool({ tool }) {
  const initialValues = Object.fromEntries(
    (tool.fields || []).map((f) => [f.name, f.defaultValue ?? ""])
  );
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(null);

  const set = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));

  const handleGenerate = async () => {
    const missing = (tool.fields || []).find((f) => f.required && !values[f.name]?.trim());
    if (missing) return toast.error(`${missing.label} is required.`);
    setLoading(true);
    setElapsed(null);
    const startTime = Date.now();
    try {
      const res = await api.post(tool.apiEndpoint, values);
      setResult(res.data.data.result);
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
      toast.success("Generated successfully!");
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error(err.response.data?.message || "Free usage limit reached. Sign up for unlimited access.");
      } else {
        toast.error(err.response?.data?.message || "Generation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setValues(initialValues); setResult(""); setElapsed(null); };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Form fields */}
      <div className="space-y-4">
        {(tool.fields || []).map((field) => {
          const charCount = (values[field.name] || "").length;
          const isAtLimit = field.maxLength && charCount >= field.maxLength;

          return (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="ml-1 text-red-400">*</span>}
              </label>

              {field.type === "textarea" && (
                <>
                  <textarea
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    maxLength={field.maxLength}
                    className={`w-full rounded-xl border bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      isAtLimit
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                  />
                  {field.maxLength && (
                    <p className={`text-xs text-right ${
                      isAtLimit ? "text-red-500 font-medium" : "text-gray-400"
                    }`}>
                      {charCount} / {field.maxLength}
                    </p>
                  )}
                </>
              )}

              {field.type === "input" && (
                <>
                  <input
                    type="text"
                    value={values[field.name]}
                    onChange={(e) => set(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {field.maxLength && (
                    <p className={`text-xs text-right ${
                      isAtLimit ? "text-red-500 font-medium" : "text-gray-400"
                    }`}>
                      {charCount} / {field.maxLength}
                    </p>
                  )}
                </>
              )}

              {field.type === "select" && (
                <select
                  value={values[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
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
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <><Sparkles className="h-4 w-4" /> {tool.actionLabel}</>
          )}
        </button>
      </div>

      {/* Output */}
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-700">
                {tool.outputLabel || "Generated Output"}
              </p>
              {elapsed && (
                <span className="text-xs text-gray-400">({elapsed}s)</span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={result}
            rows={14}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

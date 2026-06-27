"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Clock, AlertCircle, RotateCcw } from "lucide-react";

const PROCESSING_MESSAGES = [
  "Hold on, we're processing your file...",
  "Looks like this file has quite a bit of detail!",
  "Still crunching through the content...",
  "Almost there, extracting all the good stuff...",
  "Parsing every last paragraph for you...",
  "Your markdown is being carefully crafted...",
  "Hang tight, big files need a little extra love!",
  "Converting tables, images, and formatting...",
  "Making sure nothing gets lost in translation...",
  "Just a bit more, perfection takes a moment...",
];

/**
 * Renders the real-time queue/processing status for a conversion job.
 *
 * @param {{ status: string, position: number|null, page: number|null, totalPages: number|null, error: string, onRetry?: () => void }}
 */
export default function QueueStatus({ status, position, page, totalPages, error, onRetry }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const intervalRef = useRef(null);

  const hasPageProgress = page != null && totalPages != null;

  useEffect(() => {
    if (status === "processing" && !hasPageProgress) {
      setMsgIndex(0);
      intervalRef.current = setInterval(() => {
        setMsgIndex((prev) =>
          prev < PROCESSING_MESSAGES.length - 1 ? prev + 1 : prev,
        );
      }, 5000);
    } else {
      setMsgIndex(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, hasPageProgress]);

  if (status === "queued") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Clock className="h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            In queue — Position {position ?? 1}
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            Your request is waiting to be processed. This page will update
            automatically.
          </p>
        </div>
        <span className="ml-auto h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-amber-400" />
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-800">
              {hasPageProgress
                ? `Processing page ${page} of ${totalPages}`
                : "Your file is being processed"}
            </p>
            <p
              key={hasPageProgress ? `${page}` : msgIndex}
              className="mt-0.5 text-xs text-blue-600 animate-fade-in"
            >
              {hasPageProgress
                ? "Converting page by page to keep things stable..."
                : PROCESSING_MESSAGES[msgIndex]}
            </p>
          </div>
        </div>
        {hasPageProgress && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.round((page / totalPages) * 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            Conversion failed
          </p>
          <p className="mt-0.5 text-xs text-red-600">
            {error || "An unexpected error occurred."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}

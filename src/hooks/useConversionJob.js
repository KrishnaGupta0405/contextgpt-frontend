"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";

/**
 * Custom hook that manages the full queue-based conversion lifecycle.
 *
 * States: idle → queued (position N) → processing → completed / failed
 *
 * @returns {{
 *   status: "idle"|"queued"|"processing"|"completed"|"failed",
 *   position: number|null,
 *   markdown: string,
 *   error: string,
 *   submitJob: (jobId: string) => void,
 *   reset: () => void,
 * }}
 */
export function useConversionJob() {
  const [status, setStatus] = useState("idle"); // idle | queued | processing | completed | failed
  const [position, setPosition] = useState(null);
  const [page, setPage] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const jobIdRef = useRef(null);

  /**
   * Call this after the HTTP POST returns a jobId.
   * Connects to Socket.io & subscribes to real-time updates.
   */
  const submitJob = useCallback((jobId, initialPosition) => {
    jobIdRef.current = jobId;
    setStatus("queued");
    setPosition(initialPosition || 1);
    setMarkdown("");
    setError("");

    const socket = getSocket();
    socketRef.current = socket;
    console.log(`[ConversionJob] submitJob — jobId=${jobId}, socket.connected=${socket.connected}, socket.id=${socket.id}`);

    // Listen for updates (register before connect to avoid missing events)
    socket.on("job:update", (payload) => {
      if (payload.jobId !== jobIdRef.current) return;

      switch (payload.status) {
        case "waiting":
          setStatus("queued");
          setPosition(payload.position);
          break;

        case "processing":
          setStatus("processing");
          setPosition(null);
          if (payload.page != null) setPage(payload.page);
          if (payload.totalPages != null) setTotalPages(payload.totalPages);
          break;

        case "completed":
          setStatus("completed");
          setPosition(null);
          setMarkdown(payload.data?.markdown || "");
          socket.off("job:update");
          socket.off("connect");
          break;

        case "failed":
          setStatus("failed");
          setPosition(null);
          setError(payload.error || "Conversion failed");
          socket.off("job:update");
          socket.off("connect");
          break;

        default:
          break;
      }
    });

    // Subscribe only after socket is connected (server sends current state back)
    const onConnect = () => {
      console.log(`[ConversionJob] socket connected/ready, emitting subscribe:job for ${jobId}`);
      socket.emit("subscribe:job", jobId);
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.on("connect", onConnect);
      socket.connect();
    }
  }, []);

  /** Reset everything back to idle. */
  const reset = useCallback(() => {
    // Tell the server to stop processing immediately — the socket stays connected
    // so disconnect-based cancellation never fires on a Reset click.
    if (jobIdRef.current && socketRef.current?.connected) {
      socketRef.current.emit("cancel:job", jobIdRef.current);
    }

    setStatus("idle");
    setPosition(null);
    setPage(null);
    setTotalPages(null);
    setMarkdown("");
    setError("");
    jobIdRef.current = null;

    if (socketRef.current) {
      socketRef.current.off("job:update");
      socketRef.current.off("connect");
    }
  }, []);

  // Cleanup on unmount — remove listeners only, do NOT disconnect the singleton socket
  useEffect(() => {
    return () => {
      console.log(`[ConversionJob] useEffect cleanup — socket.connected=${socketRef.current?.connected}, jobId=${jobIdRef.current}`);
      if (socketRef.current) {
        socketRef.current.off("job:update");
        socketRef.current.off("connect");
        // Do NOT call socket.disconnect() — the socket is a module-level singleton
        // shared across the app. Disconnecting here kills it for subsequent jobs.
      }
    };
  }, []);

  return { status, position, page, totalPages, markdown, error, submitJob, reset };
}

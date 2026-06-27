"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export default function useToolUsage() {
  const [usage, setUsage] = useState({ limit: 25, used: 0, remaining: 25 });
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await api.get("/tools/usage-remaining");
      if (res.data?.data) {
        setUsage(res.data.data);
      }
    } catch (err) {
      // If we get a 429, the user has exhausted their limit — reflect that
      const data = err?.response?.data?.data;
      if (err?.response?.status === 429 && data) {
        setUsage(data);
      }
      // For other errors, leave default state so user isn't blocked unfairly
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    // Refetch whenever a tool call completes (success or 429)
    const handler = () => fetchUsage();
    window.addEventListener("tool-usage-changed", handler);
    return () => window.removeEventListener("tool-usage-changed", handler);
  }, [fetchUsage]);

  // Call this after a successful tool use to update the count
  const decrementRemaining = () => {
    setUsage((prev) => ({
      ...prev,
      used: prev.used + 1,
      remaining: Math.max(0, prev.remaining - 1),
    }));
  };

  return { usage, loading, refetch: fetchUsage, decrementRemaining };
}

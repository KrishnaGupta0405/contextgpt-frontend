"use client";

import { AlertTriangle, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ToolUsageBanner({ usage, loading, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const RefreshButton = () => (
    <button
      onClick={handleRefresh}
      disabled={refreshing}
      title="Refresh usage count"
      className="ml-2 inline-flex items-center text-inherit opacity-50 hover:opacity-100 disabled:cursor-not-allowed"
    >
      <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
    </button>
  );

  if (loading) return null;

  const { remaining, limit, used } = usage;

  // Fully exhausted
  if (remaining <= 0) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            Free usage limit reached ({used}/{limit})
            <RefreshButton />
          </p>
          <p className="mt-0.5 text-xs text-red-600">
            You&apos;ve used all {limit} free tool uses.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade to a plan
            </Link>{" "}
            for unlimited access.
          </p>
        </div>
      </div>
    );
  }

  // Running low (5 or fewer remaining)
  if (remaining <= 5) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Zap className="mt-0.5 h-5 w-5 flex-none text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {remaining} free use{remaining === 1 ? "" : "s"} remaining
            <RefreshButton />
          </p>
          <p className="mt-0.5 text-xs text-amber-600">
            You&apos;ve used {used} of {limit} free tool uses.{" "}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade
            </Link>{" "}
            for unlimited access.
          </p>
        </div>
      </div>
    );
  }

  // Normal state - subtle indicator
  return (
    <div className="mb-6 flex items-center justify-center gap-1">
      <p className="text-xs text-gray-400">
        {remaining} of {limit} free uses remaining
      </p>
      <RefreshButton />
    </div>
  );
}

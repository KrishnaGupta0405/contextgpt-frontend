"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  MessageSquare,
  FileText,
  Users,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

function UsageBar({ value, limit, percentage, colorClass = "bg-primary" }) {
  const pct = Math.min(percentage ?? (limit > 0 ? (value / limit) * 100 : 0), 100);
  const isHigh = pct >= 90;
  const barColor = isHigh ? "bg-red-500" : colorClass;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value?.toLocaleString() ?? 0} used</span>
        <span>{((pct)).toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Limit: {limit?.toLocaleString() ?? 0}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, used, limit, percentage, iconClass }) {
  const pct = Math.min(
    percentage ?? (limit > 0 ? (used / limit) * 100 : 0),
    100,
  );
  const isHigh = pct >= 90;

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-md ${iconClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mb-3">
          <span className="text-2xl font-bold">
            {used?.toLocaleString() ?? 0}
          </span>
          <span className="text-muted-foreground text-sm ml-1">
            / {limit?.toLocaleString() ?? 0}
          </span>
        </div>
        <UsageBar
          value={used}
          limit={limit}
          percentage={percentage}
          colorClass={isHigh ? "bg-red-500" : "bg-primary"}
        />
      </CardContent>
    </Card>
  );
}

function formatPeriodLabel(p) {
  try {
    const start = format(new Date(p.periodStart), "MMM yyyy");
    const end = format(new Date(p.periodEnd), "MMM yyyy");
    const label = start === end ? start : `${start} – ${end}`;
    return `${label} · ${p.subscriptionStatus ?? "unknown"}`;
  } catch {
    return p.subscriptionId;
  }
}

export function AccountUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState(null);
  const { addListener } = useChattingSocket();

  useEffect(() => {
    api.get("/usage/subscription-periods").then((res) => {
      if (res?.data?.success) {
        const list = res.data.data.periods ?? [];
        setPeriods(list);
        if (list.length) setSelectedTrackingId(list[0].id);
      }
    }).catch(() => {});
  }, []);

  const fetchUsage = async (trackingId) => {
    try {
      setLoading(true);
      setError(null);
      const params = trackingId ? { trackingId } : {};
      const res = await api.get("/usage", { params });
      if (res?.data?.success) {
        setUsage(res.data.data);
      }
      console.log("Usag->", res.data.data)
    } catch (err) {
      console.error("Error fetching usage:", err);
      setError("Failed to load usage data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage(selectedTrackingId);
  }, [selectedTrackingId]);

  // ── Real-time usage updates via WebSocket (streamed in, no refetch/reload) ──
  useEffect(() => {
    if (!addListener) return;
    const remove = addListener("usage:updated", ({ usage: newUsage, usagePercentages }) => {
      setUsage((prev) => {
        // Only merge if it's the currently viewed period (or no specific period selected)
        if (selectedTrackingId && newUsage?.id !== selectedTrackingId) return prev;
        return { usage: newUsage, usagePercentages };
      });
    });
    return remove;
  }, [addListener, selectedTrackingId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {error}
        <button
          onClick={fetchUsage}
          className="ml-auto text-red-600 hover:underline flex items-center gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  const u = usage?.usage;
  const pct = usage?.usagePercentages;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Your Account Usage</h2>
          {u?.periodEnd && (
            <p className="text-xs text-blue-500 font-medium mt-0.5">
              Resets on {formatDate(u.periodEnd)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {periods.length > 1 && (
            <Select value={selectedTrackingId ?? ""} onValueChange={setSelectedTrackingId}>
              <SelectTrigger className="h-8 text-xs w-56">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {formatPeriodLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Badge
            variant="outline"
            className={
              u?.subscriptionStatus === "active"
                ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "border-yellow-300 bg-yellow-50 text-yellow-700"
            }
          >
            {u?.subscriptionStatus ?? "Unknown"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <StatCard
          icon={Bot}
          label="Chatbots Usage"
          used={u?.chatbotsCreated ?? 0}
          limit={u?.limitChatbots ?? 0}
          percentage={pct?.chatbots}
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages Quato Used"
          used={(u?.messagesSentByHuman ?? 0) + (u?.messagesSentByAi ?? 0) + (u?.messagesReceived ?? 0)}
          // used={u?.messagesSentByAi ?? 0}
          limit={u?.limitMessages ?? 0}
          percentage={pct?.messages}
          iconClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
        <StatCard
          icon={FileText}
          label="Pages Usage"
          used={u?.pagesIndexed ?? 0}
          limit={u?.limitPages ?? 0}
          percentage={pct?.pages}
          iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {[
          {
            label: "AI Messages Sent",
            value: u?.messagesSentByAi ?? 0,
            icon: Bot,
          },
          {
            label: "Human Messages Sent",
            value: u?.messagesSentByHuman ?? 0,
            icon: MessageSquare,
          },
          {
            label: "Messages Received",
            value: u?.messagesReceived ?? 0,
            icon: MessageSquare,
          },
          {
            label: "Team Members Added",
            value: u?.teamMembersAdded ?? 0,
            icon: Users,
          },
        //   {
        //     label: "Total Tokens",
        //     value: (u?.totalTokens ?? 0).toLocaleString(),
        //     icon: Bot,
        //   },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border bg-card px-4 py-3 text-sm"
          >
            <p className="text-muted-foreground text-xs mb-1">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

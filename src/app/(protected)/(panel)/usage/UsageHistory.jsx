"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import {
  FileText,
  MessageSquare,
  BookOpen,
  Loader2,
  History,
  ChevronDown,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pages", label: "Pages" },
  { value: "messages", label: "Messages" },
];

function HistoryRow({ item }) {
  const isPage = item.kind === "page";

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {/* Type Column */}
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
              isPage ? "bg-violet-50" : "bg-blue-50"
            }`}
          >
            {isPage ? (
              <BookOpen className="h-3.5 w-3.5 text-violet-600" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            )}
          </div>
          <span className="font-medium text-slate-600">
            {isPage ? "Page" : "Message"}
          </span>
        </div>
      </td>

      {/* Title/Name Column */}
      <td className="px-4 py-3 text-sm font-medium text-slate-800">
        <p className="truncate">
          {isPage ? item.label : "AI reply sent"}
        </p>
      </td>

      {/* Source Column */}
      <td className="px-4 py-3 text-sm text-slate-600">
        {isPage && item.fileSource ? (
          <span className="capitalize">{item.fileSource.replace(/_/g, " ").toLowerCase()}</span>
        ) : item.chatbotName ? (
          <span>{item.chatbotName}</span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>

      {/* Size/Amount Column */}
      <td className="px-4 py-3 text-sm text-slate-600">
        <Badge
          variant="outline"
          className={`text-[10px] ${
            isPage
              ? "border-violet-200 text-violet-700"
              : "border-blue-200 text-blue-700"
          }`}
        >
          {isPage ? `-${(item.pages ?? item.estimatedPages ?? "?").toLocaleString()} pages` : "-1 message"}
        </Badge>
      </td>

      {/* Date Column */}
      <td className="px-4 py-3 text-sm text-slate-400">
        {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
      </td>
    </tr>
  );
}

function HistoryRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-7 rounded-md" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
    </tr>
  );
}

const chartConfig = {
  pages: {
    label: "Pages",
    color: "var(--chart-1)",
  },
  messages: {
    label: "Messages",
    color: "var(--chart-2)",
  },
};

export default function UsageHistory() {
  const [type, setType] = useState("all");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchHistory = useCallback(
    async (nextPage, selectedType, append = false) => {
      try {
        const res = await api.get("/usage/history", {
          params: { page: nextPage, limit: 5, type: selectedType, days: 30 },
        });
        if (res.data?.success && res.data?.data) {
          const { items: newItems, pagination: pg, chartData: chart } = res.data.data;
          setItems((prev) => (append ? [...prev, ...newItems] : newItems));
          setPagination(pg);
          if (chart) {
            setChartData(chart);
          }
        }
      } catch {
        // silently hide if no sub or error
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    setChartLoading(true);
    setPage(1);
    setItems([]);
    fetchHistory(1, type, false).finally(() => {
      setLoading(false);
      setChartLoading(false);
    });
  }, [type, fetchHistory]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchHistory(nextPage, type, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-slate-500" />
            Usage History
          </CardTitle>

          {/* Type filter */}
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  type === opt.value
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        {/* Chart Section */}
        {chartLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : chartData.length > 0 ? (
          <div className="space-y-2">
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillPages" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-pages)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-pages)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-messages)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-messages)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="messages"
                  type="natural"
                  fill="url(#fillMessages)"
                  fillOpacity={0.4}
                  stroke="var(--color-messages)"
                  stackId="a"
                />
                <Area
                  dataKey="pages"
                  type="natural"
                  fill="url(#fillPages)"
                  fillOpacity={0.4}
                  stroke="var(--color-pages)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Last 30 days</span>
            </div>
          </div>
        ) : null}

        {/* Divider */}
        {chartData.length > 0 && !chartLoading && <div className="border-t" />}

        {/* History Items Section */}
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <HistoryRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
            <FileText className="h-8 w-8 opacity-40" />
            <p className="text-sm">No usage events yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <HistoryRow key={`${item.kind}-${item.id}`} item={item} />
                  ))}
                </tbody>
              </table>
            </div>

            {pagination?.hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2 text-xs"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Load more
                    </>
                  )}
                </Button>
              </div>
            )}

            {pagination && !pagination.hasMore && items.length > 0 && (
              <p className="mt-4 text-center text-[11px] text-slate-400">
                All {pagination.total.toLocaleString()} events loaded
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

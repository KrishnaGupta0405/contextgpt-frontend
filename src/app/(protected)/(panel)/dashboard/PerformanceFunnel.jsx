"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatbot } from "@/context/ChatbotContext";
import api from "@/lib/axios";
import {
  Link as LinkIcon,
  FileText,
  Quote,
  CalendarDays,
  ThumbsUp,
  ThumbsDown,
  LayoutTemplate,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

// ── Tiny SVG line chart ───────────────────────────────────────────────────────
function MiniLineChart({ data, rangeLabel }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center text-[13px] text-slate-400">
        No data for last {rangeLabel}
      </div>
    );
  }

  const W = 420;
  const H = 100;
  const PAD = { top: 8, right: 8, bottom: 24, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 1);
  const minVal = 0;

  const xStep = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const toX = (i) => PAD.left + (data.length > 1 ? i * xStep : innerW / 2);
  const toY = (v) =>
    PAD.top + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.count)}`).join(" ");
  const fillPoints = [
    `${toX(0)},${PAD.top + innerH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.count)}`),
    `${toX(data.length - 1)},${PAD.top + innerH}`,
  ].join(" ");

  // Show first, middle, last labels
  const labelIndices = new Set([0, Math.floor(data.length / 2), data.length - 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 140 }}
      preserveAspectRatio="none"
    >
      {/* Y gridlines */}
      {[0, 0.5, 1].map((t) => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + innerW}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 4}
              y={y + 4}
              fontSize={9}
              textAnchor="end"
              fill="#94a3b8"
            >
              {Math.round(minVal + t * maxVal)}
            </text>
          </g>
        );
      })}
      {/* Fill */}
      <polygon points={fillPoints} fill="#2563eb" fillOpacity={0.08} />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#2563eb"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots + date labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.count)} r={3} fill="#2563eb" />
          {labelIndices.has(i) && (
            <text
              x={toX(i)}
              y={H - 4}
              fontSize={8}
              textAnchor="middle"
              fill="#94a3b8"
            >
              {d.date?.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 2000) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic — fast start, slow finish
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active, duration]);

  return value;
}

// ── Animated stat value ───────────────────────────────────────────────────────
function AnimatedValue({ target, suffix = "", loading }) {
  const animated = useCountUp(target, !loading);
  if (loading) return null;
  const display = Number.isInteger(target) ? Math.round(animated) : animated.toFixed(1);
  return <>{display}{suffix}</>;
}

// ── Messages trend bar chart ──────────────────────────────────────────────────
const messagesTrendConfig = {
  totalMessages: { label: "Messages", color: "#2563eb" },
  positiveCount: { label: "Positive", color: "#22c55e" },
  negativeCount: { label: "Negative", color: "#ef4444" },
};

function MessagesTrendChart({ data, rangeLabel, loading }) {
  if (loading) return <Skeleton className="h-[220px] w-full" />;
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[13px] text-slate-400">
        No messages in last {rangeLabel}
      </div>
    );
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatted = data.map((d) => {
    if (!d.date) return d;
    const [, month, day] = d.date.split("-");
    const monthIdx = parseInt(month) - 1;
    const monthName = MONTHS[monthIdx];
    return { ...d, date: d.date, formattedDate: `${day}-${monthName}` };
  });

  return (
    <ChartContainer config={messagesTrendConfig} className="h-[220px] w-full">
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          allowDecimals={false}
          label={{ value: "Number of Messages --->", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#94a3b8", fontSize: 10 } }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="totalMessages" stroke="var(--color-totalMessages)" fill="var(--color-totalMessages)" fillOpacity={0.2} />
        <Area type="monotone" dataKey="positiveCount" stroke="var(--color-positiveCount)" fill="var(--color-positiveCount)" fillOpacity={0.2} />
        <Area type="monotone" dataKey="negativeCount" stroke="var(--color-negativeCount)" fill="var(--color-negativeCount)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  );
}

// ── Device type breakdown bar chart ───────────────────────────────────────────
const deviceTypeConfig = {
  desktop: { label: "Desktop", color: "#2563eb" },
  mobile: { label: "Mobile", color: "#7c3aed" },
  tablet: { label: "Tablet", color: "#06b6d4" },
};

function DeviceTypeChart({ data, loading }) {
  if (loading) return <Skeleton className="h-[220px] w-full" />;
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-[13px] text-slate-400">
        No device data available
      </div>
    );
  }

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = (data || []).map((d) => {
    if (!d.date) return d;
    const [, month, day] = d.date.split("-");
    const monthIdx = parseInt(month) - 1;
    const monthName = MONTHS[monthIdx];
    return {
      ...d,
      date: d.date,
      formattedDate: `${day}-${monthName}`,
      desktop: Number(d.desktop || 0),
      mobile: Number(d.mobile || 0),
      tablet: Number(d.tablet || 0),
    };
  });

  const totalVisitors = chartData.reduce((sum, d) => sum + (d.desktop + d.mobile + d.tablet), 0);

  return (
    <div>
      <p className="mb-3 text-[12px] text-slate-500">
        Total visitors: <span className="font-bold text-slate-700">{totalVisitors}</span>
      </p>
      <ChartContainer config={deviceTypeConfig} className="h-[220px] w-full">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            interval="preserveStartEnd"
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                className="w-[200px]"
                formatter={(value, name, item, index) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: `var(--color-${name})`,
                      }}
                    />
                    {deviceTypeConfig[name]?.label || name}
                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-slate-900 tabular-nums">
                      {value}
                    </div>
                    {index === 2 && (
                      <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-slate-900">
                        Total
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                          {item.payload.desktop + item.payload.mobile + item.payload.tablet}
                        </div>
                      </div>
                    )}
                  </>
                )}
              />
            }
            cursor={false}
            defaultIndex={0}
          />
          <Bar
            dataKey="desktop"
            stackId="a"
            fill="var(--color-desktop)"
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="mobile"
            stackId="a"
            fill="var(--color-mobile)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="tablet"
            stackId="a"
            fill="var(--color-tablet)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ── Visitor countries pie chart ───────────────────────────────────────────────
const COUNTRY_NAMES = {
  US: "United States", IN: "India", GB: "United Kingdom", DE: "Germany",
  FR: "France", CA: "Canada", AU: "Australia", JP: "Japan", BR: "Brazil",
  CN: "China", RU: "Russia", KR: "South Korea", IT: "Italy", ES: "Spain",
  MX: "Mexico", ID: "Indonesia", NL: "Netherlands", SA: "Saudi Arabia",
  TR: "Turkey", PL: "Poland", Other: "Other",
};
function countryName(code) { return COUNTRY_NAMES[code] || code; }

const COUNTRY_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c",
  "#ca8a04", "#16a34a", "#0891b2", "#dc2626", "#6b7280",
];

function CustomCountryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const cities = item.payload.cities || [];
  const topCities = cities.slice(0, 3);
  const othersCount = cities.slice(3).reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-w-[160px] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-semibold text-slate-800">{countryName(item.payload.country)}</p>
      <p className="mb-1 text-slate-500">{item.value} unique visitor{item.value !== 1 ? "s" : ""}</p>
      {topCities.length > 0 && (
        <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
          {topCities.map((c) => (
            <div key={c.city} className="flex justify-between gap-3 text-slate-600">
              <span>{c.city}</span>
              <span className="font-medium text-slate-800">{c.count}</span>
            </div>
          ))}
          {othersCount > 0 && (
            <div className="flex justify-between gap-3 text-slate-400">
              <span>Other</span>
              <span>{othersCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VisitorCountriesChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-5">
        <Skeleton className="h-[160px] w-[160px] flex-shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-3.5 w-full" />)}
        </div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[13px] text-slate-400">
        No visitor data yet
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0" style={{ width: 160, height: 160 }}>
        <ChartContainer config={{}} className="h-[160px] w-[160px]">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="country" cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.country} fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomCountryTooltip />} />
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.country} className="flex min-w-0 items-center gap-2 text-[12px] text-slate-700">
            <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }} />
            <span className="flex-1 truncate">{countryName(d.country)}</span>
            <span className="flex-shrink-0 font-semibold text-slate-900">{d.count}</span>
            <span className="flex-shrink-0 text-slate-400">
              {total > 0 ? `${Math.round((d.count / total) * 100)}%` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ingestion sources pie chart ───────────────────────────────────────────────
const SOURCE_LABELS = {
  LOCAL_UPLOAD: "Local Upload",
  YOUTUBE: "YouTube",
  FIRECRAWL_CRAWL: "Web Crawl",
  FIRECRAWL_BULK: "Bulk Scrape",
  FIRECRAWL_SITEMAP: "Sitemap",
  GOOGLE_DRIVE: "Google Drive",
  DROPBOX: "Dropbox",
  Other: "Other",
};

const SOURCE_COLORS = [
  "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
  "#10b981", "#f97316", "#6366f1", "#6b7280",
];

function CustomSourceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-800">{SOURCE_LABELS[item.payload.source] || item.payload.source}</p>
      <p className="mt-0.5 text-slate-500">{item.value} file{item.value !== 1 ? "s" : ""}</p>
    </div>
  );
}

function IngestionSourcesChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-5">
        <Skeleton className="h-[160px] w-[160px] flex-shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3.5 w-full" />)}
        </div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-[13px] text-slate-400">
        No ingestion sources yet
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0" style={{ width: 160, height: 160 }}>
        <ChartContainer config={{}} className="h-[160px] w-[160px]">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.source} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomSourceTooltip />} />
          </PieChart>
        </ChartContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.source} className="flex min-w-0 items-center gap-2 text-[12px] text-slate-700">
            <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
            <span className="flex-1 truncate">{SOURCE_LABELS[d.source] || d.source}</span>
            <span className="flex-shrink-0 font-semibold text-slate-900">{d.count}</span>
            <span className="flex-shrink-0 text-slate-400">
              {total > 0 ? `${Math.round((d.count / total) * 100)}%` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Date ranges ───────────────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function PerformanceFunnel() {
  const { selectedChatbot } = useChatbot();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(() => {
    if (!selectedChatbot?.id) return;
    setLoading(true);
    setError(null);
    api
      .get(`/usage/chatbot/${selectedChatbot.id}/overview`, { params: { days: rangeDays } })
      .then((res) => setData(res.data?.data ?? null))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [selectedChatbot?.id, rangeDays]);

  if (!selectedChatbot) return null;

  const cards = data?.cards ?? {};
  const trend = data?.charts?.conversationsTrend ?? [];
  const deviceTypeBreakdown = data?.charts?.deviceTypeBreakdown ?? [];
  const messagesTrend = data?.charts?.messagesTrend ?? [];
  const visitorCountries = data?.charts?.visitorCountries ?? [];
  const ingestionSources = data?.charts?.ingestionSources ?? [];

  const statCards = [
    {
      label: "Total Links",
      icon: <LinkIcon className="h-5 w-5 text-blue-600" />,
      rawValue: cards.totalLinks ?? 0,
      link: "/website-links",
      linkLabel: "View All Links",
    },
    {
      label: "Total Files",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      rawValue: cards.totalFiles ?? 0,
      link: "/website-files",
      linkLabel: "View All Files",
    },
    {
      label: "Total Custom Responses",
      icon: <Quote className="h-5 w-5 text-blue-600" />,
      rawValue: cards.totalCustomResponses ?? 0,
      link: "/custom-responses",
      linkLabel: "View All Responses",
    },
    {
      label: "Total Messages",
      icon: <CalendarDays className="h-5 w-5 text-blue-600" />,
      rawValue: cards.totalMessages ?? 0,
      link: "/chat-history",
      linkLabel: "View Chat History",
    },
    {
      label: "Positive Feedback",
      icon: <ThumbsUp className="h-5 w-5 fill-green-500 text-green-500" />,
      rawValue: cards.positiveFeedbackPct ?? 0,
      suffix: "%",
      link: "/chat-history?threadId=4613302e-a882-44c8-94b0-3bb7169a6f88&status=all&feedback=positive",
      linkLabel: "View Feedback",
    },
    {
      label: "Negative Feedback",
      icon: <ThumbsDown className="h-5 w-5 fill-red-500 text-red-500" />,
      rawValue: cards.negativeFeedbackPct ?? 0,
      suffix: "%",
      link: "/chat-history?threadId=4613302e-a882-44c8-94b0-3bb7169a6f88&status=all&feedback=negative",
      linkLabel: "View Feedback",
    },
    {
      label: "Total Pages Consumed",
      icon: <LayoutTemplate className="h-5 w-5 text-blue-600" />,
      labelExtra: <Info className="h-3.5 w-3.5 text-slate-400" />,
      rawValue: cards.totalPagesConsumed ?? 0,
    },
  ];

  const activeRange = DATE_RANGES.find((r) => r.days === rangeDays);

  return (
    <div className="space-y-6 -mt-10">
      {/* ── Date range selector ── */}
      <div className="flex items-center justify-end">
        <Select value={String(rangeDays)} onValueChange={(v) => setRangeDays(Number(v))}>
          <SelectTrigger className="w-[140px] text-[12.5px] font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.days} value={String(r.days)} className="text-[12.5px]">
                Last {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-[13px] text-red-500">{error}</p>
      )}

      {/* ── Stat cards ── */}
      <div
        data-tour="dashboard-stat-cards"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => (
              <div
                key={card.label}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800">
                      {card.label}
                      {card.labelExtra}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[26.5px] leading-none font-extrabold text-slate-900">
                    <AnimatedValue target={card.rawValue} suffix={card.suffix} loading={loading} />
                  </span>
                  {card.link && (
                    <Link
                      href={card.link}
                      className="flex items-center text-[12.5px] font-semibold text-blue-600 transition-colors hover:text-blue-800"
                    >
                      {card.linkLabel}{" "}
                      <ChevronRight className="ml-1 h-3 w-3" strokeWidth={2.5} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
      </div>

{/* ── Charts row 2: visitor countries + ingestion sources ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h3 className="mb-1 text-[13px] font-bold text-slate-800">
            Visitors by Country
          </h3>
          <p className="mb-4 text-[11.5px] text-slate-400">
            Unique visitors — top 8 countries, hover for top cities
          </p>
          <VisitorCountriesChart data={visitorCountries} loading={loading} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h3 className="mb-1 text-[13px] font-bold text-slate-800">
            Knowledge Base Sources
          </h3>
          <p className="mb-4 text-[11.5px] text-slate-400">
            Files grouped by ingestion type
          </p>
          <IngestionSourcesChart data={ingestionSources} loading={loading} />
        </div>
      </div>
        
      {/* ── Messages trend bar chart (full width) ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h3 className="mb-1 text-[13px] font-bold text-slate-800">
          Messages Trend — Last {activeRange?.label}
        </h3>
        <p className="mb-4 text-[11.5px] text-slate-400">
          Daily user messages with positive and negative feedback counts
        </p>
        <MessagesTrendChart data={messagesTrend} rangeLabel={activeRange?.label} loading={loading} />
        {/* {console.log("MessagesTrendChart config-> ", messagesTrendConfig)} */}
      </div> 


      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Conversations trend */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h3 className="mb-3 text-[13px] font-bold text-slate-800">
            Conversations — Last {activeRange?.label}
          </h3>
          {loading ? (
            <Skeleton className="h-[140px] w-full" />
          ) : (
            <MiniLineChart data={trend} rangeLabel={activeRange?.label} />
          )}
        </div>

        {/* Device type breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h3 className="mb-1 text-[13px] font-bold text-slate-800">
            Visitors by Device
          </h3>
          <p className="mb-4 text-[11.5px] text-slate-400">
            Device type breakdown for the selected period
          </p>
          {loading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <DeviceTypeChart data={deviceTypeBreakdown} loading={loading} />
          )}
        </div>
      </div>
      
    </div>
  );
}

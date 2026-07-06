"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Tag,
  Package,
  FileStack,
  Info,
  TrendingUp,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

const ADDON_ICONS = {
  remove_branding: Tag,
  extra_messages_5k: Zap,
  extra_pages_5k: FileStack,
};

const STATUS_STYLES = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-slate-200 bg-slate-100 text-slate-500",
  refunded: "border-red-200 bg-red-50 text-red-600",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoTooltip({ text }) {
  return (
    <span className="group relative inline-flex items-center">
      <Info className="h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-blue-500" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {text}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </span>
    </span>
  );
}

/**
 * DripProgressBar — shows the monthly drip progress for a yearly add-on.
 */
function DripProgressBar({ delivered, total }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Monthly credits delivered</span>
        <span className="font-medium text-slate-700">
          {delivered} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${Math.min(100, (delivered / total) * 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * AddonDetailCard — expanded view of a purchased add-on with full details.
 */
function AddonDetailCard({ ua }) {
  const [expanded, setExpanded] = useState(false);
  const identifier = ua.addOn?.identifier;
  const Icon = ADDON_ICONS[identifier] || Zap;
  const statusStyle = STATUS_STYLES[ua.status] || STATUS_STYLES.expired;
  const isYearly = ua.addOn?.type === "Yearly";
  const isMessageAddon = identifier === "extra_messages_5k";
  const isPageAddon = identifier === "extra_pages_5k";
  const hasCarryForward = isYearly && (isMessageAddon || isPageAddon);
  const resourceLabel = isMessageAddon ? "messages" : isPageAddon ? "pages" : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Summary row */}
      <button
        className="flex w-full items-start gap-4 px-6 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {ua.addOn?.title || "Add-On"}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyle}`}
            >
              {ua.status === "active" ? "Active" : ua.status === "expired" ? "Expired" : "Refunded"}
            </span>
            {ua.addOn?.type && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                {ua.addOn.type}
              </span>
            )}
            {hasCarryForward && (
              <InfoTooltip
                text={`This is a yearly package. 5,000 ${resourceLabel} are deposited each month for 12 months. Unused ${resourceLabel} from each month carry forward to the next.`}
              />
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDate(ua.periodStart)} — {formatDate(ua.periodEnd)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {ua.addOn?.price && (
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-900">
                ${parseFloat(ua.addOn.price).toFixed(2)}
              </span>
              <span className="ml-1 text-xs text-slate-500">
                {isYearly ? "/ year" : "/ month"}
              </span>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-6 pb-5 pt-4 space-y-4">
          {/* Drip progress for yearly */}
          {ua.dripsTotal > 1 && (
            <DripProgressBar delivered={ua.dripsDelivered} total={ua.dripsTotal} />
          )}

          {/* Bonus stats grid for message/page addons */}
          {hasCarryForward && ua.status === "active" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-blue-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">
                  This Month&apos;s Bonus
                </p>
                <p className="mt-1 text-xl font-bold text-blue-800">
                  {(ua.currentMonthBonus || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-blue-600">{resourceLabel} credited this cycle</p>
              </div>

              <div className="rounded-lg bg-indigo-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">
                  Carried Forward
                </p>
                <p className="mt-1 text-xl font-bold text-indigo-800">
                  {Number(ua.carryForward || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-indigo-600">rolled over from last month</p>
              </div>

              <div className="rounded-lg bg-violet-50 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
                  Total Remaining
                </p>
                <p className="mt-1 text-xl font-bold text-violet-800">
                  {Number(ua.totalBonusRemaining || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-violet-600">bonus {resourceLabel} available</p>
              </div>
            </div>
          )}

          {/* Next drip */}
          {ua.nextDripAt && ua.status === "active" && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Next monthly credit on{" "}
                <span className="font-medium text-slate-700">{formatDate(ua.nextDripAt)}</span>
              </span>
            </div>
          )}

          {/* Purchased at */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              Purchased on{" "}
              <span className="font-medium text-slate-700">{formatDate(ua.purchasedAt)}</span>
            </span>
          </div>

          {/* Transaction ID */}
          {(ua.providerTransactionId || ua.paddleTransactionId) && (
            <p className="text-[11px] text-slate-400">
              Transaction ID: {ua.providerTransactionId || ua.paddleTransactionId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AddonsTab — full Addons tab on the billing page.
 * Shows all purchased add-ons with detailed carry-forward and drip info.
 */
export default function AddonsTab() {
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAddOns = async () => {
      try {
        const res = await api.get("/billing/addons/my-addons");
        if (res.data?.success) {
          setAddOns(res.data.data.addOns || []);
        }
      } catch {
        // Not logged in or error
      } finally {
        setLoading(false);
      }
    };
    fetchMyAddOns();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Addon rows skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex items-start gap-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeAddOns = addOns.filter((a) => a.status === "active");
  const expiredAddOns = addOns.filter((a) => a.status !== "active");

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {activeAddOns.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total active */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Package className="h-4 w-4" /> Active Add-Ons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{activeAddOns.length}</p>
            </CardContent>
          </Card>

          {/* Bonus messages remaining */}
          {activeAddOns.some((a) => a.addOn?.identifier === "extra_messages_5k") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Zap className="h-4 w-4" /> Bonus Messages Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {activeAddOns
                    .filter((a) => a.addOn?.identifier === "extra_messages_5k")
                    .reduce((sum, a) => sum + Number(a.totalBonusRemaining || 0), 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bonus pages remaining */}
          {activeAddOns.some((a) => a.addOn?.identifier === "extra_pages_5k") && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <FileStack className="h-4 w-4" /> Bonus Pages Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {activeAddOns
                    .filter((a) => a.addOn?.identifier === "extra_pages_5k")
                    .reduce((sum, a) => sum + Number(a.totalBonusRemaining || 0), 0)
                    .toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Yearly carry-forward explainer */}
      {activeAddOns.some(
        (a) =>
          a.addOn?.type === "Yearly" &&
          (a.addOn?.identifier === "extra_messages_5k" || a.addOn?.identifier === "extra_pages_5k")
      ) && (
        <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Yearly add-on: monthly credits with carry-forward</p>
            <p className="mt-1 text-blue-700">
              Your yearly add-on deposits a fixed quota each month. Any unused quota from the
              previous month carries forward and stacks with the new month&apos;s credit — nothing
              is lost mid-year.
            </p>
          </div>
        </div>
      )}

      {/* Active add-ons list */}
      {activeAddOns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Active</h3>
          {activeAddOns.map((ua) => (
            <AddonDetailCard key={ua.id} ua={ua} />
          ))}
        </div>
      )}

      {/* Expired/past add-ons list */}
      {expiredAddOns.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500">Past Add-Ons</h3>
          {expiredAddOns.map((ua) => (
            <AddonDetailCard key={ua.id} ua={ua} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {addOns.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No add-ons purchased yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Browse available add-ons on the{" "}
            <a
              href="/pricing"
              className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              pricing page
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

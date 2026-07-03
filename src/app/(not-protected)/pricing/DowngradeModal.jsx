"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function DowngradeModal({
  isOpen,
  onClose,
  targetPlan,
  currentSubscription,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // "scheduled" | "immediate"

  if (!isOpen || !targetPlan || !currentSubscription) return null;

  const targetPlanName = targetPlan.displayName || targetPlan.type;
  const targetPrice = parseFloat(targetPlan.price || 0);

  // Usage info from currentSubscription
  const messagesUsed = (currentSubscription.usage?.messagesSentByHuman ?? 0) +
    (currentSubscription.usage?.messagesSentByAi ?? 0) +
    (currentSubscription.usage?.messagesReceived ?? 0);
  const messagesLimit = currentSubscription.usage?.limitMessages ?? 0;
  const messagesRemaining = Math.max(0, messagesLimit - messagesUsed);

  const pagesUsed = currentSubscription.usage?.pagesIndexed ?? 0;
  const pagesLimit = currentSubscription.usage?.limitPages ?? 0;
  const pagesRemaining = Math.max(0, pagesLimit - pagesUsed);

  const nextBillingDate = currentSubscription.currentPeriodEnd
    ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "the end of your billing period";

  // Target plan limits for display
  const targetMessages = targetPlan.messagesSentByAi >= 1000
    ? `${(targetPlan.messagesSentByAi / 1000).toFixed(0)}k`
    : targetPlan.messagesSentByAi;
  const targetPages = targetPlan.pagesUpto?.toLocaleString();

  const handleConfirm = async () => {
    if (!selectedOption) return;

    setLoading(true);
    try {
      if (selectedOption === "immediate") {
        const res = await api.patch("/billing/subscription/downgrade-immediately", {
          newSubscriptionId: targetPlan.id,
        });
        toast.success(
          `Downgraded to ${targetPlanName}! You've been charged $${targetPrice}. Your new plan is active now.`
        );
      } else {
        const res = await api.patch("/billing/subscription/downgrade", {
          newSubscriptionId: targetPlan.id,
        });
        const effectiveDate = res.data?.data?.scheduledChange?.effectiveAt
          ? new Date(res.data.data.scheduledChange.effectiveAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : nextBillingDate;
        toast.success(
          `Downgrade to ${targetPlanName} scheduled! Current plan stays active until ${effectiveDate}.`
        );
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.error?.message || "Downgrade failed";
      toast.error(msg);
      console.error("Downgrade error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-xl font-bold text-slate-900">
          Downgrade to {targetPlanName}
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          ${targetPrice}/mo
        </p>

        {/* Usage summary */}
        <div className="mb-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <p className="mb-1 font-medium">Your current usage this period:</p>
          <p>
            Messages: {messagesUsed.toLocaleString()} / {messagesLimit.toLocaleString()} used
            <span className="ml-1 text-slate-500">
              ({messagesRemaining.toLocaleString()} remaining)
            </span>
          </p>
          <p>
            Pages: {pagesUsed.toLocaleString()} / {pagesLimit.toLocaleString()} used
            <span className="ml-1 text-slate-500">
              ({pagesRemaining.toLocaleString()} remaining)
            </span>
          </p>
        </div>

        {/* Option A: Scheduled */}
        <label
          className={`mb-3 flex cursor-pointer rounded-lg border-2 p-4 transition-colors ${
            selectedOption === "scheduled"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="downgrade-option"
            className="mr-3 mt-0.5 accent-blue-600"
            checked={selectedOption === "scheduled"}
            onChange={() => setSelectedOption("scheduled")}
          />
          <div>
            <p className="font-semibold text-slate-900">
              Switch at end of billing period
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Keep your current plan until <strong>{nextBillingDate}</strong>.{" "}
              {targetPlanName} starts at renewal. No extra charge.
            </p>
          </div>
        </label>

        {/* Option B: Immediate */}
        <label
          className={`mb-5 flex cursor-pointer rounded-lg border-2 p-4 transition-colors ${
            selectedOption === "immediate"
              ? "border-amber-500 bg-amber-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name="downgrade-option"
            className="mr-3 mt-0.5 accent-amber-600"
            checked={selectedOption === "immediate"}
            onChange={() => setSelectedOption("immediate")}
          />
          <div>
            <p className="font-semibold text-slate-900">
              Switch now — pay ${targetPrice} today
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Get fresh {targetPlanName} limits immediately ({targetMessages} messages, {targetPages} pages).
              Your remaining quota ({messagesRemaining.toLocaleString()} messages,{" "}
              {pagesRemaining.toLocaleString()} pages) will be <strong>lost</strong>.
            </p>
          </div>
        </label>

        {/* Warning for immediate */}
        {selectedOption === "immediate" && (
          <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              You'll be charged <strong>${targetPrice.toFixed(2)}</strong> right
              now for {targetPlanName}. Your current quota will be wiped and
              replaced with {targetPlanName} limits. This cannot be undone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedOption || loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${
              !selectedOption
                ? "cursor-not-allowed bg-slate-300"
                : selectedOption === "immediate"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? "Processing..."
              : selectedOption === "immediate"
                ? `Pay $${targetPrice} & Switch Now`
                : "Schedule Downgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}

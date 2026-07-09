"use client";

import React, { useState } from "react";
import { Loader2, Check, Zap, Tag, Info } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// Frontend descriptions per add-on identifier
const ADDON_DESCRIPTIONS = {
  remove_branding: {
    monthly: "Hide the 'Powered by ContextGPT' watermark on all your chatbots for the purchased month.",
    yearly: "Hide the 'Powered by ContextGPT' watermark on all your chatbots for the entire year.",
  },
  extra_messages_5k: {
    monthly: "Add 5,000 bonus AI messages to your quota for this month. Unused messages carry forward.",
    yearly: "5,000 messages credited to your account each month for 12 months. Unused messages carry forward automatically.",
  },
  extra_pages_5k: {
    monthly: "Add 5,000 bonus pages to your quota for this month. Unused pages carry forward.",
    yearly: "5,000 pages credited to your account each month for 12 months. Unused pages carry forward automatically.",
  },
};

const ADDON_ICONS = {
  remove_branding: Tag,
  extra_messages_5k: Zap,
  extra_pages_5k: Zap,
};

/**
 * AddonCard — displays a single add-on with purchase button.
 *
 * Props:
 *   addon         - The add-on object from GET /billing/addons
 *   purchaseCount - Number of times user has already purchased this addon
 *   isLoggedIn    - Whether user is authenticated
 *   onBuySuccess  - Callback after successful checkout creation (receives { transactionId, checkoutUrl, addonInfo, currentMessagesQuota })
 */
export default function AddonCard({ addon, purchaseCount = 0, isLoggedIn, onBuySuccess }) {
  const [loading, setLoading] = useState(false);
  const [trialModal, setTrialModal] = useState(null); // holds { trialEndsAt, message } when confirmation needed

  const MAX_PURCHASES = 25;
  const isMaxed = purchaseCount >= MAX_PURCHASES;
  const Icon = ADDON_ICONS[addon.identifier] || Zap;

  const descMap = ADDON_DESCRIPTIONS[addon.identifier];
  const description = descMap
    ? (addon.type === "Yearly" ? descMap.yearly : descMap.monthly)
    : addon.title;
  const periodLabel = addon.type === "Yearly" ? "/ year" : "/ month";
  const price = parseFloat(addon.price || 0).toFixed(2);

  const initiateCheckout = async (confirmedOnTrial = false) => {
    if (!isLoggedIn) {
      toast.error("Please log in to purchase add-ons.");
      return;
    }
    if (isMaxed) return;

    setLoading(true);
    try {
      const res = await api.post("/billing/addons/checkout", {
        addOnId: addon.id,
        confirmedOnTrial,
      });

      const data = res.data?.data;

      // Trial confirmation required
      if (data?.requiresConfirmation) {
        setTrialModal({ trialEndsAt: data.trialEndsAt, message: data.message });
        setLoading(false);
        return;
      }

      // Success — return to parent for Paddle overlay or hosted checkout redirect
      if (data?.transactionId || data?.checkoutUrl) {
        onBuySuccess?.({
          transactionId: data.transactionId,
          checkoutUrl: data.checkoutUrl,
          addonInfo: data.addonInfo,
          currentMessagesQuota: data.currentMessagesQuota,
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Failed to start checkout.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{addon.title}</h3>
              {/* Bonus badge for messages and pages addons */}
              {(addon.identifier === "extra_messages_5k" || addon.identifier === "extra_pages_5k") && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  +5,000 {addon.identifier === "extra_messages_5k" ? "messages" : "pages"}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {addon.type}
              </span>
              {/* Yearly tooltip for messages and pages addons */}
              {addon.type === "Yearly" && (addon.identifier === "extra_messages_5k" || addon.identifier === "extra_pages_5k") && (
                <span className="group relative inline-flex items-center">
                  <Info className="h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-blue-500" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    This is a yearly package. {addon.identifier === "extra_messages_5k" ? "5,000 messages" : "5,000 pages"} will be deposited to your account each month for 12 months. Unused {addon.identifier === "extra_messages_5k" ? "messages" : "pages"} from each month carry forward to the next.
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-5 grow text-sm text-slate-500">{description}</p>

        {/* Purchase count badge */}
        {purchaseCount > 0 && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {purchaseCount} active purchase{purchaseCount > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-slate-900">${price}</span>
            <span className="ml-1 text-sm text-slate-500">{periodLabel}</span>
          </div>
          <button
            disabled={loading || isMaxed || !isLoggedIn}
            onClick={() => initiateCheckout(false)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isMaxed
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : !isLoggedIn
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isMaxed ? (
              "Limit reached"
            ) : !isLoggedIn ? (
              "Log in to buy"
            ) : (
              "Add Now"
            )}
          </button>
        </div>
      </div>

      {/* Trial Confirmation Modal */}
      {trialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">You&apos;re on a Free Trial</h2>
            <p className="mb-6 text-sm text-slate-600">{trialModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTrialModal(null);
                  initiateCheckout(true);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Yes, Proceed
              </button>
              <button
                onClick={() => setTrialModal(null)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

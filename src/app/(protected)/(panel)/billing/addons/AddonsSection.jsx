"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";
import AddonCard from "./AddonCard";

/**
 * AddonsSection — displayed on the pricing page below plan cards.
 *
 * Fetches available add-ons and the user's purchased add-ons (if logged in).
 * Handles the Paddle checkout overlay after addon checkout is created.
 *
 * Props:
 *   isLoggedIn - Whether the user is logged in (pass from parent)
 *   currentSubscription - Optional: user's current subscription (to show quota info)
 */
export default function AddonsSection({ isLoggedIn, currentSubscription, isYearly }) {
  const [addOns, setAddOns] = useState([]);
  const [myAddOns, setMyAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoModal, setInfoModal] = useState(null); // { transactionId, checkoutUrl, addonInfo, currentMessagesQuota }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/billing/addons");
        if (res.data?.success) {
          console.log(res.data.data)
          setAddOns(res.data.data.addOns || []);
        }
      } catch (err) {
        console.error("Failed to fetch add-ons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (isLoggedIn) {
      fetchMyAddOns();
    }
  }, [isLoggedIn]);

  const fetchMyAddOns = async () => {
    try {
      const res = await api.get("/billing/addons/my-addons");
      if (res.data?.success) {
        setMyAddOns(res.data.data.addOns || []);
      }
    } catch {
      // Not logged in or no add-ons — that's fine
    }
  };

  // Count how many times a user has purchased a specific add-on (by add-on id)
  const getPurchaseCount = (addonId) => {
    return myAddOns.filter((ua) => ua.addOn?.id === addonId || ua.addOnId === addonId).length;
  };

  // After AddonCard creates a checkout, open Paddle overlay or redirect to hosted checkout
  const handleBuySuccess = ({ transactionId, checkoutUrl, addonInfo, currentMessagesQuota }) => {
    // Show info modal for message add-ons before opening checkout
    if (addonInfo?.identifier === "extra_messages_5k") {
      setInfoModal({ transactionId, checkoutUrl, addonInfo, currentMessagesQuota });
    } else {
      openCheckout(transactionId, checkoutUrl);
    }
  };

  const openCheckout = (transactionId, checkoutUrl) => {
    if (transactionId && typeof window !== "undefined" && window.Paddle) {
      window.Paddle.Checkout.open({
        transactionId,
        settings: {
          successUrl: `${window.location.origin}/billing?addon_purchased=1`,
        },
      });
    } else if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      toast.error("Unable to start checkout. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="mt-16 border-t border-slate-200 pt-16">
        <div className="mb-8 text-center space-y-2">
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!addOns.length) return null;

  const filteredAddons = isYearly === undefined
    ? addOns
    : addOns.filter((addon) => {
        const type = (addon.type || "").trim().toLowerCase();
        return isYearly ? type === "yearly" : type === "monthly";
      });

  if (!filteredAddons.length) return null;

  return (
    <>
      <div className="mt-16 border-t border-slate-200 pt-16">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-900">Enhance Your Plan</h2>
          </div>
          <p className="mx-auto max-w-lg text-slate-500">
            One-time purchases that add extra capabilities to your current plan. Period-based — available for the purchased duration.
          </p>
        </div>

        {/* Add-On Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAddons.map((addon) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              purchaseCount={getPurchaseCount(addon.id)}
              isLoggedIn={isLoggedIn}
              onBuySuccess={handleBuySuccess}
            />
          ))}
        </div>
      </div>

      {/* Info Modal for Extra Messages (shows quota info before Paddle opens) */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Extra Messages Add-On</h2>
            </div>
            <div className="mb-5 space-y-2 text-sm text-slate-600">
              <p>
                You currently have{" "}
                <span className="font-semibold text-slate-900">
                  {infoModal.currentMessagesQuota?.toLocaleString() ?? "—"}
                </span>{" "}
                total messages in your quota.
              </p>
              <p>
                This add-on adds{" "}
                <span className="font-semibold text-slate-900">5,000 messages</span>
                {infoModal.addonInfo?.type === "Yearly"
                  ? " each month for 12 months"
                  : " to your quota for this month"}
                .
              </p>
              {infoModal.addonInfo?.type === "Yearly" && (
                <p className="text-slate-500">
                  Unused messages from each month carry forward automatically.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const { transactionId, checkoutUrl } = infoModal;
                  setInfoModal(null);
                  openCheckout(transactionId, checkoutUrl);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continue to Payment
              </button>
              <button
                onClick={() => setInfoModal(null)}
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

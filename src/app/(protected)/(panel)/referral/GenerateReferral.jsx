"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Loader2, Link2 } from "lucide-react";

export const GenerateReferral = () => {
  const [promotionId, setPromotionId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [referralData, setReferralData] = useState(null);

  const handleGenerate = async () => {
    if (!promotionId.trim()) {
      toast.error("Please enter a Promotion ID");
      return;
    }
    try {
      setGenerating(true);
      const response = await api.post("/referrals/generate", {
        promoCode: promotionId.trim(),
      });
      if (response.data.success) {
        setReferralData(response.data.data);
        toast.success("Referral code generated!");
      }
    } catch (error) {
      console.error("Failed to generate referral code:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to generate referral code.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Enter Promotion ID..."
          className="flex-1 border-gray-300 shadow-sm focus-visible:ring-blue-500"
          value={promotionId}
          onChange={(e) => setPromotionId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button
          className="bg-blue-500 px-6 font-semibold text-white shadow-sm hover:bg-blue-600"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Generate Code"
          )}
        </Button>
      </div>

      {referralData && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3">
          {/* Referral Code */}
          <div>
            <span className="text-xs font-semibold text-gray-500">Referral Code</span>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-mono text-gray-800">
                {referralData.referralCode}
              </code>
              <button
                onClick={() => copyToClipboard(referralData.referralCode)}
                className="rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <span className="text-xs font-semibold text-gray-500">Referral Link</span>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate text-sm text-gray-800">
                  {referralData.referralLink}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(referralData.referralLink)}
                className="rounded-md border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Promotion Details */}
          {referralData.promotion && (
            <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
              {referralData.promotion.rewardMessages > 0 && (
                <span className="rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-700">
                  +{referralData.promotion.rewardMessages} messages
                </span>
              )}
              {referralData.promotion.rewardPages > 0 && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">
                  +{referralData.promotion.rewardPages} pages
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                Reward: {referralData.promotion.rewardTarget}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

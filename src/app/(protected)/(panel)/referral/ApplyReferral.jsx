"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Gift } from "lucide-react";

export const ApplyReferral = () => {
  const [referralCode, setReferralCode] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      setApplying(true);
      const response = await api.post("/referrals/apply", {
        referralCode: referralCode.trim(),
      });
      if (response.data.success) {
        toast.success(response.data.message || "Referral code applied successfully!");
        // Persist code so pricing page auto-fills it at checkout
        localStorage.setItem("pendingPromoCode", referralCode.trim());
        setReferralCode("");
      }
    } catch (error) {
      console.error("Failed to apply referral code:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to apply referral code.",
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Enter referral code..."
          className="flex-1 border-gray-300 shadow-sm focus-visible:ring-green-500"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <Button
          className="bg-green-500 px-6 font-semibold text-white shadow-sm hover:bg-green-600"
          onClick={handleApply}
          disabled={applying}
        >
          {applying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Apply Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

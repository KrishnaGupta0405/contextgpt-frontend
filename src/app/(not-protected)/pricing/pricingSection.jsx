"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
import api from "@/lib/axios";
import { Check, Zap, Box, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import DowngradeModal from "./DowngradeModal";
import ActiveSubToTrialModal from "./ActiveSubToTrialModal";
import AddonsSection from "@/app/(protected)/(panel)/billing/addons/AddonsSection";
import PromoCodeButton from "./PromoCodeButton";
import { useAuth } from "@/context/AuthContext";

function PricingSectionContent({ plans = [], loading = true }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [isYearly, setIsYearly] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // plan id being checked out
  const [downgradeModal, setDowngradeModal] = useState({ open: false, plan: null });
  const [cancelDowngradeLoading, setCancelDowngradeLoading] = useState(false);
  const [trialSwitchModal, setTrialSwitchModal] = useState({ open: false, plan: null });
  const [highlightedPlan, setHighlightedPlan] = useState(null);
  const [activeSubTrialModal, setActiveSubTrialModal] = useState({ open: false, plan: null });
  const [activeSubTrialLoading, setActiveSubTrialLoading] = useState(false);

  useEffect(() => {
    const interval = searchParams.get("interval");
    if (interval === "year") {
      setIsYearly(true);
    } else if (interval === "month") {
      setIsYearly(false);
    }
    const planParam = searchParams.get("plan");
    if (planParam) {
      setHighlightedPlan(planParam.toLowerCase());
      const scrollT = setTimeout(() => {
        document.getElementById(`plan-${planParam.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      const clearT = setTimeout(() => setHighlightedPlan(null), 5000);
      return () => { clearTimeout(scrollT); clearTimeout(clearT); };
    }
  }, [searchParams]);

  // Load promo code state — needed for guests and logged-in users alike
  useEffect(() => {
    const savedPromo = localStorage.getItem("pendingPromoCode");
    if (savedPromo) {
      setPromoCode(savedPromo);
      setShowPromo(true);
    }
  }, []);

  // Only load the Paddle SDK if the active processor is Paddle and at least one
  // visible plan actually uses it — Creem/Polar checkouts are hosted redirects
  // and need no client SDK.
  useEffect(() => {
    const isPaddleActive = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR === "paddle";
    const needsPaddle = isPaddleActive && plans.some((p) => p.providerName === "paddle");
    if (!needsPaddle || window.Paddle) return;

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";
      window.Paddle?.Environment.set(paddleEnv);
      window.Paddle?.Setup({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      });
      console.log(`Paddle initialized in ${paddleEnv} mode`);
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [plans]);

  // Fetch subscription only once auth state is resolved and user is confirmed logged in
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoggedIn(false);
      setCurrentSubscription(null);
      console.log("Current Subscription", null);
      return;
    }
    const fetchCurrentSub = async () => {
      try {
        const res = await api.get("/billing/subscription/current");
        if (res?.data?.success) {
          setCurrentSubscription(res.data.data);
          if (res.data.data) setIsLoggedIn(true);
        }
        console.log("Current Subscription", res?.data?.data);
      } catch (err) {
        // Subscription fetch failed but user is authenticated
        setIsLoggedIn(true);
        console.log("Current Subscription fetch failed", err);
      }
    };
    fetchCurrentSub();
  }, [user, authLoading]);

  // After login redirect back to /pricing, auto-resume the checkout the user intended
  useEffect(() => {
    if (!isLoggedIn || plans.length === 0) return;
    const pendingPlanId = sessionStorage.getItem("pendingPlanId");
    if (!pendingPlanId) return;
    const pendingPlan = plans.find((p) => p.id === pendingPlanId);
    sessionStorage.removeItem("pendingPlanId");
    sessionStorage.removeItem("pendingBillingInterval");
    if (pendingPlan) handleSubscribe(pendingPlan);
  }, [isLoggedIn, plans]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubscribe = async (plan, confirmed = false, skipTrial = false) => {
    const planName = getPlanName(plan.type);
    if (
      planName === "Enterprise" ||
      !plan.price ||
      parseFloat(plan.price) === 0
    ) {
      window.location.href = "mailto:support@contextgpt.in?subject=Enterprise Plan Inquiry";
      return;
    }

    setCheckoutLoading(plan.id);

    try {
      // If user is currently trialing and wants to start a trial on another plan,
      // show a warning modal first. The modal calls handleSubscribe again with confirmed=true.
      if (
        currentSubscription?.isTrial &&
        !hasUsedTrial(plan) &&
        !skipTrial &&
        !confirmed
      ) {
        setTrialSwitchModal({ open: true, plan });
        setCheckoutLoading(null);
        return;
      }

      // If user has an active (non-trial) paid plan and wants to start a fresh
      // trial of a DIFFERENT plan, the backend hard-blocks new checkouts while
      // any subscription is active (matches Paddle/Creem). Warn the user that
      // starting the trial requires ending their current plan first, and that
      // doing so forfeits their current plan's remaining quota/usage.
      if (
        currentSubscription &&
        currentSubscription.status === "active" &&
        !currentSubscription.isTrial &&
        !isCurrentPlan(plan) &&
        !hasUsedTrial(plan) &&
        !skipTrial &&
        !confirmed
      ) {
        setActiveSubTrialModal({ open: true, plan });
        setCheckoutLoading(null);
        return;
      }

      // F2: If user already has a subscription, use upgrade/downgrade endpoint
      // Exception: if this plan hasn't been trialed yet, offer a new trial checkout
      if (
        currentSubscription &&
        ["active", "trialing"].includes(currentSubscription.status) &&
        !(!hasUsedTrial(plan) && !skipTrial)
      ) {
        // Activating the SAME plan currently being trialed: the provider's
        // upgrade endpoint only swaps products with proration and has no
        // trial-ending parameter, so calling it here just re-anchors the
        // trial on the same product instead of starting paid billing. End
        // the trial and start a fresh (non-trial) checkout instead.
        if (currentSubscription.isTrial && isCurrentPlan(plan)) {
          const activateRes = await api.post("/billing/subscription/activate-trial");
          const { checkoutUrl } = activateRes.data.data;
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            toast.error("Unable to start checkout");
            setCheckoutLoading(null);
          }
          return;
        }

        const currentRank = getTierRank(currentSubscription.planType);
        const targetRank = getTierRank(plan.type);
        const isDowngrade = targetRank < currentRank && !currentSubscription.isTrial;

        // Downgrade: open modal with both options (scheduled vs immediate)
        if (isDowngrade) {
          setDowngradeModal({ open: true, plan });
          setCheckoutLoading(null);
          return;
        }

        const res = await api.patch("/billing/subscription/upgrade", {
          newSubscriptionId: plan.id,
        });

        // Trial with no Paddle subscription ID — fall through to new checkout
        if (res.data?.data?.requiresCheckout) {
          // continue to checkout below
        } else {
          const isTrialActivation = currentSubscription?.isTrial;

          toast.success(
            isTrialActivation
              ? "Plan activated — billing starts now!"
              : `Plan changed to ${planName} successfully!`,
            { duration: 6000 }
          );

          try {
            const subRes = await api.get("/billing/subscription/current");
            if (subRes?.data?.success) setCurrentSubscription(subRes.data.data);
            console.log("Current Subscription", subRes?.data?.data);
          } catch (err) {
            console.log("Current Subscription fetch failed", err);
          }
          setCheckoutLoading(null);
          return;
        }
      }

      // New subscription checkout flow
      const successUrl = `${window.location.origin}/billing/success?plan=${encodeURIComponent(planName)}&interval=${encodeURIComponent(plan.billingInterval || "")}`;

      try {
        posthog.capture("checkout_initiated", {
          plan_name: planName,
          plan_type: plan.type,
          price: plan.price,
          billing_interval: plan.billingInterval,
        });
      } catch (e) {
        console.error("PostHog capture failed:", e);
      }

      if (isLoggedIn) {
        const body = { subscriptionId: plan.id };
        if (promoCode.trim()) {
          body.promoCode = promoCode.trim();
        }
        if (currentSubscription?.usedTrialPlanIds?.includes(plan.id) || skipTrial) {
          body.directPurchase = true;
        }
        const response = await api.post("/billing/checkout/create", body);
        localStorage.removeItem("pendingPromoCode");
        const { transactionId, checkoutUrl } = response.data.data;

        if (transactionId) {
          // Paddle: open inline overlay checkout
          window.Paddle?.Setup({
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          });
          window.Paddle?.Checkout.open({
            transactionId,
            settings: { successUrl },
          });
        } else if (checkoutUrl) {
          // Creem (or any hosted-checkout processor): redirect to hosted checkout
          window.location.href = checkoutUrl;
        } else {
          toast.error("Unable to start checkout");
        }
      } else {
        // Not logged in — save intent and redirect to login, then return to pricing
        sessionStorage.setItem("pendingPlanId", plan.id);
        sessionStorage.setItem("pendingBillingInterval", plan.billingInterval || "");
        router.push(`/login?callbackUrl=${encodeURIComponent("/pricing")}`);
        setCheckoutLoading(null);
        return;
      }
    } catch (error) {
      const msg = error?.response?.data?.error?.message || "Checkout failed";
      toast.error(msg, { duration: 6000 });
      console.error("Checkout error:", error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleConfirmActiveSubTrial = async () => {
    const plan = activeSubTrialModal.plan;
    if (!plan) return;
    setActiveSubTrialLoading(true);
    try {
      await api.post("/billing/subscription/cancel", { effectiveFrom: "immediately" });
      setActiveSubTrialModal({ open: false, plan: null });
      await handleSubscribe(plan, true);
    } catch (error) {
      const msg = error?.response?.data?.error?.message || "Failed to switch plans";
      toast.error(msg, { duration: 6000 });
      console.error("Active-sub-to-trial switch error:", error);
    } finally {
      setActiveSubTrialLoading(false);
    }
  };

  const handleCancelDowngrade = async () => {
    setCancelDowngradeLoading(true);
    try {
      await api.patch("/billing/subscription/downgrade/cancel");
      toast.success("Scheduled downgrade cancelled — staying on your current plan!", { duration: 6000 });
      const subRes = await api.get("/billing/subscription/current");
      if (subRes?.data?.success) setCurrentSubscription(subRes.data.data);
      console.log("Current Subscription", subRes?.data?.data);
    } catch (error) {
      const msg = error?.response?.data?.error?.message || "Failed to cancel downgrade";
      toast.error(msg, { duration: 6000 });
    } finally {
      setCancelDowngradeLoading(false);
    }
  };

  const getIcon = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("starter") || t.includes("free") || t.includes("solo"))
      return <Box className="h-5 w-5 text-blue-600" />;
    if (t.includes("growth") || t.includes("pro") || t.includes("team"))
      return <Rocket className="h-5 w-5 text-blue-600" />;
    if (t.includes("scale") || t.includes("business"))
      return <Zap className="h-5 w-5 text-blue-600" />;
    if (t.includes("enterprise") || t.includes("custom"))
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-5 w-5">
          <path d="M216,56v58.77c0,84.18-71.31,112.07-85.54,116.8a7.54,7.54,0,0,1-4.92,0C111.31,226.86,40,199,40,114.79V56a8,8,0,0,1,8-8H208A8,8,0,0,1,216,56Z" opacity="0.2" fill="#059669" />
          <path d="M208,40H48A16,16,0,0,0,32,56v58.77c0,89.61,75.82,119.34,91,124.39a16,16,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18C114.35,219.41,48,193.21,48,114.79V56H208Z" fill="#059669" />
        </svg>
      );
    return <Box className="h-5 w-5 text-blue-600" />;
  };

  const getPlanName = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("starter") || t.includes("free") || t.includes("solo"))
      return "Starter";
    if (t.includes("growth") || t.includes("pro") || t.includes("team"))
      return "Growth";
    if (t.includes("scale") || t.includes("business")) return "Scale";
    if (t.includes("enterprise") || t.includes("custom")) return "Enterprise";
    return type;
  };

  // Tier rank is independent of billing interval/price so that a monthly
  // plan's price never gets compared against a yearly plan's price (e.g.
  // yearly Starter at $39 vs monthly Starter at $59 would otherwise look
  // like a downgrade even though they're the same tier).
  const TIER_RANK = { Starter: 1, Growth: 2, Scale: 3, Enterprise: 4 };
  const getTierRank = (type) => TIER_RANK[getPlanName(type)] ?? 0;

  // F6: Determine if a plan is the current plan
  const isCurrentPlan = (plan) => {
    if (!currentSubscription || currentSubscription.isExpired || !currentSubscription.status) return false;
    return currentSubscription.planType === plan.type;
  };

  // Determine if a plan is the one the user had before it expired/was canceled
  const isExpiredPlan = (plan) => {
    if (!currentSubscription?.isExpired) return false;
    return currentSubscription.planType === plan.type;
  };

  // Check if user has already used the free trial for this plan
  const hasUsedTrial = (plan) => {
    const usedIds = currentSubscription?.usedTrialPlanIds || [];
    return usedIds.includes(plan.id);
  };

  // Check if user has ever used this plan — trial OR direct payment
  const hasPreviouslySubscribed = (plan) => {
    const usedIds = currentSubscription?.usedTrialPlanIds || [];
    return usedIds.includes(plan.id);
  };

  const getTrialUsedDate = (plan) => {
    const date = currentSubscription?.usedTrialPlans?.[plan.id];
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getButtonLabel = (plan) => {
    const isCustom =
      getPlanName(plan.type) === "Enterprise" ||
      !plan.price ||
      parseFloat(plan.price) === 0;
    if (isCustom) return "Contact us";

    if (isExpiredPlan(plan)) return "Resubscribe";

    // If user is trialing on this plan, let them activate/pay for it
    if (isCurrentPlan(plan) && currentSubscription?.isTrial) {
      return "Activate Plan";
    }
    if (isCurrentPlan(plan)) {
      // If there's a scheduled downgrade, allow cancelling it (re-upgrade)
      if (currentSubscription?.scheduledChange?.action === "downgrade") {
        return "Current Plan";
      }
      return "Current Plan";
    }

    // If this plan is the target of a scheduled downgrade, show that
    if (currentSubscription?.scheduledChange?.newPlanId === plan.id) {
      return "Downgrade Scheduled";
    }

    if (
      currentSubscription &&
      ["active", "trialing"].includes(currentSubscription.status)
    ) {
      // If the user hasn't used a trial for this specific plan yet, offer one
      if (!hasUsedTrial(plan)) {
        return "Start a free trial";
      }
      const currentRank = getTierRank(currentSubscription.planType);
      const targetRank = getTierRank(plan.type);
      if (targetRank === currentRank) return "Switch Billing";
      return targetRank > currentRank ? "Upgrade" : "Downgrade";
    }

    if (hasPreviouslySubscribed(plan)) return "Buy Now";

    return "Start a free trial";
  };

  // When the primary button offers a free trial, also show a secondary
  // button so the user can skip the trial and go straight to upgrade/buy.
  const getSecondaryButtonLabel = (plan) => {
    if (getButtonLabel(plan) !== "Start a free trial") return null;

    if (
      currentSubscription &&
      ["active", "trialing"].includes(currentSubscription.status)
    ) {
      const currentRank = getTierRank(currentSubscription.planType);
      const targetRank = getTierRank(plan.type);
      if (targetRank === currentRank) return "Switch Billing";
      return targetRank > currentRank ? "Upgrade" : "Downgrade";
    }

    return "Buy Now";
  };

  const currentInterval = isYearly ? "yearly" : "monthly";

  const validPlans = plans.filter((p) => p.billingInterval === currentInterval);

  const planMap = new Map();
  validPlans.forEach((p) => {
    const name = getPlanName(p.type);
    if (!planMap.has(name) || p.type.includes("pri_")) {
      planMap.set(name, p);
    }
  });

  const displayedPlans = Array.from(planMap.values()).sort((a, b) => {
    const order = { Starter: 1, Growth: 2, Scale: 3, Enterprise: 4 };
    const rankA = order[getPlanName(a.type)] || 99;
    const rankB = order[getPlanName(b.type)] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return parseFloat(a.price || 0) - parseFloat(b.price || 0);
  });

  return (
    <div id="pricing-section" className="min-h-screen p-4 font-sans text-slate-900 md:p-8 lg:p-12">
      <div className="mx-auto mt-10 max-w-7xl">
        {/* Header & Toggle */}
        <div className="mb-4 flex flex-col items-center">
          <div className="relative mb-10 flex w-full items-center justify-center">
            <div className="relative flex items-center gap-4">
              <span
                className={`text-lg font-semibold transition-colors ${
                  !isYearly ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Pay Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isYearly}
                onClick={() => {
                  const newIsYearly = !isYearly;
                  setIsYearly(newIsYearly);
                  const interval = newIsYearly ? "year" : "month";
                  try {
                    posthog.capture("billing_interval_toggled", {
                      selected_interval: newIsYearly ? "yearly" : "monthly",
                    });
                  } catch (e) {
                    console.error("PostHog capture failed:", e);
                  }
                  router.push(`/pricing?interval=${interval}`);
                }}
                className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-500 transition-colors duration-200 ease-in-out focus:outline-none"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isYearly ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-lg font-semibold transition-colors ${
                  isYearly ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Pay Yearly
              </span>

              {/* Save 40% annotation */}
              <div className="absolute top-3/4 -right-[140px] hidden -translate-y-1/2 items-center md:flex gap-2">
                <div className="-mt-2"> 
                  <img
                    src="/landing/scribble-arrow-icon.svg"
                    alt="Save 37%"
                    width={55}
                    height={45}
                  />
                </div>
                <span style={{fontWeight: 'bolder'}} className="mb-2 mt-4 -ml-2 text-blue-600">
                  Save 37%
                </span>
              </div>
            </div>
          </div>

          {/* Promo code input — only for logged-in users */}
          <div className="w-full max-w-md">
            {!isLoggedIn ? null : !showPromo ? (
              // <PromoCodeButton onClick={() => setShowPromo(true)} />
              <></>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={() => {
                    setPromoCode("");
                    setShowPromo(false);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : displayedPlans.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            No pricing plans available.
          </div>
        ) : (
          <div className="mx-auto flex w-full flex-col gap-6 pb-10">
            {displayedPlans.map((plan) => {
              const isGrowth =
                plan.type.toLowerCase().includes("growth") ||
                plan.type.toLowerCase() === "pro";
              const isEnterprise = plan.type
                .toLowerCase()
                .includes("enterprise");
              const isCustom =
                isEnterprise || !plan.price || parseFloat(plan.price) === 0;
              const monthlyPrice = isCustom ? 0 : parseFloat(plan.price || 0);
              const yearlyPrice = monthlyPrice * 12;
              const isCurrent = isCurrentPlan(plan);
              const isExpired = isExpiredPlan(plan);
              const isTrialing = currentSubscription?.isTrial === true;
              const isDowngradeTarget = currentSubscription?.scheduledChange?.newPlanId === plan.id;
              const hasScheduledDowngrade = isCurrent && currentSubscription?.scheduledChange?.action === "downgrade";
              const isDisabled = (isCurrent && !isTrialing && !hasScheduledDowngrade) || isDowngradeTarget;
              const buttonLabel = getButtonLabel(plan);
              const secondaryButtonLabel = getSecondaryButtonLabel(plan);

              let featuresList = [];

              if (isEnterprise) {
                featuresList = [
                  {
                    label: "Up to 10,000 chatbots",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    // isBold: true,
                  },
                  {
                    label: "Customizable message volume",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    // isBold: true,
                  },
                  {
                    label: "Up to 500,000 pages",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    // isBold: true,
                  },
                  {
                    label: "Manual Refresh",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    // isBold: true,
                  },
                  {
                    label: "Up to 10,000 team members",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    isBold: true,
                    isExtraBold: true,
                  },
                  {
                    label: "Integrations with multiple platforms",
                    included: true,
                    //highlightColor: "text-emerald-600",
                    isBold: true,
                    isExtraBold: true,
                  },
                  {
                    label: "API Access",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    isBold: true,
                    isExtraBold: true,
                  },
                  {
                    label: "Rate Limiting",
                    included: true,
                    // highlightColor: "text-emerald-600",
                    isBold: true,
                    isExtraBold: true,
                  },
                  {
                    label: "Auto Refresh (Daily)",
                    included: true,
                    highlightColor: "text-emerald-600",
                    isBold: true,
                  },
                  {
                    label: "Priority Support",
                    included: true,
                    highlightColor: "text-emerald-600",
                    isBold: true,
                  },
                  {
                    label: "Webhook Support",
                    included: true,
                    highlightColor: "text-emerald-600",
                    isBold: true,
                  },
                  {
                    label: "Custom Integrations",
                    included: true,
                    highlightColor: "text-emerald-600",
                    isBold: true,
                  },
                  {
                    label: "Signed DPA on request",
                    included: true,
                    highlightColor: "text-emerald-600",
                    isBold: true,
                  },
                  // {
                  //   label: "HIPAA eligible",
                  //   included: true,
                  //   highlightColor: "text-emerald-600",
                  //   isBold: true,
                  // },
                  // {
                  //   label: "Custom BAA available",
                  //   included: true,
                  //   highlightColor: "text-emerald-600",
                  //   isBold: true,
                  // },
                ];
              } else {
                featuresList = [
                  {
                    label: `${plan.chatbotGiven === -1 || plan.chatbotGiven > 99999 ? "Up to 10,000" : plan.chatbotGiven === 1 ? "1" : "Up to " + plan.chatbotGiven.toLocaleString()} chatbot${plan.chatbotGiven === 1 ? "" : "s"}`,
                    included: plan.chatbotGiven > 0 || plan.chatbotGiven === -1,
                    highlightColor: "text-slate-600 font-medium",
                  },
                  {
                    label: `Up to ${plan.messagesSentByAi === -1 || plan.messagesSentByAi > 99999 ? "Customizable message volume" : plan.messagesSentByAi >= 1000 ? plan.messagesSentByAi / 1000 + "k messages per month" : plan.messagesSentByAi + " messages per month"}`,
                    included:
                      plan.messagesSentByAi > 0 ||
                      plan.messagesSentByAi === -1,
                    highlightColor: "text-slate-600 font-medium",
                  },
                  {
                    label: `Up to ${plan.pagesUpto === -1 || plan.pagesUpto > 99999 ? "500,000" : plan.pagesUpto.toLocaleString()} pages`,
                    included: plan.pagesUpto > 0 || plan.pagesUpto === -1,
                    highlightColor: "text-slate-600 font-medium",
                  },
                  {
                    label: "Manual Refresh",
                    included: true,
                    highlightColor: "text-slate-600 font-medium",
                  },
                  {
                    label: `${plan.teamMemberAccess === -1 || plan.teamMemberAccess > 99999 ? "Up to 10,000" : plan.teamMemberAccess === 1 ? "1" : "Up to " + plan.teamMemberAccess.toLocaleString()} team member${plan.teamMemberAccess === 1 ? "" : "s"}`,
                    included:
                      plan.teamMemberAccess > 0 || plan.teamMemberAccess === -1,
                    highlightColor: "text-slate-900",
                    isBold: plan.teamMemberAccess > 1,
                  },
                  {
                    label: "Integrations with multiple platforms",
                    included:
                      isGrowth ||
                      plan.type.toLowerCase().includes("scale"),
                    highlightColor: "text-slate-900",
                    isBold: true,
                  },
                  {
                    label: "API Access",
                    included: plan.apiAccess,
                    highlightColor: "text-slate-900",
                    isBold: true,
                  },
                  {
                    label: "Rate Limiting",
                    included:
                      plan.conversationLimit == true &&
                      (isGrowth ||
                        plan.type.toLowerCase().includes("scale")),
                    highlightColor: "text-slate-900",
                    isBold: true,
                  },                  
                  {
                    label: plan.autoRefreshData
                      ? `Auto Refresh (${plan.autoRefreshDataOccurrence?.charAt(0).toUpperCase() + plan.autoRefreshDataOccurrence?.slice(1) || ""})`
                      : null,
                    included: plan.autoRefreshData,
                    highlightColor: "text-blue-600 font-bold",
                  },
                  {
                    label: plan.autoScanData
                      ? `Auto Scan (${plan.autoScanDataOccurrence?.charAt(0).toUpperCase() + plan.autoScanDataOccurrence?.slice(1) || "Daily"})`
                      : null,
                    included: plan.autoScanData,
                    highlightColor: "text-blue-600",
                    isBold: true,
                  },
                  {
                    label: "Webhook Support",
                    included:
                      plan.webhookSupport &&
                      plan.type.toLowerCase().includes("scale"),
                    highlightColor: "text-blue-600",
                    isBold: true,
                  },
                ];
              }

              return (
                <div
                  key={plan.id}
                  id={`plan-${getPlanName(plan.type).toLowerCase()}`}
                  className={`relative rounded-2xl border p-5 transition-shadow hover:shadow-md sm:p-8 ${
                    isEnterprise
                      ? "border-slate-300 bg-slate-50"
                      : isCurrent
                        ? "border-blue-400 bg-blue-50/50 ring-2 ring-blue-200"
                        : isExpired
                          ? "border-red-200 bg-red-50/30"
                          : "border-blue-100 bg-white"
                  }`}
                >
                  {/* Badges */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                      {isTrialing ? "On Trial" : "Current Plan"}
                    </div>
                  )}
                  {isExpired && (
                    <div className="absolute -top-3 left-6 rounded-full bg-red-500 px-3 py-0.5 text-xs font-semibold text-white">
                      Expired
                    </div>
                  )}
                  {isDowngradeTarget && (
                    <div className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                      Downgrade Scheduled
                      {currentSubscription?.scheduledChange?.effectiveAt &&
                        ` — ${new Date(currentSubscription.scheduledChange.effectiveAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </div>
                  )}

                  {/* Top grid: left = name/price/button, right = features */}
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    {/* Left: plan info */}
                    <div className="flex w-full flex-col md:w-[260px] md:shrink-0">
                      <div className="mb-3 flex items-center gap-3">
                        {getIcon(plan.type)}
                        <h3 className="text-xl font-bold tracking-tight text-slate-800 capitalize">
                          {getPlanName(plan.type)}
                        </h3>
                      </div>

                      <div className="flex flex-col">
                        {isCustom ? (
                          <span className="text-[36px] leading-none font-extrabold tracking-tight text-slate-900">
                            Custom
                          </span>
                        ) : (
                          <>
                            <div className="flex items-end gap-1">
                              <span className="text-[36px] leading-none font-extrabold tracking-tight text-slate-900">
                                ${monthlyPrice}
                              </span>
                              <span className="mb-1 text-lg font-medium text-slate-500">
                                /mo
                              </span>
                            </div>
                            {isYearly && (
                              <p className="mt-1 text-[14px] text-slate-600">
                                billed{" "}
                                <span className="font-bold text-slate-900">
                                  ${yearlyPrice}
                                </span>{" "}
                                yearly
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Logged-out visitors only get actionable buttons that
                          don't just bounce them to login — free trial and
                          contact-us. Everything else (Upgrade/Downgrade/Buy
                          Now/Current Plan/etc.) needs an account to mean
                          anything, so hide it until they're logged in. */}
                      {!isLoggedIn && buttonLabel !== "Start a free trial" && buttonLabel !== "Contact us" ? null : isDowngradeTarget ? (
                        <Button
                          onClick={handleCancelDowngrade}
                          disabled={cancelDowngradeLoading}
                          className="mt-5 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full"
                        >
                          {cancelDowngradeLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cancelling...
                            </span>
                          ) : (
                            "Cancel Downgrade"
                          )}
                        </Button>
                      ) : buttonLabel === "Start a free trial" ? (
                        <ShimmerButton
                          onClick={() => !isDisabled && handleSubscribe(plan)}
                          disabled={isDisabled || checkoutLoading === plan.id}
                          background="var(--color-blue-600)"
                          className={`mt-5 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full ${
                            isDisabled || checkoutLoading === plan.id ? "cursor-not-allowed opacity-60" : ""
                          } ${highlightedPlan && plan.type.toLowerCase().includes(highlightedPlan) ? "animate-pulse ring-4 ring-blue-400 ring-offset-2" : ""}`}
                        >
                          {checkoutLoading === plan.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            buttonLabel
                          )}
                        </ShimmerButton>
                      ) : buttonLabel === "Contact us" ? (
                        <RainbowButton
                          onClick={() => !isDisabled && handleSubscribe(plan)}
                          disabled={isDisabled || checkoutLoading === plan.id}
                          className={`mt-5 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full ${
                            isDisabled || checkoutLoading === plan.id ? "cursor-not-allowed opacity-60" : ""
                          } ${highlightedPlan && plan.type.toLowerCase().includes(highlightedPlan) ? "animate-pulse ring-4 ring-blue-400 ring-offset-2" : ""}`}
                        >
                          {checkoutLoading === plan.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            buttonLabel
                          )}
                        </RainbowButton>
                      ) : (
                        <Button
                          onClick={() => !isDisabled && handleSubscribe(plan)}
                          disabled={isDisabled || checkoutLoading === plan.id}
                          className={`mt-5 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full ${
                            isDisabled || checkoutLoading === plan.id ? "cursor-not-allowed opacity-60" : ""
                          } ${highlightedPlan && plan.type.toLowerCase().includes(highlightedPlan) ? "animate-pulse ring-4 ring-blue-400 ring-offset-2" : ""}`}
                        >
                          {checkoutLoading === plan.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            buttonLabel
                          )}
                        </Button>
                      )}
                      {secondaryButtonLabel && (isLoggedIn || secondaryButtonLabel === "Contact us") && (
                        secondaryButtonLabel === "Contact us" ? (
                          <RainbowButton
                            onClick={() => !isDisabled && handleSubscribe(plan, false, true)}
                            disabled={isDisabled || checkoutLoading === plan.id}
                            className="mt-2 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full"
                          >
                            {secondaryButtonLabel}
                          </RainbowButton>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => !isDisabled && handleSubscribe(plan, false, true)}
                            disabled={isDisabled || checkoutLoading === plan.id}
                            className="mt-2 w-full py-2.5 text-[14px] font-semibold sm:w-[200px] md:w-full"
                          >
                            {secondaryButtonLabel}
                          </Button>
                        )
                      )}
                      {hasScheduledDowngrade && (
                        <button
                          onClick={handleCancelDowngrade}
                          disabled={cancelDowngradeLoading}
                          className="mt-2 text-left text-[13px] font-medium text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          {cancelDowngradeLoading ? "Cancelling..." : "Cancel scheduled downgrade"}
                        </button>
                      )}
                      {hasUsedTrial(plan) && getTrialUsedDate(plan) && (
                        <p className="mt-2 text-[12px] text-slate-400">
                          Free trial used on {getTrialUsedDate(plan)}
                        </p>
                      )}
                    </div>

                    {/* Right: features */}
                    <div className="flex flex-col border-t border-slate-200 pt-5 md:flex-1 md:border-t-0 md:border-l md:pl-8 md:pt-0">
                      <p className="mb-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                        INCLUDES:
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:gap-x-10 sm:gap-y-4">
                        {featuresList.map((feature, idx) => {
                          if (!feature.label || !feature.included) return null;
                          return (
                            <div
                              key={idx}
                              className="group flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Check
                                  className="h-3.5 w-3.5 shrink-0 text-blue-600 sm:h-4 sm:w-4"
                                  strokeWidth={2.5}
                                />
                                <span
                                  className={`text-[13px] sm:text-[15px] underline decoration-slate-400 decoration-dotted decoration-2 underline-offset-4 ${feature.highlightColor}`}
                                  style={{ ...(feature.isBold && { fontWeight: 700 }) }}
                                >
                                  {feature.label}
                                </span>
                              </div>
                              <div className="ml-1 flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-300 text-[9px] text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-500">
                                i
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add-Ons Section */}
      
      <AddonsSection
        isLoggedIn={isLoggedIn}
        currentSubscription={currentSubscription}
        isYearly={isYearly}
      />
      <p className="text-center text-sm mt-4 max-w-[600px] mx-auto text-muted-foreground">
        Add-Ons are available till their purchased time period, if user ends the subscription and later renews it,
        and if in that interval the add-ons interval is still left, then under that new subscription also user  can use their remaning quota of the addons
      </p>

      {trialSwitchModal.open && trialSwitchModal.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-slate-900">Switch free trial?</h2>
            <p className="mb-4 text-sm text-slate-600">
              You are currently on a free trial of{" "}
              <span className="font-semibold text-slate-800">{getPlanName(currentSubscription.planType)}</span>
              {currentSubscription.trialStartedAt && currentSubscription.trialEndsAt && (
                <>
                  {" "}({new Date(currentSubscription.trialStartedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} –{" "}
                  {new Date(currentSubscription.trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
                </>
              )}
              . Starting a trial for{" "}
              <span className="font-semibold text-slate-800">{getPlanName(trialSwitchModal.plan.type)}</span>{" "}
              will end your current trial immediately.
            </p>
            <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 border border-amber-200">
              Once a plan&apos;s free trial has been used, it cannot be re-used.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTrialSwitchModal({ open: false, plan: null })}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep current trial
              </button>
              <button
                onClick={() => {
                  const plan = trialSwitchModal.plan;
                  setTrialSwitchModal({ open: false, plan: null });
                  handleSubscribe(plan, true);
                }}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Start new trial
              </button>
            </div>
          </div>
        </div>
      )}

      <DowngradeModal
        isOpen={downgradeModal.open}
        onClose={() => setDowngradeModal({ open: false, plan: null })}
        targetPlan={downgradeModal.plan}
        currentSubscription={currentSubscription}
        onSuccess={async () => {
          console.log("onSuccess fired");
          try {
            const subRes = await api.get("/billing/subscription/current");
            console.log("subRes", subRes?.data);
            if (subRes?.data?.success) setCurrentSubscription(subRes.data.data);
          } catch (err) {
            console.log("onSuccess error", err);
          }
        }}
      />

      <ActiveSubToTrialModal
        isOpen={activeSubTrialModal.open}
        onClose={() => !activeSubTrialLoading && setActiveSubTrialModal({ open: false, plan: null })}
        currentPlanName={currentSubscription ? getPlanName(currentSubscription.planType) : ""}
        targetPlanName={activeSubTrialModal.plan ? getPlanName(activeSubTrialModal.plan.type) : ""}
        currentPeriodEnd={currentSubscription?.currentPeriodEnd}
        loading={activeSubTrialLoading}
        onConfirm={handleConfirmActiveSubTrial}
      />
    </div>
  );
}

export default function PricingSection(props) {
  return (
    <React.Suspense>
      <PricingSectionContent {...props} />
    </React.Suspense>
  );
}

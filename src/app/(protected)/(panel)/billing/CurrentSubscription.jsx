"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Calendar,
  Zap,
  Bot,
  FileStack,
  ArrowRight,
  ExternalLink,
  // XCircle,
  // Pause,
  Play,
  AlertTriangle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export function CurrentSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // "cancel" | "pause" | "resume" | "payNow" | "reactivate"
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  // const [pauseDialogOpen, setPauseDialogOpen] = useState(false);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const subResponse = await api.get("/billing/subscription/current");
      if (subResponse?.data?.success) {
        setSubscription(subResponse.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const formatDate = (dateString, formatStr = "MMM dd, yyyy") => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), formatStr);
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount || 0);
  };

  const getPlanName = (planStr) => {
    if (!planStr) return "Free Plan";
    return planStr
      .replace(/_(nt|t)$/i, "")
      .replace(/_/g, " ")
      .replace("pri ", "")
      .replace("montly", "monthly")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (status, isTrial = false) => {
    if (isTrial && (status?.toLowerCase() === "active" || status?.toLowerCase() === "trialing")) {
      return (
        <Badge className="border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Trial
        </Badge>
      );
    }

    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            Past Due
          </Badge>
        );
      case "paused":
        return (
          <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Paused
          </Badge>
        );
      case "canceled":
      case "cancelled":
        return (
          <Badge className="border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // ── Action handlers ──

  const handleReactivate = async () => {
    setActionLoading("reactivate");
    try {
      await api.post("/billing/subscription/reactivate");
      toast.success("Subscription reactivated — you will continue to be billed normally.");
      await fetchSubscriptionData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reactivate subscription.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading("cancel");
    try {
      await api.post("/billing/subscription/cancel", { effectiveFrom: "next_billing_period" });
      toast.success("Subscription will cancel at end of billing period.");
      setCancelDialogOpen(false);
      await fetchSubscriptionData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  // const handlePause = async () => {
  //   setActionLoading("pause");
  //   try {
  //     await api.post("/billing/subscription/pause", {
  //       effectiveFrom: "next_billing_period",
  //     });
  //     toast.success("Subscription paused successfully.");
  //     setPauseDialogOpen(false);
  //     await fetchSubscriptionData();
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message || "Failed to pause subscription");
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const handleResume = async () => {
    setActionLoading("resume");
    try {
      await api.post("/billing/subscription/resume", {
        effectiveFrom: "immediately",
      });
      toast.success("Subscription resumed successfully.");
      await fetchSubscriptionData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayNow = async () => {
    setActionLoading("payNow");
    try {
      const res = await api.post("/billing/subscription/pay-now");
      const { transactionId } = res.data.data;
      if (window.Paddle) {
        window.Paddle.Checkout.open({ transactionId });
      } else {
        toast.error("Payment system not loaded. Please refresh and try again.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to initiate payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManagePlan = async () => {
    try {
      const res = await api.get("/billing/portal");
      const url =
        res.data?.data?.managementUrls?.updatePaymentMethod ||
        res.data?.data?.managementUrls;
      if (url && typeof url === "string") {
        window.open(url, "_blank");
      } else {
        toast.error("Management portal not available.");
      }
    } catch {
      toast.error("Failed to load management portal.");
    }
  };

  // ── Trial helpers ──

  const trialDaysLeft =
    subscription?.isTrial && subscription?.trialEndsAt
      ? Math.max(0, differenceInDays(new Date(subscription.trialEndsAt), new Date()))
      : null;

  const getProgressColor = (used, limit) => {
    if (!limit || limit === 0) return "bg-gray-300";
    const pct = (used / limit) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const ProgressBar = ({ used = 0, limit = 0, label }) => {
    const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">
            {used} / {limit}
          </span>
        </div>
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(used, limit)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="relative overflow-hidden border shadow-sm">
        {subscription?.status === "active" && !subscription?.isTrial && (
          <div className="from-primary via-primary/80 to-primary absolute top-0 h-1.5 w-full bg-gradient-to-r" />
        )}
        {subscription?.status === "past_due" && (
          <div className="absolute top-0 h-1.5 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
        )}

        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="text-primary h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription className="mt-1.5">
                Your active subscription and usage limits.
              </CardDescription>
            </div>

            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : subscription ? (
              <div>
                {getStatusBadge(subscription.status, subscription.isTrial)}
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-end gap-4 border-b pb-6">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="mb-2 h-6 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : fetchError ? (
            <div className="py-8 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <AlertTriangle className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium">Could not load subscription</h3>
              <p className="text-muted-foreground mx-auto mt-1 mb-6 max-w-sm text-sm text-balance">
                There was a problem connecting to the server. Please check your connection and try again.
              </p>
              <Button variant="outline" onClick={fetchSubscriptionData}>
                Retry
              </Button>
            </div>
          ) : !subscription ? (
            <div className="py-8 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Zap className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium">You are on the Free Plan</h3>
              <p className="text-muted-foreground mx-auto mt-1 mb-6 max-w-sm text-sm text-balance">
                Upgrade to unlock more chatbots, pages, and higher message limits.
              </p>
              <Button asChild>
                <a href="/pricing">
                  View Plans <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* F4: Payment failure banner */}
              {subscription.status === "past_due" && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Payment failed. Please update your payment method or retry payment.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handlePayNow}
                    disabled={actionLoading === "payNow"}
                  >
                    {actionLoading === "payNow" ? "Loading..." : "Pay Now"}
                  </Button>
                </div>
              )}

              {/* F3: Trial countdown banner */}
              {subscription.isTrial && trialDaysLeft !== null && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      {trialDaysLeft === 0
                        ? "Your trial ends today! Upgrade now to keep your chatbots."
                        : `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""}. Upgrade now to keep your chatbots.`}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <a href="/pricing">Upgrade</a>
                  </Button>
                </div>
              )}

              {/* Price & Name */}
              <div className="border-border/50 flex flex-wrap items-end gap-x-4 gap-y-2 border-b pb-6">
                <div>
                  <h2 className="text-primary text-3xl font-bold tracking-tight">
                    {getPlanName(subscription.planType)}
                    {subscription.isTrial && (
                      <Badge
                        variant="secondary"
                        className="mb-1 ml-3 border-blue-200 bg-blue-50 align-middle text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        Free Trial
                      </Badge>
                    )}
                  </h2>
                </div>
                <div className="text-muted-foreground flex items-baseline pb-1">
                  <span className="text-foreground mr-1 text-xl font-semibold">
                    {formatCurrency(subscription.planPrice, subscription.currency)}
                  </span>
                  <span>
                    / {subscription.billingInterval}{" "}
                    {subscription.isTrial && " after trial"}
                  </span>
                </div>
              </div>

              {/* Limits / Stats */}
              <div className="grid grid-cols-2 gap-6 pt-2 md:grid-cols-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" />{" "}
                    {subscription.isTrial ? "Trial Ends" : "Next Bill Date"}
                  </div>
                  <div className="font-semibold">
                    {subscription.isTrial ? (
                      formatDate(subscription.trialEndsAt)
                    ) : (
                      <>
                        {subscription.cancelAtPeriodEnd ? "Cancels " : ""}
                        {formatDate(subscription.nextBilledAt)}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                    <Bot className="h-4 w-4" /> Chatbots Allowed
                  </div>
                  <div className="text-lg font-semibold">
                    {subscription.isTrial && subscription.trialChatbotsLimit !== undefined
                      ? `${subscription.trialChatbotsUsed || 0} / ${subscription.trialChatbotsLimit}`
                      : subscription.maxChatbotsAllowed}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                    <FileStack className="h-4 w-4" /> Pages Allowed
                  </div>
                  <div className="text-lg font-semibold">
                    {subscription.isTrial && subscription.trialPagesLimit !== undefined
                      ? `${subscription.trialPagesUsed || 0} / ${subscription.trialPagesLimit}`
                      : subscription.maxPagesAllowed}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                    <Zap className="h-4 w-4" /> Msg / Month
                  </div>
                  <div className="text-lg font-semibold">
                    {subscription.isTrial && subscription.trialMessagesLimit !== undefined
                      ? `${(subscription.trialMessagesUsed || 0).toLocaleString()} / ${subscription.trialMessagesLimit.toLocaleString()}`
                      : subscription.maxMessagesSentByAi?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>

              {/* F12: Trial usage progress bars */}
              {subscription.isTrial && (
                <div className="space-y-3 rounded-lg border p-4">
                  <h4 className="text-sm font-semibold">Trial Usage</h4>
                  <ProgressBar
                    used={subscription.trialChatbotsUsed || 0}
                    limit={subscription.trialChatbotsLimit || 0}
                    label="Chatbots"
                  />
                  <ProgressBar
                    used={subscription.trialPagesUsed || 0}
                    limit={subscription.trialPagesLimit || 0}
                    label="Pages"
                  />
                  <ProgressBar
                    used={subscription.trialMessagesUsed || 0}
                    limit={subscription.trialMessagesLimit || 0}
                    label="Messages"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* F1: Action buttons footer */}
        {subscription && (
          <CardFooter className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-sm">
            <span className="text-muted-foreground">
              {subscription.status === "paused"
                ? "Your subscription is paused."
                : subscription.status === "past_due"
                  ? "Payment is overdue."
                  : "Manage your subscription."}
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Resume button for paused subs */}
              {subscription.status === "paused" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleResume}
                  disabled={actionLoading === "resume"}
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  {actionLoading === "resume" ? "Resuming..." : "Resume Subscription"}
                </Button>
              )}

              {/* Pause button for active subs (not trial) — commented out */}
              {/* {(subscription.status === "active" || subscription.status === "trialing") &&
                !subscription.isTrial && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPauseDialogOpen(true)}
                    disabled={!!actionLoading}
                  >
                    <Pause className="mr-1.5 h-3.5 w-3.5" />
                    Pause
                  </Button>
                )} */}

              {/* Cancel button for active/trialing subs */}
              {["active", "trialing"].includes(subscription.status) && !subscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={!!actionLoading}
                >
                  Cancel
                </Button>
              )}

              {/* Reactivate button — shown when cancel is scheduled at period end */}
              {["active", "trialing"].includes(subscription.status) && subscription.cancelAtPeriodEnd && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={handleReactivate}
                  disabled={!!actionLoading}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  {actionLoading === "reactivate" ? "Reactivating..." : "Keep Subscription"}
                </Button>
              )}

              {/* Change Plan button */}
              {["active", "trialing"].includes(subscription.status) && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/pricing?current=true">Change Plan</a>
                </Button>
              )}

              {/* Manage (portal) button */}
              {subscription.paddleSubscriptionId && (
                <Button variant="outline" size="sm" onClick={handleManagePlan}>
                  Manage <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardFooter>
        )}

        {/* If no subscription, show upgrade */}
        {!loading && !subscription && null}
      </Card>

      {/* Cancel dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription will remain active until the end of your current billing period ({formatDate(subscription?.nextBilledAt)}). No refunds are issued for unused days. You will not be charged again after cancellation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={!!actionLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={actionLoading === "cancel"}
            >
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause dialog — commented out */}
      {/* <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription?</DialogTitle>
            <DialogDescription>
              Your subscription will be paused at the end of the current billing period.
              You can resume it anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPauseDialogOpen(false)}
              disabled={!!actionLoading}
            >
              Keep Active
            </Button>
            <Button
              variant="default"
              onClick={handlePause}
              disabled={actionLoading === "pause"}
            >
              {actionLoading === "pause" ? "Pausing..." : "Pause Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </>
  );
}

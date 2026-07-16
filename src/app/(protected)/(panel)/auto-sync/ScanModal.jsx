"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import { hasSubscriptionAccess } from "@/lib/subscription";
import { usePlanUpgradeNotification } from "@/components/PlanUpgradeNotification";

export function ScanModal({ isOpen, onClose, onEnrolled }) {
  const { selectedChatbot } = useChatbot();
  const { subscription } = useAuth();
  const { showNotification, showNoSubscriptionNotification } = usePlanUpgradeNotification();
  const hasAccess = hasSubscriptionAccess(subscription);
  const autoScanOccurrence = subscription?.autoScanDataOccurrence ?? "daily";
  const autoScanSupported = subscription?.autoScanData ?? false;
  const isStarterPlanUser = /^pri_starter_/i.test(subscription?.planType ?? "");

  const [sitemapUrl, setSitemapUrl] = useState("");
  const [frequency, setFrequency] = useState(autoScanOccurrence);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSitemapUrl("");
      setFrequency(autoScanOccurrence);
      return;
    }
  }, [isOpen, autoScanOccurrence]);

  const handleEnroll = async () => {
    if (!hasAccess) {
      showNoSubscriptionNotification();
      return;
    }
    if (isStarterPlanUser || !autoScanSupported) {
      showNotification("autoScanData");
      return;
    }
    if (!sitemapUrl.trim()) {
      toast.error("Enter a sitemap URL");
      return;
    }

    const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
    if (!chatbotId) {
      toast.error("Select a chatbot");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        `/ingestion/auto-scan?chatbotId=${chatbotId}`,
        {
          sitemapUrl: sitemapUrl.trim(),
          frequency,
        }
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Sitemap added successfully");
        onEnrolled?.();
        onClose(false);
      } else {
        toast.error(res.data?.message || "Failed to add sitemap");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add sitemap");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Link2 className="h-5 w-5 text-blue-600" />
            Add Sitemap for Auto-Scan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Sitemap URL input */}
          <div>
            <Label htmlFor="sitemap" className="text-sm font-medium text-slate-700">
              Sitemap URL
            </Label>
            <Input
              id="sitemap"
              type="url"
              placeholder="https://example.com/sitemap.xml"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="mt-2"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Enter the URL of the XML sitemap to discover and monitor for new URLs.
            </p>
          </div>

          <Separator />

          {/* Frequency picker */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Scan Frequency
            </p>
            <RadioGroup
              value={frequency}
              onValueChange={setFrequency}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily-scan" />
                <Label htmlFor="daily-scan" className="cursor-pointer text-sm font-medium text-slate-700">
                  Daily
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleEnroll}
            disabled={submitting || !sitemapUrl.trim()}
          >
            {submitting ? "Adding..." : "Add Sitemap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

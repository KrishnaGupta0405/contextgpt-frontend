"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";

const AdvanceTab = () => {
  const { account } = useAuth();
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  const [formData, setFormData] = useState({
    hideSources: false,
    hideTooltip: false,
    hideFeedbackButtons: false,
    hideBottomNavigation: false,
    hideRefreshButton: false,
    hideExpandButton: false,
    hideHomePage: false,
    stayOnHomePage: false,
    requireTermsAcceptance: false,
    termsText: "",
    hideTermsAfterAcceptance: false,
    disclaimerText: "",
    autoOpenChatDesktop: false,
    autoOpenChatDesktopDelay: 3,
    autoOpenChatMobile: false,
    autoOpenChatMobileDelay: 3,
    smartFollowUpPromptsCount: 3,
  });

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  useEffect(() => {
    if (account?.id && selectedChatbot?.id) {
      fetchSettings();
    }
  }, [account?.id, selectedChatbot?.id]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const behaviorRes = await api.get(`/chatbots/chatbot/${selectedChatbot.id}/behavior`).catch(() => null);

      if (behaviorRes?.data?.success && behaviorRes.data.data) {
        setHasExistingSettings(true);
        const data = behaviorRes.data.data;
        setFormData({
          hideSources: data.hideSources ?? false,
          hideTooltip: data.hideTooltip ?? false,
          hideFeedbackButtons: data.hideFeedbackButtons ?? false,
          hideBottomNavigation: data.hideBottomNavigation ?? false,
          hideRefreshButton: data.hideRefreshButton ?? false,
          hideExpandButton: data.hideExpandButton ?? false,
          hideHomePage: data.hideHomePage ?? false,
          stayOnHomePage: data.stayOnHomePage ?? false,
          requireTermsAcceptance: data.requireTermsAcceptance ?? false,
          termsText: data.termsText || "",
          hideTermsAfterAcceptance: data.hideTermsAfterAcceptance ?? false,
          disclaimerText: data.disclaimerText || "",
          autoOpenChatDesktop: data.autoOpenChatDesktop ?? false,
          autoOpenChatDesktopDelay: data.autoOpenChatDesktopDelay ?? 3,
          autoOpenChatMobile: data.autoOpenChatMobile ?? false,
          autoOpenChatMobileDelay: data.autoOpenChatMobileDelay ?? 3,
          smartFollowUpPromptsCount: data.smartFollowUpPromptsCount ?? 3,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    if (!account?.id || !selectedChatbot?.id) return;

    setIsSaving(true);
    try {
      const behaviorRes = hasExistingSettings
        ? await api.patch(`/chatbots/chatbot/${selectedChatbot.id}/behavior`, formData)
        : await api.post(`/chatbots/chatbot/${selectedChatbot.id}/behavior`, formData);

      if (behaviorRes.data.success) {
        setHasExistingSettings(true);
        markClean();
      }

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(error.response?.data?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex shrink-0 items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Advanced
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-blue-200 bg-white px-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4 fill-blue-600 text-white" />
            Watch Video Tutorial
          </Button>
        </div>

        <GatedAction>
          <Button
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </GatedAction>
      </div>

      {isLoading ? (
        <div className="space-y-12 pb-10">
          {/* Widget Visibility section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Widget Visibility</h2>
              <p className="text-sm text-slate-500">Show or hide specific UI elements inside the chat widget.</p>
            </div>
            <div className="max-w-3xl rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {[
                "Hide Sources",
                "Hide Tooltip",
                "Hide Feedback Buttons",
                "Hide Bottom Navigation",
                "Hide Refresh Button",
                "Hide Expand Button",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between px-5 py-4">
                  <Label className="font-semibold text-slate-700">{label}</Label>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Behavior Rules section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Behavior Rules</h2>
              <p className="text-sm text-slate-500">Configure auto-open delays and content limits.</p>
            </div>
            <div className="max-w-3xl rounded-lg border border-slate-200 p-6">
              <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700">Auto Open (Desktop)</Label>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-slate-600">Desktop Delay (seconds)</Label>
                    <Skeleton className="h-10 w-[150px]" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700">Auto Open (Mobile)</Label>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-slate-600">Mobile Delay (seconds)</Label>
                    <Skeleton className="h-10 w-[150px]" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-6">
                <Label className="font-semibold text-slate-700">Smart Follow-Up Prompts Count</Label>
                <Skeleton className="h-10 w-[200px]" />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Privacy & Legal section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Privacy & Legal</h2>
              <p className="text-sm text-slate-500">Settings related to terms and app home page.</p>
            </div>
            <div className="max-w-3xl rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {[
                "Hide Home Page",
                "Stay on Home Page (No Auto-Redirect)",
                "Require Terms Acceptance",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between px-5 py-4">
                  <Label className="font-semibold text-slate-700">{label}</Label>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12 pb-10">
          {/* Widget Visibility */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Widget Visibility
              </h2>
              <p className="text-sm text-slate-500">
                Show or hide specific UI elements inside the chat widget.
              </p>
            </div>

            <div className="max-w-3xl space-y-0 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Sources</Label>
                  <p className="text-[13px] text-slate-500">
                    Do not show source links along with chatbot responses.
                  </p>
                </div>
                <Switch
                  checked={formData.hideSources}
                  onCheckedChange={(val) => handleInputChange("hideSources", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Tooltip</Label>
                  <p className="text-[13px] text-slate-500">
                    Disable the welcome tooltip bubble on initial load.
                  </p>
                </div>
                <Switch
                  checked={formData.hideTooltip}
                  onCheckedChange={(val) => handleInputChange("hideTooltip", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Feedback Buttons</Label>
                  <p className="text-[13px] text-slate-500">
                    Remove the thumbs up/down buttons on messages.
                  </p>
                </div>
                <Switch
                  checked={formData.hideFeedbackButtons}
                  onCheckedChange={(val) => handleInputChange("hideFeedbackButtons", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Bottom Navigation</Label>
                  <p className="text-[13px] text-slate-500">
                    Turn this on to hide the bottom navigation (Home, Messages, Account tabs) in the chat widget.
                  </p>
                </div>
                <Switch
                  checked={formData.hideBottomNavigation}
                  onCheckedChange={(val) => handleInputChange("hideBottomNavigation", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Refresh Button</Label>
                  <p className="text-[13px] text-slate-500">
                    Turn this on to hide the refresh button in the chat widget header.
                  </p>
                </div>
                <Switch
                  checked={formData.hideRefreshButton}
                  onCheckedChange={(val) => handleInputChange("hideRefreshButton", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Expand Button</Label>
                  <p className="text-[13px] text-slate-500">
                    Turn this on to hide the expand button in the chat widget header.
                  </p>
                </div>
                <Switch
                  checked={formData.hideExpandButton}
                  onCheckedChange={(val) => handleInputChange("hideExpandButton", val)}
                />
              </div>

            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Behavior Rules */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Behavior Rules
              </h2>
              <p className="text-sm text-slate-500">
                Configure auto-open delays and content limits.
              </p>
            </div>

            <div className="max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700">
                      Auto Open (Desktop)
                    </Label>
                    <Switch
                      checked={formData.autoOpenChatDesktop}
                      onCheckedChange={(val) =>
                        handleInputChange("autoOpenChatDesktop", val)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-slate-600">
                      Desktop Delay (seconds)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.autoOpenChatDesktopDelay}
                      onChange={(e) =>
                        handleInputChange(
                          "autoOpenChatDesktopDelay",
                          Number(e.target.value),
                        )
                      }
                      className="max-w-[150px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-slate-700">
                      Auto Open (Mobile)
                    </Label>
                    <Switch
                      checked={formData.autoOpenChatMobile}
                      onCheckedChange={(val) =>
                        handleInputChange("autoOpenChatMobile", val)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-slate-600">
                      Mobile Delay (seconds)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.autoOpenChatMobileDelay}
                      onChange={(e) =>
                        handleInputChange(
                          "autoOpenChatMobileDelay",
                          Number(e.target.value),
                        )
                      }
                      className="max-w-[150px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">
                    Smart Follow-Up Prompts Count
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={formData.smartFollowUpPromptsCount}
                    onChange={(e) =>
                      handleInputChange(
                        "smartFollowUpPromptsCount",
                        Number(e.target.value),
                      )
                    }
                    className="max-w-[200px]"
                  />
                  <p className="text-[13px] text-slate-500">
                    Number of dynamic suggestions to show to the user at the end
                    of a response.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Privacy & Legal */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Privacy & Legal
              </h2>
              <p className="text-sm text-slate-500">
                Settings related to terms and app home page.
              </p>
            </div>

            <div className="max-w-3xl space-y-0 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Hide Home Page</Label>
                  <p className="text-[13px] text-slate-500">
                    Turn this on to hide the home page. The back button will be replaced with a button to start a new conversation.
                  </p>
                </div>
                <Switch
                  checked={formData.hideHomePage}
                  onCheckedChange={(val) => handleInputChange("hideHomePage", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Stay on Home Page (No Auto-Redirect)</Label>
                  <p className="text-[13px] text-slate-500">
                    When enabled, users will stay on the home page when there&apos;s no existing conversation, instead of automatically creating a new conversation and redirecting.
                  </p>
                </div>
                <Switch
                  checked={formData.stayOnHomePage}
                  onCheckedChange={(val) => handleInputChange("stayOnHomePage", val)}
                />
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <div className="space-y-0.5">
                  <Label className="font-semibold text-slate-700">Require Terms Acceptance</Label>
                  <p className="text-[13px] text-slate-500">
                    When enabled, users must check a checkbox agreeing to your terms before they can start a conversation.
                  </p>
                </div> 
                <Switch
                  checked={formData.requireTermsAcceptance}
                  onCheckedChange={(val) => handleInputChange("requireTermsAcceptance", val)}
                />
              </div>

              {formData.requireTermsAcceptance && (
                <>
                  <div className="space-y-1.5 px-5 py-4">
                    <Label className="font-semibold text-slate-700">
                      Terms Text (Markdown)
                    </Label>
                    <Textarea
                      value={formData.termsText}
                      onChange={(e) => handleInputChange("termsText", e.target.value)}
                      placeholder="By continuing, you agree to our [Terms of Service](https://example.com/terms) and [Privacy Policy](https://example.com/privacy)."
                      className="min-h-[80px] w-full resize-y"
                    />
                    <p className="text-[13px] text-slate-500">
                      Supports markdown. Use [link text](url) to add clickable links.
                    </p>
                  </div>

                  <div className="flex items-center justify-between px-5 py-3">
                    <div className="space-y-0.5">
                      <Label className="font-semibold text-slate-700">Hide Terms After Acceptance</Label>
                      <p className="text-[13px] text-slate-500">
                        When enabled, the terms checkbox will be hidden after the user accepts it during the session.
                      </p>
                    </div>
                    <Switch
                      checked={formData.hideTermsAfterAcceptance}
                      onCheckedChange={(val) => handleInputChange("hideTermsAfterAcceptance", val)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 px-5 py-4">
                <Label className="font-semibold text-slate-700">
                  Disclaimer / Terms Text
                </Label>
                <Textarea
                  value={formData.disclaimerText}
                  onChange={(e) =>
                    handleInputChange("disclaimerText", e.target.value)
                  }
                  placeholder="By continuing, you agree to our Terms..."
                  className="min-h-[80px] w-full resize-y"
                />
                <p className="text-[13px] text-slate-500">
                  Optional text shown below the message input. Always visible, no checkbox required. Supports markdown.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdvanceTab;

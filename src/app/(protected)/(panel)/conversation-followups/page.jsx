"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useProductTour } from "@/hooks/use-product-tour";
import { PlayCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";

// SVG for the Star Icon in Escalate Pills
const StarIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

const ConversationFollowups = () => {
  const { account } = useAuth();
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const { resumeTour } = useProductTour();

  // TOUR_LEGS[7] — resumeTour(7) runs it when the Conversation Starters leg
  // handed off here, and no-ops otherwise. Same delay as the other legs,
  // giving the followups list and form a frame to paint before the overlay
  // lands.
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(7), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  const [followups, setFollowups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [actionType, setActionType] = useState("message"); // 'message', 'link', or 'escalate'
  const [buttonLabel, setButtonLabel] = useState("");
  const [messageText, setMessageText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (account?.id && selectedChatbot?.id) {
      fetchFollowups();
    }
  }, [account?.id, selectedChatbot?.id]);

  useEffect(() => {
    return () => markClean();
  }, []);

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts`,
      );
      if (response.data.success && response.data.data) {
        setFollowups(response.data.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversation followups:", error);
      toast.error("Failed to load conversation followups.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setActionType("message");
    setButtonLabel("");
    setMessageText("");
    setLinkUrl("");
    markClean();
  };

  const handleEdit = (followup) => {
    setEditingId(followup.id);
    if (followup.esclate) {
      setActionType("escalate");
      setButtonLabel(followup.buttonTitle || "");
      setMessageText(followup.buttonMessage || "");
    } else if (followup.buttonTitle || followup.buttonMessage) {
      setActionType("message");
      setButtonLabel(followup.buttonTitle || "");
      setMessageText(followup.buttonMessage || "");
    } else if (followup.linkText || followup.linkSrc) {
      setActionType("link");
      setButtonLabel(followup.linkText || "");
      setLinkUrl(followup.linkSrc || "");
    } else {
      setActionType("message");
      setButtonLabel("");
      setMessageText("");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this conversation followup?"))
      return;

    try {
      const response = await api.delete(
        `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts?followUpPromptId=${id}`,
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Successfully deleted conversation followup",
        );
        setFollowups(followups.filter((f) => f.id !== id));
        if (editingId === id) resetForm();
      } else {
        toast.error("Failed to delete conversation followup");
      }
    } catch (error) {
      console.error("Failed to delete followup:", error);
      toast.error("An error occurred while deleting.");
    }
  };

  const handleSave = async () => {
    if (!account?.id || !selectedChatbot?.id) return;
    if (!buttonLabel.trim()) {
      toast.error("Button Label is required.");
      return;
    }

    if (
      (actionType === "message" || actionType === "escalate") &&
      !messageText.trim()
    ) {
      toast.error("Message Text is required for this action.");
      return;
    }
    if (actionType === "link" && !linkUrl.trim()) {
      toast.error("Link URL is required for Open Link action.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {};

      if (actionType === "message") {
        payload.buttonTitle = buttonLabel;
        payload.buttonMessage = messageText;
        payload.esclate = false;
      } else if (actionType === "escalate") {
        payload.buttonTitle = buttonLabel;
        payload.buttonMessage = messageText;
        payload.esclate = true;
      } else if (actionType === "link") {
        payload.linkText = buttonLabel;
        payload.linkSrc = linkUrl;
        payload.esclate = false; // Links cannot be escalated
      }

      let response;
      if (editingId) {
        // Update
        response = await api.patch(
          `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts/${editingId}`,
          payload,
        );
      } else {
        // Create
        response = await api.post(
          `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Conversation followup ${editingId ? "updated" : "created"} successfully`,
        );
        fetchFollowups(); // Refresh list to get new IDs/timestamps/states
        resetForm();
      } else {
        toast.error(
          response.data.message || "Failed to save conversation followup",
        );
      }
    } catch (error) {
      console.error("Failed to save followup:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newFollowups = [...followups];
    [newFollowups[index - 1], newFollowups[index]] = [newFollowups[index], newFollowups[index - 1]];
    setFollowups(newFollowups);
    try {
      await api.patch(
        `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts/reorder`,
        { orderedIds: newFollowups.map((f) => f.id) },
      );
      toast.success("Order updated successfully.");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Failed to reorder follow-up prompts.");
      fetchFollowups();
    }
  };

  const handleMoveDown = async (index) => {
    if (index === followups.length - 1) return;
    const newFollowups = [...followups];
    [newFollowups[index], newFollowups[index + 1]] = [newFollowups[index + 1], newFollowups[index]];
    setFollowups(newFollowups);
    try {
      await api.patch(
        `/chatbots/chatbot/${selectedChatbot.id}/follow-up-prompts/reorder`,
        { orderedIds: newFollowups.map((f) => f.id) },
      );
      toast.success("Order updated successfully.");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Failed to reorder follow-up prompts.");
      fetchFollowups();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Conversation Followups" },
        ]}
      />
      <div className="bg-background flex flex-1 flex-col space-y-6 overflow-hidden p-8">
        <div className="flex shrink-0 items-center gap-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Conversation Followups
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

        <div className="flex min-h-0 flex-1 gap-8">
          {/* Left Column: List of Followups */}
          <div
            data-tour="followups-list"
            className="flex w-1/2 flex-col gap-4 overflow-y-auto pr-2 pb-10"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-3" />
                      </div>
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                  <div className="pl-8">
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))
            ) : followups.length === 0 ? (
              <div className="text-muted-foreground p-4 text-sm">
                No conversation followups found.
              </div>
            ) : (
              followups.map((followup, index) => (
                <div
                  key={followup.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-0 text-slate-300">
                        <ChevronUp
                          className={cn(
                            "h-4 w-4",
                            index === 0
                              ? "cursor-not-allowed text-slate-200"
                              : "cursor-pointer hover:text-slate-500",
                          )}
                          onClick={() => handleMoveUp(index)}
                        />
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 translate-y-[-4px] transform",
                            index === followups.length - 1
                              ? "cursor-not-allowed text-slate-200"
                              : "cursor-pointer hover:text-slate-500",
                          )}
                          onClick={() => handleMoveDown(index)}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                            followup.esclate
                              ? "border-blue-200 bg-blue-50 text-blue-600"
                              : followup.linkText || followup.linkSrc
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-blue-200 bg-blue-50 text-blue-600",
                          )}
                        >
                          {followup.buttonTitle || followup.linkText}
                        </span>

                        {followup.esclate && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                            <StarIcon className="h-3 w-3 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm font-semibold">
                      <button
                        onClick={() => handleEdit(followup)}
                        className="text-slate-600 transition-colors hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(followup.id)}
                        className="text-red-500 transition-colors hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="pl-8 text-[15px] font-medium text-slate-600">
                    {followup.buttonMessage || followup.linkSrc}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Form */}
          <div className="flex w-1/2 max-w-[500px] flex-col">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              {editingId ? "Edit Button" : "Add Button"}
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Button Action <span className="text-red-500">*</span>
                </Label>
                <Tabs
                  value={actionType}
                  onValueChange={(v) => { setActionType(v); markDirty(); }}
                  className="w-full"
                >
                  <TabsList
                    data-tour="followups-action-type"
                    className="grid w-full grid-cols-3 bg-slate-100 p-1"
                  >
                    <TabsTrigger
                      value="message"
                      className="rounded-md text-[13px] font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                    >
                      Send Message
                    </TabsTrigger>
                    <TabsTrigger
                      value="link"
                      className="rounded-md text-[13px] font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                    >
                      Open Link
                    </TabsTrigger>
                    <TabsTrigger
                      value="escalate"
                      data-tour="followups-tab-escalate"
                      className="relative rounded-md text-[13px] font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                    >
                      Escalate
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Button Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder={
                    actionType === "escalate"
                      ? "Escalate to human support"
                      : "e.g. Pricing, Contact us..."
                  }
                  className="h-10 rounded-lg border-slate-200"
                  value={buttonLabel}
                  onChange={(e) => { setButtonLabel(e.target.value); markDirty(); }}
                />
              </div>

              <div className="space-y-2">
                {actionType === "message" || actionType === "escalate" ? (
                  <>
                    <Label className="text-sm font-semibold text-slate-700">
                      {actionType === "escalate"
                        ? "Escalation Confirmation Message"
                        : "Message Text"}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      placeholder={
                        actionType === "escalate"
                          ? "We have escalated the conversation to human support. Please share any additional details you want to include in the support request."
                          : "e.g. What is the pricing of contextGPT?"
                      }
                      className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={messageText}
                      onChange={(e) => { setMessageText(e.target.value); markDirty(); }}
                    />
                  </>
                ) : (
                  <>
                    <Label className="text-sm font-semibold text-slate-700">
                      Link URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="https://example.com/contact"
                      className="h-10 rounded-lg border-slate-200"
                      value={linkUrl}
                      onChange={(e) => { setLinkUrl(e.target.value); markDirty(); }}
                    />
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <GatedAction>
                  <Button
                    className="h-10 rounded-lg bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? "Saving..."
                      : editingId
                        ? "Update Button"
                        : "Add Button"}
                  </Button>
                </GatedAction>
                {editingId && (
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg font-semibold"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationFollowups;

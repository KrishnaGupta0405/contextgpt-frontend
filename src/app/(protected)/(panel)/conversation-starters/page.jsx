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
import {
  PlayCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

const ConversationStarters = () => {
  const { account } = useAuth();
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();

  const [starters, setStarters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [actionType, setActionType] = useState("message"); // 'message' or 'link'
  const [buttonLabel, setButtonLabel] = useState("");
  const [messageText, setMessageText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (account?.id && selectedChatbot?.id) {
      fetchStarters();
    }
  }, [account?.id, selectedChatbot?.id]);

  // Clean up dirty state when leaving the page
  useEffect(() => {
    return () => markClean();
  }, []);

  const fetchStarters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters`,
      );
      if (response.data.success && response.data.data) {
        setStarters(response.data.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversation starters:", error);
      toast.error("Failed to load conversation starters.");
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

  const handleEdit = (starter) => {
    setEditingId(starter.id);
    if (starter.buttonTitle || starter.buttonMessage) {
      setActionType("message");
      setButtonLabel(starter.buttonTitle || "");
      setMessageText(starter.buttonMessage || "");
    } else if (starter.linkText || starter.linkSrc) {
      setActionType("link");
      setButtonLabel(starter.linkText || "");
      setLinkUrl(starter.linkSrc || "");
    } else {
      setActionType("message");
      setButtonLabel("");
      setMessageText("");
    }
    markClean(); // loading an item to edit is not a "dirty" change
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this conversation starter?"))
      return;

    try {
      const response = await api.delete(
        `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters?convoStartId=${id}`,
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Successfully deleted conversation starter",
        );
        setStarters(starters.filter((s) => s.id !== id));
        if (editingId === id) resetForm();
      } else {
        toast.error("Failed to delete conversation starter");
      }
    } catch (error) {
      console.error("Failed to delete starter:", error);
      toast.error("An error occurred while deleting.");
    }
  };

  const handleSave = async () => {
    if (!account?.id || !selectedChatbot?.id) return;
    if (!buttonLabel.trim()) {
      toast.error("Button Label is required.");
      return;
    }

    if (actionType === "message" && !messageText.trim()) {
      toast.error("Message Text is required for Send Message action.");
      return;
    }
    if (actionType === "link" && !linkUrl.trim()) {
      toast.error("Link URL is required for Open Link action.");
      return;
    }

    setIsSaving(true);
    try {
      const payload =
        actionType === "message"
          ? { buttonTitle: buttonLabel, buttonMessage: messageText }
          : { linkText: buttonLabel, linkSrc: linkUrl };

      let response;
      if (editingId) {
        payload.id = editingId;
        response = await api.patch(
          `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters`,
          payload,
        );
      } else {
        response = await api.post(
          `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Conversation starter ${editingId ? "updated" : "created"} successfully`,
        );
        fetchStarters();
        resetForm();
      } else {
        toast.error(
          response.data.message || "Failed to save conversation starter",
        );
      }
    } catch (error) {
      console.error("Failed to save starter:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newStarters = [...starters];
    [newStarters[index - 1], newStarters[index]] = [
      newStarters[index],
      newStarters[index - 1],
    ];
    setStarters(newStarters);
    try {
      await api.patch(
        `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters/reorder`,
        { orderedIds: newStarters.map((s) => s.id) },
      );
      toast.success("Order updated successfully.");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Failed to reorder conversation starters.");
      fetchStarters();
    }
  };

  const handleMoveDown = async (index) => {
    if (index === starters.length - 1) return;
    const newStarters = [...starters];
    [newStarters[index], newStarters[index + 1]] = [
      newStarters[index + 1],
      newStarters[index],
    ];
    setStarters(newStarters);
    try {
      await api.patch(
        `/chatbots/chatbot/${selectedChatbot.id}/conversation-starters/reorder`,
        { orderedIds: newStarters.map((s) => s.id) },
      );
      toast.success("Order updated successfully.");
    } catch (error) {
      console.error("Failed to reorder:", error);
      toast.error("Failed to reorder conversation starters.");
      fetchStarters();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Conversation Starters" },
        ]}
      />
      <div className="flex flex-1 flex-col space-y-6 overflow-hidden p-8">
        <div className="flex shrink-0 items-center gap-4 border-b pb-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Conversation Starters
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-blue-200 px-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4 fill-blue-600 text-white" />
            Watch Video Tutorial
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 gap-8">
          {/* Left Column: List of Starters */}
          <div className="flex w-1/2 flex-col gap-4 overflow-y-auto pr-2 pb-10">
            {isLoading && starters.length === 0 ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Chevron arrows area */}
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                        {/* Badge/label */}
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                    {/* Message text */}
                    <div className="pl-8">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </>
            ) : starters.length === 0 ? (
              <div className="text-muted-foreground p-4 text-sm">
                No conversation starters found.
              </div>
            ) : (
              starters.map((starter, index) => (
                <div
                  key={starter.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-0 text-slate-400">
                        <ChevronUp
                          className={cn(
                            "h-4 w-4",
                            index === 0
                              ? "cursor-not-allowed text-slate-200"
                              : "cursor-pointer hover:text-slate-600",
                          )}
                          onClick={() => handleMoveUp(index)}
                        />
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 translate-y-[-4px] transform",
                            index === starters.length - 1
                              ? "cursor-not-allowed text-slate-200"
                              : "cursor-pointer hover:text-slate-600",
                          )}
                          onClick={() => handleMoveDown(index)}
                        />
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          starter.linkText || starter.linkSrc
                            ? "border-yellow-100 bg-yellow-50 text-yellow-700"
                            : "border-blue-100 bg-blue-50 text-blue-600",
                        )}
                      >
                        {starter.buttonTitle || starter.linkText}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <button
                        onClick={() => handleEdit(starter)}
                        className="text-slate-500 transition-colors hover:text-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(starter.id)}
                        className="text-red-500 transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="pl-8 text-[15px] text-slate-700">
                    {starter.buttonMessage || starter.linkSrc}
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
                  onValueChange={(val) => {
                    setActionType(val);
                    markDirty();
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
                    <TabsTrigger
                      value="message"
                      className="rounded-md text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Send Message
                    </TabsTrigger>
                    <TabsTrigger
                      value="link"
                      className="rounded-md text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Open Link
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Button Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Pricing, Contact us..."
                  className="h-10 rounded-lg border-slate-200"
                  value={buttonLabel}
                  onChange={(e) => {
                    setButtonLabel(e.target.value);
                    markDirty();
                  }}
                />
              </div>

              <div className="space-y-2">
                {actionType === "message" ? (
                  <>
                    <Label className="text-sm font-semibold text-slate-700">
                      Message Text <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      placeholder="e.g. What is the pricing of contextGPT?"
                      className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        markDirty();
                      }}
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
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        markDirty();
                      }}
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

export default ConversationStarters;

"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Info,
  Tag,
  Star,
  CheckCircle,
  Archive,
  Download,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  MailOpen,
  Loader2,
  UserRoundCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
import { PlatformBadge } from "@/components/ui/PlatformBadge";

/**
 * ChatHeader
 *
 * Props:
 *  - threadId        {string}
 *  - chatbotId       {string}
 *  - threadDetails   {object}  – read-only snapshot from parent
 *  - onThreadDetailsChange {(updater) => void} – lets this component push updates up
 *  - messages        {array}   – needed for CSV download
 *  - onOpenDetail    {() => void} – opens the ThreadDetailSheet in the parent
 */
const ChatHeader = ({
  threadId,
  chatbotId,
  threadDetails,
  onThreadDetailsChange,
  messages,
  onMessagesChange,
  onOpenDetail,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ─── API: update arbitrary field (important / resolved) ──────────────────
  const updateThreadStatus = async (field, value) => {
    if (!chatbotId || !threadId) return;

    // Optimistic update
    onThreadDetailsChange((prev) => ({ ...prev, [field]: value }));

    try {
      const payload = [{ threadId, [field]: value }];
      const response = await api.patch(
        `/chatting/${chatbotId}/thread/update-thread`,
        payload,
      );

      if (response.data?.success) {
        const toastMsg =
          field === "important"
            ? value
              ? "Marked as important"
              : "Marked as not important"
            : field === "resolved"
              ? value
                ? "Marked as resolved"
                : "Marked as unresolved"
              : field === "archived"
                ? value
                  ? "Thread archived"
                  : "Thread unarchived"
                : "Thread updated";
        toast.success(toastMsg);

        const updatedThreads = response.data.data.updatedThreads;
        if (updatedThreads?.length > 0 && updatedThreads[0].length > 0) {
          onThreadDetailsChange((prev) => ({
            ...prev,
            ...updatedThreads[0][0],
          }));
        }
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast.error("Failed to update thread status");
      // Revert
      onThreadDetailsChange((prev) => ({ ...prev, [field]: !value }));
    }
  };

  // ─── API: toggle escalated ────────────────────────────────────────────────
  const handleEscalateToggle = async () => {
    if (!chatbotId || !threadId) return;

    try {
      const response = await api.patch(
        `/chatting/${chatbotId}/thread/${threadId}/escalate`,
      );

      if (response.data?.success) {
        const { thread, systemMessage } = response.data.data;

        // Update thread details with the returned thread object
        onThreadDetailsChange((prev) => ({ ...prev, ...thread }));

        // Append the system message into the chat scroll area (with dedup —
        // the WS broadcast may arrive before or after this HTTP response)
        if (systemMessage && onMessagesChange) {
          onMessagesChange((prev) => {
            if (prev.some((m) => m.id === systemMessage.id)) return prev;
            return [...prev, systemMessage];
          });
        }

        toast.success(
          thread.escalated ? "Escalated to human agent" : "Returned to AI",
        );
      }
    } catch (error) {
      console.error("Failed to toggle escalation:", error);
      toast.error("Failed to update escalation status");
    }
  };

  // ─── API: save title ──────────────────────────────────────────────────────
  const handleTitleSave = async () => {
    if (!chatbotId || !threadId || !editedTitle.trim()) return;

    try {
      const payload = [{ threadId, title: editedTitle.trim() }];
      const response = await api.patch(
        `/chatting/${chatbotId}/thread/update-thread`,
        payload,
      );

      if (response.data?.success) {
        const newTitle = editedTitle.trim();
        toast.success("Thread title updated successfully");

        onThreadDetailsChange((prev) => {
          const updated = { ...prev, title: newTitle };
          sessionStorage.setItem(
            `thread_meta_${threadId}`,
            JSON.stringify(updated),
          );
          return updated;
        });
        setIsEditingTitle(false);

        // Sync thread list cache
        const listCacheKey = `chat_threads_${chatbotId}`;
        const cachedList = sessionStorage.getItem(listCacheKey);
        if (cachedList) {
          const threads = JSON.parse(cachedList);
          const updatedThreads = threads.map((t) =>
            t.id === threadId ? { ...t, title: newTitle } : t,
          );
          sessionStorage.setItem(listCacheKey, JSON.stringify(updatedThreads));
        }

        window.dispatchEvent(
          new CustomEvent("thread-updated", {
            detail: { threadId, title: newTitle },
          }),
        );
      }
    } catch (error) {
      console.error("Failed to update thread title:", error);
      toast.error("Failed to update thread title");
    }
  };

  // ─── Download CSV ─────────────────────────────────────────────────────────
  const handleDownloadChat = async () => {
    setDownloading(true);
    try {
      const csvContent =
        "ThreadID,Role,Content,Time\n" +
        messages
          .map(
            (msg) =>
              `${threadId},${msg.role},"${msg.content.replace(/"/g, '""')}","${new Date(msg.createdAt).toLocaleString()}"`,
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute(
        "download",
        `chat_export_${threadId}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download chat");
    } finally {
      setDownloading(false);
    }
  };

  // ─── Copy link ────────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card/50 flex items-center justify-between border-b px-4 py-2">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={threadDetails?.userIconSrc} />
          <AvatarFallback className="bg-muted text-xs">
            {threadDetails?.visitorName
              ? threadDetails.visitorName.slice(0, 2).toUpperCase()
              : "VI"}
          </AvatarFallback>
        </Avatar>

        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-7 w-[200px] text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                  if (e.key === "Escape") {
                    setIsEditingTitle(false);
                    setEditedTitle(
                      threadDetails?.title ||
                        threadDetails?.visitorName ||
                        "Visitor",
                    );
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700"
                onClick={handleTitleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-600 hover:text-red-700"
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle(
                    threadDetails?.title ||
                      threadDetails?.visitorName ||
                      "Visitor",
                  );
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="group flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                {threadDetails?.title ||
                  threadDetails?.visitorName ||
                  "Visitor"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => {
                  setEditedTitle(
                    threadDetails?.title ||
                      threadDetails?.visitorName ||
                      "Visitor",
                  );
                  setIsEditingTitle(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
            {threadDetails?.visitorEmail && (
              <span>{threadDetails.visitorEmail}</span>
            )}
            {threadDetails?.platformSource &&
              threadDetails.platformSource !== "WIDGET" && (
                <PlatformBadge platform={threadDetails.platformSource} />
              )}
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1">
        {/* Tags */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              onClick={onOpenDetail}
            >
              <Tag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modify Tags</p>
          </TooltipContent>
        </Tooltip>

        {/* Important */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-colors",
                threadDetails?.important
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() =>
                updateThreadStatus("important", !threadDetails?.important)
              }
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  threadDetails?.important ? "fill-current" : "",
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {threadDetails?.important
                ? "Mark as Unimportant"
                : "Mark as Important"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Resolved */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-colors",
                threadDetails?.resolved
                  ? "text-emerald-500 hover:text-emerald-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() =>
                updateThreadStatus("resolved", !threadDetails?.resolved)
              }
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {threadDetails?.resolved
                ? "Mark as Unresolved"
                : "Mark as Resolved"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Archived */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 transition-colors",
                threadDetails?.archived
                  ? "text-slate-500 hover:text-slate-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() =>
                updateThreadStatus("archived", !threadDetails?.archived)
              }
            >
              <Archive
                className={cn(
                  "h-4 w-4",
                  threadDetails?.archived ? "fill-current" : "",
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{threadDetails?.archived ? "Unarchive" : "Archive"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Download */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              onClick={handleDownloadChat}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Chat</p>
          </TooltipContent>
        </Tooltip>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="data-[state=open]:bg-muted text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>
              <MailOpen className="mr-2 h-4 w-4" />
              Mark as unread
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open as User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Detail */}
        <Button
          variant="outline"
          size="sm"
          data-tour="chat-history-view-detail"
          className="ml-2 h-8 gap-2 px-3 text-xs"
          onClick={onOpenDetail}
        >
          <Info className="h-3.5 w-3.5" />
          View Detail
        </Button>

        {/* Escalate toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              data-tour="chat-history-escalate-toggle"
              className={cn(
                "ml-1 h-8 gap-2 px-3 text-xs transition-colors",
                threadDetails?.escalated
                  ? "border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                  : "border-emerald-400 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700",
              )}
              onClick={handleEscalateToggle}
            >
              <UserRoundCog className="h-3.5 w-3.5" />
              {threadDetails?.escalated
                ? "Escalate to AI"
                : "Escalate to Agent"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {threadDetails?.escalated
                ? "Hand back to AI — disables agent messaging"
                : "Escalate to human agent — enables agent messaging"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatHeader;

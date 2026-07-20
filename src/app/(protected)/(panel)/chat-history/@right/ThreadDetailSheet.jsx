"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  X,
  PlusCircle,
  Edit2,
  Smile,
  Frown,
  ExternalLink,
  Calendar,
  MessageSquare,
  Hash,
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Archive,
  Reply,
  Copy,
} from "lucide-react";
import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlatformBadge } from "@/components/ui/PlatformBadge";

const ThreadDetailSheet = ({
  open,
  onOpenChange,
  threadDetails,
  loading,
  onUpdate,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [noteText, setNoteText] = useState(threadDetails?.internalNotes || "");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    if (threadDetails?.internalNotes !== undefined) {
      setNoteText(threadDetails.internalNotes || "");
    }
  }, [threadDetails?.internalNotes]);

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }
    if (newTag.length > 50) {
      toast.error("Tag is too long (max 50 characters)");
      return;
    }
    if (threadDetails.tags?.includes(newTag.trim())) {
      toast.error("Tag already exists");
      return;
    }
    setTagLoading(true);
    try {
      const currentTags = threadDetails.tags || [];
      const updatedTags = [...currentTags, newTag.trim()];
      const response = await api.patch(
        `/chatting/${threadDetails.chatbotId}/thread/update-thread`,
        [{ threadId: threadDetails.id, tags: updatedTags }],
      );
      if (response.data?.success) {
        toast.success("Tag added");
        setNewTag("");
        setIsAddingTag(false);
        if (onUpdate) onUpdate({ tags: updatedTags });
      }
    } catch (error) {
      console.error("Failed to add tag:", error);
      toast.error("Failed to add tag");
    } finally {
      setTagLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = (threadDetails.tags || []).filter(
      (t) => t !== tagToRemove,
    );
    try {
      const response = await api.patch(
        `/chatting/${threadDetails.chatbotId}/thread/update-thread`,
        [{ threadId: threadDetails.id, tags: updatedTags }],
      );
      if (response.data?.success) {
        toast.success("Tag removed");
        if (onUpdate) onUpdate({ tags: updatedTags });
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
      toast.error("Failed to remove tag");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setIsSubmittingNote(true);
    try {
      const response = await api.patch(
        `/chatting/${threadDetails.chatbotId}/thread/update-thread`,
        [{ threadId: threadDetails.id, internalNotes: noteText.trim() }],
      );
      if (response.data?.success) {
        toast.success("Note saved");
        if (onUpdate) onUpdate({ internalNotes: noteText.trim() });
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const formatDate = (dateString, type = "datetime") => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (type === "date") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (type === "time") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleString();
  };

  const getInitials = (name) => {
    if (!name) return "UNK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  //   handleCopy
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  // Calculate sentiment percentages
  const totalSentiment =
    (threadDetails?.positiveCount || 0) + (threadDetails?.negativeCount || 0);
  const positivePercent =
    totalSentiment > 0
      ? Math.round((threadDetails?.positiveCount / totalSentiment) * 100)
      : 0;
  const negativePercent = totalSentiment > 0 ? 100 - positivePercent : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-base font-semibold">
            Conversation Details
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 space-y-6 px-6 pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : threadDetails ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center py-8">
                <div className="relative mb-3">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarImage src={threadDetails.userIconSrc} />
                    <AvatarFallback className="bg-orange-100/50 text-2xl font-bold text-orange-600">
                      {getInitials(threadDetails.visitorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute right-1 bottom-1 h-5 w-5 rounded-full border-4 border-white bg-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {threadDetails.visitorName || "Anonymous Visitor"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {threadDetails.visitorEmail || "No email provided"}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50/80 p-4">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Started On
                  </p>
                  <p className="font-bold text-slate-700">
                    {formatDate(threadDetails.startedAt, "date")}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {formatDate(threadDetails.startedAt, "time")}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-4">
                  <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Total Messages
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {/* {threadDetails.unreadMessagesCount + 10}{" "} */}
                    Coming soon... {/* Mocked total count */}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <section className="mb-8 space-y-4">
                <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {threadDetails.tags?.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <span className="text-[11px] tracking-wide uppercase">
                        {tag}
                      </span>
                      <X
                        className="h-3 w-3 cursor-pointer opacity-50 transition-colors hover:text-blue-800 hover:opacity-100"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                  {isAddingTag ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tag..."
                        className="h-8 w-24 text-xs"
                        maxLength={50}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTag();
                          if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setNewTag("");
                          }
                        }}
                        disabled={tagLoading}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={handleAddTag}
                        disabled={tagLoading}
                      >
                        {tagLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-8 border-dashed text-xs font-medium"
                      onClick={() => setIsAddingTag(true)}
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                      Add tags
                    </Button>
                  )}
                </div>
              </section>

              {/* Thread Insights */}
              <section className="mb-8 space-y-5">
                <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Thread Insights
                </h4>
                <div className="space-y-4">
                  <DetailRow
                    label="Thread Title"
                    value={
                      <span className="text-sm font-bold text-gray-800 italic">
                        No title set
                      </span>
                    }
                  />

                  {/* Sentiment Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-500">
                        Positive ({positivePercent}%)
                      </span>
                      <span className="text-rose-500">
                        Negative ({negativePercent}%)
                      </span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${positivePercent}%` }}
                      />
                      <div
                        className="h-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${negativePercent}%` }}
                      />
                    </div>
                  </div>
                  <DetailRow
                    label="Started On"
                    value={
                      <span className="text-sm font-bold text-gray-800">
                        {formatDate(threadDetails.startedAt)}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Escalated"
                    value={
                      threadDetails.escalated ? (
                        <Badge className="rounded border-0 bg-amber-400 px-2 text-[10px] font-bold text-white uppercase hover:bg-amber-500">
                          YES
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium text-gray-400">
                          -
                        </span>
                      )
                    }
                  />

                  {threadDetails.platformSource && (
                    <DetailRow
                      label="Platform Source"
                      value={
                        <PlatformBadge platform={threadDetails.platformSource} />
                      }
                    />
                  )}
                </div>
              </section>

              {/* Contact Details */}
              <section className="mb-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Contact Details
                  </h4>
                  <a
                    href="#"
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    View CRM
                  </a>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm font-medium">
                      Full Name
                    </span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gray-100 text-[10px] text-gray-600">
                          {getInitials(threadDetails.visitorName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-gray-900">
                        {threadDetails.visitorName || "Anonymous"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm font-medium">
                      Email Address
                    </span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm font-medium">
                        {threadDetails.visitorEmail || "-"}
                      </span>
                      <Mail className="text-muted-foreground h-4 w-4" />
                    </div>
                  </div>

                  <DetailRow
                    label="Phone"
                    value={
                      <span className="text-sm font-medium text-gray-400">
                        {threadDetails.visitorPhoneNumber || "---"}
                      </span>
                    }
                  />

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Source URL
                    </span>
                    <div className="flex items-center gap-2 rounded-lg border bg-slate-50 p-3 text-xs text-slate-600 transition-colors hover:bg-slate-100">
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <a
                        href={threadDetails.webhookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-blue-600 hover:underline"
                      >
                        {threadDetails.webhookUrl || "No source URL"}
                      </a>
                      {/* add the copy button for the source url */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
                        onClick={() => handleCopy(threadDetails.webhookUrl)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">
                      Thread ID
                    </span> 
                    <div data-tour="chat-history-thread-id" className="flex items-center gap-2 rounded-lg border bg-slate-50 p-3 text-xs text-slate-600 transition-colors hover:bg-slate-100">
                      <span className="font-mono text-xs font-medium text-gray-500">
                        {threadDetails.id}
                      </span>
                      {/* add the copy button for the above thread id */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700"
                        onClick={() => handleCopy(threadDetails.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Internal Note */}
              <section className="mb-4 space-y-4">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="h-4 w-4 text-slate-400" />
                  <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Internal Note
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  <Textarea
                    placeholder="Add a private note about this conversation..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[90px] resize-none bg-slate-50/50 text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-blue-600 px-5 font-medium text-white hover:bg-blue-700"
                      onClick={handleAddNote}
                      disabled={isSubmittingNote || !noteText.trim()}
                    >
                      {isSubmittingNote ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Note"
                      )}
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky Footer Actions */}
            <div className="sticky bottom-0 z-10 border-t bg-white p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-11 flex-1 gap-2 border-slate-200 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                  // onClick={() => handleArchive(threadDetails.id)} // Add handler later
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
                <Button className="h-11 flex-1 gap-2 bg-blue-600 font-bold text-white shadow-md hover:bg-blue-700">
                  <Reply className="h-4 w-4" />
                  Take Over
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm font-medium">{label}</span>
    <div>{value}</div>
  </div>
);

export default ThreadDetailSheet;

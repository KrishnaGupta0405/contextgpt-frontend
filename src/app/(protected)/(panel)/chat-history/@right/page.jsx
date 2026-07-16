"use client";

import React, { useEffect, useState, useRef } from "react";
import { useChatbot } from "@/context/ChatbotContext";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThreadDetailSheet from "./ThreadDetailSheet";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import MessageItem from "./MessageItem";
import ChatHeader from "./ChatHeader";

const ChatHistoryRightContent = () => {
  const { selectedChatbot } = useChatbot();
  const { isConnected, send, addListener } = useChattingSocket() || {};
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [threadDetails, setThreadDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null); // { id, content }
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = React.useCallback(async () => {
    if (!selectedChatbot?.id || !threadId) return;

    const cacheKey = `chat_messages_${threadId}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    setLoading(true);

    if (cachedData) {
      setMessages(JSON.parse(cachedData));
      setLoading(false);
    }

    try {
      const response = await api.get(
        `/chatting/${selectedChatbot.id}/thread/${threadId}/messages`,
      );
      if (response.data?.success) {
        const fetchedMessages = response.data.data.messages || [];
        setMessages(fetchedMessages);
        sessionStorage.setItem(cacheKey, JSON.stringify(fetchedMessages));
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChatbot?.id, threadId]);

  const fetchThreadDetails = React.useCallback(async () => {
    if (!selectedChatbot?.id || !threadId) return;

    setDetailsLoading(true);
    // Seed from cached thread list data first (has icon fields)
    const cached = sessionStorage.getItem(`thread_meta_${threadId}`);
    if (cached) {
      setThreadDetails((prev) => ({ ...JSON.parse(cached), ...prev }));
    }
    try {
      const response = await api.get(
        `/chatting/${selectedChatbot.id}/thread/${threadId}`,
      );
      if (response.data?.success) {
        const detail = response.data.data.thread;
        // Merge: prefer detail API data but keep icon fields from list if missing
        setThreadDetails((prev) => ({ ...prev, ...detail }));
      }
    } catch (error) {
      console.error("Failed to fetch thread details:", error);
    } finally {
      setDetailsLoading(false);
    }
  }, [selectedChatbot?.id, threadId]);

  useEffect(() => {
    fetchThreadDetails();
    fetchMessages();
  }, [threadId, selectedChatbot?.id, fetchMessages, fetchThreadDetails]);

  // Merge appearance icons (botIconSrc / userIconSrc / agentIconSrc) from
  // sessionStorage into threadDetails whenever the selected chatbot changes.
  // The icons are written there by @middle/page.jsx after fetching the
  // appearance endpoint — no extra API call needed here.
  useEffect(() => {
    if (!selectedChatbot?.id) return;
    const cached = sessionStorage.getItem(
      `chatbot_appearance_${selectedChatbot.id}`,
    );
    if (cached) {
      const icons = JSON.parse(cached);
      setThreadDetails((prev) => ({ ...(prev || {}), ...icons }));
    }
  }, [selectedChatbot?.id]);

  // Listen for thread updates from other components
  useEffect(() => {
    const handleThreadUpdate = (event) => {
      const { threadId: updatedId, title } = event.detail;
      if (updatedId === threadId) {
        setThreadDetails((prev) => ({ ...prev, title }));
      }
    };

    // Listen for appearance icons fetched by @middle after we mounted
    const handleAppearanceLoaded = (event) => {
      if (event.detail.chatbotId === selectedChatbot?.id) {
        const { botIconSrc, userIconSrc, agentIconSrc } = event.detail;
        setThreadDetails((prev) => ({
          ...(prev || {}),
          botIconSrc,
          userIconSrc,
          agentIconSrc,
        }));
      }
    };

    window.addEventListener("thread-updated", handleThreadUpdate);
    window.addEventListener(
      "chatbot-appearance-loaded",
      handleAppearanceLoaded,
    );
    return () => {
      window.removeEventListener("thread-updated", handleThreadUpdate);
      window.removeEventListener(
        "chatbot-appearance-loaded",
        handleAppearanceLoaded,
      );
    };
  }, [threadId, selectedChatbot?.id]);

  // Subscribe / unsubscribe from the current thread channel over WebSocket
  useEffect(() => {
    if (!threadId || !isConnected || !send) return;
    send({ type: "subscribe:thread", threadId });
    return () => {
      send({ type: "unsubscribe:thread", threadId });
    };
  }, [threadId, isConnected, send]);

  // React to real-time events pushed by the server for the open thread
  useEffect(() => {
    if (!addListener || !threadId) return;

    // Thread metadata changed (status, escalation, title, etc.)
    // Updates threadDetails so ChatHeader buttons and the message input reflect reality
    const unsubThreadUpdated = addListener("thread:updated", (thread) => {
      if (thread?.id !== threadId) return;
      setThreadDetails((prev) => ({ ...(prev || {}), ...thread }));
    });

    // New message in this thread (from widget visitor, AI, or another agent tab)
    const unsubNew = addListener("message:new", (message) => {
      if (message?.threadId !== threadId) return;
      setMessages((prev) => {
        // Deduplicate: skip if we already have this message (e.g. sent from this tab)
        if (prev.some((m) => m.id === message.id)) return prev;
        const next = [...prev, message];
        // Keep cache in sync so fetchMessages can't silently drop WS-added messages
        sessionStorage.setItem(
          `chat_messages_${threadId}`,
          JSON.stringify(next),
        );
        return next;
      });
    });

    // Message edited by an agent
    const unsubEdited = addListener("message:edited", (message) => {
      if (message?.threadId !== threadId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, ...message } : m)),
      );
    });

    // Reaction added to a message (e.g. thumbs-up from Messenger)
    const unsubReaction = addListener("message:reaction", (message) => {
      if (message?.threadId !== threadId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, reaction: message.reaction } : m)),
      );
    });

    // Thread was reset — clear messages if viewing the old thread
    const unsubReset = addListener("thread:reset", (data) => {
      if (data?.oldThreadId === threadId) {
        setMessages([]);
        setThreadDetails(null);
      }
    });

    return () => {
      unsubThreadUpdated();
      unsubNew();
      unsubEdited();
      unsubReaction();
      unsubReset();
    };
  }, [addListener, threadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatbot?.id || !threadId) return;

    setSending(true);
    try {
      const payload = {
        content: newMessage,
        agentName: "Agent", // You might want to make this dynamic later
      };

      const response = await api.post(
        `/chatting/${selectedChatbot.id}/thread/${threadId}/message`,
        payload,
      );

      if (response.data?.success) {
        const newMsg = response.data.data.message;
        setNewMessage("");

        // Use functional updater to avoid stale closure; deduplicate in case
        // the WS also delivered the same message before this response arrived.
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const next = [...prev, newMsg];
          sessionStorage.setItem(
            `chat_messages_${threadId}`,
            JSON.stringify(next),
          );
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const initiateEditString = (msg) => {
    setEditingMessage({ id: msg.id, content: msg.content });
    setIsEditModalOpen(true);
  };

  const submitEditMessage = async () => {
    if (
      !editingMessage ||
      !editingMessage.content.trim() ||
      !selectedChatbot?.id
    )
      return;

    setSavingEdit(true);
    try {
      const response = await api.patch(
        `/chatting/${selectedChatbot.id}/message/${editingMessage.id}`,
        { content: editingMessage.content },
      );

      if (response.data?.success) {
        const updatedMsgData = response.data.data.message;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMessage.id ? { ...m, ...updatedMsgData } : m,
          ),
        );

        // Update cache
        const cacheKey = `chat_messages_${threadId}`;
        const currentCached = JSON.parse(
          sessionStorage.getItem(cacheKey) || "[]",
        );
        const updatedCached = currentCached.map((m) =>
          m.id === editingMessage.id ? { ...m, ...updatedMsgData } : m,
        );
        sessionStorage.setItem(cacheKey, JSON.stringify(updatedCached));

        toast.success("Message updated successfully");
        setIsEditModalOpen(false);
        setEditingMessage(null);
      }
    } catch (error) {
      console.error("Failed to update message:", error);
      toast.error("Failed to update message");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!threadId) {
    return (
      <div className="bg-muted/20 flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No Thread Selected</h3>
          <p className="text-muted-foreground">
            Select a conversation from the left to view details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <ChatHeader
        threadId={threadId}
        chatbotId={selectedChatbot?.id}
        threadDetails={threadDetails}
        onThreadDetailsChange={setThreadDetails}
        messages={messages}
        onMessagesChange={setMessages}
        onOpenDetail={() => {
          fetchThreadDetails();
          setIsDetailOpen(true);
        }}
      />

      {/* Messages Area */}
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="flex h-full flex-col gap-4">
          {loading && messages.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex max-w-[80%] gap-3",
                    i % 2 === 0 ? "self-start" : "flex-row-reverse self-end",
                  )}
                >
                  <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-[200px] rounded-lg" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </div>
              ))
            : messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  threadDetails={threadDetails}
                  onEdit={initiateEditString}
                />
              ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-background border-t p-4">
        {threadDetails?.platformSource === "ZOHO_SALES_IQ" ? (
          <p className="text-muted-foreground mb-2 text-center text-xs">
            Zoho SalesIQ does not support sending messages from here. Please
            reply to the visitor using the{" "}
            <a
              href="https://www.zoho.com/salesiq"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium"
            >
              Zoho SalesIQ portal
            </a>
            .
          </p>
        ) : !threadDetails?.escalated ? (
          <p className="text-muted-foreground mb-2 text-center text-xs">
            This thread has not been escalated to a human agent. Messaging is
            disabled.
          </p>
        ) : null}
        <div className="flex gap-2">
          <Textarea
            placeholder={
              threadDetails?.platformSource === "ZOHO_SALES_IQ"
                ? "Messaging disabled — reply via Zoho SalesIQ portal"
                : "Type your message... {{{Image sharing option coming soon...}}}"
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="max-h-[150px] min-h-[50px] resize-none"
            disabled={!threadDetails?.escalated || threadDetails?.platformSource === "ZOHO_SALES_IQ"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <GatedAction>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={
                sending || !newMessage.trim() || !threadDetails?.escalated || threadDetails?.platformSource === "ZOHO_SALES_IQ"
              }
              className="h-[50px] w-[50px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </GatedAction>
        </div>
      </div>

      {/* Detail Side Panel */}
      <ThreadDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        threadDetails={threadDetails}
        loading={detailsLoading}
        onUpdate={fetchThreadDetails}
      />

      {/* Edit Message Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editingMessage?.content || ""}
              onChange={(e) =>
                setEditingMessage((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditMessage} disabled={savingEdit}>
              {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ChatHistoryRight = () => (
  <React.Suspense>
    <ChatHistoryRightContent />
  </React.Suspense>
);

export default ChatHistoryRight;

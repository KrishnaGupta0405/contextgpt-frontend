"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Sparkles,
  Info,
  Star,
  CheckCircle2,
  Archive,
  RotateCw,
  Download,
  Filter,
  PlusCircle,
  PlayIcon,
  ThumbsUp,
  ThumbsDown,
  Mail,
  MailOpen,
  Tag,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check, X, Trash2, Pencil } from "lucide-react";
import BottomBar from "./BottomBar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";

const formatThreadTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return time;
  if (isYesterday) return `Yesterday, ${time}`;

  const isThisYear = date.getFullYear() === now.getFullYear();
  const dateOpts = isThisYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  return `${date.toLocaleDateString([], dateOpts)}, ${time}`;
};

const ChatHistoryMiddleContent = () => {
  const { selectedChatbot } = useChatbot();
  const { account } = useAuth();
  const { isConnected, send, addListener } = useChattingSocket() || {};
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("open");
  const [advancedFilters, setAdvancedFilters] = useState({
    readStatus: null,      // "read" | "unread" | null
    escalated: null,       // true | false | null
    important: null,       // true | false | null
    anonymous: null,       // true | false | null
    feedback: null,        // "positive" | "negative" | null
    tags: [],              // string[]
    llmModel: null,        // string | null
  });
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState("all");
  const [fadingThreadIds, setFadingThreadIds] = useState(new Set());

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Define CSV headers
      const headers = [
        "ID",
        "Mode",
        "Anonymous",
        "Escalated",
        "Important",
        "Resolved",
        "Archived",
        "Tags",
        "Visitor Name",
        "Visitor Email",
        "Visitor Phone",
        "Created At",
      ];

      // Convert threads data to CSV format
      const csvData = threads.map((thread) => {
        return [
          thread.id,
          thread.mode,
          thread.anonymous ? "Yes" : "No",
          thread.escalated ? "Yes" : "No",
          thread.important ? "Yes" : "No",
          thread.resolved ? "Yes" : "No",
          thread.archived ? "Yes" : "No",
          `"${(thread.tags || []).join(", ")}"`,
          `"${(thread.visitorName || "Anonymous").replace(/"/g, '""')}"`,
          `"${(thread.visitorEmail || "").replace(/"/g, '""')}"`,
          `"${(thread.visitorPhone || "").replace(/"/g, '""')}"`,
          `"${new Date(thread.createdAt || Date.now()).toLocaleString()}"`,
        ].join(",");
      });

      // Combine headers and data
      const csvContent = [headers.join(","), ...csvData].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `chat_history_${selectedChatbot?.name || "export"}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };
  const [selectedThreadIds, setSelectedThreadIds] = useState(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get("threadId");
  const hasAutoSelectedRef = useRef(false);

  const fetchThreads = useCallback(async (pageNum = 1, append = false) => {
    if (!selectedChatbot?.id) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const cacheKey = `chat_threads_${selectedChatbot.id}_${filter}_${JSON.stringify(advancedFilters)}`;

      if (!append) {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setThreads(JSON.parse(cachedData));
        }
      }

      // Build query params based on status filter
      const params = new URLSearchParams({ page: pageNum, limit: 20 });
      if (filter === "open") {
        params.set("resolved", "false");
        params.set("archived", "false");
      } else if (filter === "closed") {
        params.set("resolved", "true");
      }
      // "all" — no status filter

      // Advanced filters
      if (advancedFilters.readStatus === "unread") params.set("unread", "true");
      if (advancedFilters.readStatus === "read") params.set("unread", "false");
      if (advancedFilters.escalated === true) params.set("escalated", "true");
      if (advancedFilters.escalated === false) params.set("escalated", "false");
      if (advancedFilters.important === true) params.set("important", "true");
      if (advancedFilters.important === false) params.set("important", "false");
      if (advancedFilters.anonymous === true) params.set("anonymous", "true");
      if (advancedFilters.anonymous === false) params.set("anonymous", "false");
      if (advancedFilters.feedback === "positive") params.set("feedback", "positive");
      if (advancedFilters.feedback === "negative") params.set("feedback", "negative");
      if (advancedFilters.llmModel) params.set("llmModel", advancedFilters.llmModel);
      if (advancedFilters.tags.length > 0) params.set("tags", advancedFilters.tags.join(","));

      const response = await api.get(
        `/chatting/${selectedChatbot.id}/threads?${params.toString()}`
      );

      if (response.data?.success) {
        const newThreads = response.data.data.threads;
        const pagination = response.data.data.pagination;

        if (newThreads.length === 0) {
          setHasMore(false);
          return;
        }

        if (append) {
          setThreads((prev) => [...prev, ...newThreads]);
        } else {
          setThreads(newThreads);
          sessionStorage.setItem(cacheKey, JSON.stringify(newThreads));
        }

        setPage(pageNum);
        setHasMore(pageNum < pagination.totalPages);
      } else {
        if (append) setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
      if (append) setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
    // Depend on a serialized snapshot of advancedFilters so equal-value objects
    // (e.g. a fresh reference with the same fields) don't churn this callback's
    // identity and re-trigger the re-fetch effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatbot?.id, filter, JSON.stringify(advancedFilters)]);

  // Always keep a ref to the latest fetchThreads so socket listeners
  // never capture a stale closure.
  const fetchThreadsRef = useRef(fetchThreads);
  useEffect(() => {
    fetchThreadsRef.current = fetchThreads;
  }, [fetchThreads]);

  // Sync advancedFilters to/from URL query params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const readStatus = params.get("readStatus") || null;
    const escalated = params.get("escalated") !== null ? params.get("escalated") === "true" : null;
    const important = params.get("important") !== null ? params.get("important") === "true" : null;
    const anonymous = params.get("anonymous") !== null ? params.get("anonymous") === "true" : null;
    const feedback = params.get("feedback") || null;
    const llmModel = params.get("llmModel") || null;
    const tagsRaw = params.get("tags");
    const tags = tagsRaw ? tagsRaw.split(",").filter(Boolean) : [];
    const statusFilter = params.get("status") || "open";

    setFilter(statusFilter);
    // Only replace advancedFilters state when the URL actually carries filter
    // values. Setting a fresh (same-valued) object on every mount would churn its
    // reference and re-fire the re-fetch effect, contributing to a render loop.
    const hasAnyFilter =
      readStatus !== null ||
      escalated !== null ||
      important !== null ||
      anonymous !== null ||
      feedback !== null ||
      llmModel !== null ||
      tags.length > 0;
    if (hasAnyFilter) {
      setAdvancedFilters({ readStatus, escalated, important, anonymous, feedback, llmModel, tags });
    }
  // Only run on mount to initialize from URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrlFilters = useCallback((newFilter, newAdvanced) => {
    const params = new URLSearchParams(searchParams);
    // Preserve threadId
    params.set("status", newFilter);
    // Clear previous advanced filter params
    ["readStatus", "escalated", "important", "anonymous", "feedback", "llmModel", "tags"].forEach(
      (k) => params.delete(k)
    );
    if (newAdvanced.readStatus) params.set("readStatus", newAdvanced.readStatus);
    if (newAdvanced.escalated !== null && newAdvanced.escalated !== undefined) params.set("escalated", String(newAdvanced.escalated));
    if (newAdvanced.important !== null && newAdvanced.important !== undefined) params.set("important", String(newAdvanced.important));
    if (newAdvanced.anonymous !== null && newAdvanced.anonymous !== undefined) params.set("anonymous", String(newAdvanced.anonymous));
    if (newAdvanced.feedback) params.set("feedback", newAdvanced.feedback);
    if (newAdvanced.llmModel) params.set("llmModel", newAdvanced.llmModel);
    if (newAdvanced.tags?.length > 0) params.set("tags", newAdvanced.tags.join(","));
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    updateUrlFilters(newFilter, advancedFilters);
  };

  const handleAdvancedFilterToggleWithUrl = useCallback((key, value) => {
    const updated = { ...advancedFilters, [key]: advancedFilters[key] === value ? null : value };
    setAdvancedFilters(updated);
    updateUrlFilters(filter, updated);
  }, [advancedFilters, filter, updateUrlFilters]);

  const clearAllAdvancedFilters = () => {
    const cleared = { readStatus: null, escalated: null, important: null, anonymous: null, feedback: null, tags: [], llmModel: null };
    setAdvancedFilters(cleared);
    updateUrlFilters(filter, cleared);
  };

  const activeAdvancedFilterCount = [
    advancedFilters.readStatus,
    advancedFilters.escalated,
    advancedFilters.important,
    advancedFilters.anonymous,
    advancedFilters.feedback,
    advancedFilters.llmModel,
    advancedFilters.tags.length > 0 ? "tags" : null,
  ].filter(Boolean).length;

  // Re-fetch when chatbot, filter, or advancedFilters change. advancedFilters is
  // serialized so a same-valued new object reference doesn't re-fire the fetch.
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setSelectedThreadIds(new Set());
    fetchThreads(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatbot?.id, filter, JSON.stringify(advancedFilters)]);

  const scrollAreaRef = useRef(null);

  const loadMoreThreads = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchThreads(page + 1, true);
  }, [hasMore, page, loadingMore, fetchThreads]);

  // Fetch chatbot appearance icons once per chatbot and store in sessionStorage
  useEffect(() => {
    const fetchAppearance = async () => {
      if (!account?.id || !selectedChatbot?.id) return;
      const cacheKey = `chatbot_appearance_${selectedChatbot.id}`;
      if (sessionStorage.getItem(cacheKey)) return; // already cached
      try {
        const response = await api.get(
          `/chatbots/chatbot/${selectedChatbot.id}/appearance`,
        );
        if (response.data?.success) {
          const { botIconSrc, userIconSrc, agentIconSrc } = response.data.data;
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ botIconSrc, userIconSrc, agentIconSrc }),
          );
          // Notify @right slot in case it mounted before this fetch completed
          window.dispatchEvent(
            new CustomEvent("chatbot-appearance-loaded", {
              detail: {
                chatbotId: selectedChatbot.id,
                botIconSrc,
                userIconSrc,
                agentIconSrc,
              },
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch chatbot appearance:", error);
      }
    };
    fetchAppearance();
  }, [account?.id, selectedChatbot?.id]);

  // Listen for thread updates from other components (within-page cross-slot events)
  useEffect(() => {
    const handleThreadUpdate = (event) => {
      const { threadId, title } = event.detail;
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title } : t)),
      );
    };

    window.addEventListener("thread-updated", handleThreadUpdate);
    return () => {
      window.removeEventListener("thread-updated", handleThreadUpdate);
    };
  }, []);

  // Subscribe to the chatbot channel over WebSocket
  useEffect(() => {
    if (!selectedChatbot?.id || !isConnected || !send) return;
    send({ type: "subscribe:chatbot", chatbotId: selectedChatbot.id });
  }, [selectedChatbot?.id, isConnected, send]);

  // React to real-time thread events pushed by the server
  useEffect(() => {
    if (!addListener || !selectedChatbot?.id) return;

    // A new thread was created — always call through the ref so we never
    // invoke a stale closure of fetchThreads.
    const unsubNew = addListener("thread:new", ({ chatbotId }) => {
      if (chatbotId === selectedChatbot.id) {
        fetchThreadsRef.current();
      }
    });

    // A thread's metadata was updated (status, title, escalation, etc.)
    const unsubUpdated = addListener("thread:updated", (thread) => {
      if (thread?.chatbotId === selectedChatbot.id) {
        // Check if this thread will leave the current filter — fade it out
        const wouldMatch = (() => {
          switch (filter) {
            case "open": return !(thread.resolved ?? false) && !(thread.archived ?? false);
            case "closed": return !!(thread.resolved ?? false);
            case "all": return true;
            default: return true;
          }
        })();

        if (!wouldMatch && filter !== "all") {
          setFadingThreadIds((prev) => new Set([...prev, thread.id]));
          setTimeout(() => {
            setThreads((prev) =>
              prev.map((t) => (t.id === thread.id ? { ...t, ...thread } : t)),
            );
            setFadingThreadIds((prev) => {
              const next = new Set(prev);
              next.delete(thread.id);
              return next;
            });
          }, 400);
        } else {
          setThreads((prev) =>
            prev.map((t) => (t.id === thread.id ? { ...t, ...thread } : t)),
          );
        }
      }
    });

    // A new message arrived — update thread's last message preview and bump to top
    const unsubMessage = addListener("message:new", (message) => {
      if (!message?.threadId) return;
      setThreads((prev) => {
        const idx = prev.findIndex((t) => t.id === message.threadId);
        if (idx === -1) return prev;
        const updated = {
          ...prev[idx],
          lastMessageContent: message.content,
          lastMessageRole: message.role,
          updatedAt: message.createdAt || new Date().toISOString(),
        };
        // Move thread to top of list
        return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    });

    // Thread was reset (visitor sent !reset) — old thread ended, new one created
    const unsubReset = addListener("thread:reset", (data) => {
      if (!data) return;
      // Remove old thread and refetch to pick up the new one
      if (data.oldThreadId) {
        setThreads((prev) => prev.filter((t) => t.id !== data.oldThreadId));
      }
      fetchThreadsRef.current();
    });

    return () => {
      unsubNew();
      unsubUpdated();
      unsubMessage();
      unsubReset();
    };
  }, [addListener, selectedChatbot?.id]);

  const handleThreadSelect = (threadId) => {
    // No-op if this thread is already selected — avoids redundant router.replace
    // calls that would otherwise re-render/re-navigate in a loop.
    if (selectedThreadId === threadId) return;
    const params = new URLSearchParams(searchParams);
    params.set("threadId", threadId);
    router.replace(`?${params.toString()}`);
    // Store selected thread data so right pane can access icon fields immediately
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      sessionStorage.setItem(`thread_meta_${threadId}`, JSON.stringify(thread));
    }
    // Clear unread badge immediately in local state
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, unreadMessagesCount: 0 } : t,
      ),
    );
  };

  // Memoized so it isn't a new array reference every render — the auto-select
  // effect below depends on it, and an unstable reference would re-fire it.
  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) => {
        if (fadingThreadIds.has(thread.id)) return true;
        if (selectedVisitor !== "all" && thread.visitorId !== selectedVisitor)
          return false;
        if (advancedFilters.tags.length > 0) {
          const threadTags = Array.isArray(thread.tags) ? thread.tags : [];
          if (!advancedFilters.tags.every((tag) => threadTags.includes(tag)))
            return false;
        }
        return true;
      }),
    [threads, selectedVisitor, advancedFilters, fadingThreadIds],
  );

  // Auto-open the first thread once, when none is selected on initial load, so
  // the right pane isn't empty. Wait until loading settles (a real fetch), then
  // navigate a single time — after which selectedThreadId is set and this bails.
  // The ref is a secondary guard; the real loop-proofing is the stable deps.
  useEffect(() => {
    if (hasAutoSelectedRef.current) return;
    if (selectedThreadId) return; // URL already selects a thread
    if (loading) return; // wait for a real fetch to settle
    const firstThread = filteredThreads[0];
    if (!firstThread) return;
    hasAutoSelectedRef.current = true;
    handleThreadSelect(firstThread.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, selectedThreadId, filteredThreads]);

  const toggleSelectAll = () => {
    if (selectedThreadIds.size === threads.length) {
      setSelectedThreadIds(new Set());
    } else {
      setSelectedThreadIds(new Set(threads.map((t) => t.id)));
    }
  };

  const toggleSelectThread = (e, threadId) => {
    e.stopPropagation();
    const newSelected = new Set(selectedThreadIds);
    if (newSelected.has(threadId)) {
      newSelected.delete(threadId);
    } else {
      newSelected.add(threadId);
    }
    setSelectedThreadIds(newSelected);
  };

  const handleBulkUpdate = async (action) => {
    if (!selectedChatbot?.id || selectedThreadIds.size === 0) return;

    setBulkUpdating(true);
    try {
      const payload = Array.from(selectedThreadIds).map((threadId) => {
        const updateObj = { threadId };

        switch (action) {
          case "resolve":
            updateObj.resolved = true;
            break;
          case "unresolve":
            updateObj.resolved = false;
            break;
          case "important":
            updateObj.important = true;
            break;
          case "unimportant":
            updateObj.important = false;
            break;
          case "archive":
            updateObj.archived = true;
            break;
          case "unarchive":
            updateObj.archived = false;
            break;
          case "delete":
            updateObj.archived = true;
            break;
          default:
            break;
        }
        return updateObj;
      });

      const response = await api.patch(
        `/chatting/${selectedChatbot.id}/thread/update-thread`,
        payload,
      );

      if (response.data?.success) {
        // response.data.data.updatedThreads is [[{...}], [{...}]]
        const updatedBatches = response.data.data.updatedThreads;

        // Flatten the array of arrays
        const allUpdatedThreads = updatedBatches.flat();
        const updatedMap = new Map(allUpdatedThreads.map((t) => [t.id, t]));

        // Determine which threads will no longer match the current filter
        const wouldFilter = (thread) => {
          if (selectedVisitor !== "all" && thread.visitorId !== selectedVisitor) return false;
          switch (filter) {
            case "open": return !thread.resolved && !thread.archived;
            case "closed": return !!thread.resolved;
            case "all": return true;
            default: return true;
          }
        };

        const idsToFade = new Set();
        for (const [id, updated] of updatedMap) {
          if (!wouldFilter(updated)) {
            idsToFade.add(id);
          }
        }

        // Start fade-out animation for threads leaving the filter
        if (idsToFade.size > 0) {
          setFadingThreadIds(idsToFade);
          // After animation, apply the actual state update and remove fading
          setTimeout(() => {
            setThreads((prevThreads) =>
              prevThreads.map((t) => (updatedMap.has(t.id) ? updatedMap.get(t.id) : t))
            );
            setFadingThreadIds(new Set());
          }, 400);
        } else {
          // No threads leaving the filter, update immediately
          setThreads((prevThreads) =>
            prevThreads.map((t) => (updatedMap.has(t.id) ? updatedMap.get(t.id) : t))
          );
        }

        // Update threads that stay in the filter immediately (non-fading ones)
        if (idsToFade.size > 0) {
          setThreads((prevThreads) =>
            prevThreads.map((t) => {
              if (updatedMap.has(t.id) && !idsToFade.has(t.id)) {
                return updatedMap.get(t.id);
              }
              return t;
            })
          );
        }

        toast.success("Threads updated successfully");
        setSelectedThreadIds(new Set());
      }
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast.error("Failed to update threads");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleTitleSave = async (threadId) => {
    if (!selectedChatbot?.id || !threadId || !editedTitle.trim()) return;

    try {
      const payload = [
        {
          threadId,
          title: editedTitle.trim(),
        },
      ];

      const response = await api.patch(
        `/chatting/${selectedChatbot.id}/thread/update-thread`,
        payload,
      );

      if (response.data?.success) {
        toast.success("Thread title updated successfully");
        const newTitle = editedTitle.trim();

        // Update local state
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, title: newTitle } : t)),
        );
        setEditingThreadId(null);

        // Update cache
        const cacheKey = `chat_threads_${selectedChatbot.id}_${filter}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const threads = JSON.parse(cachedData);
          const updatedThreads = threads.map((t) =>
            t.id === threadId ? { ...t, title: newTitle } : t,
          );
          sessionStorage.setItem(cacheKey, JSON.stringify(updatedThreads));
        }

        // Update single thread meta cache if exists
        const metaKey = `thread_meta_${threadId}`;
        const cachedMeta = sessionStorage.getItem(metaKey);
        if (cachedMeta) {
          const meta = JSON.parse(cachedMeta);
          sessionStorage.setItem(
            metaKey,
            JSON.stringify({ ...meta, title: newTitle }),
          );
        }

        // Dispatch event for cross-component sync
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

  const uniqueVisitors = useMemo(() => {
    const visitors = new Map();
    threads.forEach((t) => {
      // If name and email are BOTH null/empty, don't include.
      // But if at least one is present, include.
      if (t.visitorName || t.visitorEmail) {
        if (!visitors.has(t.visitorId)) {
          visitors.set(t.visitorId, {
            id: t.visitorId,
            name: t.visitorName,
            email: t.visitorEmail,
          });
        }
      }
    });
    return Array.from(visitors.values());
  }, [threads]);

  const uniqueTags = useMemo(() => {
    const tagSet = new Set();
    threads.forEach((t) => {
      if (Array.isArray(t.tags)) t.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [threads]);

  const uniqueLlmModels = useMemo(() => {
    const modelMap = new Map();
    threads.forEach((t) => {
      if (t.llmModel?.id && !modelMap.has(t.llmModel.id)) {
        modelMap.set(t.llmModel.id, t.llmModel);
      }
    });
    return Array.from(modelMap.values());
  }, [threads]);

  if (!selectedChatbot) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Please select a chatbot to view history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col border-r">
      {/* Header Section */}
      <div className="space-y-4 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                >
                  <PlayIcon className="h-5 w-5 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Watch tutorial</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-8 w-8"
                  onClick={fetchThreads}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner className="h-4 w-4 text-blue-600" />
                  ) : (
                    <RotateCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Threads</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-8 w-8"
                  onClick={handleDownload}
                  disabled={downloading || threads.length === 0}
                >
                  {downloading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download CSV</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status tabs + advanced filter */}
        <div className="flex items-center gap-2">
          {/* Status: All / Open / Closed */}
          <div className="bg-muted flex h-9 items-center rounded-lg p-1">
            {[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-all",
                  filter === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Advanced filter popover */}
          <Popover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                data-tour="chat-history-filters-trigger"
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 transition-all",
                  activeAdvancedFilterCount > 0
                    ? "border-blue-500 bg-blue-50/50 text-blue-600 hover:bg-blue-100/50"
                    : "text-muted-foreground",
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {activeAdvancedFilterCount > 0 && (
                  <Badge className="h-4 min-w-4 border-0 bg-blue-600 px-1 text-[10px] text-white">
                    {activeAdvancedFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              data-tour="chat-history-filters"
              align="start"
              className="w-72 p-0"
              sideOffset={4}
              onOpenAutoFocus={(e) => {
                // When the tour opens this popover, the sheet's focus-restore
                // would otherwise steal focus and trip an outside-close. Skip
                // the auto-focus so we don't yank focus back into the popover.
                if (window.__tourOpeningFilter) e.preventDefault();
              }}
              onInteractOutside={(e) => {
                // Ignore the stray focus/pointer event left over from closing
                // the detail sheet while the tour is programmatically opening.
                if (window.__tourOpeningFilter) e.preventDefault();
              }}
              onFocusOutside={(e) => {
                if (window.__tourOpeningFilter) e.preventDefault();
              }}
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-semibold">Filters</span>
                {activeAdvancedFilterCount > 0 && (
                  <button
                    onClick={clearAllAdvancedFilters}
                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="divide-y">
                {/* Tags */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Tags</p>
                  {uniqueTags.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">No tags in loaded threads</p>
                  ) : (
                    <div className="overflow-x-auto pb-1">
                      <div
                        className="grid gap-2"
                        style={{ gridTemplateRows: "repeat(2, auto)", gridAutoFlow: "column", width: "max-content" }}
                      >
                        {uniqueTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const has = advancedFilters.tags.includes(tag);
                              const updated = {
                                ...advancedFilters,
                                tags: has ? advancedFilters.tags.filter((t) => t !== tag) : [...advancedFilters.tags, tag],
                              };
                              setAdvancedFilters(updated);
                              updateUrlFilters(filter, updated);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                              advancedFilters.tags.includes(tag)
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                            )}
                          >
                            <Tag className="h-3 w-3" /> {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Read / Unread */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Read/Unread</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "unread", label: "Unread", icon: <Mail className="h-3.5 w-3.5" /> },
                      { value: "read", label: "Read", icon: <MailOpen className="h-3.5 w-3.5" /> },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => handleAdvancedFilterToggleWithUrl("readStatus", value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          advancedFilters.readStatus === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                        )}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Escalations */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">User Escalations</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: true, label: "Escalated", icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" /> },
                      { value: false, label: "Not Escalated", icon: <Info className="h-3.5 w-3.5 text-slate-400" /> },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={String(value)}
                        onClick={() => handleAdvancedFilterToggleWithUrl("escalated", value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          advancedFilters.escalated === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                        )}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Importance */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Importance</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: true, label: "Important", icon: <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> },
                      { value: false, label: "Not Important", icon: <Star className="h-3.5 w-3.5 text-slate-300" /> },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={String(value)}
                        onClick={() => handleAdvancedFilterToggleWithUrl("important", value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          advancedFilters.important === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                        )}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Information */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">User Information</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: true, label: "Anonymous" },
                      { value: false, label: "Not Anonymous" },
                    ].map(({ value, label }) => (
                      <button
                        key={String(value)}
                        onClick={() => handleAdvancedFilterToggleWithUrl("anonymous", value)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          advancedFilters.anonymous === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Reactions */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">User Reactions</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "positive", label: "Positive", icon: <ThumbsUp className="h-3.5 w-3.5 text-green-500" /> },
                      { value: "negative", label: "Negative", icon: <ThumbsDown className="h-3.5 w-3.5 text-red-400" /> },
                    ].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        onClick={() => handleAdvancedFilterToggleWithUrl("feedback", value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                          advancedFilters.feedback === value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                        )}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPT Model */}
                <div className="px-3 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">GPT Model</p>
                  {uniqueLlmModels.length === 0 ? (
                    <p className="text-muted-foreground text-xs italic">No model data in loaded threads</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {uniqueLlmModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleAdvancedFilterToggleWithUrl("llmModel", model.title)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                            advancedFilters.llmModel === model.title
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground",
                          )}
                        >
                          <Cpu className="h-3 w-3" /> {model.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Select value={selectedVisitor} onValueChange={setSelectedVisitor}>
            <SelectTrigger className="bg-muted/30 h-9 w-full border-0">
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visitors</SelectItem>
              {uniqueVisitors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name && v.email
                    ? `${v.name} (${v.email})`
                    : v.name || v.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 px-1 pt-2">
          <Checkbox
            checked={
              filteredThreads.length > 0 &&
              selectedThreadIds.size === filteredThreads.length &&
              filteredThreads.every((t) => selectedThreadIds.has(t.id))
            }
            onCheckedChange={() => {
              if (
                selectedThreadIds.size === filteredThreads.length &&
                filteredThreads.every((t) => selectedThreadIds.has(t.id))
              ) {
                setSelectedThreadIds(new Set());
              } else {
                setSelectedThreadIds(new Set(filteredThreads.map((t) => t.id)));
              }
            }}
            className="border-muted-foreground/40 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
          />
          <span className="text-muted-foreground text-sm">Select all</span>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} data-tour="chat-history-thread-list" className="min-h-0 flex-1">
        <div className="flex flex-col p-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4 flex items-center space-x-4 p-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-3 w-[40%]" />
                </div>
              </div>
            ))
          ) : filteredThreads.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No {filter === "open" ? "open" : filter === "closed" ? "closed" : ""} chat threads found.
            </p>
          ) : (
            <>
            {filteredThreads.map((thread) => {
              const isSelected = selectedThreadIds.has(thread.id);
              const isActive = selectedThreadId === thread.id;

              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group/thread relative flex cursor-pointer items-start gap-3 rounded-lg p-3 overflow-hidden",
                    isActive
                      ? "bg-blue-50/80 dark:bg-blue-950/20"
                      : "hover:bg-muted/40",
                    isSelected && "bg-muted/30",
                  )}
                  style={{
                    transition: "opacity 350ms ease, max-height 350ms ease, padding 350ms ease, margin 350ms ease",
                    ...(fadingThreadIds.has(thread.id)
                      ? { opacity: 0, maxHeight: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, pointerEvents: "none" }
                      : { opacity: 1, maxHeight: "200px" }),
                  }}
                  onClick={() => handleThreadSelect(thread.id)}
                >
                  {/* Hover/Selected State Indicator line or background handled by class above */}

                  <div
                    className="flex items-center justify-center pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleSelectThread(
                          { stopPropagation: () => {} },
                          thread.id,
                        )
                      }
                      className="border-muted-foreground/30 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                    />
                  </div>

                  <Avatar
                    className={cn(
                      "h-10 w-10 border-2",
                      isActive
                        ? "border-blue-100"
                        : "bg-muted/20 border-transparent",
                    )}
                  >
                    <AvatarImage src="" />
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        // Alternate colors based on id char code (mock logic)
                        thread.id.charCodeAt(0) % 2 === 0
                          ? "bg-blue-50 text-blue-600"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      {thread.visitorName
                        ? thread.visitorName.charAt(0).toUpperCase()
                        : "A"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      {editingThreadId === thread.id ? (
                        <div
                          className="mr-2 flex flex-1 items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="h-6 px-1 py-0 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleTitleSave(thread.id);
                              if (e.key === "Escape") setEditingThreadId(null);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-green-600 hover:text-green-700"
                            onClick={() => handleTitleSave(thread.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-600 hover:text-red-700"
                            onClick={() => setEditingThreadId(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="group/title mr-2 flex min-w-0 flex-1 items-center gap-1.5">
                          <p className="text-foreground/90 truncate text-sm font-semibold">
                            {thread.title ||
                              thread.visitorName ||
                              "Anonymous Visitor"}
                          </p>
                          <Pencil
                            className="text-muted-foreground hover:text-foreground h-3 w-3 cursor-pointer opacity-0 transition-opacity group-hover/thread:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingThreadId(thread.id);
                              setEditedTitle(
                                thread.title ||
                                  thread.visitorName ||
                                  "Anonymous Visitor",
                              );
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {thread.unreadMessagesCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-1 h-4 bg-blue-100 px-1 text-[10px] text-blue-700"
                          >
                            {thread.unreadMessagesCount}
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                          {formatThreadTime(thread.startedAt || thread.createdAt)}
                        </span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                          {thread.resolved && thread.endedAt
                            ? `Ended ${formatThreadTime(thread.endedAt)}`
                            : formatThreadTime(thread.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-xs leading-tight">
                      {thread.lastMessageContent
                        ? `${thread.lastMessageRole === "user" ? "Visitor: " : "AI: "}${thread.lastMessageContent}`
                        : thread.tags && thread.tags.length > 0
                          ? thread.tags.join(", ")
                          : "No preview available..."}
                    </p>

                    <div
                      className="mt-1 flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Status Icons */}
                      {thread.escalated && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-amber-500 transition-colors hover:text-amber-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Escalated to human</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {thread.important && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-colors hover:text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Marked as important</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {thread.resolved && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 transition-colors hover:text-emerald-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Resolved</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {thread.archived && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Archive className="h-4 w-4 text-slate-400 transition-colors hover:text-slate-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Archived</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {thread.mode === "AI" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Sparkles className="h-4 w-4 text-cyan-500 transition-colors hover:text-cyan-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI Mode</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {thread.platformSource && thread.platformSource !== "WIDGET" && (
                        <PlatformBadge platform={thread.platformSource} iconOnly />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore ? (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreThreads}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? (
                    <Spinner className="h-4 w-4 text-blue-600" />
                  ) : (
                    <RotateCw className="h-3.5 w-3.5" />
                  )}
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            ) : (
              filteredThreads.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="bg-border h-px flex-1" />
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    End of conversations
                  </span>
                  <div className="bg-border h-px flex-1" />
                </div>
              )
            )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Bulk Action Bar */}
      <BottomBar
        selectedCount={selectedThreadIds.size}
        onResolve={() => handleBulkUpdate("resolve")}
        onUnresolve={() => handleBulkUpdate("unresolve")}
        onImportant={() => handleBulkUpdate("important")}
        onUnimportant={() => handleBulkUpdate("unimportant")}
        onArchive={() => handleBulkUpdate("archive")}
        onUnarchive={() => handleBulkUpdate("unarchive")}
        onDelete={() => handleBulkUpdate("delete")}
        onClearSelection={() => setSelectedThreadIds(new Set())}
        updating={bulkUpdating}
      />
    </div>
  );
};

const ChatHistoryMiddle = () => (
  <React.Suspense>
    <ChatHistoryMiddleContent />
  </React.Suspense>
);

export default ChatHistoryMiddle;

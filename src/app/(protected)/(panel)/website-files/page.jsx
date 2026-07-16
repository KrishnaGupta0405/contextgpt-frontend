"use client";
import React, { useState, useEffect, useCallback } from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Download,
  Search,
  Plus,
  Filter,
  Trash2,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Eye,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Pen,
} from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import LoadingBar from "react-top-loading-bar";
import { AddFilesModal } from "./AddFilesModal";
import SelectionBar from "@/components/SelectionBar";

const TABS = [
  {
    id: "total",
    title: "Total",
    icon: <Copy className="h-5 w-5 text-white" />,
    iconBg: "bg-[#3b82f6]",
    status: undefined,
  },
  {
    id: "trained",
    title: "Trained",
    icon: <Check className="h-5 w-5 text-white" />,
    iconBg: "bg-[#22c55e]",
    status: "COMPLETED",
  },
  {
    id: "pending",
    title: "Pending",
    icon: <Clock className="h-5 w-5 text-white" />,
    iconBg: "bg-[#eab308]",
    status: "PENDING",
  },
  {
    id: "failed",
    title: "Failed",
    icon: <AlertCircle className="h-5 w-5 text-white" />,
    iconBg: "bg-[#ef4444]",
    status: "FAILED",
  },
];

const WebsiteFiles = () => {
  const { selectedChatbot } = useChatbot();
  const { send, addListener, isConnected } = useChattingSocket() || {};
  const [activeTab, setActiveTab] = useState("total");
  const [files, setFiles] = useState([]);
  const [selectedfiles, setSelectedfiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const loadingBarRef = React.useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0, // Using initial mock values
    trained: 0,
    pending: 0,
    failed: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState({});

  // Show toast when redirected back after a successful OAuth connection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providers = {
      box: "Box",
      notion: "Notion",
      google_drive: "Google Drive",
      dropbox: "Dropbox",
      onedrive: "OneDrive",
      github: "GitHub",
      mega: "MEGA",
      icloud: "iCloud Drive",
      confluence: "Confluence",
      sharepoint: "SharePoint",
      gitbook: "GitBook",
    };
    const url = new URL(window.location.href);
    let matched = false;
    for (const [key, label] of Object.entries(providers)) {
      if (params.get(key) === "connected") {
        toast.success(`${label} connected successfully! You can now browse and add files.`);
        url.searchParams.delete(key);
        matched = true;
      }
    }
    if (matched) {
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const activeTabTitle = TABS.find((t) => t.id === activeTab)?.title || "Total";

  const formatTableDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle UTC strings like "2026-02-27 12:42:52.705" from backend explicitly as UTC
      const normalized = dateStr.endsWith("Z")
        ? dateStr
        : dateStr.replace(" ", "T") + "Z";
      const date = new Date(normalized);
      // Format to ex: Feb 27, 2026 12:42 PM
      return format(date, "MMM dd, yyyy h:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  const formatSource = (source) => {
    switch (source) {
      case "FIRECRAWL_BULK":
        return "MultipleLink";
      case "FIRECRAWL_SITEMAP":
        return "Sitemap";
      case "FIRECRAWL_CRAWL":
        return "Website";
      default:
        return source ? source.replace("FIRECRAWL_", "") : "-";
    }
  };

  const handleDownloadCSV = () => {
    if (!files || files.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = [
      "url",
      "linkType",
      "status",
      "title",
      "addedOn",
      "lastSynced",
      "errorMessage",
      "fileSize",
    ];

    const rows = files.map((file) => {
      const url = file.metadata?.sourceUrl || file.fileName || "";
      const linkType = formatSource(file.fileSource);

      let statusStr = "Unknown";
      if (file.status === "COMPLETED") statusStr = "Trained";
      else if (
        [
          "PENDING",
          "CHUNKING",
          "EMBEDDING",
          "RESYNCING",
          "DELETING",
          "UPLOADED",
        ].includes(file.status)
      )
        statusStr = "Pending";
      else if (file.status === "FAILED") statusStr = "Failed";

      const title = url;

      const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          return format(date, "MMM dd, yyyy, hh:mm a 'UTC'");
        } catch (e) {
          return dateStr;
        }
      };

      const addedOn = formatDateTime(file.createdAt);
      const lastSynced = formatDateTime(file.updatedAt);
      const errorMessage = file.errorMessage || "";
      const fileSize = file.fileSize != null ? `${file.fileSize} bytes` : "";

      return [
        url,
        linkType,
        statusStr,
        title,
        addedOn,
        lastSynced,
        errorMessage,
        fileSize,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const objUrl = URL.createObjectURL(blob);
    link.setAttribute("href", objUrl);
    link.setAttribute("download", `website_files_${activeTab}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteLink = async (fileIds) => {
    if (!selectedChatbot?.id && !selectedChatbot?.chatbotId) {
      toast.error("No chatbot selected");
      return;
    }
    const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

    if (!confirm("Are you sure you want to delete these link(s)?")) return;

    // Support either a single ID string or an array of IDs
    const idsToDelete = Array.isArray(fileIds) ? fileIds : [fileIds];

    if (idsToDelete.length === 0) return;

    // Build the query string using URLSearchParams explicitly
    const params = new URLSearchParams();
    idsToDelete.forEach((id) => params.append("fileId", id));

    try {
      loadingBarRef.current?.continuousStart();
      const response = await api.delete(
        `/ingestion/${chatbotId}/files?${params.toString()}`,
      );
      if (response.data?.success) {
        const { deletedCount, failedCount } = response.data.data;
        if (failedCount > 0) {
          toast.warning(
            `Deleted ${deletedCount} files. Failed: ${failedCount}`,
          );
        } else {
          toast.success(`Successfully deleted ${deletedCount} files`);
        }

        setSelectedfiles([]); // Clear selections on success

        const activeTabConfig = TABS.find((t) => t.id === activeTab);
        fetchFiles(currentPage, activeTabConfig?.status);
      } else {
        toast.error(response.data?.message || "Failed to delete link(s)");
      }
    } catch (error) {
      console.error("Error deleting link(s):", error);
      toast.error(error.response?.data?.message || "Failed to delete link(s)");
    } finally {
      loadingBarRef.current?.complete();
    }
  };

  const handleResyncLink = async (fileIds) => {
    if (!selectedChatbot?.id && !selectedChatbot?.chatbotId) {
      toast.error("No chatbot selected");
      return;
    }
    const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

    if (!confirm("Are you sure you want to resync these link(s)?")) return;

    // Support either a single ID string or an array of IDs
    const idsToResync = Array.isArray(fileIds) ? fileIds : [fileIds];

    if (idsToResync.length === 0) return;

    // Build the query string explicitly with URLSearchParams
    const params = new URLSearchParams();
    idsToResync.forEach((id) => params.append("fileId", id));

    try {
      loadingBarRef.current?.continuousStart();
      const response = await api.post(
        `/ingestion/${chatbotId}/files/resync?${params.toString()}`,
      );
      if (response.data?.success) {
        toast.success(
          response.data.message ||
            `Started resync for ${idsToResync.length} file(s)`,
        );

        setSelectedfiles([]); // Clear selections on success

        const activeTabConfig = TABS.find((t) => t.id === activeTab);
        fetchFiles(currentPage, activeTabConfig?.status);
      } else {
        toast.error(response.data?.message || "Failed to resync link(s)");
      }
    } catch (error) {
      console.error("Error resyncing link(s):", error);
      toast.error(error.response?.data?.message || "Failed to resync link(s)");
    } finally {
      loadingBarRef.current?.complete();
    }
  };

  const handleRefreshfiles = async () => {
    if (cooldown > 0) {
      toast.error("Please wait a moment before refreshing again");
      return;
    }

    setIsRefreshing(true);
    setCooldown(5);

    const activeTabConfig = TABS.find((t) => t.id === activeTab);
    await fetchFiles(currentPage, activeTabConfig?.status);

    setIsRefreshing(false);
    toast.success("List refreshed");
  };

  const fetchChunks = useCallback(async (fileId) => {
    if (expandedChunks[fileId]) {
      setExpandedChunks((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
      return;
    }
    setExpandedChunks((prev) => ({ ...prev, [fileId]: "loading" }));
    try {
      const res = await api.get(`/ingestion/files/${fileId}/chunks`);
      setExpandedChunks((prev) => ({ ...prev, [fileId]: res.data.data.chunks }));
    } catch {
      setExpandedChunks((prev) => ({ ...prev, [fileId]: [] }));
      toast.error("Failed to load chunks");
    }
  }, [expandedChunks]);

  const fetchFiles = async (page = 1, status) => {
    try {
      setLoading(true);
      loadingBarRef.current?.continuousStart();
      const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!chatbotId || !accountId) {
        setLoading(false);
        return;
      }

      const params = {};
      if (status) params.status = status;

      const response = await api.get(
        `/ingestion/account/${accountId}/chatbot/${chatbotId}/files`,
        { params },
      );

      if (response.data?.success) {
        const fetchedFiles = response.data.data.files || [];
        setFiles(fetchedFiles);
        setTotalFiles(response.data.data.total);

        // If we fetched the "total" tab, we can derive the counts for all categories
        // from the payload to keep the stats up to date dynamically:
        if (!status) {
          const statsUpdate = {
            total: response.data.data.total || 0,
            trained: 0,
            pending: 0,
            failed: 0,
          };

          fetchedFiles.forEach((link) => {
            const st = link.status;
            if (st === "COMPLETED") {
              statsUpdate.trained += 1;
            } else if (st === "FAILED") {
              statsUpdate.failed += 1;
            } else if (
              st === "PENDING" ||
              st === "CHUNKING" ||
              st === "EMBEDDING" ||
              st === "RESYNCING" ||
              st === "DELETING" ||
              st === "UPLOADED" ||
              st === "QUEUED" ||
              st === "TPM_DEFERRED"
            ) {
              statsUpdate.pending += 1;
            }
          });

          setStats(statsUpdate);
        } else {
          // If we are currently filtered by a specific tab, just update that tab's count
          // using the `total` returned from the API pagination metadata
          setStats((prev) => {
            const tab = TABS.find((t) => t.status === status) || TABS[0];
            return { ...prev, [tab.id]: response.data.data.total };
          });
        }
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch website files");
      setFiles([]);
      setTotalFiles(0);
    } finally {
      setLoading(false);
      loadingBarRef.current?.complete();
    }
  };

  useEffect(() => {
    const activeTabConfig = TABS.find((t) => t.id === activeTab);
    fetchFiles(currentPage, activeTabConfig?.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatbot, activeTab, currentPage]);

  // Keep a ref to the latest fetchFiles params so the socket handler isn't stale
  const activeTabRef = React.useRef(activeTab);
  const currentPageRef = React.useRef(currentPage);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  // Subscribe to real-time ingestion status updates via WebSocket
  useEffect(() => {
    const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
    if (!chatbotId || !send || !addListener) return;

    // Tell the WS server we want ingestion updates for this chatbot
    send({ type: "subscribe:ingestion", chatbotId });

    const unsub = addListener("ingestion:status", (data) => {
      if (data.chatbotId !== chatbotId) return;

      setFiles((prev) => {
        const exists = prev.some((f) => f.id === data.fileId);
        if (!exists) {
          // New file added from an external source — reload the list
          const activeTabConfig = TABS.find((t) => t.id === activeTabRef.current);
          fetchFiles(currentPageRef.current, activeTabConfig?.status);
          return prev;
        }
        return prev.map((f) =>
          f.id === data.fileId
            ? {
                ...f,
                status: data.status,
                updatedAt: new Date().toISOString(),
                ...(data.deferAttempts != null && { deferAttempts: data.deferAttempts }),
                ...(data.maxDeferAttempts != null && { maxDeferAttempts: data.maxDeferAttempts }),
              }
            : f
        );
      });
    });

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatbot, isConnected, send, addListener]);

  const handleTabChange = (tabId) => {
    if (activeTab === tabId) return;
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const formatBytes = (bytes) => {
    if (bytes == null) return "0 B";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <TooltipProvider>
      <LoadingBar color="#3b82f6" ref={loadingBarRef} shadow={true} />
      <div className="flex h-full flex-col">
        <PanelNavbar
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Website Files" },
          ]}
        />
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              Files
            </h2>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-9 items-center justify-center gap-2 px-3 font-medium text-slate-500 hover:text-slate-700"
                    onClick={handleRefreshfiles}
                    disabled={isRefreshing || cooldown > 0}
                  >
                    {cooldown > 0 ? (
                      <span className="text-[11px] font-bold tracking-wider">
                        {cooldown}s
                      </span>
                    ) : (
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                    )}
                    <span>Refresh {activeTabTitle}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {cooldown > 0
                    ? `Please wait ${cooldown}s`
                    : `Refresh ${activeTabTitle.toLowerCase()} files`}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex h-9 items-center justify-center gap-2 px-3 font-medium text-slate-500 hover:text-slate-700"
                    onClick={handleDownloadCSV}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {activeTabTitle}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Export {activeTabTitle.toLowerCase()} files
                </TooltipContent>
              </Tooltip>
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search files..."
                  className="w-full bg-white pl-8 sm:w-[250px]"
                />
              </div>
              <GatedAction>
                <Button
                  className="border-0 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setIsAddFileModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Files
                </Button>
              </GatedAction>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                    isActive
                      ? "border-blue-500 bg-[#f8faff] ring-1 ring-blue-500"
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col p-5 pb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${tab.iconBg}`}
                      >
                        {tab.icon}
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs font-medium text-slate-500">
                          {tab.title}
                        </p>
                        <h3 className="text-xl font-bold text-slate-700">
                          {stats[tab.id] || 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-auto flex border-t border-slate-100 bg-slate-50/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex flex-1 items-center justify-center border-r border-slate-100 py-2.5 transition-colors hover:bg-slate-100">
                          <Filter className="h-4 w-4 text-slate-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Filter all files
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex flex-1 items-center justify-center border-r border-slate-100 py-2.5 text-blue-500 transition-colors hover:bg-[#eaf1fb]"
                          onClick={() => {
                            if (selectedfiles.length > 0) {
                              handleResyncLink(selectedfiles);
                              return;
                            }
                            const ids = tab.status
                              ? files
                                  .filter((f) => f.status === tab.status)
                                  .map((f) => f.id)
                              : files.map((f) => f.id);

                            if (ids.length > 0) {
                              handleResyncLink(ids);
                            } else {
                              toast.info(
                                "No files found to resync in this view.",
                              );
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Resync all files
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex flex-1 items-center justify-center py-2.5 text-red-500 transition-colors hover:bg-[#ffeef0]"
                          onClick={() => {
                            // First, use selected checkboxes if any
                            if (selectedfiles.length > 0) {
                              handleDeleteLink(selectedfiles);
                              return;
                            }

                            // Otherwise, fallback to deleting all visible files for this tab
                            const ids = tab.status
                              ? files
                                  .filter((f) => f.status === tab.status)
                                  .map((f) => f.id)
                              : files.map((f) => f.id);

                            if (ids.length > 0) {
                              handleDeleteLink(ids);
                            } else {
                              toast.info(
                                "No files found to delete in this view.",
                              );
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Delete all visible files
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
              <span className="text-sm text-slate-500">
                Showing {totalFiles > 0 ? (currentPage - 1) * 20 + 1 : 0} to{" "}
                {Math.min(currentPage * 20, totalFiles)} of{" "}
                <span className="font-semibold text-slate-700">
                  {totalFiles}
                </span>{" "}
                files
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2 px-2 text-sm text-slate-500">
                  <span>Page</span>
                  <Input
                    type="number"
                    value={currentPage}
                    readOnly
                    className="h-8 w-12 p-0 text-center"
                  />
                  <span>of {Math.ceil(totalFiles / 20) || 1}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  disabled={currentPage >= Math.ceil(totalFiles / 20)}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  disabled={currentPage >= Math.ceil(totalFiles / 20)}
                  onClick={() => setCurrentPage(Math.ceil(totalFiles / 20))}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[40px] text-center">
                      <Checkbox
                        disabled={loading || files.length === 0}
                        checked={
                          files.length > 0 &&
                          selectedfiles.length === files.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedfiles(files.map((f) => f.id));
                          } else {
                            setSelectedfiles([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">
                      URL
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">
                      SOURCE
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">
                      STATUS
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">
                      ADDED ON
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500">
                      LAST SYNCED AT
                    </TableHead>
                    <TableHead className="w-[120px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-center">
                          <Checkbox disabled />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[300px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[80px] rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-slate-500 italic"
                      >
                        No files found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <React.Fragment key={file.id}>
                      <TableRow className="hover:bg-slate-50/80">
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedfiles.includes(file.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedfiles((prev) => [...prev, file.id]);
                              } else {
                                setSelectedfiles((prev) =>
                                  prev.filter((id) => id !== file.id),
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <a
                              href={file.metadata?.sourceUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="max-w-[400px] truncate text-[13px] font-medium text-slate-800 hover:text-blue-600"
                            >
                              {file.metadata?.sourceUrl || file.fileName}
                            </a>
                            <div className="flex items-center space-x-1 text-xs text-slate-400">
                              <span>{formatBytes(file.fileSize)}</span>
                              {(file.filePages || file.filePages === 0) && (
                                <>
                                  <span>•</span>
                                  <span>{file.filePages} pages</span>
                                </>
                              )}
                              {file.fileTokens && (
                                <>
                                  <span>•</span>
                                  <span>{file.fileTokens} tokens</span>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-medium text-slate-600">
                          {formatSource(file.fileSource)}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const st = file.status;
                            if (st === "COMPLETED") {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-emerald-200 bg-white font-medium text-emerald-500 hover:bg-white"
                                    >
                                      Success
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    className="border-none bg-[#222222] text-white"
                                  >
                                    <p>
                                      Your document has been processed and
                                      trained
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (
                              st === "CHUNKING" ||
                              st === "EMBEDDING" ||
                              st === "PENDING" ||
                              st === "UPLOADED"
                            ) {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-amber-200 bg-white font-medium text-amber-500 hover:bg-white"
                                    >
                                      Processing
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    className="border-none bg-[#222222] text-white"
                                  >
                                    <p>Your document is being processed</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (st === "DELETING") {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-orange-200 bg-white font-medium text-orange-500 hover:bg-white"
                                    >
                                      Deleting
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    className="border-none bg-[#222222] text-white"
                                  >
                                    <p>
                                      Your document is added to queue for
                                      deletion
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (st === "RESYNCING") {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-blue-200 bg-white font-medium text-blue-500 hover:bg-white"
                                    >
                                      Processing
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    className="border-none bg-[#222222] text-white"
                                  >
                                    <p>
                                      Your document is added to queue for resync
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (st === "QUEUED") {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="cursor-help border-slate-200 bg-white font-medium text-slate-500 hover:bg-white">
                                      Queued
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="border-none bg-[#222222] text-white">
                                    <p>File is queued for processing</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (st === "TPM_DEFERRED") {
                              const attempt = file.deferAttempts ?? 1;
                              const max = file.maxDeferAttempts ?? 5;
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-violet-200 bg-white font-medium text-violet-500 hover:bg-white"
                                    >
                                      Retrying {attempt}/{max}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="border-none bg-[#222222] text-white">
                                    <p>Embedding capacity limit hit. Auto-retrying ({attempt} of {max} attempts).</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            if (st === "FAILED") {
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-help border-rose-200 bg-white font-medium text-rose-500 hover:bg-white"
                                    >
                                      Failed
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="left"
                                    className="border-none bg-[#222222] text-white"
                                  >
                                    <p>Your document processing failed</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            return (
                              <Badge variant="outline" className="bg-white">
                                {st}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600">
                          {formatTableDate(file.createdAt)}
                        </TableCell>
                        <TableCell className="text-[13px] text-slate-600">
                          {formatTableDate(file.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2 text-slate-400">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-slate-600"
                                  onClick={() =>
                                    window.open(file.storageUri, "_blank")
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            {/* <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-slate-600 disabled:opacity-50"
                                  onClick={() => setIsAddFileModalOpen(true)}
                                  disabled={true}
                                >
                                  <Pen className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Update content</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:text-blue-600 disabled:opacity-50"
                                  onClick={() => handleResyncLink(file.id)}
                                  disabled={true}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sync</TooltipContent>
                            </Tooltip> */}
                            {file.totalChunks > 1 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700"
                                    onClick={() => fetchChunks(file.id)}
                                  >
                                    <ChevronDown className="mr-1 h-3 w-3" />
                                    Chunks ({file.totalChunks})
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View chunks</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-500"
                                  onClick={() => handleDeleteLink(file.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedChunks[file.id] && (
                        <TableRow key={`${file.id}-chunks`} className="bg-slate-50/60">
                          <TableCell colSpan={7} className="py-3 px-6">
                            {expandedChunks[file.id] === "loading" ? (
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Loading chunks...
                              </div>
                            ) : expandedChunks[file.id].length === 0 ? (
                              <p className="text-xs italic text-slate-400">No chunks found.</p>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {expandedChunks[file.id].map((chunk) => (
                                  <div
                                    key={chunk.id}
                                    className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600"
                                  >
                                    <span className="w-16 font-medium text-slate-400">
                                      Chunk {chunk.chunkIndex + 1}
                                    </span>
                                    <span className="flex-1 text-slate-400">
                                      {chunk.tokenCount} tokens
                                    </span>
                                    {chunk.chunkTextPreviewLink && (
                                      <a
                                        href={chunk.chunkTextPreviewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                      >
                                        <Eye className="h-3 w-3" />
                                        View
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <SelectionBar
        selectedCount={selectedfiles.length}
        onResync={() => handleResyncLink(selectedfiles)}
        onDelete={() => handleDeleteLink(selectedfiles)}
        onClearSelection={() => setSelectedfiles([])}
        loading={loading}
      />
      <AddFilesModal
        isOpen={isAddFileModalOpen}
        onClose={setIsAddFileModalOpen}
      />
    </TooltipProvider>
  );
};

export default WebsiteFiles;

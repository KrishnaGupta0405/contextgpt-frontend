"use client";
import React, { useState, useEffect, useCallback } from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw,
  Plus,
  Pause,
  Play,
  Trash2,
  Zap,
  MoreHorizontal,
  Globe,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  Link2,
} from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import { useProductTour } from "@/hooks/use-product-tour";
import { hasSubscriptionAccess } from "@/lib/subscription";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { usePlanUpgradeNotification } from "@/components/PlanUpgradeNotification";
import { format, formatDistanceToNow } from "date-fns";
import LoadingBar from "react-top-loading-bar";
import { EnrollModal } from "./EnrollModal";
import { ScanModal } from "./ScanModal";
import { DiscoveredUrlsModal } from "./DiscoveredUrlsModal";

const YtIcon = () => (
  <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
  </svg>
);

const SOURCE_ICON = {
  YOUTUBE: <YtIcon />,
};

const SOURCE_LABEL = {
  FIRECRAWL_BULK: "MultipleLink",
  FIRECRAWL_SITEMAP: "Sitemap",
  FIRECRAWL_CRAWL: "Website",
  YOUTUBE: "YouTube",
};

const FREQ_LABEL = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const normalized = dateStr.endsWith("Z") ? dateStr : dateStr.replace(" ", "T") + "Z";
    return format(new Date(normalized), "MMM dd, yyyy h:mm a");
  } catch {
    return dateStr;
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
};

function isStarterPlan(planType) {
  return /^pri_starter_/i.test(planType ?? "");
}

export default function AutoSync() {
  const { selectedChatbot } = useChatbot();
  const { subscription } = useAuth();
  const { showNotification, showNoSubscriptionNotification } = usePlanUpgradeNotification();
  const { resumeTour } = useProductTour();
  const loadingBarRef = React.useRef(null);

  // TOUR_LEGS[13] — resumeTour(13) runs it when the API Keys leg handed off
  // here, and no-ops otherwise. Same delay as the other legs, giving the tabs
  // and jobs table a frame to paint before the overlay lands.
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(13), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  const hasAccess = hasSubscriptionAccess(subscription);
  const isStarterPlanUser = isStarterPlan(subscription?.planType);
  const autoRefreshSupported = subscription?.autoRefreshData ?? false;
  const autoScanSupported = subscription?.autoScanData ?? false;

  // Auto-Refresh State
  const [refreshRecords, setRefreshRecords] = useState([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [isRefreshEnrollOpen, setIsRefreshEnrollOpen] = useState(false);
  const [refreshActionLoading, setRefreshActionLoading] = useState({});

  // Auto-Scan State
  const [scanRecords, setScanRecords] = useState([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(0);
  const [isScanEnrollOpen, setIsScanEnrollOpen] = useState(false);
  const [scanActionLoading, setScanActionLoading] = useState({});
  const [discoveredUrlsModal, setDiscoveredUrlsModal] = useState({ isOpen: false, record: null });

  useEffect(() => {
    let timer;
    if (refreshCooldown > 0) timer = setInterval(() => setRefreshCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [refreshCooldown]);

  useEffect(() => {
    let timer;
    if (scanCooldown > 0) timer = setInterval(() => setScanCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [scanCooldown]);

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  // Auto-Refresh Handlers
  const fetchRefreshRecords = useCallback(async () => {
    if (!chatbotId) return;
    if (isStarterPlanUser || !autoRefreshSupported) {
      setRefreshLoading(false);
      return;
    }
    try {
      setRefreshLoading(true);
      loadingBarRef.current?.continuousStart();
      const res = await api.get(`/ingestion/auto-refresh`, { params: { chatbotId } });
      if (res.data?.success) setRefreshRecords(res.data.data?.records || []);
    } catch {
      toast.error("Failed to load auto-refresh records");
    } finally {
      setRefreshLoading(false);
      loadingBarRef.current?.complete();
    }
  }, [chatbotId, isStarterPlanUser, autoRefreshSupported]);

  useEffect(() => {
    fetchRefreshRecords();
  }, [fetchRefreshRecords]);

  const handleRefreshRefresh = async () => {
    if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
    if (refreshCooldown > 0) return;
    setRefreshLoading(true);
    setRefreshCooldown(5);
    await fetchRefreshRecords();
    setRefreshLoading(false);
    toast.success("Refreshed");
  };

  const setRefreshLoaderFor = (id, val) =>
    setRefreshActionLoading((p) => ({ ...p, [id]: val }));

  const handleRefreshPause = async (id) => {
    if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
    const record = refreshRecords.find((r) => r.id === id);
    try {
      setRefreshLoaderFor(id, "pause");
      const res = await api.patch(`/ingestion/auto-refresh/${id}/pause`, {
        chatbotId: record?.chatbotId,
      });
      if (res.data?.success) {
        toast.success("Paused");
        setRefreshRecords((p) => p.map((r) => (r.id === id ? { ...r, status: "PAUSED" } : r)));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pause");
    } finally {
      setRefreshLoaderFor(id, null);
    }
  };

  const handleRefreshResume = async (id) => {
    if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
    const record = refreshRecords.find((r) => r.id === id);
    try {
      setRefreshLoaderFor(id, "resume");
      const res = await api.patch(`/ingestion/auto-refresh/${id}/resume`, {
        chatbotId: record?.chatbotId,
      });
      if (res.data?.success) {
        toast.success("Resumed");
        setRefreshRecords((p) => p.map((r) => (r.id === id ? { ...r, status: "ACTIVE" } : r)));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resume");
    } finally {
      setRefreshLoaderFor(id, null);
    }
  };

  const handleRefreshDelete = async (id) => {
    if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
    if (!confirm("Remove this auto-refresh job permanently?")) return;
    const record = refreshRecords.find((r) => r.id === id);
    try {
      setRefreshLoaderFor(id, "delete");
      const res = await api.delete(`/ingestion/auto-refresh/${id}`, {
        data: { chatbotId: record?.chatbotId },
      });
      if (res.data?.success) {
        toast.success("Removed");
        setRefreshRecords((p) => p.filter((r) => r.id !== id));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    } finally {
      setRefreshLoaderFor(id, null);
    }
  };

  const handleRefreshTrigger = async (id) => {
    if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
    const record = refreshRecords.find((r) => r.id === id);
    try {
      setRefreshLoaderFor(id, "trigger");
      const res = await api.post(`/ingestion/auto-refresh/${id}/trigger`, {
        chatbotId: record?.chatbotId,
      });
      if (res.data?.success) {
        toast.success("Refresh triggered — running in background");
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to trigger refresh");
    } finally {
      setRefreshLoaderFor(id, null);
    }
  };

  // Auto-Scan Handlers
  const fetchScanRecords = useCallback(async () => {
    if (!chatbotId) return;
    if (isStarterPlanUser || !autoScanSupported) {
      setScanLoading(false);
      return;
    }
    try {
      setScanLoading(true);
      const res = await api.get(`/ingestion/auto-scan`, { params: { chatbotId } });
      if (res.data?.success) setScanRecords(res.data.data?.records || []);
    } catch {
      toast.error("Failed to load auto-scan records");
    } finally {
      setScanLoading(false);
    }
  }, [chatbotId, isStarterPlanUser, autoScanSupported]);

  useEffect(() => {
    fetchScanRecords();
  }, [fetchScanRecords]);

  const handleScanRefresh = async () => {
    if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
    if (scanCooldown > 0) return;
    setScanLoading(true);
    setScanCooldown(5);
    await fetchScanRecords();
    setScanLoading(false);
    toast.success("Refreshed");
  };

  const setScanLoaderFor = (id, val) =>
    setScanActionLoading((p) => ({ ...p, [id]: val }));

  const handleScanPause = async (id) => {
    if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
    try {
      setScanLoaderFor(id, "pause");
      const res = await api.patch(`/ingestion/auto-scan/${id}/pause`, {});
      if (res.data?.success) {
        toast.success("Paused");
        setScanRecords((p) => p.map((r) => (r.id === id ? { ...r, status: "PAUSED" } : r)));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pause");
    } finally {
      setScanLoaderFor(id, null);
    }
  };

  const handleScanResume = async (id) => {
    if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
    try {
      setScanLoaderFor(id, "resume");
      const res = await api.patch(`/ingestion/auto-scan/${id}/resume`, {});
      if (res.data?.success) {
        toast.success("Resumed");
        setScanRecords((p) => p.map((r) => (r.id === id ? { ...r, status: "ACTIVE" } : r)));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resume");
    } finally {
      setScanLoaderFor(id, null);
    }
  };

  const handleScanDelete = async (id) => {
    if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
    if (!confirm("Remove this auto-scan job permanently?")) return;
    try {
      setScanLoaderFor(id, "delete");
      const res = await api.delete(`/ingestion/auto-scan/${id}`, {});
      if (res.data?.success) {
        toast.success("Removed");
        setScanRecords((p) => p.filter((r) => r.id !== id));
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    } finally {
      setScanLoaderFor(id, null);
    }
  };

  const handleScanTrigger = async (id) => {
    if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
    try {
      setScanLoaderFor(id, "trigger");
      const res = await api.post(`/ingestion/auto-scan/${id}/trigger`, {});
      if (res.data?.success) {
        toast.success("Scan triggered — running in background");
      } else toast.error(res.data?.message || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to trigger scan");
    } finally {
      setScanLoaderFor(id, null);
    }
  };

  const handleViewDiscovered = (record) => {
    setDiscoveredUrlsModal({ isOpen: true, record });
  };

  const activeRefreshCount = refreshRecords.filter((r) => r.status === "ACTIVE").length;
  const pausedRefreshCount = refreshRecords.filter((r) => r.status === "PAUSED").length;
  const activeScanCount = scanRecords.filter((r) => r.status === "ACTIVE").length;
  const pausedScanCount = scanRecords.filter((r) => r.status === "PAUSED").length;

  return (
    <TooltipProvider>
      <LoadingBar color="#3b82f6" ref={loadingBarRef} shadow />
      <div className="flex h-full flex-col">
        <PanelNavbar items={[{ label: "Auto Sync" }]} />
        <div className={`relative flex-1 space-y-6 p-4 pt-6 md:p-8`}>{/* ${isStarterPlanUser ? "blur-sm pointer-events-none" : ""} */}
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              Auto Sync
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage automatic refresh and discovery of sources
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="refresh" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="refresh" data-tour="auto-sync-tab-refresh">Auto-Refresh</TabsTrigger>
              <TabsTrigger value="scan" data-tour="auto-sync-tab-scan">Auto-Scan</TabsTrigger>
            </TabsList>

            {/* AUTO-REFRESH TAB */}
            <TabsContent value="refresh" className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Auto-Refresh Jobs</h3>
                  <p className="text-xs text-slate-500 mt-1">Re-ingest sources on a schedule</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex h-9 items-center gap-2 px-3 font-medium text-slate-500 hover:text-slate-700"
                        onClick={handleRefreshRefresh}
                        disabled={refreshLoading || refreshCooldown > 0}
                      >
                        {refreshCooldown > 0 ? (
                          <span className="text-[11px] font-bold tracking-wider">{refreshCooldown}s</span>
                        ) : (
                          <RefreshCw className={`h-4 w-4 ${refreshLoading ? "animate-spin" : ""}`} />
                        )}
                        <span>Refresh</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : "Refresh list"}
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    className="border-0 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      if (!hasAccess) { showNoSubscriptionNotification(); return; }
                      if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
                      setIsRefreshEnrollOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Sources
                  </Button>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Active</p>
                    {refreshLoading ? (
                      <Skeleton className="mt-1 h-7 w-8" />
                    ) : (
                      <p className="text-xl font-bold text-slate-700">{activeRefreshCount}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400">
                    <PauseCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Paused</p>
                    {refreshLoading ? (
                      <Skeleton className="mt-1 h-7 w-8" />
                    ) : (
                      <p className="text-xl font-bold text-slate-700">{pausedRefreshCount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm" data-tour="auto-sync-refresh-jobs">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="text-xs font-semibold text-slate-500">SOURCE</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">TYPE</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">FREQUENCY</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">STATUS</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">NEXT REFRESH</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">LAST REFRESHED</TableHead>
                        <TableHead className="w-[56px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refreshLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : refreshRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <CalendarClock className="h-10 w-10 text-slate-300" />
                              <p className="text-sm">No auto-refresh jobs yet</p>
                              <Button
                                size="sm"
                                className="mt-1 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => {
                                  if (!hasAccess) { showNoSubscriptionNotification(); return; }
                                  if (isStarterPlanUser || !autoRefreshSupported) { showNotification("autoRefreshData"); return; }
                                  setIsRefreshEnrollOpen(true);
                                }}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Enroll your first source
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        refreshRecords.map((record) => {
                          const busy = refreshActionLoading[record.id];
                          return (
                            <TableRow key={record.id} className="hover:bg-slate-50/80">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {SOURCE_ICON[record.sourceType] ?? (
                                    <Globe className="h-4 w-4 text-blue-500" />
                                  )}
                                  <span className="max-w-[280px] truncate text-[13px] font-medium text-slate-700">
                                    {record.sourceUrl}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-slate-200 text-[11px] font-medium text-slate-500">
                                  {SOURCE_LABEL[record.sourceType] ?? record.sourceType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[11px] font-medium text-blue-600">
                                  {FREQ_LABEL[record.frequency] ?? record.frequency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {record.status === "ACTIVE" ? (
                                  <Badge variant="outline" className="border-emerald-200 bg-white font-medium text-emerald-600">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-200 bg-white font-medium text-amber-500">
                                    Paused
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help">
                                    {timeAgo(record.nextRefreshAt)}
                                  </TooltipTrigger>
                                  <TooltipContent className="border-none bg-[#222] text-white">
                                    {formatDate(record.nextRefreshAt)}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">
                                {record.lastRefreshedAt ? (
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                      {timeAgo(record.lastRefreshedAt)}
                                    </TooltipTrigger>
                                    <TooltipContent className="border-none bg-[#222] text-white">
                                      {formatDate(record.lastRefreshedAt)}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-slate-400">Never</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                      disabled={!!busy}
                                    >
                                      {busy ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      className="cursor-pointer gap-2 text-[13px]"
                                      onClick={() => handleRefreshTrigger(record.id)}
                                    >
                                      <Zap className="h-3.5 w-3.5 text-blue-500" />
                                      Refresh now
                                    </DropdownMenuItem>
                                    {record.status === "ACTIVE" ? (
                                      <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-[13px]"
                                        onClick={() => handleRefreshPause(record.id)}
                                      >
                                        <Pause className="h-3.5 w-3.5 text-amber-500" />
                                        Pause
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-[13px]"
                                        onClick={() => handleRefreshResume(record.id)}
                                      >
                                        <Play className="h-3.5 w-3.5 text-emerald-500" />
                                        Resume
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer gap-2 text-[13px] text-red-500 focus:text-red-500"
                                      onClick={() => handleRefreshDelete(record.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* AUTO-SCAN TAB */}
            <TabsContent value="scan" className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Auto-Scan Jobs</h3>
                  <p className="text-xs text-slate-500 mt-1">Discover and ingest URLs from sitemaps</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex h-9 items-center gap-2 px-3 font-medium text-slate-500 hover:text-slate-700"
                        onClick={handleScanRefresh}
                        disabled={scanLoading || scanCooldown > 0}
                      >
                        {scanCooldown > 0 ? (
                          <span className="text-[11px] font-bold tracking-wider">{scanCooldown}s</span>
                        ) : (
                          <RefreshCw className={`h-4 w-4 ${scanLoading ? "animate-spin" : ""}`} />
                        )}
                        <span>Refresh</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {scanCooldown > 0 ? `Wait ${scanCooldown}s` : "Refresh list"}
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    className="border-0 bg-blue-600 text-white hover:bg-blue-700"
                    data-tour="auto-sync-add-sitemap"
                    onClick={() => {
                      if (!hasAccess) { showNoSubscriptionNotification(); return; }
                      if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
                      setIsScanEnrollOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Sitemap
                  </Button>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Active</p>
                    {scanLoading ? (
                      <Skeleton className="mt-1 h-7 w-8" />
                    ) : (
                      <p className="text-xl font-bold text-slate-700">{activeScanCount}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-400">
                    <PauseCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Paused</p>
                    {scanLoading ? (
                      <Skeleton className="mt-1 h-7 w-8" />
                    ) : (
                      <p className="text-xl font-bold text-slate-700">{pausedScanCount}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm" data-tour="auto-sync-scan-jobs">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="text-xs font-semibold text-slate-500">SITEMAP URL</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">FREQUENCY</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">STATUS</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">DISCOVERED</TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500">LAST SCAN</TableHead>
                        <TableHead className="w-[56px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 6 }).map((__, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : scanRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <Link2 className="h-10 w-10 text-slate-300" />
                              <p className="text-sm">No auto-scan jobs yet</p>
                              <Button
                                size="sm"
                                className="mt-1 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => {
                                  if (!hasAccess) { showNoSubscriptionNotification(); return; }
                                  if (isStarterPlanUser || !autoScanSupported) { showNotification("autoScanData"); return; }
                                  setIsScanEnrollOpen(true);
                                }}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add your first sitemap
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        scanRecords.map((record) => {
                          const busy = scanActionLoading[record.id];
                          const discoveredCount = (record.discoveredUrls || []).length;
                          const ingestedCount = (record.ingestedUrls || []).length;
                          return (
                            <TableRow key={record.id} className="hover:bg-slate-50/80">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-blue-500" />
                                  <span className="max-w-[280px] truncate text-[13px] font-medium text-slate-700">
                                    {record.sitemapUrl}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[11px] font-medium text-blue-600">
                                  {FREQ_LABEL[record.frequency] ?? record.frequency}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {record.status === "ACTIVE" ? (
                                  <Badge variant="outline" className="border-emerald-200 bg-white font-medium text-emerald-600">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-200 bg-white font-medium text-amber-500">
                                    Paused
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">
                                <Tooltip>
                                  <TooltipTrigger className="cursor-help">
                                    {discoveredCount} discovered
                                  </TooltipTrigger>
                                  <TooltipContent className="border-none bg-[#222] text-white">
                                    {ingestedCount} ingested
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="text-[13px] text-slate-600">
                                {record.lastScannedAt ? (
                                  <Tooltip>
                                    <TooltipTrigger className="cursor-help">
                                      {timeAgo(record.lastScannedAt)}
                                    </TooltipTrigger>
                                    <TooltipContent className="border-none bg-[#222] text-white">
                                      {formatDate(record.lastScannedAt)}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-slate-400">Never</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                      disabled={!!busy}
                                    >
                                      {busy ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      className="cursor-pointer gap-2 text-[13px]"
                                      onClick={() => handleScanTrigger(record.id)}
                                    >
                                      <Zap className="h-3.5 w-3.5 text-blue-500" />
                                      Scan now
                                    </DropdownMenuItem>
                                    {discoveredCount > ingestedCount && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="cursor-pointer gap-2 text-[13px]"
                                          onClick={() => handleViewDiscovered(record)}
                                        >
                                          <Link2 className="h-3.5 w-3.5 text-purple-500" />
                                          View URLs
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    {record.status === "ACTIVE" ? (
                                      <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-[13px]"
                                        onClick={() => handleScanPause(record.id)}
                                      >
                                        <Pause className="h-3.5 w-3.5 text-amber-500" />
                                        Pause
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-[13px]"
                                        onClick={() => handleScanResume(record.id)}
                                      >
                                        <Play className="h-3.5 w-3.5 text-emerald-500" />
                                        Resume
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer gap-2 text-[13px] text-red-500 focus:text-red-500"
                                      onClick={() => handleScanDelete(record.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* {isStarterPlanUser && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg text-center max-w-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Lock className="h-7 w-7 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-800">Features not available</h3>
                <p className="text-sm text-slate-500">
                  Auto Refresh and Auto Scan are available on the Growth and Scale plans. Upgrade your plan to use these features.
                </p>
              </div>
              <Button className="mt-2 bg-blue-600 text-white hover:bg-blue-700">
                Upgrade Plan
              </Button>
            </div>
          </div>
        )} */}
      </div>

      <EnrollModal
        isOpen={isRefreshEnrollOpen}
        onClose={setIsRefreshEnrollOpen}
        onEnrolled={fetchRefreshRecords}
      />

      <ScanModal
        isOpen={isScanEnrollOpen}
        onClose={setIsScanEnrollOpen}
        onEnrolled={fetchScanRecords}
      />

      <DiscoveredUrlsModal
        isOpen={discoveredUrlsModal.isOpen}
        onClose={() => setDiscoveredUrlsModal({ isOpen: false, record: null })}
        record={discoveredUrlsModal.record}
        onIngestComplete={() => {
          fetchScanRecords();
          setDiscoveredUrlsModal({ isOpen: false, record: null });
        }}
      />
    </TooltipProvider>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useChatbot } from "@/context/ChatbotContext";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Archive,
  Trash2,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import LeadDetailsSheet from "./LeadDetailsSheet";

const CurrentLeadsTab = () => {
  const { selectedChatbot } = useChatbot();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalVisitors: 0,
    pages: 1,
  });
  const [search, setSearch] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [filter, setFilter] = useState("all");

  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorThreads, setVisitorThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [threadPagination, setThreadPagination] = useState({
    page: 1,
    hasMore: false,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (selectedChatbot?.id || selectedChatbot?.chatbotId) {
      fetchLeads();
    }
  }, [selectedChatbot, pagination.page, filter]);

  const fetchLeads = async () => {
    if (leads.length === 0) {
      setLoading(true);
    }
    setIsFetching(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;

      const endpoint = search
        ? `/leads/${chatbotId}/search`
        : `/leads/${chatbotId}/verified-visitors`;

      const params = search
        ? { q: search, page: pagination.page, limit: pagination.limit }
        : { page: pagination.page, limit: pagination.limit };

      if (filter === "important") params.important = true;
      if (filter === "archived") params.achieved = true;

      const response = await api.get(endpoint, { params });

      if (response.data.success) {
        setLeads(response.data.data.visitors);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
          totalVisitors: response.data.data.totalVisitors,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
      setIsFetching(false);
      // Set 5 second cooldown
      setCooldown(5);
    }
  };

  const handleViewLead = async (visitor) => {
    setSelectedVisitor(visitor);
    setLoadingThreads(true);
    setVisitorThreads([]);
    setThreadPagination({ page: 1, hasMore: false });

    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const response = await api.get(
        `/leads/${chatbotId}/visitor/${visitor.id}/threads`,
        { params: { page: 1, limit: 10 } },
      );
      if (response.data.success) {
        setVisitorThreads(response.data.data.threads);
        setThreadPagination({
          page: 1,
          hasMore:
            response.data.data.pagination.page <
            response.data.data.pagination.pages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch visitor threads", error);
      toast.error("Failed to fetch visitor threads");
    } finally {
      setLoadingThreads(false);
    }
  };

  const handleLoadMoreThreads = async () => {
    if (!selectedVisitor || !threadPagination.hasMore || loadingThreads) return;

    setLoadingThreads(true);
    const nextPage = threadPagination.page + 1;

    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const response = await api.get(
        `/leads/${chatbotId}/visitor/${selectedVisitor.id}/threads`,
        { params: { page: nextPage, limit: 10 } },
      );

      if (response.data.success) {
        setVisitorThreads((prev) => [...prev, ...response.data.data.threads]);
        setThreadPagination({
          page: nextPage,
          hasMore: nextPage < response.data.data.pagination.pages,
        });
      }
    } catch (error) {
      console.error("Failed to load more threads", error);
      toast.error("Failed to load more threads");
    } finally {
      setLoadingThreads(false);
    }
  };

  const handleUpdateVisitor = async (visitorId, updateData) => {
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const response = await api.patch(
        `/leads/${chatbotId}/visitor/${visitorId}`,
        updateData,
      );

      if (response.data.success) {
        toast.success("Visitor updated successfully");

        setLeads((prevLeads) => {
          // Remove from list if it no longer matches current filter
          if (
            filter === "important" &&
            updateData.important !== undefined &&
            !updateData.important
          ) {
            return prevLeads.filter((lead) => lead.id !== visitorId);
          }
          if (
            filter === "archived" &&
            updateData.achieved !== undefined &&
            !updateData.achieved
          ) {
            return prevLeads.filter((lead) => lead.id !== visitorId);
          }

          // Normal update
          return prevLeads.map((lead) =>
            lead.id === visitorId ? { ...lead, ...updateData } : lead,
          );
        });

        // Synchronize selectedVisitor if it's the one being updated
        if (selectedVisitor?.id === visitorId) {
          setSelectedVisitor((prev) => ({ ...prev, ...updateData }));
        }

        // Update total count only when we actually removed something
        if (
          (filter === "important" &&
            updateData.important !== undefined &&
            !updateData.important) ||
          (filter === "archived" &&
            updateData.achieved !== undefined &&
            !updateData.achieved)
        ) {
          setPagination((prev) => ({
            ...prev,
            totalVisitors: Math.max(0, prev.totalVisitors - 1),
          }));
        }
      }
    } catch (error) {
      console.error("Failed to update visitor", error);
      toast.error("Failed to update visitor");
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const response = await api.delete(
        `/leads/${chatbotId}/visitor/${visitorId}`,
      );
      if (response.data.success) {
        toast.success("Visitor deleted successfully");
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => lead.id !== visitorId),
        );
        setPagination((prev) => ({
          ...prev,
          totalVisitors: prev.totalVisitors - 1,
        }));
      }
    } catch (error) {
      console.error("Failed to delete visitor", error);
      toast.error("Failed to delete visitor");
    }
  };

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < leads.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDownloadSelected = () => {
    const selected = leads.filter((l) => selectedIds.includes(l.id));
    const csv = [
      ["Name", "Email", "Sessions", "Views", "Messages", "First Seen", "Last Seen", "Important", "Archived"],
      ...selected.map((l) => [
        l.name || "Guest User",
        l.email || "",
        l.totalSessions || 0,
        l.totalPageViews || 0,
        l.totalMessages || 0,
        l.firstSeenAt || l.createdAt || "",
        l.lastSeenAt || l.updatedAt || "",
        l.important ? "Yes" : "No",
        l.achieved ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpdate = async (updateData) => {
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      await Promise.all(
        selectedIds.map((id) =>
          api.patch(`/leads/${chatbotId}/visitor/${id}`, updateData),
        ),
      );
      toast.success("Leads updated successfully");
      setLeads((prev) =>
        prev.map((l) =>
          selectedIds.includes(l.id) ? { ...l, ...updateData } : l,
        ),
      );
      setSelectedIds([]);
    } catch {
      toast.error("Failed to update leads");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected lead(s)?`)) return;
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      await Promise.all(
        selectedIds.map((id) =>
          api.delete(`/leads/${chatbotId}/visitor/${id}`),
        ),
      );
      toast.success("Leads deleted successfully");
      setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setPagination((prev) => ({
        ...prev,
        totalVisitors: Math.max(0, prev.totalVisitors - selectedIds.length),
      }));
      setSelectedIds([]);
    } catch {
      toast.error("Failed to delete leads");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const colors = [
    "bg-red-100 text-red-600",
    "bg-orange-100 text-orange-600",
    "bg-amber-100 text-amber-600",
    "bg-yellow-100 text-yellow-600",
    "bg-lime-100 text-lime-600",
    "bg-green-100 text-green-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-sky-100 text-sky-600",
    "bg-blue-100 text-blue-600",
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-purple-100 text-purple-600",
    "bg-fuchsia-100 text-fuchsia-600",
    "bg-pink-100 text-pink-600",
    "bg-rose-100 text-rose-600",
  ];

  const getColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full items-center gap-4 sm:w-auto">
            {/* Refresh Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              disabled={loading || isFetching || cooldown > 0}
              className="h-9 gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading || isFetching ? "animate-spin" : ""}`}
              />
              {loading || isFetching
                ? "Refreshing..."
                : cooldown > 0
                  ? `Wait ${cooldown}s`
                  : "Refresh"}
            </Button>
          </div>

          {/* Search */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex w-full items-center gap-2 sm:w-auto">
              <div className="relative w-full sm:w-[350px]">
                <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  placeholder="Search leads by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchLeads();
                    }
                  }}
                  className="h-10 w-full pl-9"
                />
              </div>
              <Button
                type="button"
                className="h-10 bg-blue-600 px-4 text-white hover:bg-blue-700"
                onClick={fetchLeads}
                disabled={loading || isFetching}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 border-dashed capitalize"
              >
                {filter === "all" ? "All Statuses" : filter} (
                {pagination.totalVisitors}){" "}
                <Filter className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setFilter("important");
                  setSearch("");
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                Important
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setFilter("archived");
                  setSearch("");
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {filter !== "all" && (
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                setFilter("all");
                setPagination((p) => ({ ...p, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div
          className="overflow-hidden rounded-xl border bg-white shadow-sm"
          data-tour="leads-table"
        >
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px] pl-4">
                  <Checkbox
                    className="translate-y-[2px] cursor-pointer"
                    checked={allSelected}
                    data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  NAME
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  EMAIL
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  SESSIONS
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  VIEWS
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  MSGS
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  FIRST SEEN
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  LAST SEEN
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse">
                      <TableCell className="pl-4">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="pr-6 text-right"></TableCell>
                    </TableRow>
                  ))
                : leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className={`group transition-all hover:bg-slate-50/50 ${isFetching ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          className="translate-y-[2px] cursor-pointer"
                          checked={selectedIds.includes(lead.id)}
                          onCheckedChange={() => toggleSelectOne(lead.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarFallback
                              className={`${getColor(lead.name || "Guest")} font-semibold`}
                            >
                              {getInitials(lead.name || "Guest")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {lead.name || "Guest User"}
                            </span>
                            {lead.visitorHash && (
                              <span
                                className="text-muted-foreground mt-0.5 max-w-[150px] truncate text-xs"
                                title={lead.visitorHash}
                              >
                                {lead.visitorHash}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {lead.email || "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {lead.totalSessions || 0}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {lead.totalPageViews || 0}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {lead.totalMessages || 0}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <span className="whitespace-nowrap">
                          {timeAgo(lead.firstSeenAt || lead.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <span className="whitespace-nowrap">
                          {timeAgo(lead.lastSeenAt || lead.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                onClick={() => handleViewLead(lead)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Threads</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  lead.important
                                    ? "text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600"
                                    : "text-slate-500 hover:bg-yellow-50 hover:text-yellow-500"
                                }`}
                                onClick={() =>
                                  handleUpdateVisitor(lead.id, {
                                    important: !lead.important,
                                  })
                                }
                              >
                                <Star
                                  className={`h-4 w-4 ${lead.important ? "fill-current" : ""}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {lead.important
                                ? "Remove Important"
                                : "Mark Important"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${
                                  lead.achieved
                                    ? "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
                                    : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-500"
                                }`}
                                onClick={() =>
                                  handleUpdateVisitor(lead.id, {
                                    achieved: !lead.achieved,
                                  })
                                }
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {lead.achieved ? "Unarchive" : "Archive"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteVisitor(lead.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Lead</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              {!loading && leads.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-muted-foreground h-32 text-center"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-muted-foreground text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalVisitors,
            )}{" "}
            of {pagination.totalVisitors} leads
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(pagination.pages || 0)].map((_, i) => {
              const p = i + 1;
              if (
                pagination.pages > 5 &&
                Math.abs(p - pagination.page) > 2 &&
                p !== 1 &&
                p !== pagination.pages
              ) {
                if (Math.abs(p - pagination.page) === 3)
                  return (
                    <span key={p} className="px-2">
                      ...
                    </span>
                  );
                return null;
              }
              return (
                <Button
                  key={p}
                  variant={pagination.page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(p)}
                  className={pagination.page === p ? "bg-blue-600" : ""}
                >
                  {p}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {selectedIds.length > 0 && (
          <div className="animate-in slide-in-from-bottom-2 fade-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-white p-2 shadow-lg duration-300">
            <div className="mr-2 flex items-center gap-2 border-r px-2 pr-4">
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                {selectedIds.length}
              </span>
              <span className="hidden text-sm font-medium sm:inline-block">selected</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSelected}
                  className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download selected as CSV</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkUpdate({ important: true })}
                  className="h-8 text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600"
                >
                  <Star className="mr-1.5 h-4 w-4" />
                  Mark Important
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark selected as important</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkUpdate({ achieved: true })}
                  className="h-8 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Archive className="mr-1.5 h-4 w-4" />
                  Archive
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive selected leads</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected leads</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="ml-1 h-8 text-slate-400 hover:text-slate-600"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Visitor Details Sheet */}
        <LeadDetailsSheet
          open={!!selectedVisitor}
          onOpenChange={(open) => !open && setSelectedVisitor(null)}
          visitor={selectedVisitor}
          threads={visitorThreads}
          loadingThreads={loadingThreads}
          hasMoreThreads={threadPagination.hasMore}
          onLoadMoreThreads={handleLoadMoreThreads}
          onUpdateVisitor={handleUpdateVisitor}
          chatbotId={selectedChatbot?.id || selectedChatbot?.chatbotId}
        />
      </div>
    </TooltipProvider>
  );
};

export default CurrentLeadsTab;

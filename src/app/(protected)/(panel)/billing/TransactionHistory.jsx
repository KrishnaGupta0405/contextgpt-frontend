"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Receipt, FileText, ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp, Info, RotateCcw } from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [reactivateLoading, setReactivateLoading] = useState(false);

  const handleReactivate = async () => {
    setReactivateLoading(true);
    try {
      await api.post("/billing/subscription/reactivate");
      toast.success("Subscription reactivated — you will continue to be billed normally.");
      await fetchTransactions(page, pageSize);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reactivate subscription.");
    } finally {
      setReactivateLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fetchTransactions = async (pageNum = 0, size = pageSize) => {
    try {
      setLoading(true);
      const txnResponse = await api.get(
        `/billing/transactions?limit=${size}&offset=${pageNum * size}`
      );
      console.log(txnResponse);
      if (txnResponse?.data?.success) {
        setTransactions(txnResponse.data.data.transactions || []);
        setTotalCount(txnResponse.data.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load billing history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, pageSize);
  }, [page, pageSize]);

  const formatDate = (dateString, formatStr = "MMM dd, yyyy") => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), formatStr);
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount || 0);
  };

  const getPlanName = (planStr) => {
    if (!planStr) return "Free Plan";
    return planStr
      .replace(/_/g, " ")
      .replace("pri ", "")
      .replace("montly", "monthly")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (status, isTrial = false) => {
    if (isTrial && status?.toLowerCase() === "active") {
      return (
        <Badge className="border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Trial
        </Badge>
      );
    }

    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
            Completed
          </Badge>
        );
      case "active":
        return (
          <Badge className="border-green-200 bg-green-100 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="border-red-200 bg-red-100 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            Failed
          </Badge>
        );
      case "canceled":
      case "cancelled":
        return (
          <Badge className="border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // F5: Fetch fresh invoice URL from backend proxy
  const handleInvoiceDownload = async (txnId) => {
    try {
      const res = await api.get(`/billing/invoices/${txnId}`);
      const url = res.data?.data?.invoiceUrl;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Invoice not available");
      }
    } catch {
      toast.error("Failed to fetch invoice");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Receipt className="text-primary h-5 w-5" />
              Transaction History
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-0 p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b px-2 py-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-muted/5 py-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Receipt className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium">No transactions found</h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm text-balance">
              Your billing history will appear here once you make your first
              payment or start a subscription.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const isExpanded = expandedRows.has(txn.id);
                    const sub = txn.subscription;
                    const isCancelled =
                      sub?.canceledAt || sub?.subscriptionStatus === "canceled" || sub?.subscriptionStatus === "cancelled";

                    return (
                      <React.Fragment key={txn.id}>
                        <TableRow
                          className="group hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => sub && toggleRow(txn.id)}
                        >
                          <TableCell className="pl-6 font-medium whitespace-nowrap">
                            {formatDate(txn.createdAt)}
                            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs font-normal">
                              <span>
                                {formatDate(txn.billingPeriodStart, "MMM dd")} -{" "}
                                {formatDate(txn.billingPeriodEnd, "MMM dd, yyyy")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start">
                              <span className="flex items-center gap-2 text-sm font-medium capitalize">
                                {getPlanName(txn.type)}
                                {sub?.isTrial && (
                                  <Badge
                                    variant="outline"
                                    className="h-4 border-blue-200 bg-blue-50/50 px-1.5 py-0 text-[10px] text-blue-600 dark:border-blue-800 dark:text-blue-400"
                                  >
                                    Trial
                                  </Badge>
                                )}
                              </span>
                              <span className="text-muted-foreground mt-0.5 text-xs capitalize">
                                {txn.billingInterval || sub?.billingInterval}{" "}
                                billing
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-base font-semibold">
                            {formatCurrency(txn.amount, txn.currency)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-[10px]">Txn</span>
                                {getStatusBadge(txn.status, sub?.isTrial)}
                              </div>
                              {sub?.subscriptionStatus && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground text-[10px]">Sub</span>
                                  {getStatusBadge(sub.subscriptionStatus)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="text-muted-foreground flex justify-end items-center gap-2">
                              {(txn.providerTransactionId || txn.paddleTransactionId) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:text-primary h-8 gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvoiceDownload(txn.id);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden sm:inline">Invoice</span>
                                </Button>
                              )}
                              {!txn.receiptUrl && !txn.providerTransactionId && !txn.paddleTransactionId && (
                                <span className="px-2 py-1 text-xs italic">N/A</span>
                              )}
                              {sub && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(txn.id);
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && sub && (
                          <TableRow className="hover:bg-transparent border-0">
                            <TableCell colSpan={5} className="p-0">
                              <div className="bg-muted/20 dark:bg-muted/10 border-y px-8 py-4 text-sm space-y-2 w-full">
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-3">
                                  Subscription Details
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                  <div className="flex justify-between sm:justify-start sm:gap-2">
                                    <span className="text-muted-foreground">Subscription started from</span>
                                    <span className="font-medium">{formatDate(sub.currentPeriodStart, "MMM dd, yyyy")}</span>
                                  </div>
                                  <div className="flex justify-between sm:justify-start sm:gap-2 items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      Subscription ends at
                                      {isCancelled && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="h-3.5 w-3.5 text-yellow-500 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs text-xs">
                                              Subscription has been cancelled — the end date no longer carries significance.
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </span>
                                    <span className="font-medium">{formatDate(sub.currentPeriodEnd, "MMM dd, yyyy")}</span>
                                  </div>
                                  {sub.canceledAt && (
                                    <div className="flex justify-between sm:justify-start sm:gap-2">
                                      <span className="text-muted-foreground">Subscription cancelled at</span>
                                      <span className="font-medium text-red-500">{formatDate(sub.canceledAt, "MMM dd, yyyy")}</span>
                                    </div>
                                  )}
                                  {!sub.canceledAt && sub.nextBilledAt && (
                                    <div className="flex justify-between sm:justify-start sm:gap-2">
                                      <span className="text-muted-foreground">Next billing at</span>
                                      <span className="font-medium">{formatDate(sub.nextBilledAt, "MMM dd, yyyy")}</span>
                                    </div>
                                  )}
                                </div>
                                {sub.cancelAtPeriodEnd && !sub.canceledAt && sub.subscriptionStatus?.toLowerCase() === "active" && (
                                  <div className="mt-3 flex flex-col gap-2 rounded-md border border-orange-200 bg-orange-50/60 px-3 py-2 dark:border-orange-800 dark:bg-orange-900/20">
                                    <div className="flex items-center gap-2">
                                      <Info className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                                      <p className="text-xs text-orange-700 dark:text-orange-400">
                                        Your subscription has been cancelled but remains active until{" "}
                                        <span className="font-semibold">{formatDate(sub.currentPeriodEnd, "MMM dd, yyyy")}</span>.
                                        You will not be charged again.
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="self-start border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                      onClick={handleReactivate}
                                      disabled={reactivateLoading}
                                    >
                                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                      {reactivateLoading ? "Reactivating..." : "Keep Subscription"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">
                  Showing {totalCount === 0 ? 0 : page * pageSize + 1}–
                  {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Rows</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={String(s)} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {(() => {
                    const delta = 2;
                    const start = Math.max(0, Math.min(page - delta, totalPages - 5));
                    const end = Math.min(totalPages - 1, start + 4);
                    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                    return (
                      <>
                        {start > 0 && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(0)}>1</Button>
                            {start > 1 && <span className="text-muted-foreground px-0.5 text-sm">…</span>}
                          </>
                        )}
                        {pages.map((i) => (
                          <Button
                            key={i}
                            variant={i === page ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0 text-xs"
                            onClick={() => setPage(i)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        {end < totalPages - 1 && (
                          <>
                            {end < totalPages - 2 && <span className="text-muted-foreground px-0.5 text-sm">…</span>}
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>
                          </>
                        )}
                      </>
                    );
                  })()}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

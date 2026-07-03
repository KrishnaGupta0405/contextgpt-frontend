"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePlanUpgradeNotification } from "@/components/PlanUpgradeNotification";

function KeyRow({ apiKey, onRevoke }) {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("API key copied to clipboard");
  };

  const handleRevoke = async () => {
    if (!confirm(`Revoke key "${apiKey.keyName}"? This cannot be undone.`))
      return;
    setRevoking(true);
    try {
      const res = await api.delete(`/usage/api-keys/revoke/${apiKey.id}`);
      if (res?.data?.success) {
        toast.success("API key revoked successfully");
        onRevoke(apiKey.id);
      }
    } catch (err) {
      console.error("Error revoking key:", err);
      toast.error("Failed to revoke API key");
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col justify-between gap-3 border-b py-4 last:border-b-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-medium">{apiKey.keyName}</span>
          {apiKey.isActive ? (
            <Badge className="border-green-300 bg-green-50 text-[10px] text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-muted-foreground text-[10px]"
            >
              Revoked
            </Badge>
          )}
        </div>
        {apiKey.keyDesc && (
          <p className="text-muted-foreground mb-1.5 text-xs">
            {apiKey.keyDesc}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          <code className="bg-muted text-muted-foreground rounded px-2 py-0.5 font-mono text-xs">
            {apiKey.apiKey}
          </code>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy key"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <div className="text-muted-foreground mt-1.5 flex gap-3 text-[11px]">
          <span>Created: {formatDate(apiKey.createdAt) ?? "N/A"}</span>
          {apiKey.lastUsedAt && (
            <span>Last used: {formatDate(apiKey.lastUsedAt)}</span>
          )}
          {apiKey.expiresAt && (
            <span>Expires: {formatDate(apiKey.expiresAt)}</span>
          )}
        </div>
      </div>
      {apiKey.isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          onClick={handleRevoke}
          disabled={revoking}
        >
          {revoking ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5 text-xs">Revoke</span>
        </Button>
      )}
    </div>
  );
}

function GenerateKeyDialog({ open, onClose, onGenerated }) {
  const [keyName, setKeyName] = useState("");
  const [keyDesc, setKeyDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!keyName.trim()) return;
    setGenerating(true);
    try {
      const res = await api.post("/usage/api-keys/generate", {
        keyName: keyName.trim(),
        keyDesc: keyDesc.trim(),
      });
      if (res?.data?.success) {
        setGeneratedKey(res.data.data);
        onGenerated(res.data.data);
      }
    } catch (err) {
      console.error("Error generating key:", err);
      toast.error(err.response.data.message);
    } finally {
      setGenerating(false);
    }
  };
  // sk_604877408fa52742b3e7e5dc6df65e2757dbfd041e89fa0ad612cb4b70d528a8
  const handleCopy = () => {
    if (!generatedKey?.apiKey) return;
    navigator.clipboard.writeText(generatedKey.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("API key copied!");
  };

  const handleClose = () => {
    setKeyName("");
    setKeyDesc("");
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            {generatedKey ? "API Key Generated" : "Generate API Key"}
          </DialogTitle>
          <DialogDescription>
            {generatedKey
              ? "Copy and save your API key securely. It won't be shown again."
              : "Create a new API key for accessing the ContextGPT API."}
          </DialogDescription>
        </DialogHeader>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>This key is shown only once. Store it somewhere safe.</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">
                Your new API key
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-xs break-all">
                  {generatedKey.apiKey}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Key Name *</label>
              <Input
                placeholder="e.g. Production Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Optional description for this key"
                value={keyDesc}
                onChange={(e) => setKeyDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={generating || !keyName.trim()}
              >
                {generating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const METHOD_COLORS = {
  GET: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  POST: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  PUT: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  PATCH: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  DELETE: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

function statusColor(code) {
  if (code >= 500) return "text-red-600 dark:text-red-400";
  if (code >= 400) return "text-orange-500 dark:text-orange-400";
  if (code >= 300) return "text-blue-500 dark:text-blue-400";
  return "text-green-600 dark:text-green-400";
}

function ApiLogsSection({ apiKeys, apiAccessSupported, isStarterPlanUser }) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addListener } = useChattingSocket();

  const keyMap = Object.fromEntries(apiKeys.map((k) => [k.id, k.keyName]));

  const fetchLogs = async (offset = 0) => {
    if (isStarterPlanUser || !apiAccessSupported) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/usage/api-keys/get-api-logs", {
        params: { limit: 20, offset },
      });
      if (res?.data?.success) {
        setLogs(res.data.data.logs ?? []);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching API logs:", err);
      setError("Failed to load API logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Real-time API log streaming via WebSocket ──
  // Only prepend while viewing the first page — deeper pages stay stable.
  useEffect(() => {
    if (!addListener) return;
    const remove = addListener("apilogs:updated", ({ log }) => {
      if (pagination.offset !== 0) return;
      setLogs((prev) => [log, ...prev].slice(0, pagination.limit));
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    });
    return remove;
  }, [addListener, pagination.offset, pagination.limit]);

  const page = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              API Request Logs
            </CardTitle>
            <CardDescription className="mt-1">
              Recent requests made using your API keys. The page auto-updates for every new request incoming to the backend
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => fetchLogs(pagination.offset)}
            disabled={loading}
            title="Refresh logs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b px-6 py-3 last:border-b-0">
                <Skeleton className="h-4 w-full rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-6 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button
              onClick={() => fetchLogs(0)}
              className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <Activity className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No logs yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              API requests will appear here once your keys are used.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="border-b bg-muted/40 hidden grid-cols-[1fr_80px_72px_72px_80px_80px_110px] gap-3 px-6 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
              <span>Endpoint</span>
              <span>Method</span>
              <span>Status</span>
              <span>Duration</span>
              <span>Tokens</span>
              <span>Flags</span>
              <span>Time</span>
            </div>

            {/* Rows */}
            <div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-1 gap-1 border-b px-6 py-3 text-xs last:border-b-0 sm:grid-cols-[1fr_80px_72px_72px_80px_80px_110px] sm:items-center sm:gap-3"
                >
                  {/* Endpoint */}
                  <div className="min-w-0">
                    <span className="block truncate font-mono text-[12px] font-medium" title={log.endpoint}>
                      {log.endpoint}
                    </span>
                    {keyMap[log.apiKeyId] && (
                      <span className="text-muted-foreground text-[10px]">
                        Key: {keyMap[log.apiKeyId]}
                      </span>
                    )}
                  </div>

                  {/* Method */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${METHOD_COLORS[log.method] ?? ""}`}
                    >
                      {log.method}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className={`font-mono font-semibold ${statusColor(log.statusCode)}`}>
                    {log.statusCode}
                  </div>

                  {/* Duration */}
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    {log.durationMs != null ? `${log.durationMs}ms` : "—"}
                  </div>

                  {/* Tokens */}
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 flex-shrink-0" />
                    {log.tokensUsed != null ? log.tokensUsed.toLocaleString() : "—"}
                  </div>

                  {/* Flags */}
                  <div className="flex items-center gap-1.5">
                    {log.rateLimited && (
                      <span title="Rate limited">
                        <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
                      </span>
                    )}
                    {log.error && (
                      <span title={log.errorMessage ?? "Error"}>
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      </span>
                    )}
                    {!log.rateLimited && !log.error && (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-muted-foreground text-[10px]">
                    {log.requestTimestamp
                      ? format(new Date(log.requestTimestamp), "MMM d, HH:mm:ss")
                      : "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex items-center justify-between border-t px-6 py-3">
                <span className="text-muted-foreground text-xs">
                  Page {page} of {totalPages} &middot; {pagination.total} total
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={pagination.offset === 0 || loading}
                    onClick={() => fetchLogs(pagination.offset - pagination.limit)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={!pagination.hasMore || loading}
                    onClick={() => fetchLogs(pagination.offset + pagination.limit)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApiKeysPage() {
  const { subscription } = useAuth();
  const { showNotification } = usePlanUpgradeNotification();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const apiAccessSupported = subscription?.apiAccess ?? false;
  const isStarterPlanUser = /^pri_starter_/i.test(subscription?.planType ?? "");

  const fetchKeys = async (p = 1) => {
    if (isStarterPlanUser || !apiAccessSupported) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/usage/api-keys/get-all-api-keys", {
        params: { page: p, limit: 20 },
      });
      if (res?.data?.success) {
        setApiKeys(res.data.data.apiKeys ?? []);
        setPagination(res.data.data.pagination ?? { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRevoke = (id) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isActive: false } : k)),
    );
  };

  const handleGenerated = (newKey) => {
    setApiKeys((prev) => [
      {
        ...newKey,
        // Show masked version in the list
        apiKey:
          newKey.apiKey.substring(0, 10) + "..." + newKey.apiKey.slice(-4),
        isActive: true,
      },
      ...prev,
    ]);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 container mx-auto max-w-4xl space-y-8 px-4 py-8 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link href="/usage">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          </div>
          <p className="text-muted-foreground mt-2 ml-9">
            Manage your API keys for accessing the ContextGPT API.
          </p>
        </div>
        <Button
          onClick={() => {
            if (isStarterPlanUser || !apiAccessSupported) { showNotification("apiAccess"); return; }
            setShowDialog(true);
          }}
          className="flex shrink-0 items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Key
        </Button>
      </div>

      <Separator />

      {/* Keys list */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            Keep your API keys secure. Do not share them in public repositories
            or client-side code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
              <button
                onClick={fetchKeys}
                className="ml-auto flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Key className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                No API keys yet
              </p>
              <p className="text-muted-foreground mt-1 mb-4 text-xs">
                Create your first API key to start using the ContextGPT API.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (isStarterPlanUser || !apiAccessSupported) { showNotification("apiAccess"); return; }
                  setShowDialog(true);
                }}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Generate Key
              </Button>
            </div>
          ) : (
            <>
              <div>
                {apiKeys.map((key) => (
                  <KeyRow key={key.id} apiKey={key} onRevoke={handleRevoke} />
                ))}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-3">
                  <span className="text-muted-foreground text-xs">
                    Page {page} of {pagination.totalPages} · {pagination.total} total
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page === 1 || loading}
                      onClick={() => setPage(Math.max(1, page - 1))}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page >= pagination.totalPages || loading}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <GenerateKeyDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onGenerated={handleGenerated}
      />

      {/* API Logs */}
      <ApiLogsSection apiKeys={apiKeys} apiAccessSupported={apiAccessSupported} isStarterPlanUser={isStarterPlanUser} />
    </div>
  );
}

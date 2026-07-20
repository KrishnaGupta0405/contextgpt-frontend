"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Zap,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useChatbot } from "@/context/ChatbotContext";
import { useChattingSocket } from "@/context/ChattingSocketContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useAuth } from "@/context/AuthContext";
import { usePlanUpgradeNotification } from "@/components/PlanUpgradeNotification";
import { useProductTour } from "@/hooks/use-product-tour";

// ── Constants ──────────────────────────────────────────────────────────────

const ALL_EVENTS = [
  {
    value: "NEW_MESSAGE",
    label: "New Message",
    description: "Fired when an AI or agent message is added to a conversation",
  },
  {
    value: "CONVERSATION_ESCALATED",
    label: "Conversation Escalated",
    description: "Fired when a conversation is escalated to a human agent",
  },
  {
    value: "NEW_LEAD",
    label: "New Lead",
    description: "Fired when a visitor submits their contact info (becomes a lead)",
  },
];

const STATUS_CONFIG = {
  SUCCESS: {
    label: "Success",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  FAILED: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
  RETRYING: {
    label: "Retrying",
    icon: RefreshCw,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ── Delivery Row ───────────────────────────────────────────────────────────

function DeliveryRow({ delivery, onRetry }) {
  const [open, setOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry(delivery.id);
      toast.success("Delivery retriggered");
    } catch {
      toast.error("Failed to retrigger delivery");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center gap-3 rounded-md p-3 hover:bg-muted/50 transition-colors">
          <div className="w-36 shrink-0">
            <StatusBadge status={delivery.status} />
          </div>
          <div className="w-44 shrink-0">
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
              {delivery.eventType}
            </span>
          </div>
          <div className="w-16 shrink-0 text-center text-sm text-muted-foreground">
            {delivery.attemptCount}
          </div>
          <div className="w-20 shrink-0 text-center text-sm text-muted-foreground">
            {delivery.responseStatusCode ?? "—"}
          </div>
          <div className="w-20 shrink-0 text-center text-sm text-muted-foreground">
            {delivery.responseTimeMs != null ? `${delivery.responseTimeMs}ms` : "—"}
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            {delivery.createdAt
              ? format(new Date(delivery.createdAt), "MMM d, HH:mm:ss")
              : "—"}
          </div>
          <div className="flex items-center gap-2">
            {delivery.status === "FAILED" && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                disabled={retrying}
              >
                {retrying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span className="ml-1">Retry</span>
              </Button>
            )}
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mx-3 mb-3 rounded-md border bg-muted/30 p-3 text-xs">
          <div className="mb-2 font-medium text-foreground">Request Payload</div>
          <pre className="overflow-auto rounded bg-background p-2 text-xs max-h-40 font-mono">
            {JSON.stringify(delivery.requestPayload, null, 2)}
          </pre>
          {delivery.responseBody && (
            <>
              <div className="mb-2 mt-3 font-medium text-foreground">Response Body</div>
              <pre className="overflow-auto rounded bg-background p-2 text-xs max-h-24 font-mono">
                {delivery.responseBody}
              </pre>
            </>
          )}
          {delivery.lastErrorMessage && (
            <div className="mt-2 flex items-start gap-1 text-red-600">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{delivery.lastErrorMessage}</span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function WebhooksPage() {
  const { selectedChatbot } = useChatbot();
  const { send, addListener } = useChattingSocket();
  const { markDirty, markClean } = useUnsavedChanges();
  const { subscription } = useAuth();
  const { showNotification } = usePlanUpgradeNotification();
  const { resumeTour } = useProductTour();
  const chatbotId = selectedChatbot?.id;

  // TOUR_LEGS[11] — resumeTour(11) runs it when the Settings leg handed off
  // here, and no-ops otherwise. Same delay as the other legs, giving the
  // events list and delivery log a frame to paint before the overlay lands.
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(11), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);
  const webhookSupported = subscription?.webhookSupport ?? false;
  const isStarterPlan = subscription?.planType?.includes("starter") ?? false;

  // Config state
  const [webhook, setWebhook] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState(
    ALL_EVENTS.map((e) => e.value)
  );
  const [isEnabled, setIsEnabled] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Delivery log state
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  // Test webhook state
  const [testEventType, setTestEventType] = useState("NEW_MESSAGE");
  const [testing, setTesting] = useState(false);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Cleanup on unmount
  useEffect(() => () => markClean(), []);

  // ── Subscribe to socket room when chatbot changes ────────────────────────

  useEffect(() => {
    if (!chatbotId) return;
    send({ type: "subscribe:chatbot", chatbotId });
  }, [chatbotId, send]);

  // ── Real-time delivery updates via WebSocket ─────────────────────────────

  useEffect(() => {
    if (!addListener) return;
    const remove = addListener("webhook:delivery:update", (data) => {
      setDeliveries((prev) => {
        const idx = prev.findIndex((d) => d.id === data.deliveryId);
        if (idx === -1) {
          // New delivery — prepend only if it belongs to current chatbot
          if (data.requestPayload?.data?.chatbotId === chatbotId || !data.requestPayload) {
            return [
              {
                id: data.deliveryId,
                status: data.status,
                eventType: data.eventType,
                attemptCount: 0,
                responseStatusCode: null,
                responseTimeMs: null,
                requestPayload: data.requestPayload,
                createdAt: data.createdAt ?? new Date().toISOString(),
                ...data,
              },
              ...prev,
            ];
          }
          return prev;
        }
        // Update existing row
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...data };
        return updated;
      });
    });
    return remove;
  }, [addListener, chatbotId]);

  // ── Load webhook config ──────────────────────────────────────────────────

  const loadWebhook = useCallback(async () => {
    if (!chatbotId) return;
    if (isStarterPlan) {
      setConfigLoading(false);
      return;
    }
    setConfigLoading(true);
    try {
      const res = await api.get(`/webhooks/${chatbotId}`);
      const data = res?.data?.data;
      setWebhook(data);
      if (data) {
        setUrl(data.url ?? "");
        setSecret(""); // don't pre-fill secret — user must re-enter to change
        setSelectedEvents(data.events ?? ALL_EVENTS.map((e) => e.value));
        setIsEnabled(data.isEnabled ?? true);
      }
    } catch (err) {
      console.error("Failed to load webhook:", err);
    } finally {
      setConfigLoading(false);
    }
  }, [chatbotId, isStarterPlan]);

  useEffect(() => {
    loadWebhook();
  }, [loadWebhook]);

  // ── Load deliveries ──────────────────────────────────────────────────────

  const loadDeliveries = useCallback(async () => {
    if (!chatbotId) return;
    if (isStarterPlan) {
      setDeliveriesLoading(false);
      return;
    }
    setDeliveriesLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (eventTypeFilter) params.eventType = eventTypeFilter;
      const res = await api.get(`/webhooks/${chatbotId}/deliveries`, { params });
      setDeliveries(res?.data?.data?.deliveries ?? []);
      setPagination(res?.data?.data?.pagination ?? { total: 0, pages: 0 });
    } catch (err) {
      console.error("Failed to load deliveries:", err);
    } finally {
      setDeliveriesLoading(false);
    }
  }, [chatbotId, page, statusFilter, eventTypeFilter, isStarterPlan]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, eventTypeFilter]);

  // ── Save webhook ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!webhookSupported || isStarterPlan) {
      showNotification("webhooks");
      return;
    }

    if (!url.trim()) {
      toast.error("Webhook URL is required");
      return;
    }
    if (!webhook && !secret.trim()) {
      toast.error("Secret is required when creating a webhook");
      return;
    }
    if (secret && secret.length < 16) {
      toast.error("Secret must be at least 16 characters");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Select at least one event type");
      return;
    }

    setSaving(true);
    try {
      const body = {
        url: url.trim(),
        events: selectedEvents,
        isEnabled,
      };
      // Only send secret if user typed one (allows update without changing secret)
      if (secret.trim()) body.secret = secret.trim();

      const res = await api.put(`/webhooks/${chatbotId}`, body);
      const isNew = res.status === 201;
      const saved = res?.data?.data;

      setWebhook(saved);
      setSecret(""); // clear after save
      markClean();

      if (isNew) {
        toast.success("Webhook created. Copy the secret — it won't be shown again.", {
          duration: 6000,
        });
      } else {
        toast.success("Webhook updated successfully");
      }

      await loadWebhook();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Failed to save webhook"
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle webhook ───────────────────────────────────────────────────────

  const handleToggle = async (newValue) => {
    if (!webhookSupported || isStarterPlan) {
      showNotification("webhooks");
      return;
    }

    setIsEnabled(newValue); // optimistic
    try {
      await api.patch(`/webhooks/${chatbotId}/toggle`, { isEnabled: newValue });
      setWebhook((prev) => (prev ? { ...prev, isEnabled: newValue } : prev));
      toast.success(newValue ? "Webhook enabled" : "Webhook disabled");
    } catch (err) {
      setIsEnabled(!newValue); // rollback
      toast.error(
        err?.response?.data?.message ?? "Failed to update webhook status"
      );
    }
  };

  // ── Delete webhook ───────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!webhookSupported || isStarterPlan) {
      showNotification("webhooks");
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/webhooks/${chatbotId}`);
      setWebhook(null);
      setUrl("");
      setSecret("");
      setSelectedEvents(ALL_EVENTS.map((e) => e.value));
      setIsEnabled(true);
      setDeliveries([]);
      setDeleteDialogOpen(false);
      markClean();
      toast.success("Webhook deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete webhook");
    } finally {
      setDeleting(false);
    }
  };

  // ── Retry delivery ───────────────────────────────────────────────────────

  const handleRetry = async (deliveryId) => {
    await api.post(`/webhooks/${chatbotId}/deliveries/${deliveryId}/retry`);
    // The status update will come via WebSocket
  };

  // ── Send test webhook ────────────────────────────────────────────────────

  const handleTest = async () => {
    if (!webhookSupported || isStarterPlan) {
      showNotification("webhooks");
      return;
    }

    if (!webhook) {
      toast.error("Save the webhook configuration first");
      return;
    }
    setTesting(true);
    try {
      await api.post(`/webhooks/${chatbotId}/test`, { eventType: testEventType });
      toast.success(`Test "${testEventType}" webhook sent. Check the delivery log below.`);
      // Reload deliveries after a short delay to show the new entry
      setTimeout(() => loadDeliveries(), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to send test webhook");
    } finally {
      setTesting(false);
    }
  };

  // ── Copy secret ──────────────────────────────────────────────────────────

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
    toast.success("Secret copied to clipboard");
  };

  // ── Toggle event selection ────────────────────────────────────────────────

  const toggleEvent = (value) => {
    setSelectedEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  // ── No chatbot selected ───────────────────────────────────────────────────

  if (!chatbotId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Zap className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">Select a chatbot to configure webhooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Zap className="h-6 w-6" />
          Webhooks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Receive real-time POST notifications to your endpoint when events happen
          in <span className="font-medium">{selectedChatbot?.name}</span>.
        </p>
      </div>

      {/* ── Configuration card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook Configuration</CardTitle>
          <CardDescription>
            {webhook
              ? "Update your webhook endpoint. Enter a new secret only if you want to rotate it."
              : "Configure the endpoint that will receive event notifications from this chatbot."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {configLoading ? (
            <div className="space-y-5">
              {/* URL field */}
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>

              {/* Secret field */}
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                </div>
                <Skeleton className="h-3 w-2/3" />
              </div>

              {/* Events checkboxes */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Skeleton className="h-4 w-4 mt-0.5 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Enable toggle row */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 w-36" />
              </div>
            </div>
          ) : (
            <>
              {/* URL */}
              <div className="space-y-1.5">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-server.com/webhook"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); markDirty(); }}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Must be an HTTPS URL. We will POST JSON payloads to this address.
                </p>
              </div>

              {/* Secret */}
              <div className="space-y-1.5">
                <Label htmlFor="webhook-secret">
                  {webhook ? "New Secret (leave blank to keep current)" : "Secret"}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="webhook-secret"
                      type={showSecret ? "text" : "password"}
                      placeholder={
                        webhook
                          ? "Enter new secret to rotate…"
                          : "Min. 16 characters"
                      }
                      value={secret}
                      onChange={(e) => { setSecret(e.target.value); markDirty(); }}
                      className="font-mono text-sm pr-8"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowSecret((v) => !v)}
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {secret && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopySecret}
                      className="shrink-0"
                    >
                      {copiedSecret ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sent as <code className="rounded bg-muted px-1">X-WEBHOOK-TOKEN</code> and
                  used to compute <code className="rounded bg-muted px-1">X-SIGNATURE</code>{" "}
                  (HMAC-SHA256). Copy it now — it won&apos;t be shown again after saving.
                </p>
              </div>

              {/* Event types */}
              <div className="space-y-2" data-tour="webhooks-events">
                <Label>Events to Subscribe</Label>
                <div className="space-y-2">
                  {ALL_EVENTS.map((evt) => (
                    <div key={evt.value} className="flex items-start gap-2.5">
                      <Checkbox
                        id={`event-${evt.value}`}
                        checked={selectedEvents.includes(evt.value)}
                        onCheckedChange={() => { toggleEvent(evt.value); markDirty(); }}
                        className="mt-0.5"
                      />
                      <div>
                        <label
                          htmlFor={`event-${evt.value}`}
                          className="cursor-pointer text-sm font-medium leading-none"
                        >
                          {evt.label}
                        </label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Enable Webhook</p>
                  <p className="text-xs text-muted-foreground">
                    Disable to pause delivery without deleting the configuration
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggle}
                  disabled={!webhook}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                  <GatedAction>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {webhook ? "Update Webhook" : "Create Webhook"}
                    </Button>
                  </GatedAction>
                  {webhook && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (!webhookSupported || isStarterPlan) {
                          showNotification("webhooks");
                        } else {
                          setDeleteDialogOpen(true);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>

                {/* Test webhook */}
                {webhook && (
                  <div className="flex items-center gap-2">
                    <Select value={testEventType} onValueChange={setTestEventType}>
                      <SelectTrigger className="h-9 w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_EVENTS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={handleTest}
                      disabled={testing || !webhook?.isEnabled}
                    >
                      {testing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send Test
                    </Button>
                  </div>
                )}
              </div>

              {/* Existing webhook info */}
              {webhook && (
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <div>
                    <span className="font-medium">Current endpoint:</span>{" "}
                    <code className="font-mono">{webhook.url}</code>
                  </div>
                  <div>
                    <span className="font-medium">Secret (masked):</span>{" "}
                    <code className="font-mono">{webhook.secret}</code>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {webhook.createdAt
                      ? format(new Date(webhook.createdAt), "MMM d, yyyy HH:mm")
                      : "—"}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Delivery log card ── */}
      <Card data-tour="webhooks-delivery-log">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Delivery Log</CardTitle>
              <CardDescription>
                Real-time history of outbound webhook attempts. Updates live as
                events are delivered.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadDeliveries}
              disabled={deliveriesLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${deliveriesLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="RETRYING">Retrying</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={eventTypeFilter}
              onValueChange={(v) => setEventTypeFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-8 w-48">
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                {ALL_EVENTS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table header */}
          <div className="flex items-center gap-3 border-b pb-2 px-3 text-xs font-medium text-muted-foreground">
            <div className="w-36 shrink-0">Status</div>
            <div className="w-44 shrink-0">Event</div>
            <div className="w-16 shrink-0 text-center">Attempts</div>
            <div className="w-20 shrink-0 text-center">HTTP</div>
            <div className="w-20 shrink-0 text-center">Time</div>
            <div className="flex-1">Timestamp</div>
            <div className="w-20 shrink-0" />
          </div>

          {/* Delivery rows */}
          {deliveriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Zap className="mb-3 h-8 w-8 opacity-30" />
              <p className="text-sm">
                {webhook ? "No deliveries yet. Use the Send Test button to try it out." : "Create a webhook to start receiving delivery logs."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {deliveries.map((d) => (
                <DeliveryRow key={d.id} delivery={d} onRetry={handleRetry} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {pagination.total} total deliveries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs">
                  {page} / {pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payload reference card ── */}
      <Card data-tour="webhooks-verify-signature">
        <CardHeader>
          <CardTitle className="text-base">Verifying Signatures</CardTitle>
          <CardDescription>
            Every request includes <code className="rounded bg-muted px-1 text-xs">X-SIGNATURE</code> for
            authenticity verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs font-mono leading-relaxed">
{`// Node.js example
const crypto = require('crypto');

function verifySignature(rawBody, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)           // raw request body string
    .digest('hex');
  return signature === expected;
}

// In your Express handler:
app.post('/webhook', express.text({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-signature'];
  const tok = req.headers['x-webhook-token'];
  if (!verifySignature(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }
  // Process event
  const { event, data } = JSON.parse(req.body);
  res.sendStatus(200);      // respond quickly; process async
});`}
          </pre>
        </CardContent>
      </Card>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              This will permanently delete the webhook configuration for{" "}
              <span className="font-medium">{selectedChatbot?.name}</span>. Delivery
              logs will be preserved for audit purposes. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Webhook
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

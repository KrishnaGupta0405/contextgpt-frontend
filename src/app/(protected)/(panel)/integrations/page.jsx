"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { useAuth } from "@/context/AuthContext";
import { hasSubscriptionAccess } from "@/lib/subscription";
import { useChatbot } from "@/context/ChatbotContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  ExternalLink,
  Plus,
  Loader2,
  Power,
  Trash2,
  Check,
  Copy,
  Info,
  Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SlackIntegration } from "./SlackIntegration";
import { MessengerIntegration } from "./MessengerIntegration";
import { CrispIntegration } from "./CrispIntegration";
import { ZendeskIntegration } from "./ZendeskIntegration";
import { FreshdeskIntegration } from "./FreshdeskIntegration";
import { GoogleChatIntegration } from "./GoogleChatIntegration";
import { ZohoSalesIQIntegration } from "./ZohoSalesIQIntegration";
import { PersonalWebsiteIntegration } from "./PersonalWebsiteIntegration";
import { ZapierIntegration } from "./ZapierIntegration";

// ─── Platform definitions ────────────────────────────────────────────────────
const PLATFORMS = [
  GoogleChatIntegration,
  MessengerIntegration,
  SlackIntegration,
  CrispIntegration,
  ZendeskIntegration,
  FreshdeskIntegration,
  ZapierIntegration,
  ZohoSalesIQIntegration,
  PersonalWebsiteIntegration,
];

// ─── Main component ──────────────────────────────────────────────────────────
const IntegrationPageContent = () => {
  const { account, subscription } = useAuth();
  const { selectedChatbot } = useChatbot();
  const searchParams = useSearchParams();


  const [activeIntegrations, setActiveIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [connectModal, setConnectModal] = useState(null); // platform object or null
  const [connectModalStep, setConnectModalStep] = useState(1); // 1 = form, 2 = post-connect
  const [formValues, setFormValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Disconnect confirm state
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Webhook URL copy
  const [copiedKey, setCopiedKey] = useState(null);

  // Extra data fetched by a platform's onModalOpen hook
  const [modalExtraData, setModalExtraData] = useState(null);
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);

  // Allowed domains state (for PERSONAL_WEBSITE integration)
  const [domains, setDomains] = useState([]);

  const basePath =
    account?.id && selectedChatbot?.id
      ? `/integrations/account/${account.id}/chatbot/${selectedChatbot.id}`
      : null;

  // ── Fetch integrations ──
  const fetchIntegrations = useCallback(async () => {
    if (!basePath) return;
    setIsLoading(true);
    try {
      const res = await api.get(`${basePath}/integrations`);
      if (res.data.success) {
        setActiveIntegrations(res.data.data.integrations || []);
      }
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // ── Handle OAuth redirect back (e.g. ?connected=slack) ──
  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected) {
      toast.success(
        `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`,
      );
      fetchIntegrations();
      // Clean the URL
      window.history.replaceState({}, "", "/integrations");
    }
  }, [searchParams, fetchIntegrations]);

  // ── Helpers ──
  const getActiveIntegration = (platformKey) =>
    activeIntegrations.find((i) => i.platformType === platformKey);

  // ── Connect: OAuth platforms ──
  const handleOAuthConnect = async (platform) => {
    if (!basePath) return;
    try {
      const res = await api.get(
        `${basePath}/oauth/initiate?platformType=${platform.key}`,
      );
      if (res.data.success && res.data.data.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      toast.error(`Failed to initiate ${platform.name} connection.`);
    }
  };

  // ── Connect: Manual platforms ──
  const openManualModal = async (platform) => {
    setConnectModal(platform);
    setConnectModalStep(1);
    setFormValues({});
    setModalExtraData(null);

    // Pre-populate domains if reconfiguring PERSONAL_WEBSITE
    if (platform.usesAllowedDomains) {
      const active = getActiveIntegration(platform.key);
      setDomains(active?.allowedDomains || []);
    } else {
      setDomains([]);
    }

    if (platform.onModalOpen && basePath) {
      setIsLoadingExtra(true);
      try {
        const data = await platform.onModalOpen(basePath, api);
        setModalExtraData(data);
      } catch {
        toast.error(`Failed to load ${platform.name} setup info.`);
      } finally {
        setIsLoadingExtra(false);
      }
    }
  };

  const handleManualConnect = async () => {
    if (!basePath || !connectModal) return;

    // Validate: domains for PERSONAL_WEBSITE, fields for others
    if (connectModal.usesAllowedDomains) {
      if (domains.length === 0) {
        toast.error("Please add at least one allowed domain.");
        return;
      }
    } else {
      const missing = (connectModal.fields || []).filter(
        (f) => !formValues[f.name]?.trim(),
      );
      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const connectRes = await api.post(`${basePath}/integrations/connect`, {
        platformType: connectModal.key,
        config: connectModal.usesAllowedDomains
          ? {}
          : {
              ...formValues,
              ...(modalExtraData?.setup_token
                ? { setup_token: modalExtraData.setup_token }
                : {}),
            },
        ...(connectModal.usesAllowedDomains ? { allowedDomains: domains } : {}),
      });
      toast.success(`${connectModal.name} connected successfully!`);
      fetchIntegrations();
      if (connectModal.twoStep) {
        // Store integration ID so post-connect content can build per-integration URLs
        const newId = connectRes.data?.data?.id;
        console.log("Connect response:", JSON.stringify(connectRes.data), "newId:", newId);
        setModalExtraData((prev) => ({ ...prev, integrationId: newId, basePath }));
        setConnectModalStep(2);
      } else {
        setConnectModal(null);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to connect ${connectModal.name}.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle enable/disable ──
  const handleToggle = async (integration, newValue) => {
    if (!basePath) return;
    try {
      await api.patch(`${basePath}/integrations/${integration.id}/toggle`, {
        isEnabled: newValue,
      });
      setActiveIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id ? { ...i, isEnabled: newValue } : i,
        ),
      );
      toast.success(`Integration ${newValue ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Failed to toggle integration.");
    }
  };

  // ── Disconnect ──
  const handleDisconnect = async () => {
    if (!basePath || !disconnectTarget) return;
    setIsDisconnecting(true);
    try {
      await api.delete(`${basePath}/integrations/${disconnectTarget.id}`);
      toast.success("Integration disconnected.");
      setDisconnectTarget(null);
      fetchIntegrations();
    } catch {
      toast.error("Failed to disconnect integration.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ── Copy webhook URL ──
  const webhookBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL
    ? process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/api\/v1\/?$/, "")
    : "";

  const copyWebhookUrl = (platformKey) => {
    const url = `${webhookBaseUrl}/api/webhooks/${platformKey.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopiedKey(platformKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── Connect: Zapier redirect flow ──
  const handleZapierConnect = async (platform) => {
    if (!basePath) return;
    setConnectModal(platform);
    setConnectModalStep(1);
    setModalExtraData(null);
    setIsLoadingExtra(true);
    try {
      const res = await api.post(`${basePath}/zapier/connect`);
      if (res.data.success) {
        setModalExtraData(res.data.data);
        setConnectModalStep(2); // jump straight to post-connect
      }
    } catch (err) {
      toast.error("Failed to connect Zapier. Please try again.");
      setConnectModal(null);
    } finally {
      setIsLoadingExtra(false);
    }
  };

  // ── Click handler for "Get Started" / "Connected" button ──
  const handleCardAction = (platform) => {
    if (platform.connectionType === "oauth") {
      handleOAuthConnect(platform);
    } else if (platform.connectionType === "zapier_redirect") {
      handleZapierConnect(platform);
    } else {
      openManualModal(platform);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Integrations" },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-2xl font-bold text-slate-900">
            Integrations
          </h1>

          <div
            data-tour="integrations-platform-grid"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
              {PLATFORMS.map((platform) => {
                const active = getActiveIntegration(platform.key);
                const isConnected = !!active?.isConnected;
                const isLocked =
                  !hasSubscriptionAccess(subscription) ||
                  (!subscription?.platformIntegrationAllowed && platform.key !== "PERSONAL_WEBSITE");
                // console.log("Subscription -> ", subscription)

                return (
                  <div
                    key={platform.key}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow ${isLocked ? "border-slate-200 opacity-60" : "border-slate-200 hover:shadow-md"}`}
                  >
                    <div className="p-5 pb-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-slate-200">
                            {platform.iconContent}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-[15px] font-semibold text-slate-900">
                                {platform.name}
                              </h3>
                              {platform.key === "ZOHO_SALES_IQ" && (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button className="shrink-0 text-amber-500 hover:text-amber-600">
                                        <Info className="h-3.5 w-3.5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-[240px] text-center text-[12px]"
                                    >
                                      Agents can only reply to visitors through the Zoho SalesIQ portal. Sending messages from the ContextGPT dashboard is not supported.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <a
                              href={`https://${platform.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-blue-600"
                            >
                              {platform.url}
                              <ExternalLink className="h-[10px] w-[10px] opacity-70 group-hover:opacity-100" />
                            </a>
                          </div>
                        </div>
                        {isLoading && !isLocked ? (
                          <Skeleton className="h-5 w-20 rounded-full" />
                        ) : isConnected ? (
                          <Badge
                            variant="secondary"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Connected
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-[13px] leading-[1.6] text-slate-600">
                        {platform.description}
                      </p>
                      {isLoading && !isLocked && platform.usesAllowedDomains ? (
                        <div className="mt-2 flex gap-1">
                          <Skeleton className="h-4 w-20 rounded-full" />
                          <Skeleton className="h-4 w-24 rounded-full" />
                        </div>
                      ) : isConnected && platform.usesAllowedDomains && active?.allowedDomains?.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {active.allowedDomains.map((d) => (
                            <span
                              key={d}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 z-10 flex cursor-not-allowed items-center justify-center rounded-xl bg-white/60" />
                    )}

                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                      {isLocked ? (
                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400">
                          <Lock className="h-3.5 w-3.5" />
                          Available on Growth, Scale &amp; Enterprise plans
                        </span>
                      ) : isLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : isConnected ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={active.isEnabled}
                              onCheckedChange={(val) =>
                                handleToggle(active, val)
                              }
                            />
                            <span className="text-[13px] text-slate-500">
                              {active.isEnabled ? "Active" : "Paused"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {platform.connectionType === "manual" &&
                              platform.key !== "SLACK" && (
                                <button
                                  onClick={() => copyWebhookUrl(platform.key)}
                                  className="flex items-center gap-1 rounded px-2 py-1 text-[12px] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  title="Copy webhook URL"
                                >
                                  {copiedKey === platform.key ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                  Webhook
                                </button>
                              )}
                            <button
                              data-tour={
                                platform.key === "PERSONAL_WEBSITE"
                                  ? "integrations-website-reconfigure"
                                  : undefined
                              }
                              onClick={() => openManualModal(platform)}
                              className="text-[13px] font-medium text-blue-600 hover:text-blue-700"
                            >
                              Reconfigure
                            </button>
                            <button
                              onClick={() => setDisconnectTarget(active)}
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              title="Disconnect"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : platform.key === "ZAPIER" ? (
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400">
                          Coming Soon
                        </span>
                      ) : (
                        <button
                          data-tour={
                            platform.key === "ZENDESK"
                              ? "integrations-zendesk-get-started"
                              : platform.key === "PERSONAL_WEBSITE"
                                ? "integrations-website-reconfigure"
                                : undefined
                          }
                          onClick={() => handleCardAction(platform)}
                          className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />{" "}
                          {platform.connectionType === "oauth"
                            ? `Connect ${platform.name}`
                            : "Get Started"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>

      {/* ── Manual Connect / Reconfigure Modal ── */}
      <Dialog
        open={!!connectModal}
        onOpenChange={(open) => {
          if (!open) {
            setConnectModal(null);
            setConnectModalStep(1);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          data-tour="integrations-connect-modal"
          data-platform-key={connectModal?.key}
        >
          <DialogHeader>
            <DialogTitle>
              {connectModalStep === 2
                ? `${connectModal?.name} Connected`
                : (connectModal?.modalTitle ??
                  (connectModal?.name
                    ? `Connect ${connectModal.name}`
                    : "Connect Integration"))}
            </DialogTitle>
            <DialogDescription>
              {connectModalStep === 2
                ? `Complete the setup by configuring your ${connectModal?.name} integration.`
                : (connectModal?.modalDescription ??
                  `Enter your ${connectModal?.name} API credentials below.`)}
            </DialogDescription>
          </DialogHeader>

          {connectModalStep === 2 ? (
            /* ── Step 2: post-connect content (e.g. updated Slack manifest) ── */
            <div className="flex flex-col gap-4 py-2">
              {connectModal?.renderPostConnectContent?.(modalExtraData, {
                copiedKey,
                setCopiedKey,
              })}
            </div>
          ) : connectModal?.connectionType === "oauth" ? (
            <div className="flex flex-col gap-4 py-2">
              <p className="text-sm text-slate-600">
                You will be redirected to {connectModal.name} to authorize
                ContextGPT. After approval, you&apos;ll be redirected back here.
              </p>
              <Button onClick={() => handleOAuthConnect(connectModal)}>
                <Power className="mr-2 h-4 w-4" />
                Authorize {connectModal.name}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              {/* Platform-specific extra content (e.g. Messenger setup info, Slack manifest) */}
              {connectModal?.renderExtraModalContent?.(modalExtraData, {
                isLoadingExtra,
                copiedKey,
                setCopiedKey,
                domains,
                setDomains,
              })}

              {(connectModal?.fields || []).map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name} className="text-[13px]">
                    {field.label} <span className="text-red-500">*</span>
                  </Label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={
                        field.name.includes("key") ||
                        field.name.includes("token") ||
                        field.name.includes("secret")
                          ? "password"
                          : "text"
                      }
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}

              {/* Show webhook URL for platforms that need it (not Messenger, Slack, or Crisp — Slack shows it via manifest, Crisp shows it in step 2) */}
              {connectModal &&
                !["MESSENGER", "SLACK", "CRISP", "ZENDESK", "ZOHO_SALES_IQ", "FRESHDESK"].includes(connectModal.key) &&
                webhookBaseUrl && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-1.5 text-[12px] font-medium text-slate-700">
                      Webhook URL (paste this in your {connectModal.name}{" "}
                      settings)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-600">
                        {`${webhookBaseUrl}/api/webhooks/${connectModal.key.toLowerCase()}`}
                      </code>
                      <button
                        onClick={() => copyWebhookUrl(connectModal.key)}
                        className="shrink-0 rounded p-1 hover:bg-slate-200"
                      >
                        {copiedKey === connectModal.key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            {connectModalStep === 2 ? (
              <Button
                onClick={() => {
                  setConnectModal(null);
                  setConnectModalStep(1);
                  fetchIntegrations();
                }}
              >
                Done
              </Button>
            ) : connectModal?.connectionType === "manual" ? (
              <>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleManualConnect} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {connectModal?.connectButtonLabel || "Connect"}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Disconnect Confirmation Dialog ── */}
      <Dialog
        open={!!disconnectTarget}
        onOpenChange={(open) => !open && setDisconnectTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this integration? The bot will
              stop responding on this platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const IntegrationPage = () => (
  <React.Suspense>
    <IntegrationPageContent />
  </React.Suspense>
);

export default IntegrationPage;

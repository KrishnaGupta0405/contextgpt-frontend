"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Cpu, Bot, Check, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

function ModelCard({ model }) {
  const total = parseInt(model.totalTokens) || 0;
  const input = parseInt(model.totalInputTokens) || 0;
  const output = parseInt(model.totalOutputTokens) || 0;
  const inputPct = total > 0 ? (input / total) * 100 : 50;
  const outputPct = total > 0 ? (output / total) * 100 : 50;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{model.modelName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {model.provider}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {model.totalEvents} events
        </Badge>
      </div>

      {/* Token breakdown */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Input Tokens</span>
          <span className="font-medium text-foreground">
            {input.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${inputPct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-2 mb-1">
          <span>Output Tokens</span>
          <span className="font-medium text-foreground">
            {output.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-700"
            style={{ width: `${outputPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t">
        <span className="text-xs text-muted-foreground">Total Tokens</span>
        <span className="text-sm font-semibold">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ChatbotModelRow({ chatbot, availableModels, creditsRemaining, onModelChange }) {
  const [selectedModel, setSelectedModel] = useState(
    chatbot.currentModelId ?? ""
  );
  const [saving, setSaving] = useState(false);

  const isDirty = selectedModel !== (chatbot.currentModelId ?? "");

  const selectedModelData = availableModels.find((m) => m.id === selectedModel);
  const creditCost = selectedModelData?.creditCost ?? 1;
  const effectiveMessages =
    creditsRemaining != null && creditCost > 0
      ? Math.floor(creditsRemaining / creditCost)
      : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onModelChange(chatbot.chatbotId, selectedModel);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{chatbot.chatbotName}</p>
        {chatbot.currentModelTitle ? (
          <p className="text-xs text-muted-foreground">
            Currently using{" "}
            <span className="font-medium capitalize text-foreground">
              {chatbot.currentModelTitle}
            </span>
            {chatbot.currentModelProvider && (
              <span className="text-muted-foreground">
                {" "}
                ({chatbot.currentModelProvider})
              </span>
            )}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No model configured</p>
        )}
        {effectiveMessages != null && (
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-medium text-foreground">
              ~{effectiveMessages.toLocaleString()}
            </span>{" "}
            messages remaining with this model
            {creditCost > 1 && (
              <span className="ml-1 text-muted-foreground">
                ({creditCost} credit{creditCost !== 1 ? "s" : ""}/msg)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Select
          value={selectedModel || undefined}
          onValueChange={(val) => setSelectedModel(val)}
        >
          <SelectTrigger className="w-[220px] h-8 text-xs border-gray-200">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.filter((m) => m.provider?.toLowerCase() === "openai").map((model) => {
              const cost = model.creditCost ?? 1;
              const effective =
                creditsRemaining != null && cost > 0
                  ? Math.floor(creditsRemaining / cost)
                  : null;
              return (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  <div className="flex flex-col gap-0.5">
                    <div>
                      <span className="font-medium">{model.title}</span>
                      <span className="ml-1 text-muted-foreground capitalize">
                        ({model.provider})
                      </span>
                    </div>
                    {effective != null && (
                      <span className="text-muted-foreground">
                        ~{effective.toLocaleString()} msgs · {cost} credit{cost !== 1 ? "s" : ""}/msg
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {isDirty && (
          <Button
            size="sm"
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ModelUsage({ chatbotId } = {}) {
  const [models, setModels] = useState([]);
  const [chatbots, setChatbots] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [creditsRemaining, setCreditsRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchData = async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const chatbotsUrl = chatbotId
        ? `/usage/chatbots-with-models?chatbotId=${chatbotId}`
        : "/usage/chatbots-with-models";

      const [modelsRes, chatbotsRes, usageRes] = await Promise.all([
        api.get("/usage/models", { params: { page: p, limit: 20 } }),
        api.get(chatbotsUrl),
        api.get("/usage"),
      ]);

      if (modelsRes?.data?.success) {
        setModels(modelsRes.data.data.models ?? []);
        setPagination(modelsRes.data.data.pagination ?? { total: 0, totalPages: 1 });
      }
      if (chatbotsRes?.data?.success) {
        setChatbots(chatbotsRes.data.data.chatbots ?? []);
        setAvailableModels(chatbotsRes.data.data.availableModels ?? []);
      }
      if (usageRes?.data?.success) {
        const u = usageRes.data.data.usage;
        const remaining =
          Number(u?.limitMessages ?? 0) - Number(u?.messagesSentByAi ?? 0);
        setCreditsRemaining(Math.max(0, remaining));
      }
    } catch (err) {
      console.error("Error fetching model usage:", err);
      setError("Failed to load model usage data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleModelChange = async (chatbotId, newModelId) => {
    const chatbot = chatbots.find((c) => c.chatbotId === chatbotId);
    const account = JSON.parse(localStorage.getItem("account") || "{}");
    const accountId = account?.id;

    if (!accountId) {
      toast.error("Account info not found");
      return;
    }

    try {
      const res = await api.patch(
        `/chatbots/chatbot/${chatbotId}/settings`,
        { llmModelId: newModelId }
      );

      if (res?.data?.success) {
        const model = availableModels.find((m) => m.id === newModelId);
        setChatbots((prev) =>
          prev.map((c) =>
            c.chatbotId === chatbotId
              ? {
                  ...c,
                  currentModelId: newModelId,
                  currentModelTitle: model?.title ?? newModelId,
                  currentModelProvider: model?.provider ?? "",
                }
              : c
          )
        );
        toast.success(
          `Model updated for ${chatbot?.chatbotName ?? "chatbot"}`
        );
      } else {
        toast.error(res?.data?.message || "Failed to update model");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update model");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {error}
        <button
          onClick={fetchData}
          className="ml-auto text-red-600 hover:underline flex items-center gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chatbot LLM Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Chatbot Model Configuration
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({chatbots.length} chatbot{chatbots.length !== 1 ? "s" : ""})
            </span>
          </h2>
        </div>

        {chatbots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg bg-muted/30">
            <Bot className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No chatbots found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chatbots.map((chatbot) => (
              <ChatbotModelRow
                key={chatbot.chatbotId}
                chatbot={chatbot}
                availableModels={availableModels}
                creditsRemaining={creditsRemaining}
                onModelChange={handleModelChange}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Token Usage by Model */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Model Token Usage
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({pagination.total} model{pagination.total !== 1 ? "s" : ""})
            </span>
          </h2>
        </div>

        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/30">
            <Cpu className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No model usage data yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Model usage will appear here once your chatbot starts processing messages.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <ModelCard key={model.modelId} model={model} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
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
      </div>
    </div>
  );
}

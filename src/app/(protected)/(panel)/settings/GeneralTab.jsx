import React, { useState, useEffect } from "react";
import {
  Copy,
  Lock,
  Trash2,
  ChevronDown,
  Settings,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SwitchStopsSection from "./SwitchStopsSection";

const GeneralTab = () => {
  const router = useRouter();
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const { subscription } = useAuth();
  const hasConversationLimit = !!subscription?.conversationLimit;

  const [chatbotId, setChatbotId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [disableSmartFollowup, setDisableSmartFollowup] = useState(false);
  const [
    numberOfSmartFollowupQuestionShown,
    setNumberOfSmartFollowupQuestionShown,
  ] = useState("3");
  const [disableLeadNotifications, setDisableLeadNotifications] =
    useState(false);
  const [enablePageContextAwareness, setEnablePageContextAwareness] =
    useState(true);
  const [historyMessageContext, setHistoryMessageContext] = useState("1");
  const [llmModel, setLlmModel] = useState("");
  const [limitMessagesPerConversation, setLimitMessagesPerConversation] =
    useState(false);
  const [maxMessagesPerConversation, setMaxMessagesPerConversation] =
    useState("20");
  const [fallbackMessage, setFallbackMessage] = useState(
    "I'm sorry, I don't have enough information to answer your question, but I'm happy to assist with any other questions you may have.",
  );

  const [availableModels, setAvailableModels] = useState([]);

  const [switchStops, setSwitchStops] = useState([]);
  const [switchModelUnavailablePolicy, setSwitchModelUnavailablePolicy] =
    useState("next_cheaper");
  const [switchResolution, setSwitchResolution] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentChatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId || "";

  useEffect(() => {
    if (currentChatbotId) {
      setChatbotId(currentChatbotId);

      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const account = JSON.parse(localStorage.getItem("account") || "{}");
          const accountId = account?.id;

          if (accountId && currentChatbotId) {
            const [basicRes, settingsRes, modelsRes, switchStopsRes] =
              await Promise.all([
                api.get(
                  `/chatbots/account/${accountId}/chatbot/${currentChatbotId}`,
                ),
                api.get(
                  `/chatbots/chatbot/${currentChatbotId}/settings`,
                ),
                api.get(`/website/${currentChatbotId}/llm-models`),
                api.get(
                  `/chatbots/chatbot/${currentChatbotId}/switch-stops`,
                ),
              ]);

            if (basicRes?.data?.success) {
              setName(basicRes.data.data.name || selectedChatbot.name || "");
            }

            let fetchedModels = [];
            if (modelsRes?.data?.success) {
              fetchedModels = modelsRes.data.data.websiteLlmModel || [];
              setAvailableModels(fetchedModels);
            }

            if (settingsRes?.data?.success) {
              const data = settingsRes.data.data;
              if (data.name) setName(data.name);

              const settings = data.settings;
              if (settings) {
                setDescription(settings.description || "");
                setDisableSmartFollowup(settings.disableSmartFollowup ?? false);
                setNumberOfSmartFollowupQuestionShown(
                  settings.numberOfSmartFollowupQuestionShown?.toString() ??
                    "3",
                );
                setEnablePageContextAwareness(
                  settings.enablePageContextAwareness ?? true,
                );
                setHistoryMessageContext(
                  settings.historyMessageContext?.toString() ?? "1",
                );
                setLimitMessagesPerConversation(
                  settings.limitMessagesPerConversation ?? false,
                );
                setMaxMessagesPerConversation(
                  settings.maxMessagesPerConversation?.toString() ?? "20",
                );
                if (settings.fallbackMessage) {
                  setFallbackMessage(settings.fallbackMessage);
                }

                if (settings.llmModel) {
                  const match = fetchedModels.find(
                    (m) =>
                      m.title === settings.llmModel ||
                      m.id === settings.llmModel,
                  );
                  setLlmModel(match ? match.id : settings.llmModel);
                }
              }
            }

            if (switchStopsRes?.data?.success) {
              const ssData = switchStopsRes.data.data;
              setSwitchStops(
                (ssData.stops || []).map((s) => ({
                  localId: s.id,
                  thresholdType: s.thresholdType,
                  thresholdValue: String(s.thresholdValue),
                  llmId: s.llmId,
                  isEnabled: s.isEnabled,
                })),
              );
              setSwitchModelUnavailablePolicy(
                ssData.switchModelUnavailablePolicy || "next_cheaper",
              );
              setSwitchResolution(ssData.resolution || null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch chatbot details:", error);
          setName(selectedChatbot.name || "");
          setDescription(selectedChatbot.description || "");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetails();
    }
  }, [currentChatbotId]);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatbotId);
    toast.success("Chatbot ID copied to clipboard");
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId || !chatbotId) {
        toast.error("Missing account or chatbot data");
        return;
      }

      const basicPayload = {
        name,
        description,
        status: "active",
      };

      const basicResponse = await api.patch(
        `/chatbots/account/${accountId}/chatbot/${chatbotId}`,
        basicPayload,
      );

      if (!basicResponse.data.success) {
        toast.error(
          basicResponse.data.message || "Failed to update basic details",
        );
        return;
      }

      let selectedModelId = llmModel;
      const matched = availableModels.find((m) => m.title === llmModel);
      if (matched) selectedModelId = matched.id;

      const settingsPayload = {
        description,
        disableSmartFollowup,
        numberOfSmartFollowupQuestionShown: Number(
          numberOfSmartFollowupQuestionShown,
        ),
        enablePageContextAwareness,
        historyMessageContext: Number(historyMessageContext),
        fallbackMessage,
        switchModelUnavailablePolicy,
        switchStops: switchStops.map((s) => ({
          thresholdType: s.thresholdType,
          thresholdValue: Number(s.thresholdValue),
          llmId: s.llmId,
          isEnabled: s.isEnabled,
        })),
        ...(hasConversationLimit && {
          limitMessagesPerConversation,
          maxMessagesPerConversation: Number(maxMessagesPerConversation),
        }),
        ...(selectedModelId && { llmModel: selectedModelId }),
      };

      const settingsResponse = await api.patch(
        `/chatbots/chatbot/${chatbotId}/settings`,
        settingsPayload,
      );

      if (!settingsResponse.data.success) {
        toast.error(
          settingsResponse.data.message || "Failed to update settings",
        );
        return;
      }

      const ssData = settingsResponse.data.data?.switchStops;
      if (ssData) {
        setSwitchStops(
          (ssData.stops || []).map((s) => ({
            localId: s.id,
            thresholdType: s.thresholdType,
            thresholdValue: String(s.thresholdValue),
            llmId: s.llmId,
            isEnabled: s.isEnabled,
          })),
        );
        setSwitchResolution(ssData.resolution || null);
      }
      toast.success("Settings updated successfully");
      markClean();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChatbot = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this chatbot? Once you delete your chatbot, you will no longer have access to message history.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId || !chatbotId) {
        toast.error("Missing account or chatbot data");
        return;
      }

      const response = await api.delete(
        `/chatbots/account/${accountId}/chatbot/${chatbotId}`,
      );

      if (response.data.success) {
        toast.success(response.data.message || "Chatbot deleted successfully");
        router.push("/select-chatbot");
      } else {
        toast.error(response.data.message || "Failed to delete chatbot");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete chatbot");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          General
        </h2>
        <p className="text-muted-foreground text-sm">
          Change the general settings of your chatbot.
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Chatbot ID Card */}
        <div className="flex items-start space-x-4 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-4">
          <div className="flex items-center justify-center rounded-lg bg-[#DBEAFE] p-2">
            <Settings className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#1E3A8A]">
                Your Chatbot ID
              </h4>
            </div>
            <p className="text-xs text-[#1E3A8A]/70">
              Use this ID when integrating with third-party platforms like
              WordPress plugins.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              {isLoading ? (
                <Skeleton className="h-5 w-48 rounded" />
              ) : (
                <code className="rounded bg-[#DBEAFE] px-2 py-1 text-xs font-medium text-[#1E3A8A]">
                  {chatbotId}
                </code>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-semibold text-[#2563EB] transition-colors hover:bg-[#DBEAFE]/50 hover:text-[#1E40AF]"
                onClick={copyToClipboard}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-gray-900"
            >
              Name
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); markDirty(); }}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-gray-900"
            >
              Description
            </Label>
            <div className="relative">
              {isLoading ? (
                <Skeleton className="h-[120px] w-full rounded-md" />
              ) : (
                <>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); markDirty(); }}
                    placeholder=""
                    className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="absolute right-2 bottom-2 opacity-50">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="rotate-90 text-gray-400"
                    >
                      <path d="M7 7l10 10M17 7l-10 10" />
                    </svg>
                  </div>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              This description will be shown in the main home screen of your
              chatbot.
            </p>
          </div>

          {/* Fallback Message */}
          <div className="space-y-2 py-2">
            <Label
              htmlFor="fallback-message"
              className="text-sm font-semibold text-gray-900"
            >
              Fallback Message
            </Label>
            {isLoading ? (
              <Skeleton className="h-[100px] w-full rounded-md" />
            ) : (
              <Textarea
                id="fallback-message"
                value={fallbackMessage}
                onChange={(e) => { setFallbackMessage(e.target.value); markDirty(); }}
                placeholder=""
                className="min-h-[100px] resize-none border-gray-200 text-[14px] focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Customize the message shown when the chatbot cannot find relevant
              information to answer a question.
            </p>
          </div>

          {/* Smart Follow up questions */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-900">
                Disable smart follow up questions
              </Label>
              <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
                contextGPT suggests smart follow up questions to help the user
                get required information faster. Click this toggle to disable
                it.
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                checked={disableSmartFollowup}
                onCheckedChange={(v) => { setDisableSmartFollowup(v); markDirty(); }}
                className="data-[state=checked]:bg-blue-600"
              />
            )}
          </div>

          {/* Number of smart follow up questions */}
          <div className="space-y-2">
            <Label
              htmlFor="smart-follow-up-count"
              className="text-sm font-semibold text-gray-900"
            >
              Number of smart follow up questions to be shown
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Input
                id="smart-follow-up-count"
                type="number"
                value={numberOfSmartFollowupQuestionShown}
                onChange={(e) => {
                  setNumberOfSmartFollowupQuestionShown(e.target.value)
                  markDirty();
                }}
                className="border-gray-200"
              />
            )}
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Choose a number between 1 and 5.
            </p>
          </div>

          {/* Lead notifications */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-900">
                Disable lead notifications
              </Label>
              <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
                Disable this toggle if you wish to not receive email whenever a
                new lead is captured with your chatbot.
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                checked={disableLeadNotifications}
                onCheckedChange={(v) => { setDisableLeadNotifications(v); markDirty(); }}
                className="data-[state=checked]:bg-blue-600"
              />
            )}
          </div>

          {/* Page Context Awareness */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-900">
                Enable Page Context Awareness
              </Label>
              <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
                When enabled, the chatbot will automatically know which page the
                user is viewing and can answer questions about the current page.
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-11 rounded-full" />
            ) : (
              <Switch
                checked={enablePageContextAwareness}
                onCheckedChange={(v) => { setEnablePageContextAwareness(v); markDirty(); }}
                className="data-[state=checked]:bg-blue-600"
              />
            )}
          </div>

          {/* History Messages */}
          <div className="space-y-2">
            <Label
              htmlFor="history-messages"
              className="text-sm font-semibold text-gray-900"
            >
              Number of History Messages To Be Considered
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Input
                id="history-messages"
                type="number"
                value={historyMessageContext}
                onChange={(e) => { setHistoryMessageContext(e.target.value); markDirty(); }}
                className="border-gray-200"
              />
            )}
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Choose a number between 0 and 4.
            </p>
          </div>

          {/* GPT Model */}
          <div className="space-y-2" data-tour="settings-gpt-model">
            <Label
              htmlFor="gpt-model"
              className="text-sm font-semibold text-gray-900"
            >
              GPT Model
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value={llmModel || undefined}
                onValueChange={(val) => { setLlmModel(val); markDirty(); }}
              >
                <SelectTrigger id="gpt-model" className="w-full border-gray-200">
                  <SelectValue placeholder="Select the GPT model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.filter((m) => m.provider?.toLowerCase() === "openai").map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-muted-foreground text-[12px] leading-relaxed">
              Select the GPT model you prefer.
            </p>
          </div>

          {/* Quota-Based Model Switch Stops */}
          <SwitchStopsSection
            isLoading={isLoading}
            stops={switchStops}
            setStops={setSwitchStops}
            switchModelUnavailablePolicy={switchModelUnavailablePolicy}
            setSwitchModelUnavailablePolicy={setSwitchModelUnavailablePolicy}
            switchResolution={switchResolution}
            availableModels={availableModels}
            markDirty={markDirty}
          />

          {/* Limit Messages Per Conversation + Max Messages Per Conversation */}
          {!hasConversationLimit ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-gray-500">
                    Conversation Message Limits
                  </Label>
                  <Lock className="text-muted-foreground/60 h-3 w-3" />
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    Growth+
                  </span>
                </div>
                <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
                  Limit and cap the number of messages per conversation. Available on Growth and above plans.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => router.push("/billing")}
              >
                Upgrade
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Limit Messages Per Conversation
                    </Label>
                  </div>
                  <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
                    When enabled, users will be prompted to start a new conversation
                    after reaching the message limit.
                  </p>
                </div>
                <div className="flex items-center justify-center rounded p-1 transition-colors hover:bg-gray-50">
                  {isLoading ? (
                    <Skeleton className="h-6 w-11 rounded-full" />
                  ) : (
                    <Switch
                      checked={limitMessagesPerConversation}
                      onCheckedChange={(v) => { setLimitMessagesPerConversation(v); markDirty(); }}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  )}
                </div>
              </div>

              <div
                className={`space-y-2 ${!limitMessagesPerConversation ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="max-messages"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Max Messages Per Conversation
                  </Label>
                </div>
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="max-messages"
                    type="number"
                    value={maxMessagesPerConversation}
                    onChange={(e) => { setMaxMessagesPerConversation(e.target.value); markDirty(); }}
                    disabled={!limitMessagesPerConversation}
                    className={`border-gray-200 ${!limitMessagesPerConversation ? "bg-gray-50/50" : ""}`}
                  />
                )}
                <p className="text-muted-foreground text-[12px] leading-relaxed">
                  Number of messages before users are prompted to start a new
                  conversation.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-10">
          <div className="flex items-center justify-between border-t border-gray-100 pt-8">
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-gray-900">
                Danger Zone
              </h4>
              <p className="text-muted-foreground text-[12px] leading-relaxed">
                Once you delete your chatbot, you will no longer have access to
                message history.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDeleteChatbot}
              disabled={deleting}
              className="border-red-100 bg-red-50/30 px-6 text-red-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Chatbot
            </Button>
          </div>
        </div>
      </div>

      {/* Footer / Save Button */}
      <div className="fixed right-0 bottom-0 z-10 w-[calc(100%-256px)] border-t bg-white p-4">
        <div className="flex justify-end px-6">
          <GatedAction>
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="h-10 rounded-md bg-blue-600 px-8 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </GatedAction>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;

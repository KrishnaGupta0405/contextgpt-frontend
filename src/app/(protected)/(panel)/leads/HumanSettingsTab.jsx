"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChatbot } from "@/context/ChatbotContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, UserCircle, MessageSquare, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Schema based on backend constraints
const formSchema = z.object({
  enableHumanSupport: z.boolean().default(false),
  showEscalationButtonsAfterResponses: z.boolean().default(false),
  replaceAllOtherSuggestionsWithEscalationButtons: z.boolean().default(false),
  positiveFeedbackPrompt: z.string().optional().nullable(),
  requestHumanSupportPrompt: z.string().optional().nullable(),
  humanSupportConfirmationMessage: z.string().optional().nullable(),
  leadNotification: z.boolean().default(false),
  leadNotificationEmail: z.string().optional().nullable(),
});

const HumanSettingsTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isNewSettings, setIsNewSettings] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableHumanSupport: false,
      showEscalationButtonsAfterResponses: false,
      replaceAllOtherSuggestionsWithEscalationButtons: false,
      positiveFeedbackPrompt: "",
      requestHumanSupportPrompt: "",
      humanSupportConfirmationMessage: "",
      leadNotification: false,
      leadNotificationEmail: "",
    },
  });

  const isEnabled = form.watch("enableHumanSupport");
  const isNotificationEnabled = form.watch("leadNotification");
  const showEscalationButtons = form.watch(
    "showEscalationButtonsAfterResponses",
  );

  // Sync form dirty state to unsaved changes context
  useEffect(() => {
    if (form.formState.isDirty) {
      markDirty();
    } else {
      markClean();
    }
  }, [form.formState.isDirty, markDirty, markClean]);

  // Clean up on unmount
  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  useEffect(() => {
    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

  const fetchSettings = async () => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/human-support-settings`,
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Transform array to string for display (if array comes from DB)
        let emailString = data.leadNotificationEmail || "";
        if (Array.isArray(data.leadNotificationEmail)) {
          emailString = data.leadNotificationEmail.join(", ");
        }

        form.reset({
          enableHumanSupport: data.enableHumanSupport || false,
          showEscalationButtonsAfterResponses:
            data.showEscalationButtonsAfterResponses || false,
          replaceAllOtherSuggestionsWithEscalationButtons:
            data.replaceAllOtherSuggestionsWithEscalationButtons || false,
          positiveFeedbackPrompt: data.positiveFeedbackPrompt || "",
          requestHumanSupportPrompt: data.requestHumanSupportPrompt || "",
          humanSupportConfirmationMessage:
            data.humanSupportConfirmationMessage || "",
          leadNotification: data.leadNotification || false,
          leadNotificationEmail: emailString,
        });
        setIsNewSettings(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNewSettings(true);
        form.reset({
          enableHumanSupport: false,
          showEscalationButtonsAfterResponses: false,
          replaceAllOtherSuggestionsWithEscalationButtons: false,
          positiveFeedbackPrompt: "",
          requestHumanSupportPrompt: "",
          humanSupportConfirmationMessage: "",
          leadNotification: false,
          leadNotificationEmail: "",
        });
      } else {
        console.error("Failed to fetch settings", error);
        toast.error("Failed to load human support settings");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId) throw new Error("Account ID missing");

      // Transform data for backend (split emails into array)
      const payload = {
        ...values,
        leadNotificationEmail: values.leadNotificationEmail
          ? values.leadNotificationEmail
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e)
          : [],
      };

      let response;
      if (isNewSettings) {
        response = await api.post(
          `/chatbots/chatbot/${chatbotId}/human-support-settings`,
          payload,
        );
      } else {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/human-support-settings`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          isNewSettings
            ? "Human support settings created successfully"
            : "Human support settings updated successfully",
        );
        if (isNewSettings) setIsNewSettings(false);
        fetchSettings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save settings";
      console.error("Submit error", error);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Human Support Settings</h3>
        <p className="text-muted-foreground text-sm">
          Configure how the AI hands over conversations to human agents.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Toggle */}
          <FormField
            control={form.control}
            name="enableHumanSupport"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-blue-50/50 p-4 shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <FormLabel className="text-base font-semibold text-blue-900">
                      Enable Human Support Handoff
                    </FormLabel>
                  </div>
                  <FormDescription className="text-blue-700/80">
                    Allow visitors to request speaking with a human agent.
                  </FormDescription>
                </div>
                <FormControl>
                  {initialLoading ? (
                    <Skeleton className="h-6 w-10 rounded-full" />
                  ) : (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  )}
                </FormControl>
              </FormItem>
            )}
          />

          <div
            className={`space-y-6 transition-opacity ${
              !isEnabled ? "pointer-events-none opacity-50" : "opacity-100"
            }`}
          >
            {/* Escalation Button Settings */}
            <div className="rounded-lg border p-5 shadow-sm">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MessageSquare className="h-4 w-4" />
                Escalation Button Settings
              </h4>
              <p className="mb-6 text-xs text-slate-500">
                Configure quick reply buttons and messages shown to users after
                each AI response
              </p>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="showEscalationButtonsAfterResponses"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5 pr-8">
                        <FormLabel className="text-sm font-medium">
                          Show escalation buttons after responses
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Display escalation buttons after each chatbot
                          response. When disabled, users can only request human
                          support through conversation.
                        </FormDescription>
                      </div>
                      <FormControl>
                        {initialLoading ? (
                          <Skeleton className="h-6 w-10 rounded-full" />
                        ) : (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEnabled}
                          />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div
                  className={`space-y-6 transition-all duration-200 ${
                    !showEscalationButtons
                      ? "pointer-events-none opacity-40 grayscale-[0.5]"
                      : "opacity-100"
                  }`}
                >
                  <FormField
                    control={form.control}
                    name="replaceAllOtherSuggestionsWithEscalationButtons"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5 pr-8">
                          <FormLabel className="text-sm font-medium">
                            Replace other suggestions with escalation buttons
                          </FormLabel>
                          <FormDescription className="text-xs">
                            When enabled, escalation buttons replace all other
                            suggestions (starters, follow-ups). When disabled,
                            they appear alongside other suggestions.
                          </FormDescription>
                        </div>
                        <FormControl>
                          {initialLoading ? (
                            <Skeleton className="h-6 w-10 rounded-full" />
                          ) : (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!isEnabled || !showEscalationButtons}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="positiveFeedbackPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2 flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            Positive Feedback Prompt
                          </FormLabel>
                          <span className="text-xs text-slate-500">
                            Text shown to users after receiving a helpful
                            response
                          </span>
                        </div>
                        <FormControl>
                          {initialLoading ? (
                            <Skeleton className="h-9 w-full rounded-md" />
                          ) : (
                            <Input
                              placeholder="That answered my question 👍"
                              {...field}
                              value={field.value || ""}
                              disabled={!isEnabled || !showEscalationButtons}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestHumanSupportPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2 flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            Request Human Support Prompt
                          </FormLabel>
                          <span className="text-xs text-slate-500">
                            Text shown to users to request human assistance
                          </span>
                        </div>
                        <FormControl>
                          {initialLoading ? (
                            <Skeleton className="h-9 w-full rounded-md" />
                          ) : (
                            <Input
                              placeholder="Connect to an agent 👤"
                              {...field}
                              value={field.value || ""}
                              disabled={!isEnabled || !showEscalationButtons}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humanSupportConfirmationMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block text-sm font-medium">
                          Human Support Confirmation Message
                        </FormLabel>
                        <FormControl>
                          {initialLoading ? (
                            <Skeleton className="h-20 w-full rounded-md" />
                          ) : (
                            <Textarea
                              placeholder="Your request has been forwarded to our human support team. They will respond soon."
                              className="min-h-[80px] resize-none"
                              {...field}
                              value={field.value || ""}
                              disabled={!isEnabled || !showEscalationButtons}
                            />
                          )}
                        </FormControl>
                        <FormDescription className="mt-2 text-xs">
                          Message shown to users after they request human
                          support
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-lg border p-5 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Mail className="h-4 w-4" />
                Notifications
              </h4>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="leadNotification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="font-medium">
                          Email Notifications
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Send an email when a user requests human support.
                        </FormDescription>
                      </div>
                      <FormControl>
                        {initialLoading ? (
                          <Skeleton className="h-6 w-10 rounded-full" />
                        ) : (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEnabled}
                          />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isNotificationEnabled && (
                  <div className="animate-in fade-in slide-in-from-top-1 pt-2">
                    <FormField
                      control={form.control}
                      name="leadNotificationEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-slate-500">
                            Notification Email Addresses
                          </FormLabel>
                          <FormControl>
                            {initialLoading ? (
                              <Skeleton className="h-9 w-full rounded-md" />
                            ) : (
                              <Input
                                placeholder="support@example.com, admin@example.com"
                                {...field}
                                value={field.value || ""}
                                disabled={!isEnabled}
                              />
                            )}
                          </FormControl>
                          <FormDescription className="text-xs text-slate-400">
                            Separate multiple emails with commas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <GatedAction>
              <Button
                type="submit"
                disabled={loading || initialLoading}
                className="min-w-[120px]"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </GatedAction>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HumanSettingsTab;

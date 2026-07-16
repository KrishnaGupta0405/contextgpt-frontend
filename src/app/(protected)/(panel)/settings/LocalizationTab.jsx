"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "other", name: "Other", flag: "🌐" },
];

const allFields = [
  "homeTitle",
  "homeDescription",
  "addDetails",
  "startConversation",
  "starting",
  "messagesTitle",
  "messagesDescription",
  "noMessages",
  "verifyEmailMessage",
  "conversationHistoryInfo",
  "botLabel",
  "youLabel",
  "agentLabel",
  "escalateConfirmation",
  "escalateDescription",
  "yesContinue",
  "cancel",
  "switchedToHuman",
  "startNewConversation",
  "maxMessagesTitle",
  "maxMessagesDescription",
  "connected",
  "disconnected",
  "connecting",
  "disconnecting",
  "reconnect",
  "accountTitle",
  "verifyEmailTitle",
  "verifyEmailDescription",
  "emailLabel",
  "nameLabel",
  "phoneLabel",
  "submitButton",
  "sendingOtp",
  "verifyOtp",
  "otpSentMessage",
  "otpLabel",
  "verifyContinue",
  "resendOtp",
  "editDetails",
  "resetting",
  "verifying",
  "logout",
  "loggingOut",
  "verified",
  "edit",
  "update",
  "updating",
  "leadFormTitle",
  "leadFormDescription",
  "formHeading",
  "formSubmittedMessage",
  "continueButton",
  "submittingText",
  "inputDisabledPlaceholder",
  // ChatBubble
  "closeChatLabel",
  "openChatLabel",
  "chatBubbleAlt",
  "closeTooltipLabel",
  // ConnectionStatus
  "connectionLostReconnecting",
  // Header
  "conversationExportTitle",
  "dateLabel",
  "threadIdLabel",
  "notAvailable",
  "backLabel",
  "openExternalLinkLabel",
  "moreOptionsLabel",
  "refreshChat",
  "downloadMenuLabel",
  "messagesMenuLabel",
  "accountMenuLabel",
  "collapseChatLabel",
  "expandChatLabel",
  "closeChatWindowLabel",
  "startNewConversationLabel",
  // InputBar
  "conversationEnded",
  "sendMessageLabel",
  // LeadForm extras
  "bookingPageLoadError",
  "bookingPageTitle",
  "nameFieldPlaceholder",
  "emailFieldPlaceholder",
  "phoneFieldPlaceholder",
  "fieldRequired",
  "skipButton",
  // Message
  "escalatedToHumanAgent",
  "returnedToAi",
  "helpfulFeedbackLabel",
  "notHelpfulFeedbackLabel",
  // ThreadList
  "yourConversationsTitle",
  "newConversationButton",
  // ThreadItem
  "justNow",
  "minutesAgoFormat",
  "hoursAgoFormat",
  "threadEnded",
  // EmailStep
  "createAccountTitle",
  "enterEmailSubtitle",
  "alreadyHaveAccount",
  "loginLinkText",
  // OtpStep
  "passwordMinLength",
  "passwordsMismatch",
  "otpSentToEmail",
  "passwordPlaceholder",
  "confirmPasswordPlaceholder",
  "creatingAccount",
  "useAnotherEmail",
  // LoginForm
  "welcomeBackTitle",
  "loginWithEmailSubtitle",
  "passwordFieldPlaceholder",
  "loginButtonText",
  "forgotPasswordLink",
  "noAccountQuestion",
  "signupLinkText",
  // ForgotPasswordFlow
  "passwordResetSuccess",
  "passwordResetTitle",
  "backToLoginButton",
  "forgotPasswordTitle",
  "forgotPasswordInstructions",
  "resetPasswordTitle",
  "passwordResetCodeSent",
  "newPasswordPlaceholder",
  "confirmNewPasswordPlaceholder",
  "resetPasswordButton",
  // PoweredBy
  "poweredByLabel",
  // LoadingScreen
  "retryButton",
];

const formSchema = z.object({
  localeCode: z.string().min(1, "Language is required"),
  ...Object.fromEntries(allFields.map((f) => [f, z.string().optional()])),
});

const defaultValues = {
  localeCode: "en",
  ...Object.fromEntries(allFields.map((f) => [f, ""])),
};

// Helper to render a label from a camelCase field name
const fieldLabel = (name) =>
  name.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

// Section groups
const sections = [
  {
    title: "Language Setting",
    description: "Select the primary language for these text settings.",
    fields: ["localeCode"],
  },
  {
    title: "Home",
    description: "Home screen text settings",
    fields: [
      "homeTitle",
      "homeDescription",
      "addDetails",
      "startConversation",
      "starting",
    ],
  },
  {
    title: "Messages",
    description: "Messages screen text settings",
    fields: [
      "messagesTitle",
      "messagesDescription",
      "noMessages",
      "verifyEmailMessage",
      "conversationHistoryInfo",
    ],
  },
  {
    title: "Chat Labels",
    description: "Labels for bot, user and agent",
    fields: ["botLabel", "youLabel", "agentLabel"],
  },
  {
    title: "Escalation",
    description: "Texts shown during escalation flow",
    fields: [
      "escalateConfirmation",
      "escalateDescription",
      "yesContinue",
      "cancel",
      "switchedToHuman",
      "startNewConversation",
    ],
  },
  {
    title: "Max Messages",
    description: "Texts shown when message limit is reached",
    fields: ["maxMessagesTitle", "maxMessagesDescription"],
  },
  {
    title: "Connection Status",
    description: "Real-time connection state labels",
    fields: [
      "connected",
      "disconnected",
      "connecting",
      "disconnecting",
      "reconnect",
    ],
  },
  {
    title: "Account & Verification",
    description: "Account page and email verification texts",
    fields: [
      "accountTitle",
      "verifyEmailTitle",
      "verifyEmailDescription",
      "emailLabel",
      "nameLabel",
      "phoneLabel",
      "submitButton",
      "sendingOtp",
      "verifyOtp",
      "otpSentMessage",
      "otpLabel",
      "verifyContinue",
      "resendOtp",
      "editDetails",
    ],
  },
  {
    title: "Actions & States",
    description: "General action labels and loading states",
    fields: [
      "resetting",
      "verifying",
      "logout",
      "loggingOut",
      "verified",
      "edit",
      "update",
      "updating",
    ],
  },
  {
    title: "Lead Form",
    description: "Lead collection form texts",
    fields: [
      "leadFormTitle",
      "leadFormDescription",
      "formHeading",
      "formSubmittedMessage",
      "continueButton",
      "submittingText",
      "inputDisabledPlaceholder",
      "bookingPageLoadError",
      "bookingPageTitle",
      "nameFieldPlaceholder",
      "emailFieldPlaceholder",
      "phoneFieldPlaceholder",
      "fieldRequired",
      "skipButton",
    ],
  },
  {
    title: "Chat Bubble",
    description: "Chat bubble button labels and accessibility text",
    fields: [
      "closeChatLabel",
      "openChatLabel",
      "chatBubbleAlt",
      "closeTooltipLabel",
    ],
  },
  {
    title: "Header",
    description: "Header menu items, aria-labels, and export text",
    fields: [
      "conversationExportTitle",
      "dateLabel",
      "threadIdLabel",
      "notAvailable",
      "backLabel",
      "openExternalLinkLabel",
      "moreOptionsLabel",
      "refreshChat",
      "downloadMenuLabel",
      "messagesMenuLabel",
      "accountMenuLabel",
      "collapseChatLabel",
      "expandChatLabel",
      "closeChatWindowLabel",
      "startNewConversationLabel",
      "connectionLostReconnecting",
    ],
  },
  {
    title: "Input Bar",
    description: "Input bar text and accessibility labels",
    fields: ["conversationEnded", "sendMessageLabel"],
  },
  {
    title: "Message",
    description: "System messages and feedback button labels",
    fields: [
      "escalatedToHumanAgent",
      "returnedToAi",
      "helpfulFeedbackLabel",
      "notHelpfulFeedbackLabel",
    ],
  },
  {
    title: "Thread List",
    description: "Thread list header and button text",
    fields: ["yourConversationsTitle", "newConversationButton"],
  },
  {
    title: "Thread Item",
    description: "Relative time formats and thread status badges",
    fields: ["justNow", "minutesAgoFormat", "hoursAgoFormat", "threadEnded"],
  },
  {
    title: "Email Step",
    description: "New user email entry screen text",
    fields: [
      "createAccountTitle",
      "enterEmailSubtitle",
      "alreadyHaveAccount",
      "loginLinkText",
    ],
  },
  {
    title: "OTP Step",
    description: "OTP verification and password setup text",
    fields: [
      "passwordMinLength",
      "passwordsMismatch",
      "otpSentToEmail",
      "passwordPlaceholder",
      "confirmPasswordPlaceholder",
      "creatingAccount",
      "useAnotherEmail",
    ],
  },
  {
    title: "Login Form",
    description: "Login screen text and links",
    fields: [
      "welcomeBackTitle",
      "loginWithEmailSubtitle",
      "passwordFieldPlaceholder",
      "loginButtonText",
      "forgotPasswordLink",
      "noAccountQuestion",
      "signupLinkText",
    ],
  },
  {
    title: "Forgot Password",
    description: "Password reset flow text",
    fields: [
      "passwordResetSuccess",
      "passwordResetTitle",
      "backToLoginButton",
      "forgotPasswordTitle",
      "forgotPasswordInstructions",
      "resetPasswordTitle",
      "passwordResetCodeSent",
      "newPasswordPlaceholder",
      "confirmNewPasswordPlaceholder",
      "resetPasswordButton",
    ],
  },
  {
    title: "Powered By",
    description: "Powered by watermark label",
    fields: ["poweredByLabel"],
  },
  {
    title: "Loading Screen",
    description: "Loading screen retry button text",
    fields: ["retryButton"],
  },
];

const LocalizationTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  useEffect(() => {
    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

  useEffect(() => {
    if (form.formState.isDirty) {
      markDirty();
    } else {
      markClean();
    }
  }, [form.formState.isDirty, markDirty, markClean]);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  const fetchSettings = async () => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;
      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/localization`,
      );

      if (response.data.success && response.data.data) {
        const dataArr = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        const data = dataArr[0]; // Fetching primary or top matched mapping

        if (data) {
          form.reset({
            localeCode: data.localeCode || "en",
            ...Object.fromEntries(allFields.map((f) => [f, data[f] || ""])),
          });
          setIsNewRecord(false);
        } else {
          setIsNewRecord(true);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNewRecord(true);
      } else {
        console.error("Failed to fetch localization settings", error);
        toast.error("Failed to load localization settings");
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

      const payload = { ...values };

      let response;
      if (isNewRecord) {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/localization`,
          payload,
        );
      } else {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/localization`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          isNewRecord
            ? "Localization settings created"
            : "Localization settings updated",
        );
        if (isNewRecord) setIsNewRecord(false);
        form.reset(values);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          {sections.map((section) => (
            <div
              key={section.title}
              className="grid grid-cols-1 gap-8 border-b py-8 md:grid-cols-4"
            >
              <div className="md:sticky md:top-14 md:col-span-1 md:self-start">
                <h3 className="text-lg font-bold text-slate-900">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {section.description}
                </p>
              </div>

              {initialLoading ? (
                <div className="space-y-6 md:col-span-3">
                  {section.fields.map((name) => (
                    <div key={name} className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full max-w-xl rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 md:col-span-3">
                  {section.fields.map((name) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            {name === "localeCode"
                              ? "Language"
                              : fieldLabel(name)}
                          </FormLabel>
                          <FormControl>
                            {name === "localeCode" ? (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                              >
                                <SelectTrigger className="h-10 max-w-xl bg-white text-sm">
                                  <SelectValue placeholder="Select a language">
                                    {field.value &&
                                    languages.find(
                                      (l) => l.code === field.value,
                                    ) ? (
                                      <span className="flex items-center gap-2">
                                        <span className="text-base">
                                          {
                                            languages.find(
                                              (l) => l.code === field.value,
                                            ).flag
                                          }
                                        </span>
                                        <span>
                                          {
                                            languages.find(
                                              (l) => l.code === field.value,
                                            ).name
                                          }
                                        </span>
                                      </span>
                                    ) : (
                                      "Select a language"
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {languages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                      <span className="flex items-center gap-2">
                                        <span className="text-base">
                                          {lang.flag}
                                        </span>
                                        <span>{lang.name}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                placeholder={fieldLabel(name)}
                                {...field}
                                className="h-10 max-w-xl text-sm"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Fixed Save Button */}
          <div className="fixed right-0 bottom-0 z-10 w-[calc(100%-256px)] border-t bg-white p-4">
            <div className="flex justify-end px-6">
              <GatedAction>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 rounded-md bg-blue-600 px-8 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </GatedAction>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LocalizationTab;

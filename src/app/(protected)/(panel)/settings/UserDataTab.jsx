import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Sparkles, Check, Loader2 } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import api from "@/lib/axios";
import { toast } from "sonner";

const UserDataTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const [showBanner, setShowBanner] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [collectMode, setCollectMode] = useState("do_not_collect");
  const [dataTypes, setDataTypes] = useState({
    name: true,
    emailAddress: true,
    phoneNumber: true,
  });

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  const toggleDataType = (key) => {
    setDataTypes((prev) => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  };

  useEffect(() => {
    if (chatbotId) {
      fetchLeadSettings();
    }
  }, [chatbotId]);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  const fetchLeadSettings = async () => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;
      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/user-data-settings`,
      );

      if (response.data.success) {
        const data = response.data.data;
        if (data) {
          setCollectMode(data.whenUserShareDetails || "do_not_collect");
          setDataTypes({
            name: data.customerNameTake ?? true,
            emailAddress: data.customerEmailTake ?? true,
            phoneNumber: data.customerPhoneTake ?? false,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data settings", error);
      toast.error("Failed to load user data settings");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      const payload = {
        enableLeadCollection: collectMode !== "do_not_collect",
        customerNameTake: dataTypes.name,
        customerEmailTake: dataTypes.emailAddress,
        customerPhoneTake: dataTypes.phoneNumber,
        whenUserShareDetails: collectMode,
      };

      const response = await api.patch(
        `/chatbots/chatbot/${chatbotId}/user-data-settings`,
        payload,
      );

      if (response.data.success) {
        toast.success(response.data.message || "User data settings saved!");
        markClean();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-24">
      {/* Banner */}
      {showBanner && (
        <div className="relative flex items-center justify-between rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-4 pr-12 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-gray-900">
                Need More Advanced Lead Collection?
              </h4>
              <p className="text-[14px] text-gray-500">
                These are basic user data settings. For AI-powered lead
                collection, industry templates, custom forms, and booking
                integration, use our advanced Lead Collection settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button className="h-9 rounded-md bg-blue-600 px-6 font-medium whitespace-nowrap text-white shadow-sm hover:bg-blue-700">
              Go Advanced
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Collect User Details */}
      <div className="grid grid-cols-1 gap-8 border-b border-gray-100 py-6 md:grid-cols-[1fr_2fr]">
        <div className="pr-6">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Collect User Details
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            Choose whether or not you want to collect the user details.
          </p>
        </div>

        {initialLoading ? (
          <div className="flex flex-col space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-4 w-4 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-5">
            {/* Mandatory */}
            <label
              className="flex cursor-pointer items-start gap-3"
              onClick={() => { setCollectMode("mandatory"); markDirty(); }}
            >
              <div className="mt-0.5 flex items-center justify-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    collectMode === "mandatory"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {collectMode === "mandatory" && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">
                  Mandatory
                </div>
                <div className="text-[13px] text-gray-500">
                  User has to enter their details before they can continue the
                  conversation.
                </div>
              </div>
            </label>

            {/* Optional */}
            <label
              className="flex cursor-pointer items-start gap-3"
              onClick={() => { setCollectMode("optional"); markDirty(); }}
            >
              <div className="mt-0.5 flex items-center justify-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    collectMode === "optional"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {collectMode === "optional" && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">
                  Optional
                </div>
                <div className="text-[13px] text-gray-500">
                  We try to collect user details, but user should still be able to
                  continue chatting by skipping the user details forms
                </div>
              </div>
            </label>

            {/* Do Not Collect */}
            <label
              className="flex cursor-pointer items-start gap-3"
              onClick={() => { setCollectMode("do_not_collect"); markDirty(); }}
            >
              <div className="mt-0.5 flex items-center justify-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    collectMode === "do_not_collect"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {collectMode === "do_not_collect" && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">
                  Do Not Collect
                </div>
                <div className="text-[13px] text-gray-500">
                  We will not collect any user details
                </div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Data Types */}
      <div className="grid grid-cols-1 gap-8 border-b border-gray-100 py-6 md:grid-cols-[1fr_2fr]">
        <div className="pr-6">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Data Types
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            Choose what information you want to collect from visitors.
          </p>
        </div>

        {initialLoading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-[18px] w-[18px] rounded-[4px]" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Name */}
            <label
              className="flex cursor-pointer items-center gap-3"
              onClick={() => toggleDataType("name")}
            >
              <div
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-colors ${
                  dataTypes.name
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {dataTypes.name && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-[14px] font-semibold text-gray-900">
                Name
              </span>
            </label>

            {/* Email Address */}
            <label className="flex items-center gap-3 opacity-60">
              <div className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-blue-600 bg-blue-600">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-[14px] font-semibold text-gray-900">
                Email Address
              </span>
            </label>

            {/* Phone Number */}
            <label
              className="flex cursor-pointer items-center gap-3"
              onClick={() => toggleDataType("phoneNumber")}
            >
              <div
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition-colors ${
                  dataTypes.phoneNumber
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {dataTypes.phoneNumber && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-[14px] font-semibold text-gray-900">
                Phone Number
              </span>
            </label>
          </div>
        )}
      </div>

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

export default UserDataTab;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import api from "@/lib/axios";
import { toast } from "sonner";

const ChatModesTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [chatStart, setChatStart] = useState("ai");

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  useEffect(() => {
    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

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
        `/chatbots/chatbot/${chatbotId}/settings`,
      );

      if (response.data.success) {
        const settings = response.data.data?.settings;
        if (settings && settings.chatStart) {
          setChatStart(settings.chatStart);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load chat mode settings");
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
        chatStart,
      };

      const response = await api.patch(
        `/chatbots/chatbot/${chatbotId}/settings`,
        payload,
      );

      if (response.data.success) {
        toast.success(response.data.message || "Chat mode settings saved!");
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
      <div className="grid grid-cols-1 gap-8 border-b border-gray-100 py-6 md:grid-cols-[1fr_2fr]">
        <div className="pr-6">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Chat Modes
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            Select which mode you want your chatbot to be in.
          </p>
        </div>

        {initialLoading ? (
          <div className="flex flex-col space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-5">
            {/* Always Starts New Conversation with Human */}
            <label
              className="flex cursor-pointer items-start gap-3"
              onClick={() => { setChatStart("agent"); markDirty(); }}
            >
              <div className="mt-0.5 flex items-center justify-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    chatStart === "agent" ? "border-blue-600" : "border-gray-300"
                  }`}
                >
                  {chatStart === "agent" && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">
                  Always Starts New Conversation with Human
                </div>
                <div className="text-[13px] text-gray-500">
                  Every new conversation starts in Human mode. AI won't reply to
                  it.
                </div>
              </div>
            </label>

            {/* Always Starts New Conversation with AI */}
            <label
              className="flex cursor-pointer items-start gap-3"
              onClick={() => { setChatStart("ai"); markDirty(); }}
            >
              <div className="mt-0.5 flex items-center justify-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    chatStart === "ai" ? "border-blue-600" : "border-gray-300"
                  }`}
                >
                  {chatStart === "ai" && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="text-[14px] font-semibold text-gray-900">
                  Always Starts New Conversation with AI
                </div>
                <div className="text-[13px] text-gray-500">
                  Every new conversation starts in AI mode.
                </div>
              </div>
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

export default ChatModesTab;

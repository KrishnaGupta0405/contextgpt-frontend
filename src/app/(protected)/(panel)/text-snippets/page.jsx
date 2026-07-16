"use client";

import React, { useState, useEffect } from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

const TextSnippets = () => {
  const { account } = useAuth();
  const { selectedChatbot } = useChatbot();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (account?.id && selectedChatbot?.id) {
      fetchTextSnippet();
    }
  }, [account?.id, selectedChatbot?.id]);

  const fetchTextSnippet = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/chatbots/chatbot/${selectedChatbot.id}/text-snippet`,
      );
      const data = response.data;
      if (data.success && data.data) {
        setDescription(data.data.description || "");
      }
    } catch (error) {
      console.error("Failed to fetch text snippet:", error);
      toast.error("Failed to load text snippet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!account?.id || !selectedChatbot?.id) {
      toast.error("Account or Chatbot not selected.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post(
        `/chatbots/chatbot/${selectedChatbot.id}/text-snippet`,
        { description },
      );

      const data = response.data;
      if (data.success) {
        toast.success(data.message || "Text snippet saved successfully");
      } else {
        toast.error(data.message || "Failed to save text snippet");
      }
    } catch (error) {
      console.error("Failed to save text snippet:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Text Snippets" },
        ]}
      />
      <div className="flex flex-1 flex-col space-y-6 p-8">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Text
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-blue-200 px-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4 fill-blue-600 text-white" />
            Watch Video Tutorial
          </Button>
        </div>

        <div className="flex max-w-[1000px] flex-1 flex-col">
          <p className="mb-6 text-[15px] text-slate-600">
            Only add reference content like FAQs or product details—
            <span className="font-semibold text-slate-900">
              no instructions or system prompts.
            </span>
          </p>

          {isLoading ? (
            <Skeleton className="min-h-[400px] max-h-[60vh] w-full rounded-xl" />
          ) : (
            <Textarea
              placeholder={`What is the pricing of the product?
The pricing of our product is $99.

How to contact you?
You can contact us by sending an email to support@contextgpt.in.

Do you offer any discounts?
We currently do not have any kind of discounts. But we have a generous free plan which you can make use of.

Our product has 4 pricing plans – $19/month, $49/month, $99/month and $199/month.`}
              className="max-h-[60vh] min-h-[400px] flex-1 resize-none overflow-y-auto rounded-xl border-slate-200 bg-white p-6 text-[15px] shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          )}

          <div className="mt-6 flex justify-start">
            <GatedAction>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="h-10 rounded-lg bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </GatedAction>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSnippets;

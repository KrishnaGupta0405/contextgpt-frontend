"use client";

import React, { useEffect } from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { RefreshCw, ExternalLink, Copy, CodeXml } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShikiCodeBlock } from "@/components/ui/ShikiCodeBlock";
import PerformanceFunnel from "./PerformanceFunnel";
import { useChatbot } from "@/context/ChatbotContext";
import { useProductTour } from "@/hooks/use-product-tour";

export default function Dashboard() {
  const { selectedChatbot } = useChatbot();
  const chatbotId = selectedChatbot?.id ?? "";
  const { startTour, hasSeenTour } = useProductTour();

  useEffect(() => {
    if (!chatbotId || hasSeenTour()) return;
    const timer = setTimeout(() => startTour(), 600);
    return () => clearTimeout(timer);
  }, [chatbotId, hasSeenTour, startTour]);

  return (
    <>
      <PanelNavbar items={[{ label: "Dashboard" }]} />
      <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
        {/* DASHBOARD HEADER */}
        <div>
          <p className="text-5xl font-bold tracking-tight text-slate-900">
            Dashboard
          </p>
        </div>
        <PerformanceFunnel />

        <hr className="my-8 border-slate-100" />

        {/* STATUS & PREVIEW SECTION */}
        <div className="space-y-4">
          <h3 className="text-[17px] font-bold text-slate-900">
            Status & Preview
          </h3>
          <div className="rounded-[14px] border border-blue-100 bg-[#f4f7fc] p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <RefreshCw className="mt-0.5 h-[18px] w-[18px] text-blue-500" />
              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-blue-600">
                  Training is in progress — but you&apos;re good to go!
                </h4>
                <p className="max-w-[800px] pb-3 text-[13.5px] leading-relaxed text-blue-600/80">
                  Your chatbot is already trained on 42 documents and can answer
                  questions. 1 more is
                  <br className="hidden sm:block" />
                  still being processed to expand its knowledge.
                </p>
                <div>
                  <Button
                    variant="outline"
                    className="h-[34px] rounded-[8px] border-blue-200 bg-white px-3.5 text-[13px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    Chat with your chatbot{" "}
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-slate-100" />

        {/* INSTALLATION SECTION */}
        <div className="space-y-4 pb-8">
          <h3 className="text-[17px] font-bold text-slate-900">Installation</h3>
          <div className="space-y-4">
            {/* Chatbot ID */}
            <div
              data-tour="dashboard-chatbot-id"
              className="rounded-[14px] border border-blue-100 bg-[#f4f7fc] p-6 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Copy className="h-4 w-4 text-blue-600" />
                <h4 className="text-[14.5px] font-bold text-slate-900">
                  Chatbot ID
                </h4>
              </div>
              <p className="mb-5 max-w-[800px] text-[13.5px] leading-relaxed text-blue-600/80">
                This is your unique chatbot identifier. Use this ID when
                integrating with third-party platforms like WordPress plugins.
              </p>
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-[#dce6f6] px-3.5 py-1.5 font-mono text-[13.5px] text-blue-800">
                  {chatbotId}
                </div>
                <button className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-[13px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800">
                  <Copy className="h-3.5 w-3.5" strokeWidth={2.5} /> Copy
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div
              data-tour="dashboard-embed-code"
              className="rounded-[14px] border border-blue-100 bg-[#f4f7fc] p-6 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <CodeXml className="h-[18px] w-[18px] text-blue-600" />
                <h4 className="text-[14.5px] font-bold text-slate-900">
                  Embed Code
                </h4>
              </div>
              <p className="mb-5 max-w-[800px] text-[13.5px] leading-relaxed text-blue-600/80">
                Copy this code and paste it in your website&apos;s HTML to embed
                your chatbot.
              </p>

              <ShikiCodeBlock
                code={`<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js"
  data-chatbot-id="${chatbotId}">
</script>`}
                lang="html"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

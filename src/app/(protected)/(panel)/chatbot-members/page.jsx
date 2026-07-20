"use client";

import React, { useEffect } from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatbotMembers } from "./ChatbotMembers";
import { OutgoingInvitations, IncomingInvitations } from "./Invitations";
import { MemberUsageBadge } from "../account-members/MemberUsageBadge";
import { useProductTour } from "@/hooks/use-product-tour";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const MembersPage = () => {
  const { resumeTour } = useProductTour();

  // TOUR_LEGS[9] — resumeTour(9) runs it when the Account Members leg
  // handed off here, and no-ops otherwise. Same delay as the other legs,
  // giving the members list a frame to paint before the overlay lands.
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(9), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  return (
    <div className="animate-in fade-in zoom-in-95 container mx-auto flex h-[calc(100vh-80px)] max-w-7xl flex-col space-y-4 px-4 py-8 duration-500">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Chatbot Members
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 rounded-full border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            >
              <PlayCircle className="h-3.5 w-3.5 fill-blue-600 text-white" />
              Watch Video Tutorial
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Manage members and set their access level in your chatbot.
          </p>
        </div>
        <MemberUsageBadge />
      </div>

      <div className="min-h-[600px] flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
        <ResizablePanelGroup orientation="horizontal">
          {/* First Pane (Left Half): Account Members */}
          <ResizablePanel defaultSize="50%" minSize="40%" maxSize="60%">
            <div
              className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
              data-tour="chatbot-members-list"
            >
              <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-600">
                Chatbot Members
              </h3>
              <ChatbotMembers />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Half: Top and Bottom Panes */}
          <ResizablePanel
            defaultSize="50%"
            minSize="30%"
            maxSize="70%"
            className="h-full"
          >
            <ResizablePanelGroup orientation="vertical" className="h-full">
              {/* Second Pane (Top Right): Outgoing Invitations */}
              <ResizablePanel defaultSize="65%" minSize="30%" maxSize="70%">
                <OutgoingInvitations />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Third Pane (Bottom Right): Incoming Invitations */}
              <ResizablePanel defaultSize="35%" minSize="30%" maxSize="70%">
                <IncomingInvitations />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default MembersPage;

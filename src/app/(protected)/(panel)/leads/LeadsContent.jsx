"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HumanSettingsTab from "./HumanSettingsTab";
import SettingsTab from "./SettingsTab";
import CurrentLeadsTab from "./CurrentLeadsTab";
import { useChatbot } from "@/context/ChatbotContext";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useProductTour } from "@/hooks/use-product-tour";

const LeadsContent = () => {
  const { selectedChatbot } = useChatbot();
  const { guardNavigation } = useUnsavedChanges();
  const { resumeTour } = useProductTour();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "current");

  // TOUR_LEGS[5] — resumeTour(5) runs it when the Chat History
  // leg handed off here, and no-ops otherwise. The delay lets the tabs mount
  // before driver.js resolves the first step's anchor (which also switches to
  // the Current tab itself).
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(5), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  useEffect(() => {
    if (
      tabParam &&
      ["current", "settings", "human-settings"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
 
  const handleTabChange = (value) => {
    guardNavigation(() => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex h-full flex-col">
      <PanelNavbar
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Leads" }]}
      />

      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
            </div>
            <div className="mx-2 hidden h-6 w-px bg-slate-200 sm:block"></div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="current" data-tour="leads-tab-current">
              Current
            </TabsTrigger>
            <TabsTrigger value="settings" data-tour="leads-tab-settings">
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="human-settings"
              data-tour="leads-tab-human-settings"
            >
              Human Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <CurrentLeadsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="human-settings">
            <HumanSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeadsContent;

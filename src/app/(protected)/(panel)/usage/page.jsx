"use client";

import React from "react";
import { AccountUsage } from "./AccountUsage";
import { ModelUsage } from "./ModelUsage";
import UsageBreakdown from "./UsageBreakdown";
import UsageHistory from "./UsageHistory";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Key, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UsagePage = () => {
  return (
    <div className="animate-in fade-in zoom-in-95 container mx-auto max-w-5xl space-y-8 px-4 py-8 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Account Usage</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  This page automatically updates every 5 seconds
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground mt-2">
            View your usage of chatbots, pages, messages, and models.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/usage/api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Account Usage Section */}
      <AccountUsage />

      {/* Plan vs Add-On Usage Breakdown (only shown when addons are active) */}
      <UsageBreakdown />

      {/* Model Usage Section */}
      {/* <ModelUsage /> */}


      <Separator />

      {/* Usage History (paginated file + message events) */}
      <UsageHistory />
      
    </div>
  );
};

export default UsagePage;

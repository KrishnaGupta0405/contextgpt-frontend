"use client";

import { useEffect } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useProductTour } from "@/hooks/use-product-tour";

export function ResizableLayout({ middle, right }) {
  const { resumeTour } = useProductTour();

  // TOUR_LEGS[4] — resumeTour(4) runs it when the Website Files
  // leg handed off here, and no-ops otherwise. Mounted here rather than in a
  // slot's page.jsx because @middle and @right each have their own, and this
  // client layout renders once regardless of which slots are filled — so the
  // leg fires exactly once. The delay lets the parallel slots settle before
  // driver.js resolves its anchors (some live in @right, some in @middle).
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(4), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 overflow-hidden"
    >
      <ResizablePanel defaultSize="45%" minSize="30%" maxSize="60%">
        <div className="bg-background flex h-full flex-col overflow-hidden">
          {middle}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="60%" minSize="30%" maxSize="70%">
        <div className="bg-background flex h-full flex-col overflow-hidden">
          {right}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

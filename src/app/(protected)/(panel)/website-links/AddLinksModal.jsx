import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link2, Network, ScanSearch, Youtube } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddBulkLinks } from "./AddBulkLinks";
import { AddSitemapLinks } from "./AddSitemapLinks";
import { AddYoutubeContent } from "./AddYoutubeContent";
import { AddWebsiteLinks } from "./AddWebsiteLinks";

export function AddLinksModal({ isOpen, onClose, initialData }) {
  const [activeView, setActiveView] = useState("menu");

  React.useEffect(() => {
    if (isOpen && initialData) {
      setActiveView("scrape");
    }
  }, [isOpen, initialData]);

  const handleOpenChange = (open) => {
    if (!open) {
      setTimeout(() => setActiveView("menu"), 300); // Reset after closing animation
    }
    onClose(open);
  };

  const handleAddSubmit = () => {
    // Logic for actually adding the links goes here
    setActiveView("menu");
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-5xl flex-col overflow-hidden p-0 sm:max-w-5xl">
        {activeView === "menu" ? (
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Add Links
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-slate-500">
                Add links from multiple sources at once.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <p className="text-[14px] font-semibold text-slate-800">
                Choose a type to add links:
              </p>

              <div
                data-tour="website-links-source-options"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {/* Multiple Links */}
                <button
                  onClick={() => setActiveView("bulk")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                    <Link2 strokeWidth={2.5} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-[14px] font-bold text-slate-800">
                      Multiple Links
                    </h4>
                    <p className="text-[12px] leading-[1.3] text-slate-500">
                      Import content from multiple links at once
                    </p>
                  </div>
                </button>

                {/* Sitemap */}
                <button
                  onClick={() => setActiveView("sitemap")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                    <Network strokeWidth={2.5} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-[14px] font-bold text-slate-800">
                      Sitemap
                    </h4>
                    <p className="text-[12px] leading-[1.3] text-slate-500">
                      Import content from the URLs mentioned in your sitemap
                    </p>
                  </div>
                </button>

                {/* Scrape Website */}
                <button
                  onClick={() => setActiveView("scrape")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                    <ScanSearch strokeWidth={2.5} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-[14px] font-bold text-slate-800">
                      Scrape Website
                    </h4>
                    <p className="text-[12px] leading-[1.3] text-slate-500">
                      Recursively extract content from an entire website
                    </p>
                  </div>
                </button>

                {/* YouTube */}
                <button
                  onClick={() => setActiveView("youtube")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-transform group-hover:scale-110">
                    <Youtube strokeWidth={2.5} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h4 className="text-[14px] font-bold text-slate-800">
                      YouTube
                    </h4>
                    <p className="text-[12px] leading-[1.3] text-slate-500">
                      Import content from YouTube videos, playlists, or channels
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : activeView === "bulk" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <AddBulkLinks
              onBack={() => setActiveView("menu")}
              onAdd={handleAddSubmit}
            />
          </div>
        ) : activeView === "sitemap" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <AddSitemapLinks
              onBack={() => setActiveView("menu")}
              onAdd={handleAddSubmit}
            />
          </div>
        ) : activeView === "scrape" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <AddWebsiteLinks
              onBack={initialData ? undefined : () => setActiveView("menu")}
              onAdd={handleAddSubmit}
              initialData={initialData}
            />
          </div>
        ) : activeView === "youtube" ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <AddYoutubeContent
              onBack={() => setActiveView("menu")}
              onAdd={handleAddSubmit}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

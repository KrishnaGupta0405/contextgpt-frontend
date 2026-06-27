import React from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";

export default function AppearanceLayout({ children, middle, right }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Appearance" },
        ]}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="bg-background w-full lg:w-2/3 min-w-[300px] border-r overflow-y-auto">
          {middle}
        </div>
        <div className="hidden flex-1 lg:flex lg:items-start lg:justify-center fixed right-[0.5rem] top-2 h-screen overflow-y-auto">{right}</div>
      </div>
    </div>
  );
}

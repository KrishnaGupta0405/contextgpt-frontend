// Personal website integration is availle to all plans subscription, for the chatbot website embedding purposes

import React from "react";
import { Globe, X, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const PersonalWebsiteIntegration = {
  key: "PERSONAL_WEBSITE",
  name: "Personal Website",
  url: "yourwebsite.com",
  connectionType: "manual",
  modalTitle: "Allowed Domains",
  modalDescription:
    "Add the domains where your chatbot widget is allowed to run. Only requests from these domains will be accepted.",
  connectButtonLabel: "Save Domains",
  description:
    "Embed ContextGPT on your own website. Specify which domains are allowed to use the chatbot widget.",
  fields: [], // We use custom rendering instead of standard fields

  // Custom flag so the page knows this integration uses allowedDomains
  usesAllowedDomains: true,

  iconContent: (
    <div className="flex h-full w-full items-center justify-center bg-white p-1.5">
      <Globe className="h-6 w-6 text-blue-600" />
    </div>
  ),

  renderExtraModalContent: (extraData, helpers) => {
    return <DomainListEditor extraData={extraData} helpers={helpers} />;
  },
};

// Separate component for domain list editing (needs state)
function DomainListEditor({ extraData, helpers }) {
  const { domains = [], setDomains, isLoadingExtra } = helpers;
  const [inputValue, setInputValue] = React.useState("");

  const addDomain = () => {
    const domain = inputValue.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!domain) return;
    if (domains.includes(domain)) {
      setInputValue("");
      return;
    }
    setDomains([...domains, domain]);
    setInputValue("");
  };

  const removeDomain = (d) => {
    setDomains(domains.filter((x) => x !== d));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDomain();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2" data-tour="integrations-website-domain-row">
        <input
          type="text"
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          data-tour="integrations-website-add-domain"
          onClick={addDomain}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {domains.map((d) => (
            <span
              key={d}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] text-slate-700"
            >
              {d}
              <button
                onClick={() => removeDomain(d)}
                className="rounded-full p-0.5 hover:bg-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {domains.length === 0 && (
        isLoadingExtra ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">
            No domains added yet. Add at least one domain to save.
          </p>
        )
      )}
    </div>
  );
}

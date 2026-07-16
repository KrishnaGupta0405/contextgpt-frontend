"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Plus, PlayCircle } from "lucide-react";
import PromptFormModal from "./@right/PromptFormModal";
import { useCustomResponses } from "./CustomResponsesProvider";

export default function HeaderClient() {
  const { handleCreate, selectedChatbot } = useCustomResponses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onModalSubmit = async (data) => {
    const success = await handleCreate(data);
    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="border-b bg-white px-8 py-5">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
        {/* Left side: Title and Video Button */}
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Custom Responses
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

        {/* Right side: Add Button */}
        <GatedAction>
          <Button
            className="h-10 gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedChatbot}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </GatedAction>
      </div>

      <PromptFormModal
        open={isModalOpen}
        mode="create"
        prompt={null}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onModalSubmit}
      />
    </div>
  );
}

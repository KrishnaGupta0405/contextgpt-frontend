"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Edit2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for Instruction forms
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  instruction: z.string().min(1, "Instructions are required"),
  creativityLevel: z.coerce.number().min(0).max(1).default(0.7),
});

const defaultValues = {
  title: "",
  instruction: "",
  creativityLevel: 0.7,
};

const InstructionCard = ({
  instruction,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(instruction)}
      className={`mb-4 cursor-pointer overflow-hidden rounded-[10px] border transition-all ${
        isSelected
          ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-4 p-5 md:p-6">
        {/* Radio Button */}
        <div className="pt-0.5">
          <div
            className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors ${
              isSelected
                ? "border-blue-600 bg-blue-600"
                : "border-gray-300 bg-white"
            }`}
          >
            {isSelected && <Check className="h-3 w-3 stroke-[3] text-white" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="text-[15px] font-semibold text-gray-900">
              {instruction.title === "None" ? "None" : instruction.title}
            </div>

            {/* Action Buttons for Custom Instructions */}
            {instruction.title !== "None" && (onEdit || onDelete) && (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(instruction)}
                    className="p-1 text-gray-400 transition-colors hover:text-gray-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {onDelete && instruction.deletable !== false && (
                  <button
                    type="button"
                    onClick={() => onDelete(instruction)}
                    className="p-1 text-red-400 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? "Hide Details" : "View Details"}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Expandable Section */}
          {isExpanded && (
            <div
              className="mt-4 cursor-default rounded-lg bg-gray-50 p-5 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 text-sm font-semibold text-gray-900">
                Instructions
              </div>
              <div className="mb-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
                {instruction.instruction || "No instructions provided."}
              </div>

              {instruction.title !== "None" && (
                <>
                  <div className="mb-1 text-sm font-semibold text-gray-900">
                    Temperature
                  </div>
                  <div className="text-sm leading-relaxed text-gray-600">
                    {instruction.creativityLevel}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InstructionsTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const [instructions, setInstructions] = useState([]);
  const [selectedInstructionId, setSelectedInstructionId] =
    useState("default-none");

  const [expandedCardId, setExpandedCardId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [editingInstructionId, setEditingInstructionId] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  useEffect(() => {
    if (chatbotId) {
      fetchInstructions();
    }
  }, [chatbotId]);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  // Sync react-hook-form dirty state → context (Pattern B)
  useEffect(() => {
    if (form.formState.isDirty) {
      markDirty();
    } else {
      markClean();
    }
  }, [form.formState.isDirty, markDirty, markClean]);

  const fetchInstructions = async (selectId = null) => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;
      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/instructions`,
      );

      if (response.data.success) {
        let fetched = response.data.data || [];
        if (!Array.isArray(fetched)) fetched = [fetched];

        // Only keep custom (deletable) for the list
        const customInstructions = fetched.filter((i) => i.deletable === true);
        setInstructions(customInstructions);

        // Smart active detection (same logic as personas)
        const activeDefault = fetched.find(
          (i) => i.deletable === false && i.isActive === true,
        );
        const activeCustom = fetched.find(
          (i) => i.deletable === true && i.isActive === true,
        );

        if (selectId) {
          setSelectedInstructionId(selectId);
        } else if (activeDefault) {
          setSelectedInstructionId("default-none"); // ← shows "None" as active
        } else if (activeCustom) {
          setSelectedInstructionId(activeCustom.id);
        } else {
          setSelectedInstructionId("default-none");
        }
      }
    } catch (error) {
      console.error("Failed to fetch instructions", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load instructions");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddNewCustom = () => {
    setIsEditingCustom(true);
    setEditingInstructionId(null);
    form.reset(defaultValues);
  };

  const handleEditCustom = (instruction) => {
    setIsEditingCustom(true);
    setEditingInstructionId(instruction.id);
    form.reset({
      title: instruction.title || "",
      instruction: instruction.instruction || "",
      creativityLevel: instruction.creativityLevel ?? 0.7,
    });
    setSelectedInstructionId(instruction.id);
  };

  const cancelEditing = () => {
    setIsEditingCustom(false);
    setEditingInstructionId(null);
    form.reset(defaultValues);
  };

  const onSubmitCustom = async (values) => {
    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      const payload = {
        ...values,
        creativityLevel: Number(values.creativityLevel),
        deletable: true,
        isActive: true, // Assuming new ones are active or default false
      };

      let response;
      if (!editingInstructionId) {
        response = await api.post(
          `/chatbots/chatbot/${chatbotId}/instructions`,
          payload,
        );
      } else {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/instructions/${editingInstructionId}`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            (editingInstructionId
              ? "Instruction updated"
              : "Instruction created"),
        );
        const newId = response.data.data?.id;
        setIsEditingCustom(false);
        fetchInstructions(newId || editingInstructionId);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save instruction",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustom = async (instruction) => {
    if (!confirm(`Are you sure you want to delete "${instruction.title}"?`))
      return;

    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");

      const response = await api.delete(
        `/chatbots/chatbot/${chatbotId}/instructions?instructionId=${instruction.id}`,
      );

      if (response.data.success) {
        toast.success(response.data.message || "Instruction deleted");
        if (selectedInstructionId === instruction.id) {
          setSelectedInstructionId("default-none");
        }
        fetchInstructions(
          selectedInstructionId === instruction.id
            ? "default-none"
            : selectedInstructionId,
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete instruction",
      );
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      let payload = {};

      if (selectedInstructionId === "default-none") {
        payload = {
          title: "Default Intruction",
          instruction: "No custom instructions – use default AI behavior.",
          creativityLevel: 0.5,
        };
      } else {
        const selectedInstruction = instructions.find(
          (i) => i.id === selectedInstructionId,
        );
        if (!selectedInstruction) {
          toast.error("Please select an instruction first");
          setLoading(false);
          return;
        }
        payload = {
          instructionId: selectedInstruction.id,
          title: selectedInstruction.title,
          instruction: selectedInstruction.instruction || "",
          creativityLevel: Number(selectedInstruction.creativityLevel || 0.7),
        };
      }

      const response = await api.post(
        `/chatbots/chatbot/${chatbotId}/instructions/select-instruction`,
        payload,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Active instruction selection saved!",
        );
        markClean();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save instruction selection",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl pb-24">
      {/* Default Instructions Section */}
      <div className="grid grid-cols-1 gap-8 border-b border-gray-100 py-10 md:grid-cols-4">
        <div className="pr-6 md:col-span-1">
          <h3 className="text-base font-semibold text-gray-900">
            Default Instructions
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
            Keep the default behavior.
          </p>
        </div>

        <div className="w-full md:col-span-3">
          <InstructionCard
            instruction={{
              id: "default-none",
              title: "None",
              instruction:
                "No specific base instructions applied. The chatbot will purely rely on standard behaviors and base prompts.",
            }}
            isSelected={selectedInstructionId === "default-none"}
            onSelect={(p) => { setSelectedInstructionId(p.id); markDirty(); }}
            isExpanded={expandedCardId === "default-none"}
            onToggleExpand={() =>
              setExpandedCardId(
                expandedCardId === "default-none" ? null : "default-none",
              )
            }
          />
        </div>
      </div>

      {/* Custom Instructions Section */}
      <div
        data-tour="settings-instructions"
        className="grid grid-cols-1 gap-8 py-10 md:grid-cols-4"
      >
        <div className="pr-6 md:col-span-1">
          <h3 className="text-base font-semibold text-gray-900">
            Custom Instructions
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
            Give your chatbot custom instructions.
          </p>
        </div>

        <div className="w-full md:col-span-3">
          {initialLoading ? (
            <div className="mb-4 rounded-[10px] border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="mt-0.5 h-[18px] w-[18px] rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* List of Custom Instructions */}
              {!isEditingCustom &&
                instructions.map((instruction) => (
                  <InstructionCard
                    key={instruction.id}
                    instruction={instruction}
                    isSelected={selectedInstructionId === instruction.id}
                    onSelect={(p) => { setSelectedInstructionId(p.id); markDirty(); }}
                    isExpanded={expandedCardId === instruction.id}
                    onToggleExpand={() =>
                      setExpandedCardId(
                        expandedCardId === instruction.id ? null : instruction.id,
                      )
                    }
                    onEdit={handleEditCustom}
                    onDelete={handleDeleteCustom}
                  />
                ))}

              {!isEditingCustom && (
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={handleAddNewCustom}
                    className="h-10 w-full justify-start rounded-[8px] bg-white px-4 text-left font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Instructions
                  </Button>
                </div>
              )}

          {/* Form for Creating/Editing Custom Instruction */}
          {isEditingCustom && (
            <div className="mb-6 rounded-[10px] border border-blue-100 bg-blue-50/30 p-6 shadow-sm">
              <h4 className="mb-5 text-base font-semibold text-gray-900">
                {editingInstructionId
                  ? "Edit Custom Instructions"
                  : "Create Custom Instructions"}
              </h4>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitCustom)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g. Support Guidelines #1"
                            {...field}
                            className="h-10 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instruction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Instructions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide system instructions..."
                            className="min-h-[150px] font-mono text-sm leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creativityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Creativity Level (0.0 to 1.0)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            {...field}
                            className="h-10 w-32 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-2 flex justify-end gap-3 border-t border-gray-200 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-4 text-sm font-medium"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-9 bg-blue-600 px-4 text-sm font-medium shadow-sm hover:bg-blue-700"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingInstructionId ? "Update" : "Save"} Custom
                      Instructions
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Global Save Button Container */}
      <div className="fixed right-0 bottom-0 z-10 w-[calc(100%-256px)] border-t bg-white p-4">
        <div className="flex justify-end px-6">
          <GatedAction>
            <Button
              onClick={handleSaveChanges}
              disabled={loading}
              className="h-10 rounded-md bg-blue-600 px-8 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </GatedAction>
        </div>
      </div>
    </div>
  );
};

export default InstructionsTab;

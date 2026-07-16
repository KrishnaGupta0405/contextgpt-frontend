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
  FormDescription,
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Predefined default personas provided by the user
const DEFAULT_PERSONAS = [
  {
    title: "Default",
    description: "Crisp, direct responses that get straight to the point",
    instructions:
      "Keep responses concise and direct. Answer questions clearly in 1-3 sentences when possible. Avoid long paragraphs or excessive detail unless specifically requested. Be friendly but efficient, focusing on what the user needs to know most.",
  },
  {
    title: "Default (Classic)",
    description: "Original comprehensive response style with professional tone",
    instructions:
      "Maintain a clear, professional, and friendly tone in all responses. Be helpful and precise, using polite language to build trust and ensure users feel supported. Avoid slang or overly casual expressions unless the query calls for it, and focus on delivering value through accurate, well-structured answers.",
  },
  {
    title: "Neutral",
    description: "Balanced, unbiased, and fact-focused communication",
    instructions:
      "Maintain a neutral tone in all responses, presenting information objectively and factually without expressing personal opinions, emotions, or bias. Use straightforward language to convey details clearly and impartially.",
  },
  {
    title: "Professional / Formal",
    description:
      "Polished, respectful language suitable for business or academic contexts",
    instructions:
      "Adopt a professional and formal tone in all responses, using polished, respectful language suitable for business or academic contexts. Structure answers with clarity, precision, and etiquette, avoiding contractions, slang, or casual expressions.",
  },
  {
    title: "Informative",
    description:
      "Detailed and educational responses focused on clarity and understanding",
    instructions:
      "Focus on an informative tone in all responses, prioritizing the delivery of accurate, detailed, and educational content. Explain concepts thoroughly, use examples where helpful, and organize information logically to enhance understanding.",
  },
  {
    title: "Engaging",
    description: "Conversational and interactive responses that hold attention",
    instructions:
      "Use an engaging tone in all responses, drawing the user in with conversational language, questions, or relatable anecdotes to make interactions dynamic and interactive. Encourage curiosity while keeping the content lively and user-focused.",
  },
  {
    title: "Inspirational",
    description: "Positive and uplifting responses that motivate and encourage",
    instructions:
      "Employ an inspirational tone in all responses, motivating and uplifting the user with positive, encouraging language. Highlight potential, growth, and optimism, weaving in motivational insights to inspire action or reflection.",
  },
  {
    title: "Playful / Funny",
    description:
      "Light-hearted and humorous responses that entertain and amuse",
    instructions:
      "Respond in a playful and funny tone, incorporating light-hearted humor, puns, or witty remarks where appropriate to keep things fun and entertaining. Balance jokes with relevance to ensure the response remains helpful and enjoyable.",
  },
  {
    title: "Sales Expert",
    description:
      "Persuasive and results-focused, great for converting visitors into leads",
    instructions:
      "Act as a skilled sales professional. Focus on understanding visitor needs, highlighting key benefits, and gently guiding toward taking action (booking demos, requesting quotes, signing up). Use persuasive but non-pushy language. Always look for opportunities to capture lead information or schedule follow-ups.",
  },
  {
    title: "Consultant",
    description: "Advisory approach that builds trust through expertise",
    instructions:
      "Position yourself as a trusted advisor and industry expert. Provide valuable insights, ask qualifying questions to understand their business needs, and offer strategic recommendations. Focus on education first, then naturally transition to how your solutions can help. Build credibility through knowledge.",
  },
  {
    title: "Problem Solver",
    description: "Focuses on pain points and positions solutions effectively",
    instructions:
      "Lead with empathy for their challenges and pain points. Ask probing questions to uncover specific problems they're facing. Present your solutions as the clear answer to their struggles. Use language that shows you understand their frustration and have the expertise to help.",
  },
  {
    title: "Urgent & Action-Oriented",
    description:
      "Creates urgency and drives immediate action with limited-time offers",
    instructions:
      "Create a sense of urgency and scarcity in your responses. Highlight time-sensitive offers, limited availability, or competitive advantages they might miss. Use action-oriented language and strong calls-to-action. Focus on getting them to take the next step immediately.",
  },
];

const isDefaultPersona = (persona) => {
  return DEFAULT_PERSONAS.some((dp) => dp.title === persona.title);
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  creativityLevel: z.coerce.number().min(0).max(1).default(0.7),
});

const defaultValues = {
  title: "",
  description: "",
  instructions: "",
  creativityLevel: 0.7,
};

const PersonaCard = ({
  persona,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(persona)}
      className={`mb-4 cursor-pointer overflow-hidden rounded-[10px] border transition-all ${
        isSelected
          ? "border-blue-600 bg-white ring-1 ring-blue-600"
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
            <div>
              <div className="text-[15px] font-semibold text-gray-900">
                {persona.title}
              </div>
              {persona.description && (
                <div className="mt-1 text-sm text-gray-500">
                  {persona.description}
                </div>
              )}
            </div>
            {persona.deletable && onDelete && (
              <button
                type="button"
                className="p-2 text-gray-400 transition-colors hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(persona);
                }}
                title="Delete persona"
              >
                <Trash2 className="h-5 w-5" />
              </button>
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
              <div className="text-sm leading-relaxed text-gray-600">
                {persona.instructions}
              </div>

              {onEdit && (
                <div className="mt-5 flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 font-medium text-gray-700"
                    onClick={() => onEdit(persona)}
                  >
                    Edit Persona
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PersonasTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const [personas, setPersonas] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);

  const [expandedCardId, setExpandedCardId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;

  useEffect(() => {
    if (chatbotId) {
      fetchPersonas();
    }
  }, [chatbotId]);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  const getCombinedPersonas = (fetched) => {
    const combined = [...fetched];
    DEFAULT_PERSONAS.forEach((dp) => {
      if (!combined.some((c) => c.title === dp.title)) {
        combined.push({
          ...dp,
          id: `default-${dp.title}`,
          deletable: false,
          creativityLevel: 0.7,
        });
      }
    });
    return combined;
  };

  const fetchPersonas = async (selectId = null) => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;
      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/personas`,
      );

      if (response.data.success) {
        let fetchedPersonas = response.data.data?.data || [];
        fetchedPersonas = getCombinedPersonas(fetchedPersonas);
        setPersonas(fetchedPersonas);

        if (fetchedPersonas.length > 0) {
          if (selectId) setSelectedPersonaId(selectId);
          else if (!selectedPersonaId)
            setSelectedPersonaId(fetchedPersonas[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch personas", error);
      toast.error("Failed to load personas");
    } finally {
      setInitialLoading(false);
    }
  };

  const defaultList = personas.filter((p) => isDefaultPersona(p));
  const customList = personas.filter((p) => !isDefaultPersona(p));

  const handleAddNewCustom = () => {
    setIsEditingCustom(true);
    setEditingPersonaId(null);
    form.reset(defaultValues);
  };

  const handleEditCustom = (persona) => {
    setIsEditingCustom(true);
    setEditingPersonaId(persona.id);
    form.reset({
      title: persona.title || "",
      description: persona.description || "",
      instructions: persona.instructions || "",
      creativityLevel: persona.creativityLevel ?? 0.7,
    });
    setSelectedPersonaId(persona.id);
  };

  const cancelEditing = () => {
    setIsEditingCustom(false);
    setEditingPersonaId(null);
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
      };

      let response;
      if (!editingPersonaId) {
        response = await api.post(
          `/chatbots/chatbot/${chatbotId}/personas`,
          payload,
        );
      } else {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/personas/${editingPersonaId}`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(editingPersonaId ? "Persona updated" : "Persona created");
        const newId = response.data.data?.id;
        setIsEditingCustom(false);
        fetchPersonas(newId || editingPersonaId);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save custom persona",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustom = async (persona) => {
    if (!confirm(`Are you sure you want to delete "${persona.title}"?`)) return;

    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");

      const response = await api.delete(
        `/chatbots/chatbot/${chatbotId}/personas?personaId=${persona.id}`,
      );

      if (response.data.success) {
        toast.success(response.data.message || "Persona deleted");
        if (selectedPersonaId === persona.id) {
          setSelectedPersonaId(defaultList[0]?.id);
        }
        fetchPersonas(selectedPersonaId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete persona");
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedPersonaId) {
      toast.error("Please select a persona first");
      return;
    }

    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      const selectedPersona = personas.find((p) => p.id === selectedPersonaId);

      const payload = {
        title: selectedPersona.title,
        description: selectedPersona.description || "",
        instructions: selectedPersona.instructions || "",
        creativityLevel: Number(selectedPersona.creativityLevel || 0.7),
      };

      // Only include personaId if it's not a default persona
      if (!isDefaultPersona(selectedPersona)) {
        payload.personaId = selectedPersona.id;
      }

      const response = await api.post(
        `/chatbots/chatbot/${chatbotId}/personas/select-persona`,
        payload,
      );

      if (response.data.success) {
        toast.success(response.data.message || "Persona selection saved!");
        markClean();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save persona selection",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Default Personas Section */}
      <div className="grid grid-cols-1 gap-8 border-b border-gray-100 py-10 md:grid-cols-4">
        <div className="pr-6 md:sticky md:top-14 md:col-span-1 md:self-start">
          <h3 className="text-base font-semibold text-gray-900">
            Default Personas
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
            Choose one of the built-in personas or add a custom persona.
          </p>
        </div>

        <div className="md:col-span-3">
          {initialLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-4 rounded-[10px] border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="mt-0.5 h-[18px] w-[18px] rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="mt-2 h-3 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            defaultList.map((persona) => (
              <PersonaCard
                key={persona.id || persona.title}
                persona={persona}
                isSelected={selectedPersonaId === persona.id}
                onSelect={(p) => { setSelectedPersonaId(p.id); markDirty(); }}
                isExpanded={expandedCardId === persona.id}
                onToggleExpand={() =>
                  setExpandedCardId(
                    expandedCardId === persona.id ? null : persona.id,
                  )
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Custom Personas Section */}
      <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-4">
        <div className="pr-6 md:sticky md:top-14 md:col-span-1 md:self-start">
          <h3 className="text-base font-semibold text-gray-900">
            Custom Personas
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
            Give the chatbot a custom persona.
          </p>
        </div>

        <div className="md:col-span-3">
          {initialLoading ? (
            <div className="mb-4 rounded-[10px] border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="mt-0.5 h-[18px] w-[18px] rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {!isEditingCustom && (
                <div className="mb-6">
                  <Button
                    variant="outline"
                    onClick={handleAddNewCustom}
                    className="h-10 rounded-[8px] bg-white px-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Persona
                  </Button>
                </div>
              )}

          {/* Form for Creating/Editing Custom Persona */}
          {isEditingCustom && (
            <div className="mb-6 rounded-[10px] border border-blue-100 bg-blue-50/30 p-6 shadow-sm">
              <h4 className="mb-5 text-base font-semibold text-gray-900">
                {editingPersonaId
                  ? "Edit Custom Persona"
                  : "Create Custom Persona"}
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
                            placeholder="E.g. Support Guru"
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Short summary"
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
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Instructions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="System instructions..."
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
                      {editingPersonaId ? "Update" : "Save"} Custom Persona
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

              {/* List of Custom Personas */}
              {!isEditingCustom && customList.length === 0 && (
                <div className="text-[14px] text-gray-500">
                  No custom personas created yet.
                </div>
              )}

              {!isEditingCustom &&
                customList.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    isSelected={selectedPersonaId === persona.id}
                    onSelect={(p) => { setSelectedPersonaId(p.id); markDirty(); }}
                    isExpanded={expandedCardId === persona.id}
                    onToggleExpand={() =>
                      setExpandedCardId(
                        expandedCardId === persona.id ? null : persona.id,
                      )
                    }
                    onEdit={handleEditCustom}
                    onDelete={handleDeleteCustom}
                  />
                ))}
            </>
          )}
        </div>
      </div>

      {/*Save Button Container */}
      <div className="fixed right-0 bottom-0 left-[240px] z-10 flex justify-end border-t border-gray-200 bg-white p-4">
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
  );
};

export default PersonasTab;

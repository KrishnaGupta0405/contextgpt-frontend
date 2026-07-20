"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useChatbot } from "@/context/ChatbotContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Building2,
  AlarmClock,
  Type,
  Lightbulb,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LeadFormPreview({ values }) {
  const {
    enableLeadCollection,
    customerNameTake,
    customerPhoneTake,
    customerEmailTake,
    customerFormField,
    bookingIntegration,
    bookingIntegrationLink,
  } = values;

  const hasAnyField =
    customerNameTake ||
    customerPhoneTake ||
    customerEmailTake ||
    (customerFormField && customerFormField.some((f) => f.display_label));

  return (
    <div className="sticky top-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Eye className="h-4 w-4 text-blue-500" />
        Live Preview
      </div>

      {/* Chatbot shell */}
      <div className="flex flex-col overflow-hidden rounded-2xl border shadow-lg" style={{ width: "100%", maxWidth: 340 }}>
        {/* Header */}
        <div className="flex items-center gap-2 bg-blue-600 px-4 py-3">
          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">AI</div>
          <span className="text-sm font-medium text-white">Chatbot Assistant</span>
          <div className="ml-auto flex gap-1">
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-col gap-2 bg-slate-50 px-3 py-3 text-xs">
          {/* Bot message */}
          <div className="flex items-end gap-1.5">
            <div className="h-5 w-5 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">AI</div>
            <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm text-slate-700 max-w-[80%]">
              Hi there! How can I help you today?
            </div>
          </div>
          {/* User message */}
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-sm bg-blue-600 px-3 py-2 text-white max-w-[80%]">
              I'd like to learn more about your services.
            </div>
          </div>
          {/* Bot triggering form */}
          {enableLeadCollection && hasAnyField && (
            <div className="flex items-end gap-1.5">
              <div className="h-5 w-5 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">AI</div>
              <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm text-slate-700 max-w-[80%]">
                Great! Please share a few details so we can follow up.
              </div>
            </div>
          )}
        </div>

        {/* Lead form */}
        <div className="border-t bg-white px-3 py-3">
          {!enableLeadCollection ? (
            <p className="text-center text-[11px] text-slate-400 italic py-2">
              Enable lead collection to see the form preview
            </p>
          ) : !hasAnyField ? (
            <p className="text-center text-[11px] text-slate-400 italic py-2">
              Turn on at least one field above
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-slate-700 mb-1">Share your details</p>
              {customerNameTake && (
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-slate-500">Name<span className="text-red-400"> *</span></span>
                  <input
                    readOnly
                    placeholder="Name"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400 outline-none"
                  />
                </label>
              )}
              {customerEmailTake && (
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-slate-500">Email<span className="text-red-400"> *</span></span>
                  <input
                    readOnly
                    placeholder="Email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400 outline-none"
                  />
                </label>
              )}
              {customerPhoneTake && (
                <label className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-medium text-slate-500">Phone<span className="text-red-400"> *</span></span>
                  <input
                    readOnly
                    placeholder="Phone"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400 outline-none"
                  />
                </label>
              )}
              {(customerFormField ?? [])
                .filter((f) => f.display_label)
                .map((f, i) =>
                  f.field_type === "textarea" ? (
                    <label key={i} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-slate-500">
                        {f.display_label}{f.required && <span className="text-red-400"> *</span>}
                      </span>
                      <textarea
                        readOnly
                        placeholder={f.placeholder_text || ""}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400 outline-none resize-none"
                      />
                    </label>
                  ) : (
                    <label key={i} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-slate-500">
                        {f.display_label}{f.required && <span className="text-red-400"> *</span>}
                      </span>
                      <input
                        readOnly
                        placeholder={f.placeholder_text || ""}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-400 outline-none"
                      />
                    </label>
                  ),
                )}
              <button
                type="button"
                className="mt-1 w-full rounded-lg bg-blue-600 py-1.5 text-[11px] font-semibold text-white"
              >
                Submit
              </button>
              <button
                type="button"
                className="w-full rounded-lg py-1 text-[11px] text-slate-400 hover:text-slate-600"
              >
                Skip
              </button>

              {bookingIntegration && bookingIntegrationLink && (
                <div className="mt-2 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-2 py-2 text-center">
                  <p className="text-[10px] font-medium text-blue-600">Booking widget will appear here</p>
                  <p className="text-[10px] text-blue-400 truncate">{bookingIntegrationLink}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat input bar */}
        <div className="flex items-center gap-1.5 border-t bg-white px-3 py-2">
          <div className="flex-1 rounded-full border bg-slate-50 px-3 py-1.5 text-[11px] text-slate-300">
            Type a message...
          </div>
          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        Preview updates as you configure settings
      </p>
    </div>
  );
}

// Schema based on backend constraints
const formSchema = z.object({
  enableLeadCollection: z.boolean().default(false),
  customerNameTake: z.boolean().default(false),
  customerPhoneTake: z.boolean().default(false),
  customerEmailTake: z.boolean().default(true),

  industryTemplate: z.string().optional(),

  whenToCollectLead: z.string().optional(),
  afterNMessagesCount: z.number().min(1).default(1),

  customerTriggerKeywords: z.string().optional(),

  bookingIntegration: z.boolean().default(false),
  bookingIntegrationLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  leadNotification: z.boolean().default(false),
  leadNotificationEmail: z.string().optional(),
  autoEscalateOnLeadCapture: z.boolean().default(false),

  customerFormField: z
    .array(
      z.object({
        display_label: z.string().min(1, "Label is required"),
        field_name: z.string().min(1, "Field name is required"),
        field_type: z.enum(["text", "textarea", "email", "phone"]),
        required: z.boolean().default(false),
        placeholder_text: z.string().optional(),
        options: z.string().optional(), // Comma separated for input
      }),
    )
    .optional(),
});

const DEFAULT_CUSTOM_FIELD = {
  display_label: "",
  field_name: "",
  field_type: "text",
  required: false,
  placeholder_text: "",
  options: "",
};

const TEMPLATE_CONFIGS = {
  dental: {
    label: "Dental Clinic",
    keywords: "appointment, consultation, teeth cleaning, dental exam, toothache, pain, emergency, insurance, cost, price",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Preferred Appointment Time", field_name: "preferred_appointment_time", field_type: "text", required: false, placeholder_text: "e.g. Monday morning, weekdays after 3pm", options: "" },
      { display_label: "Insurance Provider", field_name: "insurance_provider", field_type: "text", required: false, placeholder_text: "e.g. Delta Dental, Cigna", options: "" },
    ],
    booking: true,
  },
  hvac: {
    label: "HVAC Services",
    keywords: "repair, installation, maintenance, heating, cooling, air conditioning, furnace, AC, emergency, quote, estimate",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Service Address", field_name: "service_address", field_type: "text", required: true, placeholder_text: "123 Main St, City, State", options: "" },
      { display_label: "Service Needed", field_name: "service_needed", field_type: "text", required: false, placeholder_text: "e.g. AC repair, furnace installation", options: "" },
    ],
    booking: true,
  },
  legal: {
    label: "Legal Services",
    keywords: "consultation, legal advice, lawyer, attorney, case, lawsuit, divorce, accident, injury, contract",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Company/Organization", field_name: "company_organization", field_type: "text", required: false, placeholder_text: "e.g. Acme Corp (leave blank if individual)", options: "" },
      { display_label: "Type of Legal Matter", field_name: "type_of_legal_matter", field_type: "text", required: true, placeholder_text: "e.g. personal injury, contract dispute", options: "" },
      { display_label: "Urgency Level", field_name: "urgency_level", field_type: "text", required: false, placeholder_text: "e.g. urgent, within a week, no rush", options: "" },
    ],
    booking: true,
  },
  real_estate: {
    label: "Real Estate",
    keywords: "property, house, home, buy, sell, rent, mortgage, viewing, tour, listing, price, market value",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "I am interested in", field_name: "interest_type", field_type: "text", required: true, placeholder_text: "e.g. buying, selling, renting", options: "" },
      { display_label: "Preferred Location", field_name: "preferred_location", field_type: "text", required: false, placeholder_text: "e.g. Downtown Austin, TX", options: "" },
      { display_label: "Budget Range", field_name: "budget_range", field_type: "text", required: false, placeholder_text: "e.g. $300k–$500k", options: "" },
    ],
    booking: true,
  },
  automotive: {
    label: "Automotive",
    keywords: "repair, service, maintenance, parts, quote, estimate, warranty, oil change, brakes, engine",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Vehicle Make/Model/Year", field_name: "vehicle_make_model_year", field_type: "text", required: true, placeholder_text: "e.g. 2019 Toyota Camry", options: "" },
      { display_label: "Service Needed", field_name: "service_needed", field_type: "text", required: false, placeholder_text: "e.g. oil change, brake inspection", options: "" },
    ],
    booking: true,
  },
  healthcare: {
    label: "Healthcare",
    keywords: "appointment, consultation, symptoms, treatment, insurance, urgent, pain, medical, doctor, specialist",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: true, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Date of Birth", field_name: "date_of_birth", field_type: "text", required: true, placeholder_text: "MM/DD/YYYY", options: "" },
      { display_label: "Insurance Provider", field_name: "insurance_provider", field_type: "text", required: false, placeholder_text: "e.g. Blue Cross, Aetna", options: "" },
      { display_label: "Reason for Visit", field_name: "reason_for_visit", field_type: "textarea", required: false, placeholder_text: "Briefly describe your symptoms or reason for the appointment", options: "" },
    ],
    booking: true,
  },
  saas: {
    label: "SaaS/Software",
    keywords: "demo, trial, pricing, features, integration, API, support, enterprise, upgrade, subscription",
    fields: [
      { display_label: "Company Name", field_name: "company_name", field_type: "text", required: true, placeholder_text: "e.g. Acme Corp", options: "" },
      { display_label: "Job Title", field_name: "job_title", field_type: "text", required: false, placeholder_text: "e.g. CTO, Product Manager", options: "" },
      { display_label: "Company Size", field_name: "company_size", field_type: "text", required: false, placeholder_text: "e.g. 1–10, 11–50, 50+", options: "" },
      { display_label: "Primary Use Case", field_name: "primary_use_case", field_type: "textarea", required: false, placeholder_text: "What are you hoping to accomplish with our product?", options: "" },
    ],
    booking: true,
  },
  ecommerce: {
    label: "E-commerce",
    keywords: "order, shipping, return, refund, product, stock, availability, bulk order, wholesale, custom",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: false, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Business Name", field_name: "business_name", field_type: "text", required: false, placeholder_text: "e.g. My Store LLC", options: "" },
      { display_label: "Order Type", field_name: "order_type", field_type: "text", required: true, placeholder_text: "e.g. bulk, wholesale, custom print", options: "" },
      { display_label: "Special Requirements", field_name: "special_requirements", field_type: "textarea", required: false, placeholder_text: "Any specific quantities, sizes, or customizations?", options: "" },
    ],
    booking: false,
  },
  consulting: {
    label: "Consulting",
    keywords: "consultation, strategy, advice, proposal, project, scope, timeline, budget, expertise, solution",
    fields: [
      { display_label: "Phone Number", field_name: "phone_number", field_type: "phone", required: false, placeholder_text: "+1 (555) 000-0000", options: "" },
      { display_label: "Company Name", field_name: "company_name", field_type: "text", required: false, placeholder_text: "e.g. Acme Corp", options: "" },
      { display_label: "Project Type", field_name: "project_type", field_type: "text", required: true, placeholder_text: "e.g. marketing strategy, IT audit", options: "" },
      { display_label: "Budget Range", field_name: "budget_range", field_type: "text", required: false, placeholder_text: "e.g. $5k–$20k", options: "" },
    ],
    booking: true,
  },
};

const SettingsTab = () => {
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();
  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isNewSettings, setIsNewSettings] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null); // template waiting for keyword conflict resolution

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableLeadCollection: false,
      customerNameTake: false,
      customerPhoneTake: false,
      customerEmailTake: true,
      industryTemplate: "",
      whenToCollectLead: "interest",
      afterNMessagesCount: 1,
      customerTriggerKeywords: "",
      bookingIntegration: false,
      bookingIntegrationLink: "",
      leadNotification: false,
      leadNotificationEmail: "",
      autoEscalateOnLeadCapture: false,
      customerFormField: [DEFAULT_CUSTOM_FIELD],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customerFormField",
  });

  const isEnabled = form.watch("enableLeadCollection");
  const industryTemplate = form.watch("industryTemplate");
  const whenToCollectLead = form.watch("whenToCollectLead");

  const previewValues = useWatch({ control: form.control });

  // Sync form dirty state to unsaved changes context
  useEffect(() => {
    if (form.formState.isDirty) {
      markDirty();
    } else {
      markClean();
    }
  }, [form.formState.isDirty, markDirty, markClean]);

  // Clean up on unmount
  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  // Track the field count at the time a template was applied
  const lastAppliedTemplateRef = React.useRef(null);
  const lastAppliedFieldCountRef = React.useRef(null);

  // When user adds or removes a field after a template was applied, revert template to "custom"
  useEffect(() => {
    const currentTemplate = form.getValues("industryTemplate");
    if (
      currentTemplate &&
      currentTemplate !== "custom" &&
      lastAppliedTemplateRef.current === currentTemplate &&
      lastAppliedFieldCountRef.current !== null &&
      fields.length !== lastAppliedFieldCountRef.current
    ) {
      form.setValue("industryTemplate", "custom", { shouldDirty: false });
      lastAppliedTemplateRef.current = null;
      lastAppliedFieldCountRef.current = null;
    }
  }, [fields.length]);

  const applyTemplate = (val, keywordMode) => {
    const tpl = TEMPLATE_CONFIGS[val];
    if (!tpl) return;

    // Apply keywords
    if (keywordMode === "replace") {
      form.setValue("customerTriggerKeywords", tpl.keywords);
    } else {
      const existing = form.getValues("customerTriggerKeywords") || "";
      const merged = existing
        ? `${existing.replace(/,\s*$/, "")}, ${tpl.keywords}`
        : tpl.keywords;
      form.setValue("customerTriggerKeywords", merged);
    }

    form.setValue("bookingIntegration", tpl.booking);
    form.setValue("customerFormField", tpl.fields);
    lastAppliedTemplateRef.current = val;
    lastAppliedFieldCountRef.current = tpl.fields.length;

    toast.info(
      `${tpl.label} template applied — keywords ${keywordMode === "replace" ? "replaced" : "merged"}, booking ${tpl.booking ? "enabled" : "disabled"}, and ${tpl.fields.length} field(s) added.`,
    );
  };

  const handleTemplateChange = (val, fieldOnChange) => {
    fieldOnChange(val);
    if (!TEMPLATE_CONFIGS[val]) return; // "custom" selected — no auto-fill

    const existingKeywords = form.getValues("customerTriggerKeywords") || "";

    if (existingKeywords.trim()) {
      // Conflict — ask user what to do
      setPendingTemplate(val);
      toast(
        `You already have keywords. Replace or add ${TEMPLATE_CONFIGS[val].label} keywords?`,
        {
          duration: Infinity,
          action: {
            label: "Replace",
            onClick: () => {
              applyTemplate(val, "replace");
              setPendingTemplate(null);
            },
          },
          cancel: {
            label: "Add",
            onClick: () => {
              applyTemplate(val, "add");
              setPendingTemplate(null);
            },
          },
        },
      );
    } else {
      applyTemplate(val, "replace");
    }
  };

  useEffect(() => {
    if (chatbotId) {
      fetchSettings();
    }
  }, [chatbotId]);

  const fetchSettings = async () => {
    setInitialLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId) throw new Error("Account ID missing");

      const response = await api.get(
        `/chatbots/chatbot/${chatbotId}/lead-settings`,
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;

        // Parse "after_X_messages" into "after_n_messages" and X
        let whenToCollectLead = data.whenToCollectLead;
        let afterNMessagesCount = data.afterNMessagesCount || 1;

        if (whenToCollectLead && whenToCollectLead.startsWith("after_")) {
          const match = whenToCollectLead.match(/^after_(\d+)_messages$/);
          if (match) {
            afterNMessagesCount = parseInt(match[1]);
            whenToCollectLead = "after_n_messages";
          }
        }

        // Transform array to string for display
        const emailString = Array.isArray(data.leadNotificationEmail)
          ? data.leadNotificationEmail.join(", ")
          : "";

        // Transform properties mapping if backend still returns snake_case for some reason,
        // but user says backend returns camelCase, so we trust that.
        // We do need to handle customerFormField options which might be array -> string

        const formattedFormFields = (Array.isArray(data.customerFormField) ? data.customerFormField : []).map((f) => ({
          ...f,
          options: Array.isArray(f.options) ? f.options.join(", ") : f.options,
        }));

        // Limit to 1 block to remove the others from UI/DB upon saving
        const limitedFormFields = formattedFormFields.slice(0, 1);

        form.reset({
          ...data,
          whenToCollectLead,
          afterNMessagesCount,
          leadNotificationEmail: emailString,
          industryTemplate: data.industryTemplate || "custom", // Default to custom if empty?
          customerTriggerKeywords: data.customerTriggerKeywords || "",
          bookingIntegrationLink: data.bookingIntegrationLink || "",
          customerFormField:
            limitedFormFields.length > 0
              ? limitedFormFields
              : [DEFAULT_CUSTOM_FIELD],
        });
        setIsNewSettings(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setIsNewSettings(true);
        form.reset({
          enableLeadCollection: false,
          customerNameTake: false,
          customerPhoneTake: false,
          customerEmailTake: true,
          industryTemplate: "",
          whenToCollectLead: "interest",
          customerTriggerKeywords: "",
          bookingIntegration: false,
          bookingIntegrationLink: "",
          leadNotification: false,
          leadNotificationEmail: "",
          autoEscalateOnLeadCapture: false,
          customerFormField: [DEFAULT_CUSTOM_FIELD],
        });
      } else {
        console.error("Failed to fetch settings", error);
        toast.error("Failed to load settings");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const chatbotId = selectedChatbot.id || selectedChatbot.chatbotId;
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;

      if (!accountId) throw new Error("Account ID missing");

      // Transform data for backend
      const whenToCollectValue =
        values.whenToCollectLead === "after_n_messages"
          ? `after_${values.afterNMessagesCount}_messages`
          : values.whenToCollectLead;

      const payload = {
        ...values,
        whenToCollectLead: whenToCollectValue,
        leadNotificationEmail: values.leadNotificationEmail
          ? values.leadNotificationEmail
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e)
          : [],
        customerFormField: values.customerFormField?.map((f) => ({
          ...f,
          options: f.options
            ? f.options
                .split(",") 
                .map((o) => o.trim())
                .filter((o) => o)
            : [],
        })),
      };

      let response;
      if (isNewSettings) {
        response = await api.post(
          `/chatbots/chatbot/${chatbotId}/lead-settings`,
          payload,
        );
      } else {
        response = await api.patch(
          `/chatbots/chatbot/${chatbotId}/lead-settings`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          isNewSettings
            ? "Settings created successfully"
            : "Settings updated successfully",
        );
        if (isNewSettings) setIsNewSettings(false);
        fetchSettings();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save settings";
      console.error("Submit error", error);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 items-start">
    <div className="min-w-0 flex-1 rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6" data-tour="leads-settings-intro">
        <h3 className="text-lg font-medium">Lead Collection Settings</h3>
        <p className="text-muted-foreground text-sm">
          Configure how and when your chatbot collects visitor information.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Toggle */}
          <FormField
            control={form.control}
            name="enableLeadCollection"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Lead Collection
                  </FormLabel>
                  <FormDescription>
                    Allow the chatbot to collect leads from visitors.
                  </FormDescription>
                </div>
                <FormControl>
                  {initialLoading ? (
                    <Skeleton className="h-6 w-10 rounded-full" />
                  ) : (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Field Toggles */}
            <div
              className={`space-y-4 rounded-lg border p-4 ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <h4 className="mb-4 text-sm font-medium">
                Information to Collect
              </h4>

              <FormField
                control={form.control}
                name="customerNameTake"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="font-normal">Name</FormLabel>
                    </div>
                    <FormControl>
                      {initialLoading ? (
                        <Skeleton className="h-6 w-10 rounded-full" />
                      ) : (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEnabled}
                        />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhoneTake"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="font-normal">
                        Phone Number
                      </FormLabel>
                    </div>
                    <FormControl>
                      {initialLoading ? (
                        <Skeleton className="h-6 w-10 rounded-full" />
                      ) : (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!isEnabled}
                        />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmailTake"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="font-normal">
                        Email Address
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Always required for lead identification and follow-up
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} defaultChecked disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Collection Triggers Section */}
            <div
              className={`space-y-6 rounded-xl border bg-white p-6 shadow-sm ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-pink-50 p-2 text-pink-500">
                  <AlarmClock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    Collection Triggers
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Choose when the AI should attempt to collect visitor contact
                    information
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="whenToCollectLead"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-sm font-semibold">
                      When to collect leads
                    </FormLabel>
                    <FormControl>
                      {initialLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Skeleton className="h-4 w-4 rounded-full" />
                              <Skeleton className="h-4 w-48" />
                            </div>
                          ))}
                        </div>
                      ) : (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                        disabled={!isEnabled}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="interest" id="interest" />
                          <Label
                            htmlFor="interest"
                            className="text-sm font-normal"
                          >
                            When user shows interest (Recommended)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="unable_to_answer"
                            id="unable_to_answer"
                          />
                          <Label
                            htmlFor="unable_to_answer"
                            className="text-sm font-normal"
                          >
                            When unable to answer
                          </Label> 
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="after_n_messages"
                            id="after_n_messages"
                          />
                          <div className="flex items-center gap-2 text-sm font-normal">
                            <span>After</span>
                            <FormField
                              control={form.control}
                              name="afterNMessagesCount"
                              render={({ field: countField }) => (
                                <Input
                                  type="number"
                                  className="h-8 w-16 text-center"
                                  {...countField}
                                  disabled={!isEnabled}
                                  onChange={(e) =>
                                    countField.onChange(Number(e.target.value))
                                  }
                                />
                              )}
                            />
                            <span>messages (static form)</span>
                          </div>
                        </div>
                      </RadioGroup>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Custom Trigger Keywords Section */}
            <div
              className={`space-y-6 rounded-xl border bg-white p-6 shadow-sm ${!isEnabled || whenToCollectLead === "after_n_messages" ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                  <Type className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Custom Trigger Keywords
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Lightbulb className="h-4 w-4 cursor-pointer text-amber-400" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Works great with the{" "}
                          <span className="font-semibold text-blue-400">
                            "When user shows interest"
                          </span>{" "}
                          collection trigger — keywords help detect intent and
                          show the lead form at the right moment.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Define specific keywords that trigger lead collection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-amber-50/50 p-3 text-sm text-amber-600">
                <Lightbulb className="h-4 w-4 shrink-0" />
                <p>
                  Not used with "After X messages" - form shows automatically
                </p>
              </div>

              <FormField
                control={form.control}
                name="customerTriggerKeywords"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-semibold text-slate-500">
                        Keywords (Optional)
                      </FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-400 hover:bg-slate-200">
                              ?
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            If none provided, the system falls back to a set of
                            specialized built-in keywords to detect user intent.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      {initialLoading ? (
                        <Skeleton className="h-[120px] w-full rounded-md" />
                      ) : (
                        <Textarea
                          placeholder="pricing, demo, consultation, quote, appointment, contact, schedule, buy, purchase"
                          className="min-h-[120px] resize-none border-slate-200"
                          {...field}
                          disabled={!isEnabled}
                        />
                      )}
                    </FormControl>
                    <FormDescription className="text-xs leading-relaxed text-slate-400">
                      Enter keywords separated by commas. When visitors mention
                      these words, the AI will attempt to collect their contact
                      information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Industry Template Section */}
          <div
            className={`space-y-4 rounded-lg border p-4 ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="mb-2 flex items-start gap-4">
              <div className="rounded-lg bg-slate-100 p-2">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h4 className="mb-1 text-lg leading-none font-semibold">
                  Industry Template
                </h4>
                <p className="text-muted-foreground text-sm italic">
                  Choose a template optimized for your industry, or select
                  Custom to configure manually
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="industryTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                    Template Selection
                  </FormLabel>
                  {initialLoading ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : (
                  <Select
                    onValueChange={(val) => handleTemplateChange(val, field.onChange)}
                    value={field.value || "custom"}
                    disabled={!isEnabled}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="custom">
                        <div className="flex flex-col">
                          <span className="font-medium">Custom</span>
                          <span className="text-muted-foreground text-xs">
                            Configure your own lead collection settings
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dental">
                        <div className="flex flex-col">
                          <span className="font-medium">Dental Clinic</span>
                          <span className="text-muted-foreground text-xs">
                            Optimized for dental practices and patient
                            scheduling
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hvac">
                        <div className="flex flex-col">
                          <span className="font-medium">HVAC Services</span>
                          <span className="text-muted-foreground text-xs">
                            For heating, cooling, and air conditioning services
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="legal">
                        <div className="flex flex-col">
                          <span className="font-medium">Legal Services</span>
                          <span className="text-muted-foreground text-xs">
                            For law firms and legal consultations
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="real_estate">
                        <div className="flex flex-col">
                          <span className="font-medium">Real Estate</span>
                          <span className="text-muted-foreground text-xs">
                            For realtors and property services
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="automotive">
                        <div className="flex flex-col">
                          <span className="font-medium">Automotive</span>
                          <span className="text-muted-foreground text-xs">
                            For auto repair, dealerships, and car services
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="healthcare">
                        <div className="flex flex-col">
                          <span className="font-medium">Healthcare</span>
                          <span className="text-muted-foreground text-xs">
                            For medical practices and health services
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="saas">
                        <div className="flex flex-col">
                          <span className="font-medium">SaaS/Software</span>
                          <span className="text-muted-foreground text-xs">
                            For software companies and SaaS products
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ecommerce">
                        <div className="flex flex-col">
                          <span className="font-medium">E-commerce</span>
                          <span className="text-muted-foreground text-xs">
                            For online stores and retail businesses
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="consulting">
                        <div className="flex flex-col">
                          <span className="font-medium">Consulting</span>
                          <span className="text-muted-foreground text-xs">
                            For consultants and professional services
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Fields — always visible; populated by template or manually */}
            <div className="mt-4 space-y-4 rounded-lg border bg-slate-50 p-4">
                <h5 className="font-medium text-slate-800">
                  Custom Form Fields
                </h5>
                <p className="text-muted-foreground text-xs">
                  Define additional fields to collect from the user.
                </p>

                {initialLoading ? (
                  <div className="rounded-md border bg-white p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : null}

                {!initialLoading && fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative grid grid-cols-1 gap-4 rounded-md border bg-white p-4 md:grid-cols-2 lg:grid-cols-3"
                  >
                    <FormField
                      control={form.control}
                      name={`customerFormField.${index}.display_label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Display Label
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customerFormField.${index}.field_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs flex items-center gap-1">
                            Field Name
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex h-3.5 w-3.5 cursor-default items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-500">
                                    i
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Used internally to identify this field in lead data and integrations. <br /> Use lowercase with underscores (e.g. company_name). <br /> Not shown to the visitor.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="company_name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customerFormField.${index}.field_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Field Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Placeholder */}
                    <FormField
                      control={form.control}
                      name={`customerFormField.${index}.placeholder_text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Placeholder</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customerFormField.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-y-0 space-x-2 rounded-md border p-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal">
                            Required
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => remove(index)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full border-dashed"
                  onClick={() =>
                    append({
                      display_label: "",
                      field_name: "",
                      field_type: "text",
                      required: false,
                      placeholder_text: "",
                      options: "",
                    })
                  }
                >
                  + Add Field
                </Button>
              </div>
          </div>

          {/* Integrations */}
          <div
            className={`space-y-4 rounded-lg border p-4 ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <h4 className="mb-2 text-sm font-medium">Booking Integration</h4>
            <FormField
              control={form.control}
              name="bookingIntegration"
              render={({ field }) => (
                <FormItem className="mb-4 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="font-normal">
                      Enable Booking Integration
                    </FormLabel>
                    <FormDescription>
                      Link to Calendly or similar tools
                    </FormDescription>
                  </div>
                  <FormControl>
                    {initialLoading ? (
                      <Skeleton className="h-6 w-10 rounded-full" />
                    ) : (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEnabled}
                      />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("bookingIntegration") && (
              <FormField
                control={form.control}
                name="bookingIntegrationLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://calendly.com/your-link"
                        {...field}
                        disabled={!isEnabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Notifications */}
          <div
            data-tour="leads-notifications"
            className={`space-y-4 rounded-lg border p-4 ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <h4 className="mb-2 text-sm font-medium">Notifications</h4>
            <FormField
              control={form.control}
              name="leadNotification"
              render={({ field }) => (
                <FormItem className="mb-4 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="font-normal">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Get notified when a new lead is captured
                    </FormDescription>
                  </div>
                  <FormControl>
                    {initialLoading ? (
                      <Skeleton className="h-6 w-10 rounded-full" />
                    ) : (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEnabled}
                      />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("leadNotification") && (
              <FormField
                control={form.control}
                name="leadNotificationEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Emails</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@example.com, another@example.com"
                        {...field}
                        disabled={!isEnabled}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma separated list of emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Auto-Escalation */}
          <div
            className={`space-y-4 rounded-lg border p-4 ${!isEnabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="mb-2 flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-500">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold">Auto-Escalation</h4>
                <p className="text-muted-foreground text-sm">
                  Automatically hand off conversations to a human agent when a lead is captured
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="autoEscalateOnLeadCapture"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="font-normal">
                      Auto-escalate on lead capture
                    </FormLabel>
                    <FormDescription>
                      When enabled, the conversation will automatically be escalated to a human agent after a lead submits their contact information
                    </FormDescription>
                  </div>
                  <FormControl>
                    {initialLoading ? (
                      <Skeleton className="h-6 w-10 rounded-full" />
                    ) : (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEnabled}
                      />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <GatedAction>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </>
              )}
            </Button>
          </GatedAction>
        </form>
      </Form>
    </div>
    {/* Live preview pane */}
    <div className="hidden xl:block w-80 shrink-0 sticky top-6 self-start">
      <LeadFormPreview values={previewValues} />
    </div>
    </div>
  );
};
 
export default SettingsTab;

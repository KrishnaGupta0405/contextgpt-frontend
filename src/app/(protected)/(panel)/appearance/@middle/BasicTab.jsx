"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { PlayCircle, UploadCloud, Type } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";

const ColorInput = ({ label, field, value, onChange, hint }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-slate-700">{label}</Label>
    <div className="flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-slate-900">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="flex-1 border-none text-sm outline-none focus:ring-0"
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="h-6 w-8 cursor-pointer rounded border-0 p-0"
      />
    </div>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

// Helper for simple drag & drop image upload section
const ImageUploadZone = ({ label, description, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    if (file.size > 1 * 1024 * 1024) {
      alert("Image must be under 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target.result); // Base64 string for preview/saving
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      {description && (
        <p className="mb-2 text-xs text-slate-500">{description}</p>
      )}

      <div
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-6 text-center transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:bg-slate-50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {value ? (
          <img
            src={value}
            alt="preview"
            className="mb-2 h-16 w-16 rounded border border-slate-100 bg-white object-contain shadow-sm"
          />
        ) : (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <UploadCloud className="h-6 w-6 text-slate-400" />
          </div>
        )}
        <p className="text-sm font-medium text-slate-700">
          Click or drag image to upload
        </p>
        <p className="mt-1 text-xs text-slate-400">PNG, JPG, SVG up to 1MB</p>
      </div>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="mt-1 h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
        >
          Remove Image
        </Button>
      )}
    </div>
  );
};

// ── Font Picker Component ─────────────────────────────────────────────────────
const SYSTEM_FONTS = [
  { label: "Default (Plus Jakarta Sans)", value: "Plus Jakarta Sans" },
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Poppins", value: "Poppins" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Arial", value: "Arial" },
  { label: "Verdana", value: "Verdana" },
];

const GOOGLE_FONT_PRESETS = [
  "Inter", "Roboto", "Lato", "Open Sans", "Montserrat",
  "Poppins", "Raleway", "Ubuntu", "Nunito", "Playfair Display",
];

const FontPicker = ({ value, onChange, chatbotId }) => {
  const [tab, setTab] = useState(
    value?.type === "google" ? "google" : value?.type === "upload" ? "upload" : "system"
  );
  const [googleInput, setGoogleInput] = useState(value?.type === "google" ? value.value : "");

  // Sync tab and googleInput when value is loaded from the server after mount
  const prevValueRef = useRef(value);
  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;
    // Only sync if value changed from null/undefined to a real saved value
    if (!prev && value) {
      if (value.type === "google") {
        setTab("google");
        setGoogleInput(value.value || "");
      } else if (value.type === "upload") {
        setTab("upload");
      } else {
        setTab("system");
      }
    }
  }, [value]);
  const [isUploading, setIsUploading] = useState(false);
  const [fontLoadState, setFontLoadState] = useState("idle"); // "idle" | "loading" | "loaded" | "error"
  const fontFileRef = useRef(null);
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Auto-apply google font once verified as loaded
  useEffect(() => {
    if (fontLoadState === "loaded" && tab === "google" && googleInput.trim()) {
      onChangeRef.current({ type: "google", value: googleInput.trim() });
    }
  }, [fontLoadState, tab, googleInput]);

  // Inject google font preview into dashboard head with debounce + load feedback
  useEffect(() => {
    if (tab !== "google") return;
    if (!googleInput.trim()) {
      setFontLoadState("idle");
      return;
    }

    setFontLoadState("loading");
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const fontName = googleInput.trim();
      const id = `gf-preview-${fontName.replace(/\s+/g, "-")}`;

      const injectAndLoad = () => {
        let link = document.getElementById(id);
        if (!link) {
          link = document.createElement("link");
          link.id = id;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
          document.head.appendChild(link);
        }

        // Wait for the stylesheet to load, then verify the font actually exists
        const checkFont = () => {
          document.fonts.load(`16px "${fontName}"`).then((fonts) => {
            if (fonts.length > 0) {
              setFontLoadState("loaded");
            } else {
              setFontLoadState("error");
            }
          }).catch(() => setFontLoadState("error"));
        };

        if (link.sheet) {
          checkFont();
        } else {
          link.onload = checkFont;
          link.onerror = () => setFontLoadState("error");
        }
      };

      injectAndLoad();
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [googleInput, tab]);

  const previewFont =
    tab === "system"
      ? value?.type === "system" ? value.value : "Plus Jakarta Sans"
      : tab === "google"
      ? googleInput || "inherit"
      : value?.type === "upload" ? value.value : "inherit";

  const handleFontFileSelect = async (file) => {
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".woff2", ".ttf"].includes(ext)) {
      toast.error("Only .woff2 or .ttf files are supported.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Font file must be under 2MB.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("font", file);
      const res = await api.post(
        `/chatbots/account/_/chatbot/${chatbotId}/appearance/upload-font`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.data?.url) {
        const fontName = file.name.replace(/\.[^/.]+$/, "");
        onChange({ type: "upload", value: fontName, url: res.data.data.url });
        toast.success("Font uploaded successfully.");
      } else {
        toast.error("Upload failed — no URL returned.");
      }
    } catch {
      toast.error("Font upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-slate-500" />
        <Label className="text-sm font-semibold text-slate-700">Font Family</Label>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 w-fit">
        {[
          { id: "system", label: "System" },
          { id: "google", label: "Google Fonts" },
          { id: "upload", label: "Upload" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              tab === id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* System tab */}
      {tab === "system" && (
        <div className="space-y-2">
          <Select
            value={value?.type === "system" ? value.value : "Plus Jakarta Sans"}
            onValueChange={(val) => onChange({ type: "system", value: val })}
          >
            <SelectTrigger className="w-full border-slate-200 bg-white">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {SYSTEM_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Google Fonts tab */}
      {tab === "google" && (
        <div className="space-y-3">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Google Fonts load from an external CDN. May add ~200–500ms on first visitor load.
          </div>
          <div className="relative">
            <Input
              value={googleInput}
              onChange={(e) => setGoogleInput(e.target.value)}
              placeholder="e.g. Nunito"
              className="border-slate-200 shadow-sm pr-8"
            />
            {fontLoadState === "loading" && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs animate-pulse">
                ⏳
              </span>
            )}
            {fontLoadState === "loaded" && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
            )}
            {fontLoadState === "error" && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-xs">✗</span>
            )}
          </div>
          {fontLoadState === "error" && googleInput.trim() && (
            <p className="text-xs text-red-500">Font not found on Google Fonts. Check the spelling.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {GOOGLE_FONT_PRESETS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setGoogleInput(f);
                  onChange({ type: "google", value: f });
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  value?.type === "google" && value.value === f
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Font files are served from our CDN. WOFF2 recommended for best performance.
          </p>
          <input
            type="file"
            accept=".woff2,.ttf"
            className="hidden"
            ref={fontFileRef}
            onChange={(e) => handleFontFileSelect(e.target.files?.[0])}
          />
          <div
            onClick={() => fontFileRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:bg-slate-50 transition-colors"
          >
            <UploadCloud className="mb-2 h-6 w-6 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              {isUploading ? "Uploading…" : value?.type === "upload" ? `Uploaded: ${value.value}` : "Click to upload .woff2 or .ttf"}
            </p>
            <p className="mt-1 text-xs text-slate-400">Max 2 MB</p>
          </div>
          {value?.type === "upload" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              Remove Font
            </Button>
          )}
        </div>
      )}

      {/* Preview */}
      <div className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Preview</p>
        {tab === "google" && fontLoadState === "loading" ? (
          <p className="text-xs text-slate-400 italic">Loading font…</p>
        ) : tab === "google" && fontLoadState === "error" ? (
          <p className="text-xs text-slate-400 italic">No preview available.</p>
        ) : (
          <p className="text-sm text-slate-700" style={{ fontFamily: previewFont }}>
            The quick brown fox jumps over the lazy dog 0123456789
          </p>
        )}
      </div>
    </div>
  );
};

const BasicTab = () => {
  const { account } = useAuth();
  const { selectedChatbot } = useChatbot();
  const { markDirty, markClean } = useUnsavedChanges();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  // Branding add-on gate: check if user has purchased the "Remove Branding" add-on
  const [hasBrandingAddon, setHasBrandingAddon] = useState(false);
  const [brandingAddonExpiry, setBrandingAddonExpiry] = useState(null);

  useEffect(() => {
    return () => markClean();
  }, [markClean]);

  useEffect(() => {
    api
      .get("/billing/addons/my-addons")
      .then((res) => {
        const addOns = res.data?.data?.addOns || [];
        const activeAddon = addOns.find(
          (a) => a.addOn?.identifier === "remove_branding" && a.status === "active"
        );
        setHasBrandingAddon(!!activeAddon);
        setBrandingAddonExpiry(activeAddon?.periodEnd || null);
      })
      .catch(() => {
        // Silently fail — toggle stays locked
      });
  }, []);

  // Appearance Form State
  const [formData, setFormData] = useState({
    // Content
    chatbotName: "",
    hideTooltip: false,
    tooltip: "",
    welcomeMessage: "",
    inputPlaceholderText: "",
    externalLink: "",
    // Chat Interface
    brandPrimaryColor: "#0000ff",
    brandTextColor: "#80ef80",
    brandIconBgColor: "",
    linkColor: "#cc8899",
    showBackground: true,
    enableDarkMode: false,
    defaultMode: "light",
    fontSize: 14,
    chatHeight: 100,
    chatWidth: 440,
    // Chat Launcher
    iconSize: 48,
    iconPosition: "bottom_right",
    iconShape: "circle",
    distanceFromBottomDesktop: 20,
    horizontalDistanceDesktop: 20,
    distanceFromBottomMobile: 20,
    horizontalDistanceMobile: 20,
    bubbleIconSrc: "",
    // Custom Icons
    botIconSrc: "",
    userIconSrc: "",
    agentIconSrc: "",
    // Watermark
    watermarkBrandIcon: "",
    watermarkBrandText: "",
    watermarkBrandLink: "",
    watermarkBrandInfoShow: false,
    hideWatermarkcontextGPT: false,
    rightToLeftMode: false,
    fontFamily: null,
  });

  useEffect(() => {
    if (account?.id && selectedChatbot?.id) {
      fetchAppearance();
    }
  }, [account?.id, selectedChatbot?.id]);

  const fetchAppearance = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/chatbots/chatbot/${selectedChatbot.id}/appearance`,
      );
      if (response.data.success && response.data.data) {
        setHasExistingSettings(true);
        const data = response.data.data;
        setFormData((prev) => ({
          ...prev,
          chatbotName: data.chatbotName || "",
          hideTooltip: data.hideTooltip ?? false,
          tooltip: data.tooltip || "",
          welcomeMessage: data.welcomeMessage || "",
          inputPlaceholderText: data.inputPlaceholderText || "",
          brandPrimaryColor: data.brandPrimaryColor || "#000000",
          brandTextColor: data.brandTextColor || "#ffffff",
          brandIconBgColor: data.brandIconBgColor || "",
          showBackground: data.showBackground ?? true,
          linkColor: data.linkColor || "#0000ee",
          fontSize: data.fontSize || 14,
          chatHeight: data.chatHeight || 100,
          chatWidth: data.chatWidth || 440,
          externalLink: data.externalLink || "",
          iconSize: data.iconSize || 48,
          iconPosition: data.iconPosition || "bottom_right",
          iconShape: data.iconShape || "circle",
          defaultMode: data.defaultMode == null ? "light" : data.defaultMode,
          watermarkBrandIcon: data.watermarkBrandIcon || "",
          watermarkBrandText: data.watermarkBrandText || "",
          watermarkBrandLink: data.watermarkBrandLink || "",
          watermarkBrandInfoShow: data.watermarkBrandInfoShow ?? false,
          hideWatermarkcontextGPT: data.hideWatermarkcontextGPT ?? false,
          rightToLeftMode: data.rightToLeftMode ?? false,
          enableDarkMode: data.enableDarkMode ?? false,
          distanceFromBottomDesktop: data.distanceFromBottomDesktop ?? 20,
          horizontalDistanceDesktop: data.horizontalDistanceDesktop ?? 20,
          distanceFromBottomMobile: data.distanceFromBottomMobile ?? 20,
          horizontalDistanceMobile: data.horizontalDistanceMobile ?? 20,
          botIconSrc: data.botIconSrc || "",
          userIconSrc: data.userIconSrc || "",
          agentIconSrc: data.agentIconSrc || "",
          bubbleIconSrc: data.bubbleIconSrc || "",
          fontFamily: (() => {
            try {
              if (!data.fontFamily) return null;
              if (typeof data.fontFamily === "object") return data.fontFamily;
              return JSON.parse(data.fontFamily);
            } catch {
              return null;
            }
          })(),
        }));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasExistingSettings(false);
      } else {
        console.error("Failed to fetch appearance settings:", error);
        toast.error("Failed to load appearance settings.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleSave = async () => {
    if (!account?.id || !selectedChatbot?.id) return;

    setIsSaving(true);
    try {
      // fontFamily is temporarily hidden from the UI and excluded from the API payload
      // until CloudFront distribution is set up. Re-enable when ready.
      const { fontFamily: _fontFamily, ...rest } = formData; // eslint-disable-line no-unused-vars
      const payload = {
        ...rest,
        // fontFamily: fontFamily ? JSON.stringify(fontFamily) : null,
      };

      let response;
      if (hasExistingSettings) {
        response = await api.patch(
          `/chatbots/chatbot/${selectedChatbot.id}/appearance`,
          payload,
        );
      } else {
        response = await api.post(
          `/chatbots/chatbot/${selectedChatbot.id}/appearance`,
          payload,
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message || "Appearance settings saved successfully",
        );
        setHasExistingSettings(true);
        markClean();
      } else {
        toast.error(response.data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save appearance settings:", error);
      toast.error(
        error.response?.data?.message || "An error occurred while saving.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex shrink-0 items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Appearance
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-blue-200 bg-white px-3 text-[13px] font-medium text-blue-600 hover:bg-blue-50"
          >
            <PlayCircle className="h-4 w-4 fill-blue-600 text-white" />
            Watch Video Tutorial
          </Button>
        </div>

        <GatedAction>
          <Button
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </GatedAction>
      </div>

      {isLoading ? (
        <div className="space-y-12 pb-10">
          {/* Content section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Content</h2>
              <p className="text-sm text-slate-500">The text shown inside your chatbot.</p>
            </div>
            <div className="max-w-3xl space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Chatbot Name <span className="text-red-500">*</span></Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Tooltip</Label>
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Welcome Message</Label>
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Input Placeholder Text</Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">External Link</Label>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Chat Interface section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chat Interface</h2>
              <p className="text-sm text-slate-500">Colors, typography, and theme settings for the chat window.</p>
            </div>
            <div className="max-w-3xl space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Primary Color</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Text Color</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Background Color</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Link Color</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Font Size (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Chat Height (%)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Chat Width (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Default Color Mode</Label>
                  <Skeleton className="h-10 w-1/2" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Chat Launcher section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chat Launcher</h2>
              <p className="text-sm text-slate-500">The floating bubble that opens your chat widget.</p>
            </div>
            <div className="max-w-3xl space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Distance from Bottom - Desktop (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Horizontal Distance - Desktop (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Distance from Bottom - Mobile (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Horizontal Distance - Mobile (px)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Size</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Position</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Shape</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12 pb-10">

          {/* ── 1. Content ─────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Content</h2>
              <p className="text-sm text-slate-500">
                The text shown inside your chatbot.
              </p>
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Chatbot Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.chatbotName}
                  onChange={(e) => handleInputChange("chatbotName", e.target.value)}
                  className="border-slate-200 shadow-sm"
                />
              </div>

              <TooltipProvider delayDuration={150}>
                <Tooltip open={formData.hideTooltip ? undefined : false}>
                  <TooltipTrigger asChild>
                    <div className={`space-y-1.5 ${formData.hideTooltip ? "cursor-not-allowed opacity-60" : ""}`}>
                      <Label className="text-sm font-semibold text-slate-700">Tooltip</Label>
                      <textarea
                        value={formData.tooltip}
                        onChange={(e) => handleInputChange("tooltip", e.target.value)}
                        disabled={formData.hideTooltip}
                        placeholder="Hello, how can I assist you today?"
                        className="min-h-[80px] w-full resize-none rounded-md border border-slate-200 p-3 text-sm shadow-sm focus:ring-1 focus:ring-slate-900 focus:outline-none disabled:pointer-events-none"
                      />
                      <p className="text-[13px] text-slate-500">
                        Shown above the chat bubble icon. If empty, the welcome message is used.
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Tooltip is hidden — enable it in your settings to edit this field.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Welcome Message</Label>
                <textarea
                  value={formData.welcomeMessage}
                  onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                  placeholder="Hello, how can I assist you today?"
                  className="min-h-[80px] w-full resize-none rounded-md border border-slate-200 p-3 text-sm shadow-sm focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
                <p className="text-[13px] text-slate-500">
                  The first message users see when opening the chat.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Input Placeholder Text</Label>
                <Input
                  value={formData.inputPlaceholderText}
                  onChange={(e) => handleInputChange("inputPlaceholderText", e.target.value)}
                  placeholder="Ask me anything…"
                  className="border-slate-200 shadow-sm"
                />
                <p className="text-[13px] text-slate-500">
                  Placeholder shown in the chat input before the user types.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">External Link</Label>
                <Input
                  value={formData.externalLink}
                  onChange={(e) => handleInputChange("externalLink", e.target.value)}
                  placeholder="https://example.com"
                  className="border-slate-200 shadow-sm"
                />
                <p className="text-[13px] text-slate-500">
                  An icon in the widget header will open this URL in a new tab.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* ── 2. Chat Interface ───────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chat Interface</h2>
              <p className="text-sm text-slate-500">
                Colors, typography, and theme settings for the chat window.
              </p>
            </div>

            <div className="max-w-3xl space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <ColorInput label="Primary Color" field="brandPrimaryColor" value={formData.brandPrimaryColor} onChange={handleInputChange} />
                <ColorInput label="Text Color" field="brandTextColor" value={formData.brandTextColor} onChange={handleInputChange} />
                <ColorInput label="Icon Background Color" field="brandIconBgColor" value={formData.brandIconBgColor} onChange={handleInputChange} hint="If transparent icon background is checked, then this option won't work." />
                <ColorInput label="Link Color" field="linkColor" value={formData.linkColor} onChange={handleInputChange} hint="This applies to conversation starters and conversation followups button shown." />
              </div>

              <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-700">Transparent Icon Background</Label>
                    <p className="text-[13px] text-slate-500">Show no background behind the bot icon (useful for transparent PNG icons)</p>
                  </div>
                  <Switch
                    checked={!formData.showBackground}
                    onCheckedChange={(checked) => handleInputChange("showBackground", !checked)}
                  />
                </div>

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between px-5 py-3 cursor-not-allowed opacity-70">
                        <div className="space-y-0.5 pointer-events-none">
                          <Label className="text-sm font-semibold text-slate-700">Enable Dark Mode Toggle</Label>
                          <p className="text-[13px] text-slate-500">Allow users to switch dark mode inside the chat</p>
                        </div>
                        <div className="pointer-events-none">
                          <Switch
                            checked={formData.enableDarkMode}
                            disabled
                            onCheckedChange={(checked) => handleInputChange("enableDarkMode", checked)}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Option coming soon, under development</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Font Size (px)</Label>
                  <Input
                    type="number"
                    value={formData.fontSize}
                    onChange={(e) => handleInputChange("fontSize", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[13px] text-slate-500">Setting this value offsets all text sizes by the given amount (positive or negative). E.g., if you set +10, a 20px header becomes 30px and a 5px bar becomes 15px. Supports negative values.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Chat Height (%)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={formData.chatHeight}
                    onChange={(e) => handleInputChange("chatHeight", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[13px] text-slate-500">This woks in respect to the whole window size.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Chat Width (px)</Label>
                  <Input
                    type="number"
                    min={200}
                    max={800}
                    value={formData.chatWidth}
                    onChange={(e) => handleInputChange("chatWidth", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[13px] text-slate-500">Width of the chat widget in pixels, default set to 440px.</p>
                </div>

                {/* Font Family picker — temporarily hidden until CloudFront is set up
                <div className="col-span-2">
                  <FontPicker
                    value={formData.fontFamily}
                    onChange={(val) => handleInputChange("fontFamily", val)}
                    chatbotId={selectedChatbot?.id}
                  />
                </div>
                */}

              <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="col-span-2 cursor-not-allowed opacity-70">
                        <div className="pointer-events-none space-y-1.5">
                          <Label className="text-sm font-semibold text-slate-700">Default Color Mode</Label>
                          <Select
                            key={formData.defaultMode}
                            value={formData.defaultMode}
                            disabled
                            onValueChange={(val) => handleInputChange("defaultMode", val)}
                          >
                            <SelectTrigger className="w-1/2 border-slate-200 bg-white">
                              <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light Mode</SelectItem>
                              <SelectItem value="dark">Dark Mode</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Option coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* ── 3. Chat Launcher ────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chat Launcher</h2>
              <p className="text-sm text-slate-500">
                The floating bubble that opens your chat widget.
              </p>
            </div>

            <div className="max-w-3xl space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Distance from Bottom - Desktop (px)</Label>
                  <Input
                    type="number"
                    value={formData.distanceFromBottomDesktop}
                    onChange={(e) => handleInputChange("distanceFromBottomDesktop", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[12px] text-slate-500">
                    Distance from bottom of screen on desktop
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Horizontal Distance - Desktop (px)</Label>
                  <Input
                    type="number"
                    value={formData.horizontalDistanceDesktop}
                    onChange={(e) => handleInputChange("horizontalDistanceDesktop", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[12px] text-slate-500">
                    Distance from left/right edge on desktop
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Distance from Bottom - Mobile (px)</Label>
                  <Input
                    type="number"
                    value={formData.distanceFromBottomMobile}
                    onChange={(e) => handleInputChange("distanceFromBottomMobile", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[12px] text-slate-500">
                    Distance from bottom of screen on mobile
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Horizontal Distance - Mobile (px)</Label>
                  <Input
                    type="number"
                    value={formData.horizontalDistanceMobile}
                    onChange={(e) => handleInputChange("horizontalDistanceMobile", Number(e.target.value))}
                    className="border-slate-200 shadow-sm"
                  />
                  <p className="text-[12px] text-slate-500">
                    Distance from left/right edge on mobile
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Size</Label>
                  <Select
                    value={formData.iconSize ?? "MEDIUM"}
                    onValueChange={(val) => handleInputChange("iconSize", val)}
                  >
                    <SelectTrigger className="border-slate-200 bg-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL">Small (48×48 px)</SelectItem>
                      <SelectItem value="MEDIUM">Medium (56×56 px)</SelectItem>
                      <SelectItem value="LARGE">Large (64×64 px)</SelectItem>
                      <SelectItem value="XL">XL (72×72 px)</SelectItem>
                      <SelectItem value="2XL">2XL (80×80 px)</SelectItem>
                      <SelectItem value="3XL">3XL (96×96 px)</SelectItem>
                      <SelectItem value="4XL">4XL (128×128 px)</SelectItem>
                      <SelectItem value="5XL">5XL (156×156 px)</SelectItem>
                    </SelectContent>
                  </Select> 
                  <p className="text-[12px] text-slate-500">
                    Default Medium
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Position</Label>
                  <Select
                    value={formData.iconPosition}
                    onValueChange={(val) => handleInputChange("iconPosition", val)}
                  >
                    <SelectTrigger className="border-slate-200 bg-white">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom_right">Bottom Right</SelectItem>
                      <SelectItem value="bottom_left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[12px] text-slate-500">
                    Default Bottom Right
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Icon Shape</Label>
                  <Select
                    value={formData.iconShape}
                    onValueChange={(val) => handleInputChange("iconShape", val)}
                  >
                    <SelectTrigger className="border-slate-200 bg-white">
                      <SelectValue placeholder="Shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded_square">Rounded Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-xl">
                <ImageUploadZone
                  label="Bubble Icon"
                  description="Custom icon shown on the closed chat bubble."
                  value={formData.bubbleIconSrc}
                  onChange={(val) => handleInputChange("bubbleIconSrc", val)}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* ── 4. Custom Icons ─────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Custom Icons</h2>
              <p className="text-sm text-slate-500">
                Avatars shown for the bot, user, and human agents in the chat.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4">
              <ImageUploadZone
                label="Bot Icon"
                description="Avatar shown next to bot messages."
                value={formData.botIconSrc}
                onChange={(val) => handleInputChange("botIconSrc", val)}
              />
              <ImageUploadZone
                label="User Icon"
                description="Avatar shown next to user messages."
                value={formData.userIconSrc}
                onChange={(val) => handleInputChange("userIconSrc", val)}
              />
              <ImageUploadZone
                label="Agent Icon"
                description="Avatar shown when a human agent is chatting."
                value={formData.agentIconSrc}
                onChange={(val) => handleInputChange("agentIconSrc", val)}
              />
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* ── 5. Watermark ────────────────────────────────────────────── */}
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Watermark</h2>
              <p className="text-sm text-slate-500">
                Manage the branding shown at the bottom of the chat widget.
              </p>
            </div>

            <div className="max-w-3xl space-y-5">
              <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-700">
                      Hide Default &ldquo;Powered by&rdquo; Watermark
                    </Label>
                    <p className="text-[13px] text-slate-500">
                      Remove the default branding from the widget footer
                    </p>
                    {hasBrandingAddon && brandingAddonExpiry && (
                      <p className="text-[12px] text-emerald-600">
                        Active until{" "}
                        {new Date(brandingAddonExpiry).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                    {!hasBrandingAddon && (
                      <p className="text-[12px] text-amber-600">
                        Requires the{" "}
                        <a href="/pricing" className="underline underline-offset-2 hover:text-amber-700">
                          Remove Branding add-on
                        </a>
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={formData.hideWatermarkcontextGPT}
                    disabled={!hasBrandingAddon}
                    onCheckedChange={(checked) => {
                      if (!hasBrandingAddon) {
                        toast.error("Purchase the 'Remove Branding' add-on to unlock this feature.");
                        return;
                      }
                      handleInputChange("hideWatermarkcontextGPT", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between px-5 py-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-700">Show Custom Watermark</Label>
                    <p className="text-[13px] text-slate-500">
                      Display your own branding in the widget footer
                    </p>
                  </div>
                  <Switch
                    checked={!hasBrandingAddon ? false : formData.watermarkBrandInfoShow}
                    disabled={!hasBrandingAddon}
                    onCheckedChange={(checked) => {
                      if (!hasBrandingAddon) return;
                      handleInputChange("watermarkBrandInfoShow", checked);
                    }}
                  />
                </div>
              </div>

              {hasBrandingAddon && formData.watermarkBrandInfoShow && (
                <div className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <ImageUploadZone
                    label="Watermark Brand Icon"
                    description="Your company logo for the watermark (small square or rectangular format works best)."
                    value={formData.watermarkBrandIcon}
                    onChange={(val) => handleInputChange("watermarkBrandIcon", val)}
                  />

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Watermark Brand Text</Label>
                    <Input
                      value={formData.watermarkBrandText}
                      onChange={(e) => handleInputChange("watermarkBrandText", e.target.value)}
                      placeholder="e.g. Powered by MyCompany"
                      className="border-slate-200 bg-white shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700">Watermark Brand Link</Label>
                    <Input
                      value={formData.watermarkBrandLink}
                      onChange={(e) => handleInputChange("watermarkBrandLink", e.target.value)}
                      placeholder="https://mycompany.com"
                      className="border-slate-200 bg-white shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default BasicTab;

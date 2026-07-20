"use client";

// First-login questionnaire. Lives under (protected) but outside (panel) so it
// renders full-screen without the sidebar — the user has no chatbot yet, so the
// panel chrome would be mostly empty and confusing.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { cn } from "@/lib/utils";
import {
  Headset, TrendingUp, Library, BookOpen, GraduationCap, ShoppingBag,
  Compass, Globe, Clock, Users,
  Check, Mail, Ellipsis,
} from "lucide-react";
import {
  BoxIcon, GoogleDriveIcon, ICloudIcon, ConfluenceIcon, DropboxIcon,
  GitBookIcon, GithubIcon, MegaCloudIcon, NotionIcon, OneDriveIcon,
  SharePointIcon, LocalUploadIcon, YoutubeIcon, GoogleIcon, ProductHuntIcon,
  RedditIcon, LinkedInIcon, TwitterIcon, IndieHackersIcon,
} from "../../../../public/icons/IconSvg";

const PRIMARY_GOALS = [
  { value: "customer_support", label: "Customer Support", hint: "Answer questions from your customers, around the clock", Icon: Headset },
  { value: "sales_lead_gen", label: "Sales & Lead Generation", hint: "Qualify visitors and capture leads automatically", Icon: TrendingUp },
  { value: "internal_kb", label: "Internal Knowledge Base", hint: "Help your team find answers in your own docs", Icon: Library },
  { value: "ecommerce", label: "Product & Order Help", hint: "Guide shoppers and answer order questions", Icon: ShoppingBag },
  { value: "exploring", label: "Just Exploring", hint: "Having a look around first — that works too", Icon: Compass },
  { value: "other", label: "Something else", hint: "Tell us what you have in mind", Icon: Ellipsis },
];

const FIRST_SOURCES = [
  { value: "website", label: "My Website", Icon: Globe },
  { value: "google_drive", label: "Google Drive", Icon: GoogleDriveIcon },
  { value: "onedrive", label: "OneDrive", Icon: OneDriveIcon },
  { value: "sharepoint", label: "SharePoint", Icon: SharePointIcon },
  { value: "dropbox", label: "Dropbox", Icon: DropboxIcon },
  { value: "box", label: "Box", Icon: BoxIcon },
  { value: "icloud", label: "iCloud", Icon: ICloudIcon },
  { value: "mega", label: "MEGA", Icon: MegaCloudIcon },
  { value: "notion", label: "Notion", Icon: NotionIcon },
  { value: "confluence", label: "Confluence", Icon: ConfluenceIcon },
  { value: "gitbook", label: "GitBook", Icon: GitBookIcon },
  { value: "github", label: "GitHub", Icon: GithubIcon },
  { value: "local", label: "Local Upload", Icon: LocalUploadIcon },
  { value: "later", label: "I'll decide later", Icon: Clock },
];

// Shown only once "Local Upload" is picked, so the choice above stays a single
// clean row of connectors rather than a mix of sources and file formats.
const LOCAL_UPLOAD_TYPES = [
  { value: "pdf", label: "PDF", fileName: "guide.pdf" },
  { value: "doc", label: "Word", fileName: "handbook.docx" },
  { value: "ppt", label: "PowerPoint", fileName: "deck.pptx" },
  { value: "sheet", label: "Spreadsheet", fileName: "data.xlsx" },
  { value: "csv", label: "CSV", fileName: "rows.csv" },
  { value: "text", label: "Plain text", fileName: "notes.txt" },
  { value: "markdown", label: "Markdown", fileName: "readme.md" },
  { value: "raw", label: "Raw / other", fileName: "dump.json" },
];


const REFERRAL_SOURCES = [
  { value: "google", label: "Google", Icon: GoogleIcon },
  { value: "product_hunt", label: "Product Hunt", Icon: ProductHuntIcon },
  { value: "indie_hackers", label: "Indie Hackers", Icon: IndieHackersIcon },
  { value: "reddit", label: "Reddit", Icon: RedditIcon },
  { value: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { value: "twitter", label: "X (Twitter)", Icon: TwitterIcon },
  { value: "youtube", label: "YouTube", Icon: YoutubeIcon },
  { value: "newsletter", label: "A newsletter or email", Icon: Mail },
  { value: "friend", label: "A friend", Icon: Users },
  { value: "other", label: "Somewhere else", Icon: Ellipsis },
];

// Personal-email providers, where the domain says nothing about the user's site.
const GENERIC_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
  "yahoo.com", "yahoo.co.in", "icloud.com", "me.com", "proton.me",
  "protonmail.com", "aol.com", "zoho.com", "mail.com", "gmx.com", "yandex.com",
];

function guessWebsiteFromEmail(email) {
  const domain = email?.split("@")[1]?.toLowerCase();
  if (!domain || GENERIC_EMAIL_DOMAINS.includes(domain)) return "";
  return `https://${domain}`;
}

// Radio-style option card. Shared by every question so the whole flow reads as
// one surface rather than four differently-styled screens.
function OptionCard({ selected, label, hint, Icon, fileName, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border p-4 text-left",
        "transition-[border-color,box-shadow,transform] duration-150",
        "hover:-translate-y-px hover:border-blue-300 hover:shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "border-blue-600 bg-blue-50/60 shadow-sm"
          : "border-slate-200 bg-white",
      )}
    >
      {/* Icon tile: lucide glyph for concepts, FileTypeIcon for anything that
          maps to a real file format so it matches the rest of the product. */}
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          fileName
            ? "bg-white ring-1 ring-slate-200"
            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
        )}
      >
        {fileName ? (
          <FileTypeIcon fileName={fileName} className="size-5" />
        ) : Icon ? (
          <Icon className="size-[18px]" strokeWidth={2} />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-lg font-semibold text-slate-900">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">{hint}</span>
        ) : null}
      </span>

      {/* Reserve the slot always so selecting does not reflow the text. */}
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-opacity",
          selected ? "bg-blue-600 opacity-100" : "opacity-0",
        )}
      >
        <Check className="size-3 text-white" strokeWidth={3.5} />
      </span>
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, account, subscription, login } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Q1 and Q2 are multi-select — most people have more than one goal and more
  // than one place their content lives, so forcing a single pick loses signal.
  const [primaryGoals, setPrimaryGoals] = useState([]);
  const [firstSources, setFirstSources] = useState([]);
  const [localUploadTypes, setLocalUploadTypes] = useState([]);

  const toggle = (setter) => (value) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  const [referralSources, setReferralSources] = useState([]);
  // Free-text detail for the "other" escape hatches, so we capture the goal or
  // channel we never thought to list instead of dropping it into a bucket.
  const [primaryGoalOther, setPrimaryGoalOther] = useState("");
  const [referralSourceOther, setReferralSourceOther] = useState("");

  // null means "user hasn't typed yet", so we fall back to the domain guess.
  // Derived rather than seeded via an effect, which would cascade a render.
  const [websiteUrlInput, setWebsiteUrlInput] = useState(null);
  const websiteUrl =
    websiteUrlInput ?? guessWebsiteFromEmail(user?.email);

  // Built dynamically because the website field only matters if they picked
  // Website as a source.
  const steps = useMemo(() => {
    const list = ["goal", "source"];
    if (firstSources.includes("website")) list.push("website");
    list.push("referral");
    return list;
  }, [firstSources]);

  // Clamp during render instead of in an effect: deselecting "Website" shrinks
  // the step list, which can leave `step` past the end for one frame.
  const safeStep = Math.min(step, steps.length - 1);
  const currentStep = steps[safeStep];
  const isLastStep = safeStep === steps.length - 1;

  const canAdvance =
    (currentStep === "goal" && primaryGoals.length > 0 &&
      (!primaryGoals.includes("other") || !!primaryGoalOther.trim())) ||
    (currentStep === "source" && firstSources.length > 0) ||
    currentStep === "website" ||
    currentStep === "referral";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/onboarding", {
        primaryGoals,
        firstSources,
        localUploadTypes: firstSources.includes("local") ? localUploadTypes : [],
        websiteUrl: firstSources.includes("website")
          ? websiteUrl.trim() || null
          : null,
        primaryGoalOther: primaryGoals.includes("other")
          ? primaryGoalOther.trim() || null
          : null,
        referralSources,
        referralSourceOther: referralSources.includes("other")
          ? referralSourceOther.trim() || null
          : null,
      });

      // Flip the guard flag locally so OnboardingGuard doesn't bounce us
      // straight back here before the next /users/current-user refresh.
      login({ ...user, onboardingCompleted: true }, account, subscription);

      router.replace("/select-chatbot");
    } catch (error) {
      console.log("Onboarding submit error:", error);
      toast.error("Could not save your answers", {
        description:
          error.response?.data?.message || "Please try again in a moment.",
      });
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isLastStep) handleSubmit();
    else setStep(safeStep + 1);
  };

  // Measure completed steps, not the current one — on step 1 nothing is done
  // yet, so the bar should sit at a small sliver rather than a full segment.
  // The 6% floor just keeps the bar visible instead of looking broken/empty.
  const progress = Math.max(6, (safeStep / steps.length) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        {/* Plain div progress bar — there is no shadcn progress primitive in
            this project and a single bar does not justify adding one. */}
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-slate-400">
          <span>Step {safeStep + 1} of {steps.length}</span>
          <span>{Math.round((safeStep / steps.length) * 100)}% complete</span>
        </div>
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-blue-600"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {currentStep === "goal" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  What do you want your chatbot to do?
                </h1>
                <p className="mt-1.5 text-[14px] text-slate-500">
                  Required — pick as many as you like, it helps us tailor what
                  you see first.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {PRIMARY_GOALS.map((o) => (
                    <OptionCard
                      key={o.value}
                      label={o.label}
                      hint={o.hint}
                      Icon={o.Icon}
                      selected={primaryGoals.includes(o.value)}
                      onClick={() => toggle(setPrimaryGoals)(o.value)}
                    />
                  ))}
                </div>
                {primaryGoals.includes("other") && (
                  <Input
                    className="mt-3 h-11"
                    placeholder="What would you like it to do?"
                    value={primaryGoalOther}
                    onChange={(e) => setPrimaryGoalOther(e.target.value)}
                    autoFocus
                  />
                )}
              </>
            )}

            {currentStep === "source" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  What should it learn from first?
                </h1>
                <p className="mt-1.5 text-[14px] text-slate-500">
                  Required — select all that apply, we&apos;ll take you straight
                  there once you&apos;re done.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {FIRST_SOURCES.map((o) => (
                    <OptionCard
                      key={o.value}
                      label={o.label}
                      Icon={o.Icon}
                      fileName={o.fileName}
                      selected={firstSources.includes(o.value)}
                      onClick={() => {
                        toggle(setFirstSources)(o.value);
                        // Dropping Local Upload should not leave orphan formats.
                        if (o.value === "local" && firstSources.includes("local")) {
                          setLocalUploadTypes([]);
                        }
                      }}
                    />
                  ))}
                </div>

                {firstSources.includes("local") && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-[13px] font-semibold text-slate-700">
                      What kind of files? <span className="font-normal text-slate-500">Optional</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {LOCAL_UPLOAD_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          aria-pressed={localUploadTypes.includes(t.value)}
                          onClick={() => toggle(setLocalUploadTypes)(t.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium",
                            "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                            localUploadTypes.includes(t.value)
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                          )}
                        >
                          <FileTypeIcon fileName={t.fileName} className="size-4" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentStep === "website" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  What&apos;s your website?
                </h1>
                <p className="mt-1.5 text-[14px] text-slate-500">
                  Optional — you can always add or change this later.
                </p>
                <Input
                  className="mt-6 h-12"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrlInput(e.target.value)}
                  autoFocus
                />
              </>
            )}

            {currentStep === "referral" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900">
                  How did you hear about us?
                </h1>
                <p className="mt-1.5 text-[14px] text-slate-500">
                  Optional — pick as many as you like, we&apos;re genuinely curious.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {REFERRAL_SOURCES.map((o) => (
                    <OptionCard
                      key={o.value}
                      label={o.label}
                      Icon={o.Icon}
                      selected={referralSources.includes(o.value)}
                      onClick={() => toggle(setReferralSources)(o.value)}
                    />
                  ))}
                </div>
                {referralSources.includes("other") && (
                  <Input
                    className="mt-3 h-11"
                    placeholder="Where did you find us?"
                    value={referralSourceOther}
                    onChange={(e) => setReferralSourceOther(e.target.value)}
                    autoFocus
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, safeStep - 1))}
            disabled={safeStep === 0 || submitting}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={handleNext} disabled={!canAdvance || submitting} className="min-w-[120px]">
              {submitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Setting up...
                </>
              ) : isLastStep ? (
                "Finish"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  Zap,
  Search,
  MessageSquare,
  Check,
  ExternalLink,
  Bot,
  HelpCircle,
  ChevronRight,
  Layers,
  Sparkle
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { CustomBreadcrumb } from "@/components/ui/CustomBreadcrumb";
import { cn } from "@/lib/utils";
import AskTrigger from "@/components/AskTrigger";
import {
  GoogleDriveIcon,
  AutomationIcon,
  CitedSourcesIcon,
  DataEncryptionIcon,
  ApiIcon,
  RbacIcon,
  IntegrationsIcon,
  DataSubprocessorsIcon,
  ImportKnowledgeIcon,
  WebsiteEmbeddingIcon,
} from "../../../../../public/icons/IconSvg";
import { HOW_IT_WORKS_STEPS } from "../../features/features.config";
import IntegrationsMarquee from "../IntegrationsMarquee";

const SITE_URL = "https://contextgpt.co";
const NAME = "Google Drive";
const TAGLINE =
  "Turn every doc, sheet, and slide sitting in Google Drive into an instant, self-learning AI chatbot knowledge base.";

const FAQS = [
  {
    question: "How do I connect Google Drive with ChatGPT / ContextGPT?",
    answer:
      "In your ContextGPT dashboard, navigate to Data Sources, choose Google Drive, authorize securely via 1-click Google OAuth, and select the specific folders or files you want your chatbot to learn from. Indexing begins automatically.",
  },
  {
    question: "Which Google Drive file formats are supported?",
    answer:
      "ContextGPT seamlessly indexes Google Docs, Google Sheets, Google Slides, PDFs, plain text files (.txt), and Word documents stored inside your Google Drive workspace.",
  },
  {
    question: "Will the chatbot update automatically when I edit a Drive file?",
    answer:
      "Yes! You can trigger a 1-click resync from your dashboard or set automatic sync schedules so your chatbot's knowledge base always reflects the newest edits made in Google Drive.",
  },
  {
    question: "Is my Google Drive data secure and private?",
    answer:
      "Absolutely. ContextGPT uses official Google read-only OAuth scopes, standard AES-256 encryption at rest, and strict data privacy controls. Your documents are never stored insecurely or used to train public LLM models.",
  },
  {
    question: "Is the Google Drive integration included in the free trial?",
    answer:
      "Yes! Google Drive is available as a core data source across all ContextGPT plans, and you can test it with a 7-day risk-free trial.",
  },
];

const STEPS = [
  "Open your ContextGPT dashboard and select Google Drive under Data Sources",
  "Authenticate securely using 1-click Google OAuth with read-only access",
  "Select the specific Google Drive folders or files to index into your knowledge base",
  "Let ContextGPT extract text, chunk content, and generate AI vector embeddings",
  "Deploy your trained AI chatbot to your website, Slack, WhatsApp, or customer support portal",
];

const SAMPLE_FILES = [
  {
    id: "doc1",
    name: "Company_Policy_&_Benefits_2026.gdoc",
    type: "Google Doc",
    size: "1.2 MB",
    updated: "10 mins ago",
    question: "What is our remote work stipend policy?",
    answer:
      "According to Company_Policy_&_Benefits_2026.gdoc (Section 4.2), all full-time employees are eligible for a $500 annual home office allowance, usable for hardware, ergonomic chairs, or high-speed internet.",
    confidence: "99.4%",
    badgeColor: "bg-[#155ded]/10 text-[#155ded] border-[#155ded]/20",
  },
  {
    id: "doc2",
    name: "Customer_Support_SOP_v3.pdf",
    type: "PDF Document",
    size: "3.4 MB",
    updated: "2 hours ago",
    question: "How do we handle refund requests for annual plans?",
    answer:
      "As detailed in Customer_Support_SOP_v3.pdf (Page 12), customers on annual plans are eligible for a full pro-rated refund within the first 14 days of purchase. After 14 days, account credit is issued.",
    confidence: "98.8%",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    id: "doc3",
    name: "Q3_Pricing_&_Tier_Breakdown.gsheet",
    type: "Google Sheet",
    size: "820 KB",
    updated: "Yesterday",
    question: "What features are included in the Pro tier?",
    answer:
      "Referencing Q3_Pricing_&_Tier_Breakdown.gsheet (Tab: Tiers), the Pro Plan ($49/mo) includes 5,000 AI responses/month, unlimited Google Drive resyncs, custom branding, and Slack integration.",
    confidence: "99.1%",
    badgeColor: "bg-[#155ded]/10 text-[#155ded] border-[#155ded]/20",
  },
];

const FEATURES = [
  {
    title: "Real-Time Auto Resync",
    description:
      "Update a document in Google Drive, hit resync, and your chatbot instantly answers with the newest policies, prices, or specs without manual copy-pasting.",
    icon: AutomationIcon,
  },
  {
    title: "Multi-Format Support",
    description:
      "Native parsing for Google Docs, Sheets, Slides, PDFs, TXT, and Docx files stored across shared team drives.",
    icon: CitedSourcesIcon,
  },
  {
    title: "Granular Security & Scope",
    description:
      "Choose exactly which folders or subfolders ContextGPT can access. Keep sensitive financial records private while publishing public SOPs.",
    icon: RbacIcon,
  },
  {
    title: "Verifiable Source Citations",
    description:
      "Every response generated by the AI includes direct file name and page citations, so users can verify answers against your exact Google Drive docs.",
    icon: ApiIcon,
  },
  {
    title: "Enterprise OAuth Encryption",
    description:
      "100% read-only Google OAuth authorization. Your documents are encrypted with AES-256 and never used to train open LLMs.",
    icon: DataEncryptionIcon,
  },
  {
    title: "Multi-Channel Deployment",
    description:
      "Once trained on your Google Drive files, deploy your chatbot to your Website, Slack, WhatsApp, Zendesk, or custom web API.",
    icon: IntegrationsIcon,
  },
];


export default function Page() {
  const pathname = usePathname();
  const slug = pathname?.split("/").filter(Boolean).pop();
  const [activeFileId, setActiveFileId] = useState(SAMPLE_FILES[0].id);

  const activeFile = SAMPLE_FILES.find((f) => f.id === activeFileId) || SAMPLE_FILES[0];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to connect ${NAME} with ContextGPT`,
    step: STEPS.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
  };

  const breadcrumbSchema = slug
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Integrations",
            item: `${SITE_URL}/integration`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${NAME} ChatGPT Integration`,
            item: `${SITE_URL}/integration/${slug}`,
          },
        ],
      }
    : null;

  const problems = [
    {
      bold: "Your best answers are buried in Drive,",
      rest: " scattered across docs, sheets, and slides no visitor can search",
      chatMessage: "Why is having answers buried in Google Drive a problem, and how does ContextGPT fix that?",
    },
    {
      bold: "Leads ask questions your team answers manually,",
      rest: " copy-pasting the same policy or pricing doc over and over",
      chatMessage: "How can ContextGPT stop my team from manually copy-pasting Drive docs to answer leads?",
    },
    {
      bold: "Drive files change constantly,",
      rest: " but your website and support answers quietly go stale",
      chatMessage: "How does ContextGPT make sure answers stay accurate when my Google Drive files change?",
    },
    {
      bold: "A slow answer loses the lead,",
      rest: " even when the correct information was sitting in your Drive the whole time",
      chatMessage: "How does ContextGPT turn my Google Drive content into instant answers so I stop losing leads?",
    },
  ]

  const benefits = [
    {
      bold: "Get started in 5 minutes:",
      rest: " connect Google Drive and train your AI straight from your existing docs",
      chatMessage: "How can I get ContextGPT set up with Google Drive in just 5 minutes?",
    },
    {
      bold: "Turn Drive into instant answers:",
      rest: " every doc, sheet, and slide becomes something leads can actually query",
      chatMessage: "How does ContextGPT turn my Google Drive files into instant answers for leads?",
    },
    {
      bold: "Capture leads around the clock:",
      rest: " even when you're busy, offline, or asleep, powered by what's already in your Drive",
      chatMessage: "How can ContextGPT capture leads for my business 24/7 using my Google Drive content?",
    },
    {
      bold: "Always up to date:",
      rest: " edit a file in Drive and your chatbot's answers update right along with it",
      chatMessage: "How does ContextGPT keep chatbot answers in sync when I update files in Google Drive?",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-[#155ded] selection:text-white">
      {/* Schema scripts for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      {/* ─── Top Navigation Breadcrumb ─── */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <CustomBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Integrations", href: "/integration" },
              { label: "Google Drive ChatGPT Integration" },
            ]}
          />
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#155ded]/5 via-white to-slate-50 pt-12 pb-24 lg:pt-20 lg:pb-32">
        <AnimatedGridPattern
          numSquares={35}
          maxOpacity={0.15}
          duration={3}
          repeatDelay={1}
          height={50}
          width={50}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-20%] h-[140%] skew-y-6"
          )}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Integration Bridge Pill */}
          {/* <div 
            className={cn(
              "group inline-flex rounded-full border border-black/5 bg-neutral-100 transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            )}
          >
            <AnimatedShinyText className="inline-flex items-center gap-3 rounded-full border border-[#155ded]/20 bg-white px-4 py-2 shadow-xs transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#155ded]/10 p-1">
                  <GoogleDriveIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Google Drive</span>
              </div>
              -
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 p-1">
                  <Image
                    src="/icons/Contextgpt_icon.png"
                    alt="ContextGPT"
                    width={16}
                    height={16}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700">ContextGPT</span>
              </div>
            </AnimatedShinyText>
          </div> */}

          {/* Title */}
          <h1
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.12]"
          >
            Connect <span className="bg-gradient-to-r from-[#155ded] via-indigo-600 to-indigo-600 bg-clip-text text-transparent">Google Drive</span> to ChatGPT
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            Turn every doc, sheet, slide deck, and PDF inside Google Drive into an intelligent, self-learning AI chatbot. Automatically sync team knowledge and answer customer questions instantly with verifiable source citations.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <ShimmerButton
                shimmerColor="#a7c4fa"
                background="linear-gradient(135deg, #155ded 0%, #1e40af 100%)"
                borderRadius="14px"
                className="h-13 px-8 text-base font-semibold text-white shadow-xl shadow-[#155ded]/20"
              >
                <span className="flex items-center gap-2">
                  Start 7-Day Free Trial
                  <ArrowRight className="h-4 w-4" />
                </span>
              </ShimmerButton>
            </Link>

            <Link
              href="/integration"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-300 bg-white px-7 text-base font-semibold text-slate-800 shadow-xs"
            >
              View All Integrations
            </Link>
          </div>

          {/* Key Value Micro-Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-slate-600">
            {[
              { text: "7-day risk-free trial", msg: "Tell me about the 7-day free trial." },
              { text: "OAuth 2.0 Secure Sync", msg: "How secure is the Google Drive sync?" },
              { text: "Auto-Resync on Doc Edits", msg: "How does real-time resync work?" },
              { text: "100+ Global Languages", msg: "Does ContextGPT support multi-language documents?" },
            ].map(({ text, msg }) => (
              <span
                key={text}
                onClick={() =>
                  window.$cgpt?.push(["do", "message:send", msg])
                }
                className="flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#155ded]" />
                <span className="underline decoration-slate-300 underline-offset-4">
                  {text}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Intro / Narrative Section ─── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        {/* Decorative background accents */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#155ded]/5 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">

          <div className="space-y-8 mt-5">
            <p className="text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl sm:leading-relaxed">
              <span className="float-left mr-1 font-[family-name:var(--font-geist-mono)] text-6xl font-bold leading-[0.8] text-[#155ded] sm:text-7xl">
                S
              </span>
              o, if you&apos;re reading this, then you &apos;ve been surfing around the internet for a straightforward way to connect{" "}
              <span className="font-semibold text-[#155ded]">Google Drive</span> to ChatGPT or maybe Gemini or Claude or maybe some other LLMs, and get real answers pulled straight from your own files.{" "}
              <span className="whitespace-nowrap">Good news</span> — you&apos;ve landed in the right place.
            </p>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xs sm:p-8">
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                At <span className="font-semibold text-slate-900">ContextGPT</span>, we built exactly
                 this kind of solution. You point us at your Google Drive, we ingest your docs,
                  sheets, slides, and PDFs, and turn them into a searchable knowledge base your 
                  chatbot can actually reason over. <br/> 
                  Your File changed ? No problem, using Auto-Syncronization the knowledge base updated regularly, no irrelevant answers based on the internet.

              </p>
            </div>

            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Under the hood, we let you choose from the leading LLMs on the market, so you&apos;re never locked into one model&apos;s quirks or pricing. Whether that&apos;s the latest GPT release or another frontier model, ContextGPT handles the retrieval and citation work so the model always answers from{" "}
              <span className="border-b-2 border-[#155ded]/30 font-medium text-slate-800">your actual documents</span>, not a guess. If you&apos;ve been putting off setting this up because it sounded complicated, it isn&apos;t.{" "}
              <span className="font-semibold text-slate-900">Give it five minutes</span> and you&apos;ll see what we mean.
            </p>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">

              And the best part is that if your team is on {" "}
              <span className="tracking-wide font-semibold underline underline-offset-4 decoration-blue-500 text-black">Slack</span>,{" "}
              <span className="tracking-wide font-semibold underline underline-offset-4 decoration-green-500 text-black">Zendesk</span>,{" "}
              <span className="tracking-wide font-semibold underline underline-offset-4 decoration-orange-500 text-black">Freshdesk</span>,{" "}
              <span className="tracking-wide font-semibold underline underline-offset-4 decoration-purple-500 text-black">Zoho</span> or maybe some other place,
              you can staright away connect that into ContextGPT and get answer there :).
              Checkout <Link className="text-[#155ded] hover:underline" href="/integration">Integrations</Link> {" "}
              for the full list of supported integrations.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Preview / Demo Section ─── */}
      {/* <section className="relative mx-auto max-w-6xl px-4 -mt-8 pb-20 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xl shadow-slate-200/70 dark:bg-slate-900 dark:border-slate-800">
          <BorderBeam size={160} duration={8} colorFrom="#155ded" colorTo="#6366f1" borderWidth={2} />

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-900 text-white">
            {/* Header bar */}
            {/* <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-[#155ded]" />
                <span className="ml-2 text-xs font-mono text-slate-400">ContextGPT Google Drive Knowledge Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155ded]/10 px-2.5 py-0.5 text-xs font-medium text-[#155ded] border border-[#155ded]/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#155ded] animate-pulse" />
                  Live Sync Active
                </span>
              </div>
            </div> */}

            {/* Content area: Split panel */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800"> */}
              {/* Left Panel: Google Drive Files */}
              {/* <div className="lg:col-span-5 p-5 bg-slate-950/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/Contextgpt_icon.png"
                      alt="ContextGPT"
                      width={16}
                      height={16}
                      className="h-4 w-4 shrink-0 rounded-full object-contain"
                    />
                    <h3 className="text-sm font-semibold text-slate-200">Indexed Drive Files</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">3 Documents</span>
                </div>

                <div className="space-y-2.5">
                  {SAMPLE_FILES.map((file) => {
                    const isActive = file.id === activeFileId;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all text-xs flex items-start gap-3",
                          isActive
                            ? "bg-slate-800/90 border-slate-700 shadow-md"
                            : "bg-slate-900/50 border-slate-800"
                        )}
                      >
                        <div className="mt-0.5 rounded-md bg-slate-800 p-1.5 text-[#155ded] shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200 truncate">{file.name}</span>
                            {isActive && <Check className="h-3.5 w-3.5 text-[#155ded] shrink-0 ml-1" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                            <span>•</span>
                            <span className="text-[#155ded] font-medium">Synced</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 p-3 rounded-lg border border-slate-800 bg-slate-900/30 text-slate-400 text-xs">
                  <p className="flex items-center gap-1.5 font-medium text-slate-300">
                    <RefreshCw className="h-3.5 w-3.5 text-[#155ded]" />
                    Auto-Sync Active
                  </p>
                  <p className="mt-1 text-[11px]">
                    Any edits made in Google Drive sync straight to your AI chatbot memory.
                  </p>
                </div>
              </div> */}

              {/* Right Panel: ContextGPT Chat AI Response Simulator */}
              {/* <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-slate-900/80">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#155ded] text-white font-bold text-xs">
                        AI
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">ContextGPT Assistant</p>
                        <p className="text-[10px] text-slate-400">Trained on active Google Drive knowledge</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-[#155ded]/30 bg-[#155ded]/10 text-[#155ded] text-[10px]">
                      Confidence: {activeFile.confidence}
                    </Badge>
                  </div> */}

                  {/* Chat messages */}
                  {/* <div className="mt-5 space-y-4"> */}
                    {/* User Question */}
                    {/* <div className="flex items-start justify-end gap-2">
                      <div className="max-w-md rounded-2xl rounded-tr-xs bg-[#155ded] px-4 py-2.5 text-xs text-white shadow-sm">
                        {activeFile.question}
                      </div>
                    </div> */}

                    {/* AI Response */}
                    {/* <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#155ded]/20 text-[#155ded] border border-[#155ded]/30 text-xs">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="rounded-2xl rounded-tl-xs bg-slate-800/90 border border-slate-700/80 p-4 text-xs text-slate-200 leading-relaxed">
                          <p>{activeFile.answer}</p> */}

                          {/* Citation pill */}
                          {/* <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] text-[#155ded] font-medium">
                              <GoogleDriveIcon className="h-3.5 w-3.5" />
                              <span>Source: {activeFile.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Verified Citation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Click files on the left to switch active test query</span>
                  <Link href="/signup" className="text-[#155ded] inline-flex items-center gap-1 font-medium">
                    Try with your own Drive <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </section> */}

      <div className="mt-5">
        
      {/* ─── Comparison Section: Manual FAQ vs ContextGPT Drive Sync ─── */}
      <section className="w-full py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-linear-to-b from-[#eef2ff] to-white">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Why you&apos;re losing leads right now
            </h2>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              You&apos;re <strong>100x more likely to convert a lead</strong> if you respond within 5 minutes — but most service businesses take hours.
            </p>
          </div>
  
          {/* Before/After Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Card */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <svg aria-hidden="true" className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,67.47,120.16l26.19,26.18A8,8,0,0,1,88,160H24a8,8,0,0,1-8-8V88a8,8,0,0,1,13.66-5.66l26.48,26.48A104,104,0,0,1,232,184Z"></path></svg>
                <span className="text-sm font-semibold text-neutral-600">The Problem</span>
              </div>
  
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-black">
                The problem: slow response = lost deals
              </h3>
  
              <ul className="space-y-4">
                {problems.map((problem, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="w-2 h-2 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                    <AskTrigger
                      as="p"
                      message={problem.chatMessage}
                      className="text-base text-neutral-700 leading-relaxed underline underline-offset-4 decoration-neutral-400 decoration-dotted cursor-pointer"
                    >
                      <strong>{problem.bold}</strong>{problem.rest}
                    </AskTrigger>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Solution Card */}
            <div className="rounded-2xl bg-blue-600 p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-white">The Solution</span>
                <svg aria-hidden="true" className="h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L212.69,104,170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66Zm-48-11.32-48-48A8,8,0,0,0,120,56V96.3A104.15,104.15,0,0,0,24,200a8,8,0,0,0,16,0,88.11,88.11,0,0,1,80-87.63V152a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,181.66,98.34Z"></path></svg>
              </div>
  
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                ContextGPT gives you an unfair advantage
              </h3>
  
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <AskTrigger
                      as="p"
                      message={benefit.chatMessage}
                      className="text-base text-blue-50 leading-relaxed underline underline-offset-4 decoration-blue-300 decoration-dotted cursor-pointer"
                    >
                      <strong>{benefit.bold}</strong>{benefit.rest}
                    </AskTrigger>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

        {/* ─── 4-Step Integration Flow Diagram Section ─── */}
        {/* <section className="mx-auto max-w-7xl px-8 py-24">
          <div className="text-center">
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-3 px-3 py-1">
              Seamless Setup
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How to Connect Google Drive in 4 Easy Steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              No code or complex developer setup required. Connect your account and have your chatbot trained in minutes.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-sm font-bold text-[#155ded]">{s.step}</span>
                <div className="mt-3 mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500 bg-blue-50 shadow-md">
                  {s.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </section> */}

      </div>



      {/* ─── Features Grid Section ─── */}
      <section className="border-t border-slate-200/60 bg-white px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="z-10 flex items-center justify-center mb-3">
              <div
                className={cn(
                  "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  <span>✨ Built for Real Teams</span>
                  <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </AnimatedShinyText>
              </div>
            </div>
            <h2 className="max-w-7xl mx-auto font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Why Connect G-Drive with ChatGPT?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-md text-slate-600">
              Eliminate outdated documentation and manual FAQ re-writing. Turn working Google Drive files straight into an automated AI support agent.
            </p>
          </div>

          <HoverEffect
            className="mt-8 md:grid-cols-3 cursor-default"
            items={FEATURES.map((feature) => ({
              title: feature.title,
              description: feature.description,
              icon: (
                <div className="inline-flex w-fit rounded-xl bg-[#155ded]/10 p-3 cursor-default">
                  <feature.icon className="h-6 w-6" />
                </div>
              ),
            }))}
          />
        </div>
      </section>


      {/* ─── Frequently Asked Questions Section ─── */}
      <section className="border-t border-slate-200/60 bg-white px-8 py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-[minmax(0,320px)_1fr] gap-16">
          <div className="sticky top-24 self-start">
            {/* <div className="z-10 flex items-center justify-start mb-4">
              <div
                className={cn(
                  "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                  <span>FAQ</span>
                </AnimatedShinyText>
              </div>
            </div> */}
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Everything you need to know about connecting Google Drive with ContextGPT.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-6 py-1 transition-all data-[state=open]:border-[#155ded]/30 data-[state=open]:bg-white data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-slate-900 py-4 hover:no-underline no-underline hover:cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── Related Cloud Integrations ─── */}
      <section className="mb-10 px-4 py-40 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-5xl">
            Explore Other Data Source Integrations
          </h2>
          <p className="mt-2 text-md text-slate-600">
            Combine multiple storage sources into a single unified AI knowledge base.
          </p>

          <div className="mt-10">
            <IntegrationsMarquee />
          </div>
        </div>
      </section>

    </div>
  );
}


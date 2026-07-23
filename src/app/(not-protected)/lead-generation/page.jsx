"use client";

import Link from "next/link";
import Script from "next/script";
import {
  ArrowRight,
  Zap,
  Clock,
  BarChart3,
  Calendar,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import {TrustedBySection} from "../landing/TrustedBySection";
import WorkWithTools from "./WorkWithTools.jsx";
import { FeaturesSectionLead } from "../landing/FeaturesSection.jsx";
import FourWaysSection from "./FourWaysSection.jsx";
import RealScenariosSection from "./RealScenariosSection.jsx";
import BuiltForBusinessesSection from "./BuiltForBusinessesSection.jsx";
import LeadFAQSection from "./FAQSection.jsx";
import FAQAccordion from "../landing/FAQSection/FAQAccordion.jsx";
import FAQSection from "../landing/FAQSection/index.jsx";
const FEATURES = [
  {
    icon: Zap,
    title: "5-Minute Setup",
    description:
      "InstantTrain technology gets your lead-gen chatbot live in minutes. Paste your URL and you're done.",
  },
  {
    icon: Clock,
    title: "24/7 Lead Capture",
    description:
      "Your chatbot never sleeps. Capture leads from every timezone, every hour of the day.",
  },
  {
    icon: UserCheck,
    title: "Lead Qualification",
    description:
      "Automatically qualify leads by budget, timeline, and needs before they reach your sales team.",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description:
      "Let qualified leads book meetings directly via Google Calendar, Outlook, Calendly, Cal.com, or HubSpot.",
  },
  {
    icon: MessageSquare,
    title: "Instant Response",
    description:
      "Answer prospect questions instantly with accurate, context-aware responses trained on your content.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track conversion rates, popular questions, and lead quality with built-in analytics.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Train",
    description: "Point your chatbot at your website. It learns everything in minutes.",
  },
  {
    step: "2",
    title: "Capture",
    description: "Configure lead fields — email, phone, company, budget, or any custom field.",
  },
  {
    step: "3",
    title: "Qualify",
    description: "Set qualification criteria. Your chatbot asks the right questions automatically.",
  },
  {
    step: "4",
    title: "Convert",
    description: "Route qualified leads to your CRM or let them book a meeting on the spot.",
  },
];

export default function LeadGeneration() {
  return (
    <>
    <div className="sm:px-20 lg:px-30">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-4 pt-5 mt-15 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-4">
            {/* Left Side Content */}
            <div className="mx-auto flex max-w-2xl flex-col text-left lg:mx-0">
              <span className="mb-2 text-sm font-semibold text-blue-600">
                Built for service businesses that can&apos;t afford to miss leads
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-7xl">
                Stop Losing Leads to Slow Replies
              </h1>
              <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-600">
                Book appointments instantly — while competitors are still
                typing.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                In just <strong>5 minutes</strong>, ContextGPT&apos;s{" "}
                <strong>InstantTrain&trade; AI</strong> makes your website a{" "}
                <strong>24/7 sales rep</strong> — replying in{" "}
                <strong>5 seconds</strong>, capturing leads instantly, and
                booking qualified appointments automatically.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-md leading-tight text-slate-600">
                <span>⏱️ Live in 5 minutes</span>
                <span>⚡ Replies in seconds</span>
                <span>🌙 Books 24/7</span>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
                >
                  Start free trial
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Watch demo
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                Trusted by 40+ businesses · 50,000+ conversations handled
              </p>
            </div>

            {/* Right Side — Embedded Chatbot */}
            <div className="flex w-full justify-center lg:justify-center">
              <div
                id="contextgpt-leadgen-container"
                className="h-[630px] w-full max-w-[500px] overflow-hidden rounded-3xl border-2 border-blue-400"
              />
            </div>
          </div>
        </div>

        <Script
          src="https://contextgpt-widget-testing.vercel.app/loader.js?instance=embedded-leadgen"
          data-chatbot-id="27df3d37-8395-4d1f-a084-5609237ae367"
          {...(process.env.NEXT_PUBLIC_ENV === "development" && { "data-server": "http://localhost:9000" })}
          data-mode="embedded"
          data-container="#contextgpt-leadgen-container"
          data-instance="embedded-leadgen"
          strategy="afterInteractive"
          type="module"
        />
      </section>

      <div className="w-[80%] mx-auto gap-4">
        <TrustedBySection />
        <hr />
        <WorkWithTools />

      </div>
      
    </div>
        <FeaturesSectionLead />
      <FourWaysSection />
      <RealScenariosSection />
      <BuiltForBusinessesSection />

<LeadFAQSection />
<div className=" px-[1rem] sm:px-26 lg:px-36 bg-gradient-to-b from-blue-50 to-white  ">
<FAQSection />
</div>
</>
  );
}

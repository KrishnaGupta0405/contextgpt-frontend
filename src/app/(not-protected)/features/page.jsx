"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import DemoClient from "@/app/(not-protected)/demo/DemoClient";
import FAQSection from "@/app/(not-protected)/landing/FAQSection";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { FEATURE_CATEGORIES } from "./features.config.jsx";
import FromTheAuthor from "../landing/FromTheAuthor.jsx";

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl  p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center border border-blue-500 shadow-md bg-blue-50 rounded-xl">{icon}</div>
      <h4 className="mb-2 text-3xl font-semibold text-slate-900">{title}</h4>
      <p className="text-lg leading-relaxed tracking-tight text-slate-500">{description}</p>
    </div>
  );
}

function CategorySection({ category }) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
          {/* Left label */}
          <div className="flex flex-col justify-start pt-1">
            <div className="sticky top-24">
              <p className="text-5xl font-bold leading-tight tracking-tight text-slate-900">
                {category.label}
              </p>
              <p className="mt-4 text-xl leading-relaxed text-slate-600">
                {category.description}
              </p>
            </div>
          </div>

          {/* Right cards grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {category.features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <div className="bg-white text-slate-900">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-4 pb-20 sm:px-6 lg:px-8">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.2}
          duration={2}
          repeatDelay={1}
          height={60}
          width={60}
          className={cn(
            "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-80%] h-[200%] skew-y-12"
          )}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 to-white" />
        <div className="mx-auto max-w-6xl text-center p-20 -mb-40">
          <h2 className="mt-6 text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] lg:leading-tight">
            <span
            onClick={() => window.$cgpt?.push(["do", "message:send", "What are the list of integration, ContextGPT offers ? "])}
              className="underline underline-offset-4 decoration-dotted decoration-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors"
              style={{ fontWeight: 700 }}
            >
              Direct Integrations{" "}
            </span>
            with your
            <br /> favorite tools
          </h2>
          <h3 className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Let ContextGPT answer support questions over your customer&apos;s
            communication channels of choice.
          </h3>

          <div className="relative z-10 mt-12 flex flex-col items-center justify-center pb-8">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {[
                {
                  text: "7-day risk-free trial",
                  chatMessage: "How does the 7-day risk-free trial work?",
                },
                {
                  text: "Cancel at any time",
                  chatMessage: "How do I cancel my subscription?",
                },
                {
                  text: "Tailored onboarding support",
                  chatMessage: "How does personalized onboarding help work?",
                },
                {
                  text: "Fair pricing that scales",
                  chatMessage: "How does your pricing scale as I grow?",
                },
                {
                  text: "100+ global languages",
                  chatMessage: "Which languages do you support?",
                },
              ].map(({ text, chatMessage }) => (
                <span
                  key={text}
                  onClick={
                    chatMessage
                      ? () => window.$cgpt?.push(["do", "message:send", chatMessage])
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-2 text-base font-medium text-slate-800 hover:text-blue-600",
                    chatMessage && "hover:cursor-pointer"
                  )}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                  <span
                    className={cn(
                      "underline decoration-slate-400 decoration-dotted underline-offset-4",
                      chatMessage && "hover:decoration-blue-500 hover:text-blue-600 hover:cursor-pointer"
                    )}
                  >
                    {text}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              Start a free trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-lg font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* ─── All Features Pill Grid ─── */}
      <section className="py-20 my-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-6xl text-center ">
          <p className="text-4xl font-semibold mx-auto tracking-tight text-slate-900 mb-4 max-w-2xl">
            Everything you need to roll out your own AI chatbot
          </p>
          <p className="text-sm text-slate-500 mb-12 max-w-2xl mx-auto">
            ContextGPT is a production-ready support solution that does the work
            of a full support staff but at a fraction of the cost.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {FEATURE_CATEGORIES.flatMap((cat) =>
              cat.features.map((f) => (
                <div
                  key={f.title}
                  style={{ backgroundColor: "white" }}
                  className="flex items-center gap-2 rounded-xl border border-transparent shadow-lg px-4 py-4 text-lg font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500 cursor-default"
                >
                  <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{f.icon}</span>
                  {f.title}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── Feature Categories ─── */}
      <div className="mt-40">
        {FEATURE_CATEGORIES.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}
      </div>

      {/* ─── Demo Section ─── */}
      <section className="border-slate-100">
        <DemoClient />
      </section>
      <FromTheAuthor />
      {/* ─── FAQ Section ─── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-6xl">
          <FAQSection />
        </div>
      </section>
    </div>
  );
}

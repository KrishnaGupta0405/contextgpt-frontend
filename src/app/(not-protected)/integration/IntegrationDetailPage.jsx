"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ArrowRight, Check, ArrowRightIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { CustomBreadcrumb } from "@/components/ui/CustomBreadcrumb";
import { cn } from "@/lib/utils";
import AskTrigger from "@/components/AskTrigger";
import IntegrationsMarquee from "./IntegrationsMarquee";

const SITE_URL = "https://contextgpt.co";

/**
 * Shared template for all "<Source> ChatGPT Integration" landing pages.
 * Each integration page imports this and passes its own copy/content.
 *
 * Required props:
 * - name: e.g. "Google Drive"
 * - breadcrumbLabel: e.g. "Google Drive ChatGPT Integration"
 * - heroTitleSuffix: text after "Connect <name> " in the H1, defaults to "to ChatGPT"
 * - heroSubtitle: paragraph under the H1
 * - microBar: array of { text, msg }
 * - narrative: { paragraph1 (string, can include JSX via render prop not supported - pass ReactNode), infoBoxText, paragraph2, paragraph3 }
 * - problemsHeading, problemsSubheading, problems: [{ bold, rest, chatMessage }]
 * - solutionHeading, benefits: [{ bold, rest, chatMessage }]
 * - featuresHeading, featuresSubheading, features: [{ title, description, icon }]
 * - faqs: [{ question, answer }]
 * - steps: array of strings (for HowTo schema)
 */
export default function IntegrationDetailPage({
  name,
  breadcrumbLabel,
  heroTitleSuffix = "to ChatGPT",
  heroSubtitle,
  microBar = [],
  narrative,
  problemsHeading = "Why you're losing leads right now",
  problemsSubheading,
  problems = [],
  solutionHeading = "ContextGPT gives you an unfair advantage",
  benefits = [],
  featuresHeading,
  featuresSubheading,
  features = [],
  faqs = [],
  steps = [],
}) {
  const pathname = usePathname();
  const slug = pathname?.split("/").filter(Boolean).pop();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
    name: `How to connect ${name} with ContextGPT`,
    step: steps.map((step, i) => ({
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
            name: `${name} ChatGPT Integration`,
            item: `${SITE_URL}/integration/${slug}`,
          },
        ],
      }
    : null;

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
              { label: breadcrumbLabel || `${name} ChatGPT Integration` },
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
          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.12]">
            Connect{" "}
            <span className="bg-gradient-to-r from-[#155ded] via-indigo-600 to-indigo-600 bg-clip-text text-transparent">
              {name}
            </span>{" "}
            {heroTitleSuffix}
          </h1>

          {/* Subtitle */}
          {heroSubtitle && (
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600 sm:text-xl leading-relaxed">
              {heroSubtitle}
            </p>
          )}

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
          {microBar.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-slate-600">
              {microBar.map(({ text, msg }) => (
                <span
                  key={text}
                  onClick={() => window.$cgpt?.push(["do", "message:send", msg])}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#155ded]" />
                  <span className="underline decoration-slate-300 underline-offset-4">
                    {text}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Intro / Narrative Section ─── */}
      {narrative && (
        <section className="relative overflow-hidden px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          {/* Decorative background accents */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#155ded]/5 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-8 mt-5">
              {narrative.paragraph1 && (
                <p className="text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl sm:leading-relaxed">
                  <span className="float-left mr-1 font-[family-name:var(--font-geist-mono)] text-6xl font-bold leading-[0.8] text-[#155ded] sm:text-7xl">
                    S
                  </span>
                  {narrative.paragraph1}
                </p>
              )}

              {narrative.infoBoxText && (
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-xs sm:p-8">
                  <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                    {narrative.infoBoxText}
                  </p>
                </div>
              )}

              {narrative.paragraph2 && (
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {narrative.paragraph2}
                </p>
              )}

              {narrative.paragraph3 && (
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                  {narrative.paragraph3}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-5">
        {/* ─── Comparison Section: Problem vs Solution ─── */}
        {(problems.length > 0 || benefits.length > 0) && (
          <section className="w-full py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-linear-to-b from-[#eef2ff] to-white">
            <div className="max-w-7xl mx-auto">
              {/* Heading */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                  {problemsHeading}
                </h2>
                {problemsSubheading && (
                  <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                    {problemsSubheading}
                  </p>
                )}
              </div>

              {/* Before/After Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Problem Card */}
                <div className="rounded-2xl bg-white border border-neutral-200 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,67.47,120.16l26.19,26.18A8,8,0,0,1,88,160H24a8,8,0,0,1-8-8V88a8,8,0,0,1,13.66-5.66l26.48,26.48A104,104,0,0,1,232,184Z"></path>
                    </svg>
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
                          <strong>{problem.bold}</strong>
                          {problem.rest}
                        </AskTrigger>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solution Card */}
                <div className="rounded-2xl bg-blue-600 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm font-semibold text-white">The Solution</span>
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5 text-blue-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L212.69,104,170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66Zm-48-11.32-48-48A8,8,0,0,0,120,56V96.3A104.15,104.15,0,0,0,24,200a8,8,0,0,0,16,0,88.11,88.11,0,0,1,80-87.63V152a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,181.66,98.34Z"></path>
                    </svg>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                    {solutionHeading}
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
                          <strong>{benefit.bold}</strong>
                          {benefit.rest}
                        </AskTrigger>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ─── Features Grid Section ─── */}
      {features.length > 0 && (
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
                {featuresHeading || `Why Connect ${name} with ChatGPT?`}
              </h2>
              {featuresSubheading && (
                <p className="mx-auto mt-4 max-w-2xl text-md text-slate-600">
                  {featuresSubheading}
                </p>
              )}
            </div>

            <HoverEffect
              className="mt-8 md:grid-cols-3 cursor-default"
              items={features.map((feature) => ({
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
      )}

      {/* ─── Frequently Asked Questions Section ─── */}
      {faqs.length > 0 && (
        <section className="border-t border-slate-200/60 bg-white px-8 py-24">
          <div className="mx-auto max-w-6xl grid grid-cols-[minmax(0,320px)_1fr] gap-16">
            <div className="sticky top-24 self-start">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Everything you need to know about connecting {name} with ContextGPT.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
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
      )}

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

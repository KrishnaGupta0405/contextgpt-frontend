"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function CTASection() {
  const features = [
    {
      label: "Guided onboarding support",
      prompt: "What does guided onboarding support include?",
    },
    {
      label: "Scales with cost-efficient pricing",
      prompt: "How does pricing scale as I grow?",
    },
    {
      label: "Supports 95+ languages",
      prompt: "Which languages does ContextGPT support?",
    },
    {
      label: "Free 7-day trial included",
      prompt: "What's included in the free 7-day trial?",
    },
    {
      label: "Cancel anytime, no lock-in",
      prompt: "Can I cancel my subscription anytime?",
    },
    // { label: "SOC 2 Type II certified", prompt: "Is ContextGPT SOC 2 Type II certified?" },
  ];

  return (
    <section className="py-12 sm:p-6">
      <div
        className="mx-auto w-full max-w-6xl rounded-[2rem] px-4 py-12 text-center sm:px-8"
        style={{
          backgroundColor: "#1c64f2",
          color: "#ffffff",
        }}
      >
        <h2 className="mx-auto max-w-3xl font-sans text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Ready to take ContextGPT
          <br className="hidden sm:block" /> for a spin?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base text-blue-100/90 sm:text-lg">
          Find out if a personalized AI support chatbot is a good fit
          <br className="hidden sm:block" /> for you in just a few hours.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-xl font-semibold text-[#1c64f2] transition-all hover:bg-gray-50"
          >
            Start a free trial
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-xl border border-white px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Book a demo
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-white" />
              <span
                onClick={() =>
                  window.$cgpt?.push(["do", "message:send", feature.prompt])
                }
                className="cursor-pointer border-b border-dotted border-white/70 pb-0.5 transition-colors hover:border-white hover:text-blue-100"
              >
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

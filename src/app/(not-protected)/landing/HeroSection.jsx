"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const features = [
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
];
export default function HeroSection() {
  useEffect(() => {
    console.log("[HeroSection] useEffect mounting");
 
    // Embedded hero widget
    const embedded = document.createElement("script");
    embedded.type = "module";
    // removed the data-server tag from the src URL.
    embedded.src = "https://contextgpt-widget-testing.vercel.app/loader.js?instance=embedded-hero&chatbotId=27df3d37-8395-4d1f-a084-5609237ae367&mode=embedded&container=%23contextgpt-hero-container";
    embedded.setAttribute("data-chatbot-id", "27df3d37-8395-4d1f-a084-5609237ae367");
    if (process.env.NEXT_PUBLIC_ENV === "development") embedded.setAttribute("data-server", "http://localhost:9000");
    embedded.setAttribute("data-mode", "embedded");
    embedded.setAttribute("data-container", "#contextgpt-hero-container");
    embedded.setAttribute("data-instance", "embedded-hero");
    document.body.appendChild(embedded);
    // console.log("[HeroSection] embedded script injected");

    // Floating widget — only inject if layout.js hasn't already mounted one
    // (layout.js is deduplicated by Next.js on the landing page, so we load it here)
    let floating = null;
    const floatingAlreadyExists = !!document.getElementById("contextgpt-widget");
    // console.log("[HeroSection] #contextgpt-widget already in DOM?", floatingAlreadyExists);
    if (!floatingAlreadyExists) {
      floating = document.createElement("script");
      floating.type = "module";
      floating.src = "https://contextgpt-widget-testing.vercel.app/loader.js?instance=floating&chatbotId=27df3d37-8395-4d1f-a084-5609237ae367";
      floating.setAttribute("data-chatbot-id", "27df3d37-8395-4d1f-a084-5609237ae367");
      if (process.env.NEXT_PUBLIC_ENV === "development") floating.setAttribute("data-server", "http://localhost:9000");
      floating.setAttribute("data-instance", "floating");
      document.body.appendChild(floating);
      // console.log("[HeroSection] floating script injected");
    } else {
      // console.log("[HeroSection] floating script skipped — widget already exists from layout.js");
    }

    return () => {
      // console.log("[HeroSection] useEffect cleanup (unmounting)");
      document.body.removeChild(embedded);
      if (floating) document.body.removeChild(floating);
    };
  }, []);

  return (
    <div>
      <section className="relative mb-12 overflow-hidden pb-24 pt-10 sm:pb-32">
        <div className="w-full">
          <div className="grid grid-cols-1 items-center gap-12 text-left lg:grid-cols-2">
            {/* Left Side Content */}
            <div>
              {/* <a
                href="https://www.producthunt.com/products/contextgpt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-contextgpt-2"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block"
              >
                <img
                  alt="ContextGPT - Instantly answer you visitor question, Ai using you own data | Product Hunt"
                  width="250"
                  height="54"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1190796&theme=light&t=1783489438696"
                />
              </a> */}
              <h1 className="text-5xl leading-[0.95] font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-6xl">
                Make <span className="text-blue-500">AI</span> agent your expert
                customer service, works{" "}
                <span className="text-blue-500"> 24/7</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                Deploy a powerful AI assistant trained exclusively on your business. Answer customer inquiries instantly, 24/7, with a chatbot that understands your unique content and brand voice.
              </p>
              <p className="mt-4 max-w-xl text-sm text-gray-500">
                Disclaimer: This platform is an independent product and is not affiliated with Google, Anthropic, OpenAi. We provide access to the LLMs through our custom interface.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
                {features.map(({ text, chatMessage }) => (
                  <span
                    key={text}
                    onClick={
                      chatMessage
                        ? () => window.$cgpt?.push(["do", "message:send", chatMessage])
                        : undefined
                    }
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="underline decoration-dotted underline-offset-2">
                      {text}
                    </span>
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  Start a free trial
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Book a demo
                </Link>
              </div>
            </div>

            {/* Right Side — Embedded Chatbot */}
            <div
              id="contextgpt-hero-container"
              className="h-[630px] w-full max-w-[500px] overflow-hidden rounded-3xl border-2 border-blue-400"
            />
 
          </div>
        </div>
      </section>
      <div className="mb-12">
        <TrustedBySection />
      </div>
    </div>
  );
}

import React from "react";
import {
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Cpu,
  Box,
  Compass,
  Activity,
} from "lucide-react";


const companies = [
  { name: "Lumios", icon: <ShieldCheck className="h-8 w-8" /> },
  // { name: "Vertex", icon: <Zap className="w-8 h-8" /> },
  // { name: "Aether", icon: <Globe className="w-8 h-8" /> },
  // { name: "Nebula", icon: <Layers className="w-8 h-8" /> },
  { name: "Zenith", icon: <Cpu className="h-8 w-8" /> },
  { name: "Quantum", icon: <Box className="h-8 w-8" /> },
  { name: "Flux", icon: <Compass className="h-8 w-8" /> },
  // { name: "Echo", icon: <Activity className="w-8 h-8" /> },
];

export function TrustedBySection() {
  return (
    <section className="mb-4">
      <div className="w-full">
        <p className="mb-4 text-center text-[10px] font-medium tracking-[1px] text-gray-400 uppercase">
          Trusted by <span className="font-bold text-gray-600">40+</span>{" "}
          Customers worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-15">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex cursor-default items-center gap-2 text-gray-400"
            >
              <div>{company.icon}</div>
              <span className="text-xl font-bold tracking-tight md:text-2xl">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

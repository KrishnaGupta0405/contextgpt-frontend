import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AskTrigger from "@/components/AskTrigger";
import HeroChatWidget from "./HeroChatWidget";
import { TrustedBySection } from "./TrustedBySection";

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
  return (
    <div>
      <HeroChatWidget />
      <section className="relative mb-12 overflow-hidden pb-24 pt-10 sm:pb-32">
        <div className="w-full">
          <div className="grid grid-cols-1 items-center gap-12 text-left lg:grid-cols-2">
            {/* Left Side Content */}
            <div>
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
                  <AskTrigger
                    key={text}
                    message={chatMessage}
                    className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="underline decoration-dotted underline-offset-2">
                      {text}
                    </span>
                  </AskTrigger>
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

// import Image from "next/image";
import Link from "next/link";
import { getToolsByCategory } from "../_config/tools.config";

export const metadata = {
  title: "AI Generators — ContextGPT",
  description:
    "Free AI-powered generators for replies, prompts, FAQs, blog titles, chatbot names, brand names, and more. Generate professional content in seconds.",
  alternates: { canonical: "https://contextgpt.in/tools/ai-generators" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "AI Generators — ContextGPT",
    description:
      "Free AI-powered generators for replies, prompts, FAQs, blog titles, chatbot names, brand names, and more.",
    url: "https://contextgpt.in/tools/ai-generators",
  },
};

export default function AiGeneratorsPage() {
  const tools = getToolsByCategory("AI Generators");

  return (
    <div className="min-h-screen">
      <div className="mt-[5%] border-blue-100 bg-white px-4 py-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
          Free Tools
        </p>
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          AI Generators
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed">
          Generate professional content in seconds with AI.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-b from-blue-100 to-white p-6 py-20 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-4 border-blue-400 bg-white p-2">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="absolute inset-0 h-full w-full rounded-lg object-contain"
                />
              </div>
              <div className="-mx-6 -mb-6 flex flex-1 flex-col rounded-b-2xl bg-white p-6">
                <h3 className="mb-1.5 text-base font-bold text-gray-900">{tool.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">{tool.description}</p>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="inline-flex w-fit items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                >
                  Try tool
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

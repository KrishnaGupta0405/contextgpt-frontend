// import Image from "next/image";
import Link from "next/link";
import { ALL_TOOLS, TOOL_CATEGORIES, getToolsByCategory } from "./_config/tools.config";

export const metadata = {
  title: "Free AI Tools — ContextGPT",
  description:
    "Free AI tools for converting documents to Markdown, generating content with AI, analyzing chatbot conversations, and more.",
};

const CATEGORY_DESCRIPTIONS = {
  "Convert to Markdown":
    "Convert any document, file, or URL to clean Markdown instantly. No sign up required.",
  "AI Chat Tools":
    "Upload or paste your data and chat with AI to get instant answers.",
  "AI Generators": "Generate professional content in seconds with AI.",
  "Other Tools":
    "Sitemap tools, ROI calculators, email signatures, and more.",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="mt-[5%] border-blue-100 bg-white px-4 py-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600">
          Free Tools
        </p>
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Free tools for the community
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed">
          Discover a suite of free, powerful tools tailored for SaaS companies, designed to streamline your workflow and boost your productivity.
        </p>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16">
        {TOOL_CATEGORIES.map((category) => {
          const tools = getToolsByCategory(category);
          return (
            <section key={category}>
              {/* Category header */}
              {/* <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
              </div> */}

              {/* Tool cards */}
              <div className="grid gap-6 sm:grid-cols-2 ">
                {tools.map((tool) => (
                  <div
                    key={tool.slug}
                    className="flex flex-col py-20 overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-b from-blue-100 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div
                      className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-4 border-blue-400 bg-white p-2"
                    >
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="absolute inset-0 h-full w-full rounded-lg object-contain"
                      />
                    </div>
                    {/* Title */}
                    <div className="-mx-6 -mb-6 flex flex-1 flex-col rounded-b-2xl bg-white p-6 drop-shadow-none">
                    <h3 className="mb-1.5 text-base font-bold text-gray-900">
                      {tool.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">
                      {tool.description}
                    </p>

                    {/* CTA */}
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
            </section>
          );
        })}
      </div>
    </div>
  );
}

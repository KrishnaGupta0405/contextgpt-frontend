"use client";

export function IntegrationsSection() {
  return (
    <section>
      <div className="mx-auto border-indigo-600 max-w-6xl text-center pt-20">
        <h2 className="mt-6 text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] lg:leading-tight">
          <span
            className="underline underline-offset-4 decoration-dotted decoration-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors"
            style={{ fontWeight: 700 }}
          >
            Direct Integrations{" "}
          </span>
          with your favorite tools
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
          With native integrations into platforms like{" "}
          <span className="underline underline-offset-2 decoration-dotted decoration-indigo-500">
            Crisp, Intercom, and Zendesk
          </span>{" "}
          our chatbot becomes an extended arm of your existing toolkit.
        </p>

        <div className="relative -mt-30 -mb-30 flex items-center justify-center">
          <img
            src="/icons/integrations_bg.svg" 
            alt="Hero"
            width={100}
            height={100}
            className="w-[80%] h-[80%]"
          />
        </div>
      </div>
    </section>
  );
}

export function ThreeStepsSection() {
  return (
    <section className="py-24 pb-40 md:pb-40">
      <div className="mx-auto max-w-6xl px-4">
        <h2
          className="mb-16 text-center font-sans text-4xl leading-tight font-bold tracking-tight"
          style={{ color: "#0f172a" }}
        >
          You&apos;re{" "}
          <span style={{ color: "#2563eb" }}>three easy steps</span> away from your own personalized AI support chatbot
        </h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: "#2563eb" }}
            >
              1
            </div>
            <h3
              className="text-xl font-bold underline decoration-blue-600 decoration-dashed"
              style={{ color: "#0f172a" }}
            >
              Sync training data
            </h3>
            <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
              Enter your URL for ContextGPT to scan, or upload files, or drop
              in raw text content.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: "#2563eb" }}
            >
              2
            </div>
            <h3
              className="text-xl font-bold underline decoration-blue-600 decoration-dashed"
              style={{ color: "#0f172a" }}
            >
              Install on your site
            </h3>
            <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
              Embed a chatbot on as many sites as you want — your marketing
              site, in-app, help center... wherever.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: "#2563eb" }}
            >
              3
            </div>
            <h3
              className="text-xl font-bold underline decoration-blue-600 decoration-dashed"
              style={{ color: "#0f172a" }}
            >
              Learn and refine
            </h3>
            <p className="text-base leading-relaxed" style={{ color: "#64748b" }}>
              Use real chat history to improve your chatbot by providing
              feedback that allows it to improve with every interaction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FromTheAuthor() {
  return (
    <section className="py-56">
      <div className="mx-auto max-w-4xl px-4">
        <p
          className="mb-4 text-center text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#2563eb" }}
        >
          From the Author
        </p>

        <h2
          className="mb-16 text-center font-sans text-4xl leading-tight font-bold tracking-tight"
          style={{ color: "#0f172a" }}
        >
          Don&apos;t just rely on what we say, Test it yourself!
        </h2>

        <div className="flex flex-col items-center gap-6 px-[18%] md:flex-row md:items-center md:justify-center">
          <div className="shrink-0">
            <div
              className="overflow-hidden rounded-full"
              style={{ width: 72, height: 72 }}
            >
              <img
                src="/icons/ContextGPT_author.jpg"
                alt="Author photo"
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div
            className="flex flex-col gap-5 text-base leading-relaxed"
            style={{ color: "#334155" }}
          >
            <p>
              I built ContextGPT after watching support teams waste hours on
              the same repetitive questions. The fix was obvious: an AI agent
              trained on your own docs, available 24/7, so your team can focus
              on work that truly needs a human.
            </p>

            <div className="mt-2">
              <p className="font-semibold" style={{ color: "#0f172a" }}>
                Krishna Gupta
              </p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Founder &amp; CEO, ContextGPT
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

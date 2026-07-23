export const metadata = {
  title: "ContextGPT | Features",
  description: "Explore all ContextGPT features — AI training from your website, lead capture, appointment booking, integrations, and analytics.",
  keywords: ["AI chatbot features", "chatbot training", "lead capture", "appointment booking bot", "chatbot integrations", "chatbot analytics"],
  alternates: { canonical: "https://contextgpt.co/features" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Features",
    description: "AI training, lead capture, appointment booking, integrations, and analytics — everything you need in one chatbot platform.",
    url: "https://contextgpt.co/features",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Features" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Features",
    description: "AI training, lead capture, appointment booking, integrations, analytics — all in one.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take to set up ContextGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can have your AI chatbot live in under 5 minutes. Just paste your website URL and ContextGPT trains itself on your content automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know how to code to use ContextGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No coding is required. ContextGPT is a no-code platform — you can train, customize, and deploy your chatbot without any technical skills.",
      },
    },
    {
      "@type": "Question",
      name: "What integrations does ContextGPT support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ContextGPT integrates with HubSpot, Slack, Notion, Google Drive, Zapier, Cal.com, Calendly, and more.",
      },
    },
    {
      "@type": "Question",
      name: "Can ContextGPT capture and qualify leads?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ContextGPT can collect visitor information, ask qualification questions, and route qualified leads to your CRM or book appointments directly.",
      },
    },
  ],
};

export default function FeaturesLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

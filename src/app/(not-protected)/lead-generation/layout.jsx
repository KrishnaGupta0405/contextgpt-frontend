export const metadata = {
  title: "ContextGPT | Lead Generation Chatbot",
  description: "AI-powered lead generation chatbot — capture, qualify, and book leads 24/7 in under 5 minutes. No developers needed.",
  keywords: ["lead generation chatbot", "AI lead capture", "appointment booking bot", "qualify leads automatically", "24/7 lead gen"],
  alternates: { canonical: "https://contextgpt.co/lead-generation" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Lead Generation Chatbot",
    description: "AI-powered lead generation chatbot — capture, qualify, and book leads 24/7 in under 5 minutes.",
    url: "https://contextgpt.co/lead-generation",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Lead Generation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Lead Generation Chatbot",
    description: "Capture, qualify, and book leads 24/7 — live in 5 minutes.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function LeadGenerationLayout({ children }) {
  return children;
}

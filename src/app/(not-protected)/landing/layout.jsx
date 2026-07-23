export const metadata = {
  title: "ContextGPT | AI Chatbot for Your Website",
  description: "Turn your website into an AI-powered chatbot in minutes. Train on your content, capture leads, and answer questions 24/7 — no coding required.",
  keywords: ["AI chatbot", "website chatbot", "no-code chatbot", "customer support automation", "chatbot builder"],
  alternates: { canonical: "https://contextgpt.co/landing" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | AI Chatbot for Your Website",
    description: "Turn your website into an AI-powered chatbot in minutes. Train on your content, capture leads, and answer questions 24/7 — no coding required.",
    url: "https://contextgpt.co/landing",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | AI Chatbot for Your Website",
    description: "Turn your website into an AI-powered chatbot in minutes. No coding required.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ContextGPT",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://contextgpt.co",
  description: "Turn your website into an AI-powered chatbot in minutes. Train on your content, capture leads, and answer questions 24/7.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available",
  },
  featureList: [
    "Train AI on your website content in minutes",
    "24/7 automated customer support",
    "Lead capture and qualification",
    "Appointment booking integration",
    "No coding required",
  ],
};

export default function LandingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {children}
    </>
  );
}

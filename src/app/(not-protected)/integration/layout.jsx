export const metadata = {
  title: "ContextGPT | Integrations",
  description: "Connect ContextGPT with HubSpot, Slack, Notion, Google Drive, Zapier, Cal.com, and more. Automate your workflow end-to-end.",
  keywords: ["chatbot integrations", "HubSpot chatbot", "Slack chatbot", "Zapier chatbot", "CRM integration", "AI chatbot integrations"],
  alternates: { canonical: "https://contextgpt.co/integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Integrations",
    description: "Connect ContextGPT with HubSpot, Slack, Notion, Google Drive, Zapier, and more.",
    url: "https://contextgpt.co/integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Integrations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Integrations",
    description: "Connect ContextGPT with HubSpot, Slack, Notion, Zapier, and more.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function IntegrationLayout({ children }) {
  return children;
}

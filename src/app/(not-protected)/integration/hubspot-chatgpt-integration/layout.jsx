export const metadata = {
  title: "HubSpot ChatGPT Integration | ContextGPT",
  description:
    "ContextGPT's HubSpot ChatGPT integration is launching soon, bringing automated live chat answers directly into your HubSpot conversations.",
  keywords: [
    "HubSpot ChatGPT integration",
    "HubSpot chatbot",
    "ContextGPT HubSpot",
    "HubSpot live chat AI assistant",
    "deploy chatbot in HubSpot",
  ],
  alternates: { canonical: "https://contextgpt.co/integration/hubspot-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "HubSpot ChatGPT Integration | ContextGPT",
    description: "ContextGPT's HubSpot live chat integration is launching soon for automated customer answers.",
    url: "https://contextgpt.co/integration/hubspot-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "HubSpot ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HubSpot ChatGPT Integration | ContextGPT",
    description: "ContextGPT's HubSpot live chat integration is launching soon for automated customer answers.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

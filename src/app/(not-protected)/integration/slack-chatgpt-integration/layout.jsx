export const metadata = {
  title: "Slack ChatGPT Integration | ContextGPT",
  description:
    "Deploy ChatGPT-powered support directly inside Slack using ContextGPT so your team gets instant answers without leaving the channel.",
  keywords: [
    "Slack ChatGPT integration",
    "Slack chatbot",
    "ContextGPT Slack",
    "Slack AI assistant",
    "deploy chatbot in Slack",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/slack-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Slack ChatGPT Integration | ContextGPT",
    description: "Deploy ContextGPT inside Slack channels for instant, always-on answers.",
    url: "https://contextgpt.in/integration/slack-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Slack ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Slack ChatGPT Integration | ContextGPT",
    description: "Deploy ContextGPT inside Slack channels for instant, always-on answers.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

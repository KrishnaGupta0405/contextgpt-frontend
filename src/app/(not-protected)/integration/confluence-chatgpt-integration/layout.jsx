export const metadata = {
  title: "Confluence ChatGPT Integration | ContextGPT",
  description:
    "Connect Atlassian Confluence with ChatGPT using ContextGPT to ingest your technical documentation and team playbooks automatically.",
  keywords: [
    "Confluence ChatGPT integration",
    "Confluence chatbot",
    "ContextGPT Confluence",
    "Atlassian Confluence AI",
    "train chatbot on Confluence",
  ],
  alternates: { canonical: "https://contextgpt.co/integration/confluence-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Confluence ChatGPT Integration | ContextGPT",
    description: "Sync your Confluence spaces into ContextGPT and train your chatbot on technical docs.",
    url: "https://contextgpt.co/integration/confluence-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Confluence ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Confluence ChatGPT Integration | ContextGPT",
    description: "Sync your Confluence spaces into ContextGPT and train your chatbot on technical docs.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

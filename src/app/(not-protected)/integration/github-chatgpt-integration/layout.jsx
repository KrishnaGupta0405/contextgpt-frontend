export const metadata = {
  title: "GitHub ChatGPT Integration | ContextGPT",
  description:
    "Connect GitHub with ChatGPT using ContextGPT to sync repositories, issues, and wikis directly into your chatbot's technical knowledge.",
  keywords: [
    "GitHub ChatGPT integration",
    "GitHub chatbot",
    "ContextGPT GitHub",
    "GitHub AI assistant",
    "train chatbot on GitHub repositories",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/github-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "GitHub ChatGPT Integration | ContextGPT",
    description: "Sync GitHub repositories, issues, and wikis into ContextGPT for a technical support chatbot.",
    url: "https://contextgpt.in/integration/github-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "GitHub ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub ChatGPT Integration | ContextGPT",
    description: "Sync GitHub repositories, issues, and wikis into ContextGPT for a technical support chatbot.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

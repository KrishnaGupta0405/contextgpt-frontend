export const metadata = {
  title: "Gitbook ChatGPT Integration | ContextGPT",
  description:
    "Connect Gitbook with ChatGPT using ContextGPT to automatically train your chatbot on your public or private technical documentation.",
  keywords: [
    "Gitbook ChatGPT integration",
    "Gitbook chatbot",
    "ContextGPT Gitbook",
    "Gitbook AI assistant",
    "train chatbot on Gitbook",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/gitbook-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Gitbook ChatGPT Integration | ContextGPT",
    description: "Sync your Gitbook documentation into ContextGPT and let your chatbot answer from it directly.",
    url: "https://contextgpt.in/integration/gitbook-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Gitbook ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gitbook ChatGPT Integration | ContextGPT",
    description: "Sync your Gitbook documentation into ContextGPT and let your chatbot answer from it directly.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

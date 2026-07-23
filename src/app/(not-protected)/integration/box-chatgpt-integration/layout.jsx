export const metadata = {
  title: "Box ChatGPT Integration | ContextGPT",
  description:
    "Connect Box with ChatGPT using ContextGPT to use your enterprise-grade document repository as a chatbot training source.",
  keywords: [
    "Box ChatGPT integration",
    "Box chatbot",
    "ContextGPT Box",
    "Box AI assistant",
    "train chatbot on Box",
  ],
  alternates: { canonical: "https://contextgpt.co/integration/box-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Box ChatGPT Integration | ContextGPT",
    description: "Sync files from Box into ContextGPT and put your document repository to work as chatbot knowledge.",
    url: "https://contextgpt.co/integration/box-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Box ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Box ChatGPT Integration | ContextGPT",
    description: "Sync files from Box into ContextGPT and put your document repository to work as chatbot knowledge.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

export const metadata = {
  title: "YouTube ChatGPT Integration | ContextGPT",
  description:
    "Connect YouTube with ChatGPT using ContextGPT to train your chatbot on video transcripts, letting it answer questions based on your video content.",
  keywords: [
    "YouTube ChatGPT integration",
    "YouTube chatbot",
    "ContextGPT YouTube",
    "YouTube transcript AI assistant",
    "train chatbot on YouTube videos",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/youtube-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "YouTube ChatGPT Integration | ContextGPT",
    description: "Sync YouTube video transcripts into ContextGPT and let your chatbot answer from your videos.",
    url: "https://contextgpt.in/integration/youtube-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "YouTube ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube ChatGPT Integration | ContextGPT",
    description: "Sync YouTube video transcripts into ContextGPT and let your chatbot answer from your videos.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

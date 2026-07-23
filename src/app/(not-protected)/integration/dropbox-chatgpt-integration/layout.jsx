export const metadata = {
  title: "Dropbox ChatGPT Integration | ContextGPT",
  description:
    "Connect Dropbox with ChatGPT using ContextGPT to train your chatbot directly on the files and folders your team already stores in Dropbox.",
  keywords: [
    "Dropbox ChatGPT integration",
    "Dropbox chatbot",
    "ContextGPT Dropbox",
    "train chatbot on Dropbox",
    "Dropbox AI assistant",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/dropbox-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Dropbox ChatGPT Integration | ContextGPT",
    description: "Sync Dropbox files into ContextGPT and keep your chatbot's knowledge base current.",
    url: "https://contextgpt.in/integration/dropbox-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Dropbox ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dropbox ChatGPT Integration | ContextGPT",
    description: "Sync Dropbox files into ContextGPT and keep your chatbot's knowledge base current.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

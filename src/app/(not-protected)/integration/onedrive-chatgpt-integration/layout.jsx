export const metadata = {
  title: "OneDrive ChatGPT Integration | ContextGPT",
  description:
    "Connect Microsoft OneDrive with ChatGPT using ContextGPT to train your chatbot on documents, spreadsheets, and presentations stored in OneDrive.",
  keywords: [
    "OneDrive ChatGPT integration",
    "OneDrive chatbot",
    "ContextGPT OneDrive",
    "Microsoft OneDrive AI assistant",
    "train chatbot on OneDrive",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/onedrive-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "OneDrive ChatGPT Integration | ContextGPT",
    description: "Sync Microsoft OneDrive files into ContextGPT and keep your chatbot's knowledge current.",
    url: "https://contextgpt.in/integration/onedrive-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "OneDrive ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OneDrive ChatGPT Integration | ContextGPT",
    description: "Sync Microsoft OneDrive files into ContextGPT and keep your chatbot's knowledge current.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

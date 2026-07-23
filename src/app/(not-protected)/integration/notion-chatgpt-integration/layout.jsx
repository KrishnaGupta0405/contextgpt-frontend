export const metadata = {
  title: "Notion ChatGPT Integration | ContextGPT",
  description:
    "Connect Notion with ChatGPT using ContextGPT to sync your workspace pages and databases into a chatbot that always matches your documentation.",
  keywords: [
    "Notion ChatGPT integration",
    "Notion chatbot",
    "ContextGPT Notion",
    "Notion AI assistant",
    "train chatbot on Notion",
  ],
  alternates: { canonical: "https://contextgpt.in/integration/notion-chatgpt-integration" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "Notion ChatGPT Integration | ContextGPT",
    description: "Sync your Notion workspace into ContextGPT and keep your chatbot aligned with your docs.",
    url: "https://contextgpt.in/integration/notion-chatgpt-integration",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Notion ChatGPT integration dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notion ChatGPT Integration | ContextGPT",
    description: "Sync your Notion workspace into ContextGPT and keep your chatbot aligned with your docs.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Layout({ children }) {
  return children;
}

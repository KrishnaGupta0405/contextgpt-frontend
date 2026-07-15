import "katex/dist/katex.min.css";

export const metadata = {
  title: "ContextGPT | Blog",
  description: "Tips, guides, and insights on AI chatbots, customer support automation, and lead generation.",
  keywords: ["AI chatbot blog", "customer support tips", "chatbot guides", "lead generation tips"],
  alternates: {
    canonical: "https://contextgpt.in/blog",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Blog",
    description: "Tips, guides, and insights on AI chatbots, customer support automation, and lead generation.",
    url: "https://contextgpt.in/blog",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Blog",
    description: "Tips, guides, and insights on AI chatbots, customer support, and lead generation.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function BlogLayout({ children }) {
  return children;
}

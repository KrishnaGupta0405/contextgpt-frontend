export const metadata = {
  title: "ContextGPT | Book a Demo",
  description: "Schedule a live demo and see how ContextGPT can automate your customer support and lead generation in minutes.",
  keywords: ["book demo", "ContextGPT demo", "AI chatbot demo", "schedule demo"],
  alternates: { canonical: "https://contextgpt.co/book-a-demo" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Book a Demo",
    description: "Schedule a live demo and see how ContextGPT can automate your customer support and lead generation.",
    url: "https://contextgpt.co/book-a-demo",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Book a ContextGPT Demo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Book a Demo",
    description: "See how ContextGPT automates customer support and lead generation — book your live demo.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function BookADemoLayout({ children }) {
  return children;
}

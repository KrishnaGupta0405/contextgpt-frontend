import DemoClient from "./DemoClient";

export const metadata = {
  title: "ContextGPT | Live Demo",
  description: "Try ContextGPT live — see how it answers questions and captures leads in real time.",
  alternates: { canonical: "https://contextgpt.co/demo" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Live Demo",
    description: "Try ContextGPT live — see how it answers questions and captures leads in real time.",
    url: "https://contextgpt.co/demo",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Live Demo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Live Demo",
    description: "Try ContextGPT live — see how it answers questions and captures leads in real time.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

const DemoPage = () => {
  return <DemoClient />;
};

export default DemoPage;

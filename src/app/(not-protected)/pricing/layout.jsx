export const metadata = {
  title: "ContextGPT | Pricing",
  description: "Simple, transparent pricing for every team size. Start free, upgrade as you grow. No hidden fees.",
  keywords: ["ContextGPT pricing", "AI chatbot pricing", "chatbot plans", "free chatbot plan"],
  alternates: { canonical: "https://contextgpt.co/pricing" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Pricing",
    description: "Simple, transparent pricing for every team size. Start free, upgrade as you grow.",
    url: "https://contextgpt.co/pricing",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Pricing",
    description: "Simple, transparent pricing. Start free, upgrade as you grow.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does ContextGPT have a free plan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ContextGPT offers a free plan with no credit card required. You can train your chatbot and embed it on your website at no cost.",
          },
        },
        {
          "@type": "Question",
          name: "Can I upgrade or downgrade my plan anytime?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. You can upgrade, downgrade, or cancel your ContextGPT subscription at any time from your billing settings.",
          },
        },
        {
          "@type": "Question",
          name: "Are there any hidden fees?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. ContextGPT pricing is fully transparent — what you see on the pricing page is what you pay. No setup fees or hidden charges.",
          },
        },
        {
          "@type": "Question",
          name: "Does ContextGPT offer a trial period?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Paid plans include a trial period so you can test all premium features before being charged.",
          },
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "ContextGPT",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "USD", billingIncrement: "monthly" },
        { "@type": "Offer", name: "Enterprise", price: "0", priceCurrency: "USD", description: "Custom pricing — contact sales" },
      ],
    },
  ],
};

export default function PricingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {children}
    </>
  );
}

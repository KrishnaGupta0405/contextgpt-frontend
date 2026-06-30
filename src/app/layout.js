import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://contextgpt.in"),
  manifest: "/manifest.json",
  title: {
    default: "ContextGPT | AI Chatbot for Your Website",
    template: "%s | ContextGPT",
  },
  description: "Turn your website into an AI chatbot in minutes. Train on your content, capture leads, and answer questions 24/7.",
  keywords: ["AI chatbot", "website chatbot", "customer support AI", "lead generation chatbot", "no-code chatbot"],
  authors: [{ name: "ContextGPT", url: "https://contextgpt.in" }],
  creator: "ContextGPT",
  publisher: "ContextGPT",
  icons: {
    icon: "/icons/Contextgpt_icon_website_topbar.avif",
    shortcut: "/icons/Contextgpt_icon_website_topbar.avif",
    apple: "/icons/Contextgpt_icon_website_topbar.avif",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | AI Chatbot for Your Website",
    description: "Turn your website into an AI chatbot in minutes. Train on your content, capture leads, and answer questions 24/7.",
    images: [{ url: "/og-img.png", width: 1200, height: 630, alt: "ContextGPT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | AI Chatbot for Your Website",
    description: "Turn your website into an AI chatbot in minutes. Train on your content, capture leads, and answer questions 24/7.",
    images: ["/og-img.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

import { AuthProvider } from "@/context/AuthContext";
import SessionClearer from "@/components/SessionClearer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "ContextGPT",
      url: "https://contextgpt.in",
      logo: "https://contextgpt.in/icons/Contextgpt_icon.svg",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://contextgpt.in/contact",
      },
    },
    {
      "@type": "WebSite",
      name: "ContextGPT",
      url: "https://contextgpt.in",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://contextgpt.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "ContextGPT",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Turn your website into an AI chatbot in minutes. Train on your content, capture leads, and answer questions 24/7.",
      url: "https://contextgpt.in",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <Script
          src="https://cdn.datafast.io/v1/tracker.js"
          data-site-id={process.env.NEXT_PUBLIC_DATAFAST_SITE_ID}
          strategy="afterInteractive"
        />
        <SessionClearer />
        <AuthProvider>
          <TooltipProvider>
            {/* <NavigationMenuDemo /> */}
            {children}
            <Analytics />
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

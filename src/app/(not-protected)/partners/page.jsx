import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "ContextGPT | Partners",
  description: "Join the ContextGPT partner program and grow your business with AI.",
  alternates: { canonical: "https://contextgpt.co/partners" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Partners",
    description: "Join the ContextGPT partner program and grow your business with AI.",
    url: "https://contextgpt.co/partners",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Partners" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Partners",
    description: "Join the ContextGPT partner program and grow your business with AI.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

const Partners = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white relative overflow-hidden ">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-blue-50/60 to-white" />
      
      <div className="max-w-4xl mx-auto text-center px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-4">
          Partner Program
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] lg:leading-tight">
          We're brewing something <br className="hidden sm:block" />
          <span className="underline underline-offset-4 decoration-dotted decoration-indigo-500">special</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
          Our partner program is currently under development. We are creating a platform that will empower you to build, scale, and grow with ContextGPT.
        </p>
        
        <div className="mt-12 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Partners;
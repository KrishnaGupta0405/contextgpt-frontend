"use client";
import { lazy, Suspense, useEffect } from "react";

const HeroSection = lazy(() => import("./HeroSection"));
const FeaturesSectionHero = lazy(() => import("./FeaturesSection").then(m => ({ default: m.FeaturesSectionHero })));
const FromTheAuthor = lazy(() => import("./FromTheAuthor"));
const ThreeStepsSection = lazy(() => import("./FromTheAuthor").then(m => ({ default: m.ThreeStepsSection })));
const IntegrationsSection = lazy(() => import("./FromTheAuthor").then(m => ({ default: m.IntegrationsSection })));
const FAQSection = lazy(() => import("./FAQSection"));
const BentoGrid = lazy(() => import("./BentoGrid"));
const ShowcaseCarousel = lazy(() => import("./ShowcaseCarousel"));

export default function Landing() {
  // useEffect(() => {
  //   // Floating widget — only inject if layout.js hasn't already mounted one
  //   // (layout.js is deduplicated by Next.js on the landing page, so we load it here)
  //   let floating = null;
  //   const floatingAlreadyExists = !!document.getElementById("contextgpt-widget");
  //   if (!floatingAlreadyExists) {
  //     floating = document.createElement("script");
  //     floating.type = "module";
  //     floating.src = "https://contextgpt-widget-testing.vercel.app/loader.js?instance=floating&chatbotId=27df3d37-8395-4d1f-a084-5609237ae367";
  //     floating.setAttribute("data-chatbot-id", "27df3d37-8395-4d1f-a084-5609237ae367");
  //     if (process.env.NEXT_PUBLIC_ENV === "development") floating.setAttribute("data-server", "http://localhost:9000");
  //     floating.setAttribute("data-instance", "floating");
  //     document.body.appendChild(floating);
  //   }

  //   return () => {
  //     if (floating) document.body.removeChild(floating);
  //   };
  // }, []);

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-26 lg:px-36 mt-8">
        <Suspense fallback={null}>
          <HeroSection /> 
        </Suspense>
      </div>
      <div className="bg-gray-50 px-4 sm:px-26 lg:px-36">
        <Suspense fallback={null}>
          <BentoGrid />
        </Suspense>
        {/* <HowToInstall /> */}
        <Suspense fallback={null}>
          <FeaturesSectionHero />
        </Suspense>
      </div>
      <div className="bg-linear-to-b from-white to-blue-100 px-4 sm:px-26 lg:px-36">
        <Suspense fallback={null}>
          <FromTheAuthor />
          <ThreeStepsSection />
          <IntegrationsSection />
        </Suspense>
      </div>

      <div className="bg-black px-4 sm:px-26 lg:px-36">
        {/* <HeroSection /> */}
        <Suspense fallback={null}>
          <ShowcaseCarousel />
        </Suspense>
      </div>
      <div className="bg-white px-4 lg:px-36">
        {/* <HowItWorksSection /> */}
        <Suspense fallback={null}>
          <FAQSection />
        </Suspense>
        {/* <CTASection /> */}
      </div>
    </div>
  );
}

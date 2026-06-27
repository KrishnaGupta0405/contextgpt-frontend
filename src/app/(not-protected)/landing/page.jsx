"use client";

import { lazy, Suspense } from "react";

const HeroSection = lazy(() => import("./HeroSection"));
const FeaturesSectionHero = lazy(() => import("./FeaturesSection").then(m => ({ default: m.FeaturesSectionHero })));
const FromTheAuthor = lazy(() => import("./FromTheAuthor"));
const ThreeStepsSection = lazy(() => import("./FromTheAuthor").then(m => ({ default: m.ThreeStepsSection })));
const IntegrationsSection = lazy(() => import("./FromTheAuthor").then(m => ({ default: m.IntegrationsSection })));
const FAQSection = lazy(() => import("./FAQSection"));
const BentoGrid = lazy(() => import("./BentoGrid"));
const ShowcaseCarousel = lazy(() => import("./ShowcaseCarousel"));

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div className="px-[1rem] sm:px-26 lg:px-36 mt-8">
        <Suspense fallback={null}>
          <HeroSection />
        </Suspense>
      </div>
      <div className="bg-gray-50 px-[1rem] sm:px-26 lg:px-36">
        <Suspense fallback={null}>
          <BentoGrid />
        </Suspense>
        {/* <HowToInstall /> */}
        <Suspense fallback={null}>
          <FeaturesSectionHero />
        </Suspense>
      </div>
      <div className="bg-linear-to-b from-white to-blue-100 px-[1rem] sm:px-26 lg:px-36">
        <Suspense fallback={null}>
          <FromTheAuthor />
          <ThreeStepsSection />
          <IntegrationsSection />
        </Suspense>
      </div>

      <div className="bg-black px-[1rem] sm:px-26 lg:px-36">
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

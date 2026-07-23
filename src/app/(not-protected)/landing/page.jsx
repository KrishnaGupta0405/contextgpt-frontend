import HeroSection from "./HeroSection";
import { FeaturesSectionHero } from "./FeaturesSection";
import FromTheAuthor, { ThreeStepsSection, IntegrationsSection } from "./FromTheAuthor";
import FAQSection from "./FAQSection";
import BentoGrid from "./BentoGrid";
import ShowcaseCarousel from "./ShowcaseCarousel";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-26 lg:px-36 mt-8">
        <HeroSection />
      </div>
      <div className="bg-gray-50 px-4 sm:px-26 lg:px-36">
        <BentoGrid />
        <FeaturesSectionHero />
      </div>
      <div className="bg-linear-to-b from-white to-blue-100 px-4 sm:px-26 lg:px-36">
        <FromTheAuthor />
        <ThreeStepsSection />
        <IntegrationsSection />
      </div>

      <div className="bg-black px-4 sm:px-26 lg:px-36">
        <ShowcaseCarousel />
      </div>
      <div className="bg-white px-4 lg:px-36">
        <FAQSection />
      </div>
    </div>
  );
}

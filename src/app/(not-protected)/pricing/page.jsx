"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Calculator from "./Calculator";
import PricingSection from "./pricingSection";
import FAQSection from "../landing/FAQSection";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const ENTERPRISE_PLAN = {
  id: "enterprise-plan",
  type: "enterprise",
  price: null,
  chatbotGiven: -1,
  pagesUpto: -1,
  teamMemberAccess: -1,
  apiAccess: true,
  autoRefreshData: true,
  autoRefreshDataOccurrence: "daily",
  webhookSupport: true,
  customPlatformIntegration: true,
  billingInterval: "monthly",
  trialPeriodDays: 0,
  platformIntegrationAllowed: true,
  autoScanData: true,
  autoScanDataOccurrence: "daily",
  messagesSentByAi: -1,
  creditDiscountPct: 0,
};

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/billing/plans");
        if (res.data.success) {
          const fetchedPlans = res.data.data.plans ?? [];
          // Append enterprise for both billing intervals so downstream filters work
          const enterpriseMonthly = { ...ENTERPRISE_PLAN, billingInterval: "monthly" };
          const enterpriseYearly = { ...ENTERPRISE_PLAN, id: "enterprise-plan-yearly", billingInterval: "yearly" };
          setPlans([...fetchedPlans, enterpriseMonthly, enterpriseYearly]);
          setModels(res.data.data.models ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch pricing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
 
  return (
    <div>
      <div className="bg-white">
            <div className="bg-linear-to-b from-indigo-50/70 to-white py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-4">
              <AnimatedGridPattern
                  numSquares={10}
                  maxOpacity={0.1}
                  duration={2}
                  repeatDelay={1}
                  height={180}
                  width={180}
                  className={cn(
                    "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-20%] h-[100%] "
                  )}
                />
                {/* Hero */}
              <div className="pb-1 p-[4rem] flex justify-center items-center flex-col gap-4 ">
                <p className="tracking-tight text-center text-md font-medium text-blue-600 ">Pricing Plans and Add-Ons</p>
                <h1 className="tracking-tight text-center text-7xl font-medium max-w-4xl">Smart pricing for smart businesses</h1>
                <p className="tracking-tight text-center text-xl pt-4 text-gray-500 font-medium">
                  ContextGPT offers flexible, transparent pricing designed to scale with your business needs.
                </p>
              </div>
            <PricingSection plans={plans} models={models} loading={loading} />
            </div>
          </div>
            <Calculator plans={plans} models={models} loading={loading} />
            <div className="bg-white px-4 lg:px-36">
              <FAQSection />
            </div>
          </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Box, Rocket, Zap, Shield, Loader2, Users, FileText, RefreshCw, Webhook, Globe, Bot, Key, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLAN_ICONS = [Box, Rocket, Zap, Shield];

const MODEL_COLORS = [
  { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500" },
  { color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-400", badge: "bg-blue-200 text-blue-900", dot: "bg-blue-600" },
  { color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  { color: "text-blue-800", bg: "bg-blue-100", border: "border-blue-500", badge: "bg-blue-200 text-blue-900", dot: "bg-blue-700" },
];

function getPlanName(type = "") {
  if (type.includes("starter")) return "Starter";
  if (type.includes("growth")) return "Growth";
  if (type.includes("scale")) return "Scale";
  if (type.includes("enterprise")) return "Enterprise";
  return type;
}

const PLAN_DESCRIPTIONS = {
  Starter: "For solo founders and small sites getting started.",
  Growth: "For growing businesses that need automation.",
  Scale: "For teams that need more chatbots and scale.",
  Enterprise: "Custom volume, limits, and compliance.",
};

function normalizeModel(raw, idx) {
  const style = MODEL_COLORS[idx % MODEL_COLORS.length];
  const cost = raw.creditCost ?? 1;
  return {
    id: raw.id,
    label: capitalize(raw.title),
    multiplier: cost,
    provider: raw.provider,
    badge: cost === 1 ? "Best Value" : `${cost}× per msg`,
    ...style,
  };
}

function mergePlans(rawPlans) {
  const map = {};
  const order = [];
  rawPlans.forEach((raw) => {
    const key = raw.type?.replace(/_monthly|_yearly|_montly/i, "");
    if (key === "PRO_DUMMY_dont_remove" || raw.type === "PRO_DUMMY_dont_remove") return;
    if (!map[key]) { map[key] = { monthly: null, yearly: null, raw }; order.push(key); }
    if (raw.billingInterval === "yearly") map[key].yearly = raw;
    else map[key].monthly = raw;
  });

  return order.map((key, idx) => {
    const { monthly, yearly, raw } = map[key];
    const base = monthly ?? yearly ?? raw;
    return {
      id: base.id,
      type: base.type,
      name: getPlanName(base.type),
      monthlyPrice: monthly ? parseFloat(monthly.price) || null : null,
      yearlyPrice: yearly ? parseFloat(yearly.price) || null : null,
      monthlyPlanId: monthly?.id ?? null,
      yearlyPlanId: yearly?.id ?? null,
      baseCredits: base.messagesSentByAi ?? null,
      chatbots: base.chatbotGiven ?? null,
      pages: base.pagesUpto ?? null,
      teamMembers: base.teamMemberAccess ?? null,
      trialDays: base.trialPeriodDays ?? 0,
      apiAccess: base.apiAccess ?? false,
      autoRefreshData: base.autoRefreshData ?? false,
      autoRefreshDataOccurrence: base.autoRefreshDataOccurrence ?? null,
      webhookSupport: base.webhookSupport ?? false,
      customPlatformIntegration: base.customPlatformIntegration ?? false,
      platformIntegrationAllowed: base.platformIntegrationAllowed ?? false,
      autoScanData: base.autoScanData ?? false,
      autoScanDataOccurrence: base.autoScanDataOccurrence ?? null,
      creditDiscountPct: base.creditDiscountPct ?? 0,
      description: base.description ?? PLAN_DESCRIPTIONS[getPlanName(base.type)] ?? `${getPlanName(base.type)} plan`,
      icon: PLAN_ICONS[idx % PLAN_ICONS.length],
      popular: idx === 1,
    };
  });
}

function buildFeatures(plan) {
  const features = [];
  if (plan.chatbots) features.push({ icon: Bot, label: `${plan.chatbots} chatbot${plan.chatbots > 1 ? "s" : ""}` });
  if (plan.pages) features.push({ icon: FileText, label: `Up to ${plan.pages.toLocaleString()} pages` });
  if (plan.teamMembers) features.push({ icon: Users, label: `${plan.teamMembers} team member${plan.teamMembers > 1 ? "s" : ""}` });
  if (plan.apiAccess) features.push({ icon: Key, label: "API Access" });
  if (plan.autoRefreshData) features.push({ icon: RefreshCw, label: plan.autoRefreshDataOccurrence ? `Auto Refresh (${plan.autoRefreshDataOccurrence})` : "Auto Refresh" });
  if (plan.autoScanData) features.push({ icon: BarChart3, label: plan.autoScanDataOccurrence ? `Auto Scan (${plan.autoScanDataOccurrence})` : "Auto Scan" });
  if (plan.webhookSupport) features.push({ icon: Webhook, label: "Webhook Support" });
  if (plan.platformIntegrationAllowed || plan.customPlatformIntegration) features.push({ icon: Globe, label: "Platform Integrations" });
  return features;
}

const fmt = (n) => n?.toLocaleString() ?? "—";
const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1) ?? "";

function CalculatorContent({ plans: rawPlans = [], models: rawModels = [], loading = true }) {
  const plans = mergePlans(rawPlans);
  const models = rawModels.map(normalizeModel);
  const searchParams = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    if (!plans.length) return;
    const paramInterval = searchParams.get("interval");
    const paramPlan = searchParams.get("plan");
    if (paramInterval === "year") setIsYearly(true);
    else if (paramInterval === "month") setIsYearly(false);
    if (paramPlan) {
      const match = plans.find((p) => p.name.toLowerCase() === paramPlan.toLowerCase());
      if (match) { setSelectedPlan(match); return; }
    }
    if (!selectedPlan) setSelectedPlan(plans[1] ?? plans[0]);
  }, [plans.length]);

  useEffect(() => {
    if (models.length && !selectedModel) setSelectedModel(models[0]);
  }, [models.length]);

  if (loading || !selectedPlan || models.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="text-blue-500 animate-spin" size={28} />
        <span className="text-slate-500 text-sm">Loading calculator…</span>
      </div>
    );
  }

  const isEnterprise = selectedPlan.name === "Enterprise";
  const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const yearlyTotal = selectedPlan.yearlyPrice ? (selectedPlan.yearlyPrice * 12).toFixed(0) : null;

  const credits = selectedPlan.baseCredits;
  const modelQuotas = models.map((m) => ({
    ...m,
    msgs: credits && credits > 0 ? Math.floor(credits / m.multiplier) : null,
  }));

  const features = buildFeatures(selectedPlan);

  return (
    <div className="bg-slate-50 min-h-screen px-4 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">Pricing Calculator</p>
        <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
          How many messages do you actually get?
        </h1>
        <p className="text-slate-500 text-[1.3rem] leading-relaxed">
          Your message quota depends on which AI model you use. See exactly how many messages you get with each model on your chosen plan.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex gap-7 flex-col lg:flex-row items-start">
        {/* LEFT */}
        <div className="flex-1 min-w-[320px] flex flex-col gap-8">

          {/* STEP 1 */}
          <StepSection number="1" title="Pick a plan">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const active = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                      active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-3 bg-blue-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 tracking-wide">
                        POPULAR
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className={active ? "text-blue-500" : "text-slate-400"} />
                      <span className={`font-medium text-xl text-slate-800`}>{plan.name}</span>
                    </div>
                    <div className={`font-medium text-lg ${active ? "text-blue-600" : "text-slate-900"}`}>
                      {isYearly
                        ? plan.yearlyPrice ? `$${plan.yearlyPrice}/mo` : "Custom"
                        : plan.monthlyPrice ? `$${plan.monthlyPrice}/mo` : "Custom"}
                    </div>
                    <div className="text-[0.8rem] text-slate-400 mt-1 leading-snug line-clamp-2">{plan.description}</div>
                  </button>
                );
              })}
            </div>
          </StepSection>

          {/* STEP 2 */}
          <StepSection number="2" title="Choose billing cycle">
            <div className="flex items-center gap-3">
              <Tabs className="" value={isYearly ? "yearly" : "monthly"} onValueChange={(v) => setIsYearly(v === "yearly")}>
                <TabsList className="h-15 px-1.5 text-xl">
                  <TabsTrigger value="monthly" className="px-5 py-5 text-lg ">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="px-5 py-5 text-lg">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
                <Badge className="text-sm bg-green-100 text-green-800 border-green-200 font-bold">
                  Save ~39% yearly
                </Badge>
            </div>
          </StepSection>

          {/* STEP 3 */}
          <StepSection number="3" title="Choose a model">
            {isEnterprise ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-sm font-bold text-emerald-800 mb-2">Custom volume &amp; limits</p>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Enterprise is priced based on your message volume, chatbot count, team size, and compliance needs (HIPAA / BAA / custom DPA). Our team will size the plan with you on a 30-minute call.
                </p>
                <a
                  href="mailto:contact@contextgpt.co?subject=Enterprise Plan Inquiry"
                  className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  Contact us
                </a>
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  Each model has a different credit cost per message. 
                  GPT-4.1-mini is ~5× cheaper per message, so the same plan gets you many more messages when you lean on mini.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {modelQuotas.map((m) => {
                    const active = selectedModel?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m)}
                        className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                          active ? `${m.border} ${m.bg}` : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`leading-snug ${active ? m.color : "text-slate-700"}`}>{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.multiplier === 1 ? "" : `${m.multiplier}× gpt-4.1-mini usage`}</div>
                      </button>
                    );
                  })}
                </div>

                {selectedModel && (() => {
                  const quota = modelQuotas.find((m) => m.id === selectedModel.id);
                  return (
                    <div className={`rounded-2xl border-2 p-5 flex items-center justify-between ${quota.bg} ${quota.border}`}>
                      <div>
                        <div className={`font-bold text-sm ${quota.color}`}>{quota.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{quota.multiplier === 1 ? "1 credit per message" : `${quota.multiplier} credits per message`}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${quota.color}`}>{quota.msgs !== null ? fmt(quota.msgs) : "Custom"}</div>
                        <div className="text-xs text-slate-400 font-medium">messages / month</div>
                      </div>
                    </div>
                  );
                })()}

                <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                  Each &quot;message&quot; counts both the user&apos;s question and the AI&apos;s reply.
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Don't worry about getting this exactly right — you can change the split anytime from your billing settings.
                </p>
                <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Coming soon</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    We&apos;re soon be rolling out a feature that lets you set usage-based restrictions to automatically switch models — so you stay within budget without thinking about it.
                  </p>
                </div>
              </>
            )}
          </StepSection>
        </div>

        {/* RIGHT SUMMARY */}
        <Card className="w-full lg:w-[300px] lg:flex-none sticky top-6 shadow-lg border-slate-200">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-900">{selectedPlan.name}</div>
                <p className="text-lg text-slate-500 mt-0.5 leading-snug">{selectedPlan.description}</p>
              </div>
              {isYearly && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] tracking-wide">
                  YEARLY
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 flex flex-col gap-0">
            {/* Price */}
            <div className="pb-4 mb-4 border-b border-slate-100">
              {price ? (
                <>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-medium text-slate-900 leading-none">${isYearly && yearlyTotal ? yearlyTotal : price}</span>
                    <span className="text-sm text-slate-400 mb-1">{isYearly && yearlyTotal ? '/yr' : '/mo'}</span>
                  </div>
                  {isYearly && yearlyTotal && (
                    <p className="text-xs text-slate-500 mt-1">
                      Equivalent to <span className="text-slate-800">${selectedPlan.yearlyPrice}/mo</span> — save 39%
                    </p>
                  )}
                </>
              ) : (
                <span className="text-3xl text-slate-900">Custom</span>
              )}
            </div>

            {/* Message Quota */}
            {!isEnterprise && (
              <div className="pb-4 mb-4 border-b border-slate-100">
                <p className="text-[10px] tracking-widest text-slate-600 uppercase mb-3">Max. Messages using Different AI Models</p>
                {modelQuotas.map((m) => (
                  <div key={m.id} className="flex justify-between mb-2">
                    <span className="text-sm text-slate-800">{m.label}</span>
                    <span className={`text-sm ${m.color}`}>{m.msgs !== null ? fmt(m.msgs) : "Custom"}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Plan Limits */}
            <div className="pb-4 mb-4 border-b border-slate-100">
              <p className="text-sm tracking-widest text-slate-600 uppercase mb-3">Plan Limits</p>
              {[
                { label: "Chatbots", value: selectedPlan.chatbots, prefix: "Up to " },
                { label: "Pages", value: selectedPlan.pages, prefix: "Up to " },
                { label: "Team members", value: selectedPlan.teamMembers, prefix: "Up to " },
              ].map((item) => (
                <div key={item.label} className="flex justify-between mb-1.5">
                  <span className="text-sm text-slate-800">{item.label}</span>
                  <span className="text-sm text-slate-800">{item.value ? `${item.prefix ?? ""}${fmt(item.value)}` : "Custom"}</span>
                </div>
              ))}
            </div>

            {/* What's Included */}
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="text-sm tracking-widest text-slate-600 uppercase mb-3">What&apos;s Included</p>
              {features.length > 0 ? (
                features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-blue-600 sm:h-4 sm:w-4"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-sm text-slate-600">{f.label}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Contact us for custom features</p>
              )}
            </div>

            {/* CTA */}
            {isEnterprise ? (
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                <a href="mailto:contact@contextgpt.co?subject=Enterprise Plan Inquiry">Contact us</a>
              </Button>
            ) : price ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl text-slate-600">Trial price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold text-slate-900">
                      ${isYearly && yearlyTotal ? yearlyTotal : price}
                    </span>
                    <span className="text-sm text-slate-500">
                      {isYearly && yearlyTotal ? '/yr' : '/mo'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const interval = isYearly ? "year" : "month";
                    const planName = selectedPlan.name.toLowerCase();
                    const url = `/pricing?interval=${interval}&plan=${planName}`;
                    window.history.replaceState(null, "", url);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  className="text-xl px-16 py-7 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Start free trial on {selectedPlan.name}
                </Button>
                <p className="mt-2.5 text-sm text-slate-400 text-center leading-snug">
                  Need more messages, webhook support, or to remove the watermark? Add any of those from your billing page once your trial starts.
                </p>
              </>
            ) : (
              <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11">
                <a href="mailto:contact@contextgpt.co">Contact us</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Calculator(props) {
  return (
    <React.Suspense>
      <CalculatorContent {...props} />
    </React.Suspense>
  );
}

function StepSection({ number, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl font-medium">{number}.</div>
        <div className="font-medium text-2xl">{title}</div>
      </div>
      {children}
    </div>
  );
}

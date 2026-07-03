"use client";

import Link from "next/link";
import {
  Target,
  Heart,
  Lightbulb,
  Shield,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const VALUES = [
  {
    icon: Target,
    title: "Customer First",
    description:
      "Every feature we build starts with a real customer problem. We obsess over making support effortless for both businesses and their visitors.",
  },
  {
    icon: Lightbulb,
    title: "Simplicity",
    description:
      "AI is complex, but using it shouldn't be. We believe in making powerful technology accessible to everyone, from startups to enterprises.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Your data is sacred. We're SOC 2 Type II certified, GDPR compliant, and HIPAA assessed. Your customers' data is never used to train our models.",
  },
  {
    icon: Heart,
    title: "Transparency",
    description:
      "No hidden fees, no dark patterns. We publish our pricing, our changelog, and our roadmap openly because trust is earned.",
  },
];

const STATS = [
  { value: "10,000+", label: "Chatbots Created" },
  { value: "50M+", label: "Messages Handled" },
  { value: "95+", label: "Languages Supported" },
  { value: "99.9%", label: "Uptime" },
];

// const TEAM = [
//   {
//     name: "Krishna Gupta",
//     role: "Founder & CEO",
//     bio: "Built ContextGPT from the ground up with a vision to make AI customer support accessible to every business.",
//   },
// ];

export default function AboutUs() {
  return (
    <div className="bg-white text-slate-900">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 to-white" />
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            We&rsquo;re Building the Future of{" "}
            <span className="text-blue-600">Customer Support</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600"
          >
            ContextGPT was born from a simple idea: every business deserves an
            AI support agent that truly understands their product. We make it
            possible in minutes, not months.
          </p>
        </div>
      </section>

      {/* ─── Our Story ─── */}
      <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-slate-600">
              <p>
                Sri Sai International has been operating since July 1, 2017,
                building experience across a diverse range of industries. Over
                the years, this foundation has enabled us to understand the
                evolving needs of businesses and the technology required to
                meet them.
              </p>
              <p>
                Building on this experience, we are now entering the
                artificial intelligence sector through ContextGPT.in, our
                dedicated platform for AI-powered chatbot solutions. Through
                ContextGPT, we bring the same commitment to quality and
                reliability that has defined Sri Sai International, now
                applied to intelligent customer support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      {/* <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-blue-600">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ─── Values ─── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What We Stand For
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              The principles that guide everything we build.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="rounded-2xl border border-slate-200 bg-white p-7"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Team ─── */}
      {/* <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Meet Our Team</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            A small, passionate team building big things.
          </p>

          <div className="mt-12 flex justify-center">
            {TEAM.map((member) => (
              <div
                key={member.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-blue-600">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ─── CTA ─── */}
      {/* <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-16 text-center text-white shadow-2xl shadow-blue-600/20">
          <h2 className="text-3xl font-bold tracking-tight">
            Want to Join Our Mission?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            We&rsquo;re always looking for talented people who want to help
            businesses deliver better customer experiences.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
            >
              Try ContextGPT Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}

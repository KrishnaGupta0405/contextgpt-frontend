"use client";

import { useState } from "react";
import { generateDPAHtml } from "./generateDPAHtml";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export default function DPA() {
  const [form, setForm] = useState({
    company: "",
    reg: "",
    address: "",
    email: "",
  });

  const canDownload = form.company.trim().length > 0;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDownload() {
    if (!canDownload) return;
    const htmlContent = generateDPAHtml(form);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  const inputClass =
    "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white text-gray-900 box-border";

  return (
    <div className="bg-white">
      <div className="bg-linear-to-b from-indigo-50/70 to-white py-16 px-4 sm:px-6 lg:px-4">
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
  <div className="p-[8rem] flex justify-center items-center flex-col gap-4 ">
          <p className="text-center text-sm font-bold text-blue-600">DPA</p>
          <h1 className="text-center text-6xl">Data Processing Agreement</h1>
          <p className="text-center text-xl pt-4 text-gray-500">
            Generate a customized Data Processing Agreement (DPA) for ContextGPT
            services.<br/> Fill in your company details and download the PDF.
          </p>
  </div>
      </div>
      <article className="prose prose-slate mx-auto max-w-3xl">
        {/* <hr /> */}

        {/* Generator Card */}
        <div className="bg-[#f8f9ff]  rounded-xl px-8 py-7 mb-8 relative z-10">
          <h2 className="mt-0 mb-1 text-xl">Generate Your DPA</h2>
          <p className="text-indigo-600 text-sm mt-0 mb-5">
            Fill in your company details below and download a customized Data
            Processing Agreement template.
          </p>

          {/* Note box */}
          <div className="bg-white border border-[#e2e5f0] rounded-lg px-4 py-3 text-[13px] text-gray-700 mb-6 leading-relaxed">
            <strong>Note:</strong>{" "}
            <span className="text-indigo-600">
              This DPA becomes effective only when signed by both parties.
              ContextGPT executes DPAs for customers on{" "}
              <strong>Enterprise plans</strong>. Contact{" "}
              <a href="mailto:support@contextgpt.co" className="text-indigo-600">
                support@contextgpt.co
              </a>{" "}
              to discuss your requirements.
            </span>
          </div>

          {/* Form fields — two columns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Company Name */}
            <div>
              <label
                htmlFor="company"
                className="block text-[13px] font-semibold text-gray-700 mb-1.5"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Acme Corporation Ltd."
                value={form.company}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Registration Number */}
            <div>
              <label
                htmlFor="reg"
                className="block text-[13px] font-semibold text-gray-700 mb-1.5"
              >
                Registration Number
              </label>
              <input
                id="reg"
                name="reg"
                type="text"
                placeholder="12345678"
                value={form.reg}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Registered Address */}
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-[13px] font-semibold text-gray-700 mb-1.5"
            >
              Registered Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="123 Business Street, City, Country 12345"
              value={form.address}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Contact Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-[13px] font-semibold text-gray-700 mb-1.5"
            >
              Contact Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="legal@company.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Download button + hint */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none transition-colors duration-200 ${
                canDownload
                  ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                />
              </svg>
              Download PDF
            </button>
            <span className="text-xs text-gray-500">
              {canDownload
                ? 'Opens print dialog — select "Save as PDF"'
                : "Enter the company name to enable the download option"}
            </span>
          </div>
        </div>

        {/* What is a DPA */}
        <h2>What is a DPA?</h2>
        <p>
          A Data Processing Agreement (DPA) is a legally binding contract
          between a data controller (you) and a data processor (ContextGPT) that
          outlines the terms and conditions for processing personal data.
        </p>
        <p className="text-indigo-600">
          This agreement ensures compliance with data protection regulations such
          as GDPR, CCPA, and other applicable privacy laws.
        </p>

        <h2>What&apos;s Included</h2>
        <ul>
          <li>Data processing terms and obligations</li>
          <li>Security measures and technical safeguards</li>
          <li>
            Sub-processor information (see our{" "}
            <a href="/legal/subprocesses" className="text-indigo-600">
              subprocessors list
            </a>
            )
          </li>
          <li>Data subject rights procedures</li>
          <li>Breach notification protocols</li>
          <li>International data transfer mechanisms</li>
        </ul>

        <h2>Questions?</h2>
        <p>
          If you have questions about our data processing practices or need a
          customized agreement, please contact us at{" "}
          <a href="mailto:support@contextgpt.co" className="text-indigo-600">
            support@contextgpt.co
          </a>
          .
        </p>
      </article>
    </div>
  );
}

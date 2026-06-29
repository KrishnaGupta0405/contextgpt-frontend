import Link from "next/link";
import { MailOpen, Twitter, Youtube } from "lucide-react";
import CTASection from "@/app/(not-protected)/landing/CTASection";
const CONVERT_TO_MARKDOWN = [
  { label: "Convert PDF to Markdown", href: "/tools/convert-pdf-to-markdown" },
  {
    label: "Convert DOCX to Markdown",
    href: "/tools/convert-docx-to-markdown",
  },
  {
    label: "Convert HTML to Markdown",
    href: "/tools/convert-html-to-markdown",
  },
  {
    label: "Convert Notion to Markdown",
    href: "/tools/convert-notion-to-markdown",
  },
  {
    label: "Convert Google Docs to Markdown",
    href: "/tools/convert-google-docs-to-markdown",
  },
  { label: "Convert XML to Markdown", href: "/tools/convert-xml-to-markdown" },
  { label: "Convert CSV to Markdown", href: "/tools/convert-csv-to-markdown" },
  {
    label: "Convert JSON to Markdown",
    href: "/tools/convert-json-to-markdown",
  },
  { label: "Convert RTF to Markdown", href: "/tools/convert-rtf-to-markdown" },
  {
    label: "Convert Paste to Markdown",
    href: "/tools/convert-paste-to-markdown",
  },
  {
    label: "Convert Webpage to Markdown",
    href: "/tools/convert-webpage-to-markdown",
  },
];

const PRODUCT = [
  { label: "Features", href: "/features" },
  { label: "Integrations", href: "/integration" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/aboutus" },
  { label: "API Docs", href: "/api-docs" },
  { label: "Partners", href: "/partners" },
  { label: "WordPress Plugin", href: "/wordpress-plugin" },
  { label: "Lead Generation", href: "/lead-generation" },
];

const LEGAL = [
  { label: "Terms & Conditions", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  // { label: "Refund Policy", href: "/legal/terms" },
  { label: "Contact us", href: "/contact" },
];
 
const AI_CHAT_TOOLS = [
  { label: "AI Chat with Your Text Data", href: "/tools/ai-chat-text-data" },
  {
    label: "AI Chat with Your Website Data",
    href: "/tools/ai-chat-website-data",
  },
  {
    label: "AI Chat with Your Document & Data",
    href: "/tools/ai-chat-document-data",
  },
  {
    label: "AI Chat with Your PDF Document & Data",
    href: "/tools/ai-chat-pdf-data",
  },
  {
    label: "AI Chat with Your Word Document & Data",
    href: "/tools/ai-chat-word-data",
  },
];

const AI_GENERATORS = [
  { label: "AI Reply Generator", href: "/tools/ai-reply-generator" },
  { label: "AI Prompt Generator", href: "/tools/ai-prompt-generator" },
  { label: "AI Prompt Optimizer", href: "/tools/ai-prompt-optimizer" },
  { label: "AI FAQ Generator", href: "/tools/ai-faq-generator" },
  { label: "AI Answer Generator", href: "/tools/ai-answer-generator" },
  {
    label: "AI Email Response Generator",
    href: "/tools/ai-email-response-generator",
  },
  { label: "AI Letter Generator", href: "/tools/ai-letter-generator" },
  { label: "AI Blog Title Generator", href: "/tools/ai-blog-title-generator" },
  {
    label: "AI Chatbot Name Generator",
    href: "/tools/ai-chatbot-name-generator",
  },
  {
    label: "AI SaaS Brand Name Generator",
    href: "/tools/ai-saas-brand-name-generator",
  },
];

const OTHER_TOOLS = [
  { label: "All Tools", href: "/tools" },
  {
    label: "AI Chatbot Conversation Analysis",
    href: "/tools/ai-chatbot-conversation-analysis",
  },
  { label: "Sitemap Finder & Checker", href: "/tools/sitemap-finder-checker" },
  { label: "Sitemap Validator", href: "/tools/sitemap-validator" },
  { label: "XML Sitemap Generator", href: "/tools/xml-sitemap-generator" },
  { label: "Sitemap URL Extractor", href: "/tools/sitemap-url-extractor" },
  { label: "Website URL Extractor", href: "/tools/website-url-extractor" },
  { label: "Chatbot ROI Calculator", href: "/tools/chatbot-roi-calculator" },
  {
    label: "Email Signature Generator",
    href: "/tools/email-signature-generator",
  },
  // { label: "SourceSync.in", href: "https://sourcesync.in", external: true },
];

function FooterColumn({ heading, href, links }) {
  return (
    <div>
      <Link
        href={href}
        className="text-md mb-3 block font-medium text-blue-600 hover:underline"
      >
        {heading}
      </Link>
      <ul className="space-y-2 text-xl font-medium">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black hover:text-blue-600"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-black hover:text-blue-600"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white ">
      <div
        className="hidden lg:block w-full"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, #f0f5ff 50%)",
        }}
      >
        <CTASection />
      </div>
      <div className="w-full bg-[#f0f5ff] sm:p-6">
        <div className="mx-auto max-w-7xl pt-8 pb-14">
          {/* Top row */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand block */}
            <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center gap-2">
                    <img
                      src="/icons/Contextgpt_icon.png"
                      alt="ContextGPT"
                      className="-mt-2 h-14 w-full"
                    />
                    <span className="text-3xl tracking-tight" style={{fontWeight: "bold"}}>
                      Context<span className="text-blue-600" style={{fontWeight: "bold"}}>GPT</span>
                    </span>
                  </Link>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-500">
                Instantly answer your visitors&apos; questions with a
                personalized chatbot trained on your website content.
              </p>
              <p className="text-blue-600 flex gap-2 items-center"> <MailOpen className="h-4 w-4 " /> krishna@contextgpt.in</p>

              {/* Product Hunt badge */}
              {/* <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
              <span className="text-base">🏆</span>
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-orange-500 uppercase">
                  Product Hunt
                </p>
                <p className="text-xs font-bold text-orange-700">
                  #1 Product of the Day
                </p>
              </div>
            </div> */}

              {/* Email */}
              {/* <a
              href="mailto:KRISHNA@contextGPT.in"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              krishna@contextGPT.in
            </a> */}
            </div>

            {/* Convert to Markdown */}
            <FooterColumn
              heading="Convert to Markdown"
              href="/tools/convert-to-markdown"
              links={CONVERT_TO_MARKDOWN}
            />

            {/* Product */}
            <FooterColumn heading="Product" href="#" links={PRODUCT} />

            {/* Legal */}
            <FooterColumn heading="Legal" href="#" links={LEGAL} />
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-gray-100" />

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn
              heading="AI Chat Tools"
              href="/tools/ai-chat-tools"
              links={AI_CHAT_TOOLS}
            />

            <FooterColumn
              heading="AI Generators"
              href="/tools/ai-generators"
              links={AI_GENERATORS}
            />

            <FooterColumn
              heading="Other Tools"
              href="/tools/other-tools"
              links={OTHER_TOOLS}
            />
          </div>

          {/* Copyright bar */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              © contextGPT {new Date().getFullYear()} . All rights reserved
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/contextGPT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@contextGPT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

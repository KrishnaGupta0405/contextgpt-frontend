import React from 'react';

export const metadata = {
  title: "ContextGPT | Security",
  description: "Learn how ContextGPT keeps your data secure with enterprise-grade encryption, access controls, and compliance practices.",
  keywords: ["AI chatbot security", "data security", "GDPR chatbot", "enterprise security", "data encryption"],
  alternates: { canonical: "https://contextgpt.co/security" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Security",
    description: "Enterprise-grade security — encryption, access controls, and compliance built into every layer.",
    url: "https://contextgpt.co/security",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "ContextGPT Security" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Security",
    description: "Enterprise-grade encryption, access controls, and compliance built into every layer.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

import {
  EyeOff,
  Archive,
  Check,
  ShieldCheck,
  Server,
  Activity,
  Shield,
  Key,
  Database,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  BookOpen,
  Code2,
  Cpu,
  Users,
  Trash2
} from 'lucide-react';

const securityFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is ContextGPT GDPR compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ContextGPT is GDPR compliant. We give you full control over data retention, deletion, and user consent so you can meet your compliance obligations.",
      },
    },
    {
      "@type": "Question",
      name: "How does ContextGPT encrypt my data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption. Your content and conversation data are never shared with third parties.",
      },
    },
    {
      "@type": "Question",
      name: "Who can access my chatbot's data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only authorized members of your team can access your chatbot data. ContextGPT provides role-based access controls so you decide who sees what.",
      },
    },
    {
      "@type": "Question",
      name: "Can I delete my data from ContextGPT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can delete your chatbot data, conversation history, and account at any time from your dashboard settings.",
      },
    },
  ],
};

const Security = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(securityFaqSchema) }}
      />
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 max-w-5xl mx-auto text-center flex flex-col items-center">
        <p className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4">Security</p>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
          Your chatbot. Your conversations. Your data.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12">
          When your customers talk to your chatbot, they're sharing real information with you. We take that seriously. Every message, every knowledge base document, and every integration is handled with strict isolation and encryption — so your data never bleeds into anyone else's system.
        </p>

        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-extrabold text-blue-600">AES-256</span>
            <span className="text-sm font-semibold text-slate-500">Conversations encrypted at rest</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-extrabold text-blue-600">TLS 1.3</span>
            <span className="text-sm font-semibold text-slate-500">All chat traffic in transit</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-extrabold text-blue-600">0</span>
            <span className="text-sm font-semibold text-slate-500">Chats used to train AI models</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-extrabold text-blue-600">100%</span>
            <span className="text-sm font-semibold text-slate-500">Tenant data isolation</span>
          </div>
        </div>
      </section>

      {/* Conversation Privacy */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Conversation privacy, by design</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Every message your chatbot sends or receives is treated as sensitive. Here's exactly how we handle it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <EyeOff className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Never trained on</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Conversations between your customers and your chatbot are never used to train, fine-tune, or improve any AI model — not ours, not the underlying LLM provider's. This applies to every plan, with no opt-out required.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">No cross-tenant visibility</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Your chatbot's conversation history is invisible to every other ContextGPT customer. Workspace data is partitioned at the database level — no shared tables, no shared indexes, no shared cache between accounts.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Delete on demand</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Delete any conversation, any knowledge base document, or your entire account — and it's permanently removed from all storage layers within 24 hours. No grace period retention, no backup resurrection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Security */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your knowledge base stays yours</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              The documents, URLs, and files you upload to train your chatbot are proprietary. We treat them that way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Isolated knowledge stores</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow">
                Each chatbot's knowledge base — every uploaded PDF, URL, or text snippet — is stored in a dedicated vector index scoped to your workspace. No other chatbot on the platform can query your embeddings, intentionally or by accident.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Per-workspace vector index isolation</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Source documents encrypted at rest</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">LLM data handling</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow">
                When a user message is sent to an LLM for a response, only the minimum context needed is included. We use zero data retention agreements with our LLM providers — prompts and completions are not logged or used for training on their side either.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Zero data retention with LLM providers</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Minimum-context prompt construction</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Archive className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Export & portability</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow">
                You can export your entire knowledge base, all conversation logs, and your chatbot configuration at any time in standard formats. Your data is never locked in. If you leave, you take everything with you.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Full data export available anytime</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>Standard formats — JSON, CSV</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Widget & Embed Security */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Embed security</h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
              The chat widget lives on your website and interacts with your visitors. We've built the embed layer to be hardened against the threats that come with public-facing JavaScript.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Code2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Origin-locked embeds</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your chatbot widget only loads on the domains you authorize. Requests from unlisted origins are rejected at the API level — someone can't copy your embed code and run your chatbot on their site.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Scoped API tokens</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The token embedded in your widget script is scoped to read-only chat operations for that specific chatbot only. It cannot access your account settings, other chatbots, or conversation history — even if exposed.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">XSS-hardened rendering</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every chatbot response is sanitized through DOMPurify before it's rendered in the widget, with a strict tag and attribute allow-list. Links are automatically hardened with target="_blank" and rel="noopener noreferrer" to prevent tab-nabbing.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rate limiting per visitor</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Chat requests are rate-limited per visitor session and per IP. Automated bots spamming your chatbot are blocked before they hit your quota or abuse the system at scale.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Minimal visitor data by default</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We log session metadata like IP address and timestamps for security and abuse prevention. Personal details like names and emails are only collected if you explicitly enable a pre-chat form — visitors are never forced to identify themselves.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Strict request validation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every chat request is validated before it's processed — message length is capped, thread and page identifiers are checked against expected formats, and counters are clamped to safe bounds. Malformed or oversized payloads are rejected outright.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">SQL injection protection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every database query runs through parameterized queries via our ORM layer — user input is never concatenated into a SQL string. This closes off SQL injection as an attack vector by design, not by filtering.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">CSRF-resistant by design</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The widget authenticates with a token sent explicitly in the request body, not relied on through ambient cookies. That means cross-site request forgery can't succeed against your chatbot, regardless of where the request originates from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access & Team Security */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Team & account security</h2>
            <p className="text-slate-600 text-lg">Control who on your team can see and change what.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Role-based access per chatbot</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Assign team members as Viewers, Editors, or Admins at the individual chatbot level — not just workspace-wide. A support agent reviewing conversations can't accidentally modify your chatbot's knowledge base or system prompt.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">MFA on all accounts</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Multi-factor authentication is available on all plans and enforced on all internal ContextGPT staff accounts. Admins can require MFA across their entire team from the security settings panel.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Full audit log</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Every sensitive action in your workspace — configuration changes, knowledge base edits, API key creation, team member invites — is recorded with a timestamp and the acting user. You always know what changed and who changed it.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No ContextGPT staff access to your chats</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Our engineering and support teams cannot read your chatbot's conversations without explicit written authorization from your account admin. All internal data access is logged, time-bounded, and tied to a support ticket.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Found a vulnerability?</h2>
          <p className="text-blue-100 text-lg mb-8">
            If you've found a security issue in ContextGPT — the dashboard, the chat widget, or the API — please report it to{' '}
            <a href="mailto:security@contextgpt.co" className="underline font-semibold text-white hover:text-blue-200 transition-colors">
              security@contextgpt.co
            </a>
            . We respond within 24 hours, won't take legal action against good-faith researchers, and credit those who help us improve.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-300" />
              <span>24-hour initial response</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-300" />
              <span>No legal threats for good-faith disclosure</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-300" />
              <span>Public credit for valid reports</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Security;

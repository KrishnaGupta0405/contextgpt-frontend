import {
  ImportKnowledgeIcon,
  ConversationTrainingIcon,
  GptModelIcon,
  WebsiteEmbeddingIcon,
  BrandCustomizationIcon,
  CollectFeedbackIcon,
  CitedSourcesIcon,
  WhatsAppEscalationIcon,
  LanguageSupportIcon,
  LeadCollectionIcon,
  ApiIcon,
  AiConnectorIcon,
  AutomationIcon,
  IntegrationsIcon,
  RbacIcon,
  DataSubprocessorsIcon,
  DataEncryptionIcon,
  DataProcessingAgreementIcon,
} from "../../../../public/icons/IconSvg";

export const FEATURE_CATEGORIES = [
  {
    id: "training",
    label: "Training & Customization",
    description:
      "Train your AI chatbot on your specific content and fine-tune its behavior, tone, and response style to match your brand.",
    features: [
      {
        icon: <ImportKnowledgeIcon />,
        title: "Import Knowledge Sources",
        description:
          "Add website URLs, upload documents, or paste text directly to keep your chatbot informed with the information that matters most.",
      },
      {
        icon: <ConversationTrainingIcon />,
        title: "Conversation-Based Training",
        description:
          "Improve responses using real customer conversations and feedback, helping your chatbot become more accurate over time.",
      },
      {
        icon: <GptModelIcon />,
        title: "GPT-4.1-mini & GPT-4.1",
        description:
          "Select between fast, cost-efficient responses or deeper, more advanced reasoning depending on your chatbot's needs.",
      },
      {
        icon: <WebsiteEmbeddingIcon />,
        title: "Website Embedding",
        description:
          "Deploy your chatbot across landing pages, product sites, customer portals, and help centers with a simple embed.",
      },
      {
        icon: <BrandCustomizationIcon />,
        title: "Brand Customization",
        description:
          "Tailor your chatbot's appearance with your logo, colors, and branding for a consistent customer experience.",
      },
    ],
  },
  {
    id: "chat",
    label: "Chat Interactions",
    description:
      "Deliver seamless, intelligent conversations across every channel your customers already use.",
    features: [
      {
        icon: <CollectFeedbackIcon />,
        title: "Collect Feedback",
        description:
          "Let users rate and flag answers in real time so you can continuously improve accuracy.",
      },
      {
        icon: <CitedSourcesIcon />,
        title: "Cited Sources",
        description:
          "Every answer links back to the source document or URL, building trust and enabling quick verification.",
      },
      {
        icon: <WhatsAppEscalationIcon />,
        title: "Escalation to WhatsApp",
        description:
          "Seamlessly hand off complex queries to a live agent directly within WhatsApp without losing context.",
      },
      {
        icon: <LanguageSupportIcon />,
        title: "Language Support",
        description:
          "Automatically detect and respond in 100+ global languages so no customer is left behind.",
      },
      {
        icon: <LeadCollectionIcon />,
        title: "Lead Collection",
        description:
          "Capture names, emails, and custom fields mid-conversation and push them straight to your CRM.",
      },
    ],
  },
  {
    id: "extensions",
    label: "Extensions",
    description:
      "Extend ContextGPT's reach with powerful add-ons that go beyond basic Q&A.",
    features: [
      {
        icon: <ApiIcon />,
        title: "API",
        description:
          "Programmatically query your bot, manage training data, and retrieve analytics via our REST API.",
      },
      {
        icon: <AiConnectorIcon />,
        title: "The AI Connector",
        description:
          "Bridge ContextGPT with any third-party service — CRMs, ticketing systems, e-commerce platforms, and more.",
      },
      {
        icon: <AutomationIcon />,
        title: "Automation",
        description:
          "Trigger workflows, send notifications, or update records automatically based on conversation events.",
      },
      {
        icon: <IntegrationsIcon />,
        title: "Integrations",
        description:
          "Native plug-ins for Slack, Intercom, HubSpot, Zendesk, and dozens of other platforms — no code required.",
      },
    ],
  },
  {
    id: "security",
    label: "Security & Compliance",
    description:
      "Enterprise-grade security and compliance so your data stays protected and your team stays audit-ready.",
    features: [
      // {
      //   icon: (
      //     <svg></svg>
      //   ),
      //   title: "SOC 2 Report",
      //   description:
      //     "Independent SOC 2 Type II certification confirms our security controls meet the highest industry standards.",
      // },
      // {
      //   icon: (
      //     <svg></svg>
      //   ),
      //   title: "GDPR Compliance",
      //   description:
      //     "Full data residency controls, consent management, and DPA agreements to keep you compliant in Europe.",
      // },
      {
        icon: <RbacIcon />,
        title: "RBAC Applied",
        description:
          "Role-based permissions, SSO, and audit logs give you granular control over who sees what.",
      },
      {
        icon: <DataSubprocessorsIcon />,
        title: "Data Subprocessors",
        description:
          "Full transparency on every third-party vendor we use to process your data, updated in real time.",
      },
      {
        icon: <DataEncryptionIcon />,
        title: "Data Encryption",
        description:
          "All data encrypted in transit with TLS 1.2+ and at rest",
      },
      {
        icon: <DataProcessingAgreementIcon />,
        title: "Data Processing Agreement",
        description:
          "Sign a legally binding DPA directly within the platform in minutes, no legal back-and-forth required.",
      },
    ],
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    icon: <RbacIcon />,
    title: "Authenticate Drive",
    description:
      "Sign in with 1-click Google OAuth. Safe, read-only permissions keep your data protected.",
  },
  {
    step: "02",
    icon: <DataSubprocessorsIcon />,
    title: "Select Folders",
    description:
      "Choose specific folders or files in Google Drive for ContextGPT to parse into training data.",
  },
  {
    step: "03",
    icon: <ImportKnowledgeIcon />,
    title: "AI Auto-Chunking",
    description:
      "ContextGPT automatically extracts text, chunks paragraphs, and creates searchable vector embeddings.",
  },
  {
    step: "04",
    icon: <WebsiteEmbeddingIcon />,
    title: "Deploy Chatbot",
    description:
      "Embed your chatbot on your website, Slack workspace, WhatsApp, or customer support widget.",
  },
];



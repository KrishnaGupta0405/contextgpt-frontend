"use client";

import Link from "next/link";
// import Image from "next/image";
import {
  ArrowRight,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import {
  GoogleDriveIcon,
  DropboxIcon,
  OneDriveIcon,
  SharePointIcon,
  NotionIcon,
  ConfluenceIcon,
  GitBookIcon,
  BoxIcon,
  GithubIcon,
  ICloudIcon,
  HubspotIcon,
  IntercomIcon,
  YoutubeIcon,
  SlackIcon,
  GoogleChatIcon,
  MessengerIcon,
  CrispIcon,
  FreshdeskIcon,
  ZendeskIcon,
  ZohoIcon,
  WhatsAppIcon,
} from "../../../../public/icons/IconSvg";
import HowToInstall from "../landing/HowToInstall";
import FromTheAuthor from "../landing/FromTheAuthor";
import FAQSection from "../landing/FAQSection";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const DATA_SOURCES = [
  {
    name: "Google Drive",
    description:
      "Seamlessly access and sync chatbot training data stored in Google Drive, enabling easy management and updating of resources.",
    Icon: GoogleDriveIcon,
    bgClass: "bg-[#eef7f1]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Dropbox",
    description:
      "Integrate with Dropbox to utilize stored documents and files for chatbot training, ensuring data is readily available and up-to-date.",
    Icon: DropboxIcon,
    bgClass: "bg-[#f0f4ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "OneDrive",
    description:
      "Connect your Microsoft OneDrive files to quickly pull in documents, spreadsheets, and presentations as knowledge.",
    Icon: OneDriveIcon,
    bgClass: "bg-[#f0f7ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "SharePoint",
    description:
      "Pull content from SharePoint sites to securely train your chatbot on internal team wikis and organizational knowledge.",
    Icon: SharePointIcon,
    bgClass: "bg-[#eefcfd]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Notion",
    description:
      "Sync your Notion workspace pages and databases to keep your chatbot's knowledge perfectly aligned with your documentation.",
    Icon: NotionIcon,
    bgClass: "bg-slate-100",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Confluence",
    description:
      "Import from Atlassian Confluence to easily ingest your technical documentation and team playbooks.",
    Icon: ConfluenceIcon,
    bgClass: "bg-[#eff4ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Gitbook",
    description:
      "Connect your Gitbook documentation to automatically train your chatbot on your public or private technical guides.",
    Icon: GitBookIcon,
    bgClass: "bg-slate-100",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Box",
    description:
      "Import files from Box cloud storage to seamlessly use enterprise-grade document repositories as a training source.",
    Icon: BoxIcon,
    bgClass: "bg-[#f0f6ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "GitHub",
    description:
      "Sync repositories, issues, and wikis directly from GitHub to empower your bot with technical context.",
    Icon: GithubIcon,
    bgClass: "bg-slate-100",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "iCloud",
    description:
      "Pull content directly from iCloud Drive to train your chatbot using personal or business documents stored on Apple devices.",
    Icon: ICloudIcon,
    bgClass: "bg-blue-50",
    bgCircleClass: "bg-blue-100",
  },
  // {
  //   name: "HubSpot",
  //   description:
  //     "Sync your HubSpot knowledge base and marketing content to ensure your chatbot is always up-to-date with your latest material.",
  //   Icon: HubspotIcon,
  //   bgClass: "bg-[#fff1ee]",
  //   bgCircleClass: "bg-[#ffd9d0]",
  // },
  {
    name: "Intercom",
    description:
      "Import your Intercom help center articles to provide your chatbot with accurate and detailed support resolutions.",
    Icon: IntercomIcon,
    bgClass: "bg-[#f0f6ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "YouTube",
    description:
      "Train your chatbot on video transcripts from YouTube, allowing it to extract insights and answer questions based on your video content.",
    Icon: YoutubeIcon,
    bgClass: "bg-[#fff0f0]",
    bgCircleClass: "bg-[#ffd5d5]",
  },
];

const CHAT_PLATFORMS = [
  {
    name: "Slack",
    description: "Deploy your chatbot in Slack channels.",
    available: true,
    Icon: SlackIcon,
    bgClass: "bg-[#f4ede4]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Google Chat",
    description: "Add ContextGPT to Google Chat.",
    available: true,
    Icon: GoogleChatIcon,
    bgClass: "bg-[#e8f0fe]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Messenger",
    description: "Connect to Facebook Messenger.",
    available: true,
    Icon: MessengerIcon,
    bgClass: "bg-[#e6f2ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Crisp",
    description: "Integrate with Crisp live chat.",
    available: true,
    Icon: CrispIcon,
    bgClass: "bg-[#eef2fa]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Freshchat",
    description: "Deploy in Freshchat widget.",
    available: true,
    Icon: FreshdeskIcon,
    bgClass: "bg-[#f0f9f4]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Zendesk Chat",
    description: "Embed in Zendesk messaging.",
    available: true,
    Icon: ZendeskIcon,
    bgClass: "bg-[#f3f9f8]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Zoho SalesIQ",
    description: "Connect with Zoho SalesIQ.",
    available: true,
    Icon: ZohoIcon,
    bgClass: "bg-[#eff4ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "WhatsApp",
    description: "Deploy on WhatsApp Business.",
    available: false,
    Icon: WhatsAppIcon,
    bgClass: "bg-[#e8f5e9]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "Intercom Chat",
    description: "Integrate with Intercom Messenger.",
    available: false,
    Icon: IntercomIcon,
    bgClass: "bg-[#f0f6ff]",
    bgCircleClass: "bg-[#FFFFFF]",
  },
  {
    name: "HubSpot",
    description: "Connect to HubSpot live chat.",
    available: false,
    Icon: HubspotIcon,
    bgClass: "bg-[#fff1ee]",
    bgCircleClass: "bg-[#ffd9d0]",
  },
];

export const IntegrationHero=()=>{
  return(
    <div className="bg-linear-to-b from-white to-blue-100">
      
    <div className="mx-auto  max-w-6xl text-center p-20 -mb-40">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.2}
        duration={2}
        repeatDelay={1}
        height={60}
        width={60}
        className={cn(
          "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-80%] h-[200%] skew-y-12"
        )}
      />
      {/* <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
        Integrations
      </p> */}
      <h2 className="mt-6 text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem] lg:leading-tight">
        <span 
          onClick={() => window.$cgpt?.push(["do", "message:send", "What are the list of integration, ContextGPT offers ? "])}
          className="underline underline-offset-4 decoration-dotted decoration-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors" 
          style={{fontWeight:700}} 
        >
          Direct Integrations 
        </span>
          with your<br/> favorite tools
      </h2>
      <h3 className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
        Let ContextGPT answer support questions over your customer&apos;
        communication channels of choice.
      </h3>

      <div className="relative z-10 mt-12 flex flex-col items-center justify-center pb-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {[
            {
              text: "7-day risk-free trial",
              chatMessage: "How does the 7-day risk-free trial work?",
            },
            {
              text: "Cancel at any time",
              chatMessage: "How do I cancel my subscription?",
            },
            {
              text: "Tailored onboarding support",
              chatMessage: "How does personalized onboarding help work?",
            },
            {
              text: "Fair pricing that scales",
              chatMessage: "How does your pricing scale as I grow?",
            },
            {
              text: "100+ global languages",
              chatMessage: "Which languages do you support?",
            },
          ].map(({ text, chatMessage }) => (
            <span
              key={text}
              onClick={
                chatMessage
                  ? () => window.$cgpt?.push(["do", "message:send", chatMessage])
                  : undefined
              }
              className={cn(
                "flex items-center gap-2 text-base font-medium text-slate-800 hover:text-blue-600",
                chatMessage && "hover:cursor-pointer"
              )}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
              <span
                className={cn(
                  "underline decoration-slate-400 decoration-dotted underline-offset-4",
                  chatMessage && "hover:decoration-blue-500 hover:text-blue-600 hover:cursor-pointer"
                )}
              >
                {text}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            Start a free trial
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-lg font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
          >
            Book a demo
          </Link>
        </div>
      </div>

      <div className="relative -mt-60 -mb-60 flex items-center justify-center">
        <img
          src="/icons/Integrations_bg.svg"
          alt="Hero"
          width={100}
          height={100}
          className="w-[100%] h-[90%]"
        />
      </div>
    </div>
    </div>
  )
}
export default function Integrations() {
  return (
    <div className="bg-white text-slate-900 border ">
      <IntegrationHero/>
      {/* ─── Hero ─── */}

      <div className="max-w-7xl mx-auto">
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 to-white" />
        
      </section>

      {/* ─── Data Sources ─── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">
            Data Source Integrations
          </p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-tight">
            Power Up Your Chatbot with Multiple Data Sources
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            Connect multiple data sources to provide ContextGPT with rich, accurate, and continuously updated training content, helping deliver a smarter and more reliable chatbot experience.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:gap-6 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
            {DATA_SOURCES.map((source, i) => {
              const Icon = source.Icon;
              return (
                <div key={source.name} className="flex flex-col">
                  <div
                    className={`flex h-32 w-full items-center justify-center rounded-2xl sm:h-48 md:h-[280px] md:rounded-3xl ${source.bgClass}`}
                  >
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full ${source.bgCircleClass} shadow-lg shadow-slate-200/50 sm:h-24 sm:w-24 md:h-36 md:w-36 md:shadow-xl`}
                    >
                      <Icon className="h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16" />
                    </div>
                  </div>
                  <h3 className="mt-4 line-clamp-1 text-base font-bold text-slate-900 sm:mt-6 sm:text-xl md:mt-8 md:text-2xl">
                    {source.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-sm md:mt-4 md:line-clamp-none md:text-lg">
                    {source.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 border-t max-w-3xl mx-auto pb-20 border-slate-100 pt-12 text-center">
          <h3 className="text-xl font-medium text-slate-900 sm:text-2xl">
            Looking for another integration?
          </h3>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center text-base sm:text-lg font-medium text-blue-600 underline decoration-blue-600 underline-offset-4 hover:text-blue-700"
          >
            Submit a request &rarr;
          </Link>
        </div>
      </section>

      {/* ─── Chat Platforms ─── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 border-t">
        <div className="mx-auto  text-center">
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-tight">
            24/7 support across the platforms and channels you already use.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-600">
            Use ContextGPT as a standalone support chatbot or integrate it directly into your existing support channels as an AI support agent.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:gap-6 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
            {CHAT_PLATFORMS.map((platform, i) => {
              const Icon = platform.Icon;
              return (
                <div key={platform.name} className="relative flex flex-col">
                  
                  <div
                    className={`flex h-32 w-full items-center justify-center rounded-2xl sm:h-48 md:h-[280px] md:rounded-3xl ${platform.bgClass}`}
                  >
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full ${platform.bgCircleClass} shadow-lg shadow-slate-200/50 sm:h-24 sm:w-24 md:h-36 md:w-36 md:shadow-xl`}
                    >
                      {Icon && <Icon className="h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16" />}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 md:mt-8 flex items-center gap-2">
                    <h3 className="line-clamp-1 text-base font-bold text-slate-900 sm:text-xl md:text-2xl">
                      {platform.name}
                    </h3>
                    {!platform.available && (
                      <span className="rounded-full bg-green-600 px-2.5 py-1 text-sm font-extrabold text-white whitespace-nowrap">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-sm md:mt-4 md:line-clamp-none md:text-lg">
                    {platform.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {/* <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-16 text-center text-white shadow-2xl shadow-blue-600/20">
          <h2 className="text-3xl font-bold tracking-tight">
            Don&rsquo;t See Your Tool?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            We&rsquo;re constantly adding new integrations. Let us know what you
            need or use our API to build a custom connection.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
            >
              Request an Integration
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section> */}
      <HowToInstall/>
      {/* <FromTheAuthor/> */}
      <FAQSection/> 
    </div>
    </div>
  );
}

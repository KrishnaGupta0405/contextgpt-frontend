"use client";

import { useRouter } from "next/navigation";
import {
  DropboxIcon,
  OneDriveIcon,
  BoxIcon,
  SharePointIcon,
  NotionIcon,
  ConfluenceIcon,
  GoogleDriveIcon,
  GithubIcon,
  GitBookIcon,
  ICloudIcon,
  HubspotIcon,
  IntercomIcon,
  YoutubeIcon,
  SlackIcon,
  GoogleChatIcon,
  MessengerIcon,
  CrispIcon,
  ZendeskIcon,
  ZohoIcon,
  FreshdeskIcon,
  WhatsAppIcon,
} from "../../../../public/icons/IconSvg";

const INTEGRATIONS = [
  { href: "/integration/dropbox-chatgpt-integration", label: "Dropbox", Icon: DropboxIcon, bg: "bg-blue-50" },
  { href: "/integration/onedrive-chatgpt-integration", label: "OneDrive", Icon: OneDriveIcon, bg: "bg-sky-50" },
  { href: "/integration/box-chatgpt-integration", label: "Box", Icon: BoxIcon, bg: "bg-indigo-50" },
  { href: "/integration/sharepoint-chatgpt-integration", label: "SharePoint", Icon: SharePointIcon, bg: "bg-teal-50" },
  { simple: true, width: "140px", href: "/integration/messenger-chatgpt-integration", label: "Messenger", bg: "bg-gradient-to-tr from-blue-600 to-purple-500" },
  { href: "/integration/notion-chatgpt-integration", label: "Notion", Icon: NotionIcon, bg: "bg-slate-100" },
  { href: "/integration/confluence-chatgpt-integration", label: "Confluence", Icon: ConfluenceIcon, bg: "bg-blue-50" },
  { href: "/integration/google-drive-chatgpt-integration", label: "Google Drive", Icon: GoogleDriveIcon, bg: "bg-white" },
  { href: "/integration/github-chatgpt-integration", label: "GitHub", Icon: GithubIcon, bg: "bg-slate-900" },
  { href: "/integration/gitbook-chatgpt-integration", label: "GitBook", Icon: GitBookIcon, bg: "bg-blue-50" },
  { href: "/integration/icloud-chatgpt-integration", label: "iCloud", Icon: ICloudIcon, bg: "bg-sky-50" },
  { href: "/integration/hubspot-chatgpt-integration", label: "HubSpot", Icon: HubspotIcon, bg: "bg-orange-50" },
  { href: "/integration/intercom-chatgpt-integration", label: "Intercom Chat", Icon: IntercomIcon, bg: "bg-blue-50" },
  { href: "/integration/youtube-chatgpt-integration", label: "YouTube", Icon: YoutubeIcon, bg: "bg-white" },
  { simple: true, width: "130px", href: "/integration/sharepoint-chatgpt-integration", label: "SharePoint", bg: "bg-gradient-to-r from-yellow-400 to-orange-500" },
  { simple: true, width: "90px", href: "/integration/crisp-chatgpt-integration", label: "Crisp", bg: "bg-gradient-to-tl from-blue-600 to-cyan-400" },
  { href: "/integration/slack-chatgpt-integration", label: "Slack", Icon: SlackIcon, bg: "bg-white" },
  { href: "/integration/google-chat-chatgpt-integration", label: "Google Chat", Icon: GoogleChatIcon, bg: "bg-white" },
  { href: "/integration/messenger-chatgpt-integration", label: "Messenger", Icon: MessengerIcon, bg: "bg-blue-50" },
  { href: "/integration/crisp-chatgpt-integration", label: "Crisp", Icon: CrispIcon, bg: "bg-sky-50" },
  { href: "/integration/zendesk-chatgpt-integration", label: "Zendesk Chat", Icon: ZendeskIcon, bg: "bg-slate-100" },
  { href: "/integration/zoho-salesiq-chatgpt-integration", label: "Zoho SalesIQ", Icon: ZohoIcon, bg: "bg-red-50" },
  { href: "/integration/freshchat-chatgpt-integration", label: "Freshchat", Icon: FreshdeskIcon, bg: "bg-green-50" },
  // { href: "/integration/whatsapp-chatgpt-integration", label: "WhatsApp", Icon: WhatsAppIcon, bg: "bg-green-50" },
];

const ROW_CONFIG_Integration = [
  [50, 7],
  [100, 8],
  [10, 9],
  [100, 6],
];

function getRows() {
  const rows = [];
  let i = 0;
  for (const [, count] of ROW_CONFIG_Integration) {
    if (i < INTEGRATIONS.length) {
      rows.push(INTEGRATIONS.slice(i, i + count));
      i += count;
    }
  }
  return rows;
}

const integrationRows = getRows();

function IntegrationBadge({ item }) {
  const router = useRouter();
  const Icon = item.Icon;

  if (item.simple) {
    return (
      <button
        type="button"
        onClick={() => router.push(item.href)}
        className={`h-10 shrink-0 cursor-pointer rounded-full ${item.bg}`}
        style={{ width: item.width || "60px" }}
        title={item.label}
      >
        <span className="sr-only">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push(item.href)}
      className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 transition-colors hover:bg-gray-200"
    >
      <div
        className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ${item.bg}`}
      >
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <span className="text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-200">
        {item.label}
      </span>
    </button>
  );
}

function MarqueeRow({ items, offset = 0 }) {
  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-2" style={{ marginLeft: offset }}>
        {items.map((item, i) => (
          <IntegrationBadge key={`${item.label}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsMarquee() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      {integrationRows.map((row, index) => (
        <MarqueeRow key={index} items={row} offset={ROW_CONFIG_Integration[index][0]} />
      ))}
    </div>
  );
}

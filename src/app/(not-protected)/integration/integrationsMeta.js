// Central slug/title/nav registry for all integration detail pages.
// Used to build related-integration links without duplicating literals across 24 page.jsx files.
export const INTEGRATIONS = [
  { slug: "google-drive-chatgpt-integration", label: "Google Drive" },
  { slug: "dropbox-chatgpt-integration", label: "Dropbox" },
  { slug: "onedrive-chatgpt-integration", label: "OneDrive" },
  { slug: "sharepoint-chatgpt-integration", label: "SharePoint" },
  { slug: "notion-chatgpt-integration", label: "Notion" },
  { slug: "confluence-chatgpt-integration", label: "Confluence" },
  { slug: "gitbook-chatgpt-integration", label: "Gitbook" },
  { slug: "box-chatgpt-integration", label: "Box" },
  { slug: "github-chatgpt-integration", label: "GitHub" },
  { slug: "icloud-chatgpt-integration", label: "iCloud" },
  { slug: "intercom-chatgpt-integration", label: "Intercom" },
  { slug: "youtube-chatgpt-integration", label: "YouTube" },
  { slug: "slack-chatgpt-integration", label: "Slack" },
  { slug: "google-chat-chatgpt-integration", label: "Google Chat" },
  { slug: "messenger-chatgpt-integration", label: "Facebook Messenger" },
  { slug: "crisp-chatgpt-integration", label: "Crisp" },
  { slug: "freshchat-chatgpt-integration", label: "Freshchat" },
  { slug: "zendesk-chatgpt-integration", label: "Zendesk Chat" },
  { slug: "zoho-salesiq-chatgpt-integration", label: "Zoho SalesIQ" },
  { slug: "whatsapp-chatgpt-integration", label: "WhatsApp" },
  { slug: "hubspot-chatgpt-integration", label: "HubSpot" },
];

export function relatedTo(...slugs) {
  return slugs
    .map((slug) => INTEGRATIONS.find((i) => i.slug === slug))
    .filter(Boolean)
    .map((i) => ({ href: `/integration/${i.slug}`, label: i.label }));
}

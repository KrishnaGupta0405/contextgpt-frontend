"use client";

import * as React from "react";
import {
  DASHBOARD_SECTION,
  INSTALLATION_SECTION,
  SDK_ADVANCED_SECTION,
  CHAT_HISTORY_SECTION,
  LEAD_SECTION,
  WEBSITE_LINK_SECTION,
  WEBSITE_FILES_SECTION,
  CONVERSATION_STARTERS_SECTION,
  CONVERSATION_FOLLOWUPS_SECTION,
  CHATBOT_MEMBERS_SECTION,
  ACCOUNT_MEMBERS_SECTION,
  SETTINGS_SECTION,
  WEBHOOK_SECTION,
  API_SECTION,
  INTEGRATIONS_SECTION,
  AUTO_SYNC_SECTION,
} from "@/lib/tours";
import {
  LayoutDashboard,
  Briefcase,
  Code,
  MessageSquare,
  BookUser,
  MessageSquareText,
  Type,
  Link2,
  FileText,
  History,
  HelpCircle,
  Reply,
  Sparkles,
  UserCircle,
  Globe,
  Palette,
  Headset,
  Users,
  Plug,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  ChartLine,
  Key,
  UserStar,
  Zap,
  Search,
  FlaskConical,
} from "lucide-react";

// Dev-only. Every combination of tourContext {tourKey, tier} the backend can
// actually produce — see buildTourContext in tourState.util.js.
//
// tier is null ONLY for base (NO_SUBSCRIPTION): with no subscription row there
// is no planType to derive a tier from. Trial and subscribed always carry one
// of starter/growth/scale, since every plan in website_subscriptions_paddle.csv
// exists in both a trial (_t) and no-trial (_nt) variant. So base is a single
// entry while the other two are one per tier — 7 in total, not 3.
const DEV_TOUR_TIERS = ["starter", "growth", "scale"];

const DEV_TOUR_VARIANTS = [
  {
    label: "Base",
    tourKey: "base",
    tier: null,
    hint: "No subscription, no trial",
  },
  ...DEV_TOUR_TIERS.map((tier) => ({
    label: `Trial - ${tier}`,
    tourKey: "trial",
    tier,
    hint: `TRIAL_ACTIVE on ${tier}`,
  })),
  ...DEV_TOUR_TIERS.map((tier) => ({
    label: `Subscribed - ${tier}`,
    tourKey: "subscribed",
    tier,
    hint: `SUBSCRIBED on ${tier}`,
  })),
];

// Dev-only. Each individual section, runnable on its own so a single product
// area can be clicked through without walking the whole tour. Unlike the
// audience variants above (which build from tourKey/tier on the dashboard),
// every section lives on its own route — so each entry carries the page it
// belongs to; the runner navigates there first, then drives that section's
// steps directly via startTour({ steps }). See launchSection below.
const DEV_TOUR_SECTIONS = [
  {
    label: "Dashboard",
    route: "/dashboard",
    steps: DASHBOARD_SECTION,
    hint: "Chatbot switcher, stats, ID, embed",
  },
  {
    label: "Installation",
    route: "/installation/website-integration",
    steps: INSTALLATION_SECTION,
    hint: "Website integration page",
  },
  {
    label: "SDK / Advanced",
    route: "/installation/sdk-advanced",
    steps: SDK_ADVANCED_SECTION,
    hint: "Developer SDK page",
  },
  {
    label: "Chat History",
    route: "/chat-history",
    steps: CHAT_HISTORY_SECTION,
    hint: "Threads, handoff, detail, filters",
  },
  {
    label: "Leads",
    route: "/leads",
    steps: LEAD_SECTION,
    hint: "Current, settings, human support tabs",
  },
  {
    label: "Website Links",
    route: "/website-links",
    steps: WEBSITE_LINK_SECTION,
    hint: "Ingest sources, status cards, add modal",
  },
  {
    label: "Website Files",
    route: "/website-files",
    steps: WEBSITE_FILES_SECTION,
    hint: "File sources, status cards, add modal",
  },
  {
    label: "Conversation Starters",
    route: "/conversation-starters",
    steps: CONVERSATION_STARTERS_SECTION,
    hint: "Starters list, action type, save",
  },
  {
    label: "Conversation Followups",
    route: "/conversation-followups",
    steps: CONVERSATION_FOLLOWUPS_SECTION,
    hint: "Followups list, action type, escalate tab",
  },
  {
    label: "Chatbot Members",
    route: "/chatbot-members",
    steps: CHATBOT_MEMBERS_SECTION,
    hint: "This-chatbot members list, invite, role",
  },
  {
    label: "Account Members",
    route: "/account-members",
    steps: ACCOUNT_MEMBERS_SECTION,
    hint: "Account-wide members list, invite, role",
  },
  {
    label: "Settings",
    route: "/settings",
    steps: SETTINGS_SECTION,
    hint: "GPT model, chat modes, localization, personas, instructions tabs",
  },
  {
    label: "Webhooks",
    route: "/webhooks",
    steps: WEBHOOK_SECTION,
    hint: "Generate, events, delivery log, verify signature",
  },
  {
    label: "API Keys",
    route: "/usage/api-keys",
    steps: API_SECTION,
    hint: "Keys list, new key, live request logs",
  },
  {
    label: "Integrations",
    route: "/integrations",
    steps: INTEGRATIONS_SECTION,
    hint: "Platform grid, Zendesk get started, website domains",
  },
  {
    label: "Auto Sync",
    route: "/auto-sync",
    steps: AUTO_SYNC_SECTION,
    hint: "Refresh jobs, scan tab, add sitemap, scan jobs",
  },
];

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarFooter,
  SidebarRail,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
// import { NavUser } from "./nav-user";
import { useChatbot } from "@/context/ChatbotContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Megaphone,
  Compass,
  // Sparkles,
} from "lucide-react";
import { useProductTour } from "@/hooks/use-product-tour";
import { useSearchCommand } from "@/components/search/SearchCommand";
import { AGENT_ALLOWED_URLS } from "@/lib/routes";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { useAuth } from "@/context/AuthContext";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  return (
    <SidebarMenu>
      {/* data-tour anchor: Billing itself lives inside this dropdown, which is
          closed during the tour, so the trigger is the only visible target. */}
      <SidebarMenuItem data-tour="sidebar-user-menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/upgrade">
                  <Sparkles className="mr-2 size-4" />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <BadgeCheck className="mr-2 size-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/usage">
                  <ChartLine className="mr-2 size-4" />
                  Usage
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/usage/api-keys">
                  <Key className="mr-2 size-4" />
                  API Keys
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://contextgpt0405.featurebase.app" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 size-4" />
                  Feedback
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      // items: [
      //   { title: "Stats Overview", url: "/dashboard/stats" },
      //   { title: "Recent Activity", url: "/dashboard/activity" },
      // ],
    },
    {
      title: "Installation",
      url: "/installation",
      icon: Briefcase,
      dataTour: "sidebar-installation",
      items: [
        {
          title: "Website integration",
          url: "/installation/website-integration",
        },
        {
          title: "SDK Advanced",
          url: "/installation/sdk-advanced",
          dataTour: "sidebar-sdk-advanced",
        },
      ],
    },
    // { title: "SDK (Advanced)", url: "/sdk", icon: Code, badge: "New" },
    {
      title: "Chat History",
      url: "/chat-history",
      icon: MessageSquare,
      dataTour: "sidebar-chat-history",
    },
    { title: "Leads", url: "/leads", icon: BookUser, dataTour: "sidebar-leads" },
  ],
  knowledgeBase: [
    {
      title: "Custom Responses",
      url: "/custom-responses",
      icon: MessageSquareText,
    },
    { title: "Text Snippets", url: "/text-snippets", icon: Type },
    {
      title: "Website Links",
      url: "/website-links",
      icon: Link2,
      dataTour: "sidebar-website-links",
    },
    {
      title: "Files & Data Sources",
      url: "/website-files",
      icon: FileText,
      dataTour: "sidebar-website-files",
    },
    { title: "Auto Sync Jobs", url: "/auto-sync", icon: History, badge: "New", dataTour: "sidebar-auto-sync" },
  ],
  customizations: [
    {
      title: "Conversation Starters",
      url: "/conversation-starters",
      icon: HelpCircle,
      dataTour: "sidebar-conversation-starters",
    },
    {
      title: "Conversation Followups",
      url: "/conversation-followups",
      icon: Reply,
      dataTour: "sidebar-conversation-followups",
    },
    {
      title: "Chatbot Instructions",
      url: "/settings?tab=instructions",
      icon: Sparkles,
    },
    {
      title: "Chatbot Persona",
      url: "/settings?tab=personas",
      icon: UserCircle,
    },
    {
      title: "Language & Region",
      url: "/settings?tab=localization",
      icon: Globe,
    },
    { title: "Appearance", url: "/appearance", icon: Palette },
    { title: "Human Support", url: "/leads?tab=human-settings", icon: Headset },
  ],
  advanced: [
    { title: "Chatbot Members", url: "/chatbot-members", icon: Users, dataTour: "sidebar-chatbot-members" },
    { title: "Account Members", url: "/account-members", icon: Users, dataTour: "sidebar-account-members" },
    { title: "Referral", url: "/referral", icon: UserStar, disabled: true },
    { title: "Integrations", url: "/integrations", icon: Plug, dataTour: "sidebar-integrations" },
    { title: "Webhooks", url: "/webhooks", icon: Zap, dataTour: "sidebar-webhooks" },
    { title: "Settings", url: "/settings?tab=general", icon: Settings, dataTour: "sidebar-settings" },
  ],
};

function filterForAgent(items) {
  return items.filter((item) => AGENT_ALLOWED_URLS.includes(item.url));
}

export function AppSidebar() {
  const { user } = useAuth();
  const { selectedChatbot, selectChatbot } = useChatbot();
  const router = useRouter();
  const [chatbotList, setChatbotList] = React.useState([]);
  const [loadingChatbots, setLoadingChatbots] = React.useState(false);

  // Populate the switcher dropdown with every chatbot the user can access,
  // flattened across account groups (same shape as /select-chatbot).
  const loadChatbots = React.useCallback(async () => {
    setLoadingChatbots(true);
    try {
      const response = await api.get("/chatbots/my-chatbots");
      const groups = response.data.data?.accounts || [];
      setChatbotList(
        groups.flatMap((g) =>
          g.chatbots.map((cb) => ({
            ...cb,
            id: cb.chatbotId,
            userRole: cb.userChatbotRole || g.userRole,
            accountId: g.accountId,
            accountName: g.accountName,
          })),
        ),
      );
    } catch (error) {
      console.error("Failed to fetch chatbots", error);
    } finally {
      setLoadingChatbots(false);
    }
  }, []);

  React.useEffect(() => {
    loadChatbots();
  }, [loadChatbots]);

  const handleSelectChatbot = (chatbot) => {
    if (chatbot.chatbotId === selectedChatbot?.id) return;
    const ownAccount = JSON.parse(localStorage.getItem("account") || "{}");
    if (chatbot.accountId && chatbot.accountId !== ownAccount?.id) {
      localStorage.setItem(
        "account",
        JSON.stringify({ id: chatbot.accountId, name: chatbot.accountName }),
      );
    }
    selectChatbot(chatbot);
    toast.success(`Selected ${chatbot.name}`);
    router.push("/dashboard");
  };

  const { startTour } = useProductTour();
  const { setOpen: setSearchOpen } = useSearchCommand();
  const sidebarPathname = usePathname();

  // "Take a Tour" from another route used to call startTour() immediately after
  // router.push(), before the dashboard-only targets (chatbot ID, embed code)
  // had mounted — driver.js silently drops steps whose element is missing. So
  // arm a request here and let the pathname change fire it.
  //
  // A ref, not state: the flag is only ever read inside the effect, and using
  // state would mean clearing it with a setState that cascades a render.
  //
  // Holds a { tourKey, tier } request rather than a bare boolean, so the dev
  // picker below can ask for a specific audience AND tier across a navigation.
  // Both undefined means "whatever the backend says is pending" — the normal
  // Take a Tour path.
  const tourRequestedRef = React.useRef(null);

  React.useEffect(() => {
    if (!tourRequestedRef.current || sidebarPathname !== "/dashboard") return;
    const { tourKey, tier } = tourRequestedRef.current;
    tourRequestedRef.current = null;
    // record: false — a voluntary replay must not consume the pending-tour
    // slot, or reviewing this would suppress a tour they have yet to see.
    const timer = setTimeout(
      () => startTour(tourKey, { record: false, tier }),
      600,
    );
    return () => clearTimeout(timer);
  }, [sidebarPathname, startTour]);
  // Shared by Take a Tour and the dev picker: navigate first if the
  // dashboard-only targets are not mounted yet, otherwise start immediately.
  const launchTour = React.useCallback(
    (tourKey, tier) => {
      if (sidebarPathname === "/dashboard") {
        startTour(tourKey, { record: false, tier });
        return;
      }
      tourRequestedRef.current = { tourKey, tier };
      router.push("/dashboard");
    },
    [sidebarPathname, startTour, router],
  );

  // Dev section runner. Each section lives on its own route, so run it directly
  // by navigating there (if needed) and driving just that section's steps —
  // record: false so previewing never records completion or consumes a pending
  // slot. Holds a { route, steps } request across the navigation, fired once the
  // pathname matches, mirroring the Take-a-Tour arm/effect above but keyed to an
  // arbitrary route rather than always /dashboard.
  const sectionRequestedRef = React.useRef(null);
  React.useEffect(() => {
    const req = sectionRequestedRef.current;
    if (!req || sidebarPathname !== req.route) return;
    sectionRequestedRef.current = null;
    const timer = setTimeout(
      () => startTour("base", { steps: req.steps, record: false }),
      600,
    );
    return () => clearTimeout(timer);
  }, [sidebarPathname, startTour]);
  const launchSection = React.useCallback(
    (section) => {
      if (sidebarPathname === section.route) {
        startTour("base", { steps: section.steps, record: false });
        return;
      }
      sectionRequestedRef.current = { route: section.route, steps: section.steps };
      router.push(section.route);
    },
    [sidebarPathname, startTour, router],
  );

  const isAgent = selectedChatbot?.userRole === "AGENT";

  const navMain = isAgent ? filterForAgent(data.navMain) : data.navMain;
  const knowledgeBase = isAgent ? [] : data.knowledgeBase;
  const customizations = isAgent ? [] : data.customizations;
  const advanced = isAgent ? filterForAgent(data.advanced) : data.advanced;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Chatbot Switcher */}
        <SidebarGroup className="bg-sidebar border-sidebar-border pb-1 pt-3 ">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem data-tour="sidebar-chatbot-switcher">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-14 rounded-lg bg-gray-200 hover:bg-gray-200  border hover:shadow-md data-[state=open]:bg-gray-300">
                      <div className="flex flex-col items-start leading-tight ">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded text-[10px] font-bold text-white uppercase">
                            {selectedChatbot?.botIconSrc ? (
                              <img
                                src={selectedChatbot.botIconSrc}
                                alt={selectedChatbot?.name || "Chatbot"}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              selectedChatbot?.name?.substring(0, 2) || "CH"
                            )}
                          </div>
                          <span className="max-w-[120px] text-sm font-semibold">
                            {selectedChatbot?.name || "Select Chatbot"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="text-muted-foreground ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                  >
                    {/* <DropdownMenuLabel className="text-muted-foreground text-xs">
                      My Chatbots
                    </DropdownMenuLabel> */}
                    {loadingChatbots ? (
                      <div className="text-muted-foreground flex items-center gap-2 p-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    ) : chatbotList.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        No chatbots found.
                      </div>
                    ) : (
                      <DropdownMenuGroup className="max-h-64 overflow-y-auto">
                        {chatbotList.map((chatbot) => (
                          <DropdownMenuItem
                            key={chatbot.chatbotId}
                            className="gap-2 p-2"
                            onClick={() => handleSelectChatbot(chatbot)}
                          >
                            <div className="bg-background flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border text-[9px] font-bold uppercase">
                              {chatbot.botIconSrc ? (
                                <img
                                  src={chatbot.botIconSrc}
                                  alt={chatbot.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                chatbot.name?.substring(0, 2)
                              )}
                            </div>
                            <span className="truncate">{chatbot.name}</span>
                            {chatbot.chatbotId === selectedChatbot?.id && (
                              <Check className="ml-auto h-4 w-4 shrink-0" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    )}
                    {/* <DropdownMenuSeparator /> */}
                    {/* <DropdownMenuItem
                      className="gap-2 p-2"
                      onClick={() => router.push("/select-chatbot")}
                    >
                      <div className="bg-background flex h-6 w-6 items-center justify-center rounded border">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      Switch Chatbot
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Nav */}
        <SidebarGroup className="bg-sidebar border-sidebar-border border-b pb-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Knowledge Base */}
        {knowledgeBase.length > 0 && (
          <SidebarGroup
            data-tour="sidebar-knowledge-base"
          >
            <SidebarGroupLabel className="text-muted-foreground/70 text-[11px] font-bold tracking-wider uppercase">
              Knowledge Base
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {knowledgeBase.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Customizations */}
        {customizations.length > 0 && (
          <SidebarGroup
            data-tour="sidebar-customizations"
            className="bg-sidebar border-sidebar-border border-b pb-3"
          >
            <SidebarGroupLabel className="text-muted-foreground/70 text-[11px] font-bold tracking-wider uppercase">
              Customizations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customizations.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Advanced */}
        {advanced.length > 0 && (
          <SidebarGroup
            data-tour="sidebar-advanced"
          >
            <SidebarGroupLabel className="text-muted-foreground/70 text-[11px] font-bold tracking-wider uppercase">
              Advanced
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {advanced.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter
        className="bg-sidebar border-sidebar-border relative z-10 rounded-t-lg border-t shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.20)]"
      >
        <SidebarMenu> 
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="bg-sidebar-accent text-muted-foreground ml-auto hidden items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium group-data-[collapsible=icon]:hidden md:inline-flex">
                <span className="text-xs">⌘{" "}</span>K / CTRL{" "}+{" "}K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Take a Tour"
              onClick={() => launchTour(undefined, undefined)}
            >
              <Compass className="h-4 w-4" />
              <span>Take a Tour</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Dev-only tour picker: forces a specific audience's tour regardless
              of the real subscription, so every variant can be checked without
              seeding trial/subscription rows. Hidden outside development. */}
          {process.env.NODE_ENV === "development" && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="Preview a tour (dev)">
                    <FlaskConical className="h-4 w-4" />
                    <span>Preview Tour (dev)</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 opacity-60" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  align="start"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Force a tour variant
                  </DropdownMenuLabel>
                  {DEV_TOUR_VARIANTS.map((variant) => (
                    <DropdownMenuItem
                      key={variant.label}
                      onClick={() => launchTour(variant.tourKey, variant.tier)}
                      className="flex-col items-start gap-0.5"
                    >
                      <span className="text-sm font-medium">{variant.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {variant.hint}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
          {/* Dev-only section runner: run any single section on its own page,
              navigating there first if needed. Separate from the audience
              picker above because these are per-product-area, not per-plan. */}
          {process.env.NODE_ENV === "development" && (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="Run a section (dev)">
                    <FlaskConical className="h-4 w-4" />
                    <span>Run Section (dev)</span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 opacity-60" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-56 rounded-lg"
                  align="start"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Run one section
                  </DropdownMenuLabel>
                  {DEV_TOUR_SECTIONS.map((section) => (
                    <DropdownMenuItem
                      key={section.label}
                      onClick={() => launchSection(section)}
                      className="flex-col items-start gap-0.5"
                    >
                      <span className="text-sm font-medium">
                        {section.label}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {section.hint}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )}
          {/* <SidebarMenuItem>
            <SidebarMenuButton tooltip="What's New" data-featurebase-changelog>
              <Megaphone className="h-4 w-4" />
              <span>What's New</span>
              <span id="fb-update-badge" className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
        <NavUser
          user={{
            name: user?.name || "User Name",
            email: user?.email || "user@example.com",
            avatar: user?.avatar || "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavItem({ item }) {
  const pathname = usePathname();
  const router = useRouter();
  const { guardNavigation } = useUnsavedChanges();
  const hasItems = item.items && item.items.length > 0;
  const isDisabled = item.title === "Referral" || item.disabled;

  // Check if current page is this item or one of its sub-items
  const isActive =
    pathname === item.url || item.items?.some((sub) => sub.url === pathname);

  const handleClick = (e, href) => {
    e.preventDefault();
    if (isDisabled) return;
    guardNavigation(() => router.push(href));
  };

  if (!hasItems) {
    const buttonEl = (
      <SidebarMenuButton
        asChild
        tooltip={isDisabled ? undefined : item.title}
        isActive={pathname === item.url}
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <a
          href={item.url}
          onClick={(e) => handleClick(e, item.url)}
          className={`flex items-center gap-2 ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
          tabIndex={isDisabled ? -1 : undefined}
          data-tour={item.dataTour}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>
    );

    return (
      <SidebarMenuItem>
        {isDisabled ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full cursor-not-allowed">{buttonEl}</div>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              Under testing
            </TooltipContent>
          </Tooltip>
        ) : (
          buttonEl
        )}
        {item.badge && (
          <SidebarMenuBadge className="bg-emerald-100 text-[10px] font-bold text-emerald-700">
            {item.badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen={isActive}
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            data-tour={item.dataTour}
          >
            <ChevronRight className="transition-transform" />
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuItem key={subItem.title}>
                <SidebarMenuButton asChild isActive={pathname === subItem.url}>
                  <a
                    href={subItem.url}
                    onClick={(e) => handleClick(e, subItem.url)}
                    className="pl-4"
                    data-tour={subItem.dataTour}
                  >
                    <span>{subItem.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

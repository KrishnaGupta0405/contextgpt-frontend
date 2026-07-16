"use client";

import * as React from "react";
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
} from "lucide-react";

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
  SidebarHeader,
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
      <SidebarMenuItem>
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
      items: [
        {
          title: "Website integration",
          url: "/installation/website-integration",
        },
        { title: "SDK Advanced", url: "/installation/sdk-advanced" },
      ],
    },
    // { title: "SDK (Advanced)", url: "/sdk", icon: Code, badge: "New" },
    { title: "Chat History", url: "/chat-history", icon: MessageSquare },
    { title: "Leads", url: "/leads", icon: BookUser },
  ],
  knowledgeBase: [
    {
      title: "Custom Responses",
      url: "/custom-responses",
      icon: MessageSquareText,
    },
    { title: "Text Snippets", url: "/text-snippets", icon: Type },
    { title: "Website Links", url: "/website-links", icon: Link2 },
    { title: "Files & Data Sources", url: "/website-files", icon: FileText },
    { title: "Auto Sync Jobs", url: "/auto-sync", icon: History, badge: "New" },
  ],
  customizations: [
    {
      title: "Conversation Starters",
      url: "/conversation-starters",
      icon: HelpCircle,
    },
    {
      title: "Conversation Followups",
      url: "/conversation-followups",
      icon: Reply,
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
    { title: "Chatbot Members", url: "/chatbot-members", icon: Users },
    { title: "Account Members", url: "/account-members", icon: Users },
    { title: "Referral", url: "/referral", icon: UserStar, disabled: true },
    { title: "Integrations", url: "/integrations", icon: Plug },
    { title: "Webhooks", url: "/webhooks", icon: Zap },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

// Sidebar items visible to AGENT role only
const AGENT_ALLOWED_URLS = [
  "/dashboard",
  "/chat-history",
  "/members",
  "/settings",
];

function filterForAgent(items) {
  return items.filter((item) => AGENT_ALLOWED_URLS.includes(item.url));
}

export function AppSidebar() {
  const { user } = useAuth();
  const { selectedChatbot } = useChatbot();
  const router = useRouter();
  const { startTour } = useProductTour();
  const isAgent = selectedChatbot?.userRole === "AGENT";

  const navMain = isAgent ? filterForAgent(data.navMain) : data.navMain;
  const knowledgeBase = isAgent ? [] : data.knowledgeBase;
  const customizations = isAgent ? [] : data.customizations;
  const advanced = isAgent ? filterForAgent(data.advanced) : data.advanced;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem data-tour="sidebar-chatbot-switcher">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-14">
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-muted-foreground w-full max-w-[150px] truncate text-xs">
                      {user?.email || "user@example.com"}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white uppercase">
                        {selectedChatbot?.name?.substring(0, 2) || "CH"}
                      </div>
                      <span className="max-w-[120px] truncate text-sm font-semibold">
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
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  My Chatbots
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => router.push("/select-chatbot")}
                >
                  <div className="bg-background flex h-6 w-6 items-center justify-center rounded border">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  Switch Chatbot
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="bg-background flex h-6 w-6 items-center justify-center rounded border">
                    <Plus className="h-4 w-4" />
                  </div>
                  Create Chatbot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Nav */}
        <SidebarGroup data-tour="sidebar-dashboard">
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
          <SidebarGroup data-tour="sidebar-knowledge-base">
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
          <SidebarGroup data-tour="sidebar-customizations">
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
          <SidebarGroup data-tour="sidebar-advanced">
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Take a Tour"
              onClick={() => {
                router.push("/dashboard");
                startTour();
              }}
            >
              <Compass className="h-4 w-4" />
              <span>Take a Tour</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="What's New" data-featurebase-changelog>
              <Megaphone className="h-4 w-4" />
              <span>What's New</span>
              <span id="fb-update-badge" className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
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
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
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

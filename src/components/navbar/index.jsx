"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Rss,
  FileText,
  Clock,
  Zap,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// import {
//   TOOL_CATEGORIES,
//   getToolsByCategory,
// } from "@/app/(not-protected)/tools/_config/tools.config";

// Compact tool links shown in the navbar dropdown (first 4 per category)
// const NAV_TOOLS = TOOL_CATEGORIES.reduce((acc, cat) => {
//   acc[cat] = getToolsByCategory(cat).slice(0, 4);
//   return acc;
// }, {});

const NAV_LINKS = [
  { href: "/lead-generation", label: "Lead Generation" },
  { href: "/features", label: "Features" },
  { href: "/integration", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

const RESOURCE_LINKS = [
  { href: "/", title: "Blog", description: "Product updates, tips, and insights" },
  { href: "https://docs.contextgpt.in/", title: "Docs", description: "API documentation and developer guides" },
  { href: "/book-a-demo", title: "Book a Demo", description: "Schedule a demo with our team" },
  { href: "https://docs.contextgpt.in/docs/changelog/overview", title: "Changelog", description: "Stay up to date with the latest updates" },
];

export default function NavigationMenuDemo() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileExpanded, setMobileExpanded] = React.useState(null);

  const toggleMobileSection = (section) =>
    setMobileExpanded((prev) => (prev === section ? null : section));

  React.useEffect(() => { setMobileOpen(false); setMobileExpanded(null); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed bg-background/90 border-border top-0 right-0 left-0 z-50 border-b shadow-sm backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/icons/Contextgpt_icon.png"
              alt="ContextGPT"
              className="-mt-2 h-10 w-full"
            />
            <span
              className="text-2xl tracking-tight"
              style={{ fontWeight: 650 }}
            >
              Context
              <span className="text-blue-600" style={{ fontWeight: 650 }}>
                GPT
              </span>
            </span>
          </Link>
        </div>

        {/* Desktop nav — hidden on mobile */}
        <NavigationMenu aria-label="Main navigation" className="hidden md:flex">
          <NavigationMenuList>
            {NAV_LINKS.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <Link href={href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === href && "bg-gray-100 text-blue-500",
                      "text-sm leading-loose tracking-tight"
                    )}
                  >
                    {label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
            {/* Resources dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[300px] p-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-blue-600 uppercase">
                        Quick Links
                      </p>
                      <ul>
                        {[
                          { href: "/blog", icon: <Rss className="h-4 w-4" />, title: "Blog", description: "Product updates, tips, and insights" },
                          { href: "https://docs.contextgpt.in/", icon: <FileText className="h-4 w-4" />, title: "Docs", description: "API documentation and developer guides" },
                          { href: "/book-a-demo", icon: <BookOpen className="h-4 w-4" />, title: "Book a Demo", description: "Schedule a demo with our team" },
                          { href: "https://docs.contextgpt.in/docs/changelog/overview", icon: <Clock className="h-4 w-4" />, title: "Changelog", description: "Stay up to date with the latest updates" },
                        ].map((item) => (
                          <li key={item.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="hover:bg-accent hover:text-accent-foreground flex items-start gap-3 rounded-md px-3 py-2 no-underline transition-colors outline-none select-none"
                              >
                                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-white text-base shadow-sm">
                                  {item.icon}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm leading-none font-medium">{item.title}</span>
                                  <span className="text-muted-foreground line-clamp-1 text-xs leading-snug">{item.description}</span>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* <div className="flex flex-col gap-2">
                      <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-blue-600 uppercase">
                        What&apos;s New
                      </p>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/features"
                          className="group flex flex-col overflow-hidden rounded-xl border no-underline shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center justify-center gap-3 bg-linear-to-br from-blue-500 to-blue-700 px-4 py-6">
                            <Zap className="h-8 w-8 text-white opacity-90" />
                            <span className="text-lg font-bold text-white">ContextGPT</span>
                          </div>
                          <div className="bg-background px-4 py-3">
                            <p className="text-sm font-semibold">AI-Powered Context Engine</p>
                            <p className="text-muted-foreground mt-0.5 text-xs">Connect your data sources and chat instantly</p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div> */}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Tools mega-dropdown */}
            {/* <NavigationMenuItem>
              <NavigationMenuTrigger>Free Tools</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[700px] p-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {TOOL_CATEGORIES.map((cat) => (
                      <div key={cat}>
                        <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-blue-600 uppercase">
                          {cat}
                        </p>
                        <ul>
                          {NAV_TOOLS[cat].map((tool) => (
                            <li key={tool.slug}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/tools/${tool.slug}`}
                                  className="hover:bg-accent hover:text-accent-foreground flex items-start gap-3 rounded-md px-3 py-2 no-underline transition-colors outline-none select-none"
                                >
                                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-white text-base shadow-sm">
                                    {tool.icon}
                                  </span>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-sm leading-none font-medium">{tool.title}</span>
                                    <span className="text-muted-foreground line-clamp-1 text-xs leading-snug">{tool.description}</span>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/tools"
                        className="flex items-center gap-1.5 px-3 text-xs font-semibold text-blue-600 no-underline hover:underline"
                      >
                        View all free tools →
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop auth buttons — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="bg-[#155ded] text-white hover:bg-[#155ded]/80 flex items-center gap-2 rounded-lg border border-transparent px-4 py-1.5 text-sm font-medium transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="hover:bg-accent hover:text-accent-foreground text-muted-foreground flex items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-[#155ded] text-white hover:bg-[#155ded]/80 flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-all hover:opacity-90"
              >
                Sign In
              </Link>
              {pathname !== "/pricing" && (
                <Link
                  href="/pricing"
                  className="text-[#155ded] border border-[#155ded] flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-all hover:opacity-90"
                >
                  Start a free trial
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile: primary action button + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-[#155ded] text-white flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            pathname !== "/pricing" && (
              <Link
                href="/pricing"
                className="bg-[#155ded] text-white flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                Start a free trial
              </Link>
            )
          )}
          <button
            className="flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-background px-4 pb-6 pt-2 overflow-y-auto max-h-[80vh]">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100",
                  pathname === href && "bg-gray-100 text-blue-600"
                )}
              >
                {label}
              </Link>
            ))}

            {/* Resources section */}
            <button
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors text-left"
              onClick={() => toggleMobileSection("resources")}
            >
              Resources
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", mobileExpanded === "resources" && "rotate-180")}
              />
            </button>
            {mobileExpanded === "resources" && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
                {RESOURCE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {item.title}
                    <span className="block text-xs text-gray-400">{item.description}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Free Tools section */}
            {/* <button
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors text-left"
              onClick={() => toggleMobileSection("tools")}
            >
              Free Tools
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", mobileExpanded === "tools" && "rotate-180")}
              />
            </button>
            {mobileExpanded === "tools" && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-gray-100 pl-3">
                {TOOL_CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-blue-600 uppercase">
                      {cat}
                    </p>
                    {NAV_TOOLS[cat].map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        className="block rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {tool.title}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href="/tools"
                  className="mt-2 block px-3 py-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  View all free tools →
                </Link>
              </div>
            )} */}
          </nav>

          {/* Mobile auth buttons */}
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
            {user ? (
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-[#155ded] text-white text-center rounded-lg px-4 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

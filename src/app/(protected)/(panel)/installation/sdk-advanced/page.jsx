"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Link2 } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { ShikiCodeBlock } from "@/components/ui/ShikiCodeBlock";
import { cn } from "@/lib/utils";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import { useProductTour } from "@/hooks/use-product-tour";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SectionCard({ children, className = "", ...props }) {
  const handleCopyUrl = () => {
    if (props.id) {
      const url = `${window.location.origin}${window.location.pathname}#${props.id}`;
      navigator.clipboard.writeText(url);
      toast.info("URL copied to clipboard", { duration: 2000 });
    }
  };

  return (
    <div {...props} className={`rounded-[14px] border border-slate-200 bg-white p-6 shadow-sm group relative scroll-mt-20 ${className}`}>
      {props.id && (
        <button
          onClick={handleCopyUrl}
          className="absolute top-4 right-4 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
          title="Copy section URL"
        >
          <Link2 size={16} className="text-slate-500 hover:text-slate-700" />
        </button>
      )}
      {children}
    </div>
  );
}

function InlineCode({ children, className = "" }) {
  return (
    <code className={cn(`border rounded px-1.5 py-0.5 text-[12px] font-mono text-slate-700 bg-slate-100 ${className}`)}>
      {children}
    </code>
  );
}

function InfoBanner({ children, color = "blue" }) {
  const styles = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
    red: "bg-red-50 border-red-100 text-red-700",
    green: "bg-green-50 border-green-100 text-green-700",
  };
  return (
    <div className={`rounded-[8px] border px-4 py-3 text-[13.5px] leading-relaxed ${styles[color]}`}>
      {children}
    </div>
  );
}

const SECTIONS = [
  { id: "quick-nav", label: "Overview" },
  { id: "widget-visibility", label: "Widget Visibility" },
  { id: "send-messages", label: "Send Messages" },
  { id: "conversation-reset", label: "Reset Conversation" },
  { id: "widget-reload", label: "Reload Widget" },
  { id: "user-session", label: "User Sessions" },
  { id: "context", label: "Chatbot Context" },
  { id: "custom-css", label: "Custom CSS" },
  { id: "hidebtn", label: "hideButton Mode" },
  { id: "container-mode", label: "Container Mode" },
  { id: "multi-widget", label: "Multiple Widgets" },
];

export default function SdkAdvanced() {
  // Scroll restoration already runs once in StandaloneClientWrapper; calling it
  // again here created a second competing tween. Deep links use the hash hook.
  useHashScroll();
  const { selectedChatbot } = useChatbot();
  const chatbotId = selectedChatbot?.id ?? "YOUR_CHATBOT_ID";
  const [activeSection, setActiveSection] = useState("quick-nav");
  const [showActualId, setShowActualId] = useState(true);
  const { resumeTour } = useProductTour();

  // TOUR_LEGS[1], the final leg — resumeTour(1) runs it when the installation
  // leg handed off here, and no-ops otherwise. No chatbotId gate: unlike the
  // installation page, every anchor here renders regardless of selection
  // (chatbotId falls back to a placeholder above). useHashScroll may be
  // animating a deep link, so the delay also lets that settle first.
  useEffect(() => {
    const timer = setTimeout(() => resumeTour(1), 600);
    return () => clearTimeout(timer);
  }, [resumeTour]);

  const scriptTag = `<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}">
</script>`;

  const scriptTagHideButton = `<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js?hideButton=true"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}">
</script>`;

  return (
    <div className="flex h-full flex-col">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Installation" },
          { label: "SDK Advanced" },
        ]}
      />

      <div className="flex-1 overflow-y-auto p-4 pt-6 md:p-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] font-bold tracking-tight text-slate-900">
                SDK Methods ($cgpt)
              </h2>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-[12px] font-semibold text-yellow-700">
                Advanced
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-600">Show ID:</span>
              <button
                onClick={() => {
                  const newState = !showActualId;
                  setShowActualId(newState);
                  toast.info(
                    newState
                      ? "Now showing actual chatbot ID"
                      : "Now showing placeholder ID"
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showActualId ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    showActualId ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-[12px] text-slate-500 w-20">
                {showActualId ? "Actual" : "Placeholder"}
              </span>
            </div>
          </div>
          <p className="text-[14px] text-slate-500">
            Advanced programmatic control of the chatbot widget
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-[12px] border border-yellow-200 bg-yellow-50 p-4">
          <span className="mt-0.5 text-yellow-500 text-lg">⚠️</span>
          <div>
            <p className="text-[13.5px] font-bold text-yellow-800">For Advanced Users Only</p>
            <p className="mt-0.5 text-[13px] text-yellow-700">
              These methods require JavaScript knowledge and are intended for developers who need programmatic control over the chatbot. Most users should stick to the standard{" "}
              <a href="/installation/website-integration" className="underline font-semibold">
                Installation Guide
              </a>
              .
            </p>
          </div>
        </div>

          {/* Sticky sidebar nav */}
        <div className="flex gap-6 items-start">
          {/* <div className="hidden xl:block w-52 shrink-0">
            <div className="fixed top-[20rem] rounded-[12px] border border-slate-200 bg-white p-3">
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                On this page
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`block rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      activeSection === s.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </div> */}

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-5">

            {/* Overview */}
            <SectionCard id="quick-nav" data-tour="sdk-methods">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M71.68,97.22,34.74,128l36.94,30.78a12,12,0,1,1-15.36,18.44l-48-40a12,12,0,0,1,0-18.44l48-40A12,12,0,0,1,71.68,97.22Zm176,21.56-48-40a12,12,0,1,0-15.36,18.44L221.26,128l-36.94,30.78a12,12,0,1,0,15.36,18.44l48-40a12,12,0,0,0,0-18.44ZM164.1,28.72a12,12,0,0,0-15.38,7.18l-64,176a12,12,0,0,0,7.18,15.37A11.79,11.79,0,0,0,96,228a12,12,0,0,0,11.28-7.9l64-176A12,12,0,0,0,164.1,28.72Z"></path></svg>
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    What are $cgpt Methods?
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed">
                    The <InlineCode>$cgpt</InlineCode> object lets you interact with and control the ContextGPT chatbot widget from anywhere on your page. Use it to customize appearance, provide context, manage user sessions, and control widget visibility programmatically.
                  </p>
                  <p className="mb-3 text-[13.5px] text-slate-600">
                    Commands are sent using the <InlineCode>push</InlineCode> method:
                  </p>
                  <ShikiCodeBlock lang="js" code={`window.$cgpt.push([command, ...args]);`} />

                  <p className="mt-4 mb-3 text-[13.5px] font-semibold text-slate-700">
                    You can queue commands before the script loads — they'll replay automatically:
                  </p>
                  <ShikiCodeBlock
                    lang="js"
                    code={`// Queue commands BEFORE the script tag loads
window.$cgpt = window.$cgpt || [];
window.$cgpt.push([
  'set',
  'context',
  ['You are a sales bot.', 'Page: Pricing'],
]);
window.$cgpt.push(['open']);

// Then load the widget
// <script
//   type="module"
//   src="...loader.js"
//   data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
// ></script>`}
                  />


                  <div className="mt-5 overflow-hidden rounded-[10px] border border-slate-200">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Command</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Syntax</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-slate-700">What it does</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          ["open", "$cgpt.push(['open'])", "Opens the widget"],
                          ["open + reset", "$cgpt.push(['open', { reset: true }])", "Resets conversation then opens"],
                          ["close", "$cgpt.push(['close'])", "Closes the widget"],
                          ["toggle", "$cgpt.push(['toggle'])", "Toggles open/close"],
                          ["message:send", "$cgpt.push(['do', 'message:send', 'text'])", "Sends a message, opens widget"],
                          ["message:text", "$cgpt.push(['set', 'message:text', 'text'])", "Prefills input field"],
                          ["conversation:reset", "$cgpt.push(['do', 'conversation:reset'])", "Resets conversation"],
                          ["widget:reload", "$cgpt.push(['do', 'widget:reload'])", "Tears down and remounts widget"],
                          ["user:email", "$cgpt.push(['set', 'user:email', [email, sig]])", "Logs user in with HMAC signature"],
                          ["context", "$cgpt.push(['set', 'context', [prefix, suffix]])", "Injects extra context into chat"],
                          ["css", "$cgpt.push(['set', 'css', 'css_string'])", "Injects custom CSS into widget"],
                        ].map(([cmd, syntax, desc]) => (
                          <tr key={cmd} className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5">
                              <InlineCode>{cmd}</InlineCode>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[11.5px] text-slate-600">{syntax}</td>
                            <td className="px-4 py-2.5 text-slate-600">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SectionCard>

            
            {/* Container Mode (Embedded Widgets) */}
            <SectionCard id="container-mode">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M237.5,66.8,131.3,36.46a12.07,12.07,0,0,0-5-.34l-105.13,15A20.1,20.1,0,0,0,4,70.94V185.06a20.1,20.1,0,0,0,17.17,19.8l105.13,15a12.15,12.15,0,0,0,1.7.12,12,12,0,0,0,3.3-.46L237.5,189.2A20.09,20.09,0,0,0,252,170V86A20.08,20.08,0,0,0,237.5,66.8ZM92,116H84V66.41l32-4.57V194.16l-32-4.57V140h8a12,12,0,0,0,0-24ZM28,74.41l32-4.57V116H52a12,12,0,0,0,0,24h8v46.16l-32-4.57ZM228,167l-88,25.14V63.91l88,25.14Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Container Mode (Embedded Widgets)
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed">
                    By default, the widget appears as a floating chat bubble. You can embed the widget inside a specific container element on your page using <InlineCode>data-mode="embedded"</InlineCode> and <InlineCode>data-container</InlineCode> attributes on the script tag.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Single Embedded Widget <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 ml-1">Recommended</span></p>
                      <p className="mb-2.5 text-[13px] text-slate-500">Create a container element and point the script at it. The widget fills the container instead of floating over the page.</p>
                      <ShikiCodeBlock lang="html" code={`<!-- Create a container element -->
<div id="my-chat-container" style="width: 100%; height: 600px;"></div>

<!-- Load the widget script pointing to that container -->
<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
  data-mode="embedded"
  data-container="#my-chat-container">
</script>`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span data-tour="sdk-multiple-instances">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Multiple Instances of the Same Chatbot</p>
                      <p className="mb-2.5 text-[13px] text-slate-500">You can embed the same chatbot into multiple containers. Each gets its own isolated widget instance. Load the script once per container.</p>
                       </span>
                      <ShikiCodeBlock lang="html" code={`<!-- Container 1 -->
<div id="chat-sidebar" style="width: 100%; height: 400px;"></div>

<!-- Container 2 -->
<div id="chat-inline" style="width: 100%; height: 400px;"></div>

<!-- Load once per container, each pointing to its own container -->
<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js?instance=sidebar"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
  data-mode="embedded"
  data-container="#chat-sidebar"
  data-instance="sidebar">
</script>

<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js?instance=inline"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
  data-mode="embedded"
  data-container="#chat-inline"
  data-instance="inline">
</script>`} />
                    </div>

                    <InfoBanner color="blue">
                      <p className="font-semibold mb-1">How Container Mode Works</p>
                      <ul className="mt-1 list-disc pl-5 space-y-1 text-[13px]">
                        <li>Use <InlineCode>data-mode="embedded"</InlineCode> with <InlineCode>data-container="#selector"</InlineCode> to embed the widget inside a specific element.</li>
                        <li>The floating bubble is automatically suppressed — the widget opens immediately inside the container.</li>
                        <li>To suppress the floating bubble globally when using embedded containers only, add <InlineCode>?hideWidget=true</InlineCode> to the floating script URL.</li>
                        <li>Each container gets its own isolated widget instance with its own seperate state.</li>
                      </ul>
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Multiple Widgets & Widget-Specific Commands */}
            <SectionCard id="multi-widget">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM56,40H200V88H56ZM200,216H56V104H200Zm-88-72a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H120A8,8,0,0,1,112,144Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H120A8,8,0,0,1,112,176ZM80,144a12,12,0,1,1-12-12A12,12,0,0,1,80,144Zm0,32a12,12,0,1,1-12-12A12,12,0,0,1,80,176Z"></path></svg>
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Multiple Widgets &amp; Widget-Specific Commands
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed">
                    When you have multiple widget instances on the same page, you can target commands at a specific instance using the instance name or chatbot ID — instead of broadcasting to all widgets.
                  </p>

                  <div className="space-y-4">

                    <div  className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span data-tour="sdk-targeting-api">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Targeting API Overview</p>
                      </span>
                      <div className="overflow-hidden rounded-[8px] border border-slate-200 mt-2">
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Target</th>
                              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Syntax</th>
                              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Scope</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[
                              ["$cgpt.push", "window.$cgpt.push([...])", "Broadcasts to ALL widgets on the page"],
                              ["$cgpt['instanceName']", "window.$cgpt['floating'].push([...])", "One specific widget by its data-instance name (e.g., 'floating', 'embedded')"],
                              ["$cgpt_widget['chatbotId']", `window.$cgpt_widget['${showActualId ? chatbotId : "Chatbot-id"}'].push([...])`, "All instances sharing that chatbot ID"],
                              ["$cgpt_widget['chatbotId']['instanceName']", `window.$cgpt_widget['${showActualId ? chatbotId : "Chatbot-id"}']['floating'].push([...])`, "One specific instance within a chatbot ID group"],
                            ].map(([target, syntax, scope]) => (
                              <tr key={target} className="hover:bg-slate-50/60">
                                <td className="px-4 py-2.5 font-mono text-[11.5px] text-slate-700 whitespace-nowrap">{target}</td>
                                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{syntax}</td>
                                <td className="px-4 py-2.5 text-slate-600">{scope}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Target by Instance Name</p>
                      <p className="mb-2.5 text-[13px] text-slate-500">
                        Give each script tag a <InlineCode>data-instance</InlineCode> name, then use that name to send commands to just that widget.
                      </p>
                      <ShikiCodeBlock lang="html" code={`<!-- Two widgets on the same page with different instance names -->
<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js?instance=floating"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
  data-instance="floating">
</script>

<script
  type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js?instance=embedded"
  data-chatbot-id="${showActualId ? chatbotId : "Chatbot-id"}"
  data-mode="embedded"
  data-container="#chat-container"
  data-instance="embedded">
</script>

<!-- Target only the floating widget -->
<script>
  window.$cgpt['floating'].push(['open'])
</script>

<!-- Target only the embedded widget -->
<script>
  window.$cgpt['embedded'].push(['set', 'message:text', 'Hello!'])
</script>`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Target by Chatbot ID</p>
                      <p className="mb-2.5 text-[13px] text-slate-500">
                        Use <InlineCode>$cgpt_widget</InlineCode> to send commands to all instances of a specific chatbot, or to one specific instance within that chatbot.
                      </p>
                      <ShikiCodeBlock lang="js" code={`// Send a command to ALL instances of this chatbot
window.$cgpt_widget['${showActualId ? chatbotId : "Chatbot-id"}'].push(['set', 'css', ':host { --cgpt-primary: #10b981; }'])

// Send a command to the "floating" instance of this chatbot only
window.$cgpt_widget['${showActualId ? chatbotId : "Chatbot-id"}']['floating'].push(['open'])

// Send a command to the "embedded" instance only
window.$cgpt_widget['${showActualId ? chatbotId : "Chatbot-id"}']['embedded'].push(['set', 'message:text', 'Only embedded gets this!'])`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Global Broadcast — All Widgets</p>
                      <p className="mb-2.5 text-[13px] text-slate-500">
                        Calling <InlineCode>window.$cgpt.push([...])</InlineCode> without an instance name broadcasts the command to every widget on the page.
                      </p>
                      <ShikiCodeBlock
                        lang="js"
                        code={`// Open all widgets at once
window.$cgpt.push(['open']);

// Apply a CSS theme to every widget
window.$cgpt.push([
  'set',
  'css',
  ':host { --cgpt-primary: #6366f1; }',
]);

// Prefill input on all widgets
window.$cgpt.push(['set', 'message:text', 'Hello from broadcast!']);

// Set context on all widgets
window.$cgpt.push([
  'set',
  'context',
  [
    'You are a helpful support agent.',
    'User is on the pricing page',
  ],
]);`}
                      />
                    </div>

                    <InfoBanner color="blue">
                      💡 Commands pushed before any widget loads are buffered and replayed automatically once the widget is ready — all targeting modes work with pre-load queuing.
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Quick Navigation */}
            <SectionCard className="bg-black" id="quick-nav-panel" data-tour="sdk-quick-nav">
              <div className="flex items-start gap-2.5 ">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M187.75,90.75l-144-48A8,8,0,0,0,32,50V200a8,8,0,0,0,11.75,7.25l144-48a8,8,0,0,0,0-15l-133-44,133-44a8,8,0,0,0,0-15ZM48,186.36V69.64L157.09,128Z"></path></svg>
                </div>
                <div className="min-w-0 w-full ">
                  <h4 className="mb-4 text-[14.5px] font-bold text-slate-900">
                    Quick Navigation
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {[
                      { id: "send-messages", label: "Send Messages Programmatically" },
                      { id: "conversation-reset", label: "Reset Conversation" },
                      { id: "user-session", label: "Manage User Sessions" },
                      { id: "context", label: "Enhance Chatbot Context" },
                      { id: "widget-visibility", label: "Control Widget Visibility" },
                      { id: "custom-css", label: "Customize Widget Appearance" },
                      { id: "widget-reload", label: "Reload Widget" },
                      { id: "hidebtn", label: "Programmatic-Only Mode" },
                    ].map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSection(item.id);
                          window.location.hash = item.id;
                          const element = document.getElementById(item.id);
                          if (element) {
                            setTimeout(() => {
                              const elementRect = element.getBoundingClientRect();
                              const offset = elementRect.top + window.scrollY - 60;
                              window.scrollTo({ top: offset, behavior: "smooth" });
                            }, 0);
                          }
                        }}
                        className="group rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>


            {/* Send Messages */}
            <SectionCard id="send-messages">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M227.91,134.86,59.93,231a8,8,0,0,1-11.44-9.67L80,128,48.49,34.72a8,8,0,0,1,11.44-9.67l168,95.85A8,8,0,0,1,227.91,134.86Z" opacity="0.2"></path><path d="M231.87,114l-168-95.89A16,16,0,0,0,40.92,37.34L71.55,128,40.92,218.67A16,16,0,0,0,56,240a16.15,16.15,0,0,0,7.93-2.1l167.92-96.05a16,16,0,0,0,.05-27.89ZM56,224a.56.56,0,0,0,0-.12L85.74,136H144a8,8,0,0,0,0-16H85.74L56.06,32.16A.46.46,0,0,0,56,32l168,95.83Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Send Messages Programmatically
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Send a message to the chatbot immediately, or prefill the input field so the user can review before sending.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-slate-800">Send a message immediately</span>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">Auto-opens widget</span>
                      </div>
                      <p className="mb-2.5 text-[13px] text-slate-500">
                        Sends a message to the chatbot immediately. The widget opens automatically if it's closed.
                      </p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['do', 'message:send', 'message_text'])`} />
                      <p className="mt-3 mb-2 text-[13px] font-medium text-slate-600">Example — send a message when a button is clicked:</p>
                      <ShikiCodeBlock
                        lang="js"
                        code={`document
  .getElementById('pricing-btn')
  .addEventListener('click', function () {
    window.$cgpt.push([
      'do',
      'message:send',
      'What are your pricing plans?',
    ]);
});`}
                      />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Prefill the message input</span>
                      <p className="mt-1.5 mb-2.5 text-[13px] text-slate-500">
                        Prefills the input field with text. The user can edit the message before sending.
                      </p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['set', 'message:text', 'text_string'])`} />
                      <p className="mt-3 mb-2 text-[13px] font-medium text-slate-600">Example:</p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['set', 'message:text', "Hi! I'd like to get help with..."])`} />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
            
            {/* Reset Conversation */}
            <SectionCard id="conversation-reset">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M88,108H40A12,12,0,0,1,28,96V48a12,12,0,0,1,24,0V67l7.8-7.8A99.42,99.42,0,0,1,130,29.94h.56a99.38,99.38,0,0,1,69.87,28.47,12,12,0,0,1-16.78,17.16,76,76,0,0,0-106.84.63L69,84H88a12,12,0,0,1,0,24Zm128,40H168a12,12,0,0,0,0,24h19l-7.8,7.8a75.55,75.55,0,0,1-53.32,22.26h-.43a75.49,75.49,0,0,1-53.09-21.63,12,12,0,0,0-16.78,17.16,99.38,99.38,0,0,0,69.87,28.47H126a99.42,99.42,0,0,0,70.16-29.29L204,189v19a12,12,0,0,0,24,0V160A12,12,0,0,0,216,148Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Reset Conversation
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Start a fresh conversation by clearing the thread and returning to the home page. Useful for "Start New Conversation" or "Reset Chat" buttons.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Reset the conversation</span>
                      <p className="mt-1.5 mb-2.5 text-[13px] text-slate-500">
                        Clears the conversation history. The widget opens automatically if it's closed.
                      </p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['do', 'conversation:reset'])`} />
                      <p className="mt-3 mb-2 text-[13px] font-medium text-slate-600">Example:</p>
                      <ShikiCodeBlock
                        lang="js"
                        code={`document
  .getElementById('reset-btn')
  .addEventListener('click', function () {
  window.$cgpt.push(['do', 'conversation:reset']);
});`}
                      />
                    </div>

                    <InfoBanner color="blue">
                      💡 <strong>Tip:</strong> To reset and open in a single flicker-free step, use{" "}
                      <InlineCode>{`window.$cgpt.push(['open', { reset: true }])`}</InlineCode> instead.
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>


            {/* User Sessions */}
            <SectionCard id="user-session">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M148.5,156.53a72,72,0,1,0-89,0,124,124,0,0,0-48.69,35.75,12,12,0,0,0,18.38,15.44C48.54,184.69,75.11,172,104,172c37,0,61.12,19.42,74.81,35.72a12,12,0,1,0,18.38-15.44A124,124,0,0,0,148.5,156.53ZM56,100a48,48,0,1,1,48,48A48.05,48.05,0,0,1,56,100Zm190.53,40-7.11,2.31,4.39,6.05a12,12,0,1,1-19.41,14.11l-4.4-6.06-4.4,6.06a12,12,0,1,1-19.41-14.11l4.39-6.05L193.47,140a12,12,0,1,1,7.41-22.83l7.12,2.31V112a12,12,0,0,1,24,0v7.48l7.12-2.31A12,12,0,1,1,246.53,140Z"></path></svg>
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Manage User Sessions
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Automatically log the user into the chatbot widget using their verified email address. This requires generating a secure signature on your backend.
                  </p>

                  <InfoBanner color="red">
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ea580c" viewBox="0 0 256 256" className="shrink-0 mt-0.5"><path d="M215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22c6.3-11,22.52-11,28.82,0l87.46,151.87C236,202.79,228.08,216,215.46,216Z" opacity="0.2"></path><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path></svg>
                      <span><strong>Security Warning:</strong> Never generate signatures in front-end code. Doing so would expose your API key and allow anyone to impersonate users. Always generate signatures on your backend server.</span>
                    </div>
                  </InfoBanner>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Frontend — send signed email to widget</span>
                      <div className="mt-2.5">
                        <ShikiCodeBlock lang="js" code={`window.$cgpt.push([
  'set',
  'user:email',
  [
    'user@company.com',
    'cd7cc422ca57c82d...' // HMAC-SHA256 signature generated on your backend
  ]
])`} />
                      </div>
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Backend — generate the HMAC-SHA256 signature (Node.js)</span>
                      <div className="mt-2.5">
                        <ShikiCodeBlock
                          lang="js"
                          code={`const crypto = require('crypto');

// Your ContextGPT API key (keep it private — never expose in frontend)
const apiKey = 'your-api-key-here';

// Sign the user's email using HMAC-SHA256
function signEmail(email) {
  return crypto
    .createHmac('sha256', apiKey)
    .update(email)
    .digest('hex');
}

// Get the logged-in user's email from your session
const userEmail = getEmailFromSession();
const signature = signEmail(userEmail);

// Send signature to your frontend securely (e.g. via API response or SSR)`}
                        />

                      </div>
                    </div>

                    <InfoBanner color="blue">
                      💡 Once the signed email is pushed, the user is automatically logged in and their conversation history is restored.
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>
        
            {/* Context */}
            <SectionCard id="context">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M196,136a16,16,0,1,1-16-16A16,16,0,0,1,196,136Zm40-36v80a32,32,0,0,1-32,32H60a32,32,0,0,1-32-32V60.92A32,32,0,0,1,60,28H192a12,12,0,0,1,0,24H60a8,8,0,0,0-8,8.26v.08A8.32,8.32,0,0,0,60.48,68H204A32,32,0,0,1,236,100Zm-24,0a8,8,0,0,0-8-8H60.48A33.72,33.72,0,0,1,52,90.92V180a8,8,0,0,0,8,8H204a8,8,0,0,0,8-8Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Enhance Chatbot Context
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Provide additional context to the chatbot for more relevant and personalized conversations — such as the current page the user is on, or a custom persona.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Syntax</span>
                      <div className="mt-2">
                        <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['set', 'context', ['prefix', 'suffix']])`} />
                      </div>
                      <ul className="mt-3 space-y-1 text-[13px] text-slate-500">
                        <li><strong className="text-slate-700">prefix</strong> — injected before the user's message (custom persona, role)</li>
                        <li><strong className="text-slate-700">suffix</strong> — injected after the user's message (page context, URL)</li>
                      </ul>
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Example — page-aware context</span>
                      <div className="mt-2">
                        <ShikiCodeBlock
                          lang="js"
                          code={`window.$cgpt.push([
  'set',
  'context',
  [
    'You are a sales executive. Guide users to book a demo call.', // Prefix (persona)
    'Current Page: Pricing Page\\nURL: https://example.com/pricing', // Suffix (page info)
  ],
]);`}
                        />

                      </div>
                    </div>

                    <InfoBanner color="blue">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256" className="shrink-0 mt-0.5"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"></path></svg>
                        <span>Context is injected transparently — users only see their original message in the chat UI.</span>
                      </div>
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Widget Visibility */}
            <SectionCard id="widget-visibility">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,112a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"></path><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Control Widget Visibility
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Programmatically open, close, or toggle the chat widget. Especially useful when you've hidden the default bubble with <InlineCode>hideButton=true</InlineCode>.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Open the chat</p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['open'])`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Open with fresh conversation</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold cursor-help">
                                ?
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-yellow-50 border border-yellow-200 text-yellow-800 max-w-xs">
                              <div className="text-sm space-y-2">
                                <p>This might work or might not — still under development.</p>
                                <p className="font-semibold">Alternative: Queue both commands instead:</p>
                                <code className="block text-xs bg-yellow-100 px-2 py-1 rounded mt-1">$cgpt.push(['do', 'conversation:reset'])<br />$cgpt.push(['open'])</code>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="mb-2.5 text-[13px] text-slate-500">Opens the chat and resets the conversation in a single flicker-free step.</p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['open', { reset: true }])`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Close the chat</p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['close'])`} />
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[13.5px] font-semibold text-slate-800">Toggle the chat</p>
                      <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['toggle'])`} />
                    </div>

                    <InfoBanner color="blue">
                      💡 <strong>Example:</strong> Open the chat when a custom button is clicked:
                      <ShikiCodeBlock lang="html" code={`<button onclick="window.$cgpt.push(['open'])">
  Chat with us
</button>`} className="mt-2" />
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Custom CSS */}
            <SectionCard id="custom-css">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M208,24H48A16,16,0,0,0,32,40V216a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V40A16,16,0,0,0,208,24ZM84.69,164.69a8,8,0,0,1-11.38-11.38L100.59,128,73.31,102.69A8,8,0,0,1,84.69,91.31l32,30a8,8,0,0,1,0,11.38ZM176,168H128a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Z"></path></svg>
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Customize Widget Appearance
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Apply your own CSS to the chatbot widget to match your branding. Styles are injected into the widget's shadow DOM.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Syntax</span>
                      <div className="mt-2">
                        <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['set', 'css', 'css_string'])`} />
                      </div>
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Examples</span>
                      <div className="mt-2 space-y-3">
                        <ShikiCodeBlock
                          lang="js"
                          code={`// Change the primary brand color
window.$cgpt.push([
  'set',
  'css',
  ':root { --chat-color: #10b981; }',
]);`}
                        />
                        <ShikiCodeBlock
                          lang="js"
                          code={`// Change the font family
window.$cgpt.push([
  'set',
  'css',
  'body { font-family: "Lato", sans-serif; }',
]);`}
                        />
                      </div>
                    </div>

                    <InfoBanner color="blue">
                      💡 CSS is applied reactively — calling this command again with new CSS replaces the previous custom styles.
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Widget Reload */}
            <SectionCard id="widget-reload">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M244,56v48a12,12,0,0,1-12,12H184a12,12,0,1,1,0-24H201.1l-19-17.38c-.13-.12-.26-.24-.38-.37A76,76,0,1,0,127,204h1a75.53,75.53,0,0,0,52.15-20.72,12,12,0,0,1,16.49,17.45A99.45,99.45,0,0,1,128,228h-1.37A100,100,0,1,1,198.51,57.06L220,76.72V56a12,12,0,0,1,24,0Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Reload Widget
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    Completely reinitializes the widget by removing all existing elements and recreating them from scratch. Useful after page navigation or dynamic content changes.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Reinitialize the widget</span>
                      <div className="mt-2 mb-2.5">
                        <ShikiCodeBlock lang="js" code={`window.$cgpt.push(['do', 'widget:reload'])`} />
                      </div>
                      <p className="mt-3 mb-2 text-[13px] font-medium text-slate-600">Example — reload on SPA route change:</p>
                      <ShikiCodeBlock
                        lang="js"
                        code={`router.on('routeChange', function (newRoute) {
  setTimeout(function () {
    window.$cgpt.push(['do', 'widget:reload']);
  }, 100);
});`}
                      />
                    </div>

                    <InfoBanner color="blue">
                      💡 <strong>When to use widget:reload</strong>
                      <ul className="mt-1.5 list-disc pl-5 space-y-0.5 text-[13px]">
                        <li>After client-side navigation in SPAs (React, Vue, etc.)</li>
                        <li>When embed containers appear/disappear dynamically</li>
                        <li>To ensure widgets detect new containers after DOM changes</li>
                      </ul>
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* hideButton */}
            <SectionCard id="hidebtn">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M88,48v8A32,32,0,0,1,56,88H32V80A32,32,0,0,1,64,48Z" opacity="0.2"></path><path d="M216,79v1a40,40,0,0,1-40,40H136v80h8a16,16,0,0,0,10.67-27.93,8,8,0,0,1,10.66-11.92A32,32,0,0,1,144,216h-8v16a8,8,0,0,1-16,0V216H96a8,8,0,0,1,0-16h24V120H96a16,16,0,0,0,0,32,8,8,0,0,1,0,16,32,32,0,0,1,0-64h24V24a8,8,0,0,1,16,0v80h40a24,24,0,0,0,24-24V79a23,23,0,0,0-23-23H160a8,8,0,0,1,0-16h17a39,39,0,0,1,39,39ZM56,96H32a8,8,0,0,1-8-8V80A40,40,0,0,1,64,40H96a8,8,0,0,1,0,16A40,40,0,0,1,56,96ZM80,56H64A24,24,0,0,0,40,80H56A24,24,0,0,0,80,56Z"></path></svg>
                  </div>
                <div className="min-w-0 w-full">
                  <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                    Programmatic-Only Mode (hideButton)
                  </h4>
                  <p className="mb-4 text-[13.5px] leading-relaxed Chatbot-id">
                    If you want the widget to exist but only be openable via programmatic commands (no visible bubble), add <InlineCode>hideButton=true</InlineCode> to the script URL. Useful when you have a custom trigger element.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <span className="text-[13.5px] font-semibold text-slate-800">Example — custom trigger button</span>
                      <div className="mt-2.5 space-y-3">
                        <ShikiCodeBlock
                          lang="html"
                          code={`<!-- Your custom trigger button -->
<button
  id="my-chat-btn"
  onclick="window.$cgpt.push(['open'])"
>
  Chat with us
</button>

<!-- Load widget with hideButton — no bubble shown -->
${scriptTagHideButton}`}
                        />

                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[10px] border border-slate-200">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Parameter</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Floating Widget</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Bubble Button</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Use Case</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5"><InlineCode>(none)</InlineCode></td>
                            <td className="px-4 py-2.5 text-green-600 font-semibold">✅ Created</td>
                            <td className="px-4 py-2.5 text-green-600 font-semibold">✅ Visible</td>
                            <td className="px-4 py-2.5 text-slate-600">Default behavior</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5"><InlineCode>?hideButton=true</InlineCode></td>
                            <td className="px-4 py-2.5 text-green-600 font-semibold">✅ Created</td>
                            <td className="px-4 py-2.5 text-red-500 font-semibold">❌ Hidden</td>
                            <td className="px-4 py-2.5 text-slate-600">Programmatic control only</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5"><InlineCode>?hideWidget=true</InlineCode></td>
                            <td className="px-4 py-2.5 text-red-500 font-semibold">❌ Not created</td>
                            <td className="px-4 py-2.5 text-red-500 font-semibold">❌ Not created</td>
                            <td className="px-4 py-2.5 text-slate-600">Embedded containers only</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <InfoBanner color="blue">
                      💡 The widget is created and ready to receive commands, but the bubble and tooltip are hidden. Users can still close the widget using the close button inside it.
                    </InfoBanner>
                  </div>
                </div>
              </div>
            </SectionCard>


          </div>
        </div>
      </div>
    </div>
  );
}

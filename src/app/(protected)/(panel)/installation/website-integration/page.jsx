"use client";

import React, { useState, useEffect } from "react";
import { PanelNavbar } from "@/components/navbar/PanelNavbar";
import { Copy, Globe } from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";
import { toast } from "sonner";
import { ShikiCodeBlock } from "@/components/ui/ShikiCodeBlock";
import { useProductTour } from "@/hooks/use-product-tour";

const PLATFORMS = [
  { key: "general", label: "General", icon: "🌐" },
  { key: "wordpress", label: "WordPress", icon: "🎨" },
  { key: "shopify", label: "Shopify", icon: "🛒" },
  { key: "squarespace", label: "Squarespace", icon: "🌸" },
  { key: "wix", label: "Wix", icon: "✨" },
  { key: "webflow", label: "Webflow", icon: "🔷" },
  { key: "react", label: "React", icon: "⚛️" },
  { key: "custom", label: "Custom HTML", icon: "🖥️" },
];

const PLATFORM_INSTRUCTIONS = {
  general: {
    title: "General Installation Instructions",
    icon: "🌐",
    steps: [
      {
        bold: "Copy the embed code:",
        text: 'Click the "Copy" button next to the embed code above to copy it to your clipboard.',
      },
      {
        bold: "Access your website's HTML:",
        text: "Open your website's HTML file or access your content management system (WordPress, Shopify, Squarespace, etc.).",
      },
      {
        bold: "Paste the embed code:",
        text: "Add the embed code anywhere in your HTML - in the <head> section or before the closing </body> tag. Both work perfectly!",
        hasCode: true,
      },
      {
        bold: "Save and publish:",
        text: "Save your changes and publish/update your website. The chatbot will appear automatically on your site.",
      },
    ],
    tip: "For specific platform instructions, click on your platform tab above (WordPress, Shopify, etc.) for detailed step-by-step guidance.",
  },
  wordpress: {
    title: "WordPress Installation",
    icon: "🎨",
    steps: [],
  },
  shopify: {
    title: "Shopify Installation",
    icon: "🛒",
    steps: [
      {
        bold: "From your Shopify admin, go to",
        text: "Online Store > Themes",
      },
      {
        bold: "Find your current theme and click",
        text: "Actions > Edit code",
      },
      {
        bold: "In the Layout section, click on",
        text: "theme.liquid",
        hasCode: true,
      },
      {
        bold: "Scroll down and find the closing",
        text: "</body> tag",
        hasCode: true,
      },
      {
        bold: "Paste the embed code just before the",
        text: "</body> tag",
        hasCode: true,
      },
      {
        bold: "Click",
        text: "Save",
      },
    ],
    tip: "The chatbot will appear on all pages of your store. You can also add it to specific pages by editing individual templates instead of theme.liquid.",
  },
  squarespace: {
    title: "Squarespace Installation",
    icon: "🌸",
    steps: [
      {
        bold: "Log in to your Squarespace account and go to your website",
        text: "",
      },
      {
        bold: "Click",
        text: "Settings in the main menu",
      },
      {
        bold: "Click",
        text: "Advanced, then Code Injection",
      },
      {
        bold: "In the FOOTER section, paste the embed code",
        text: "",
      },
      {
        bold: "Click",
        text: "Save",
      },
    ],
    note: "Code Injection is available on Business plans and higher. For Personal plans, you'll need to upgrade or use a different method.",
  },
  wix: {
    title: "Wix Installation",
    icon: "✨",
    steps: [
      {
        bold: "Open your Wix Editor",
        text: "",
      },
      {
        bold: "Click",
        text: "Settings in the top menu",
      },
      {
        bold: "Go to",
        text: "Custom Code in the Advanced section",
      },
      {
        bold: "Click",
        text: "+ Add Custom Code",
      },
      {
        bold: "Paste the embed code in the code box",
        text: "",
      },
      {
        bold: "Set \"Add Code to Pages\" to",
        text: "All Pages",
      },
      {
        bold: "Set \"Place Code in\" to",
        text: "Body - end",
      },
      {
        bold: "Click",
        text: "Apply",
      },
    ],
  },
  webflow: {
    title: "Webflow Installation",
    icon: "🔷",
    steps: [
      {
        bold: "Open your Webflow project in the Designer",
        text: "",
      },
      {
        bold: "Go to",
        text: "Project Settings (gear icon)",
      },
      {
        bold: "Click on the",
        text: "Custom Code tab",
      },
      {
        bold: "In the Footer Code section, paste the embed code",
        text: "",
      },
      {
        bold: "Click",
        text: "Save Changes",
      },
      {
        bold: "Publish your site to see the chatbot",
        text: "",
      },
    ],
    alternative: "You can also add the code to specific pages by using an Embed element and pasting the code there.",
  },
  react: {
    title: "React Installation",
    icon: "⚛️",
    steps: [],
  },
  custom: {
    title: "Custom HTML Installation",
    icon: "🖥️",
    steps: [
      {
        bold: "Open your HTML file:",
        text: "Open the HTML file where you want the chatbot to appear.",
      },
      {
        bold: "Paste the embed code:",
        text: "Add the embed code anywhere inside <head> or before </body>.",
        hasCode: true,
      },
      {
        bold: "Save the file:",
        text: "Save and upload/deploy your updated HTML file.",
      },
      {
        bold: "Test:",
        text: "Open the page in a browser to confirm the chatbot loads correctly.",
      },
    ],
    tip: "The embed script is lightweight and won't slow down your page load.",
  },
};

function CopyButton({ text, className = "" }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-[13px] font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 ${className}`}
    >
      <Copy className="h-3.5 w-3.5 " strokeWidth={2.5} />
      Copy
    </button>
  );
}


export default function WebsiteIntegration() {
  const { selectedChatbot } = useChatbot();
  const chatbotId = selectedChatbot?.id ?? "";
  const [activePlatform, setActivePlatform] = useState("general");
  const { resumeTour } = useProductTour();

  // TOUR_LEGS[0] — the dashboard leg ends by writing a resume marker and
  // navigating here; resumeTour(0) picks it up, or no-ops when the user reached
  // this page on their own. Gated on chatbotId because the embed cards the
  // steps point at only render once a chatbot is selected — driver.js silently
  // drops steps whose element is missing. The delay matches the dashboard's,
  // giving the cards a frame to paint before the overlay lands.
  useEffect(() => {
    if (!chatbotId) return;
    const timer = setTimeout(() => resumeTour(0), 600);
    return () => clearTimeout(timer);
  }, [chatbotId, resumeTour]);

  const jsEmbed = `
<script type="module" 
src="https://contextgpt-widget-testing.vercel.app/loader.js" 
data-chatbot-id="${chatbotId}">
</script>`;

  const iframeEmbed = `<!-- Add a container where you want the chat to appear -->
<div id="my-chat-container"
  style="width: 400px; height: 600px;">
</div>

<!-- Load the widget in embedded mode pointing at your container -->
<script type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js"
  data-chatbot-id="${chatbotId}"
  data-mode="embedded"
  data-container="#my-chat-container">
</script>`;

  const inlineEmbed = `<!-- Add a container where you want the chat to appear -->
<div id="my-chat-container"
  style="width: 100%; height: 600px;">
</div>

<!-- Load the widget in embedded mode pointing at your container -->
<script type="module"
  src="https://contextgpt-widget-testing.vercel.app/loader.js"
  data-chatbot-id="${chatbotId}"
  data-mode="embedded"
  data-container="#my-chat-container">
</script>`;

  const platform = PLATFORM_INSTRUCTIONS[activePlatform];

  return (
    <div className="flex h-full flex-col">
      <PanelNavbar
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Installation" },
          { label: "Website Integration" },
        ]}
      />
      <div className="flex-1 overflow-y-auto p-4 pt-6 md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">
            Installation
          </h2>
          <button className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
              ▶
            </span>
            Watch Video Tutorial
          </button>
        </div>

        <div className="space-y-4">
          {/* Chatbot ID */}
          <div data-tour="installation-chatbot-id" className="rounded-[14px] border border-slate-200 bg-[#f4f7fc] p-6 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32Zm-8,128H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
              </div>
              <div>
                <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                  Chatbot ID
                </h4>
                <p className="mb-4 max-w-[800px] text-[13.5px] leading-relaxed text-blue-600/80">
                  This is your unique chatbot identifier. Use this ID when
                  integrating with third-party platforms like WordPress plugins.
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-[#dce6f6] px-3.5 py-1.5 font-mono text-[13.5px] text-blue-800">
                    {chatbotId}
                  </div>
                  <CopyButton text={chatbotId} />
                </div>
              </div>
            </div>
          </div>

          {/* Embed Options */}
          <div className="rounded-[14px] border border-slate-200 bg-[#f4f7fc] p-6 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#155ded" viewBox="0 0 256 256"><path d="M54.8,119.49A35.06,35.06,0,0,1,49.05,128a35.06,35.06,0,0,1,5.75,8.51C60,147.24,60,159.83,60,172c0,25.94,1.84,32,20,32a12,12,0,0,1,0,24c-19.14,0-32.2-6.9-38.8-20.51C36,196.76,36,184.17,36,172c0-25.94-1.84-32-20-32a12,12,0,0,1,0-24c18.16,0,20-6.06,20-32,0-12.17,0-24.76,5.2-35.49C47.8,34.9,60.86,28,80,28a12,12,0,0,1,0,24c-18.16,0-20,6.06-20,32C60,96.17,60,108.76,54.8,119.49ZM240,116c-18.16,0-20-6.06-20-32,0-12.17,0-24.76-5.2-35.49C208.2,34.9,195.14,28,176,28a12,12,0,0,0,0,24c18.16,0,20,6.06,20,32,0,12.17,0,24.76,5.2,35.49A35.06,35.06,0,0,0,207,128a35.06,35.06,0,0,0-5.75,8.51C196,147.24,196,159.83,196,172c0,25.94-1.84,32-20,32a12,12,0,0,0,0,24c19.14,0,32.2-6.9,38.8-20.51C220,196.76,220,184.17,220,172c0-25.94,1.84-32,20-32a12,12,0,0,0,0-24Z"></path></svg>
              </div>
              <div className="min-w-0 w-full">
                <h4 className="mb-1 text-[14.5px] font-bold text-slate-900">
                  Embed Options
                </h4>
                <p className="mb-5 text-[13.5px] leading-relaxed text-blue-600/80">
                  Choose between three embedding methods. Most users should use the
                  JavaScript embed (recommended).
                </p>

                <div className="space-y-4">
                  {/* JavaScript Embed */}
                  <div data-tour="installation-floating-embed" className="rounded-[10px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-[13.5px] font-semibold text-slate-800">
                        JavaScript Embed (Floating)
                      </span>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                        Recommended
                      </span>
                    </div>
                    <p className="mb-3 text-[13px] text-blue-600/80">
                      Best for most websites. Adds a floating chat bubble in the
                      bottom-right corner that opens the chat window on click —
                      positioned automatically and works on all pages.
                    </p>
                    <ShikiCodeBlock code={jsEmbed} lang="html" />
                  </div>

                  {/* Embedded (fixed size) */}
                  <div data-tour="installation-container-embed" className="rounded-[10px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-[13.5px] font-semibold text-slate-800">
                        Embedded (Fixed Size)
                      </span>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                        Advanced
                      </span>
                    </div>
                    <p className="mb-3 text-[13px] text-blue-600/80">
                      Render the chat inside a fixed-size container on your page — no floating bubble. Set{" "}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                        data-mode="embedded"
                      </code>{" "}
                      and point{" "}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                        data-container
                      </code>{" "}
                      at your container's CSS selector.
                    </p>
                    <ShikiCodeBlock code={iframeEmbed} lang="html" />
                    <p className="mt-2.5 text-[12.5px] text-yellow-600">
                      💡 You can adjust the container width and height to fit your design
                    </p>
                  </div>

                  {/* Inline Container (full width) */}
                  <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="text-[13.5px] font-semibold text-slate-800">
                        Inline Container (Full Width)
                      </span>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                        Advanced
                      </span>
                    </div>
                    <p className="mb-3 text-[13px] text-blue-600/80">
                      Same as above but the container stretches to full width — great for
                      embedding inside a page section or sidebar. Set{" "}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                        data-mode="embedded"
                      </code>{" "}
                      and{" "}
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                        data-container="#my-chat-container"
                      </code>{" "}
                      to point the loader at your div.
                    </p>
                    <ShikiCodeBlock code={inlineEmbed} lang="html" />
                    <p className="mt-2.5 text-[12.5px] text-yellow-600">
                      💡 Give your container a unique id and pass it as the data-container value
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform-Specific Instructions */}
          <div data-tour="installation-platforms" className="rounded-[14px] border border-green-200 bg-[#f0faf4] p-6 shadow-sm">
            <div className="mb-1.5 flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-green-600" />
              <h4 className="text-[14.5px] font-bold text-slate-900">
                Platform-Specific Instructions
              </h4>
            </div>
            <p className="mb-4 text-[13.5px] text-green-700">
              Choose your platform for detailed installation steps:
            </p>

            {/* Platform Tabs */}
            <div className="mb-5 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActivePlatform(p.key)}
                  className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-md tracking-tight font-semibold transition-colors ${
                    activePlatform === p.key
                      ? "bg-green-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Instructions Panel */}
            <div className="rounded-[10px] border border-green-100 bg-white p-6">
              {activePlatform === "wordpress" && (
                <div>
                  <h5 className="mb-4 text-[17px] font-bold text-slate-900 flex items-center gap-2">
                    🎨 WordPress Installation
                  </h5>
                  <div className="space-y-6">
                    {/* Method 1 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-blue-100 bg-blue-50/30 p-5">
                      <h6 className="mb-3 text-[15.5px] font-bold text-blue-900 flex items-center gap-2">
                        📄 Method 1: Official ContextGPT Plugin (Recommended)
                      </h6>
                      <ol className="space-y-2.5 text-[14.5px] text-slate-700 list-decimal pl-5">
                        <li>Log into your WordPress admin panel.</li>
                        <li>
                          Go to <strong className="text-slate-900">Plugins &gt; Add New Plugin</strong>.
                        </li>
                        <li>
                          Search for <strong className="text-slate-900">&ldquo;ContextGPT&rdquo;</strong>.
                        </li>
                        <li>
                          Click <strong className="text-slate-900">&ldquo;Install Now&rdquo;</strong> and then <strong className="text-slate-900">&ldquo;Activate&rdquo;</strong>.
                        </li>
                        <li>
                          In WordPress dashboard, go to <strong className="text-slate-900">Settings &gt; ContextGPT</strong>.
                        </li>
                        <li className="flex flex-wrap items-center gap-2 leading-relaxed">
                          <span>Paste your chatbot ID:</span>
                          <span className="bg-[#dce6f6] px-2 py-0.5 rounded font-mono text-[13.5px] text-blue-800 font-semibold select-all">
                            {chatbotId}
                          </span>
                          <CopyButton text={chatbotId} className="inline-flex" />
                        </li>
                        <li>
                          Click <strong className="text-slate-900">&ldquo;Save Changes&rdquo;</strong>.
                        </li>
                      </ol>
                    </div>

                    {/* Method 2 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-slate-200 bg-slate-50/30 p-5">
                      <h6 className="mb-3 text-[15.5px] font-bold text-slate-900 flex items-center gap-2">
                        🔧 Method 2: Manual Embed (For Advanced Users)
                      </h6>

                      <div className="space-y-4 pl-1">
                        {/* Option A */}
                        <div className="rounded-[8px] border border-blue-100 bg-blue-50/20 p-4">
                          <span className="block mb-2 font-bold text-[14.5px] text-blue-800">
                            Option A: Using WPCode Plugin (Safer)
                          </span>
                          <ol className="space-y-2 text-[14px] text-slate-700 list-decimal pl-5">
                            <li>
                              Install the <strong className="text-slate-900">&ldquo;WPCode - Insert Headers and Footers&rdquo;</strong> plugin.
                            </li>
                            <li>
                              Go to <strong className="text-slate-900">Code Snippets &gt; Header &amp; Footer</strong>.
                            </li>
                            <li>
                              Paste the embed code in the <strong className="text-slate-900">&ldquo;Footer&rdquo;</strong> section.
                            </li>
                            <li>
                              Click <strong className="text-slate-900">&ldquo;Save Changes&rdquo;</strong>.
                            </li>
                          </ol>
                        </div>

                        {/* Option B */}
                        <div className="rounded-[8px] border border-yellow-100 bg-yellow-50/20 p-4">
                          <span className="block mb-2 font-bold text-[14.5px] text-amber-800">
                            Option B: Theme Editor (Advanced)
                          </span>
                          <ol className="space-y-2 text-[14px] text-slate-700 list-decimal pl-5">
                            <li>
                              Go to <strong className="text-slate-900">Appearance &gt; Theme Editor</strong>.
                            </li>
                            <li>
                              Select your active theme and open <code className="bg-slate-100 px-1 py-0.5 rounded text-[13px] font-semibold text-slate-800">footer.php</code>.
                            </li>
                            <li>
                              Paste the embed code just before the closing <code className="bg-slate-100 px-1 py-0.5 rounded text-[13px] font-semibold text-slate-800">&lt;/body&gt;</code> tag.
                            </li>
                            <li>
                              Click <strong className="text-slate-900">&ldquo;Update File&rdquo;</strong>.
                            </li>
                          </ol>
                          <div className="mt-3 text-[13.5px] text-amber-700 bg-amber-50 border border-amber-100 rounded-[6px] px-3 py-2 flex items-center gap-1.5 font-medium">
                            ⚠️ Warning: This method may be lost during theme updates
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatform === "react" && (
                <div>
                  <h5 className="mb-4 text-[17px] font-bold text-slate-900 flex items-center gap-2">
                    ⚛️ React / Next.js Installation
                  </h5>
                  <div className="space-y-6">
                    {/* Method 1 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-blue-100 bg-blue-50/30 p-5">
                      <h6 className="mb-2.5 text-[15.5px] font-bold text-blue-900">
                        Method 1: Easiest Integration (public/index.html)
                      </h6>
                      <p className="mb-3 text-[14px] text-slate-600">
                        Add the JavaScript embed script tag directly to the <code className="bg-slate-100 px-1 py-0.5 rounded text-[13px]">&lt;head&gt;</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-[13px]">&lt;body&gt;</code> section of your <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-slate-800">public/index.html</code> file:
                      </p>
                      <ShikiCodeBlock code={jsEmbed} lang="html" />
                      <div className="mt-3 text-[13.5px] text-blue-700 bg-blue-50/60 p-3 rounded-[6px]">
                        {/* 💡 <strong>Tip:</strong> If you are testing locally with a local backend, you can specify the server URL by adding <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[13px]">data-server="http://localhost:9000"</code> to the script tag: */}
                        <div className="mt-2">
                          <code className="block bg-[#dce6f6] p-2.5 rounded font-mono text-[13px] text-blue-800 whitespace-pre-wrap break-all">
                            {`<script type="module" src="https://contextgpt-widget-testing.vercel.app/loader.js" data-chatbot-id="${chatbotId}"></script>`}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Method 2 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-slate-200 bg-slate-50/30 p-5">
                      <h6 className="mb-2.5 text-[15.5px] font-bold text-slate-900">
                        Method 2: Dynamic React Component (Recommended)
                      </h6>
                      <p className="mb-3 text-[14px] text-slate-600">
                        Create a custom React component (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13.5px] font-mono text-slate-800">ContextGPTChat.jsx</code>) to dynamically load the loader script when the application mounts:
                      </p>
                      <ShikiCodeBlock lang="jsx" code={`import { useEffect } from "react";

export default function ContextGPTChat() {
  useEffect(() => {
    // Check if script already exists to prevent duplicate loading
    const existingScript = document.querySelector('script[src*="loader.js"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://contextgpt-widget-testing.vercel.app/loader.js";
    script.setAttribute("data-chatbot-id", "${chatbotId}");
    if (process.env.NEXT_PUBLIC_ENV === "development") script.setAttribute("data-server", "http://localhost:9000");

    document.body.appendChild(script);

    return () => {
      // Clean up script and widget container on unmount
      const scriptEl = document.querySelector('script[src*="loader.js"]');
      if (scriptEl) scriptEl.remove();
      const widgetEl = document.getElementById("contextgpt-widget");
      if (widgetEl) widgetEl.remove();
    };
  }, []);

  return null;
}`} />
                      <p className="mt-3.5 text-[14px] text-slate-600">
                        Render this component at the root of your React or Next.js app (e.g. inside <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-slate-800">App.jsx</code> or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-slate-800">layout.jsx</code>) to display the chatbot site-wide.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePlatform === "custom" && (
                <div>
                  <h5 className="mb-4 text-[17px] font-bold text-slate-900 flex items-center gap-2">
                    🖥️ Custom HTML Installation
                  </h5>
                  <div className="space-y-5">
                    {/* Method 1 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-blue-100 bg-blue-50/30 p-5">
                      <h6 className="mb-2.5 text-[15.5px] font-bold text-blue-900">
                        Method 1: Script Tag (Recommended)
                      </h6>
                      <p className="mb-3 text-[14px] text-slate-600">
                        Paste this single script tag anywhere in your HTML — inside{" "}
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px] font-semibold text-slate-800">&lt;head&gt;</code>{" "}
                        or just before the closing{" "}
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px] font-semibold text-slate-800">&lt;/body&gt;</code>{" "}
                        tag:
                      </p>
                      <ShikiCodeBlock lang="html" code={`<script\n  type="module"\n  src="https://contextgpt-widget-testing.vercel.app/loader.js"\n  data-chatbot-id="${chatbotId}"\n></script>`} />
                      <p className="mt-3 text-[13.5px] text-blue-700">
                        💡 The widget loads asynchronously and won&apos;t block your page rendering.
                      </p>
                    </div>

                    {/* Method 2 */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-slate-200 bg-slate-50/30 p-5">
                      <h6 className="mb-2.5 text-[15.5px] font-bold text-slate-900">
                        Method 2: Legacy Inline Script
                      </h6>
                      <p className="mb-3 text-[14px] text-slate-600">
                        Alternatively, use this inline JavaScript approach — compatible with older HTML pages that don&apos;t support ES modules:
                      </p>
                      <ShikiCodeBlock lang="html" code={`
<script type="text/javascript">
  window.$contextGPT=[];
  (function(){d=document;s=d.createElement("script");
  s.src="https://contextgpt-widget-testing.vercel.app/loader.js";
  s.setAttribute("data-chatbot-id","${chatbotId}");
  s.async=1;
  d.getElementsByTagName("head")[0].appendChild(s);
  })();
</script>`} />
                      <p className="mt-3 text-[13.5px] text-slate-500">
                        ⚠️ Use Method 1 unless you specifically need to support browsers without ES module support.
                      </p>
                    </div>

                    {/* Full example */}
                    <div className="leading-tight tracking-tight rounded-[10px] border border-green-100 bg-green-50/30 p-5">
                      <h6 className="mb-2.5 text-[15.5px] font-bold text-green-900">
                        Full HTML Example
                      </h6>
                      <p className="mb-3 text-[14px] text-slate-600">
                        Here&apos;s a complete minimal HTML page with the embed code included:
                      </p>
                      <ShikiCodeBlock lang="html" code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>

  <!-- ContextGPT Chatbot -->
  <script
    type="module"
    src="https://contextgpt-widget-testing.vercel.app/loader.js"
    data-chatbot-id="${chatbotId}"
  ></script>
</body>
</html>`} />
                    </div>
                  </div>
                </div>
              )}

              {activePlatform !== "wordpress" && activePlatform !== "react" && activePlatform !== "custom" && (
                <div>
                  <h5 className="mb-4 text-[16px] font-bold text-slate-900 flex items-center gap-2">
                    {platform.icon} {platform.title}
                  </h5>
                  <ol className="space-y-3">
                    {platform.steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-[14.5px] text-slate-700 leading-relaxed">
                        <span className="shrink-0 font-semibold">{i + 1}.</span>
                        <span>
                          <strong>{step.bold}</strong>{" "}
                          {step.text ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: step.text
                                  .replace(/<head>/g, "<code class='rounded bg-slate-100 px-1 py-0.5 text-[13px] font-semibold text-slate-800'>&lt;head&gt;</code>")
                                  .replace(/<\/body>/g, "<code class='rounded bg-slate-100 px-1 py-0.5 text-[13px] font-semibold text-slate-800'>&lt;/body&gt;</code>")
                                  .replace(/theme\.liquid/g, "<code class='rounded bg-slate-100 px-1 py-0.5 text-[13px] font-semibold text-slate-800'>theme.liquid</code>"),
                              }}
                            />
                          ) : (
                            ""
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {/* Tip Banner */}
                  {platform.tip && (
                    <div className="mt-5 rounded-[8px] bg-blue-50 border border-blue-100 p-4 text-[14px] text-blue-700 leading-relaxed">
                      💡 <strong>Tip:</strong> {platform.tip}
                    </div>
                  )}

                  {/* Note Banner */}
                  {platform.note && (
                    <div className="mt-5 rounded-[8px] bg-green-50 border border-green-100 p-4 text-[14px] text-green-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-base leading-none">✅</span>
                      <div>
                        <strong>Note:</strong> {platform.note}
                      </div>
                    </div>
                  )}

                  {/* Alternative Banner */}
                  {platform.alternative && (
                    <div className="mt-5 rounded-[8px] bg-blue-50 border border-blue-100 p-4 text-[14px] text-blue-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-base leading-none">🎯</span>
                      <div>
                        <strong>Alternative:</strong> {platform.alternative}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

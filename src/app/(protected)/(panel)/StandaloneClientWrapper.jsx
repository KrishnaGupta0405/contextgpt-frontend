"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import { ChattingSocketProvider } from "@/context/ChattingSocketContext";
import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import Link from "next/link";
import { CreditCard, BarChart2, KeyRound, User } from "lucide-react";

const ALLOWED_ROUTES = ["/account", "/billing", "/usage", "/usage/api-keys"];

function isSubscriptionExpired(subscription) {
  console.log("Subscription ->", subscription)
  if (!subscription) return false;
  if (subscription.status && subscription.status !== "active") return true;
  if (subscription.currentPeriodEnd) {
    return new Date(subscription.currentPeriodEnd) < new Date();
  }
  return false;
}

export default function StandaloneClientWrapper({ children }) {
  useScrollRestoration();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedChatbot, updateChatbotRole, loading: chatbotLoading } = useChatbot();
  const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
  const accountId = selectedChatbot?.accountId;
  const { subscription } = useAuth();
  // console.log("subscription", subscription)
  const expired = isSubscriptionExpired(subscription);
  // console.log("Subscription is expired-> ", expired);
  const isAllowedRoute = ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Lock scroll and pointer events when subscription has expired on a restricted route
  useEffect(() => {
    if (expired && !isAllowedRoute) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [expired, isAllowedRoute]);

  // Redirect to select-chatbot if no chatbot is selected
  useEffect(() => {
    if (chatbotLoading) return;
    if (!chatbotId) {
      router.replace("/select-chatbot");
    }
  }, [chatbotId, chatbotLoading, router]);

  // Ensure socket is connected for global events (e.g. member removal)
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  // Listen for real-time member removal and redirect if kicked from current chatbot
  useEffect(() => {
    const socket = getSocket();

    const handleMemberRemoved = ({ chatbotId: removedId }) => {
      if (removedId === chatbotId) {
        toast.error("You have been removed from this chatbot.");
        router.push("/select-chatbot");
      }
    };

    socket.on("member:removed", handleMemberRemoved);
    return () => socket.off("member:removed", handleMemberRemoved);
  }, [chatbotId, router]);

  // Listen for real-time role updates and apply them to the selected chatbot
  useEffect(() => {
    const socket = getSocket();

    const handleRoleUpdated = (event) => {
      if (event.type === "chatbot" && event.chatbotId === chatbotId) {
        updateChatbotRole(event.newRole);
        const chatbotLabel = event.chatbotName || "a chatbot";
        const accountLabel = event.accountName ? ` (${event.accountName})` : "";
        toast.info(`Your role in ${chatbotLabel}${accountLabel} was updated to ${event.newRole}.`);
      } else if (event.type === "account") {
        if (accountId && event.accountId === accountId) {
          updateChatbotRole(event.newRole);
          const accountLabel = event.accountName || "your account";
          toast.info(`Your role in ${accountLabel} was updated to ${event.newRole}.`);
        }
      }
    };

    socket.on("role:updated", handleRoleUpdated);
    return () => socket.off("role:updated", handleRoleUpdated);
  }, [chatbotId, accountId, updateChatbotRole]);

  // Inject the chatbot widget script once the chatbotId is available.
  // Each time selectedChatbot changes we do a full teardown + reinject so the
  // loader re-runs with the correct chatbot-id (updating data-chatbot-id on an
  // already-executed <script> has no effect).
  useEffect(() => {
    if (!chatbotId) return;

    // Teardown any existing widget instance
    const existingScript = document.getElementById("contextgpt-widget-script");
    if (existingScript) existingScript.remove();
    const existingHost = document.getElementById("contextgpt-widget");
    if (existingHost) existingHost.remove();

    const script = document.createElement("script");
    script.id = "contextgpt-widget-script";
    script.type = "module";
    script.src =
      `https://contextgpt-widget-testing.vercel.app/loader.js?v=${Date.now()}`;
    script.setAttribute("data-chatbot-id", chatbotId);
    script.setAttribute("data-server", "http://localhost:9000");
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById("contextgpt-widget-script");
      if (s) s.remove();
      const h = document.getElementById("contextgpt-widget");
      if (h) h.remove();
    };
  }, [chatbotId]);

  const showOverlay = expired && !isAllowedRoute;

  return (
    <ChattingSocketProvider>
      <UnsavedChangesProvider>
        <div className="flex min-h-screen w-full">
          {/* <FeaturebaseWidget /> */}
          <Sidebar>{children}</Sidebar>
        </div>

        {showOverlay && (
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
            onClickCapture={(e) => e.stopPropagation()}
            onKeyDownCapture={(e) => e.stopPropagation()}
            onPointerDownCapture={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                <CreditCard className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 text-center">
                Subscription Ended
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
                Your subscription has expired. Please renew your plan to continue using ContextGPT.
              </p>
              <div className="w-full border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-col gap-2">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mb-1">You can still access:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: "/billing", label: "Billing", icon: CreditCard },
                    { href: "/usage", label: "Usage", icon: BarChart2 },
                    { href: "/usage/api-keys", label: "API Keys", icon: KeyRound },
                    { href: "/account", label: "Account", icon: User },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-neutral-400" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/billing"
                className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Renew Subscription
              </Link>
            </div>
          </div>
        )}
      </UnsavedChangesProvider>
    </ChattingSocketProvider>
  );
}

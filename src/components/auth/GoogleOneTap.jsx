"use client";

// Google One Tap (Google Identity Services) — the "Continue as <name>" prompt
// that appears without a redirect. Unlike the /auth/google redirect flow, GIS
// hands us a signed ID token in the browser which we POST to the backend for
// verification. Renders no UI of its own; Google injects its own iframe.

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const GIS_SRC = "https://accounts.google.com/gsi/client";

// Routes where the prompt would be redundant or actively annoying — the user is
// already mid-authentication on these.
const SUPPRESSED_PATHS = ["/google-callback", "/github-callback"];

let gisScriptPromise = null;

function loadGisScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisScriptPromise = null;
      reject(new Error("Failed to load Google Identity Services"));
    };
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

export default function GoogleOneTap() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, login } = useAuth();
  const initializedRef = React.useRef(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID;

  const handleCredential = React.useCallback(
    async (response) => {
      const toastId = toast.loading("Signing you in...");
      try {
        const res = await api.post("/auth/google/one-tap", {
          credential: response.credential,
        });

        const { user: userData, account, subscription } = res.data.data;
        login(userData, account, subscription);

        toast.success("Logged in successfully!", { id: toastId });

        const callbackUrl = searchParams.get("callbackUrl");
        const safePath =
          callbackUrl && callbackUrl.startsWith("/")
            ? callbackUrl
            : "/select-chatbot";
        router.push(safePath);
      } catch (error) {
        console.log("One Tap login error:", error);
        toast.error("Google sign-in failed", {
          id: toastId,
          description:
            error.response?.data?.message ||
            "Please try signing in with the button instead.",
        });
      }
    },
    [login, router, searchParams],
  );

  React.useEffect(() => {
    // Wait for AuthContext to settle before deciding — showing the prompt to an
    // already-logged-in user is the main thing to avoid.
    if (loading) {
      console.log("[GoogleOneTap] waiting for auth to settle…");
      return;
    }
    if (user) {
      console.log("[GoogleOneTap] user already logged in — skipping.");
      return;
    }
    if (!clientId) {
      console.warn(
        "[GoogleOneTap] NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID is not set — skipping One Tap. Restart the dev server after adding it to .env.",
      );
      return;
    }
    if (SUPPRESSED_PATHS.some((p) => pathname?.startsWith(p))) {
      console.log("[GoogleOneTap] suppressed on this route:", pathname);
      return;
    }
    if (initializedRef.current) return;

    let cancelled = false;

    console.log("[GoogleOneTap] loading GIS script…");

    loadGisScript()
      .then(() => {
        if (cancelled || initializedRef.current) return;
        initializedRef.current = true;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
          // FedCM is mandatory in Chrome — without this the prompt is silently
          // suppressed in current browser versions.
          use_fedcm_for_prompt: true,
          cancel_on_tap_outside: false,
          auto_select: false,
        });

        // FedCM hides most suppression reasons from the console, so surface the
        // notification explicitly — this is the only way to tell "no Google
        // session in this browser" apart from "config is wrong".
        window.google.accounts.id.prompt((notification) => {
          console.log("[GoogleOneTap] prompt notification:", {
            displayed: notification.isDisplayed?.(),
            notDisplayedReason: notification.getNotDisplayedReason?.(),
            skipped: notification.isSkippedMoment?.(),
            skippedReason: notification.getSkippedReason?.(),
            dismissed: notification.isDismissedMoment?.(),
            dismissedReason: notification.getDismissedReason?.(),
          });
        });
      })
      .catch((err) => {
        console.warn("[GoogleOneTap]", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, loading, user, pathname, handleCredential]);

  // Once a user logs in (via One Tap or any other path), make sure Google stops
  // offering the prompt for this session.
  React.useEffect(() => {
    if (user && typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }, [user]);

  return null;
}

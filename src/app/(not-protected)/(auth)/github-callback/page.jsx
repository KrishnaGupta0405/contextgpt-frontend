"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const error = searchParams.get("error");
  const ranRef = React.useRef(false);

  React.useEffect(() => {
    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const response = await api.get("/auth/github/session-bootstrap");
        const { user, account, subscription } = response.data.data;

        login(user, account, subscription);
        toast.success("Logged in successfully!");

        const callbackUrl = searchParams.get("callbackUrl");
        const safePath =
          callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/select-chatbot";
        router.replace(safePath);
      } catch (err) {
        console.log("GitHub session bootstrap error:", err);
        router.replace("/login?error=github_auth_failed");
      }
    })();
  }, [error, login, router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <React.Suspense>
      <GithubCallbackContent />
    </React.Suspense>
  );
}

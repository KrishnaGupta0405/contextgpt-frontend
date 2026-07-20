"use client";

// Redirects first-time users to the onboarding questionnaire. Renders inside
// AuthGuard, which guarantees `user` is non-null and already handled the
// loading state — so this guard only decides where an authenticated user goes.

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const ONBOARDING_PATH = "/onboarding";

export default function OnboardingGuard({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsOnboarding = !!user && !user.onboardingCompleted;
  const onOnboardingPage = pathname === ONBOARDING_PATH;

  useEffect(() => {
    if (needsOnboarding && !onOnboardingPage) {
      router.replace(ONBOARDING_PATH);
    }
  }, [needsOnboarding, onOnboardingPage, router]);

  // Hold the redirect rather than flashing the dashboard underneath it. The
  // onboarding page itself must still render, or the guard would blank the very
  // page it is redirecting to.
  if (needsOnboarding && !onOnboardingPage) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import OnboardingGuard from "@/components/auth/OnboardingGuard";
import { ChatbotProvider } from "@/context/ChatbotContext";

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <ChatbotProvider>{children}</ChatbotProvider>
      </OnboardingGuard>
    </AuthGuard>
  );
}

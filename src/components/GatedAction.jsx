"use client";

import { cloneElement } from "react";
import { useAuth } from "@/context/AuthContext";
import { hasSubscriptionAccess } from "@/lib/subscription";
import { usePlanUpgradeNotification } from "@/components/PlanUpgradeNotification";

export default function GatedAction({ children }) {
  const { subscription } = useAuth();
  const { showNoSubscriptionNotification } = usePlanUpgradeNotification();
  const hasAccess = hasSubscriptionAccess(subscription);

  if (hasAccess) {
    return children;
  }

  const originalOnClick = children.props.onClick;

  return cloneElement(children, {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      showNoSubscriptionNotification();
    },
  });
}

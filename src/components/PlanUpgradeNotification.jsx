"use client";

import { toast } from "sonner";

const PLAN_FEATURES = {
  webhooks: {
    title: "Webhooks",
    description: "Webhook support is not available on your plan",
  },
  apiAccess: {
    title: "API Access",
    description: "API access is not available on your plan",
  },
  autoScanData: {
    title: "Auto Scan Data",
    description: "Auto scan data feature is not available on your plan",
  },
  autoRefreshData: {
    title: "Auto Refresh Data",
    description: "Auto refresh data feature is not available on your plan",
  },
  teamMemberAccess: {
    title: "Team Member Access",
    description: "Team member access is not available on your plan",
  },
  platformIntegration: {
    title: "Platform Integration",
    description: "Platform integration is not available on your plan",
  },
};

const notify = (title, description) => {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const pricingUrl = `${frontendUrl}/pricing`;

  toast.info(
    <div className="space-y-2">
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
      <a
        href={pricingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
      >
        Upgrade your plan →
      </a>
    </div>,
    {
      position: "top-right",
      duration: 4000,
    }
  );
};

export const usePlanUpgradeNotification = () => {
  const showNotification = (featureKey) => {
    const feature = PLAN_FEATURES[featureKey];
    if (!feature) return;
    notify(`${feature.title} - Upgrade Required`, feature.description);
  };

  const showNoSubscriptionNotification = () => {
    notify(
      "Upgrade Required",
      "Start a free trial or choose a plan to unlock this feature"
    );
  };

  return { showNotification, showNoSubscriptionNotification };
};

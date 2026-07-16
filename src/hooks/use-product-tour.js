"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STORAGE_KEY = "contextgpt_product_tour_seen";

const DASHBOARD_TOUR_STEPS = [
  {
    element: '[data-tour="sidebar-chatbot-switcher"]',
    popover: {
      title: "Your Chatbot",
      description:
        "Switch between chatbots or create a new one from here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sidebar-dashboard"]',
    popover: {
      title: "Dashboard",
      description:
        "See your chatbot's status, embed code, and quick installation details at a glance.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sidebar-knowledge-base"]',
    popover: {
      title: "Knowledge Base",
      description:
        "Add website links, files, and text snippets to train your chatbot on your content.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sidebar-customizations"]',
    popover: {
      title: "Customizations",
      description:
        "Tune your chatbot's persona, instructions, appearance, and conversation flows.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sidebar-advanced"]',
    popover: {
      title: "Advanced Settings",
      description:
        "Manage members, integrations, webhooks, and account-level settings here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-chatbot-id"]',
    popover: {
      title: "Chatbot ID",
      description:
        "This unique ID identifies your chatbot when integrating with third-party platforms.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-embed-code"]',
    popover: {
      title: "Embed Code",
      description:
        "Copy this snippet into your website's HTML to bring your chatbot live.",
      side: "top",
      align: "start",
    },
  },
];

export function useProductTour() {
  const startTour = useCallback((steps = DASHBOARD_TOUR_STEPS) => {
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: "rgba(0,0,0,0.55)",
      popoverClass: "contextgpt-driver-popover",
      steps,
      onDestroyed: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      },
    });

    driverObj.drive();
    return driverObj;
  }, []);

  const hasSeenTour = useCallback(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  return { startTour, hasSeenTour, resetTour };
}

"use client";
import { useEffect } from "react";

export default function HeroChatWidget() {
  useEffect(() => {
    const embedded = document.createElement("script");
    embedded.type = "module";
    embedded.src = "https://contextgpt-widget-testing.vercel.app/loader.js?instance=embedded-hero&chatbotId=27df3d37-8395-4d1f-a084-5609237ae367&mode=embedded&container=%23contextgpt-hero-container";
    embedded.setAttribute("data-chatbot-id", "27df3d37-8395-4d1f-a084-5609237ae367");
    if (process.env.NEXT_PUBLIC_ENV === "development") embedded.setAttribute("data-server", "http://localhost:9000");
    embedded.setAttribute("data-mode", "embedded");
    embedded.setAttribute("data-container", "#contextgpt-hero-container");
    embedded.setAttribute("data-instance", "embedded-hero");
    document.body.appendChild(embedded);

    return () => {
      document.body.removeChild(embedded);
    };
  }, []);

  return null;
}

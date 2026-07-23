"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function RecaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // If no site key is configured, render children without the provider
  // so dev environments work without reCAPTCHA setup
  if (!siteKey || siteKey === "-") return <>{children}</>;

  return (
    // <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
    { children }
    // </GoogleReCaptchaProvider>
  );
}

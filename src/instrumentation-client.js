import posthog from "posthog-js";

if (process.env.NODE_ENV !== "development") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    loaded: (posthog) => {
      console.log("PostHog connected successfully", posthog.get_distinct_id());
    },
  });
}

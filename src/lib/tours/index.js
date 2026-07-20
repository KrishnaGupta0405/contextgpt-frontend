// Tours = ordered compositions of the sections defined in ./sections.
//
// Gotcha worth remembering when a step won't highlight: driver.js (1.7.0)
// resolves each step's `element` with a single querySelector at highlight time,
// and silently skips (or renders "elementless" — centered, no spotlight) any
// target that isn't in the DOM yet. Steps whose element only mounts after a
// click (e.g. the Chat History detail sheet / filter popover) therefore can't
// rely on a fixed setTimeout+refresh() — refresh() won't re-resolve an
// elementless step. sections.js handles this with waitForElementThenRehighlight:
// poll for the element, then driver.moveTo(getActiveIndex()) to re-resolve and
// rebuild the cutout. Reuse that helper for any future click-to-mount step.

import {
  WELCOME_SECTION,
  DASHBOARD_SECTION,
  INSTALLATION_SECTION,
  SDK_ADVANCED_SECTION,
  CHAT_HISTORY_SECTION,
  LEAD_SECTION,
  WEBSITE_LINK_SECTION,
  WEBSITE_FILES_SECTION,
  CONVERSATION_STARTERS_SECTION,
  CHATBOT_MEMBERS_SECTION,
  WEBHOOK_SECTION,
  API_SECTION,
  INTEGRATIONS_SECTION,
  AUTO_SYNC_SECTION,
  CONVERSATION_FOLLOWUPS_SECTION,
  ACCOUNT_MEMBERS_SECTION,
  SETTINGS_SECTION,
  CLOSING_SECTION,
} from "./sections";

// One array per audience. The audience is decided server-side and arrives as
// user.tourContext.pendingTourKey — see tourState.util.js on the backend; this
// file never re-derives subscription state, it only maps a key to steps.
//
// WELCOME_SECTION and DASHBOARD_SECTION are spread into all three: every user
// gets the same opening welcome card, whatever they have paid, and every user
// needs to know how to switch chatbots and how to install the widget.
// Sections that are *not* universal (a Growth-only integrations walk) get
// spread into only the arrays that earn them.
//
// The closing step differs per audience, so it is written inline at the end of
// each array rather than factored out — with sections doing the heavy lifting
// the duplication is small, and it keeps each tour readable top to bottom.

const BASE_TOUR = [
  ...WELCOME_SECTION,
  ...DASHBOARD_SECTION,
];

// Trial's closing step needs the days remaining, so this tour is a function of
// the subscription rather than a constant. buildTour() below hides that
// difference from callers.
const trialTour = (subscription, tier) => {
  const left = daysUntil(subscription?.trialEndsAt);
  const planName = tier ? tier[0].toUpperCase() + tier.slice(1) : null;
  return [
    ...WELCOME_SECTION,
    ...DASHBOARD_SECTION,
    {
      element: '[data-tour="sidebar-user-menu"]',
      popover: {
        title:
          left !== null
            ? `${left} days left on your trial`
            : planName
              ? `You're trialling ${planName}`
              : "You're on a trial",
        description: planName
          ? `Explore everything ${planName} offers while it lasts. Open this menu and head to Billing to keep it when you're ready.`
          : "Explore everything while it lasts. Open this menu and head to Billing to upgrade whenever you're ready.",
        side: "top",
        align: "start",
      },
    },
  ];
};

// The closing step names only what the tier actually unlocks — the entitlement
// columns come from website_subscriptions_paddle.csv. Starter has no API
// access, no webhooks and no platform integrations, so the generic "you have
// API keys and webhooks" copy was wrong for it; growth gains API access and
// integrations but still no webhooks; only scale has all three.
const SUBSCRIBED_CLOSING_BY_TIER = {
  starter: {
    title: "Your Starter plan is active",
    description:
      "One chatbot, up to 1,000 pages. Manage members and account settings under Advanced.",
  },
  growth: {
    title: "Your Growth plan is active",
    description:
      "You have API access and platform integrations under Advanced — handy for wiring ContextGPT into your own stack.",
  },
  scale: {
    title: "Your Scale plan is active",
    description:
      "API keys, webhooks, and platform integrations are all available under Advanced — everything you need to automate ContextGPT end to end.",
  },
};

const subscribedTour = (tier) => {
  const closing =
    SUBSCRIBED_CLOSING_BY_TIER[tier] ?? SUBSCRIBED_CLOSING_BY_TIER.starter;
  return [
    ...WELCOME_SECTION,
    ...DASHBOARD_SECTION,
    // custom_platform_integration is true for growth and scale, false for
    // starter, in website_subscriptions_paddle.csv — so only they get the
    // platform integrations walk. Webhooks and API Keys used to be gated the
    // same way, but now run as universal TOUR_LEGS entries below — see the
    // note on TOUR_LEGS for why and how to bring tiering back for them.
    ...(tier === "growth" || tier === "scale" ? INTEGRATIONS_SECTION : []),
    {
      element: '[data-tour="sidebar-advanced"]',
      popover: { ...closing, side: "right", align: "start" },
    },
  ];
};

function daysUntil(dateish) {
  if (!dateish) return null;
  const ms = new Date(dateish).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/**
 * buildTour(tourKey, { subscription, tier })
 *
 * Resolves an audience to its step list. `tier` is one of starter/growth/scale
 * for trial and subscribed users, and null only for "base" — with no
 * subscription row there is no planType to derive a tier from (see
 * buildTourContext in tourState.util.js). So BASE_TOUR ignores tier by design,
 * and the tier-aware branches tolerate a null by falling back to starter.
 */
export function buildTour(tourKey, { subscription, tier } = {}) {
  // switch (tourKey) {
  //   case "trial":
  //     return trialTour(subscription, tier);
  //   case "subscribed":
  //     return subscribedTour(tier);
  //   default:
  //     return BASE_TOUR;
  // }
  return BASE_TOUR;
}

/**
 * The legs after the dashboard, in the order they run.
 *
 * Each leg is a page's worth of steps plus the route that hosts them. They are
 * kept out of buildTour() on purpose: driver.js resolves every step's element
 * with a single querySelector at drive() time and silently drops the misses, so
 * one combined array would lose every leg the user is not currently viewing.
 * Each leg is therefore its own driver instance, bridged by the resume marker
 * in use-product-tour.js.
 *
 * `handoff` is the step appended to the *previous* leg to bridge into this one
 * — it lives here so a leg owns both its steps and its own entry point. Adding
 * a fourth page means appending one entry to this array and mounting the resume
 * effect on that page; nothing else changes.
 *
 * Ordering note: installation -> sdk-advanced -> website-links -> website-files
 * -> chat-history -> leads -> conversation-starters -> conversation-followups
 * -> account-members -> chatbot-members -> settings -> webhooks -> api-keys ->
 * auto-sync -> closing.
 *
 * Webhooks and API Keys were previously entitlement-gated (API_SECTION only
 * for growth/scale, WEBHOOK_SECTION only for scale — see
 * website_subscriptions_paddle.csv) and were appended inline to the dashboard
 * leg's closing step rather than run as their own pages. They are now
 * universal TOUR_LEGS entries like everything else here, shown to every
 * audience regardless of tier. This is temporary: tier-gating for these two
 * legs is expected to come back later. Since TOUR_LEGS is a flat,
 * audience-independent chain (each leg's handoff points at a fixed next
 * route), reintroducing gating will require either conditionally choosing the
 * next handoff route based on tier, or filtering TOUR_LEGS per audience before
 * building the handoff chain — not just re-adding an `if` around the section.
 */
export const TOUR_LEGS = [
  {
    route: "/installation/website-integration",
    steps: INSTALLATION_SECTION,
    handoff: {
      element: '[data-tour="sidebar-installation"]',
      popover: {
        title: "Now let's get it on your site",
        description:
          "Installation, under this menu, is where you copy the snippet that puts your chatbot on your website. Continue and we'll walk through it together.",
        side: "right",
        align: "start",
      },
    },
  },
  {
    route: "/installation/sdk-advanced",
    steps: SDK_ADVANCED_SECTION,
    handoff: {
      element: '[data-tour="sidebar-sdk-advanced"]',
      popover: {
        title: "One more thing, for developers",
        description:
          "If you want to drive the widget from your own code — open it on a click, send messages, run several instances — there is an SDK for that. Continue for a quick look.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/website-links",
    steps: WEBSITE_LINK_SECTION,
    handoff: {
      element: '[data-tour="sdk-quick-nav"]',
      popover: {
        title: "It all starts with your content",
        description:
          "Great replies only happen when your chatbot knows your material. Continue and we'll show you where to feed it — every link, sitemap and site you want it to learn from.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/website-files",
    steps: WEBSITE_FILES_SECTION,
    handoff: {
      element: '[data-tour="website-links-add"]',
      popover: {
        title: "Links aren't the only source",
        description:
          "Your chatbot can learn from your documents too — local uploads, Notion, Google Drive, GitHub and more. Continue and we'll show you where to bring your files in.",
        side: "left",
        align: "start",
      },
    },
  },
  {
    route: "/chat-history",
    steps: CHAT_HISTORY_SECTION,
    handoff: {
      element: '[data-tour="website-files-source-options"]',
      popover: {
        title: "See it all come together",
        description:
          "Once your chatbot is live, every conversation lands in Chat History. Continue and we'll show you where to read, filter and take over your chats.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/leads",
    steps: LEAD_SECTION,
    handoff: {
      element: '[data-tour="chat-history-thread-list"]',
      popover: {
        title: "Turn those chats into leads",
        description:
          "Some of those conversations are potential customers. Continue and we'll show you where your captured leads live and how to tune what the chatbot collects.",
        side: "right",
        align: "start",
      },
    },
  },
  {
    route: "/conversation-starters",
    steps: CONVERSATION_STARTERS_SECTION,
    handoff: {
      element: '[data-tour="leads-table"]',
      popover: {
        title: "Give visitors somewhere to start",
        description:
          "Once your chatbot knows your content, help visitors get going. Continue and we'll show you Conversation Starters — the buttons that greet everyone who lands on your site.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/conversation-followups",
    steps: CONVERSATION_FOLLOWUPS_SECTION,
    handoff: {
      element: '[data-tour="starters-action-type"]',
      popover: {
        title: "And keep it going after that",
        description:
          "Starters open the conversation — Followups keep it moving. Continue and we'll show you the buttons that appear after every answer, including the one-tap handoff to a human.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/account-members",
    steps: ACCOUNT_MEMBERS_SECTION,
    handoff: {
      element: '[data-tour="followups-tab-escalate"]',
      popover: {
        title: "Bring your team in",
        description:
          "You don't have to run this alone. Continue and we'll show you how to give a teammate access across your whole account in one invite.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/chatbot-members",
    steps: CHATBOT_MEMBERS_SECTION,
    handoff: {
      element: '[data-tour="account-invite-role"]',
      popover: {
        title: "Or invite them to just one chatbot",
        description:
          "Adding someone account-wide works, but it isn't the only way. Continue and we'll show you how to give a teammate access to a single chatbot instead.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/settings",
    steps: SETTINGS_SECTION,
    handoff: {
      element: '[data-tour="chatbot-invite-role"]',
      popover: {
        title: "Last stop: make it yours",
        description:
          "Continue and we'll show you Settings — where you choose your chatbot's model, its manners, its language and the rules it always follows.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/webhooks",
    steps: WEBHOOK_SECTION,
    handoff: {
      element: '[data-tour="settings-instructions"]',
      popover: {
        title: "Wire it into your own systems",
        description:
          "Continue and we'll show you Webhooks — how your servers can hear about what happens in your chatbot the instant it happens.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/usage/api-keys",
    steps: API_SECTION,
    handoff: {
      element: '[data-tour="webhooks-verify-signature"]',
      popover: {
        title: "Or talk to it from your own code",
        description:
          "Continue and we'll show you API Keys — how to query your chatbot, manage sources and more, all programmatically.",
        side: "top",
        align: "start",
      },
    },
  },
  {
    route: "/auto-sync",
    steps: AUTO_SYNC_SECTION,
    handoff: {
      element: '[data-tour="api-keys-logs"]',
      popover: {
        title: "Never let your sources go stale",
        description:
          "Once your links and files are in, Auto Sync can keep re-checking them for changes and even discover new pages on its own. Continue and we'll show you how to set it up.",
        side: "top",
        align: "start",
      },
    },
  },
  // The true final leg: back on /dashboard where the tour started, with no
  // `element` on its own step (or the handoff into it) — driver.js renders a
  // step with no `element` centered on screen with no spotlight cutout, which
  // is exactly the send-off card this closing message wants. No further
  // `handoff` here, so this is the leg that ends the tour rather than bridging
  // into another one.
  {
    route: "/dashboard",
    steps: CLOSING_SECTION,
    handoff: {
      popover: {
        title: "You've seen it all",
        description:
          "Continue and we'll take you back to your dashboard to wrap things up.",
      },
    },
  },
];

// Total steps across every leg, including the handoff step each one adds to its
// predecessor. driver.js only ever knows about the leg it is currently running,
// so its built-in "X of Y" would restart the denominator on every page; this is
// the Y that spans the whole tour. See progressText in use-product-tour.js.
export function totalTourSteps(tourKey, { subscription, tier } = {}) {
  const dashboard = buildTour(tourKey, { subscription, tier }).length;
  return TOUR_LEGS.reduce(
    (sum, leg) => sum + leg.steps.length + (leg.handoff ? 1 : 0),
    dashboard,
  );
}

/**
 * How many steps precede the leg currently running — the offset that turns a
 * leg-local step number into a tour-wide one.
 *
 * `done` is the number of legs already finished, matching startTour's `leg`
 * option: 0 while the dashboard leg runs, 1 for TOUR_LEGS[0], and so on. So the
 * steps ahead of it are the dashboard's, plus, for each finished leg, its own
 * steps and the handoff that bridged into it.
 */
export function stepsBeforeLeg(done, tourKey, { subscription, tier } = {}) {
  // Nothing precedes the dashboard leg — it is the one that opens the tour, so
  // its first step is step 1. The dashboard's own steps only become an offset
  // once that leg is behind us.
  if (done === 0) return 0;

  let offset = buildTour(tourKey, { subscription, tier }).length;
  for (let i = 0; i < done; i++) {
    // The handoff into leg i, rendered at the end of leg i - 1.
    if (TOUR_LEGS[i].handoff) offset += 1;
    // Leg i's own steps count only once it is fully behind us; the leg that is
    // about to run contributes nothing, since its first step is step `offset+1`.
    if (i < done - 1) offset += TOUR_LEGS[i].steps.length;
  }
  return offset;
}

export {
  DASHBOARD_SECTION,
  INSTALLATION_SECTION,
  SDK_ADVANCED_SECTION,
  CHAT_HISTORY_SECTION,
  LEAD_SECTION,
  WEBSITE_LINK_SECTION,
  WEBSITE_FILES_SECTION,
  CONVERSATION_STARTERS_SECTION,
  CONVERSATION_FOLLOWUPS_SECTION,
  CHATBOT_MEMBERS_SECTION,
  ACCOUNT_MEMBERS_SECTION,
  SETTINGS_SECTION,
  WEBHOOK_SECTION,
  API_SECTION,
  INTEGRATIONS_SECTION,
  AUTO_SYNC_SECTION,
};

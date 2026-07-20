// Tour *sections* — reusable blocks of driver.js steps, one per product area.
//
// A tour is a composition of sections, not a hand-written list of steps. This
// matters because the same section (DASHBOARD_SECTION, below) has to appear in
// every audience's tour, and the tours themselves multiply fast: one per
// tourKey ("base" | "trial" | "subscribed") and eventually per tier
// ("growth" | "scale"). Keeping sections separate from the tours that use them
// means adding a section is a one-line change in each array that needs it.
//
// Each element selector must have a matching data-tour attribute in the DOM,
// and driver.js silently skips steps whose element is missing — so a section
// pointing at a page the user is not currently on is a no-op, not a crash.
//
// ── Highlighting something that isn't in the DOM yet (a popover / sheet) ──────
// driver.js resolves a step's `element` once, at highlight time. If the element
// only mounts after a click (a Radix popover content, a sheet), point the step's
// `element` at that not-yet-mounted selector and open it from `onHighlightStarted`:
//   1. Click the trigger to open it (this drives the React open-state).
//   2. Call waitForElementThenRehighlight(driver, selector) — it polls until the
//      element mounts, then moveTo() re-resolves the step so the spotlight snaps
//      onto it. Until then driver.js just holds on the previous frame.
// See openDetailSheet (sheet) and closeDetailSheetIfOpen (filter popover) below.
//
// Cleanup: undo the open-state when the user LEAVES the step via `onDeselected`
// (fires on next/prev/close/destroy — every exit path, unlike onNextClick). See
// closeFilterPopoverOnLeave below.


// The tour's opening card, shown before any topic-specific step, for every
// audience (base, trial, subscribed). Like CLOSING_SECTION, this step has no
// `element`, so driver.js centers it with no spotlight cutout — a plain
// welcome card rather than a highlight of anything on the page. Prepended in
// buildTour() rather than folded into DASHBOARD_SECTION itself, since
// DASHBOARD_SECTION is reused as-is by all three tour arrays and by the
// sidebar's manual "Take a Tour" replay — keeping the welcome separate means
// it only has to be spread in once, at the very front of the composed tour.
export const WELCOME_SECTION = [
  {
    popover: {
      title: "Welcome to ContextGPT!",
      description:
        "We're happy to have you onboard. Let's start — give us 2 minutes to walk you through the product.",
    },
  },
];

export const DASHBOARD_SECTION = [
  {
    element: '[data-tour="sidebar-chatbot-switcher"]',
    popover: {
      title: "All your chatbots",
      description:
        "Every chatbot you own lives here. Click to switch between them — the whole dashboard follows whichever one you pick.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-stat-cards"]',
    popover: {
      title: "Your key stats",
      description:
        "Links, files, messages and feedback for the selected chatbot at a glance. Each card links straight through to the full view.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-chatbot-id"]',
    popover: {
      title: "Chatbot ID",
      description:
        "Your chatbot's unique identifier — use it when integrating with third-party platforms like the WordPress plugin.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="dashboard-embed-code"]',
    popover: {
      title: "Embed it on your site",
      description:
        "Paste this snippet into your website's HTML and your chatbot goes live. That's the whole installation.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the Website Integration page top to bottom: find the ID, take the
// recommended floating widget, then the two escape hatches (a fixed container,
// or a platform-specific guide). Every step lives on
// /installation/website-integration — on any other page the whole section is
// skipped, which is why it is safe to append to tours that may start elsewhere.
export const INSTALLATION_SECTION = [
  {
    element: '[data-tour="installation-chatbot-id"]',
    popover: {
      title: "Find your chatbot ID",
      description:
        "Your chatbot's unique identifier. Copy it from here whenever a plugin or integration asks for it.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="installation-floating-embed"]',
    popover: {
      title: "Install the floating widget",
      description:
        "The recommended option. Paste this one snippet into your site's HTML and a chat bubble appears in the bottom-right corner of every page.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="installation-container-embed"]',
    popover: {
      title: "Or embed it in a container",
      description:
        'Prefer the chat inline instead of floating? Set data-mode="embedded" and point data-container at your own element — that is how the <a href="https://contextgpt.in/demo" target="_blank" rel="noopener noreferrer">ContextGPT demo</a> page does it.',
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="installation-platforms"]',
    popover: {
      title: "Or follow your platform's guide",
      description:
        "WordPress, React / Next.js, Shopify and more — pick your platform here for step-by-step instructions written for it.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the Chat History page: the thread list, the AI/agent handoff toggle,
// the visitor detail panel, the per-thread ID, and the filter drawer. Steps 3
// and 4 are a pair — "View Detail" opens the sheet that holds the Thread ID.
// The thread-id anchor only exists once that sheet is open, so the thread-id
// step opens it for the user (by clicking the "View Detail" button) on arrival,
// and the following filters step closes it again before highlighting. Everything
// here lives on /chat-history; elsewhere the section is a no-op.

// Polls for `selector` and, once it exists, forces driver.js to re-resolve the
// CURRENT step so the now-present element gets highlighted.
//
// Why this instead of a fixed `setTimeout(() => driver.refresh(), 350)`:
// driver.js (1.7.0) resolves a step's `element` with a single querySelector at
// highlight time. When an onHighlightStarted hook clicks something that mounts
// React/Radix content asynchronously, the target does not exist yet, so the step
// is locked in as "elementless" (centered popover, no spotlight cutout). A bare
// refresh() only re-renders the already-resolved stage — it will NOT re-resolve
// an elementless step. moveTo(activeIndex) re-runs element resolution and
// rebuilds the cutout, so we call that once the element has actually appeared.
// Polling (vs a lucky fixed delay) removes the mount-timing race entirely.
const waitForElementThenRehighlight = (driver, selector) => {
  const INTERVAL_MS = 50;
  const MAX_TRIES = 40; // ~2s ceiling
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (document.querySelector(selector)) {
      clearInterval(timer);
      const index = driver.getActiveIndex();
      // moveTo re-resolves the element; refresh() alone can't rescue an
      // elementless step. Guard in case the tour was closed while we waited.
      if (typeof index === "number") {
        // Snap, don't crawl: driver.js animates the moveTo by interpolating the
        // full-screen overlay cutout frame-by-frame (re-invoking a function
        // `element` and repainting the overlay each frame) — from a small anchor
        // to a large popover this reads as a very slow highlight. Disable animate
        // for just this re-resolve so the spotlight jumps to the new box
        // instantly, then restore it so normal step-to-step transitions still
        // animate.
        driver.setConfig?.({ ...driver.getConfig?.(), animate: false });
        driver.moveTo(index);
        driver.setConfig?.({ ...driver.getConfig?.(), animate: true });
      } else {
        driver.refresh();
      }
    } else if (tries >= MAX_TRIES) {
      // Give up quietly: the step stays elementless, same as before this fix.
      clearInterval(timer);
    }
  }, INTERVAL_MS);
};

// Opens the visitor detail sheet by clicking the "View Detail" button, which is
// what drives the React state that mounts the sheet (and the thread-id anchor).
// The sheet mounts + animates asynchronously, so we poll for the anchor and then
// re-resolve the step so driver.js highlights it instead of skipping it.
const openDetailSheet = (el, step, { driver }) => {
  const alreadyOpen = document.querySelector(
    '[data-slot="sheet-content"][data-state="open"]',
  );
  if (alreadyOpen) return;
  const btn = document.querySelector('[data-tour="chat-history-view-detail"]');
  if (!btn) return;
  btn.click();
  waitForElementThenRehighlight(
    driver,
    '[data-tour="chat-history-thread-id"]',
  );
};

// Closes the visitor detail sheet (opened by the thread-id step) if it is open,
// then opens the advanced filter popover. Because the highlighted element for
// this step is the popover CONTENT (which only mounts once open), we poll for it
// and re-resolve the step so driver.js spotlights the panel instead of skipping
// it — the same wait-then-rehighlight dance openDetailSheet uses for the sheet.
const closeDetailSheetIfOpen = (el, step, { driver } = {}) => {
  const sheet = document.querySelector(
    '[data-slot="sheet-content"][data-state="open"]',
  );
  if (!sheet) return;
  // The rendered close button is a raw Radix Close with no data-slot, so target
  // it by its sr-only "Close" label (this excludes the copy/tag buttons); fall
  // back to an Escape keydown, which Radix Dialog turns into onOpenChange(false)
  // for the controlled sheet.
  const closeBtn = Array.from(sheet.querySelectorAll("button")).find((b) =>
    /close/i.test(b.textContent || ""),
  );
  if (closeBtn) {
    closeBtn.click();
  } else {
    sheet.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  }
  // Also open the advanced filter popover (no highlighting — just open it) by
  // clicking its trigger, which drives the controlled popover's open state.
  // Defer the click: closing the sheet (Radix Dialog) restores focus to its
  // trigger, and that focus/pointer settle would otherwise register as an
  // outside interaction on the freshly opened popover and immediately close it.
  // Waiting a frame lets the sheet finish before we open the popover.
  const openFilterPopover = () => {
    const filterTrigger = document.querySelector(
      '[data-tour="chat-history-filters-trigger"]',
    );
    const filterOpen = document.querySelector(
      '[data-slot="popover-content"][data-state="open"]',
    );
    if (filterTrigger && !filterOpen) {
      // Flag the popover so its outside-interaction/focus handlers ignore the
      // stray events from the sheet closing. Cleared after events settle.
      window.__tourOpeningFilter = true;
      filterTrigger.click();
      setTimeout(() => {
        window.__tourOpeningFilter = false;
      }, 300);
    }
    // Wait for the popover content to actually mount, then re-resolve the step
    // so driver.js highlights the panel only once it's open (flag = the panel
    // exists in the DOM). Until then the step stays put and driver.js waits.
    if (driver) {
      waitForElementThenRehighlight(
        driver,
        '[data-tour="chat-history-filters"]',
      );
    }
  };
  // Two rAFs to clear the sheet's close + focus-restore, then a short timeout as
  // a fallback for the focus event that fires slightly later.
  requestAnimationFrame(() => requestAnimationFrame(openFilterPopover));
};

// Closes the filter popover when the user leaves that step (wired as
// onDeselected). Clicking Next doesn't dismiss the popover on its own — the
// click lands on driver.js's overlay/button, not outside the popover — so we
// close it explicitly by clicking its trigger, which toggles the open state.
const closeFilterPopoverOnLeave = () => {
  const filterOpen = document.querySelector(
    '[data-slot="popover-content"][data-state="open"]',
  );
  if (!filterOpen) return;
  const filterTrigger = document.querySelector(
    '[data-tour="chat-history-filters-trigger"]',
  );
  filterTrigger?.click();
};

export const CHAT_HISTORY_SECTION = [
  {
    element: '[data-tour="chat-history-thread-list"]',
    popover: {
      title: "All your chats live here",
      description:
        "Every conversation your chatbot has had, newest first. Click any thread to open the full exchange on the right.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="chat-history-escalate-toggle"]',
    popover: {
      title: "Switch between AI and you",
      description:
        "Hand a conversation off to a human agent, or give it back to the AI — anytime, mid-thread. Escalating enables agent messaging on that thread.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="chat-history-view-detail"]',
    popover: {
      title: "Get to know your visitor",
      description:
        "Open the detail panel to see who you're talking to — everything the chatbot captured about this visitor in one place.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: '[data-tour="chat-history-thread-id"]',
    // Open the detail sheet on arrival so the thread-id anchor exists to highlight.
    onHighlightStarted: openDetailSheet,
    popover: {
      title: "Every chat has its own ID",
      description:
        "Each thread carries a unique ID. Copy it to reference this exact conversation in webhooks, support tickets or the API.",
      side: "left",
      align: "start",
      popoverClass: "contextgpt-driver-popover contextgpt-thread-id-popover",
    },
  },
  {
    // The popover content, not the trigger button — it mounts only once the
    // popover is open, so onHighlightStarted opens it and polls for this element
    // before driver.js locks the spotlight onto it.
    element: '[data-tour="chat-history-filters"]',
    // Close the detail sheet left open by the previous (thread-id) step so it
    // doesn't cover this panel, then open the filter popover.
    onHighlightStarted: closeDetailSheetIfOpen,
    // Close the filter popover when advancing past / leaving this step.
    onDeselected: closeFilterPopoverOnLeave,
    popover: {
      title: "Sort and filter your chats",
      description:
        "Narrow the list by tags, read status, escalations, importance, reactions, GPT model and more — so you find the conversations that matter fast.",
      side: "right",
      align: "start",
    },
  },
];

// The developer half of installation, on /installation/sdk-advanced. Kept
// separate from INSTALLATION_SECTION rather than appended to it because the two
// live on different pages: driver.js cannot navigate, so a single combined
// array would silently drop whichever half the user is not currently viewing.
// Compose both only in a flow that routes between the pages itself.
// Switches the Leads page to the tab identified by `tabTour` (the tab trigger's
// data-tour value), then re-resolves the current step once its `selector`
// target has mounted.
//
// Why a helper like this exists here but not for the earlier sections: the
// Leads page is a *single* route (/leads) whose three tabs are shadcn/Radix
// Tabs, and Radix unmounts the inactive tab's TabsContent. So — unlike the
// cross-page TOUR_LEGS, which navigate with router.push — a step that lives on
// a different tab has no element in the DOM until we click that tab's trigger.
// Clicking the trigger drives the page's own setActiveTab (LeadsContent), which
// mounts the target; then waitForElementThenRehighlight polls for it and snaps
// the spotlight on, exactly as the Chat History sheet/popover steps do.
// Radix Tabs' trigger selects on the pointer-down / focus path, not on a bare
// synthetic click. element.click() dispatches only a `click` MouseEvent (no
// pointerdown/mousedown), so it silently does nothing here — which is why the
// tour popover kept floating centered on the still-active Current tab. Drive
// the trigger the way a real pointer would: pointerdown → mousedown → focus →
// click, so Radix's controlled onValueChange fires and setActiveTab runs.
const activateRadixTrigger = (trigger) => {
  if (!trigger) return;
  const opts = { bubbles: true, cancelable: true, view: window };
  trigger.dispatchEvent(new PointerEvent("pointerdown", { ...opts, button: 0 }));
  trigger.dispatchEvent(new MouseEvent("mousedown", { ...opts, button: 0 }));
  trigger.focus?.();
  trigger.dispatchEvent(new PointerEvent("pointerup", { ...opts, button: 0 }));
  trigger.dispatchEvent(new MouseEvent("mouseup", { ...opts, button: 0 }));
  trigger.click();
};

const switchLeadTab = (tabTour, selector) => (el, step, { driver } = {}) => {
  const trigger = document.querySelector(`[data-tour="${tabTour}"]`);
  const alreadyActive = trigger?.getAttribute("data-state") === "active";
  if (!alreadyActive) {
    activateRadixTrigger(trigger);
  }
  // Re-resolve only when the anchor isn't already highlighted correctly:
  //   - we just switched tabs (target is unmounted, mounts async), or
  //   - the anchor exists but sits off-screen / below the fold.
  // If we're already on the right tab AND the target is present, driver.js has
  // already highlighted it — calling moveTo(index) again here just tears the
  // overlay down and rebuilds it on the same step, which reads as a flicker.
  if (!driver || !selector) return;
  const present = document.querySelector(selector);
  if (alreadyActive && present) return;
  waitForElementThenRehighlight(driver, selector);
};

// Walks the Leads page across its three tabs (Current → Settings → Human
// Settings). Each step whose anchor lives on a tab other than the one currently
// open clicks that tab's trigger on arrival (switchLeadTab) and waits for its
// target to mount before highlighting — because Radix Tabs unmount the inactive
// tab's content, so the anchor does not exist until the tab is selected. The
// whole section lives on /leads; on any other page it is a no-op.
export const LEAD_SECTION = [
  {
    element: '[data-tour="sidebar-leads"]',
    popover: {
      title: "Your Leads live here",
      description: "Get a glimpse of all your leads in here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="leads-table"]',
    // First step: make sure we're on the Current tab (deep links can land on
    // another tab), then highlight the leads table. The switchLeadTab guard
    // returns early when the tab is already active and the anchor is present,
    // so on the normal path this fires no redundant re-highlight (no flicker).
    onHighlightStarted: switchLeadTab("leads-tab-current", '[data-tour="leads-table"]'),
    popover: {
      title: "Every lead you capture",
      description:
        "Names, emails and the sessions behind them — every visitor your chatbot converted lands in this table. Click any row to see the full detail.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="leads-settings-intro"]',
    onHighlightStarted: switchLeadTab(
      "leads-tab-settings",
      '[data-tour="leads-settings-intro"]',
    ),
    popover: {
      title: "Configure lead collection",
      description:
        "Decide how and when your chatbot asks for details — turn collection on, and control what it gathers and the moment it does.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="leads-notifications"]',
    // Same tab as the previous step, so no switch needed — but the anchor is
    // lower on the page; pass it as the selector so we still re-resolve once
    // it's in view.
    onHighlightStarted: switchLeadTab(
      "leads-tab-settings",
      '[data-tour="leads-notifications"]',
    ),
    popover: {
      title: "Get notified the moment a lead arrives",
      description:
        "Turn on email notifications and you'll hear about every new lead as fast as it's captured — no need to keep this page open.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="leads-human-support-intro"]',
    onHighlightStarted: switchLeadTab(
      "leads-tab-human-settings",
      '[data-tour="leads-human-support-intro"]',
    ),
    popover: {
      title: "Hand off to a human",
      description:
        "Configure how and when the AI escalates a conversation to a human agent — everything about your human support flow lives here.",
      side: "bottom",
      align: "start",
    },
  },
];

// Walks the Conversation Starters page (/conversation-starters): find it in the
// sidebar, read the starters you've already built, then meet the form that adds
// a new one — the action-type switch (Send Message vs Open Link) and the save
// button. The sidebar step lives everywhere; steps 2–4 live on the page, so on
// any other route they are skipped rather than shown.
export const CONVERSATION_STARTERS_SECTION = [
  {
    element: '[data-tour="sidebar-conversation-starters"]',
    popover: {
      title: "Give visitors a first move",
      description:
        "Conversation Starters are the tappable buttons that greet every visitor — the fastest way to nudge someone from 'just looking' into an actual chat.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="starters-list"]',
    popover: {
      title: "Your starters, in order",
      description:
        "Every starter button you've created lives here, top to bottom — exactly the order visitors see them in. Reorder, edit or remove any of them right from this list.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="starters-action-type"]',
    popover: {
      title: "Pick what the button does",
      description:
        "Each starter either sends a message on your visitor's behalf — like 'What's your pricing?' — or opens a link you choose. Flip between the two here as you build the button.",
      side: "left",
      align: "start",
    },
  }
];

// Switches the Conversation Followups action-type Tabs to `tabValue` (a
// TabsTrigger's data-tour value), then re-resolves the current step once its
// `selector` target is present. Same reasoning as switchLeadTab: these are Radix
// Tabs whose triggers select on the pointer-down / focus path, not on a bare
// synthetic click — so we drive the trigger through activateRadixTrigger. Here
// the switched-to trigger IS the highlighted element, and it stays mounted at
// all times (unlike the Leads page, this Tabs has no TabsContent — nothing
// unmounts when the active tab changes). So the highlighted selector is ALWAYS
// present on arrival, and driver.js has already spotlighted it. Re-resolving in
// that case just tears the overlay down and rebuilds it on the same element,
// which is the visible lag on the message/link -> escalate transition. Only
// re-resolve if the target is genuinely absent (defensive); otherwise switch
// the tab (to reveal its downstream panel content) and leave the spotlight be.
const switchFollowupTab = (tabTour, selector) => (el, step, { driver } = {}) => {
  const trigger = document.querySelector(`[data-tour="${tabTour}"]`);
  const alreadyActive = trigger?.getAttribute("data-state") === "active";
  if (!alreadyActive) {
    activateRadixTrigger(trigger);
  }
  if (!driver || !selector) return;
  const present = document.querySelector(selector);
  if (present) return;
  waitForElementThenRehighlight(driver, selector);
};

// Walks the Conversation Followups page (/conversation-followups): find it in the
// sidebar, read the followups you've built, meet the same message/link action
// switch — and then the third option that only followups have: Escalate. The
// escalate step clicks that tab on arrival (switchFollowupTab) so the visitor
// sees exactly what it unlocks — a one-tap handoff from the AI to a human agent.
// The sidebar step lives everywhere; steps 2–4 live on the page, so on any other
// route they are skipped rather than shown.
export const CONVERSATION_FOLLOWUPS_SECTION = [
  {
    element: '[data-tour="sidebar-conversation-followups"]',
    popover: {
      title: "Keep the conversation going",
      description:
        "Followups are the buttons that appear after your chatbot answers — the gentle next step that stops a visitor from hitting a dead end and leaving.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="followups-list"]',
    popover: {
      title: "Every followup you offer",
      description:
        "All your followup buttons live here in the order they surface. Tune them so there's always an obvious next move for whoever you're talking to.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="followups-action-type"]',
    // Reset to the first tab on arrival so this step always reads left-to-right,
    // even if a later escalate step (or the user) left another tab active.
    onHighlightStarted: switchFollowupTab(
      "followups-action-type",
      '[data-tour="followups-action-type"]',
    ),
    popover: {
      title: "Send a message, open a link — or more",
      description:
        "Like starters, a followup can fire a message or open a link. But followups get a third power the starters don't — and it's the one that keeps a stuck visitor from walking away.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="followups-tab-escalate"]',
    // The escalation-confirmation textarea only renders when the escalate tab is
    // active, so click that tab on arrival. The trigger itself is what we
    // highlight — it stays mounted, so this mainly guards the data-state="active"
    // timing and keeps it in view. See switchFollowupTab.
    onHighlightStarted: switchFollowupTab(
      "followups-tab-escalate",
      '[data-tour="followups-tab-escalate"]',
    ),
    popover: {
      title: "Hand off to a real human, on tap",
      description:
        "This is the one. Escalate turns a followup into a live handoff — one tap and the visitor moves from the AI straight to a human agent, with a confirmation message you write. Nobody leaves frustrated; they get a person.",
      side: "bottom",
      align: "start",
    },
  },
];

// Opens the "Add Links" modal by clicking its trigger button, which drives the
// page's isAddModalOpen state that mounts the Dialog (and the source-options
// grid inside it). The modal mounts + animates asynchronously, so we poll for
// the options grid and re-resolve the step so driver.js highlights it instead
// of skipping it — the same wait-then-rehighlight dance the Chat History sheet
// step uses.
const openAddLinksModal = (el, step, { driver } = {}) => {
  const alreadyOpen = document.querySelector(
    '[data-slot="dialog-content"][data-state="open"]',
  );
  if (alreadyOpen) return;
  const btn = document.querySelector('[data-tour="website-links-add"]');
  if (!btn) return;
  btn.click();
  if (driver) {
    waitForElementThenRehighlight(
      driver,
      '[data-tour="website-links-source-options"]',
    );
  }
};

// Closes the Add Links modal when the user leaves the source-options step (wired
// as onDeselected, which fires on next/prev/close/destroy). Clicking Next lands
// on driver.js's overlay, not outside the Dialog, so the modal won't dismiss on
// its own — we close it explicitly via the Dialog's built-in close button, with
// an Escape keydown as a fallback (Radix Dialog turns that into a close).
const closeAddLinksModalOnLeave = () => {
  const modal = document.querySelector(
    '[data-slot="dialog-content"][data-state="open"]',
  );
  if (!modal) return;
  const closeBtn = modal.querySelector('[data-slot="dialog-close"]');
  if (closeBtn) {
    closeBtn.click();
  } else {
    modal.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  }
};

// Walks the Website Links page end to end: find it in the sidebar, read the
// live ingestion status of everything you've imported, then add a new source —
// the add step opens the "Add Links" modal on arrival so the source-type picker
// is on screen to highlight, and closes it again when the user moves on. The
// sidebar step lives everywhere; steps 2–4 live on /website-links, so on any
// other page they are skipped rather than shown.
// Opens the "Add Files" modal by clicking its trigger, which drives the page's
// isAddFileModalOpen state that mounts the Dialog (and the source-options grid
// inside it). Same wait-then-rehighlight dance as openAddLinksModal — poll for
// the grid, then re-resolve the step so driver.js highlights it instead of
// skipping it against an unmounted target.
const openAddFilesModal = (el, step, { driver } = {}) => {
  const alreadyOpen = document.querySelector(
    '[data-slot="dialog-content"][data-state="open"]',
  );
  if (alreadyOpen) return;
  const btn = document.querySelector('[data-tour="website-files-add"]');
  if (!btn) return;
  btn.click();
  if (driver) {
    waitForElementThenRehighlight(
      driver,
      '[data-tour="website-files-source-options"]',
    );
  }
};

// Closes the Add Files modal when the user leaves the source-options step
// (wired as onDeselected). Mirrors closeAddLinksModalOnLeave: the Next click
// lands on driver.js's overlay, not outside the Dialog, so close it explicitly
// via the Dialog's built-in close button, with an Escape keydown as fallback.
const closeAddFilesModalOnLeave = () => {
  const modal = document.querySelector(
    '[data-slot="dialog-content"][data-state="open"]',
  );
  if (!modal) return;
  const closeBtn = modal.querySelector('[data-slot="dialog-close"]');
  if (closeBtn) {
    closeBtn.click();
  } else {
    modal.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  }
};

// Walks the Files & Data Sources page end to end: find it in the sidebar, read
// the live ingestion status of everything you've imported, then add a new
// source — the add step opens the "Add Files" modal on arrival so the
// source-type picker is on screen to highlight, and closes it again when the
// user moves on. The sidebar step lives everywhere; steps 2–4 live on
// /website-files, so on any other page they are skipped rather than shown.
export const WEBSITE_FILES_SECTION = [
  {
    element: '[data-tour="sidebar-website-files"]',
    popover: {
      title: "Bring in your files and documents",
      description:
        "This is your Files & Data Sources hub. Pull in everything you've stored — local uploads, Notion, Google Drive, Dropbox, GitHub and more — so your chatbot can answer straight from your own documents.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="website-files-status-cards"]',
    popover: {
      title: "See where every file stands",
      description:
        "Each card is a live count of your files by ingestion state. Click one to filter the table down to just those files — and resync or clean them up right from the card.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="website-files-add"]',
    popover: {
      title: "Add a new source",
      description:
        "Ready to bring in more documents? Start here — this button opens the picker where you choose where your files come from.",
      side: "left",
      align: "start",
    },
  },
  {
    // The source-type picker grid mounts only once the Add Files modal is open,
    // so onHighlightStarted opens it and polls for this element before driver.js
    // locks the spotlight onto it; onDeselected closes the modal on the way out.
    element: '[data-tour="website-files-source-options"]',
    onHighlightStarted: openAddFilesModal,
    onDeselected: closeAddFilesModalOnLeave,
    popover: {
      title: "Choose your source type",
      description:
        "Pick where to import from — upload local files, or connect Notion, Google Drive, Dropbox, OneDrive, Box, GitHub and more. Each one walks you through the rest.",
      side: "top",
      align: "start",
    },
  },
];

export const WEBSITE_LINK_SECTION = [
  {
    element: '[data-tour="sidebar-website-links"]',
    popover: {
      title: "Ingest all your online data",
      description:
        "This is your Website Links hub. Bring in everything you've published on the web — pages, sitemaps, whole sites, even YouTube — so your chatbot can answer from it.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="website-links-status-cards"]',
    popover: {
      title: "Track ingestion at a glance",
      description:
        "Each card is a live count of where your links stand — total, in progress, completed and failed. Click one to filter the table to just those links.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="website-links-add"]',
    popover: {
      title: "Add a new source",
      description:
        "Ready to bring in more content? Start here — this button opens the picker where you choose what kind of source you want to import.",
      side: "left",
      align: "start",
    },
  },
  {
    // The source-type picker grid mounts only once the Add Links modal is open,
    // so onHighlightStarted opens it and polls for this element before driver.js
    // locks the spotlight onto it; onDeselected closes the modal on the way out.
    element: '[data-tour="website-links-source-options"]',
    onHighlightStarted: openAddLinksModal,
    onDeselected: closeAddLinksModalOnLeave,
    popover: {
      title: "Choose your source type",
      description:
        "Pick how you want to import: a batch of individual links, a sitemap, a full-site scrape, or a YouTube video, playlist or channel. Each one walks you through the rest.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the Chatbot Members page (/chatbot-members): find it in the sidebar,
// see who already has access to *this* chatbot, then meet the invite form — the
// role picker and the scope note that this invite is for the selected chatbot
// only. Everything except the sidebar step lives on /chatbot-members; the whole
// page is a single route with nothing mounted behind a click, so no
// wait-then-rehighlight dance is needed. On any other page the section is a
// no-op. This is the chatbot-scoped counterpart to ACCOUNT_MEMBERS_SECTION.
export const CHATBOT_MEMBERS_SECTION = [
  {
    element: '[data-tour="sidebar-chatbot-members"]',
    popover: {
      title: "Invite people to this chatbot",
      description:
        "Chatbot Members is where you give teammates access to the chatbot you have selected — and only that one. Perfect for handing a single project to the people working on it.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="chatbot-members-list"]',
    popover: {
      title: "Everyone on this chatbot",
      description:
        "Every person with access to the selected chatbot lives here, alongside their role. Adjust a role or remove someone right from this list — changes here affect this chatbot only.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="chatbot-invite-form"]',
    popover: {
      title: "Send an invite for this chatbot",
      description:
        "Drop in an email, pick a role and send. The invited person joins this chatbot alone — not the rest of your account. Need someone across every chatbot at once? Use Account Members instead.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="chatbot-invite-role"]',
    popover: {
      title: "Choose exactly what they can do",
      description:
        "Agent, Manager, Admin or Super Admin — each role widens what the person can see and change. You can only grant a role up to your own, so pick the level that fits their job on this chatbot.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the Account Members page (/account-members): find it in the sidebar,
// see everyone who has account-wide access, then meet the invite form — the
// role picker and the key difference from a chatbot invite: an account member
// is added to *every* chatbot in the account at once (and any created later).
// Same single-route simplicity as CHATBOT_MEMBERS_SECTION — nothing mounts
// behind a click, so no wait-then-rehighlight helper is required. Off this
// route the section is a no-op.
export const ACCOUNT_MEMBERS_SECTION = [
  {
    element: '[data-tour="sidebar-account-members"]',
    popover: {
      title: "Add people across your whole account",
      description:
        "Account Members is the big-picture view: invite someone here and they land on every chatbot you own at once — the fastest way to bring a teammate fully on board.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="account-members-list"]',
    popover: {
      title: "Your whole team, in one place",
      description:
        "Everyone with account-level access shows up here with their role. Update a role once and it applies across all of your chatbots — no need to touch each one.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="account-invite-form"]',
    popover: {
      title: "One invite, every chatbot",
      description:
        "Enter an email, choose a role and send. The person is added to all existing chatbots with that role — and every new chatbot you create includes them too. You can still override their role per chatbot later.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="account-invite-role"]',
    popover: {
      title: "Set their account-wide role",
      description:
        "The role you pick here becomes their default on every chatbot. Agent, Manager, Admin or Super Admin — you can only grant up to your own level, so choose the access that matches their responsibilities.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the Webhooks page (/webhooks): find it in the sidebar, pick the events
// you want to be notified about, read the live delivery log of everything sent,
// then learn how to verify each incoming request's signature. Everything except
// the sidebar step lives on /webhooks — the page is a single route with nothing
// mounted behind a click (no modals, no Radix tabs), so no wait-then-rehighlight
// dance is needed, same as CHATBOT_MEMBERS_SECTION. On any other page the
// section is a no-op. Webhooks are a Scale-only entitlement (webhook_support is
// false for starter and growth in website_subscriptions_paddle.csv), so this
// section belongs only in scale's tour.
export const WEBHOOK_SECTION = [
  {
    element: '[data-tour="sidebar-webhooks"]',
    popover: {
      title: "Wire ContextGPT into your own systems",
      description:
        "Webhooks let your servers hear about what happens in your chatbot the instant it happens — no polling, no waiting. This is the room where you set them up.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="webhooks-events"]',
    popover: {
      title: "Choose what you get notified about",
      description:
        "Tick the events you care about — a new message, a captured lead, an escalation — and we'll POST a JSON payload to your endpoint every time one fires. Only the boxes you check get delivered.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="webhooks-delivery-log"]',
    popover: {
      title: "See every delivery, as it happens",
      description:
        "This is the live history of every outbound attempt — status, timing and payload. It updates in real time, so when something doesn't land on your side, this is where you find out why.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="webhooks-verify-signature"]',
    popover: {
      title: "Trust that a request really came from us",
      description:
        "Every request we send carries an X-SIGNATURE header — an HMAC-SHA256 of the raw body using your secret. Recompute it on your end and compare: if it matches, the event is genuinely from ContextGPT. This card has copy-paste code to do exactly that.",
      side: "top",
      align: "start",
    },
  },
];

// Walks the API Keys page (/usage/api-keys): find it in the sidebar (via the
// user menu, where the API Keys link lives), see the keys you've already
// created and mint a new one, then read the live request log of every call made
// with those keys. Everything except the sidebar step lives on /usage/api-keys
// — the page is a single route with nothing mounted behind a click (the create
// dialog is a separate action we don't drive), so no wait-then-rehighlight dance
// is needed, same as WEBHOOK_SECTION. On any other page the section is a no-op.
//
// API access is a Growth+Scale entitlement: api_access is false for starter in
// website_subscriptions_paddle.csv, and true for growth and scale. So this
// section belongs only in growth's and scale's tours, never starter's.
export const API_SECTION = [
  {
    // The API Keys link itself lives inside the user-menu dropdown, which only
    // mounts when opened — so anchor the sidebar step to the stable dropdown
    // trigger (the same anchor the trial closing step uses) rather than a link
    // that isn't in the DOM until the menu is open.
    element: '[data-tour="sidebar-user-menu"]',
    popover: {
      title: "Your API keys live here",
      description:
        "Open this menu and head to API Keys to talk to ContextGPT from your own code — query your chatbot, manage sources and more, all programmatically.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="api-keys-list"]',
    popover: {
      title: "Every key you've created",
      description:
        "All your API keys live here. Keep them secret — anyone with a key can call the API as you, so never drop one into public repos or client-side code.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="api-keys-new-key"]',
    popover: {
      title: "Mint a new key",
      description:
        "Create a fresh API key here whenever you need one — for a new integration, a new environment, or to rotate an old one out. You'll see the full key just once, so copy it right away.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="api-keys-logs"]',
    popover: {
      title: "Watch your requests in real time",
      description:
        "Every call made with your keys shows up in this log the instant it lands — no refresh needed. It's the fastest way to confirm your integration is working and to spot anything that isn't.",
      side: "top",
      align: "start",
    },
  },
];

export const SDK_ADVANCED_SECTION = [
  {
    element: '[data-tour="sdk-methods"]',
    popover: {
      title: "Control the widget from code",
      description:
        "Developers get the $cgpt object. Push commands to open or close the widget, send a message, reset the conversation, or inject context — the full command table is right here.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="sdk-multiple-instances"]',
    popover: {
      title: "Run several widgets on one page",
      description:
        "Embed the same chatbot into as many containers as you like. Load the script once per container and give each one a data-instance name — every instance keeps its own isolated state.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="sdk-targeting-api"]',
    popover: {
      title: "Target one instance, or all of them",
      description:
        "This table is the addressing scheme: $cgpt.push broadcasts to every widget on the page, while $cgpt['name'] and $cgpt_widget['chatbotId'] narrow it down to a single instance or group.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="sdk-quick-nav"]',
    popover: {
      title: "Jump to any API call",
      description:
        "Your index to the rest of the page — sending messages, user sessions, custom CSS, widget visibility and more. Come back here whenever you need the exact call.",
      side: "top",
      align: "start",
    },
  },
];

// Opens the shared connect/reconfigure Dialog for the platform whose card
// button carries `triggerTour`, by clicking it — that drives the page's
// connectModal state which mounts the Dialog. The dialog mounts + animates
// asynchronously, so we poll for its content and re-resolve the step so
// driver.js highlights it instead of skipping it — same wait-then-rehighlight
// dance as the Add Links / Add Files modals above. Reused for both Zendesk
// (get-started) and Personal Website (reconfigure) since both open the same
// shared Dialog, just seeded with a different platform.
const openIntegrationModal = (triggerTour, platformKey) => (el, step, { driver } = {}) => {
  // Keyed by platform, not just presence: the previous step's onDeselected
  // close is an async state update, so the PREVIOUS platform's modal can
  // still be in the DOM when this step's onHighlightStarted runs. A bare
  // "is a modal open" check would treat that stale modal as "already open"
  // and skip clicking the trigger, leaving the wrong platform's modal (or
  // none at all) on screen.
  const alreadyOpenForPlatform = document.querySelector(
    `[data-tour="integrations-connect-modal"][data-platform-key="${platformKey}"]`,
  );
  if (alreadyOpenForPlatform) return;
  const btn = document.querySelector(`[data-tour="${triggerTour}"]`);
  if (!btn) return;
  btn.click();
  if (driver) {
    waitForElementThenRehighlight(
      driver,
      `[data-tour="integrations-connect-modal"][data-platform-key="${platformKey}"]`,
    );
  }
};

// Closes the shared connect/reconfigure Dialog when the user leaves a step
// that opened it (wired as onDeselected, which fires on next/prev/close/
// destroy). Mirrors closeAddLinksModalOnLeave: Next lands on driver.js's
// overlay, not outside the Dialog, so the modal won't dismiss on its own.
const closeIntegrationModalOnLeave = () => {
  const modal = document.querySelector(
    '[data-slot="dialog-content"][data-state="open"]',
  );
  if (!modal) return;
  const closeBtn = modal.querySelector('[data-slot="dialog-close"]');
  if (closeBtn) {
    closeBtn.click();
  } else {
    modal.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  }
};

// Walks the Integrations page (/integrations): find it in the sidebar, see the
// full grid of platforms you can connect, open Zendesk's connect modal as an
// example of a one-click platform integration, then open Personal Website's
// modal and land on the "add a domain" control — the escape hatch for people
// embedding on their own site rather than a third-party platform. Both modal
// steps open the shared connect Dialog on arrival (openIntegrationModal) and
// close it again on the way out (closeIntegrationModalOnLeave), the same
// open/close dance INSTALLATION and WEBSITE_LINK/FILES sections use for their
// own modals. Everything lives on /integrations; elsewhere the section is a
// no-op. Platform integrations (beyond Personal Website) are a Growth+Scale
// entitlement — custom_platform_integration is false for starter in
// website_subscriptions_paddle.csv — so this section belongs only in growth's
// and scale's tours.
export const INTEGRATIONS_SECTION = [
  {
    element: '[data-tour="sidebar-integrations"]',
    popover: {
      title: "Connect your favorite platforms",
      description:
        "Wire ContextGPT straight into the tools you already use — Slack, Zendesk, Messenger and more — so conversations meet you where you work.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="integrations-platform-grid"]',
    popover: {
      title: "Pick your integration",
      description:
        "Every platform ContextGPT connects to lives here. Find the one you use and connect it in a couple of clicks.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="integrations-zendesk-get-started"]',
    popover: {
      title: "Just click Get Started",
      description:
        "Just click on the Get Started to connect your preferred source.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="integrations-connect-modal"]',
    onHighlightStarted: openIntegrationModal(
      "integrations-zendesk-get-started",
      "ZENDESK",
    ),
    onDeselected: closeIntegrationModalOnLeave,
    popover: {
      title: "Just tap Get Started",
      description:
        "Hitting Get Started on any platform — like Zendesk here — opens this same panel with everything you need to connect it, credentials and all.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="integrations-website-reconfigure"]',
    popover: {
      title: "Or embed on your own website",
      description:
        "Not a third-party platform — your own site. Click Reconfigure on Personal Website to open its settings.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="integrations-website-domain-row"]',
    onHighlightStarted: openIntegrationModal(
      "integrations-website-reconfigure",
      "PERSONAL_WEBSITE",
    ),
    onDeselected: closeIntegrationModalOnLeave,
    popover: {
      title: "Add your domain",
      description: "Just add your website address, and click Add.",
      side: "top",
      align: "start",
    },
  },
];

// Switches the Settings page to the tab identified by `tabTour` (the tab
// trigger's data-tour value), then re-resolves the current step once its
// `selector` target has mounted. Identical reasoning to switchLeadTab: the
// Settings page is a *single* route (/settings) whose tabs are shadcn/Radix
// Tabs, and Radix unmounts the inactive tab's TabsContent — so a step whose
// anchor lives on another tab has no element in the DOM until we click that
// tab's trigger. The trigger's click drives the page's onValueChange
// (handleTabChange), which runs setActiveTab and mounts the target; then
// waitForElementThenRehighlight polls for it and snaps the spotlight on.
//
// One wrinkle the Leads page doesn't have: handleTabChange routes the click
// through the unsaved-changes guard (guardNavigation). On a clean form it runs
// the switch synchronously, so this behaves exactly like Leads. If the user has
// pending edits the guard may hold the switch behind a confirm — in that case
// the target simply never mounts and the poll gives up quietly, leaving the
// step elementless (a no-op), same failure mode as any missing anchor.
const switchSettingsTab = (tabTour, selector) => (el, step, { driver } = {}) => {
  const trigger = document.querySelector(`[data-tour="${tabTour}"]`);
  const alreadyActive = trigger?.getAttribute("data-state") === "active";
  if (!alreadyActive) {
    activateRadixTrigger(trigger);
  }
  // Re-resolve only when the anchor isn't already highlighted correctly — we
  // just switched tabs (target unmounted, mounts async) or it's below the fold.
  // Skipping the redundant moveTo when we're already on the right tab avoids the
  // tear-down/rebuild flicker. Same guard as switchLeadTab.
  if (!driver || !selector) return;
  const present = document.querySelector(selector);
  if (alreadyActive && present) return;
  waitForElementThenRehighlight(driver, selector);
};

// Walks the Settings page across the tabs that matter most on first setup:
// General (GPT model) → Chat Modes (who opens the conversation) → Localization
// (your visitor's language) → Personas (your chatbot's character) →
// Instructions (the rules it follows). Each step whose anchor lives on a tab
// other than the one currently open clicks that tab's trigger on arrival
// (switchSettingsTab) and waits for its target to mount before highlighting —
// Radix Tabs unmount the inactive tab's content, so the anchor doesn't exist
// until the tab is selected. The whole section lives on /settings; on any other
// page it's a no-op. The opening sidebar step, though, lives everywhere — so a
// tour can start elsewhere and this step still points the way here.
// Switches the Auto Sync page's Tabs (Auto-Refresh / Auto-Scan) to the tab
// identified by `tabTour`, then re-resolves the current step once its
// `selector` target has mounted. Same reasoning as switchLeadTab: these are
// Radix Tabs whose TabsContent unmounts when inactive, so a step whose anchor
// lives on the other tab has no element in the DOM until that tab's trigger is
// clicked.
const switchAutoSyncTab = (tabTour, selector) => (el, step, { driver } = {}) => {
  const trigger = document.querySelector(`[data-tour="${tabTour}"]`);
  const alreadyActive = trigger?.getAttribute("data-state") === "active";
  if (!alreadyActive) {
    activateRadixTrigger(trigger);
  }
  if (!driver || !selector) return;
  const present = document.querySelector(selector);
  if (alreadyActive && present) return;
  waitForElementThenRehighlight(driver, selector);
};

// Walks the Auto Sync page across its two tabs: Auto-Refresh (re-ingest
// existing sources on a schedule) → Auto-Scan (discover new URLs from a
// sitemap on a schedule, then ingest them automatically). Each on-page step
// switches to its tab on arrival (switchAutoSyncTab) and waits for the target
// to mount before highlighting. The sidebar step lives everywhere; the rest
// live on /auto-sync, so on any other route they are skipped rather than
// shown.
export const AUTO_SYNC_SECTION = [
  {
    element: '[data-tour="sidebar-auto-sync"]',
    popover: {
      title: "Keep your knowledge base fresh, automatically",
      description:
        "Auto Sync handles the two things you'd otherwise do by hand: re-checking existing sources for changes, and finding brand-new pages on your site. Set it once and forget it.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="auto-sync-refresh-jobs"]',
    // First on-page step: make sure we're on the Auto-Refresh tab (a deep link
    // can land on the other one), then highlight the jobs table.
    onHighlightStarted: switchAutoSyncTab(
      "auto-sync-tab-refresh",
      '[data-tour="auto-sync-refresh-jobs"]',
    ),
    popover: {
      title: "See your ongoing auto-refresh jobs",
      description:
        "Every source you've enrolled shows up here with its schedule and status — so you always know when it last re-checked for changes and when it runs next.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="auto-sync-tab-scan"]',
    onHighlightStarted: switchAutoSyncTab(
      "auto-sync-tab-scan",
      '[data-tour="auto-sync-tab-scan"]',
    ),
    popover: {
      title: "Or discover new pages automatically",
      description:
        "Switch to Auto-Scan to have ContextGPT watch a sitemap for you — new URLs get found and ingested on the schedule you choose, no manual re-adding required.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="auto-sync-add-sitemap"]',
    onHighlightStarted: switchAutoSyncTab(
      "auto-sync-tab-scan",
      '[data-tour="auto-sync-add-sitemap"]',
    ),
    popover: {
      title: "Add auto-scan jobs from here",
      description:
        "Point this at a sitemap and set how often to check it. That's the whole setup.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="auto-sync-scan-jobs"]',
    onHighlightStarted: switchAutoSyncTab(
      "auto-sync-tab-scan",
      '[data-tour="auto-sync-scan-jobs"]',
    ),
    popover: {
      title: "We'll take it from here",
      description:
        "Just add the sitemap — we'll automatically find new URLs on the schedule you set and update your knowledge base with them, no need to add each page yourself.",
      side: "top",
      align: "start",
    },
  },
];

export const SETTINGS_SECTION = [
  {
    element: '[data-tour="sidebar-settings"]',
    popover: {
      title: "Configure your chatbot here",
      description:
        "Everything about how your chatbot thinks, speaks and behaves is tucked into Settings. This is the room where you make it yours.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="settings-gpt-model"]',
    // First on-page step: make sure we're on the General tab (a deep link or a
    // previous visit can land on another one), then highlight the GPT model
    // picker. The guard returns early when the tab is already active and the
    // anchor is present, so on the normal path this fires no redundant
    // re-highlight.
    onHighlightStarted: switchSettingsTab(
      "settings-tab-general",
      '[data-tour="settings-gpt-model"]',
    ),
    popover: {
      title: "Choose your GPT model",
      description:
        "Pick the model that powers your chatbot's replies — and set which one it falls back to as your usage grows. Start here and everything downstream gets smarter.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="settings-chat-modes"]',
    onHighlightStarted: switchSettingsTab(
      "settings-tab-chat-modes",
      '[data-tour="settings-chat-modes"]',
    ),
    popover: {
      title: "Decide who opens the conversation",
      description:
        "Should your visitor speak first, or should the AI break the ice? We recommend letting the AI start — a warm hello converts far more 'just looking' visitors than a silent, waiting box.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="settings-localization-language"]',
    onHighlightStarted: switchSettingsTab(
      "settings-tab-localization",
      '[data-tour="settings-localization-language"]',
    ),
    popover: {
      title: "Speak your visitor's language",
      description:
        "Change the interface language your visitors see, right down to every button and label. Meet people where they are — it's the difference between a chatbot that feels foreign and one that feels like home.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="settings-personas"]',
    onHighlightStarted: switchSettingsTab(
      "settings-tab-personas",
      '[data-tour="settings-personas"]',
    ),
    popover: {
      title: "Give your chatbot a character",
      description:
        "Want it friendlier? More formal? Pick one of the built-in personas or craft your very own from scratch — this is where your chatbot's personality comes to life.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="settings-instructions"]',
    onHighlightStarted: switchSettingsTab(
      "settings-tab-instructions",
      '[data-tour="settings-instructions"]',
    ),
    popover: {
      title: "Set the rules it lives by",
      description:
        "Have a few things the chatbot should always (or never) do? Write your custom instructions here and it'll follow them in every conversation.",
      side: "top",
      align: "start",
    },
  },
];

// The tour's send-off, shown to every audience (base, trial, subscribed)
// after the last topic-specific leg. This step has no `element`, so driver.js
// centers the popover with no spotlight cutout — a plain closing card rather
// than a highlight of anything on the page. Lives on /dashboard, the same
// route the tour started from.
export const CLOSING_SECTION = [
  {
    popover: {
      title: "That was it!",
      description:
        'If you still can\'t find something, you can start the tour again any time. Still stuck? Reach us at <a href="mailto:support@contextgpt.in">support@contextgpt.in</a> or visit our <a href="https://context.in/contact" target="_blank" rel="noopener noreferrer">Contact Us page</a>.',
    },
  },
];



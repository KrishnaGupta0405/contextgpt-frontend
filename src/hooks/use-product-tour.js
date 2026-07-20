"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  buildTour,
  TOUR_LEGS,
  totalTourSteps,
  stepsBeforeLeg,
} from "@/lib/tours";

// Which tour a user should see is decided by the backend and arrives as
// user.tourContext — this file no longer re-derives subscription state, so
// there is exactly one implementation of that logic (tourState.util.js).
//
// Same-session guard only. The durable record lives in the DB (one column per
// audience on `users`), so clearing the browser or switching devices does not
// replay a tour. This key just prevents a second trigger before the POST lands,
// and is scoped per tour + tier — a single shared key would latch out the trial
// tour in the same session the base tour finished, and would block the replay
// a plan upgrade is supposed to trigger.
const tourStorageKey = (tourKey, tier) =>
  `contextgpt_tour_seen:${tourKey}:${tier ?? "none"}`;

// Bridges the two legs of a tour across a route change. The dashboard leg
// writes the tour key here and navigates; the installation page reads it on
// mount, runs the second leg, and clears it.
//
// sessionStorage, not localStorage: a handoff that never lands (the user closes
// the tab mid-navigation) must not resurrect the installation leg days later in
// an unrelated session. It is scoped to the tab and dies with it.
const TOUR_RESUME_KEY = "contextgpt_tour_resume";

export function useProductTour() {
  const { user, subscription } = useAuth();
  const router = useRouter();
  const tourContext = user?.tourContext;
  const pendingTourKey = tourContext?.pendingTourKey ?? null;
  const tier = tourContext?.tier ?? null;

  /**
   * startTour(tourKey?, { steps?, record?, tier?, leg? })
   *
   * `record: false` is for the sidebar's manual "Take a Tour" — replaying
   * voluntarily must not consume the pending-tour slot, or a user who reviews
   * the base tour would silently lose the trial tour they had not seen yet.
   *
   * `tier` overrides the real tier for step-building only, so the dev picker
   * can preview a tier the account is not actually on. It deliberately does NOT
   * feed the localStorage latch below — that stays keyed to the user's true
   * tier, so previewing "Subscribed - scale" cannot latch out a real pending
   * tour. Combined with record:false the preview is fully side-effect free.
   */
  const startTour = useCallback(
    (
      tourKey = pendingTourKey ?? "base",
      { steps, record = true, tier: tierOverride, leg = 0 } = {},
    ) => {
      const buildOpts = { subscription, tier: tierOverride ?? tier };

      // Set when a handoff step navigates away, so onDestroyed below can tell
      // "the user finished the tour" from "this leg ended and the next is about
      // to run". Without it the teardown that precedes the route change would
      // record completion while later legs are still unseen.
      let handingOff = false;

      // Each leg ends with a handoff into the next, so the tour walks
      // dashboard → installation → SDK across three driver instances. `leg` is
      // the number of legs already finished, so TOUR_LEGS[leg] is the one to
      // bridge into; past the end there is none and the tour simply ends.
      //
      // `steps` is how resumeTour supplies a later leg's list — leg 0 is the
      // only one this hook can build on its own, since the rest live on pages
      // it does not know about.
      const nextLeg = TOUR_LEGS[leg];
      const legSteps = steps ?? (leg === 0 ? buildTour(tourKey, buildOpts) : []);
      const resolvedSteps = !nextLeg
        ? legSteps
        : legSteps.concat({
            ...nextLeg.handoff,
            popover: {
              ...nextLeg.handoff.popover,
              nextBtnText: "Continue",
              onNextClick: () => {
                handingOff = true;
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(
                    TOUR_RESUME_KEY,
                    JSON.stringify({ tourKey, record, leg }),
                  );
                }
                driverObj.destroy();
                router.push(nextLeg.route);
              },
            },
          });

      // driver.js only knows the leg it is running, so its built-in counter
      // would restart at each page. Offsetting by the steps already shown keeps
      // one continuous "X of Y" across the whole tour.
      //
      // The number is baked into each step's own progressText rather than
      // patched onto the popover in a hook: driver.js creates the popover node
      // once and re-renders its contents in place, so onPopoverRender fires only
      // for the first step and the count would freeze there for the rest of the
      // leg. A per-step string is substituted on every transition.
      const offset = stepsBeforeLeg(leg, tourKey, buildOpts);
      const total = totalTourSteps(tourKey, buildOpts);

      // Two escapes, rendered in different places because they mean different
      // things.
      //
      // "Skip" (footer) leaves this leg but keeps the tour alive: the handoff is
      // the last step of the leg and already owns the navigation, so jumping to
      // it is the whole implementation — no duplicated routing, and a leg with
      // no handoff (the final one) simply has nothing to skip to, which is why
      // the button is omitted there rather than made a second way to end.
      //
      // The × (top corner) is the unconditional exit — the conventional place
      // users look to dismiss an overlay, which is why it is not a footer button
      // sitting next to "Skip" where the two would be easy to confuse. It leaves
      // `handingOff` false so onDestroyed records completion: a user who
      // deliberately dismisses has been offered the tour and should not get it
      // again on the next login.
      //
      // driver.js's own × is unavailable here — it is bound to allowClose, which
      // is off so that stray overlay clicks cannot end the tour. This one is our
      // own node, so dismissing stays deliberate while the affordance returns.
      const renderExtraButtons = (popover, isHandoffStep) => {
        if (nextLeg && !isHandoffStep) {
          const skip = document.createElement("button");
          skip.type = "button";
          skip.textContent = "Skip";
          skip.className = "contextgpt-driver-skip";
          skip.addEventListener("click", () =>
            driverObj.moveTo(resolvedSteps.length - 1),
          );
          popover.footerButtons.prepend(skip);
        }

        // The wrapper node survives across steps (driver.js re-renders its
        // contents in place), so appending unconditionally would stack a new ×
        // on every transition. The footer is rebuilt each render, which is why
        // only this one needs the guard.
        if (!popover.wrapper.querySelector(".contextgpt-driver-close")) {
          const close = document.createElement("button");
          close.type = "button";
          close.textContent = "×";
          close.className = "contextgpt-driver-close";
          close.setAttribute("aria-label", "Close tour");
          close.addEventListener("click", () => driverObj.destroy());
          popover.wrapper.appendChild(close);
        }
      };

      const numberedSteps = resolvedSteps.map((step, i, all) => ({
        ...step,
        popover: {
          ...step.popover,
          progressText: `${offset + i + 1} of ${total}`,
          showButtons: ["previous", "next"],
          // The handoff step is the skip target, so offering "Skip" on it would
          // be a no-op button pointing at itself.
          onPopoverRender: (popover) =>
            renderExtraButtons(popover, nextLeg && i === all.length - 1),
        },
      }));

      const driverObj = driver({
        showProgress: true,
        allowClose: false,
        overlayColor: "rgba(0,0,0,0.55)",
        popoverClass: "contextgpt-driver-popover",
        steps: numberedSteps,
        onDestroyed: () => {
          if (!record || handingOff) return;
          localStorage.setItem(tourStorageKey(tourKey, tier), "true");
          // Fire-and-forget: failing to record completion should never surface
          // an error to someone who just finished the tour. Worst case it
          // replays on the next visit.
          api.post("/onboarding/tour-complete", { tourKey }).catch(() => {});
        },
      });

      driverObj.drive();
      return driverObj;
    },
    [pendingTourKey, subscription, tier, router],
  );

  /**
   * resumeTour(legIndex) — each leg's page calls this on mount.
   *
   * Returns the driver instance if a handoff into this leg was pending, null
   * otherwise. The marker names the leg that was *left*, so the leg resuming
   * here is the one after it; a mismatch means the marker belongs to a
   * different page and is left alone for that page to consume.
   *
   * The marker is cleared before the tour runs, not after, so a refresh mid-leg
   * does not replay it. `record` rides along in it so a voluntary replay (Take
   * a Tour) still finishes without consuming the pending slot.
   */
  const resumeTour = useCallback(
    (legIndex) => {
      if (typeof window === "undefined") return null;
      const raw = sessionStorage.getItem(TOUR_RESUME_KEY);
      if (!raw) return null;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        sessionStorage.removeItem(TOUR_RESUME_KEY);
        return null;
      }

      // The marker records the leg that wrote it: the dashboard writes 0, and
      // TOUR_LEGS[i] writes i + 1. So the page for TOUR_LEGS[legIndex] resumes
      // on a marker of exactly legIndex. Anything else belongs to another page
      // — leave it for whichever page it addresses.
      if (parsed.leg !== legIndex) return null;
      sessionStorage.removeItem(TOUR_RESUME_KEY);

      return startTour(parsed.tourKey, {
        steps: TOUR_LEGS[legIndex].steps,
        record: parsed.record,
        leg: legIndex + 1,
      });
    },
    [startTour],
  );

  // The server already accounts for what has been seen, including whether a
  // tier upgrade earns a replay — so a non-null pendingTourKey IS the answer.
  // The localStorage check only covers the gap before the POST lands.
  const pendingTour = useCallback(() => {
    if (!pendingTourKey) return null;
    if (typeof window === "undefined") return null;
    if (localStorage.getItem(tourStorageKey(pendingTourKey, tier)) === "true") {
      return null;
    }
    return pendingTourKey;
  }, [pendingTourKey, tier]);

  const resetTour = useCallback(
    (tourKey = pendingTourKey ?? "base") => {
      localStorage.removeItem(tourStorageKey(tourKey, tier));
    },
    [pendingTourKey, tier],
  );

  return { startTour, resumeTour, pendingTour, resetTour };
}

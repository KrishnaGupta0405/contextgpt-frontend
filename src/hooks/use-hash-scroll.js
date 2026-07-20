"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the element matching the current URL hash.
 *
 * Call this on any page that renders `id` anchors you want deep-linkable from
 * the Ctrl+K search palette. Add `scroll-mt-20` to the anchored elements to
 * leave room for the sticky header — `scrollIntoView` has no offset argument.
 *
 * Pairs with useScrollRestoration, which bails out when a hash is present.
 *
 * Deliberately avoids useSearchParams so callers don't need a Suspense
 * boundary; the hashchange listener below covers same-page anchor jumps.
 */
export function useHashScroll({ enabled = true } = {}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let rafId;
    let timeoutId;

    const scrollToHash = () => {
      const hash = window.location.hash?.slice(1);
      if (!hash) return;

      // Target may not exist on first paint (conditional tabs, async data),
      // so retry for ~2s before giving up.
      const attempt = (tries = 0) => {
        if (cancelled) return;

        const el = document.getElementById(hash);
        if (el) {
          // scrollIntoView walks up to whichever ancestor actually scrolls.
          // Manual window.scrollTo math breaks on pages that nest their
          // content in an overflow-y-auto container (e.g. sdk-advanced).
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (tries < 20) {
          timeoutId = setTimeout(() => attempt(tries + 1), 100);
        }
      };

      // Two frames: let the route's content commit and lay out first.
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => attempt());
      });
    };

    scrollToHash();

    // Anchor-to-anchor jumps on the same page change neither pathname nor
    // searchParams, so the effect alone would not re-run.
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname, enabled]);
}

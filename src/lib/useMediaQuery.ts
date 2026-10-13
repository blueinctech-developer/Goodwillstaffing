"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query. The server and first client render use
 * `serverValue`, which keeps hydration consistent; the real value applies
 * right after hydration.
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

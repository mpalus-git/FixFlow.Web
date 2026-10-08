import { useEffect } from "react";
import { navItemsFor } from "@/app/layout/navItems";
import { navigationPages } from "@/app/navigationPages";
import type { Role } from "@/shared/session/currentUser";

export const preloadFallbackDelayMs = 2000;

function preloadPagesFor(role: Role) {
  for (const { page } of navItemsFor(role)) {
    navigationPages[page]().catch(() => undefined);
  }
}

export function usePreloadNavigationPages(role: Role | undefined) {
  useEffect(() => {
    if (role === undefined) {
      return undefined;
    }
    if ("requestIdleCallback" in globalThis) {
      const handle = requestIdleCallback(() => {
        preloadPagesFor(role);
      });
      return () => {
        cancelIdleCallback(handle);
      };
    }
    const handle = setTimeout(() => {
      preloadPagesFor(role);
    }, preloadFallbackDelayMs);
    return () => {
      clearTimeout(handle);
    };
  }, [role]);
}

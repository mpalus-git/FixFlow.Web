import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export function useFocusPageHeading() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    const heading = document.querySelector<HTMLElement>("#main-content h1[tabindex]");
    const target = heading ?? document.getElementById("main-content");
    target?.focus({ preventScroll: true });
  }, [pathname]);
}

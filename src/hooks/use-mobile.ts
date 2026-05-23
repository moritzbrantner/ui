import * as React from "react";

export const MOBILE_BREAKPOINT = 768;

function getMobileSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth < MOBILE_BREAKPOINT;
}

function subscribeToMobileChanges(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();

  const mql =
    typeof window.matchMedia === "function"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      : null;

  mql?.addEventListener("change", handleChange);
  window.addEventListener("resize", handleChange);

  return () => {
    mql?.removeEventListener("change", handleChange);
    window.removeEventListener("resize", handleChange);
  };
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribeToMobileChanges, getMobileSnapshot, () => false);
}

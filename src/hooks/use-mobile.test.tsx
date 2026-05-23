import { render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { MOBILE_BREAKPOINT, useIsMobile } from "./use-mobile";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: width < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function MobileProbe() {
  const isMobile = useIsMobile();

  return <div data-testid="mobile-probe">{isMobile ? "mobile" : "desktop"}</div>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  test("uses the shared 768px breakpoint", () => {
    setViewportWidth(MOBILE_BREAKPOINT - 1);

    render(<MobileProbe />);

    expect(screen.getByTestId("mobile-probe").textContent).toBe("mobile");
  });

  test("updates when the viewport is resized", async () => {
    setViewportWidth(1024);

    render(<MobileProbe />);

    expect(screen.getByTestId("mobile-probe").textContent).toBe("desktop");

    setViewportWidth(390);
    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      expect(screen.getByTestId("mobile-probe").textContent).toBe("mobile");
    });
  });
});

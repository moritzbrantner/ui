import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import { ResponsiveActionMenu } from "./responsive-action-menu";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  mockViewport(1024);
});

function mockViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: width < 768,
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

function openMenu(trigger: HTMLElement) {
  trigger.focus();
  fireEvent.keyDown(trigger, { code: "Enter", key: "Enter" });
}

describe("ResponsiveActionMenu", () => {
  test("mode desktop renders an ActionMenu and forwards desktop props", async () => {
    render(
      <ResponsiveActionMenu
        mode="desktop"
        trigger={<button type="button">Open actions</button>}
        label="Row actions"
        items={[{ id: "copy", label: "Copy" }]}
        desktopProps={{ contentProps: { "data-testid": "desktop-content" } }}
      />,
    );

    openMenu(screen.getByRole("button", { name: "Open actions" }));

    expect(await screen.findByRole("menu")).toBeTruthy();
    expect(screen.getByTestId("desktop-content")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeTruthy();
  });

  test("mode mobile renders an ActionSheet and forwards mobile props", async () => {
    render(
      <ResponsiveActionMenu
        mode="mobile"
        trigger={<Button>Open actions</Button>}
        title="Actions"
        items={[{ id: "copy", label: "Copy" }]}
        mobileProps={{ contentProps: { "data-testid": "mobile-content" } }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open actions" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByTestId("mobile-content")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeTruthy();
  });

  test("auto mode uses the existing mobile breakpoint", async () => {
    mockViewport(390);

    render(
      <ResponsiveActionMenu
        mode="auto"
        trigger={<Button>Open actions</Button>}
        title="Actions"
        items={[{ id: "copy", label: "Copy" }]}
      />,
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Open actions" }));
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });

  test("shared handlers fire in desktop and mobile modes", async () => {
    const desktopSelect = vi.fn();
    const mobileSelect = vi.fn();

    render(
      <>
        <ResponsiveActionMenu
          mode="desktop"
          trigger={<button type="button">Open desktop</button>}
          items={[{ id: "copy", label: "Copy desktop" }]}
          onItemSelect={desktopSelect}
        />
        <ResponsiveActionMenu
          mode="mobile"
          trigger={<Button>Open mobile</Button>}
          items={[{ id: "copy", label: "Copy mobile" }]}
          onItemSelect={mobileSelect}
        />
      </>,
    );

    openMenu(screen.getByRole("button", { name: "Open desktop" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Copy desktop" }));
    fireEvent.click(screen.getByRole("button", { name: "Open mobile" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Copy mobile" }));

    expect(desktopSelect).toHaveBeenCalledWith("copy", expect.objectContaining({ id: "copy" }));
    expect(mobileSelect).toHaveBeenCalledWith("copy", expect.objectContaining({ id: "copy" }));
  });
});

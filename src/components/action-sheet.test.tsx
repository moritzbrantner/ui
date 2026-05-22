import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { ActionSheet } from "./action-sheet";
import { Button } from "./button";

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
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("ActionSheet", () => {
  test("opens from trigger and renders accessible dialog title and description", async () => {
    render(
      <ActionSheet
        trigger={<Button>Open sheet</Button>}
        title="Actions"
        description="Choose an action."
        items={[{ id: "copy", label: "Copy" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Actions")).toBeTruthy();
    expect(screen.getByText("Choose an action.")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeTruthy();
  });

  test("closes command items by default and keeps closeOnSelect false items open", async () => {
    const onItemSelect = vi.fn();

    render(
      <ActionSheet
        trigger={<Button>Open sheet</Button>}
        title="Actions"
        onItemSelect={onItemSelect}
        items={[
          { id: "pin", label: "Pin", closeOnSelect: false },
          { id: "archive", label: "Archive" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Pin" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: "Archive" }));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="action-sheet-content"]')?.getAttribute("data-state"),
      ).toBe("closed");
    });
    expect(onItemSelect).toHaveBeenCalledWith("pin", expect.objectContaining({ id: "pin" }));
    expect(onItemSelect).toHaveBeenCalledWith(
      "archive",
      expect.objectContaining({ id: "archive" }),
    );
  });

  test("sheet-level closeOnSelect false keeps commands open unless item overrides", async () => {
    render(
      <ActionSheet
        trigger={<Button>Open sheet</Button>}
        title="Actions"
        closeOnSelect={false}
        items={[
          { id: "copy", label: "Copy" },
          { id: "done", label: "Done", closeOnSelect: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Copy" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: "Done" }));
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="action-sheet-content"]')?.getAttribute("data-state"),
      ).toBe("closed");
    });
  });

  test("checkbox and radio items keep the sheet open and call change handlers", async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <ActionSheet
        trigger={<Button>Open sheet</Button>}
        items={[
          {
            id: "visible",
            type: "checkbox",
            label: "Visible",
            checked: false,
            onCheckedChange,
          },
          {
            id: "density",
            type: "radio-group",
            value: "cozy",
            options: [
              { id: "cozy", label: "Cozy", value: "cozy" },
              { id: "compact", label: "Compact", value: "compact" },
            ],
            onValueChange,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Visible" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      "visible",
      expect.objectContaining({ id: "visible" }),
    );
    expect(onValueChange).toHaveBeenCalledWith(
      "compact",
      "density",
      expect.objectContaining({ id: "density" }),
    );
  });

  test("forwards direction, content props, body props, and empty state", async () => {
    render(
      <ActionSheet
        defaultOpen
        direction="right"
        title="More"
        items={[]}
        emptyMessage="No sheet actions"
        contentProps={{ className: "content-contract", "data-testid": "sheet-content" }}
        bodyProps={{ className: "body-contract", "data-testid": "sheet-body" }}
      />,
    );

    const content = await screen.findByTestId("sheet-content");
    const body = screen.getByTestId("sheet-body");

    expect(content.className).toContain("content-contract");
    expect(content.getAttribute("data-vaul-drawer-direction")).toBe("right");
    expect(body.className).toContain("body-contract");
    expect(screen.getByText("No sheet actions")).toBeTruthy();
  });
});

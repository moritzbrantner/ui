import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import { ContextActionMenu } from "./context-action-menu";

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
});

describe("ContextActionMenu", () => {
  test("opens on context menu and calls select handlers", async () => {
    const onItemSelect = vi.fn();

    render(
      <ContextActionMenu
        items={[{ id: "duplicate", label: "Duplicate" }]}
        onItemSelect={onItemSelect}
      >
        <Button>Row one</Button>
      </ContextActionMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Row one" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

    expect(onItemSelect).toHaveBeenCalledWith(
      "duplicate",
      expect.objectContaining({ id: "duplicate" }),
    );
  });

  test("does not call disabled command handlers", async () => {
    const onItemSelect = vi.fn();
    const onSelect = vi.fn();

    render(
      <ContextActionMenu
        items={[{ id: "disabled", label: "Disabled", disabled: true, onSelect }]}
        onItemSelect={onItemSelect}
      >
        <Button>Row one</Button>
      </ContextActionMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Row one" }));
    fireEvent.click(await screen.findByText("Disabled"));

    expect(onSelect).not.toHaveBeenCalled();
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  test("supports checkbox and radio interactions", async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <ContextActionMenu
        items={[
          {
            id: "starred",
            type: "checkbox",
            label: "Starred",
            checked: false,
            onCheckedChange,
          },
          {
            id: "priority",
            type: "radio-group",
            value: "low",
            options: [
              { id: "low", label: "Low", value: "low" },
              { id: "high", label: "High", value: "high" },
            ],
            onValueChange,
          },
        ]}
      >
        <Button>Row one</Button>
      </ContextActionMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Row one" }));
    fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Starred" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "High" }));

    expect(onCheckedChange).toHaveBeenCalledWith(
      true,
      "starred",
      expect.objectContaining({ id: "starred" }),
    );
    expect(onValueChange).toHaveBeenCalledWith(
      "high",
      "priority",
      expect.objectContaining({ id: "priority" }),
    );
  });

  test("forwards content props and renders empty state", async () => {
    render(
      <ContextActionMenu
        items={[]}
        emptyMessage="No row actions"
        contentProps={{ className: "contract-class", "data-testid": "context-content" }}
      >
        <Button>Row one</Button>
      </ContextActionMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Row one" }));
    const content = await screen.findByTestId("context-content");

    expect(content.className).toContain("contract-class");
    expect(content.getAttribute("data-slot")).toBe("context-action-menu-content");
    expect(screen.getByText("No row actions")).toBeTruthy();
  });
});

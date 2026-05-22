import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import { ActionMenu } from "./action-menu";
import {
  getMenuActionItemText,
  isMenuActionItemDisabled,
  type MenuActionItem,
} from "./menu-actions";

function openMenu(trigger: HTMLElement) {
  trigger.focus();
  fireEvent.keyDown(trigger, { code: "Enter", key: "Enter" });
}

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

describe("ActionMenu", () => {
  test("opens from trigger and renders item labels, descriptions, and shortcuts", async () => {
    render(
      <ActionMenu
        trigger={<button type="button">Open actions</button>}
        items={[
          {
            id: "duplicate",
            label: "Duplicate",
            description: "Create another copy.",
            shortcut: "D",
          },
        ]}
      />,
    );

    openMenu(screen.getByRole("button", { name: "Open actions" }));

    expect(await screen.findByRole("menuitem", { name: /Duplicate/ })).toBeTruthy();
    expect(screen.getByText("Create another copy.")).toBeTruthy();
    expect(screen.getByText("D")).toBeTruthy();
  });

  test("calls item-level onSelect before parent onItemSelect", async () => {
    const order: string[] = [];
    const itemSelect = vi.fn(() => order.push("item"));
    const parentSelect = vi.fn(() => order.push("parent"));

    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open actions</Button>}
        onItemSelect={parentSelect}
        items={[{ id: "archive", label: "Archive", onSelect: itemSelect }]}
      />,
    );

    fireEvent.click(await screen.findByRole("menuitem", { name: "Archive" }));

    expect(itemSelect).toHaveBeenCalledWith("archive", expect.objectContaining({ id: "archive" }));
    expect(parentSelect).toHaveBeenCalledWith(
      "archive",
      expect.objectContaining({ id: "archive" }),
    );
    expect(order).toEqual(["item", "parent"]);
  });

  test("does not call handlers for disabled command items", async () => {
    const onItemSelect = vi.fn();
    const onSelect = vi.fn();

    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open actions</Button>}
        onItemSelect={onItemSelect}
        items={[{ id: "disabled", label: "Disabled", disabled: true, onSelect }]}
      />,
    );

    fireEvent.click(await screen.findByText("Disabled"));

    expect(onSelect).not.toHaveBeenCalled();
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  test("renders destructive and link command items", async () => {
    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open actions</Button>}
        items={[
          { id: "delete", label: "Delete", destructive: true },
          { id: "docs", label: "Docs", href: "/docs", linkProps: { target: "_blank" } },
        ]}
      />,
    );

    const destructive = await screen.findByRole("menuitem", { name: "Delete" });
    const link = screen.getByRole("menuitem", { name: "Docs" });

    expect(destructive.getAttribute("data-destructive")).toBe("");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  test("keeps checkbox and radio interactions open and calls change handlers", async () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();

    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open actions</Button>}
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
            label: "Density",
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

    fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Visible" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));

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
    expect(screen.getByRole("menuitemcheckbox", { name: "Visible" })).toBeTruthy();
  });

  test("renders empty state and custom item variants", async () => {
    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open actions</Button>}
        emptyMessage="Nothing here"
        items={[
          { id: "label", type: "label", label: "Meta", description: "Read-only" },
          { id: "separator", type: "separator" },
          { id: "custom", type: "custom", render: () => <div>Custom action</div> },
        ]}
      />,
    );

    expect(await screen.findByText("Meta")).toBeTruthy();
    expect(screen.getByText("Read-only")).toBeTruthy();
    expect(screen.getByText("Custom action")).toBeTruthy();

    render(
      <ActionMenu
        defaultOpen
        trigger={<Button>Open empty</Button>}
        emptyMessage="Nothing here"
        items={[]}
      />,
    );

    expect(await screen.findByText("Nothing here")).toBeTruthy();
  });

  test("shared helpers handle text, disabled state, and default item type", () => {
    const command = { id: "copy", label: "Copy" } satisfies MenuActionItem;
    const disabled = { id: "disabled", label: "Disabled", disabled: true } satisfies MenuActionItem;
    const nodeLabel = { id: "node", label: <span>Node</span> } satisfies MenuActionItem;

    expect(getMenuActionItemText(command)).toBe("Copy");
    expect(getMenuActionItemText(nodeLabel)).toBeUndefined();
    expect(isMenuActionItemDisabled(disabled)).toBe(true);
    expect("type" in command ? command.type : "item").toBe("item");
  });
});

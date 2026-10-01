import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import {
  EditorSelectionSummary,
  EditorWorkbench,
  createEditorCommandPaletteGroups,
  createEditorShortcutGroups,
  matchesEditorShortcut,
} from "./editor-workbench";

describe("editor workbench pattern", () => {
  test("groups one command model for palette and shortcut help", () => {
    const commands = [
      {
        id: "undo",
        label: "Undo",
        groupId: "edit",
        groupLabel: "Edit",
        shortcut: "Mod+Z",
        onSelect: vi.fn(),
      },
      {
        id: "delete",
        label: "Delete selection",
        groupId: "edit",
        groupLabel: "Edit",
      },
    ];

    expect(createEditorCommandPaletteGroups(commands)).toMatchObject([
      { id: "edit", label: "Edit", actions: [{ id: "undo" }, { id: "delete" }] },
    ]);
    expect(createEditorShortcutGroups(commands)).toMatchObject([
      { id: "edit", label: "Edit", shortcuts: [{ id: "undo", shortcut: "Mod+Z" }] },
    ]);
  });

  test("matches portable Mod shortcuts on either platform modifier", () => {
    expect(
      matchesEditorShortcut(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }), "Mod+K"),
    ).toBe(true);
    expect(
      matchesEditorShortcut(new KeyboardEvent("keydown", { key: "k", metaKey: true }), "Mod+K"),
    ).toBe(true);
  });

  test("matches explicit platform modifiers without treating them as Mod", () => {
    expect(
      matchesEditorShortcut(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }), "Ctrl+Z"),
    ).toBe(true);
    expect(
      matchesEditorShortcut(new KeyboardEvent("keydown", { key: "z", metaKey: true }), "Meta+Z"),
    ).toBe(true);
    expect(
      matchesEditorShortcut(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }), "Meta+Z"),
    ).toBe(false);
    expect(
      matchesEditorShortcut(
        new KeyboardEvent("keydown", { key: "z", ctrlKey: true, metaKey: true }),
        "Ctrl+Z",
      ),
    ).toBe(false);
    expect(matchesEditorShortcut(new KeyboardEvent("keydown", { key: "z" }), "Unknown+Z")).toBe(
      false,
    );
  });

  test("selection summary is an accessible live status", () => {
    render(<EditorSelectionSummary>3 nodes selected</EditorSelectionSummary>);

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("3 nodes selected");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  test("only the focused workbench owns its command shortcuts", async () => {
    const user = userEvent.setup();
    const first = vi.fn();
    const second = vi.fn();
    render(
      <>
        <EditorWorkbench
          commands={[{ id: "reset", label: "Reset", shortcut: "R", onSelect: first }]}
        >
          <button type="button">First viewport</button>
        </EditorWorkbench>
        <EditorWorkbench
          commands={[{ id: "reset", label: "Reset", shortcut: "R", onSelect: second }]}
        >
          <button type="button">Second viewport</button>
        </EditorWorkbench>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Second viewport" }));
    await user.keyboard("r");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("preserves native text and selection editing instead of running bare command keys", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <EditorWorkbench commands={[{ id: "reset", label: "Reset", shortcut: "R", onSelect }]}>
        <input aria-label="Object name" />
        <select aria-label="Placement">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </EditorWorkbench>,
    );
    const name = screen.getByRole("textbox", { name: "Object name" });
    await user.click(name);
    await user.keyboard("r");
    expect(name).toHaveProperty("value", "r");
    await user.click(screen.getByRole("combobox", { name: "Placement" }));
    await user.keyboard("r");
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("keeps command palette authority with the consuming app", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <EditorWorkbench commandPaletteOpen={false} onCommandPaletteOpenChange={onOpenChange}>
        <button type="button">Preview</button>
      </EditorWorkbench>,
    );
    await user.click(screen.getByRole("button", { name: "Preview" }));
    await user.keyboard("{Control>}k{/Control}");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

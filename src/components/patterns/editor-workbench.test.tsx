import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  EditorInspectorPanel,
  EditorSelectionSummary,
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
      matchesEditorShortcut(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
        "Mod+K",
      ),
    ).toBe(true);
    expect(
      matchesEditorShortcut(
        new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        "Mod+K",
      ),
    ).toBe(true);
  });

  test("selection summary is an accessible live status", () => {
    render(<EditorSelectionSummary>3 nodes selected</EditorSelectionSummary>);

    const status = screen.getByRole("status");
    expect(status.textContent).toBe("3 nodes selected");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  test("inspector exposes a named complementary surface", () => {
    render(
      <EditorInspectorPanel title="Properties" description="Selection properties">
        <button type="button">Reset</button>
      </EditorInspectorPanel>,
    );

    const inspector = screen.getByRole("complementary", { name: "Properties" });
    expect(inspector.getAttribute("data-slot")).toBe("editor-inspector");
    expect(screen.getByRole("button", { name: "Reset" }).textContent).toBe("Reset");
  });
});

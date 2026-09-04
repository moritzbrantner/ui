import { fireEvent, render, screen } from "@testing-library/react";
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

    expect(screen.getByRole("status")).toHaveTextContent("3 nodes selected");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  test("inspector exposes a named complementary surface", () => {
    render(
      <EditorInspectorPanel title="Properties" description="Selection properties">
        <button type="button">Reset</button>
      </EditorInspectorPanel>,
    );

    expect(screen.getByRole("complementary", { name: "Properties" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  });
});

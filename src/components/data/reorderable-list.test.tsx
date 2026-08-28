import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ReorderableItem, ReorderableList, ReorderHandle } from "./resource-list";

describe("reorderable list", () => {
  test("renders a list with focusable reorder handles", () => {
    render(
      <ReorderableList aria-label="Priorities" onReorder={vi.fn()}>
        <ReorderableItem id="alpha" index={0}>
          <div>Alpha</div>
          <ReorderHandle aria-label="Move Alpha" />
        </ReorderableItem>
        <ReorderableItem id="beta" index={1}>
          <div>Beta</div>
          <ReorderHandle aria-label="Move Beta" />
        </ReorderableItem>
      </ReorderableList>,
    );

    expect(screen.getByRole("list", { name: "Priorities" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Move Alpha" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Move Beta" })).toBeTruthy();
  });

  test("disables the handle for non-reorderable items", () => {
    render(
      <ReorderableList>
        <ReorderableItem id="locked" index={0} disabled>
          <span>Locked</span>
          <ReorderHandle />
        </ReorderableItem>
      </ReorderableList>,
    );

    const handle = screen.getByRole("button", { name: "Reorder item" });
    expect((handle as HTMLButtonElement).disabled).toBe(true);
  });

  test("requires handles to stay inside reorderable items", () => {
    expect(() => render(<ReorderHandle />)).toThrow(
      "ReorderHandle must be rendered inside ReorderableItem.",
    );
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  EditorToolbar,
  EditorToolbarButton,
  EditorToolbarGroup,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarSeparator,
} from "../../index";

function TestToolbar(props: Partial<React.ComponentProps<typeof EditorToolbar>>) {
  return (
    <EditorToolbar aria-label="Graph commands" {...props}>
      <EditorToolbarGroup aria-label="History">
        <EditorToolbarButton label="Undo" shortcut="Mod+Z" icon={<span aria-hidden>U</span>} />
        <EditorToolbarButton label="Redo" disabled icon={<span aria-hidden>R</span>} />
        <EditorToolbarButton label="Delete" icon={<span aria-hidden>D</span>} />
      </EditorToolbarGroup>
      <ToolbarSeparator />
      <input aria-label="Zoom" defaultValue="100%" />
      <EditorToolbarButton label="Fit view" showLabel />
    </EditorToolbar>
  );
}

describe("EditorToolbar", () => {
  test("exposes one tab stop and moves focus with arrows, Home and End", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <TestToolbar />
        <button type="button">After</button>
      </>,
    );
    const toolbar = screen.getByRole("toolbar", { name: "Graph commands" });
    expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
    expect(toolbar.getAttribute("data-slot")).toBe("editor-toolbar");

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Delete" }).tabIndex).toBe(-1);

    // The disabled Redo command is skipped.
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete" }));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fit view" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fit view" }));

    // Tab leaves the toolbar, and returning lands on the last active item.
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fit view" }));
  });

  test("keeps caret keys inside text inputs", async () => {
    const user = userEvent.setup();
    render(<TestToolbar />);
    const zoom = screen.getByRole("textbox", { name: "Zoom" });
    await user.click(zoom);
    await user.keyboard("{ArrowLeft}{Home}");
    expect(document.activeElement).toBe(zoom);
    expect(screen.getByRole("button", { name: "Undo" }).tabIndex).toBe(-1);
    expect(zoom.tabIndex).toBe(0);
  });

  test("stops at the ends without loop and uses vertical arrows when vertical", async () => {
    const user = userEvent.setup();
    render(<TestToolbar loop={false} orientation="vertical" />);
    const undo = screen.getByRole("button", { name: "Undo" });
    undo.focus();
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(undo);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(undo);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete" }));
  });

  test("treats a self-managed toggle group as one stop that keeps its own arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <EditorToolbar aria-label="Tools">
        <EditorToolbarButton label="Undo" />
        <ToggleGroup type="single" aria-label="Tool" defaultValue="select">
          <ToggleGroupItem value="select" aria-label="Select tool">
            S
          </ToggleGroupItem>
          <ToggleGroupItem value="pan" aria-label="Pan tool">
            P
          </ToggleGroupItem>
        </ToggleGroup>
        <EditorToolbarButton label="Delete" />
      </EditorToolbar>,
    );
    screen.getByRole("button", { name: "Undo" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Select tool" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Pan tool" }));
    expect(
      screen.getByRole("radio", { name: "Select tool" }).hasAttribute("data-editor-toolbar-item"),
    ).toBe(false);
  });

  test("joins toggle group items without their own roving focus to the toolbar sequence", async () => {
    const user = userEvent.setup();
    render(
      <EditorToolbar aria-label="Tools">
        <EditorToolbarButton label="Undo" />
        <ToggleGroup type="single" aria-label="Tool" defaultValue="select" rovingFocus={false}>
          <ToggleGroupItem value="select" aria-label="Select tool">
            S
          </ToggleGroupItem>
          <ToggleGroupItem value="pan" aria-label="Pan tool">
            P
          </ToggleGroupItem>
        </ToggleGroup>
        <EditorToolbarButton label="Delete" />
      </EditorToolbar>,
    );
    screen.getByRole("button", { name: "Undo" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Select tool" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "Pan tool" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("radio", { name: "Select tool" }).tabIndex).toBe(-1);
  });

  test("picks up commands added after mount", async () => {
    const user = userEvent.setup();
    function Dynamic() {
      const [extra, setExtra] = React.useState(false);
      return (
        <EditorToolbar aria-label="Dynamic">
          <EditorToolbarButton label="Add" showLabel onClick={() => setExtra(true)} />
          {extra ? <EditorToolbarButton label="Remove" showLabel /> : null}
        </EditorToolbar>
      );
    }
    render(<Dynamic />);
    await user.click(screen.getByRole("button", { name: "Add" }));
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(remove.tabIndex).toBe(-1);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(remove);
  });
});

describe("EditorToolbarButton", () => {
  test("names icon-only commands, exposes toggle state and follows toolbar density", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <EditorToolbar aria-label="View" density="compact">
        <EditorToolbarButton label="Snap to grid" pressed onClick={onClick} icon={<svg />} />
        <EditorToolbarButton label="Minimap" pressed={false} icon={<svg />} />
      </EditorToolbar>,
    );
    const snap = screen.getByRole("button", { name: "Snap to grid" });
    expect(snap.getAttribute("aria-pressed")).toBe("true");
    expect(snap.getAttribute("data-state")).toBe("on");
    expect(snap.className).toContain("--ui-button-height-sm");
    expect(screen.getByRole("button", { name: "Minimap" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    await user.click(snap);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("shows the label and shortcut in a tooltip", async () => {
    const user = userEvent.setup();
    render(
      <EditorToolbar aria-label="History">
        <EditorToolbarButton label="Undo" shortcut="Mod+Z" icon={<svg />} />
      </EditorToolbar>,
    );
    await user.hover(screen.getByRole("button", { name: "Undo" }));
    expect((await screen.findByRole("tooltip")).textContent).toContain("Mod+Z");
  });

  test("works outside an EditorToolbar", () => {
    render(<EditorToolbarButton label="Standalone" icon={<svg />} />);
    expect(screen.getByRole("button", { name: "Standalone" })).toBeTruthy();
  });
});

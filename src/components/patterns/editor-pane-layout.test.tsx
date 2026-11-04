import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import {
  EditorPane,
  EditorPaneContent,
  EditorPaneHeader,
  EditorPaneLayout,
  EditorPaneMain,
  EditorPaneToggle,
  type EditorPaneLayoutProps,
  type EditorPaneProps,
} from "../../index";

beforeAll(() => {
  // jsdom has no PointerEvent; expose pointer fields on a MouseEvent subclass.
  if (typeof window.PointerEvent === "undefined") {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number;
      isPrimary: boolean;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.isPrimary = init.isPrimary ?? true;
      }
    }
    window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Layout({
  layout,
  inspector,
  children,
}: {
  layout?: Omit<EditorPaneLayoutProps, "children">;
  inspector?: Partial<EditorPaneProps>;
  children?: React.ReactNode;
}) {
  return (
    <EditorPaneLayout {...layout}>
      <EditorPane id="assets" side="start" label="Assets">
        <EditorPaneHeader title="Assets" />
        <EditorPaneContent>Asset list</EditorPaneContent>
      </EditorPane>
      <EditorPaneMain>
        <EditorPaneToggle paneId="inspector" />
        {children ?? <button type="button">Canvas</button>}
      </EditorPaneMain>
      <EditorPane id="inspector" side="end" label="Inspector" {...inspector}>
        <EditorPaneHeader title="Inspector" />
        <EditorPaneContent>
          <input aria-label="Width" defaultValue="12" />
        </EditorPaneContent>
      </EditorPane>
    </EditorPaneLayout>
  );
}

describe("EditorPaneLayout docked panes", () => {
  test("renders labelled panes with window-splitter semantics and slots", () => {
    render(<Layout inspector={{ defaultSize: 300, minSize: 200, maxSize: 480 }} />);

    const inspector = screen.getByRole("region", { name: "Inspector" });
    expect(inspector.getAttribute("data-slot")).toBe("editor-pane");
    expect(inspector.getAttribute("data-presentation")).toBe("docked");
    expect(inspector.style.width).toBe("300px");

    const resizer = screen.getByRole("separator", { name: "Resize Inspector" });
    expect(resizer.getAttribute("aria-controls")).toBe("inspector");
    expect(resizer.getAttribute("aria-orientation")).toBe("vertical");
    expect(resizer.getAttribute("aria-valuenow")).toBe("300");
    expect(resizer.getAttribute("aria-valuemin")).toBe("0");
    expect(resizer.getAttribute("aria-valuemax")).toBe("480");
    expect(resizer.tabIndex).toBe(0);
    expect(document.querySelector('[data-slot="editor-pane-layout"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="editor-pane-main"]')).toBeTruthy();
  });

  test("resizes with arrow keys toward each pane's own edge and clamps to min/max", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    const onResizeEnd = vi.fn();
    render(
      <Layout
        inspector={{
          defaultSize: 300,
          minSize: 200,
          maxSize: 360,
          collapsible: false,
          onSizeChange,
          onResizeEnd,
        }}
      />,
    );
    const inspectorResizer = screen.getByRole("separator", { name: "Resize Inspector" });
    const assetsResizer = screen.getByRole("separator", { name: "Resize Assets" });

    inspectorResizer.focus();
    // The end pane grows when its splitter moves toward the start edge.
    await user.keyboard("{ArrowLeft}");
    expect(inspectorResizer.getAttribute("aria-valuenow")).toBe("316");
    expect(onSizeChange).toHaveBeenLastCalledWith(316);
    expect(onResizeEnd).toHaveBeenLastCalledWith(316);
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(inspectorResizer.getAttribute("aria-valuenow")).toBe("360");
    await user.keyboard("{Home}");
    expect(inspectorResizer.getAttribute("aria-valuenow")).toBe("200");
    await user.keyboard("{ArrowRight}");
    expect(inspectorResizer.getAttribute("aria-valuenow")).toBe("200");
    await user.keyboard("{End}");
    expect(inspectorResizer.getAttribute("aria-valuenow")).toBe("360");

    assetsResizer.focus();
    await user.keyboard("{ArrowRight}");
    expect(assetsResizer.getAttribute("aria-valuenow")).toBe("296");
  });

  test("collapses with Enter or below the minimum and restores from the rail", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(<Layout inspector={{ minSize: 200, defaultSize: 200, onCollapsedChange }} />);
    const resizer = screen.getByRole("separator", { name: "Resize Inspector" });

    resizer.focus();
    await user.keyboard("{Enter}");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole("region", { name: "Inspector" })).toBeNull();
    expect(resizer.getAttribute("aria-valuenow")).toBe("0");
    expect(resizer.getAttribute("aria-valuetext")).toBe("Collapsed");

    const show = screen.getByRole("button", { name: "Show Inspector" });
    expect(show.getAttribute("aria-expanded")).toBe("false");
    await user.click(show);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("region", { name: "Inspector" })).toBeTruthy();
    // Pane content stays mounted while collapsed, so local drafts survive.
    expect(screen.getByRole("textbox", { name: "Width" })).toBeTruthy();

    resizer.focus();
    await user.keyboard("{ArrowRight}");
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  });

  test("hides from the header and moves focus to the rail", async () => {
    const user = userEvent.setup();
    render(<Layout />);
    await user.click(screen.getByRole("button", { name: "Hide Inspector" }));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Show Inspector" }));
  });

  test("supports controlled size and collapse state", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [size, setSize] = React.useState(320);
      const [collapsed, setCollapsed] = React.useState(false);
      return (
        <>
          <output aria-label="Persisted size">{size}</output>
          <button type="button" onClick={() => setSize(240)}>
            Reset layout
          </button>
          <Layout
            inspector={{
              size,
              onSizeChange: setSize,
              collapsed,
              onCollapsedChange: setCollapsed,
            }}
          />
        </>
      );
    }
    render(<Controlled />);
    const resizer = screen.getByRole("separator", { name: "Resize Inspector" });
    resizer.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByLabelText("Persisted size").textContent).toBe("336");
    await user.click(screen.getByRole("button", { name: "Reset layout" }));
    expect(resizer.getAttribute("aria-valuenow")).toBe("240");
    await user.click(screen.getByRole("button", { name: "Inspector" }));
    expect(screen.queryByRole("region", { name: "Inspector" })).toBeNull();
  });

  test("drags with pointer capture, collapses past half the minimum, and resets on double click", () => {
    const onResizeEnd = vi.fn();
    render(<Layout inspector={{ defaultSize: 300, minSize: 200, maxSize: 500, onResizeEnd }} />);
    const resizer = screen.getByRole("separator", { name: "Resize Inspector" });
    const capture = vi.fn();
    resizer.setPointerCapture = capture;
    resizer.hasPointerCapture = () => true;
    resizer.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(resizer, { button: 0, isPrimary: true, pointerId: 1, clientX: 600 });
    expect(capture).toHaveBeenCalledWith(1);
    expect(
      document.querySelector('[data-slot="editor-pane-layout"]')?.getAttribute("data-resizing"),
    ).toBe("true");
    fireEvent.pointerMove(resizer, { pointerId: 1, clientX: 540 });
    expect(resizer.getAttribute("aria-valuenow")).toBe("360");
    fireEvent.pointerMove(resizer, { pointerId: 1, clientX: 900 });
    expect(resizer.getAttribute("aria-valuetext")).toBe("Collapsed");
    fireEvent.pointerMove(resizer, { pointerId: 1, clientX: 520 });
    expect(resizer.getAttribute("aria-valuenow")).toBe("380");
    fireEvent.pointerUp(resizer, { pointerId: 1, clientX: 520 });
    expect(onResizeEnd).toHaveBeenLastCalledWith(380);
    expect(
      document.querySelector('[data-slot="editor-pane-layout"]')?.hasAttribute("data-resizing"),
    ).toBe(false);

    fireEvent.doubleClick(resizer);
    expect(resizer.getAttribute("aria-valuenow")).toBe("300");
  });

  test("mirrors vertical layouts onto the block axis", async () => {
    const user = userEvent.setup();
    render(
      <EditorPaneLayout orientation="vertical">
        <EditorPaneMain>Preview</EditorPaneMain>
        <EditorPane side="end" label="Timeline" defaultSize={240}>
          Tracks
        </EditorPane>
      </EditorPaneLayout>,
    );
    const pane = screen.getByRole("region", { name: "Timeline" });
    expect(pane.style.height).toBe("240px");
    const resizer = screen.getByRole("separator", { name: "Resize Timeline" });
    expect(resizer.getAttribute("aria-orientation")).toBe("horizontal");
    resizer.focus();
    await user.keyboard("{ArrowUp}");
    expect(resizer.getAttribute("aria-valuenow")).toBe("256");
  });
});

describe("EditorPaneLayout overlay panes", () => {
  test("switches horizontal layouts to closed drawers below the container breakpoint", () => {
    let resize: ResizeObserverCallback | undefined;
    vi.spyOn(globalThis, "ResizeObserver").mockImplementation(function (
      this: ResizeObserver,
      callback: ResizeObserverCallback,
    ) {
      resize = callback;
      return { observe() {}, unobserve() {}, disconnect() {} } as unknown as ResizeObserver;
    } as unknown as () => ResizeObserver);
    const onPresentationChange = vi.fn();
    render(<Layout layout={{ narrowBreakpoint: 720, onPresentationChange }} />);
    expect(screen.queryAllByRole("separator")).toHaveLength(2);

    act(() =>
      resize?.([{ contentRect: { width: 480 } } as ResizeObserverEntry], {} as ResizeObserver),
    );
    expect(onPresentationChange).toHaveBeenCalledWith("overlay");
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
    const pane = document.getElementById("inspector");
    expect(pane?.getAttribute("data-presentation")).toBe("overlay");
    expect(pane?.getAttribute("data-state")).toBe("closed");
    expect(screen.getByRole("button", { name: "Show Inspector" })).toBeTruthy();
  });

  test("opens as a focused drawer, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(<Layout layout={{ presentation: "overlay" }} />);
    const toggle = screen.getByRole("button", { name: "Inspector" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    await user.click(toggle);
    const pane = screen.getByRole("region", { name: "Inspector" });
    expect(pane.getAttribute("data-state")).toBe("open");
    expect(document.activeElement).toBe(pane);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector('[data-slot="editor-pane-scrim"]')).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(pane.getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(toggle);
  });

  test("light-dismisses when focus leaves the drawer", async () => {
    const user = userEvent.setup();
    render(<Layout layout={{ presentation: "overlay" }} />);
    await user.click(screen.getByRole("button", { name: "Show Inspector" }));
    const pane = screen.getByRole("region", { name: "Inspector" });
    const width = screen.getByRole("textbox", { name: "Width" });
    // Moving to the pane's own toggle leaves toggling to that control.
    fireEvent.focusOut(width, { relatedTarget: screen.getByRole("button", { name: "Inspector" }) });
    expect(pane.getAttribute("data-state")).toBe("open");
    fireEvent.focusOut(width, { relatedTarget: screen.getByRole("button", { name: "Canvas" }) });
    expect(pane.getAttribute("data-state")).toBe("closed");
  });

  test("closes from the scrim and the header close button", async () => {
    const user = userEvent.setup();
    render(<Layout layout={{ presentation: "overlay" }} />);
    await user.click(screen.getByRole("button", { name: "Show Assets" }));
    const scrim = document.querySelector<HTMLElement>('[data-slot="editor-pane-scrim"]');
    expect(scrim).toBeTruthy();
    await user.click(scrim!);
    expect(document.getElementById("assets")?.getAttribute("data-state")).toBe("closed");

    await user.click(screen.getByRole("button", { name: "Show Assets" }));
    await user.click(screen.getByRole("button", { name: "Hide Assets" }));
    expect(document.getElementById("assets")?.getAttribute("data-state")).toBe("closed");
  });

  test("keeps docked collapse state separate from overlay presentation", () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(<Layout inspector={{ onCollapsedChange }} />);
    rerender(<Layout layout={{ presentation: "overlay" }} inspector={{ onCollapsedChange }} />);
    expect(document.getElementById("inspector")?.getAttribute("data-state")).toBe("closed");
    rerender(<Layout layout={{ presentation: "docked" }} inspector={{ onCollapsedChange }} />);
    expect(document.getElementById("inspector")?.getAttribute("data-state")).toBe("open");
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  test("preserves pane content across presentation changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Layout />);
    await user.clear(screen.getByRole("textbox", { name: "Width" }));
    await user.type(screen.getByRole("textbox", { name: "Width" }), "48");
    rerender(<Layout layout={{ presentation: "overlay" }} />);
    rerender(<Layout layout={{ presentation: "docked" }} />);
    expect(screen.getByRole("textbox", { name: "Width" })).toHaveProperty("value", "48");
  });
});

describe("EditorPaneToggle", () => {
  test("requires a surrounding layout", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<EditorPaneToggle paneId="missing" />)).toThrow(
      "EditorPaneToggle must be rendered inside EditorPaneLayout.",
    );
  });

  test("reaches panes in nested layouts from an outer toolbar", async () => {
    const user = userEvent.setup();
    render(
      <EditorPaneLayout orientation="vertical">
        <div role="toolbar" aria-label="Commands">
          <EditorPaneToggle paneId="nested-inspector" />
        </div>
        <EditorPaneMain>
          <EditorPaneLayout>
            <EditorPaneMain>Canvas</EditorPaneMain>
            <EditorPane id="nested-inspector" side="end" label="Inspector">
              Properties
            </EditorPane>
          </EditorPaneLayout>
        </EditorPaneMain>
      </EditorPaneLayout>,
    );
    const toggle = screen.getByRole("button", { name: "Inspector" });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    await user.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region", { name: "Inspector" })).toBeNull();
  });

  test("is disabled until its pane is registered", () => {
    render(
      <EditorPaneLayout>
        <EditorPaneMain>
          <EditorPaneToggle paneId="missing">Missing</EditorPaneToggle>
        </EditorPaneMain>
      </EditorPaneLayout>,
    );
    expect(screen.getByRole("button", { name: "Missing" })).toHaveProperty("disabled", true);
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { WorkbenchLayout, type WorkbenchPanelSide } from "../../index";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("workbench layout", () => {
  test("mounts each workbench surface only once", () => {
    const onMount = vi.fn();
    function Surface() {
      React.useEffect(() => {
        onMount();
      }, []);
      return <input aria-label="Canvas property" defaultValue="one authoritative edit" />;
    }
    render(
      <WorkbenchLayout leftPanel={<div>Assets</div>}>
        <Surface />
      </WorkbenchLayout>,
    );
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("textbox", { name: "Canvas property" })).toHaveLength(1);
  });

  test("renders toolbar, canvas, and optional panels", () => {
    render(
      <WorkbenchLayout
        toolbar={<button type="button">Run</button>}
        leftPanel={<div>Assets</div>}
        rightPanel={<div>Inspector</div>}
        bottomPanel={<div>Console</div>}
      >
        Canvas
      </WorkbenchLayout>,
    );

    expect(screen.getByText("Run")).toBeTruthy();
    expect(screen.getAllByText("Canvas")[0]).toBeTruthy();
    expect(screen.getAllByText("Assets")[0]).toBeTruthy();
    expect(screen.getAllByText("Inspector")[0]).toBeTruthy();
    expect(screen.getAllByText("Console")[0]).toBeTruthy();
    expect(document.querySelector('[data-slot="workbench-mobile-layout"]')).toBeNull();
    expect(document.querySelector('[data-slot="workbench-desktop-layout"]')).toBeTruthy();
  });

  test("omits missing panels cleanly and exposes data slots", () => {
    render(<WorkbenchLayout data-testid="workbench">Canvas only</WorkbenchLayout>);

    expect(screen.getByTestId("workbench").getAttribute("data-slot")).toBe("workbench-layout");
    expect(screen.getAllByText("Canvas only")[0]).toBeTruthy();
  });
});

describe("controlled workbench presentation", () => {
  test("moves panels through visible controls and focuses the destination tab", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [positions, setPositions] = React.useState<Record<string, WorkbenchPanelSide>>({
        navigator: "left",
        inspector: "right",
      });
      const [activePanels, setActivePanels] = React.useState<
        Partial<Record<WorkbenchPanelSide, string>>
      >({});
      const [value, setValue] = React.useState("precise document value");
      return (
        <WorkbenchLayout
          docking={{
            panels: [
              { id: "navigator", label: "Navigator", content: <div>Asset list</div> },
              {
                id: "inspector",
                label: "Inspector",
                content: (
                  <input
                    aria-label="Document property"
                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                  />
                ),
              },
            ],
            positions,
            onPositionsChange: setPositions,
            activePanels,
            onActivePanelChange: (side, panelId) =>
              setActivePanels((current) => ({ ...current, [side]: panelId })),
          }}
        >
          <div>Canvas</div>
        </WorkbenchLayout>
      );
    }
    render(<Demo />);
    const property = screen.getByRole("textbox", { name: "Document property" });
    await user.clear(property);
    expect(property.isConnected).toBe(true);
    expect(document.activeElement).toBe(property);
    await user.keyboard("accepted edit");
    expect(property).toHaveProperty("value", "accepted edit");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Move Inspector panel" }),
      "left",
    );
    const inspector = screen.getByRole("tab", { name: "Inspector" });
    expect(document.activeElement).toBe(inspector);
    expect(inspector.closest('[data-slot="workbench-panel"]')?.getAttribute("data-side")).toBe(
      "left",
    );
    expect(screen.getByRole("textbox", { name: "Document property" })).toHaveProperty(
      "value",
      "accepted edit",
    );
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Asset list")).toBeTruthy();
  });

  test("focuses the destination when the app accepts a placement on a later render", async () => {
    const user = userEvent.setup();
    const onPositionsChange = vi.fn();
    const panels = [{ id: "inspector", label: "Inspector", content: "Property content" }];
    const { rerender } = render(
      <WorkbenchLayout docking={{ panels, positions: { inspector: "right" }, onPositionsChange }}>
        Canvas
      </WorkbenchLayout>,
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Move Inspector panel" }),
      "bottom",
    );
    expect(onPositionsChange).toHaveBeenCalledWith({ inspector: "bottom" });
    expect(screen.getByRole("combobox", { name: "Move Inspector panel" })).toHaveProperty(
      "value",
      "right",
    );
    rerender(
      <WorkbenchLayout docking={{ panels, positions: { inspector: "bottom" }, onPositionsChange }}>
        Canvas
      </WorkbenchLayout>,
    );
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Inspector" }));
  });

  test("does not move a panel if the consuming app rejects the placement", async () => {
    const user = userEvent.setup();
    const onPositionsChange = vi.fn();
    render(
      <WorkbenchLayout
        docking={{
          panels: [{ id: "inspector", label: "Inspector", content: "Property content" }],
          positions: { inspector: "right" },
          onPositionsChange,
        }}
      >
        Canvas
      </WorkbenchLayout>,
    );
    const control = screen.getByRole("combobox", { name: "Move Inspector panel" });
    await user.selectOptions(control, "bottom");
    expect(onPositionsChange).toHaveBeenCalledWith({ inspector: "bottom" });
    expect(control).toHaveProperty("value", "right");
    expect(control.closest('[data-slot="workbench-panel"]')?.getAttribute("data-side")).toBe(
      "right",
    );
  });

  test("keeps a single controlled document value across responsive view changes", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    function Demo() {
      const [value, setValue] = React.useState("initial");
      return (
        <WorkbenchLayout leftPanel="Navigator">
          <input
            aria-label="Canvas value"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </WorkbenchLayout>
      );
    }
    render(<Demo />);
    const input = screen.getByRole("textbox", { name: "Canvas value" });
    await user.clear(input);
    expect(input.isConnected).toBe(true);
    expect(document.activeElement).toBe(input);
    await user.keyboard("authoritative replacement");
    expect(input).toHaveProperty("value", "authoritative replacement");
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(390);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(screen.getAllByRole("textbox", { name: "Canvas value" })).toHaveLength(1);
    expect(screen.getByRole("textbox", { name: "Canvas value" })).toHaveProperty(
      "value",
      "authoritative replacement",
    );
    expect(document.querySelector('[data-slot="workbench-desktop-layout"]')).toBeNull();
    expect(document.querySelector('[data-slot="workbench-mobile-layout"]')).toBeTruthy();
  });
});

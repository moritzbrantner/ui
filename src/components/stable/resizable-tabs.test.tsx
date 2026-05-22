import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { ResizableTabs, type ResizableTabsItem } from "./resizable-tabs";

const items: ResizableTabsItem[] = [
  { value: "alpha", label: "Alpha", content: "Alpha panel" },
  { value: "beta", label: "Beta", content: "Beta panel" },
  { value: "gamma", label: "Gamma", content: "Gamma panel" },
];

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("ResizableTabs", () => {
  test("renders ordered tabs with resizable handles", () => {
    render(<ResizableTabs items={items} defaultValue="alpha" defaultOrder={["gamma", "alpha"]} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Gamma",
      "Alpha",
      "Beta",
    ]);
    expect(screen.getByRole("tab", { name: "Gamma" }).getAttribute("data-slot")).toBe(
      "resizable-tabs-trigger",
    );
    const handles = document.querySelectorAll("[data-slot='resizable-handle']");

    expect(handles).toHaveLength(2);
    expect(handles[0]?.getAttribute("aria-hidden")).toBe("true");
    expect(handles[0]?.getAttribute("role")).toBeNull();
    expect(handles[0]?.getAttribute("data-orientation")).toBe("vertical");
    expect(handles[0]?.className).toContain("cursor-col-resize");
  });

  test("uses a roomier default tab size", () => {
    render(<ResizableTabs items={items} defaultValue="alpha" />);

    expect(document.querySelector("[data-slot='resizable-tabs-list']")?.className).toContain(
      "--ui-control-height-md",
    );
    expect(screen.getByRole("tab", { name: "Alpha" }).className).toContain(
      "--ui-control-padding-x-sm",
    );
  });

  test("supports controlled tab value changes", () => {
    const onValueChange = vi.fn();

    function Harness() {
      const [value, setValue] = React.useState("alpha");

      return (
        <ResizableTabs
          items={items}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            onValueChange(nextValue);
          }}
          resizable={false}
        />
      );
    }

    render(<Harness />);
    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));

    expect(onValueChange).toHaveBeenCalledWith("beta");
    expect(screen.getByText("Beta panel")).toBeTruthy();
  });
});

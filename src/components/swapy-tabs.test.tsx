import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { SwapyTabs, type SwapyTabsItem } from "./swapy-tabs";

const items: SwapyTabsItem[] = [
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

describe("SwapyTabs", () => {
  test("renders ordered tabs with swapy slots and resizable handles", () => {
    render(
      <SwapyTabs
        items={items}
        defaultValue="alpha"
        defaultOrder={["gamma", "alpha"]}
        swapyConfig={false}
      />,
    );

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Gamma",
      "Alpha",
      "Beta",
    ]);
    expect(screen.getByRole("tab", { name: "Gamma" }).getAttribute("data-swapy-item")).toBe(
      "gamma",
    );
    expect(document.querySelectorAll("[data-swapy-slot]")).toHaveLength(3);
    expect(document.querySelectorAll("[data-slot='resizable-handle']")).toHaveLength(2);
  });

  test("supports controlled tab value changes", () => {
    const onValueChange = vi.fn();

    function Harness() {
      const [value, setValue] = React.useState("alpha");

      return (
        <SwapyTabs
          items={items}
          value={value}
          onValueChange={(nextValue) => {
            setValue(nextValue);
            onValueChange(nextValue);
          }}
          swapyConfig={false}
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

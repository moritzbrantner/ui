import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { RefreshControl } from "./resource-list";

const intervalOptions = [
  { label: "5 seconds", value: 5_000 },
  { label: "15 seconds", value: 15_000 },
];

describe("refresh control", () => {
  test("forwards manual refresh and auto-refresh interactions", () => {
    const onRefresh = vi.fn();
    const onAutoRefreshChange = vi.fn();

    render(
      <RefreshControl
        onRefresh={onRefresh}
        autoRefresh={false}
        onAutoRefreshChange={onAutoRefreshChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    fireEvent.click(screen.getByRole("switch", { name: "Auto refresh" }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onAutoRefreshChange).toHaveBeenCalledWith(true);
  });

  test("exposes interval selection without owning polling", () => {
    const onIntervalMsChange = vi.fn();

    render(
      <RefreshControl
        onRefresh={vi.fn()}
        autoRefresh={false}
        intervalMs={5_000}
        intervalOptions={intervalOptions}
        onIntervalMsChange={onIntervalMsChange}
      />,
    );

    const intervalSelect = screen.getByRole("combobox", { name: "Refresh interval" });
    expect((intervalSelect as HTMLButtonElement).disabled).toBe(true);
  });

  test("communicates refreshing state and supports preformatted status content", () => {
    render(
      <RefreshControl onRefresh={vi.fn()} isRefreshing lastUpdated="Updated 12 seconds ago" />,
    );

    const refreshButton = screen.getByRole("button", { name: "Refreshing" });

    expect((refreshButton as HTMLButtonElement).disabled).toBe(true);
    expect(refreshButton.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Updated 12 seconds ago")).toBeTruthy();
  });

  test("disables the interval while uncontrolled auto-refresh is shown as off", () => {
    render(
      <RefreshControl
        onRefresh={vi.fn()}
        onAutoRefreshChange={vi.fn()}
        intervalMs={5_000}
        intervalOptions={intervalOptions}
        onIntervalMsChange={vi.fn()}
      />,
    );

    const intervalSelect = screen.getByRole("combobox", { name: "Refresh interval" });
    expect((intervalSelect as HTMLButtonElement).disabled).toBe(true);
  });

  test("keeps the status live region mounted before the first update", () => {
    const { container, rerender } = render(<RefreshControl onRefresh={vi.fn()} />);
    const liveRegion = container.querySelector('[data-slot="refresh-control-last-updated"]');

    expect(liveRegion?.getAttribute("aria-live")).toBe("polite");

    rerender(<RefreshControl onRefresh={vi.fn()} lastUpdated="Updated just now" />);

    expect(container.querySelector('[data-slot="refresh-control-last-updated"]')).toBe(liveRegion);
    expect(liveRegion?.textContent).toBe("Updated just now");
  });
});

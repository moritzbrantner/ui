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

    expect(screen.getByRole("combobox", { name: "Refresh interval" })).toBeDisabled();
  });

  test("communicates refreshing state and supports preformatted status content", () => {
    render(
      <RefreshControl onRefresh={vi.fn()} isRefreshing lastUpdated="Updated 12 seconds ago" />,
    );

    const refreshButton = screen.getByRole("button", { name: "Refreshing" });

    expect(refreshButton).toBeDisabled();
    expect(refreshButton.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Updated 12 seconds ago")).toBeTruthy();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { LiveIndicator, type LiveIndicatorStatus } from "../../index";

const statuses = [
  "active",
  "streaming",
  "syncing",
  "healthy",
  "stale",
  "alert",
] as const satisfies readonly LiveIndicatorStatus[];

describe("live indicator", () => {
  test("renders default labels for every status", () => {
    render(
      <div>
        {statuses.map((status) => (
          <LiveIndicator key={status} status={status} />
        ))}
      </div>,
    );

    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Streaming")).toBeTruthy();
    expect(screen.getByText("Syncing")).toBeTruthy();
    expect(screen.getByText("Healthy")).toBeTruthy();
    expect(screen.getByText("Stale")).toBeTruthy();
    expect(screen.getByText("Alert")).toBeTruthy();
  });

  test("applies status and pulse state attributes", () => {
    render(
      <div>
        <LiveIndicator status="streaming" data-testid="default-pulse" />
        <LiveIndicator status="healthy" pulse data-testid="forced-pulse" />
        <LiveIndicator status="syncing" pulse={false} data-testid="disabled-pulse" />
      </div>,
    );

    expect(screen.getByTestId("default-pulse").getAttribute("data-status")).toBe("streaming");
    expect(screen.getByTestId("default-pulse").getAttribute("data-pulse")).toBe("true");
    expect(screen.getByTestId("forced-pulse").getAttribute("data-pulse")).toBe("true");
    expect(screen.getByTestId("disabled-pulse").getAttribute("data-pulse")).toBe("false");
  });

  test("supports semantic defaults and caller overrides", () => {
    render(
      <div>
        <LiveIndicator status="active" label="Live now" detail="12 viewers" data-testid="live" />
        <LiveIndicator
          status="alert"
          role="alert"
          aria-live="assertive"
          className="custom-live"
          data-testid="alert"
        />
      </div>,
    );

    expect(screen.getByTestId("live").getAttribute("role")).toBe("status");
    expect(screen.getByTestId("live").getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText("12 viewers")).toBeTruthy();
    expect(screen.getByTestId("alert").getAttribute("role")).toBe("alert");
    expect(screen.getByTestId("alert").getAttribute("aria-live")).toBe("assertive");
    expect(screen.getByTestId("alert").className).toContain("custom-live");
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ConnectionStatus } from "../../index";

describe("connection status", () => {
  test("renders syncing, synced, and disconnected states", () => {
    render(
      <div>
        <ConnectionStatus status="syncing" onSync={() => undefined} />
        <ConnectionStatus status="synced" onSync={() => undefined} />
        <ConnectionStatus status="disconnected" onReconnect={() => undefined} />
      </div>,
    );

    expect(screen.getByText("Syncing").closest("button")).toBeTruthy();
    expect(screen.getByText("Connected and synced").closest("button")).toBeTruthy();
    expect(screen.getByText("Disconnected").closest("button")).toBeTruthy();
    expect(screen.getByText("Syncing...")).toBeTruthy();
    expect(screen.getByText("Synced up")).toBeTruthy();
    expect(screen.getByText("Reconnect")).toBeTruthy();
  });

  test("clicking a disconnected status tries to reconnect and shows pending feedback", async () => {
    let resolveReconnect: (() => void) | undefined;
    const onReconnect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveReconnect = resolve;
        }),
    );

    render(<ConnectionStatus status="disconnected" onReconnect={onReconnect} />);

    fireEvent.click(screen.getByRole("button", { name: /Disconnected/i }));

    expect(onReconnect).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Reconnecting...")).toBeTruthy();

    resolveReconnect?.();

    await waitFor(() => {
      expect(screen.queryByText("Reconnecting...")).toBeNull();
    });
  });

  test("clicking synced routes to sync", async () => {
    const onSync = vi.fn();

    render(<ConnectionStatus status="synced" onSync={onSync} />);

    fireEvent.click(screen.getByText("Connected and synced").closest("button")!);

    await waitFor(() => {
      expect(onSync).toHaveBeenCalledTimes(1);
    });
  });

  test("syncing and legacy sync-needed states render as disabled in-progress feedback", () => {
    const onSync = vi.fn();

    render(
      <div>
        <ConnectionStatus status="syncing" onSync={onSync} />
        <ConnectionStatus status="connected" onSync={onSync} />
        <ConnectionStatus status="out-of-sync" onSync={onSync} />
      </div>,
    );

    const buttons = screen.getAllByRole("button");

    expect(screen.getAllByText("Syncing")).toHaveLength(3);
    expect(screen.getAllByText("Syncing...")).toHaveLength(3);

    for (const button of buttons) {
      expect(button.getAttribute("disabled")).toBe("");
      expect(button.getAttribute("data-status")).toBe("syncing");
      expect(button.className).toContain("border-blue-500/30");
      fireEvent.click(button);
    }

    expect(onSync).not.toHaveBeenCalled();
  });

  test("renders action labels with hover and active light-up states", () => {
    render(<ConnectionStatus status="synced" onSync={() => undefined} />);

    const action = screen.getByText("Synced up");

    expect(action.className).toContain("group-hover/connection-status:bg-emerald-500/22");
    expect(action.className).toContain("group-active/connection-status:bg-emerald-500/30");
  });

  test("disables the control when no reconnect or sync handler is available", () => {
    render(<ConnectionStatus status="synced" />);

    expect(
      screen.getByText("Connected and synced").closest("button")?.getAttribute("disabled"),
    ).toBe("");
  });
});

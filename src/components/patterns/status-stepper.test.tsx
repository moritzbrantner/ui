import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  ConnectionStatus,
  ShortcutHelpDialog,
  ShortcutList,
  Stepper,
  StepperConnector,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  type ShortcutHelpGroup,
} from "../../index";

const groups: ShortcutHelpGroup[] = [
  {
    id: "global",
    label: "Global",
    shortcuts: [
      { id: "palette", label: "Open command palette", shortcut: "Meta+K" },
      { id: "search", label: "Focus search", shortcut: "/" },
    ],
  },
];

describe("pattern status and stepper surfaces", () => {
  test("calls connection status callbacks for actionable states", async () => {
    const onSync = vi.fn();
    const onReconnect = vi.fn();

    render(
      <div>
        <ConnectionStatus status="synced" onSync={onSync} />
        <ConnectionStatus status="disconnected" onReconnect={onReconnect} />
        <ConnectionStatus status="syncing" onSync={vi.fn()} />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Connected and synced/ }));
    fireEvent.click(screen.getByRole("button", { name: /Disconnected/ }));
    fireEvent.click(screen.getByRole("button", { name: /Syncing/ }));

    await waitFor(() => expect(onSync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onReconnect).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: /Syncing/ }).hasAttribute("disabled")).toBe(true);
  });

  test("renders stepper states and orientation", () => {
    render(
      <Stepper orientation="vertical" className="contract-stepper">
        <StepperItem status="complete">
          <StepperIndicator />
          <StepperContent>
            <StepperTitle>Configure</StepperTitle>
            <StepperDescription>Choose package metadata.</StepperDescription>
          </StepperContent>
          <StepperConnector />
        </StepperItem>
        <StepperItem status="current">
          <StepperIndicator>2</StepperIndicator>
          <StepperContent>
            <StepperTitle>Review</StepperTitle>
            <StepperDescription>Check release gates.</StepperDescription>
          </StepperContent>
        </StepperItem>
      </Stepper>,
    );

    const stepper = screen.getByText("Configure").closest('[data-slot="stepper"]');
    expect(stepper?.className).toContain("contract-stepper");
    expect(stepper?.getAttribute("data-orientation")).toBe("vertical");
    expect(
      screen.getByText("Review").closest('[data-slot="stepper-item"]')?.getAttribute("data-status"),
    ).toBe("current");
  });

  test("renders shortcut list and dialog without taking keyboard ownership", () => {
    render(
      <div>
        <ShortcutList groups={groups} className="contract-shortcuts" />
        <ShortcutHelpDialog open groups={groups} />
      </div>,
    );

    expect(screen.getAllByText("Open command palette").length).toBeGreaterThan(1);
    expect(
      screen.getAllByText("Global")[0].closest('[data-slot="shortcut-list"]')?.className,
    ).toContain("contract-shortcuts");
    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeTruthy();
    expect(screen.getAllByText("Meta").length).toBeGreaterThan(1);
  });
});

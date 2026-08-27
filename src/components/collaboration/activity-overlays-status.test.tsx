import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Button } from "../stable/button";
import {
  ActivityActor,
  ActivityContent,
  ActivityFeed,
  ActivityGroup,
  ActivityItem,
  ActivityMeta,
} from "./activity-feed";
import {
  CollaborationAction,
  CollaborationConnection,
  CollaborationParticipants,
  CollaborationStatusBar,
  CollaborationSyncStatus,
} from "./collaboration-status-bar";
import { CollaborationOverlay, LiveCursor, RemoteSelection } from "./live-overlays";

describe("activity feed", () => {
  test("preserves chronology with list and time semantics", () => {
    render(
      <ActivityFeed aria-label="Object activity">
        <ActivityGroup>Today</ActivityGroup>
        <ActivityItem>
          <span aria-hidden="true">✦</span>
          <ActivityContent>
            <ActivityActor>Ada</ActivityActor> updated a long shared object name
            <ActivityMeta dateTime="2026-08-27T10:00:00Z" timestamp="10:00">
              <a href="#details">Details</a>
            </ActivityMeta>
          </ActivityContent>
        </ActivityItem>
      </ActivityFeed>,
    );

    expect(screen.getByRole("list", { name: "Object activity" })).toBeTruthy();
    expect(screen.getByRole("time").getAttribute("datetime")).toBe("2026-08-27T10:00:00Z");
    expect(screen.getByRole("link", { name: "Details" })).toBeTruthy();
  });
});

describe("live collaboration overlays", () => {
  test("exposes cursor and selection identity to assistive technology", () => {
    render(
      <div className="relative">
        <CollaborationOverlay data-testid="overlay">
          <LiveCursor x={24} y={48} label="Ada cursor" />
          <RemoteSelection
            bounds={{ x: 10, y: 20, width: 120, height: 36 }}
            label="Grace selection"
          />
        </CollaborationOverlay>
      </div>,
    );

    expect(screen.getByTestId("overlay")).toBeTruthy();
    expect(screen.getByLabelText("Ada cursor")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Grace selection" })).toBeTruthy();
  });
});

describe("collaboration status bar", () => {
  test("represents connection, sync, participants, and an action independently", () => {
    render(
      <CollaborationStatusBar aria-label="Collaboration status">
        <CollaborationConnection status="connected" label="Connected" detail="Realtime" />
        <CollaborationSyncStatus state="error" label="Save failed" detail="Draft retained" />
        <CollaborationParticipants
          participants={[{ id: "ada", name: "Ada", status: "online", statusLabel: "Ada online" }]}
        />
        <CollaborationAction>
          <Button type="button">Retry</Button>
        </CollaborationAction>
      </CollaborationStatusBar>,
    );

    expect(screen.getByLabelText("Collaboration status")).toBeTruthy();
    expect(screen.getByText("Connected")).toBeTruthy();
    expect(screen.getByText("Save failed")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  test.each([
    ["connected", "syncing"],
    ["disconnected", "pending"],
  ] as const)("keeps %s connection independent from %s sync", (connection, sync) => {
    const { container } = render(
      <CollaborationStatusBar>
        <CollaborationConnection status={connection} label={`${connection} connection`} />
        <CollaborationSyncStatus state={sync} label={`${sync} changes`} />
      </CollaborationStatusBar>,
    );

    expect(screen.getByText(`${connection} connection`)).toBeTruthy();
    expect(screen.getByText(`${sync} changes`)).toBeTruthy();
    expect(
      container
        .querySelector('[data-slot="collaboration-sync-status"]')
        ?.getAttribute("data-state"),
    ).toBe(sync);
  });
});

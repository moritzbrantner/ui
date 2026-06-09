import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { LiveIndicator, type LiveIndicatorStatus } from "./live-indicator";

const statuses = [
  "active",
  "streaming",
  "syncing",
  "healthy",
  "stale",
  "alert",
] as const satisfies readonly LiveIndicatorStatus[];

const meta = {
  title: "Components/Feedback/Live Indicator",
  component: LiveIndicator,
  tags: ["autodocs", "test"],
  args: {
    status: "active",
  },
  argTypes: {
    status: {
      control: "select",
      options: statuses,
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof LiveIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid w-[min(720px,calc(100vw-2rem))] gap-3 sm:grid-cols-2">
      {statuses.map((status) => (
        <LiveIndicator
          key={status}
          status={status}
          label={statusLabel(status)}
          detail={statusDetail(status)}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const status of statuses) {
      await expect(canvasElement.querySelector(`[data-status="${status}"]`)).toBeTruthy();
    }
  },
};

export const Inline: Story = {
  render: () => (
    <div className="flex w-[min(620px,calc(100vw-2rem))] flex-wrap items-center gap-2 rounded-[var(--ui-radius-surface)] border border-border/60 bg-card p-3">
      <LiveIndicator status="active" size="sm" />
      <LiveIndicator status="streaming" size="sm" label="Recording" />
      <LiveIndicator status="healthy" size="sm" />
      <LiveIndicator status="stale" size="sm" label="5m old" pulse={false} />
    </div>
  ),
};

export const RealtimePanel: Story = {
  render: () => (
    <div className="grid w-[min(760px,calc(100vw-2rem))] gap-3 rounded-[var(--ui-radius-surface)] border border-border/60 bg-card p-[var(--ui-card-padding)] shadow-[var(--ui-shadow-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold leading-snug">Realtime operations</h3>
          <p className="text-sm text-muted-foreground">Live service state across active systems.</p>
        </div>
        <LiveIndicator status="streaming" label="Event stream" detail="1.2k/min" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <LiveIndicator status="active" label="Control room" detail="4 operators online" />
        <LiveIndicator status="syncing" label="Sync engine" detail="Applying changes" />
        <LiveIndicator status="healthy" label="Workers" detail="24 healthy" pulse={false} />
        <LiveIndicator status="alert" label="Queue pressure" detail="Retry rate elevated" />
      </div>
    </div>
  ),
};

function statusLabel(status: LiveIndicatorStatus) {
  return {
    active: "Active session",
    streaming: "Streaming updates",
    syncing: "Syncing data",
    healthy: "Healthy service",
    stale: "Stale data",
    alert: "Needs attention",
  }[status];
}

function statusDetail(status: LiveIndicatorStatus) {
  return {
    active: "Input is live",
    streaming: "Events are flowing",
    syncing: "Changes are applying",
    healthy: "Checks are passing",
    stale: "Last update delayed",
    alert: "Action may be needed",
  }[status];
}

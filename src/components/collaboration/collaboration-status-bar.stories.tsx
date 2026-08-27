import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../stable/button";
import {
  CollaborationAction,
  CollaborationConnection,
  CollaborationParticipants,
  CollaborationStatusBar,
  CollaborationSyncStatus,
} from "./collaboration-status-bar";

const participants = [
  { id: "ada", name: "Ada", status: "online" as const, statusLabel: "Ada online" },
  { id: "grace", name: "Grace", status: "away" as const, statusLabel: "Grace away" },
  { id: "linus", name: "Linus", status: "busy" as const, statusLabel: "Linus busy" },
];

const meta = {
  title: "Components/Collaboration/Status Bar",
  component: CollaborationStatusBar,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof CollaborationStatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Synced: Story = {
  render: () => (
    <CollaborationStatusBar className="max-w-3xl">
      <CollaborationConnection status="connected" label="Connected" detail="Realtime" />
      <CollaborationSyncStatus state="saved" label="Saved" detail="A moment ago" />
      <CollaborationParticipants participants={participants} />
    </CollaborationStatusBar>
  ),
};

export const Syncing: Story = {
  render: () => (
    <CollaborationStatusBar className="max-w-3xl">
      <CollaborationConnection status="connected" label="Connected" detail="Realtime" />
      <CollaborationSyncStatus state="syncing" label="Syncing changes" />
      <CollaborationParticipants participants={participants} />
    </CollaborationStatusBar>
  ),
};

export const PendingOffline: Story = {
  render: () => (
    <CollaborationStatusBar className="max-w-3xl">
      <CollaborationConnection status="disconnected" label="Offline" detail="Working locally" />
      <CollaborationSyncStatus state="pending" label="Changes pending" />
      <CollaborationParticipants participants={participants} />
    </CollaborationStatusBar>
  ),
};

export const ErrorWithAction: Story = {
  render: () => (
    <CollaborationStatusBar className="max-w-3xl">
      <CollaborationConnection status="disconnected" label="Offline" detail="Changes stay local" />
      <CollaborationSyncStatus state="error" label="Save failed" />
      <CollaborationParticipants
        participants={participants}
        maxVisible={2}
        overflowLabel={(count) => `${count} more people`}
      />
      <CollaborationAction>
        <Button type="button" size="sm">
          Retry
        </Button>
      </CollaborationAction>
    </CollaborationStatusBar>
  ),
};

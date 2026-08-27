import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Button } from "../stable/button";
import { CollaborationOverlay, LiveCursor, RemoteSelection } from "./live-overlays";

function SharedCanvasExample() {
  const [activated, setActivated] = React.useState(false);

  return (
    <div className="relative h-72 w-[min(42rem,90vw)] overflow-hidden rounded-[var(--ui-radius-surface)] border bg-card p-8">
      <div className="h-full rounded border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
        <Button type="button" onClick={() => setActivated(true)}>
          {activated ? "Canvas action activated" : "Canvas action"}
        </Button>
      </div>
      <CollaborationOverlay>
        <RemoteSelection
          bounds={{ x: 72, y: 82, width: 180, height: 72 }}
          label="Grace selection"
          tone="warning"
        />
        <LiveCursor x={260} y={96} label="Ada" />
        <LiveCursor x={580} y={220} label="Linus at viewport edge" tone="destructive" />
      </CollaborationOverlay>
    </div>
  );
}

const meta = {
  title: "Components/Collaboration/Live Overlays",
  component: CollaborationOverlay,
  tags: ["autodocs", "test"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CollaborationOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SharedCanvas: Story = {
  render: () => <SharedCanvasExample />,
};

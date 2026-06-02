import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../stable/button";
import { ContextActionMenu } from "./context-action-menu";

const meta = {
  title: "Components/Overlay/Context Action Menu",
  component: ContextActionMenu,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ContextActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RightClickTarget: Story = {
  args: {
    children: <Button>Right-click row</Button>,
    items: [],
  },
  render: () => (
    <div className="flex min-h-24 w-[calc(100vw-2rem)] max-w-full items-center justify-center">
      <ContextActionMenu
        label="Row actions"
        modal={false}
        items={[
          { id: "duplicate", label: "Duplicate", icon: <CopyIcon /> },
          { id: "archive", label: "Archive", icon: <ArchiveIcon /> },
        ]}
      >
        <Button type="button" variant="outline">
          Right-click row
        </Button>
      </ContextActionMenu>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Right-click row" })).toBeVisible();
  },
};

export const WithDisabledAndDestructiveItems: Story = {
  args: {
    children: <Button>Right-click asset</Button>,
    items: [],
  },
  render: () => (
    <div className="flex min-h-24 w-[calc(100vw-2rem)] max-w-full items-center justify-center">
      <ContextActionMenu
        label="Asset actions"
        modal={false}
        items={[
          { id: "copy", label: "Copy", icon: <CopyIcon /> },
          { id: "archive", label: "Archive", icon: <ArchiveIcon />, disabled: true },
          { id: "delete", label: "Delete", icon: <Trash2Icon />, destructive: true },
        ]}
      >
        <Button type="button" variant="outline">
          Right-click asset
        </Button>
      </ContextActionMenu>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { expect, screen } from "storybook/test";

import { Button } from "./button";
import { ContextActionMenu } from "./context-action-menu";

const meta = {
  title: "Components/Overlay/Context Action Menu",
  component: ContextActionMenu,
  tags: ["autodocs", "test"],
  parameters: {
    a11y: {
      test: "todo",
    },
  },
} satisfies Meta<typeof ContextActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RightClickTarget: Story = {
  args: {
    children: <Button>Right-click row</Button>,
    items: [],
  },
  render: () => (
    <ContextActionMenu
      items={[
        { id: "duplicate", label: "Duplicate", icon: <CopyIcon /> },
        { id: "archive", label: "Archive", icon: <ArchiveIcon /> },
      ]}
    >
      <Button type="button" variant="outline">
        Right-click row
      </Button>
    </ContextActionMenu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.pointer({
      keys: "[MouseRight]",
      target: canvas.getByRole("button", { name: "Right-click row" }),
    });
    await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toBeTruthy();
  },
};

export const WithDisabledAndDestructiveItems: Story = {
  args: {
    children: <Button>Right-click asset</Button>,
    items: [],
  },
  render: () => (
    <ContextActionMenu
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
  ),
};

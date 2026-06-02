import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, CopyIcon, MoreHorizontalIcon } from "lucide-react";
import { expect, screen } from "storybook/test";

import { Button } from "../stable/button";
import { ResponsiveActionMenu } from "./responsive-action-menu";

const meta = {
  title: "Components/Overlay/Responsive Action Menu",
  component: ResponsiveActionMenu,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ResponsiveActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  { id: "copy", label: "Copy", icon: <CopyIcon /> },
  { id: "archive", label: "Archive", icon: <ArchiveIcon /> },
];

export const DesktopMode: Story = {
  args: {
    mode: "desktop",
    trigger: <Button>Open desktop actions</Button>,
    items,
  },
  parameters: {
    mobileUsability: {
      skip: true,
      reason: "Desktop-only action menu presentation is covered by the mobile-mode story.",
    },
  },
  render: () => (
    <ResponsiveActionMenu
      mode="desktop"
      trigger={
        <Button variant="outline" size="icon-sm" aria-label="Open desktop actions">
          <MoreHorizontalIcon />
        </Button>
      }
      label="Desktop actions"
      desktopProps={{ modal: false }}
      items={items}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open desktop actions" }));
    await expect(screen.getByRole("menu")).toBeTruthy();
  },
};

export const MobileMode: Story = {
  args: {
    mode: "mobile",
    trigger: <Button>Open mobile actions</Button>,
    items,
  },
  render: () => (
    <ResponsiveActionMenu
      mode="mobile"
      trigger={
        <Button variant="outline" size="icon-sm" aria-label="Open mobile actions">
          <MoreHorizontalIcon />
        </Button>
      }
      title="Actions"
      description="Mobile sheet presentation."
      items={items}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open mobile actions" }));
    await expect(screen.getByRole("dialog")).toBeTruthy();
  },
};

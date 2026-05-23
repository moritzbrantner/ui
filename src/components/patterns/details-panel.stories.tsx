import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExternalLinkIcon } from "lucide-react";
import { expect, screen, waitFor, within } from "storybook/test";

import { Button } from "../stable/button";
import { DetailsPanel } from "./details-panel";

const meta = {
  title: "Components/Overlay/Details Panel",
  component: DetailsPanel,
  tags: ["autodocs", "test"],
  args: {
    trigger: <Button type="button">Open details</Button>,
    title: "Package contract",
    description: "Public package-consumption check for the design-system package.",
    badges: [
      { id: "ready", label: "Ready", variant: "secondary" },
      { id: "ci", label: "CI", variant: "outline" },
    ],
    actions: (
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Open external link">
        <ExternalLinkIcon />
      </Button>
    ),
    items: [
      { id: "owner", term: "Owner", detail: "Design system" },
      { id: "status", term: "Status", detail: "Ready for release" },
      { id: "updated", term: "Updated", detail: "Today" },
    ],
    footer: <Button type="button">Open item</Button>,
  },
} satisfies Meta<typeof DetailsPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open details" }));
    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getByText("Ready for release")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};

export const WithTabs: Story = {
  args: {
    tabs: [
      {
        value: "summary",
        label: "Summary",
        content: <p className="text-sm text-muted-foreground">Release checks are complete.</p>,
      },
      {
        value: "activity",
        label: "Activity",
        content: <p className="text-sm text-muted-foreground">The latest check passed.</p>,
      },
    ],
  },
};

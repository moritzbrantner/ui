import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheckIcon } from "lucide-react";
import { expect, screen } from "storybook/test";

import { Avatar } from "../stable/avatar";
import { Button } from "../stable/button";
import { HoverPreview } from "./hover-preview";

const meta = {
  title: "Components/Overlay/Hover Preview",
  component: HoverPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof HoverPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProfilePreview: Story = {
  args: {
    trigger: <Button>Mira Brandt</Button>,
  },
  render: () => (
    <HoverPreview
      trigger={<Button variant="outline">Mira Brandt</Button>}
      media={<Avatar initials="MB" />}
      title="Mira Brandt"
      description="Product lead for workspace quality."
      meta="Last active 4 minutes ago"
      openDelay={0}
    >
      <div className="rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
        Owns release readiness and design-system adoption.
      </div>
    </HoverPreview>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.hover(canvas.getByRole("button", { name: "Mira Brandt" }));
    await expect(await screen.findByText("Product lead for workspace quality.")).toBeTruthy();
  },
};

export const StatusPreview: Story = {
  args: {
    trigger: <Button>Ready for release</Button>,
  },
  render: () => (
    <HoverPreview
      trigger={<Button variant="outline">Ready for release</Button>}
      media={<CircleCheckIcon className="size-5 text-emerald-600" />}
      title="Ready for release"
      description="Checks have passed and package contracts are stable."
      meta="Preview only"
    />
  ),
};

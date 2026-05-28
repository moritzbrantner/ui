import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { Button } from "../stable/button";
import { DisclosurePanel } from "./disclosure-panel";

const meta = {
  title: "Components/Patterns/Disclosure Panel",
  component: DisclosurePanel,
  tags: ["autodocs", "test"],
  args: {
    title: "Applied filters",
    count: 3,
    defaultOpen: true,
    actions: (
      <>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Tune filters">
          <SlidersHorizontalIcon />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Add filter">
          <PlusIcon />
        </Button>
      </>
    ),
    children: (
      <div className="grid gap-2">
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          Status is ready
        </div>
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          Owner is design system
        </div>
        <div className="rounded-md border border-border/60 bg-background px-3 py-2">
          Updated this week
        </div>
      </div>
    ),
  },
} satisfies Meta<typeof DisclosurePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Status is ready")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Applied filters 3" }));
    await expect(canvas.getByText("Status is ready")).not.toBeVisible();
  },
};

export const Closed: Story = {
  args: {
    title: "Archived items",
    count: 12,
    defaultOpen: false,
    actions: (
      <Button type="button" variant="outline" size="sm">
        Restore
      </Button>
    ),
    children: <p className="text-muted-foreground">Archived resources are hidden by default.</p>,
  },
};

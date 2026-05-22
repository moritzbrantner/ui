import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon } from "lucide-react";
import { expect } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  title: "Components/Data Display/Badge",
  component: Badge,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="secondary">
        <CheckIcon />
        Checked
      </Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Checked")).toBeVisible();
  },
};

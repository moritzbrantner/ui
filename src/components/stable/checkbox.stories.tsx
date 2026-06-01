import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-unchecked" {...args} />
      <Label htmlFor="terms-unchecked">Accept terms</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-checked" {...args} />
      <Label htmlFor="terms-checked">Accept terms</Label>
    </div>
  ),
};

export const Toggle: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-toggle" {...args} />
      <Label htmlFor="terms-toggle">Accept terms</Label>
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });

    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
  },
};

export const CssCheck: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-css" {...args} />
      <Label htmlFor="terms-css">Accept terms</Label>
    </div>
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Accept terms" });

    await expect(getComputedStyle(checkbox).width).toBe("16px");
  },
};

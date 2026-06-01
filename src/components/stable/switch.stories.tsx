import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Label htmlFor="auto-refresh">Auto refresh</Label>
      <Switch id="auto-refresh" {...args} />
    </div>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Label htmlFor="compact-mode">Compact mode</Label>
      <Switch id="compact-mode" {...args} />
    </div>
  ),
};

export const Toggle: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Label htmlFor="auto-refresh-toggle">Auto refresh</Label>
      <Switch id="auto-refresh-toggle" {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Auto refresh" });

    await expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "true");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Channels: Story = {
  args: {
    defaultValue: "preview",
  },
  render: (args) => (
    <RadioGroup aria-label="Release channel" className="w-56" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="channel-preview-story" value="preview" />
        <Label htmlFor="channel-preview-story">Preview</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="channel-stable-story" value="stable" />
        <Label htmlFor="channel-stable-story">Stable</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const stable = canvas.getByRole("radio", { name: "Stable" });

    await userEvent.click(stable);
    await expect(stable).toHaveAttribute("aria-checked", "true");
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "preview",
    disabled: true,
  },
  render: Channels.render,
};

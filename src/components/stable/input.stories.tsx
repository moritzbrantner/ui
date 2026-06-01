import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    defaultValue: "Platform package audit",
    id: "project-name",
    placeholder: "Project name",
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="project-name">Project name</Label>
      <Input {...args} />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "missing-version",
    id: "package-version",
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="package-version">Package version</Label>
      <Input {...args} />
    </div>
  ),
};

export const Editable: Story = {
  args: {
    id: "release-channel",
    placeholder: "Release channel",
  },
  render: (args) => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="release-channel">Release channel</Label>
      <Input {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Release channel");

    await userEvent.type(input, "stable");
    await expect(input).toHaveValue("stable");
  },
};

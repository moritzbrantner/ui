import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Notes: Story = {
  args: {
    defaultValue: "Check Storybook before release.",
    id: "release-notes",
  },
  render: (args) => (
    <div className="grid w-96 gap-2">
      <Label htmlFor="release-notes">Release notes</Label>
      <Textarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: "Locked by release automation.",
    disabled: true,
    id: "locked-notes",
  },
  render: (args) => (
    <div className="grid w-96 gap-2">
      <Label htmlFor="locked-notes">Release notes</Label>
      <Textarea {...args} />
    </div>
  ),
};

export const Editable: Story = {
  args: {
    id: "editable-notes",
    placeholder: "Add release notes",
  },
  render: (args) => (
    <div className="grid w-96 gap-2">
      <Label htmlFor="editable-notes">Release notes</Label>
      <Textarea {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByLabelText("Release notes");

    await userEvent.type(textarea, "Ready for release.");
    await expect(textarea).toHaveValue("Ready for release.");
  },
};

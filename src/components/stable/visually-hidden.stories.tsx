import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { VisuallyHidden } from "./visually-hidden";

const meta = {
  title: "Components/Layout/Visually Hidden",
  component: VisuallyHidden,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AccessibleButtonLabel: Story = {
  render: () => (
    <button type="button" style={{ minHeight: 40, minWidth: 40 }}>
      <span aria-hidden="true">?</span>
      <VisuallyHidden>Help</VisuallyHidden>
    </button>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Help" })).toBeVisible();
  },
};

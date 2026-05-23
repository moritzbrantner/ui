import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2Icon } from "lucide-react";
import { expect, fn, screen } from "storybook/test";

import { Button } from "../stable/button";
import { ConfirmAction } from "./confirm-action";

const meta = {
  title: "Components/Overlay/Confirm Action",
  component: ConfirmAction,
  tags: ["autodocs", "test"],
  args: {
    trigger: (
      <Button type="button" variant="destructive">
        <Trash2Icon />
        Delete package
      </Button>
    ),
    title: "Delete package?",
    description: "This removes the package entry from the current workspace view.",
    confirmLabel: "Delete",
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmAction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete package" }));
    await expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const Pending: Story = {
  args: {
    defaultOpen: true,
    pending: true,
    confirmLabel: "Deleting",
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen } from "storybook/test";

import { Button } from "./button";
import { ShortcutHelpDialog, ShortcutList, type ShortcutHelpGroup } from "./shortcut-help";

const groups = [
  {
    id: "global",
    label: "Global",
    shortcuts: [
      { id: "palette", label: "Open command palette", shortcut: "Meta+K" },
      { id: "search", label: "Focus search", shortcut: "/" },
    ],
  },
  {
    id: "editor",
    label: "Editor",
    shortcuts: [
      { id: "save", label: "Save", shortcut: "Meta+S" },
      { id: "preview", label: "Toggle preview", shortcut: "Shift+P" },
    ],
  },
] satisfies ShortcutHelpGroup[];

const meta = {
  title: "Components/Navigation/Shortcut Help",
  component: ShortcutList,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ShortcutList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const List: Story = {
  args: {
    groups,
  },
};

export const Dialog: Story = {
  args: {
    groups,
  },
  render: () => <ShortcutHelpDialog open groups={groups} />,
};

export const OpensFromButton: Story = {
  args: {
    groups,
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="grid gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Keyboard shortcuts
        </Button>
        <ShortcutHelpDialog open={open} onOpenChange={setOpen} groups={groups} />
      </div>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Keyboard shortcuts" }));

    await expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    await expect(await screen.findByText("Open command palette")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
  },
};

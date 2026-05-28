import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";
import { expect, screen } from "storybook/test";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "Components/Overlay/Dropdown Menu",
  component: DropdownMenu,
  tags: ["autodocs", "test"],
  parameters: {
    a11y: {
      test: "todo",
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Open menu">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("menu");

    await expect(menu).toHaveAttribute("data-state", "open");
    await expect(menu.className).toContain("data-[state=open]");
    await expect(screen.getByRole("menuitem", { name: "Duplicate" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
  },
};

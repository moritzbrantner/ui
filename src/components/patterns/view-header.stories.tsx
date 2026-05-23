import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, DownloadIcon, PlusIcon } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "../stable/button";
import { ViewHeader } from "./view-header";

const meta = {
  title: "Components/Navigation/View Header",
  component: ViewHeader,
  tags: ["autodocs", "test"],
  args: {
    title: "Packages",
    eyebrow: "Design system",
    description: "Review published package surfaces, release status, and public API coverage.",
    breadcrumbs: [
      { id: "workspace", label: "Workspace", href: "#" },
      { id: "system", label: "Design system", href: "#" },
      { id: "packages", label: "Packages" },
    ],
    badges: [
      { id: "stable", label: "Stable", variant: "secondary" },
      { id: "public", label: "Public", variant: "outline" },
    ],
    actions: (
      <>
        <Button type="button" variant="outline">
          <DownloadIcon />
          Export
        </Button>
        <Button type="button">
          <PlusIcon />
          New package
        </Button>
      </>
    ),
    actionMenu: {
      label: "Page actions",
      items: [{ id: "archive", label: "Archive", icon: <ArchiveIcon /> }],
      onItemSelect: fn(),
    },
    tabs: [
      { value: "overview", label: "Overview" },
      { value: "contracts", label: "Contracts" },
      { value: "activity", label: "Activity" },
    ],
    defaultActiveTab: "overview",
  },
} satisfies Meta<typeof ViewHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("heading", { name: "Packages" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Packages" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open page actions" }));
    await userEvent.click(canvas.getByRole("menuitem", { name: "Archive" }));
    await expect(args.actionMenu?.onItemSelect).toHaveBeenCalled();
  },
};

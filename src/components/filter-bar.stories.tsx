import type { Meta, StoryObj } from "@storybook/react-vite";
import { DownloadIcon, SlidersHorizontalIcon } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "./button";
import { FilterBar, type FilterBarFilter } from "./filter-bar";

const filters: FilterBarFilter[] = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design system" },
];

const meta = {
  title: "Components/Forms & Inputs/Filter Bar",
  component: FilterBar,
  tags: ["autodocs", "test"],
  args: {
    searchValue: "release",
    searchPlaceholder: "Search rows",
    filters,
    onSearchChange: fn(),
    onClearFilter: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByPlaceholderText("Search rows"));
    await userEvent.type(canvas.getByPlaceholderText("Search rows"), "tokens");
    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(canvas.getByText("Owner")).toBeVisible();
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button type="button" variant="outline" size="sm">
          <SlidersHorizontalIcon />
          View
        </Button>
        <Button type="button" size="sm">
          <DownloadIcon />
          Export
        </Button>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "View" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Export" })).toBeVisible();
  },
};

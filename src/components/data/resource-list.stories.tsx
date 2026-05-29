import type { Meta, StoryObj } from "@storybook/react-vite";
import { DownloadIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "../stable/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../stable/table";
import { ResourceList, ResourceListResetButton } from "./resource-list";

const meta = {
  title: "Components/Data Display/Resource List",
  component: ResourceList,
  tags: ["autodocs", "test"],
  args: {
    title: "Release items",
    description: "A composed shell for searchable, filterable resource collections.",
    searchValue: "release",
    searchPlaceholder: "Search release items",
    onSearchChange: fn(),
    filters: [
      { id: "status", label: "Status", value: "Ready" },
      { id: "owner", label: "Owner", value: "Design system" },
    ],
    onClearFilter: fn(),
    onClearAll: fn(),
    toolbar: (
      <Button type="button">
        <PlusIcon />
        Add item
      </Button>
    ),
    filterActions: (
      <Button type="button" variant="outline" size="sm">
        <DownloadIcon />
        Export
      </Button>
    ),
    children: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Package contract</TableCell>
            <TableCell>Ready</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
} satisfies Meta<typeof ResourceList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Package contract")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear status filter" }));
    await expect(args.onClearFilter).toHaveBeenCalledWith("status");
  },
};

export const WithSelection: Story = {
  args: {
    selectedCount: 2,
    totalCount: 8,
    onClearSelection: fn(),
    selectionActions: (
      <Button type="button" variant="destructive" size="sm">
        Archive
      </Button>
    ),
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("2 of 8 selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear selection" }));
    await expect(args.onClearSelection).toHaveBeenCalled();
  },
};

export const Empty: Story = {
  args: {
    status: "empty",
    emptyTitle: "No release items",
    emptyDescription: "Clear the active filters or create a new item.",
    stateActions: <ResourceListResetButton onClick={fn()} />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No release items")).toBeVisible();
  },
};

export const Error: Story = {
  args: {
    status: "error",
    errorTitle: "Could not load release items",
    errorDescription: "The package registry returned an unavailable response.",
    stateActions: (
      <Button type="button" variant="destructive" size="sm">
        <RefreshCwIcon />
        Retry
      </Button>
    ),
  },
};

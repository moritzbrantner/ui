import type { ColumnDef } from "@tanstack/react-table";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DataTable } from "./data-table";

type PackageRow = {
  name: string;
  status: string;
  owner: string;
};

const columns: ColumnDef<PackageRow>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "owner", header: "Owner" },
];

const data = [
  { name: "UI package", status: "Ready", owner: "Design system" },
  { name: "Frontend app", status: "Review", owner: "Product" },
  { name: "Docs", status: "Blocked", owner: "Platform" },
];

const meta = {
  title: "Components/Data Display/Data Table",
  component: DataTable<PackageRow, unknown>,
  tags: ["autodocs", "test"],
  args: {
    columns,
    data,
    searchColumn: "name",
  },
} satisfies Meta<typeof DataTable<PackageRow, unknown>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LegacySimpleTable: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByPlaceholderText("Filter results..."), "Docs");
    await expect(canvas.getByText("Docs")).toBeVisible();
  },
};

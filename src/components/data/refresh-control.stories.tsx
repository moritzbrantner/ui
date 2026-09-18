import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { RefreshControl } from "./resource-list";

const intervalOptions = [
  { label: "5 seconds", value: 5_000 },
  { label: "15 seconds", value: 15_000 },
  { label: "30 seconds", value: 30_000 },
];

const meta = {
  title: "Components/Data Display/Refresh Control",
  component: RefreshControl,
  tags: ["autodocs", "test"],
  args: {
    onRefresh: fn(),
    lastUpdated: "Updated just now",
  },
} satisfies Meta<typeof RefreshControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText("Updated just now")).toBeVisible();
  },
};

export const WithAutoRefresh: Story = {
  args: {
    autoRefresh: true,
    onAutoRefreshChange: fn(),
    intervalMs: 15_000,
    intervalOptions,
    onIntervalMsChange: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("switch", { name: "Auto refresh" }));
    await expect(args.onAutoRefreshChange).toHaveBeenCalledWith(false);
    await expect(canvas.getByRole("combobox", { name: "Refresh interval" })).toBeEnabled();
  },
};

export const Refreshing: Story = {
  args: {
    isRefreshing: true,
    lastUpdated: "Last successful refresh 20 seconds ago",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Refreshing" })).toBeDisabled();
  },
};

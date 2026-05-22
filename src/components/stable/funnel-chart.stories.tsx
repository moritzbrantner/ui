import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FunnelChart } from "./funnel-chart";

const meta = {
  title: "Components/Data Display/Funnel Chart",
  component: FunnelChart,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof FunnelChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConversionFunnel: Story = {
  args: {
    ariaLabel: "Conversion funnel",
    data: [
      { id: "visitors", label: "Visitors", value: 48000 },
      { id: "trial", label: "Trial starts", value: 8200 },
      { id: "qualified", label: "Qualified", value: 2900 },
      { id: "customers", label: "Customers", value: 940 },
    ],
    caption: "Conversion from visitor traffic to new customers.",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Conversion funnel" })).toBeVisible();
    await expect(canvas.getAllByText("Customers")[0]).toBeVisible();
  },
};

export const PipelineStages: Story = {
  args: {
    ariaLabel: "Pipeline stages",
    data: [
      { id: "mql", label: "MQL", value: 1420 },
      { id: "sql", label: "SQL", value: 680 },
      { id: "proposal", label: "Proposal", value: 260 },
      { id: "closed", label: "Closed won", value: 92 },
    ],
    formatValue: (value) => `$${Math.round(value / 10)}k`,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("Closed won")[0]).toBeVisible();
  },
};

export const Empty: Story = {
  args: { data: [{ id: "empty", label: "Empty", value: 0 }], emptyMessage: "No conversion data." },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No conversion data.")).toBeVisible();
  },
};

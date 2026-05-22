import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityIcon, AlertTriangleIcon, TrendingUpIcon } from "lucide-react";
import { expect } from "storybook/test";

import { MetricStrip } from "./metric-strip";

const meta = {
  title: "Components/Data Display/Metric Strip",
  component: MetricStrip,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof MetricStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  {
    id: "pipeline",
    label: "Qualified pipeline",
    value: "$1.24M",
    delta: "+18%",
    deltaTone: "positive" as const,
    description: "vs last quarter",
    icon: TrendingUpIcon,
  },
  {
    id: "activation",
    label: "Activation",
    value: "74%",
    delta: "+6 pts",
    deltaTone: "positive" as const,
    description: "target 70%",
    icon: ActivityIcon,
  },
  {
    id: "risks",
    label: "Open risks",
    value: "5",
    delta: "2 critical",
    deltaTone: "warning" as const,
    description: "needs review",
    icon: AlertTriangleIcon,
  },
];

export const Default: Story = {
  args: { items: items.slice(0, 2) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getByText("Qualified pipeline")).toBeVisible();
  },
};

export const WithDeltas: Story = {
  args: { items },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("+18%")).toBeVisible();
    await expect(canvas.getByText("2 critical")).toBeVisible();
  },
};

export const DenseDashboard: Story = {
  render: () => (
    <div className="max-w-5xl">
      <MetricStrip
        items={[
          ...items,
          { id: "sla", label: "SLA", value: "99.94%", delta: "-0.02", deltaTone: "neutral" },
        ]}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("99.94%")).toBeVisible();
  },
};

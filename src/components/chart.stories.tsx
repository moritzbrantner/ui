import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ChartBarGraph, ChartLineGraph } from "./chart";

const revenueData = [
  { month: "Jan", revenue: 42, forecast: 36 },
  { month: "Feb", revenue: 58, forecast: 46 },
  { month: "Mar", revenue: 51, forecast: 52 },
  { month: "Apr", revenue: 72, forecast: 61 },
  { month: "May", revenue: 86, forecast: 78 },
  { month: "Jun", revenue: 94, forecast: 88 },
];

const series = [
  { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
  { key: "forecast", label: "Forecast", color: "var(--chart-2)" },
];

function ChartPreview() {
  return (
    <div className="grid max-w-4xl gap-8">
      <ChartLineGraph
        ariaLabel="Revenue and forecast trend"
        data={revenueData}
        series={series}
        xKey="month"
        caption="Monthly recurring revenue, in thousands."
        pretext={[
          {
            id: "target",
            x: 440,
            y: 82,
            children: "Target corridor",
            className: "fill-muted-foreground/70",
          },
        ]}
      />
      <ChartBarGraph
        ariaLabel="Revenue and forecast bars"
        data={revenueData}
        series={series}
        xKey="month"
        caption="Grouped monthly totals, in thousands."
      />
    </div>
  );
}

const meta = {
  title: "Components/Chart",
  component: ChartPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ChartPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Revenue and forecast trend" })).toBeVisible();
    await expect(canvas.getByText("Target corridor")).toBeInTheDocument();
  },
};

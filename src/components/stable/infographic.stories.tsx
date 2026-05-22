import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import {
  Infographic,
  InfographicBody,
  InfographicCallout,
  InfographicDescription,
  InfographicFooter,
  InfographicHeader,
  InfographicLegend,
  InfographicMetric,
  InfographicMetricGrid,
  InfographicTitle,
} from "./infographic";

const meta = {
  title: "Components/Data Display/Infographic",
  component: Infographic,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Infographic>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReleaseSummary: Story = {
  render: () => (
    <Infographic ariaLabel="Release summary" caption="Source: May release readiness report.">
      <InfographicHeader>
        <InfographicTitle>Business visuals release</InfographicTitle>
        <InfographicDescription>
          Stable read-only components for dashboards, release reports, and stakeholder summaries.
        </InfographicDescription>
      </InfographicHeader>
      <InfographicBody>
        <InfographicMetricGrid>
          <InfographicMetric label="Stable components" value="7" color="var(--chart-1)" />
          <InfographicMetric label="Story coverage" value="21" color="var(--chart-2)" />
          <InfographicMetric label="Root exports" value="100%" color="var(--chart-3)" />
          <InfographicMetric label="Editor promotions" value="0" color="var(--chart-4)" />
        </InfographicMetricGrid>
        <InfographicCallout tone="accent">
          Release posture: promote read-only business visualization, keep editor-heavy workflows in
          labs.
        </InfographicCallout>
      </InfographicBody>
    </Infographic>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Release summary")).toBeVisible();
    await expect(canvas.getByText("Business visuals release")).toBeVisible();
  },
};

export const ExecutiveBrief: Story = {
  render: () => (
    <Infographic ariaLabel="Executive brief">
      <InfographicHeader>
        <InfographicTitle>Quarterly operating brief</InfographicTitle>
        <InfographicDescription>
          Product operations moved from planning risk to launch readiness.
        </InfographicDescription>
      </InfographicHeader>
      <InfographicBody>
        <InfographicMetricGrid>
          <InfographicMetric label="Readiness" value="86%" />
          <InfographicMetric label="Blocked work" value="3" color="var(--chart-5)" />
        </InfographicMetricGrid>
      </InfographicBody>
    </Infographic>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Quarterly operating brief")).toBeVisible();
  },
};

export const SourceAndLegend: Story = {
  render: () => (
    <Infographic ariaLabel="Source and legend example">
      <InfographicHeader>
        <InfographicTitle>Launch source mix</InfographicTitle>
      </InfographicHeader>
      <InfographicFooter>
        <InfographicLegend
          items={[
            { id: "product", label: "Product" },
            { id: "sales", label: "Sales" },
            { id: "support", label: "Support" },
          ]}
        />
      </InfographicFooter>
    </Infographic>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Support")).toBeVisible();
  },
};

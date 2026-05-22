import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ComparisonMatrix, ComparisonMatrixBadge } from "./comparison-matrix";

const meta = {
  title: "Components/Data Display/Comparison Matrix",
  component: ComparisonMatrix,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ComparisonMatrix>;

export default meta;

type Story = StoryObj<typeof meta>;

const columns = [
  { id: "starter", label: "Starter", description: "Small teams" },
  { id: "growth", label: "Growth", description: "Scaling programs" },
  { id: "enterprise", label: "Enterprise", description: "Complex governance" },
];

export const PlanComparison: Story = {
  args: {
    columns,
    rows: [
      {
        id: "support",
        label: "Support model",
        values: {
          starter: "Community",
          growth: "Priority queue",
          enterprise: "Named success team",
        },
        toneByColumn: { enterprise: "positive" },
      },
      {
        id: "security",
        label: "Security review",
        values: {
          starter: <ComparisonMatrixBadge>Basic</ComparisonMatrixBadge>,
          growth: <ComparisonMatrixBadge tone="positive">SOC 2</ComparisonMatrixBadge>,
          enterprise: <ComparisonMatrixBadge tone="positive">Custom</ComparisonMatrixBadge>,
        },
      },
      {
        id: "sla",
        label: "SLA",
        values: { growth: "99.5%", enterprise: "99.9%" },
        toneByColumn: { starter: "warning" },
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Named success team")).toBeVisible();
  },
};

export const FeatureCoverage: Story = {
  args: {
    columns,
    rows: [
      {
        id: "charts",
        label: "Charts",
        values: { starter: "Core", growth: "Core", enterprise: "Core" },
      },
      {
        id: "diagrams",
        label: "Business diagrams",
        values: { starter: "Limited", growth: "Full", enterprise: "Full" },
        toneByColumn: { starter: "neutral", growth: "positive", enterprise: "positive" },
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Business diagrams")).toBeVisible();
  },
};

export const MobileScroll: Story = {
  args: {
    columns: [...columns, { id: "global", label: "Global", description: "Distributed orgs" }],
    rows: [
      {
        id: "coverage",
        label: "Coverage",
        values: {
          starter: "1 region",
          growth: "3 regions",
          enterprise: "8 regions",
          global: "12 regions",
        },
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("12 regions")).toBeVisible();
  },
};

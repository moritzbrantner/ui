import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RelationshipMap } from "./relationship-map";

const meta = {
  title: "Components/Data Display/Relationship Map",
  component: RelationshipMap,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof RelationshipMap>;

export default meta;

type Story = StoryObj<typeof meta>;

const stakeholderNodes = [
  {
    id: "product",
    label: "Product Ops",
    description: "Release scope and readiness",
    group: "Owner",
    x: 0,
    y: 90,
    tone: "accent" as const,
  },
  {
    id: "design",
    label: "Design Systems",
    description: "Stable visual components",
    group: "Delivery",
    x: 290,
    y: 0,
    tone: "success" as const,
  },
  {
    id: "frontend",
    label: "Frontend UI",
    description: "Consumer package validation",
    group: "Consumer",
    x: 290,
    y: 180,
  },
  {
    id: "security",
    label: "Security",
    description: "Release approval",
    group: "Governance",
    x: 580,
    y: 90,
    tone: "warning" as const,
  },
];

export const StakeholderMap: Story = {
  args: {
    ariaLabel: "Stakeholder map",
    nodes: stakeholderNodes,
    edges: [
      { id: "product-design", source: "product", target: "design", label: "funds" },
      { id: "product-frontend", source: "product", target: "frontend", label: "validates" },
      {
        id: "security",
        source: "frontend",
        target: "security",
        label: "approves",
        kind: "risk" as const,
      },
    ],
    caption: "Read-only stakeholder dependency map for release reporting.",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Stakeholder map" })).toBeVisible();
    await expect(canvas.getByText("Product Ops")).toBeVisible();
  },
};

export const SystemDependencies: Story = {
  args: {
    ariaLabel: "System dependencies",
    nodes: [
      { id: "ui", label: "UI package", tone: "accent" as const },
      { id: "storybook", label: "Storybook" },
      { id: "consumer", label: "Consumer fixture" },
      { id: "visual", label: "Visual checks" },
    ],
    edges: [
      { id: "ui-storybook", source: "ui", target: "storybook", kind: "dependency" as const },
      { id: "ui-consumer", source: "ui", target: "consumer", kind: "success" as const },
      {
        id: "storybook-visual",
        source: "storybook",
        target: "visual",
        kind: "dependency" as const,
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Visual checks")).toBeVisible();
  },
};

export const RiskMap: Story = {
  args: {
    ariaLabel: "Release risk map",
    nodes: stakeholderNodes,
    edges: [
      {
        id: "approval",
        source: "security",
        target: "product",
        label: "blocks",
        kind: "blocking" as const,
        direction: "backward" as const,
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("blocks")).toBeVisible();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Avatar } from "./avatar";
import { OrgChart } from "./org-chart";

const meta = {
  title: "Components/Data Display/Org Chart",
  component: OrgChart,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof OrgChart>;

export default meta;

type Story = StoryObj<typeof meta>;

const teamNodes = [
  {
    id: "mara",
    label: "Mara Klein",
    description: "VP Product Operations",
    meta: "Release owner",
    avatar: <Avatar initials="MK" />,
    children: [
      {
        id: "nina",
        label: "Nina Patel",
        description: "Design Systems",
        meta: "UI package",
        avatar: <Avatar initials="NP" />,
      },
      {
        id: "omar",
        label: "Omar Silva",
        description: "Frontend Platform",
        meta: "Consumer checks",
        avatar: <Avatar initials="OS" />,
        children: [{ id: "ivy", label: "Ivy Chen", description: "Quality" }],
      },
    ],
  },
];

export const TeamStructure: Story = {
  args: { nodes: teamNodes },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Mara Klein")).toBeVisible();
    await expect(canvas.getByText("Ivy Chen")).toBeVisible();
  },
};

export const CompactHierarchy: Story = {
  args: {
    nodes: [
      {
        id: "exec",
        label: "Executive sponsor",
        children: [
          { id: "ops", label: "Operations" },
          { id: "gtm", label: "Go to market" },
          { id: "support", label: "Support" },
        ],
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Go to market")).toBeVisible();
  },
};

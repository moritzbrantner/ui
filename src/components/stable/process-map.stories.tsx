import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircleIcon, PackageIcon, RocketIcon } from "lucide-react";
import { expect } from "storybook/test";

import { ProcessMap } from "./process-map";

const meta = {
  title: "Components/Data Display/Process Map",
  component: ProcessMap,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ProcessMap>;

export default meta;

type Story = StoryObj<typeof meta>;

const releaseSteps = [
  {
    id: "scope",
    label: "Scope",
    description: "Release plan approved by product and design.",
    meta: "Done",
    status: "done" as const,
    tone: "success" as const,
    icon: CheckCircleIcon,
  },
  {
    id: "build",
    label: "Build",
    description: "Business visuals, stories, and package checks.",
    meta: "In progress",
    status: "active" as const,
    tone: "accent" as const,
    icon: PackageIcon,
  },
  {
    id: "ship",
    label: "Ship",
    description: "Release notes, tag, and publish workflow.",
    meta: "Pending",
    status: "pending" as const,
    icon: RocketIcon,
  },
];

export const ReleaseLifecycle: Story = {
  args: { steps: releaseSteps },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getByText("Build")).toBeVisible();
  },
};

export const BlockedStep: Story = {
  args: {
    steps: [
      releaseSteps[0],
      {
        id: "approval",
        label: "Approval",
        description: "Legal review needs a final source note.",
        meta: "Blocked",
        status: "blocked" as const,
        tone: "danger" as const,
      },
      releaseSteps[2],
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Blocked")).toBeVisible();
  },
};

export const Vertical: Story = {
  args: { steps: releaseSteps, orientation: "vertical" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Release notes, tag, and publish workflow.")).toBeVisible();
  },
};

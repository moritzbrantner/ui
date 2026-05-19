import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AvatarCollection, type AvatarCollectionItem } from "./avatar-collection";

const users = [
  { name: "Mira Brandt", initials: "MB", size: "xl", shape: "round", online: true },
  { name: "Platform Design", initials: "PD", size: "xl", shape: "square" },
  { name: "Design Systems", initials: "DS", size: "xl", shape: "hexagonal" },
  { name: "Release Crew", initials: "RC", size: "xl", shape: "octagonal" },
  { name: "Support", initials: "SP", size: "xl", shape: "round" },
] satisfies AvatarCollectionItem[];

const meta = {
  title: "Components/Data Display/Avatar Collection",
  component: AvatarCollection,
  tags: ["autodocs", "test"],
  argTypes: {
    spacing: {
      control: "select",
      options: ["tight", "normal", "loose"],
    },
  },
} satisfies Meta<typeof AvatarCollection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    users,
    maxVisible: 4,
    overflowShape: "hexagonal",
  },
  render: (args) => <AvatarCollection {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("MB")).toBeVisible();
    await expect(canvas.getByText("PD")).toBeVisible();
    await expect(canvas.getByText("DS")).toBeVisible();
    await expect(canvas.getByText("RC")).toBeVisible();
    await expect(canvas.getByText("+1")).toBeVisible();
  },
};

export const NormalSpacing: Story = {
  args: {
    users,
    maxVisible: 4,
    overflowShape: "hexagonal",
    spacing: "normal",
  },
  render: (args) => <AvatarCollection {...args} />,
};

export const LooseSpacing: Story = {
  args: {
    users,
    maxVisible: 4,
    overflowShape: "round",
    spacing: "loose",
  },
  render: (args) => <AvatarCollection {...args} />,
};

export const SmallTightStack: Story = {
  args: {
    users: users.map((user) => ({ ...user, size: "sm" })),
    maxVisible: 5,
    spacing: "tight",
  },
  render: (args) => <AvatarCollection {...args} />,
};

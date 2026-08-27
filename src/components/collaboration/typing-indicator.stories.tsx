import type { Meta, StoryObj } from "@storybook/react-vite";

import { TypingIndicator } from "./typing-indicator";

const meta = {
  title: "Components/Collaboration/Typing Indicator",
  component: TypingIndicator,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof TypingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneParticipant: Story = { args: { label: "Ada is typing" } };

export const MultipleParticipants: Story = {
  args: { label: "Ada, Grace, and Linus are typing" },
};

export const Inline: Story = {
  args: { label: "Drafting a reply", inline: true },
};

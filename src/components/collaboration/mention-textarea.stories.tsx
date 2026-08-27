import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { MentionTextarea } from "./mention-textarea";

function MentionExample() {
  const [value, setValue] = React.useState("Ask @");
  const query = value.match(/@([^\s@]*)$/)?.[1]?.toLocaleLowerCase() ?? "";
  const candidates = [
    { id: "ada", label: "Ada Lovelace", secondaryText: "Engineering" },
    { id: "grace", label: "Grace Hopper", secondaryText: "Research" },
    { id: "linus", label: "Linus Torvalds", secondaryText: "Platform" },
  ].filter((candidate) => candidate.label.toLocaleLowerCase().includes(query));

  return (
    <MentionTextarea
      className="w-[min(34rem,90vw)]"
      aria-label="Collaborative note"
      value={value}
      candidates={candidates}
      onValueChange={setValue}
      suggestionsLabel="Mention suggestions"
      emptyContent="No collaborators found"
      placeholder="Type @ to mention someone"
    />
  );
}

const meta = {
  title: "Components/Collaboration/Mention Textarea",
  component: MentionTextarea,
  tags: ["autodocs", "test"],
  args: {
    value: "",
    candidates: [],
    onValueChange: () => undefined,
    suggestionsLabel: "Mention suggestions",
  },
} satisfies Meta<typeof MentionTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardFirst: Story = { render: () => <MentionExample /> };

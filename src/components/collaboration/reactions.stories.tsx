import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { ReactionButton, ReactionGroup, ReactionPicker } from "./reactions";

function ReactionExample() {
  const [active, setActive] = React.useState(["applaud"]);
  return (
    <ReactionGroup aria-label="Message reactions" className="max-w-72">
      {[
        {
          key: "applaud",
          reaction: "👏",
          shortLabel: "Applaud",
          label: "Applaud, 8 reactions",
          count: "8",
        },
        {
          key: "heart",
          reaction: "❤️",
          shortLabel: "Heart",
          label: "Heart, 4 reactions",
          count: "4",
        },
        {
          key: "idea",
          reaction: "💡",
          shortLabel: "Good idea",
          label: "Good idea, 2 reactions",
          count: "2",
        },
      ].map((item) => (
        <ReactionButton
          key={item.key}
          active={active.includes(item.key)}
          reaction={item.reaction}
          label={item.shortLabel}
          count={item.count}
          countAccessibleLabel={item.label}
          onClick={() =>
            setActive((current) =>
              current.includes(item.key)
                ? current.filter((key) => key !== item.key)
                : [...current, item.key],
            )
          }
        />
      ))}
      <ReactionPicker
        label="Add reaction"
        trigger="+"
        options={[
          { key: "rocket", reaction: "🚀", label: "Rocket" },
          { key: "eyes", reaction: "👀", label: "Watching" },
        ]}
      />
    </ReactionGroup>
  );
}

const meta = {
  title: "Components/Collaboration/Reactions",
  component: ReactionGroup,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ReactionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = { render: () => <ReactionExample /> };

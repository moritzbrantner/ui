import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import {
  ReorderableItem,
  ReorderableList,
  ReorderHandle,
  type ReorderChange,
} from "./resource-list";

const initialItems = [
  { id: "design", label: "Design review" },
  { id: "implementation", label: "Implementation" },
  { id: "verification", label: "Verification" },
];

function ReorderableDemo({ onReorder }: { onReorder?: (change: ReorderChange) => void }) {
  const [items, setItems] = React.useState(initialItems);

  return (
    <ReorderableList
      aria-label="Release priorities"
      className="max-w-md"
      onReorder={(change) => {
        onReorder?.(change);
        setItems((currentItems) => {
          const nextItems = [...currentItems];
          const [movedItem] = nextItems.splice(change.fromIndex, 1);

          if (!movedItem) {
            return currentItems;
          }

          nextItems.splice(change.toIndex, 0, movedItem);
          return nextItems;
        });
      }}
    >
      {items.map((item, index) => (
        <ReorderableItem key={item.id} id={item.id} index={index}>
          <div className="flex min-h-12 items-center gap-2 px-2 py-1">
            <ReorderHandle aria-label={`Move ${item.label}`} />
            <span className="min-w-0 flex-1 text-sm font-medium">{item.label}</span>
          </div>
        </ReorderableItem>
      ))}
    </ReorderableList>
  );
}

const meta = {
  title: "Components/Data Display/Reorderable List",
  component: ReorderableList,
  tags: ["autodocs", "test"],
  args: {
    onReorder: fn(),
  },
  render: (args) => <ReorderableDemo onReorder={args.onReorder} />,
} satisfies Meta<typeof ReorderableList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Release priorities" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Move Design review" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};

export const WithLockedItem: Story = {
  render: (args) => (
    <ReorderableList aria-label="Mixed priorities" className="max-w-md" onReorder={args.onReorder}>
      <ReorderableItem id="fixed" index={0} disabled>
        <div className="flex min-h-12 items-center gap-2 px-2 py-1">
          <ReorderHandle aria-label="Move fixed item" />
          <span className="text-sm font-medium">Fixed system item</span>
        </div>
      </ReorderableItem>
      <ReorderableItem id="movable" index={1}>
        <div className="flex min-h-12 items-center gap-2 px-2 py-1">
          <ReorderHandle aria-label="Move custom item" />
          <span className="text-sm font-medium">Custom item</span>
        </div>
      </ReorderableItem>
    </ReorderableList>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Move fixed item" })).toBeDisabled();
  },
};

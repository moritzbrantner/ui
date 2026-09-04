import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { Button } from "../stable/button";
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

function moveItems<T>(items: readonly T[], change: ReorderChange) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(change.fromIndex, 1);

  if (!movedItem) {
    return [...items];
  }

  nextItems.splice(change.toIndex, 0, movedItem);
  return nextItems;
}

function ReorderableDemo({ onReorder }: { onReorder?: (change: ReorderChange) => void }) {
  const [items, setItems] = React.useState(initialItems);

  return (
    <ReorderableList
      aria-label="Release priorities"
      className="max-w-md"
      onReorder={(change) => {
        onReorder?.(change);
        setItems((currentItems) => moveItems(currentItems, change));
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

function InteractiveChildrenDemo({ onReorder }: { onReorder?: (change: ReorderChange) => void }) {
  const [opened, setOpened] = React.useState(false);

  return (
    <div className="grid max-w-md gap-3">
      <ReorderableList aria-label="Interactive priorities" onReorder={onReorder}>
        <ReorderableItem id="design" index={0}>
          <div className="flex min-h-12 items-center gap-2 px-2 py-1">
            <ReorderHandle aria-label="Move Design review" />
            <span className="min-w-0 flex-1 text-sm font-medium">Design review</span>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpened(true)}>
              Open details
            </Button>
          </div>
        </ReorderableItem>
        <ReorderableItem id="implementation" index={1}>
          <div className="flex min-h-12 items-center gap-2 px-2 py-1">
            <ReorderHandle aria-label="Move Implementation" />
            <span className="min-w-0 flex-1 text-sm font-medium">Implementation</span>
          </div>
        </ReorderableItem>
      </ReorderableList>
      {opened ? <p className="text-sm text-muted-foreground">Details opened</p> : null}
    </div>
  );
}

function OptimisticPersistenceDemo({ onReorder }: { onReorder?: (change: ReorderChange) => void }) {
  const [items, setItems] = React.useState(initialItems);
  const [failNextSave, setFailNextSave] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  async function persistReorder(change: ReorderChange) {
    const previousItems = items;
    const nextItems = moveItems(items, change);

    onReorder?.(change);
    setItems(nextItems);
    setSaveStatus("saving");

    await Promise.resolve();

    if (failNextSave) {
      setItems(previousItems);
      setFailNextSave(false);
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saved");
  }

  const statusLabel = {
    idle: "Order has not changed",
    saving: "Saving order",
    saved: "Order saved",
    error: "Save failed. Previous order restored.",
  }[saveStatus];

  return (
    <div className="grid max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setFailNextSave(true)}>
          Fail next save
        </Button>
        <span role="status" className="text-sm text-muted-foreground">
          {statusLabel}
        </span>
      </div>
      <ReorderableList
        aria-label="Persisted priorities"
        onReorder={(change) => void persistReorder(change)}
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
    </div>
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

export const KeyboardReorder: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const handle = canvas.getByRole("button", { name: "Move Design review" });
    handle.focus();

    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");

    await expect(args.onReorder).toHaveBeenCalledWith({
      id: "design",
      fromIndex: 0,
      toIndex: 1,
    });
    await expect(canvas.getAllByRole("listitem")[1]).toHaveTextContent("Design review");
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

export const InteractiveChildren: Story = {
  render: (args) => <InteractiveChildrenDemo onReorder={args.onReorder} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open details" }));

    await expect(canvas.getByText("Details opened")).toBeVisible();
    await expect(args.onReorder).not.toHaveBeenCalled();
  },
};

export const OptimisticPersistenceRollback: Story = {
  render: (args) => <OptimisticPersistenceDemo onReorder={args.onReorder} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Fail next save" }));

    const handle = canvas.getByRole("button", { name: "Move Design review" });
    handle.focus();
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");

    await expect(args.onReorder).toHaveBeenCalledWith({
      id: "design",
      fromIndex: 0,
      toIndex: 1,
    });
    await canvas.findByText("Save failed. Previous order restored.");
    await expect(canvas.getAllByRole("listitem")[0]).toHaveTextContent("Design review");
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArchiveIcon, CheckIcon, FileTextIcon, ImageIcon, Trash2Icon } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "./button";
import { SelectionToolbar } from "./selection-toolbar";

const selectionItems = [
  { id: "brand-guide", title: "Brand guide", meta: "12 pages", icon: FileTextIcon },
  { id: "hero-image", title: "Hero image", meta: "4.8 MB", icon: ImageIcon },
  { id: "dashboard-chart", title: "Dashboard chart", meta: "Updated today", icon: ImageIcon },
  { id: "release-notes", title: "Release notes", meta: "Draft", icon: FileTextIcon },
] as const;

type InteractiveSelectionToolbarProps = {
  onClearSelection?: () => void;
};

function InteractiveSelectionToolbar({
  onClearSelection = () => undefined,
}: InteractiveSelectionToolbarProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["brand-guide"]);

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }

  function clearSelection() {
    setSelectedIds([]);
    onClearSelection();
  }

  return (
    <div className="grid w-[640px] max-w-[calc(100vw-2rem)] gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {selectionItems.map((item) => {
          const selected = selectedIds.includes(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              data-selected={selected}
              className="group flex min-h-20 items-center gap-3 rounded-md border border-border/60 bg-card/70 p-3 text-left text-card-foreground shadow-[var(--ui-shadow-surface)] outline-none transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-ring/40 hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50 data-[selected=true]:border-primary/60 data-[selected=true]:bg-primary/10 data-[selected=true]:shadow-[var(--ui-shadow-interactive)]"
              onClick={() => toggleSelection(item.id)}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground">
                {selected ? <CheckIcon /> : <Icon />}
              </span>
              <span className="grid min-w-0 gap-1">
                <span className="truncate text-sm font-medium">{item.title}</span>
                <span className="truncate text-xs text-muted-foreground">{item.meta}</span>
              </span>
            </button>
          );
        })}
      </div>
      <SelectionToolbar
        selectedCount={selectedIds.length}
        totalCount={selectionItems.length}
        onClearSelection={clearSelection}
      >
        <Button variant="outline" size="sm">
          <ArchiveIcon />
          Archive
        </Button>
        <Button variant="destructive" size="sm">
          <Trash2Icon />
          Delete
        </Button>
      </SelectionToolbar>
    </div>
  );
}

const meta = {
  title: "Components/Actions/Selection Toolbar",
  component: SelectionToolbar,
  tags: ["autodocs", "test"],
  args: {
    selectedCount: 3,
    totalCount: 18,
    onClearSelection: fn(),
  },
} satisfies Meta<typeof SelectionToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SelectionToolbar {...args}>
      <Button variant="outline" size="sm">
        <ArchiveIcon />
        Archive
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2Icon />
        Delete
      </Button>
    </SelectionToolbar>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Clear selection/i }));

    await expect(args.onClearSelection).toHaveBeenCalled();
  },
};

export const Sticky: Story = {
  args: {
    sticky: true,
  },
};

export const InteractiveSelection: Story = {
  args: {
    onClearSelection: fn(),
  },
  render: (args) => <InteractiveSelectionToolbar onClearSelection={args.onClearSelection} />,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("1 of 4 selected")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /Dashboard chart/ }));
    await expect(canvas.getByText("2 of 4 selected")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /Brand guide/ }));
    await expect(canvas.getByText("1 of 4 selected")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /Clear selection/i }));
    await expect(canvas.queryByText("1 of 4 selected")).not.toBeInTheDocument();
    await expect(args.onClearSelection).toHaveBeenCalledTimes(1);
  },
};

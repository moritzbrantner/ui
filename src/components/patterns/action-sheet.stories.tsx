import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, CopyIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { expect, fn, screen } from "storybook/test";

import { ActionSheet } from "./action-sheet";
import { Button } from "../stable/button";
import type { MenuActionItem } from "./menu-actions";

const meta = {
  title: "Components/Overlay/Action Sheet",
  component: ActionSheet,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ActionSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

const sheetItems = [
  { id: "duplicate", label: "Duplicate", icon: <CopyIcon /> },
  { id: "archive", label: "Archive", icon: <ArchiveIcon /> },
  { id: "delete", label: "Delete", icon: <Trash2Icon />, destructive: true },
] satisfies MenuActionItem[];

export const Bottom: Story = {
  args: {
    items: sheetItems,
    onItemSelect: fn(),
  },
  render: (args) => (
    <ActionSheet
      {...args}
      trigger={<Button variant="outline">Open sheet</Button>}
      title="Actions"
      description="Choose an action for the selected item."
      items={sheetItems}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open sheet" }));
    await expect(screen.getByRole("dialog")).toBeTruthy();
    await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toBeTruthy();
    await expect(args.onItemSelect).not.toHaveBeenCalled();
  },
};

export const RightSide: Story = {
  args: {
    items: sheetItems,
  },
  render: () => (
    <ActionSheet
      direction="right"
      trigger={
        <Button variant="outline" size="icon-sm" aria-label="Open side actions">
          <MoreHorizontalIcon />
        </Button>
      }
      title="Side actions"
      description="Choose an action for this side panel."
      items={sheetItems}
    />
  ),
};

export const CheckboxAndRadio: Story = {
  args: {
    items: [],
  },
  render: () => {
    const [visible, setVisible] = React.useState(false);
    const [scope, setScope] = React.useState("assigned");
    const items = [
      {
        id: "visible",
        type: "checkbox",
        label: "Include archived",
        checked: visible,
        onCheckedChange: setVisible,
      },
      {
        id: "scope",
        type: "radio-group",
        label: "Scope",
        value: scope,
        options: [
          { id: "assigned", label: "Assigned to me", value: "assigned" },
          { id: "all", label: "All items", value: "all" },
        ],
        onValueChange: setScope,
      },
    ] satisfies MenuActionItem[];

    return (
      <ActionSheet
        trigger={<Button variant="outline">Filter actions</Button>}
        title="Filters"
        description="Choose filters for the current list."
        items={items}
      />
    );
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
  render: () => (
    <ActionSheet
      trigger={<Button variant="outline">Open empty sheet</Button>}
      title="Actions"
      description="No actions are available for this state."
      items={[]}
    />
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveIcon, CopyIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { expect, fn, screen } from "storybook/test";

import { ActionMenu } from "./action-menu";
import { Button } from "../stable/button";
import type { MenuActionItem } from "./menu-actions";

const meta = {
  title: "Components/Overlay/Action Menu",
  component: ActionMenu,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const commandItems = [
  { id: "duplicate", label: "Duplicate", icon: <CopyIcon /> },
  { id: "archive", label: "Archive", icon: <ArchiveIcon /> },
  { id: "delete", label: "Delete", icon: <Trash2Icon />, destructive: true },
] satisfies MenuActionItem[];

export const Basic: Story = {
  args: {
    trigger: <Button>Open actions</Button>,
    items: commandItems,
    onItemSelect: fn(),
  },
  render: (args) => (
    <ActionMenu
      {...args}
      trigger={
        <Button type="button" variant="outline" size="icon-sm" aria-label="Open row actions">
          <MoreHorizontalIcon />
        </Button>
      }
      label="Row actions"
      modal={false}
      items={commandItems}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open row actions" }));
    await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toBeTruthy();
    await expect(args.onItemSelect).not.toHaveBeenCalled();
  },
};

export const CheckboxAndRadio: Story = {
  args: {
    trigger: <Button>View options</Button>,
    items: [],
  },
  render: () => {
    const [visible, setVisible] = React.useState(true);
    const [density, setDensity] = React.useState("comfortable");
    const items = [
      {
        id: "show-archived",
        type: "checkbox",
        label: "Show archived",
        checked: visible,
        onCheckedChange: setVisible,
      },
      { id: "separator", type: "separator" },
      {
        id: "density",
        type: "radio-group",
        label: "Density",
        value: density,
        options: [
          { id: "comfortable", label: "Comfortable", value: "comfortable" },
          { id: "compact", label: "Compact", value: "compact" },
        ],
        onValueChange: setDensity,
      },
    ] satisfies MenuActionItem[];

    return (
      <ActionMenu
        trigger={<Button variant="outline">View options</Button>}
        label="View options"
        modal={false}
        items={items}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View options" }));
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Show archived" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    await expect(screen.getByRole("menuitemradio", { name: "Compact" })).toBeTruthy();
  },
};

export const WithDescriptionsAndShortcuts: Story = {
  args: {
    trigger: <Button>File actions</Button>,
    items: [],
  },
  render: () => (
    <ActionMenu
      trigger={<Button variant="outline">File actions</Button>}
      label="File actions"
      modal={false}
      items={[
        {
          id: "copy-link",
          label: "Copy link",
          description: "Share a direct reference.",
          shortcut: "L",
        },
        {
          id: "move",
          label: "Move to folder",
          description: "Choose a destination in the app.",
          shortcut: "M",
        },
        {
          id: "delete",
          label: "Delete",
          description: "Remove this item from the workspace.",
          destructive: true,
          shortcut: "Del",
        },
      ]}
    />
  ),
};

export const Empty: Story = {
  args: {
    trigger: <Button>Unavailable actions</Button>,
    items: [],
  },
  render: () => (
    <ActionMenu
      trigger={<Button variant="outline">Unavailable actions</Button>}
      label="Unavailable actions"
      modal={false}
      items={[]}
    />
  ),
};

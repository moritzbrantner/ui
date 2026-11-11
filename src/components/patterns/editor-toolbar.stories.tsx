import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import {
  CopyIcon,
  GridIcon,
  HandIcon,
  MapIcon,
  MousePointer2Icon,
  Redo2Icon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";

import { Input } from "../stable/input";
import { ToggleGroup, ToggleGroupItem } from "../stable/toggle-group";
import { ToolbarSeparator, ToolbarSpacer } from "../stable/toolbar";
import { EditorToolbar, EditorToolbarButton, EditorToolbarGroup } from "./editor-toolbar";

function GraphToolbar(props: Partial<React.ComponentProps<typeof EditorToolbar>>) {
  const [tool, setTool] = React.useState("select");
  const [snap, setSnap] = React.useState(true);
  const [minimap, setMinimap] = React.useState(false);
  const [history, setHistory] = React.useState(2);
  return (
    <EditorToolbar aria-label="Graph commands" {...props}>
      <EditorToolbarGroup aria-label="History">
        <EditorToolbarButton
          label="Undo"
          shortcut="Mod+Z"
          icon={<Undo2Icon aria-hidden="true" />}
          disabled={history === 0}
          onClick={() => setHistory((count) => Math.max(0, count - 1))}
        />
        <EditorToolbarButton
          label="Redo"
          shortcut="Shift+Mod+Z"
          disabled
          icon={<Redo2Icon aria-hidden="true" />}
        />
      </EditorToolbarGroup>
      <ToolbarSeparator />
      <ToggleGroup
        type="single"
        aria-label="Tool"
        rovingFocus={false}
        value={tool}
        onValueChange={(value) => value && setTool(value)}
      >
        <ToggleGroupItem value="select" aria-label="Select tool" className="pointer-coarse:size-11">
          <MousePointer2Icon aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="pan" aria-label="Pan tool" className="pointer-coarse:size-11">
          <HandIcon aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToolbarSeparator />
      <EditorToolbarGroup aria-label="Selection">
        <EditorToolbarButton
          label="Duplicate"
          shortcut="Mod+D"
          icon={<CopyIcon aria-hidden="true" />}
        />
        <EditorToolbarButton
          label="Delete"
          shortcut="Delete"
          icon={<Trash2Icon aria-hidden="true" />}
        />
      </EditorToolbarGroup>
      <ToolbarSpacer />
      <EditorToolbarGroup aria-label="View">
        <EditorToolbarButton
          label="Snap to grid"
          icon={<GridIcon aria-hidden="true" />}
          pressed={snap}
          onClick={() => setSnap((value) => !value)}
        />
        <EditorToolbarButton
          label="Minimap"
          icon={<MapIcon aria-hidden="true" />}
          pressed={minimap}
          onClick={() => setMinimap((value) => !value)}
        />
        <Input aria-label="Zoom" defaultValue="100%" className="w-20" />
      </EditorToolbarGroup>
      <span className="sr-only" aria-live="polite">
        {tool} tool, {history} undo steps
      </span>
    </EditorToolbar>
  );
}

const meta = {
  title: "Components/Editors/Editor Toolbar",
  component: GraphToolbar,
  tags: ["autodocs", "test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof GraphToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const undo = canvas.getByRole("button", { name: "Undo" });
    await userEvent.click(undo);
    await userEvent.keyboard("{ArrowRight}");
    // Disabled Redo is skipped; the tool group joins the toolbar sequence.
    await expect(canvas.getByRole("radio", { name: "Select tool" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("textbox", { name: "Zoom" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "Zoom" })).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Minimap" }));
    await expect(canvas.getByRole("button", { name: "Minimap" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};

export const Compact: Story = {
  args: { density: "compact" },
};

export const Comfortable: Story = {
  args: { density: "comfortable" },
};

export const ScrollOverflow: Story = {
  args: { overflow: "scroll" },
  render: (args) => (
    <div className="max-w-sm">
      <GraphToolbar {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <EditorToolbar aria-label="Drawing tools" orientation="vertical" className="w-fit">
      <EditorToolbarButton
        label="Select"
        shortcut="V"
        icon={<MousePointer2Icon aria-hidden="true" />}
        pressed
      />
      <EditorToolbarButton
        label="Pan"
        shortcut="H"
        icon={<HandIcon aria-hidden="true" />}
        pressed={false}
      />
      <EditorToolbarButton label="Delete" icon={<Trash2Icon aria-hidden="true" />} />
    </EditorToolbar>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Select" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Pan" })).toHaveFocus();
  },
};

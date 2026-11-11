import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { CopyIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "../stable/button";
import { Input } from "../stable/input";
import { NumericInput } from "../stable/numeric-input";
import { PropertyRow, PropertySection } from "../stable/property";
import { Switch } from "../stable/switch";
import { Vector2Input } from "../stable/vector-input";
import {
  EditorInspector,
  EditorInspectorContent,
  EditorInspectorFooter,
  EditorInspectorHeader,
} from "./editor-inspector";

const initialNode = {
  name: "Resize image",
  position: [120, 48] as readonly [number, number],
  width: 240,
  locked: false,
};

function NodeInspector() {
  const [node, setNode] = React.useState(initialNode);
  const dirty = JSON.stringify(node) !== JSON.stringify(initialNode);
  return (
    <div className="h-[34rem] w-full max-w-sm overflow-hidden rounded-md border border-border/60">
      <EditorInspector>
        <EditorInspectorHeader
          title={node.name}
          description="Node · 2 inputs, 1 output"
          actions={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Duplicate node"
              className="pointer-coarse:size-11"
            >
              <CopyIcon aria-hidden="true" />
            </Button>
          }
        />
        <EditorInspectorContent>
          <PropertySection title="General" collapsible defaultOpen>
            <div className="grid gap-3">
              <PropertyRow label="Name" htmlFor="node-name">
                <Input
                  id="node-name"
                  value={node.name}
                  onChange={(event) => setNode({ ...node, name: event.currentTarget.value })}
                />
              </PropertyRow>
              <PropertyRow label="Locked" htmlFor="node-locked">
                <Switch
                  id="node-locked"
                  checked={node.locked}
                  onCheckedChange={(locked) => setNode({ ...node, locked })}
                />
              </PropertyRow>
            </div>
          </PropertySection>
          <PropertySection
            title="Layout"
            description="Canvas units"
            collapsible
            defaultOpen
            actions={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Reset layout"
                className="pointer-coarse:size-11"
                onClick={() =>
                  setNode({ ...node, position: initialNode.position, width: initialNode.width })
                }
              >
                <RotateCcwIcon aria-hidden="true" />
              </Button>
            }
          >
            <div className="grid gap-3">
              <PropertyRow label="Position">
                <Vector2Input
                  label="Position"
                  value={node.position}
                  onValueChange={(position) => setNode({ ...node, position })}
                />
              </PropertyRow>
              <PropertyRow label="Width" htmlFor="node-width">
                <NumericInput
                  id="node-width"
                  unit="px"
                  min={40}
                  value={node.width}
                  onValueChange={(width) => width !== null && setNode({ ...node, width })}
                />
              </PropertyRow>
            </div>
          </PropertySection>
        </EditorInspectorContent>
        <EditorInspectorFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={!dirty}
            onClick={() => setNode(initialNode)}
          >
            Revert
          </Button>
        </EditorInspectorFooter>
      </EditorInspector>
    </div>
  );
}

const meta = {
  title: "Components/Editors/Editor Inspector",
  component: NodeInspector,
  tags: ["autodocs", "test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof NodeInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("region", { name: "Resize image" })).toBeVisible();
    const width = canvas.getByRole("spinbutton", { name: "Width" });
    await userEvent.click(width);
    await userEvent.keyboard("{ArrowUp}");
    await expect(width).toHaveAttribute("aria-valuenow", "241");
    await userEvent.click(canvas.getByRole("button", { name: "Reset layout" }));
    await expect(width).toHaveAttribute("aria-valuenow", "240");
    await userEvent.click(canvas.getByRole("button", { name: /^General/ }));
    await expect(canvas.queryByRole("textbox", { name: "Name" })).toBeNull();
  },
};

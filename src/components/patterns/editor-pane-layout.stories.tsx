import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { LayersIcon, PlusIcon, RotateCcwIcon, Undo2Icon } from "lucide-react";

import { Button } from "../stable/button";
import { NumericInput } from "../stable/numeric-input";
import { PropertyRow, PropertySection } from "../stable/property";
import { ToolbarSpacer } from "../stable/toolbar";
import { EditorInspector, EditorInspectorContent, EditorInspectorHeader } from "./editor-inspector";
import {
  EditorPane,
  EditorPaneContent,
  EditorPaneHeader,
  EditorPaneLayout,
  EditorPaneMain,
  EditorPaneToggle,
  type EditorPaneLayoutProps,
} from "./editor-pane-layout";
import { EditorToolbar, EditorToolbarButton, EditorToolbarGroup } from "./editor-toolbar";

const layers = ["Background", "Title", "Logo", "Caption"];

function Inspector({
  width,
  onWidthChange,
}: {
  width: number;
  onWidthChange: (value: number) => void;
}) {
  return (
    <EditorInspector className="bg-transparent">
      <EditorInspectorHeader title="Title" description="1 layer selected" />
      <EditorInspectorContent>
        <PropertySection
          title="Transform"
          collapsible
          actions={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset transform"
              className="pointer-coarse:size-11"
              onClick={() => onWidthChange(320)}
            >
              <RotateCcwIcon aria-hidden="true" />
            </Button>
          }
        >
          <div className="grid gap-2">
            <PropertyRow label="Width" htmlFor="pane-story-width">
              <NumericInput
                id="pane-story-width"
                unit="px"
                value={width}
                onValueChange={(value) => value !== null && onWidthChange(value)}
              />
            </PropertyRow>
          </div>
        </PropertySection>
      </EditorInspectorContent>
    </EditorInspector>
  );
}

function PaneWorkbench(props: Omit<EditorPaneLayoutProps, "children">) {
  const [width, setWidth] = React.useState(320);
  const [selected, setSelected] = React.useState("Title");
  return (
    <div className="flex h-[36rem] min-h-0 flex-col overflow-hidden rounded-md border border-border/60 bg-background">
      <EditorPaneLayout {...props} orientation="vertical">
        <EditorToolbar
          aria-label="Editor commands"
          overflow="scroll"
          className="rounded-none border-x-0 border-t-0 shadow-none"
        >
          <EditorToolbarGroup aria-label="Panes">
            <EditorPaneToggle paneId="story-layers" />
            <EditorPaneToggle paneId="story-inspector" />
            <EditorPaneToggle paneId="story-timeline" />
          </EditorToolbarGroup>
          <EditorToolbarButton
            label="Undo"
            shortcut="Mod+Z"
            icon={<Undo2Icon aria-hidden="true" />}
          />
        </EditorToolbar>
        <EditorPaneMain className="flex min-h-0 flex-col overflow-hidden">
          <EditorPaneLayout {...props}>
            <EditorPane
              id="story-layers"
              side="start"
              label="Layers"
              defaultSize={220}
              minSize={160}
            >
              <EditorPaneHeader
                title="Layers"
                actions={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Add layer"
                    className="pointer-coarse:size-11"
                  >
                    <PlusIcon aria-hidden="true" />
                  </Button>
                }
              />
              <EditorPaneContent className="grid content-start gap-1">
                {layers.map((layer) => (
                  <Button
                    key={layer}
                    variant={layer === selected ? "secondary" : "ghost"}
                    className="justify-start"
                    aria-pressed={layer === selected}
                    onClick={() => setSelected(layer)}
                  >
                    <LayersIcon aria-hidden="true" />
                    {layer}
                  </Button>
                ))}
              </EditorPaneContent>
            </EditorPane>
            <EditorPaneMain className="grid place-items-center bg-muted/20 p-4">
              <div
                aria-label="Canvas"
                className="grid aspect-video w-full max-w-md place-items-center rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground"
              >
                {selected} · {width}px
              </div>
            </EditorPaneMain>
            <EditorPane id="story-inspector" side="end" label="Inspector" defaultSize={300}>
              <Inspector width={width} onWidthChange={setWidth} />
            </EditorPane>
          </EditorPaneLayout>
        </EditorPaneMain>
        <EditorPane
          id="story-timeline"
          side="end"
          label="Timeline"
          defaultSize={140}
          minSize={96}
          maxSize={320}
        >
          <EditorPaneHeader title="Timeline" />
          <EditorPaneContent className="text-muted-foreground">
            00:00:00 – 00:00:12
          </EditorPaneContent>
        </EditorPane>
      </EditorPaneLayout>
    </div>
  );
}

const meta = {
  title: "Components/Editors/Editor Pane Layout",
  component: PaneWorkbench,
  tags: ["autodocs", "test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PaneWorkbench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Workbench: Story = {
  play: async ({ canvas, userEvent, canvasElement }) => {
    const layout = canvasElement.querySelector(
      '[data-slot="editor-pane-layout"][data-orientation="horizontal"]',
    );
    if (layout?.getAttribute("data-presentation") !== "docked") return;
    const resizer = canvas.getByRole("separator", { name: "Resize Inspector" });
    await userEvent.click(canvas.getByRole("spinbutton", { name: "Width" }));
    resizer.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(resizer).toHaveAttribute("aria-valuenow", "316");
    await userEvent.keyboard("{Enter}");
    await expect(resizer).toHaveAttribute("aria-valuetext", "Collapsed");
    await userEvent.click(canvas.getByRole("button", { name: "Show Inspector" }));
    await expect(canvas.getByRole("region", { name: "Inspector" })).toBeVisible();
    await expect(canvas.getByRole("spinbutton", { name: "Width" })).toHaveAttribute(
      "aria-valuenow",
      "320",
    );
  },
};

function ControlledLayout() {
  const [sizes, setSizes] = React.useState({ assets: 240, inspector: 300 });
  const [collapsed, setCollapsed] = React.useState({ assets: false, inspector: false });
  return (
    <div className="flex h-[30rem] min-h-0 flex-col overflow-hidden rounded-md border border-border/60 bg-background">
      <EditorPaneLayout orientation="vertical">
        <EditorToolbar
          aria-label="Layout commands"
          className="rounded-none border-x-0 border-t-0 shadow-none"
        >
          <EditorToolbarGroup aria-label="Panes">
            <EditorPaneToggle paneId="controlled-assets" />
            <EditorPaneToggle paneId="controlled-inspector" />
          </EditorToolbarGroup>
          <ToolbarSpacer />
          <EditorToolbarButton
            label="Restore layout"
            showLabel
            icon={<RotateCcwIcon aria-hidden="true" />}
            onClick={() => {
              setSizes({ assets: 240, inspector: 300 });
              setCollapsed({ assets: false, inspector: false });
            }}
          />
        </EditorToolbar>
        <EditorPaneMain className="flex min-h-0 flex-col overflow-hidden">
          <EditorPaneLayout>
            <EditorPane
              id="controlled-assets"
              side="start"
              label="Assets"
              size={sizes.assets}
              onSizeChange={(assets) => setSizes((current) => ({ ...current, assets }))}
              collapsed={collapsed.assets}
              onCollapsedChange={(assets) => setCollapsed((current) => ({ ...current, assets }))}
              rail={false}
            >
              <EditorPaneHeader title="Assets" />
              <EditorPaneContent>3 assets</EditorPaneContent>
            </EditorPane>
            <EditorPaneMain className="grid place-items-center p-4 text-sm text-muted-foreground">
              <output aria-label="Persisted layout">
                Assets {collapsed.assets ? "hidden" : `${sizes.assets}px`} · Inspector{" "}
                {collapsed.inspector ? "hidden" : `${sizes.inspector}px`}
              </output>
            </EditorPaneMain>
            <EditorPane
              id="controlled-inspector"
              side="end"
              label="Inspector"
              size={sizes.inspector}
              onSizeChange={(inspector) => setSizes((current) => ({ ...current, inspector }))}
              collapsed={collapsed.inspector}
              onCollapsedChange={(inspector) =>
                setCollapsed((current) => ({ ...current, inspector }))
              }
              rail={false}
            >
              <EditorPaneHeader title="Inspector" />
              <EditorPaneContent>No selection</EditorPaneContent>
            </EditorPane>
          </EditorPaneLayout>
        </EditorPaneMain>
      </EditorPaneLayout>
    </div>
  );
}

export const ControlledSizes: Story = {
  render: () => <ControlledLayout />,
  play: async ({ canvas, userEvent }) => {
    const output = canvas.getByLabelText("Persisted layout");
    await userEvent.click(canvas.getByRole("button", { name: "Inspector" }));
    await waitFor(() => expect(output).toHaveTextContent("Inspector hidden"));
    await userEvent.click(canvas.getByRole("button", { name: "Restore layout" }));
    await expect(output).toHaveTextContent("Assets 240px · Inspector 300px");
  },
};

export const OverlayDrawers: Story = {
  args: { presentation: "overlay" },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Show Inspector" }));
    const inspector = await canvas.findByRole("region", { name: "Inspector" });
    await waitFor(() => expect(inspector).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(inspector).toHaveAttribute("data-state", "closed"));
    await expect(canvas.getByRole("button", { name: "Show Inspector" })).toHaveFocus();
  },
};

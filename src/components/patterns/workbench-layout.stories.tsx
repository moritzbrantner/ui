import * as React from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayersIcon, PlayIcon, SettingsIcon } from "lucide-react";

import { Button } from "../stable/button";
import { NumericInput } from "../stable/numeric-input";
import { PropertyRow, PropertySection } from "../stable/property";
import {
  WorkbenchLayout,
  type WorkbenchPanelSide,
  type WorkbenchPanelGroupHandle,
} from "./workbench-layout";

function PanelContent({ title }: { title: string }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">Reusable panel slot for tool surfaces.</p>
    </div>
  );
}

function WorkbenchLayoutDemo() {
  return (
    <WorkbenchLayout
      toolbar={
        <>
          <Button size="sm">
            <PlayIcon />
            Run
          </Button>
          <Button variant="outline" size="sm">
            <SettingsIcon />
            Settings
          </Button>
        </>
      }
      leftPanel={<PanelContent title="Assets" />}
      rightPanel={<PanelContent title="Inspector" />}
      bottomPanel={<PanelContent title="Console" />}
    >
      <div className="grid min-h-80 place-items-center rounded-md border border-dashed border-border/70 bg-muted/25">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayersIcon className="size-4" />
          Canvas
        </div>
      </div>
    </WorkbenchLayout>
  );
}

const meta = {
  title: "Components/Layout/Workbench Layout",
  component: WorkbenchLayoutDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof WorkbenchLayoutDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullWorkbench: Story = {};

export const CanvasOnly: Story = {
  render: () => (
    <WorkbenchLayout>
      <div className="grid min-h-64 place-items-center rounded-md border border-dashed">
        Canvas only
      </div>
    </WorkbenchLayout>
  ),
};

export const LeftPanelOnly: Story = {
  render: () => (
    <WorkbenchLayout leftPanel={<PanelContent title="Assets" />}>
      <div className="min-h-80">Canvas</div>
    </WorkbenchLayout>
  ),
};

function DockingDemo() {
  const [positions, setPositions] = React.useState<Record<string, WorkbenchPanelSide>>({
    navigator: "left",
    inspector: "right",
    log: "bottom",
  });
  const [activePanels, setActivePanels] = React.useState<
    Partial<Record<WorkbenchPanelSide, string>>
  >({});
  const [scale, setScale] = React.useState(1.234567);
  const [message, setMessage] = React.useState("Preview ready");
  const horizontalRef = React.useRef<WorkbenchPanelGroupHandle>(null);
  function restoreSizes() {
    const sides = new Set(Object.values(positions));
    const left = sides.has("left") ? 22 : 0;
    const right = sides.has("right") ? 26 : 0;
    horizontalRef.current?.setLayout({
      ...(left ? { "presentation-workbench-left": left } : {}),
      "presentation-workbench-canvas": 100 - left - right,
      ...(right ? { "presentation-workbench-right": right } : {}),
    });
  }
  return (
    <WorkbenchLayout
      id="presentation-workbench"
      toolbar={
        <Button size="sm" variant="outline" onClick={restoreSizes}>
          Restore panel sizes
        </Button>
      }
      horizontalGroup={{ groupRef: horizontalRef }}
      docking={{
        panels: [
          {
            id: "navigator",
            label: "Navigator",
            content: (
              <ul>
                <li>Preview item</li>
              </ul>
            ),
          },
          {
            id: "inspector",
            label: "Inspector",
            content: (
              <PropertySection title="Preview">
                <PropertyRow label="Scale">
                  <NumericInput
                    aria-label="Preview scale"
                    value={scale}
                    onValueChange={setScale}
                    displayPrecision={2}
                    step={0.1}
                  />
                </PropertyRow>
              </PropertySection>
            ),
          },
          { id: "log", label: "Log", content: <p role="status">{message}</p> },
        ],
        positions,
        onPositionsChange: (next) => {
          setPositions(next);
          setMessage("Panel placement updated");
        },
        activePanels,
        onActivePanelChange: (side, panelId) =>
          setActivePanels((current) => ({ ...current, [side]: panelId })),
      }}
    >
      <div className="grid min-h-64 content-start gap-2">
        <h3 className="text-sm font-medium">Preview</h3>
        <output aria-label="Exact preview scale" className="tabular-nums">
          {scale}
        </output>
      </div>
    </WorkbenchLayout>
  );
}
export const Docking: Story = {
  render: () => <DockingDemo />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Preview scale" });
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "2.345678");
    await userEvent.tab();
    await expect(input).toHaveValue("2.35");
    await expect(canvas.getByLabelText("Exact preview scale")).toHaveTextContent("2.345678");
    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "Move Inspector panel" }),
      "left",
    );
    const inspector = canvas.getByRole("tab", { name: "Inspector" });
    await expect(inspector).toHaveFocus();
    await expect(canvas.getByRole("spinbutton", { name: "Preview scale" })).toHaveAttribute(
      "aria-valuenow",
      "2.345678",
    );
  },
};

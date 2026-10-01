"use client";

import * as React from "react";
import {
  AngleInput,
  Button,
  EditorWorkbench,
  FieldGroup,
  InspectorPanel,
  NumericInput,
  PropertyRow,
  Scrubber,
  Vector3Input,
  type EditorWorkbenchCommand,
  type Vector3,
  type WorkbenchPanelGroupHandle,
  type WorkbenchPanelSide,
} from "@moritzbrantner/ui";
import { TreeView } from "@moritzbrantner/ui/components/labs/tree-view";

type PreviewObject = { id: string; label: string; position: Vector3; rotation: number };
const initialObjects: PreviewObject[] = [
  { id: "square", label: "Square", position: [1.234567, 2, 3], rotation: 12.345 },
  { id: "circle", label: "Circle", position: [-2, 1, 0], rotation: 0 },
];
const initialPositions: Record<string, WorkbenchPanelSide> = {
  outliner: "left",
  inspector: "right",
  time: "bottom",
};

export function EditorReference() {
  const [objects, setObjects] = React.useState(initialObjects);
  const [selectedId, setSelectedId] = React.useState<string | null>("square");
  const [time, setTime] = React.useState(1.234567);
  const [positions, setPositions] = React.useState(initialPositions);
  const [activePanels, setActivePanels] = React.useState<
    Partial<Record<WorkbenchPanelSide, string>>
  >({});
  const [horizontalLayout, setHorizontalLayout] = React.useState<Record<string, number>>({});
  const [verticalLayout, setVerticalLayout] = React.useState<Record<string, number>>({});
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [message, setMessage] = React.useState("Preview ready");
  const horizontalRef = React.useRef<WorkbenchPanelGroupHandle>(null);
  const verticalRef = React.useRef<WorkbenchPanelGroupHandle>(null);
  const selected = objects.find((object) => object.id === selectedId);
  const timeId = React.useId();

  function changeTransform(patch: Partial<Pick<PreviewObject, "position" | "rotation">>) {
    setObjects((current) =>
      current.map((object) => (object.id === selectedId ? { ...object, ...patch } : object)),
    );
    setMessage(`${selected?.label ?? "Object"} transform changed`);
  }
  function resetTransform() {
    const original = initialObjects.find((object) => object.id === selectedId);
    if (original) changeTransform({ position: original.position, rotation: original.rotation });
  }
  function restoreLayout() {
    setPositions(initialPositions);
    setActivePanels({});
    const horizontal = {
      "reference-workbench-left": 22,
      "reference-workbench-canvas": 52,
      "reference-workbench-right": 26,
    };
    const vertical = {
      "reference-workbench-main": 72,
      "reference-workbench-bottom": 28,
    };
    setHorizontalLayout(horizontal);
    setVerticalLayout(vertical);
    horizontalRef.current?.setLayout(horizontal);
    verticalRef.current?.setLayout(vertical);
    setMessage("Panel layout restored");
  }
  const commands: EditorWorkbenchCommand[] = [
    {
      id: "reset",
      label: "Reset transform",
      groupId: "selection",
      groupLabel: "Selection",
      shortcut: "R",
      disabled: !selected,
      onSelect: resetTransform,
    },
    {
      id: "clear",
      label: "Clear selection",
      groupId: "selection",
      groupLabel: "Selection",
      shortcut: "Escape",
      disabled: !selected,
      onSelect: () => setSelectedId(null),
    },
    {
      id: "restore",
      label: "Restore panel layout",
      groupId: "layout",
      groupLabel: "Layout",
      onSelect: restoreLayout,
    },
  ];
  const inspector = selected ? (
    <InspectorPanel
      title={`${selected.label} properties`}
      aria-label="Selection properties"
      className="@container border-0 bg-transparent p-0"
      groups={[
        {
          id: "transform",
          label: "Transform",
          content: (
            <FieldGroup className="gap-3">
              <PropertyRow label="Position">
                <Vector3Input
                  label="Position"
                  value={selected.position}
                  onValueChange={(position) => changeTransform({ position })}
                  unit="m"
                  step={0.1}
                  smallStep={0.01}
                  largeStep={1}
                  min={-10}
                  max={10}
                  displayPrecision={3}
                  className="flex-col @[18rem]:flex-row"
                />
              </PropertyRow>
              <PropertyRow label="Rotation">
                <AngleInput
                  value={selected.rotation}
                  onValueChange={(rotation) => changeTransform({ rotation })}
                  step={0.001}
                  nudgeStep={15}
                  dialAriaLabel="Rotation dial"
                  inputAriaLabel="Rotation degrees"
                  className="md:grid-cols-1"
                />
              </PropertyRow>
            </FieldGroup>
          ),
        },
      ]}
    />
  ) : (
    <div className="grid gap-3">
      <p>No object selected</p>
      <Button variant="outline" onClick={() => setSelectedId("square")}>
        Select Square
      </Button>
    </div>
  );

  return (
    <EditorWorkbench
      id="reference-workbench"
      className="md:h-dvh md:grid-rows-[auto_minmax(0,1fr)]"
      commands={commands}
      commandPaletteOpen={paletteOpen}
      onCommandPaletteOpenChange={setPaletteOpen}
      shortcutHelpOpen={helpOpen}
      onShortcutHelpOpenChange={setHelpOpen}
      toolbar={
        <>
          <Button variant="outline" onClick={() => setPaletteOpen(true)}>
            Commands (Mod+K)
          </Button>
          <Button variant="outline" onClick={() => setHelpOpen(true)}>
            Shortcuts
          </Button>
          <Button variant="outline" disabled={!selected} onClick={resetTransform}>
            Reset transform
          </Button>
          <Button variant="outline" disabled={!selected} onClick={() => setSelectedId(null)}>
            Clear selection
          </Button>
          <Button variant="outline" onClick={restoreLayout}>
            Restore panel layout
          </Button>
        </>
      }
      selectionSummary={selected ? `${selected.label} selected` : "No selection"}
      horizontalGroup={{
        groupRef: horizontalRef,
        defaultLayout: Object.keys(horizontalLayout).length ? horizontalLayout : undefined,
        onLayoutChanged: setHorizontalLayout,
      }}
      verticalGroup={{
        groupRef: verticalRef,
        defaultLayout: Object.keys(verticalLayout).length ? verticalLayout : undefined,
        onLayoutChanged: setVerticalLayout,
      }}
      docking={{
        panels: [
          {
            id: "outliner",
            label: "Outliner",
            content: (
              <TreeView
                className="[&_[data-slot=tree-view-item]]:min-h-10"
                aria-label="Preview objects"
                nodes={[
                  {
                    id: "objects",
                    label: "Objects",
                    defaultExpanded: true,
                    children: objects.map((object) => ({ id: object.id, label: object.label })),
                  },
                ]}
                selectedId={selectedId ?? "objects"}
                onSelectedIdChange={(id) =>
                  setSelectedId(objects.some((object) => object.id === id) ? id : null)
                }
              />
            ),
          },
          { id: "inspector", label: "Inspector", content: inspector },
          {
            id: "time",
            label: "Time & log",
            content: (
              <div className="grid gap-2">
                <PropertyRow label="Preview time" htmlFor={timeId}>
                  <NumericInput
                    id={timeId}
                    value={time}
                    onValueChange={setTime}
                    unit="s"
                    step={0.01}
                    smallStep={0.001}
                    largeStep={1}
                    min={0}
                    max={120}
                    displayPrecision={3}
                  />
                </PropertyRow>
                <Scrubber
                  aria-label="Preview time scrubber"
                  value={time}
                  onValueChange={setTime}
                  min={0}
                  max={120}
                  step="any"
                  className="min-h-10"
                />
                <output aria-label="Exact preview time" className="text-xs tabular-nums">
                  {time} s
                </output>
                <p
                  role="status"
                  aria-label="Editor activity"
                  className="text-xs text-muted-foreground"
                >
                  {message}
                </p>
              </div>
            ),
          },
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
      <section aria-label="Preview viewport" className="grid min-h-72 content-start gap-3">
        <h1 className="text-sm font-semibold">Object preview</h1>
        <div className="relative grid min-h-56 grid-cols-2 items-center justify-items-center gap-8 overflow-hidden rounded-md border border-dashed bg-muted/20 p-6">
          {objects.map((object) => (
            <button
              key={object.id}
              type="button"
              aria-label={`Select ${object.label} in preview`}
              aria-pressed={selectedId === object.id}
              onClick={() => setSelectedId(object.id)}
              className={`size-20 border-2 border-primary bg-primary/15 text-xs font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${object.id === "circle" ? "rounded-full" : "rounded-md"}`}
              style={{
                transform: `translate(${object.position[0] * 4}px, ${object.position[1] * 4}px) rotate(${object.rotation}deg)`,
              }}
            >
              {object.label}
            </button>
          ))}
        </div>
        <output aria-label="Preview transform" className="break-words text-xs tabular-nums">
          {selected
            ? `${selected.label}: position ${selected.position.join(", ")} m; rotation ${selected.rotation}°`
            : "Select an object to edit its transform"}
        </output>
      </section>
    </EditorWorkbench>
  );
}

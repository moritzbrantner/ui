"use client";

import * as React from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";

import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/cn";
import { NativeSelect, NativeSelectOption } from "../stable/native-select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../stable/resizable";
import { ResizableTabs } from "../stable/resizable-tabs";

type WorkbenchPanelSide = "left" | "right" | "bottom";
type WorkbenchDockPanel = { id: string; label: string; content: React.ReactNode };
type WorkbenchDocking = {
  panels: readonly WorkbenchDockPanel[];
  positions: Readonly<Record<string, WorkbenchPanelSide>>;
  onPositionsChange?: (positions: Record<string, WorkbenchPanelSide>) => void;
  activePanels?: Partial<Record<WorkbenchPanelSide, string>>;
  onActivePanelChange?: (side: WorkbenchPanelSide, panelId: string) => void;
};
type WorkbenchPanelGroupProps = Pick<
  React.ComponentProps<typeof ResizablePanelGroup>,
  "defaultLayout" | "onLayoutChanged" | "groupRef"
>;
type WorkbenchPanelGroupHandle = GroupImperativeHandle;

export type WorkbenchLayoutProps = React.ComponentProps<"div"> & {
  toolbar?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  children: React.ReactNode;
  leftPanelDefaultSize?: number;
  rightPanelDefaultSize?: number;
  bottomPanelDefaultSize?: number;
  collapsiblePanels?: boolean;
  docking?: WorkbenchDocking;
  horizontalGroup?: WorkbenchPanelGroupProps;
  verticalGroup?: WorkbenchPanelGroupProps;
};

export type WorkbenchPanelProps = React.ComponentProps<"div"> & { side?: WorkbenchPanelSide };

function panelSide(docking: WorkbenchDocking, panelId: string) {
  const side = Object.hasOwn(docking.positions, panelId) ? docking.positions[panelId] : "left";
  if (side !== "left" && side !== "right" && side !== "bottom")
    throw new Error("Workbench panel positions must be left, right, or bottom.");
  return side;
}

function WorkbenchLayout({
  id,
  toolbar,
  leftPanel,
  rightPanel,
  bottomPanel,
  children,
  leftPanelDefaultSize = 22,
  rightPanelDefaultSize = 26,
  bottomPanelDefaultSize = 28,
  collapsiblePanels = true,
  docking,
  horizontalGroup,
  verticalGroup,
  className,
  ...props
}: WorkbenchLayoutProps) {
  const generatedId = React.useId();
  const workbenchId = id ?? generatedId;
  const isMobile = useIsMobile();
  const [internalActivePanels, setInternalActivePanels] = React.useState<
    Partial<Record<WorkbenchPanelSide, string>>
  >({});
  const [pendingFocus, setPendingFocus] = React.useState<{
    side: WorkbenchPanelSide;
    panelId: string;
  } | null>(null);
  const activePanels = docking?.activePanels ?? internalActivePanels;
  if (docking && new Set(docking.panels.map((panel) => panel.id)).size !== docking.panels.length)
    throw new Error("Workbench dock panel IDs must be unique.");

  React.useEffect(() => {
    if (!pendingFocus) return;
    if (docking && panelSide(docking, pendingFocus.panelId) === pendingFocus.side) {
      const dock = document
        .getElementById(workbenchId)
        ?.querySelector(`[data-workbench-dock-side="${pendingFocus.side}"]`);
      const tab = Array.from(
        dock?.querySelectorAll<HTMLButtonElement>('[role="tab"][data-value]') ?? [],
      ).find((element) => element.dataset.value === pendingFocus.panelId);
      tab?.focus();
    }
    setPendingFocus(null);
  }, [docking, pendingFocus, workbenchId]);

  function selectPanel(side: WorkbenchPanelSide, panelId: string) {
    if (docking?.activePanels === undefined)
      setInternalActivePanels((current) => ({ ...current, [side]: panelId }));
    docking?.onActivePanelChange?.(side, panelId);
  }

  function dockContent(side: WorkbenchPanelSide, existingContent: React.ReactNode) {
    const panels = docking?.panels.filter((panel) => panelSide(docking, panel.id) === side) ?? [];
    if (!docking || panels.length === 0) return existingContent;
    const activePanel = panels.find((panel) => panel.id === activePanels[side]) ?? panels[0];
    if (!activePanel) return existingContent;
    return (
      <div data-workbench-dock-side={side} className="grid min-w-0 gap-2">
        {existingContent}
        <ResizableTabs
          items={panels.map((panel) => ({
            value: panel.id,
            label: panel.label,
            content: panel.content,
          }))}
          value={activePanel.id}
          onValueChange={(panelId) => selectPanel(side, panelId)}
          resizable={false}
          listVariant="line"
          contentClassName="min-h-10"
        />
        <NativeSelect
          aria-label={`Move ${activePanel.label} panel`}
          value={side}
          disabled={!docking.onPositionsChange}
          className="max-w-full"
          onChange={(event) => {
            const nextSide = event.currentTarget.value;
            if (nextSide !== "left" && nextSide !== "right" && nextSide !== "bottom") return;
            docking.onPositionsChange?.({ ...docking.positions, [activePanel.id]: nextSide });
            selectPanel(nextSide, activePanel.id);
            setPendingFocus({ side: nextSide, panelId: activePanel.id });
          }}
        >
          <NativeSelectOption value="left">Dock left</NativeSelectOption>
          <NativeSelectOption value="right">Dock right</NativeSelectOption>
          <NativeSelectOption value="bottom">Dock bottom</NativeSelectOption>
        </NativeSelect>
      </div>
    );
  }

  const leftContent = dockContent("left", leftPanel);
  const rightContent = dockContent("right", rightPanel);
  const bottomContent = dockContent("bottom", bottomPanel);
  const hasSidePanels = Boolean(leftContent || rightContent);
  const canvasDefaultSize =
    100 - (leftContent ? leftPanelDefaultSize : 0) - (rightContent ? rightPanelDefaultSize : 0);

  return (
    <div
      {...props}
      id={workbenchId}
      data-slot="workbench-layout"
      className={cn(
        "grid min-h-0 w-full min-w-0 overflow-hidden rounded-md border border-border/60 bg-background text-foreground",
        className,
      )}
    >
      {toolbar ? <WorkbenchToolbar>{toolbar}</WorkbenchToolbar> : null}
      {isMobile ? (
        <div data-slot="workbench-mobile-layout" className="grid min-h-0 min-w-0">
          {leftContent ? <WorkbenchPanel side="left">{leftContent}</WorkbenchPanel> : null}
          <WorkbenchCanvas>{children}</WorkbenchCanvas>
          {rightContent ? <WorkbenchPanel side="right">{rightContent}</WorkbenchPanel> : null}
          {bottomContent ? <WorkbenchPanel side="bottom">{bottomContent}</WorkbenchPanel> : null}
        </div>
      ) : (
        <div data-slot="workbench-desktop-layout" className="min-h-0 min-w-0">
          <ResizablePanelGroup
            {...verticalGroup}
            id={`${workbenchId}-vertical`}
            orientation="vertical"
            className="min-h-[28rem]"
          >
            <ResizablePanel
              id={`${workbenchId}-main`}
              defaultSize={`${100 - (bottomContent ? bottomPanelDefaultSize : 0)}%`}
              minSize="42%"
            >
              {hasSidePanels ? (
                <ResizablePanelGroup
                  {...horizontalGroup}
                  id={`${workbenchId}-horizontal`}
                  orientation="horizontal"
                  className="min-h-full"
                >
                  {leftContent ? (
                    <>
                      <ResizablePanel
                        id={`${workbenchId}-left`}
                        defaultSize={`${leftPanelDefaultSize}%`}
                        minSize="16%"
                        collapsible={collapsiblePanels}
                      >
                        <WorkbenchPanel side="left" className="h-full border-r-0">
                          {leftContent}
                        </WorkbenchPanel>
                      </ResizablePanel>
                      <ResizableHandle withHandle aria-label="Resize left panel" />
                    </>
                  ) : null}
                  <ResizablePanel
                    id={`${workbenchId}-canvas`}
                    defaultSize={`${canvasDefaultSize}%`}
                    minSize="36%"
                  >
                    <WorkbenchCanvas className="h-full">{children}</WorkbenchCanvas>
                  </ResizablePanel>
                  {rightContent ? (
                    <>
                      <ResizableHandle withHandle aria-label="Resize right panel" />
                      <ResizablePanel
                        id={`${workbenchId}-right`}
                        defaultSize={`${rightPanelDefaultSize}%`}
                        minSize="18%"
                        collapsible={collapsiblePanels}
                      >
                        <WorkbenchPanel side="right" className="h-full border-l-0">
                          {rightContent}
                        </WorkbenchPanel>
                      </ResizablePanel>
                    </>
                  ) : null}
                </ResizablePanelGroup>
              ) : (
                <WorkbenchCanvas className="h-full">{children}</WorkbenchCanvas>
              )}
            </ResizablePanel>
            {bottomContent ? (
              <>
                <ResizableHandle withHandle aria-label="Resize bottom panel" />
                <ResizablePanel
                  id={`${workbenchId}-bottom`}
                  defaultSize={`${bottomPanelDefaultSize}%`}
                  minSize="14%"
                  collapsible={collapsiblePanels}
                >
                  <WorkbenchPanel side="bottom" className="h-full border-b-0 border-x-0">
                    {bottomContent}
                  </WorkbenchPanel>
                </ResizablePanel>
              </>
            ) : null}
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
}

function WorkbenchPanel({ side = "left", className, ...props }: WorkbenchPanelProps) {
  return (
    <div
      data-slot="workbench-panel"
      data-side={side}
      className={cn(
        "min-h-0 min-w-0 overflow-auto border-border/60 bg-card/65 p-3 text-sm data-[side=bottom]:border-t data-[side=left]:border-b data-[side=right]:border-b md:data-[side=left]:border-r md:data-[side=right]:border-l",
        className,
      )}
      {...props}
    />
  );
}
function WorkbenchCanvas({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="workbench-canvas"
      className={cn("min-h-0 min-w-0 overflow-auto bg-background p-4", className)}
      {...props}
    />
  );
}
function WorkbenchToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="workbench-toolbar"
      className={cn(
        "flex min-h-11 min-w-0 flex-wrap items-center gap-2 border-b bg-card/75 px-3 py-2 [&>*]:min-w-0",
        className,
      )}
      {...props}
    />
  );
}

export { WorkbenchCanvas, WorkbenchLayout, WorkbenchPanel, WorkbenchToolbar };
export type {
  WorkbenchPanelSide,
  WorkbenchDockPanel,
  WorkbenchDocking,
  WorkbenchPanelGroupProps,
  WorkbenchPanelGroupHandle,
};
export type WorkbenchCanvasProps = React.ComponentProps<typeof WorkbenchCanvas>;
export type WorkbenchToolbarProps = React.ComponentProps<typeof WorkbenchToolbar>;

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  ChartNoAxesColumnIcon,
  DatabaseIcon,
  FileIcon,
  FolderIcon,
  LayoutPanelLeftIcon,
  LayoutPanelTopIcon,
  PanelLeftIcon,
  SearchIcon,
  SettingsIcon,
  TablePropertiesIcon,
  TerminalIcon,
} from "lucide-react";

import { Badge } from "./badge";
import { Button } from "./button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const files = [
  "app/dashboard/page.tsx",
  "components/data-grid.tsx",
  "components/filters.tsx",
  "lib/query-client.ts",
];

const logs = [
  "11:02:16 build started",
  "11:02:18 compiled 142 modules",
  "11:02:19 checked package exports",
  "11:02:21 preview ready",
];

function PanelSurface({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex h-full min-h-0 flex-col bg-card/60 ${className}`}>
      <header className="flex min-h-10 items-center gap-2 border-b border-border/60 px-3 text-sm font-medium">
        {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
        <span className="truncate">{title}</span>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>
    </section>
  );
}

function FileTree() {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex items-center gap-2 rounded-sm bg-muted px-2 py-1.5 font-medium">
        <FolderIcon className="size-4 text-muted-foreground" />
        src
      </div>
      {files.map((file) => (
        <div
          key={file}
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-muted-foreground"
        >
          <FileIcon className="size-4" />
          <span className="truncate">{file}</span>
        </div>
      ))}
    </div>
  );
}

function DataPreview() {
  return (
    <div className="grid gap-2 text-sm">
      {["Revenue", "Orders", "Retention", "Latency"].map((label, index) => (
        <div
          key={label}
          className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-sm border border-border/60 bg-background/70 px-3 py-2"
        >
          <span>{label}</span>
          <Badge variant={index === 3 ? "outline" : "secondary"}>
            {index === 3 ? "182ms" : `${84 - index * 9}%`}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function TerminalOutput() {
  return (
    <pre
      aria-label="Console output"
      className="h-full min-h-32 overflow-auto rounded-sm bg-background p-3 text-xs leading-6 text-muted-foreground"
    >
      {logs.join("\n")}
    </pre>
  );
}

const meta = {
  title: "Components/Layout/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HorizontalSplit: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-72 w-[calc(100vw-2rem)] max-w-4xl min-w-0 overflow-hidden rounded-md border border-border/60"
    >
      <ResizablePanel defaultSize="35%" minSize="22%">
        <PanelSurface title="Explorer" icon={<PanelLeftIcon />}>
          <FileTree />
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="65%" minSize="38%">
        <PanelSurface title="Preview" icon={<TablePropertiesIcon />}>
          <DataPreview />
        </PanelSurface>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const VerticalSplit: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-80 w-[calc(100vw-2rem)] max-w-4xl min-w-0 overflow-hidden rounded-md border border-border/60"
    >
      <ResizablePanel defaultSize="68%" minSize="42%">
        <PanelSurface title="Query results" icon={<DatabaseIcon />}>
          <DataPreview />
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="32%" minSize="18%">
        <PanelSurface title="Console" icon={<TerminalIcon />}>
          <TerminalOutput />
        </PanelSurface>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const NestedGroups: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-[30rem] w-[calc(100vw-2rem)] max-w-5xl min-w-0 overflow-hidden rounded-md border border-border/60"
    >
      <ResizablePanel defaultSize="24%" minSize="18%">
        <PanelSurface title="Files" icon={<FolderIcon />}>
          <FileTree />
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="52%" minSize="34%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="62%" minSize="36%">
            <PanelSurface title="Canvas" icon={<LayoutPanelTopIcon />}>
              <div className="grid h-full min-h-56 place-items-center rounded-sm border border-dashed border-border/70 bg-background/70 text-sm text-muted-foreground">
                Document preview
              </div>
            </PanelSurface>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="38%" minSize="20%">
            <PanelSurface title="Terminal" icon={<TerminalIcon />}>
              <TerminalOutput />
            </PanelSurface>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="24%" minSize="18%">
        <PanelSurface title="Inspector" icon={<SettingsIcon />}>
          <div className="grid gap-3 text-sm">
            <label className="grid gap-1">
              <span className="text-muted-foreground">Title</span>
              <input
                disabled
                className="h-9 rounded-md border border-input bg-background px-3 outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue="Quarterly report"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-muted-foreground">Status</span>
              <select
                disabled
                className="h-9 rounded-md border border-input bg-background px-3 outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option>Draft</option>
                <option>Reviewed</option>
                <option>Published</option>
              </select>
            </label>
          </div>
        </PanelSurface>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const CollapsiblePanels: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-80 w-[calc(100vw-2rem)] max-w-5xl min-w-0 overflow-hidden rounded-md border border-border/60"
    >
      <ResizablePanel defaultSize="22%" minSize="16%" collapsedSize="6%" collapsible>
        <PanelSurface title="Navigator" icon={<LayoutPanelLeftIcon />}>
          <FileTree />
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="56%" minSize="34%">
        <PanelSurface title="Workspace" icon={<TablePropertiesIcon />}>
          <DataPreview />
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="22%" minSize="16%" collapsedSize="6%" collapsible>
        <PanelSurface title="Search" icon={<SearchIcon />}>
          <div className="grid gap-3">
            <input
              aria-label="Search project"
              disabled
              className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="metadata"
            />
            <DataPreview />
          </div>
        </PanelSurface>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const ConstrainedPanels: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-72 w-[calc(100vw-2rem)] max-w-5xl min-w-0 overflow-hidden rounded-md border border-border/60"
    >
      <ResizablePanel defaultSize="28%" minSize="18%" maxSize="36%">
        <PanelSurface title="Fixed range" icon={<PanelLeftIcon />}>
          <p className="text-sm text-muted-foreground">
            This side panel keeps resize movement inside a narrower min and max range.
          </p>
        </PanelSurface>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="72%" minSize="48%">
        <PanelSurface title="Flexible content" icon={<ChartNoAxesColumnIcon />}>
          <div className="grid h-full min-h-44 grid-cols-3 gap-2">
            {[62, 78, 54].map((value, index) => (
              <div
                key={value}
                className="flex min-h-0 flex-col justify-end rounded-sm border border-border/60 bg-background/70 p-2"
              >
                <div className="rounded-sm bg-primary/70" style={{ height: `${value}%` }} />
                <span className="mt-2 text-xs text-muted-foreground">Series {index + 1}</span>
              </div>
            ))}
          </div>
        </PanelSurface>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};

export const WorkbenchLayout: Story = {
  render: () => (
    <div className="grid w-[calc(100vw-2rem)] max-w-6xl min-w-0 overflow-hidden rounded-md border border-border/60 bg-background">
      <div className="flex min-h-11 flex-wrap items-center gap-2 border-b border-border/60 bg-card/70 px-3 py-2">
        <Button size="sm" variant="outline">
          <FileIcon />
          Open
        </Button>
        <Button size="sm" variant="ghost">
          <SettingsIcon />
          Settings
        </Button>
      </div>
      <ResizablePanelGroup orientation="vertical" className="h-[34rem]">
        <ResizablePanel defaultSize="74%" minSize="48%">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize="20%" minSize="16%" maxSize="30%">
              <PanelSurface title="Project" icon={<FolderIcon />}>
                <FileTree />
              </PanelSurface>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="55%" minSize="36%">
              <PanelSurface title="Editor" icon={<FileIcon />}>
                <pre
                  aria-label="Editor source"
                  className="h-full overflow-auto rounded-sm bg-background p-3 text-xs leading-6 text-muted-foreground"
                >
                  {`export function RevenuePanel() {
  return (
    <section>
      <h2>Revenue</h2>
      <DataPreview />
    </section>
  );
}`}
                </pre>
              </PanelSurface>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="25%" minSize="18%" maxSize="34%">
              <PanelSurface title="Properties" icon={<SettingsIcon />}>
                <DataPreview />
              </PanelSurface>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="26%" minSize="16%">
          <PanelSurface title="Output" icon={<TerminalIcon />}>
            <TerminalOutput />
          </PanelSurface>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

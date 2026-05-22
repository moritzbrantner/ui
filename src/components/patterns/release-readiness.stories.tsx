import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BellIcon,
  CommandIcon,
  DatabaseIcon,
  FileTextIcon,
  ImageIcon,
  LayersIcon,
  SearchIcon,
  SettingsIcon,
  WorkflowIcon,
} from "lucide-react";
import { expect, fn } from "storybook/test";

import { AnnotationCanvas, type AnnotationCanvasAnnotation } from "../labs/annotation-canvas";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { CommandPalette, type CommandPaletteGroup } from "./command-palette";
import { DataGrid } from "./data-grid";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend } from "../stable/field";
import {
  FieldGrid,
  FieldRow,
  Fieldset,
  FormActions,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  ValidationSummary,
} from "../stable/form-layout";
import { Input } from "../stable/input";
import { InspectorPanel, type InspectorPanelSectionData } from "../labs/inspector-panel";
import { NotificationMenu } from "./notification-menu";
import { PageContent, PageHeader, PageShell, PageTitle, Surface } from "./app-layout";
import { PlatformNavbar, type PlatformNavbarGroup } from "./platform-navbar";
import { PlatformNavbarActions } from "./platform-navbar-actions";
import { SelectDropdown } from "../stable/select";
import { Switch } from "../stable/switch";
import { TimelineEditor, type TimelineEditorTrack } from "../labs/timeline-editor";
import { Toaster } from "../stable/sonner";
import {
  WorkflowBuilder,
  type WorkflowBuilderEdge,
  type WorkflowBuilderNodeData,
} from "../labs/workflow-builder";
import { WorkbenchLayout } from "./workbench-layout";

const dashboardRows = [
  { package: "@moritzbrantner/ui", status: "Ready", coverage: "CI only", owner: "Design" },
  { package: "@moritzbrantner/frontend-ui", status: "Watching", coverage: "Smoke", owner: "App" },
  { package: "@moritzbrantner/api", status: "Queued", coverage: "Contract", owner: "Core" },
];

const dashboardGroups = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", active: true },
      { id: "releases", label: "Releases", badge: "3" },
      { id: "checks", label: "Checks" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "components", label: "Components" },
      { id: "tokens", label: "Tokens" },
    ],
  },
] satisfies PlatformNavbarGroup[];

const commandGroups = [
  {
    id: "release",
    label: "Release",
    actions: [
      {
        id: "open-checks",
        label: "Open release checks",
        description: "Review package, visual, and consumer confidence.",
        icon: <SearchIcon />,
        shortcut: "R",
      },
      {
        id: "publish-notes",
        label: "Draft publish notes",
        description: "Prepare release communication.",
        icon: <FileTextIcon />,
      },
    ],
  },
] satisfies CommandPaletteGroup[];

const annotations: AnnotationCanvasAnnotation[] = [
  {
    id: "hero",
    label: "Preview crop",
    shape: "rectangle",
    color: "#2563eb",
    points: [
      { x: 90, y: 80 },
      { x: 260, y: 160 },
    ],
  },
];

const editorTracks: TimelineEditorTrack[] = [
  {
    id: "main",
    label: "Main",
    clips: [
      { id: "intro", label: "Intro", start: 0.5, end: 2.5, color: "#2563eb" },
      { id: "review", label: "Review", start: 3, end: 5.5, color: "#166534" },
    ],
  },
];

const workflowNodes: WorkflowBuilderNodeData[] = [
  {
    id: "source",
    label: "Source",
    category: "Input",
    variant: "compact",
    x: 32,
    y: 48,
    outputs: [{ id: "asset", label: "Asset", kind: "image" }],
  },
  {
    id: "review",
    label: "Review",
    category: "Human",
    variant: "compact",
    x: 340,
    y: 72,
    inputs: [{ id: "asset", label: "Asset", kind: "image" }],
    outputs: [{ id: "decision", label: "Decision", kind: "state" }],
  },
];

const workflowEdges: WorkflowBuilderEdge[] = [
  {
    id: "source-review",
    sourceNodeId: "source",
    sourcePortId: "asset",
    targetNodeId: "review",
    targetPortId: "asset",
  },
];

const inspectorSections: InspectorPanelSectionData[] = [
  {
    id: "release",
    title: "Release Item",
    fields: [
      { id: "title", label: "Title", type: "text", value: "Release preview" },
      { id: "enabled", label: "Enabled", type: "boolean", value: true },
    ],
  },
];

function ConsumerDashboardShell({
  onOpenCommand = () => undefined,
}: {
  onOpenCommand?: () => void;
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <PageShell className="min-h-[680px] w-[min(1180px,calc(100vw-2rem))]">
      <PlatformNavbar
        brand={<span className="font-semibold">Release Console</span>}
        groups={dashboardGroups}
        defaultOpenGroupId="workspace"
        actionSlot={
          <PlatformNavbarActions
            notificationMenu={{
              unreadCount: 2,
              items: [
                {
                  id: "coverage",
                  title: "Coverage requires CI",
                  description: "Real V8 coverage is enforced by Node in GitHub Actions.",
                  unread: true,
                },
              ],
            }}
            accountMenu={{ user: { name: "Ada Lovelace", initials: "AL" } }}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setCommandOpen(true);
                onOpenCommand();
              }}
            >
              <CommandIcon />
              Commands
            </Button>
          </PlatformNavbarActions>
        }
      />
      <PageHeader>
        <div>
          <PageTitle>Release readiness</PageTitle>
          <p className="text-sm text-muted-foreground">
            Package confidence, consumer footprint, and pending manual checks.
          </p>
        </div>
      </PageHeader>
      <PageContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Surface className="min-w-0">
            <DataGrid
              columns={[
                { accessorKey: "package", header: "Package" },
                { accessorKey: "status", header: "Status" },
                { accessorKey: "coverage", header: "Coverage" },
                { accessorKey: "owner", header: "Owner" },
              ]}
              data={dashboardRows}
            />
          </Surface>
          <Surface className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BellIcon className="size-4 text-muted-foreground" />
              Release signals
            </div>
            <Badge variant="secondary">Storybook checked</Badge>
            <Badge variant="outline">Consumer chunk watched</Badge>
            <NotificationMenu
              items={[{ id: "visual", title: "Visual checks expanded", unread: true }]}
            />
          </Surface>
        </div>
      </PageContent>
      <CommandPalette
        open={commandOpen}
        groups={commandGroups}
        onOpenChange={setCommandOpen}
        footer={<span>Release commands are UI-only in this package.</span>}
      />
      <Toaster />
    </PageShell>
  );
}

function EditorWorkspace({ onSelectNode = () => undefined }: { onSelectNode?: () => void }) {
  const [nodes, setNodes] = React.useState(workflowNodes);
  const [edges, setEdges] = React.useState(workflowEdges);

  return (
    <WorkbenchLayout
      className="h-[760px] w-[min(1180px,calc(100vw-2rem))]"
      toolbar={
        <>
          <Button size="sm">
            <WorkflowIcon />
            Run
          </Button>
          <Button size="sm" variant="outline">
            <SettingsIcon />
            Settings
          </Button>
        </>
      }
      leftPanel={
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <LayersIcon className="size-4 text-muted-foreground" />
            Assets
          </div>
          <AnnotationCanvas annotations={annotations} width={360} height={220} />
        </div>
      }
      rightPanel={
        <InspectorPanel
          className="min-h-0"
          sections={inspectorSections}
          title="Inspector"
          description="State-light metadata controls."
        />
      }
      bottomPanel={<TimelineEditor duration={8} tracks={editorTracks} selectedClipId="intro" />}
    >
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onSelectionChange={(selection) => {
          if (selection?.type === "node") {
            onSelectNode();
          }
        }}
      />
    </WorkbenchLayout>
  );
}

function FormsSettings({ onSave = () => undefined }: { onSave?: () => void }) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState(false);

  return (
    <form
      className="grid w-[min(760px,calc(100vw-2rem))] gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        const nextErrors = title ? [] : ["Title is required."];

        setErrors(nextErrors);
        setSaved(nextErrors.length === 0);

        if (nextErrors.length === 0) {
          onSave();
        }
      }}
    >
      <ValidationSummary errors={errors} />
      {saved ? (
        <div role="status" className="rounded-md border bg-primary/5 p-3 text-sm">
          Settings saved.
        </div>
      ) : null}
      <FormSection>
        <FormSectionHeader>
          <FormSectionTitle>Release settings</FormSectionTitle>
          <FormSectionDescription>
            Reusable field, validation, select, input, and toggle controls.
          </FormSectionDescription>
        </FormSectionHeader>
        <Fieldset>
          <FieldLegend>Details</FieldLegend>
          <FieldGrid>
            <Field data-invalid={errors.length > 0 || undefined}>
              <FieldLabel htmlFor="release-title">Title</FieldLabel>
              <Input
                id="release-title"
                name="title"
                aria-invalid={errors.length > 0 || undefined}
              />
              <FieldError>{errors[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="release-owner">Owner</FieldLabel>
              <SelectDropdown
                id="release-owner"
                name="owner"
                defaultValue="design"
                options={[
                  { label: "Design system", value: "design" },
                  { label: "Frontend", value: "frontend" },
                ]}
              />
            </Field>
          </FieldGrid>
          <FieldRow align="center">
            <Switch id="release-notify" name="notify" defaultChecked />
            <FieldLabel htmlFor="release-notify">Notify consumers</FieldLabel>
            <FieldDescription>
              Keep app packages informed when the design system ships.
            </FieldDescription>
          </FieldRow>
        </Fieldset>
      </FormSection>
      <FormActions>
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save settings</Button>
      </FormActions>
    </form>
  );
}

const meta = {
  title: "Patterns/Release Readiness",
  component: ConsumerDashboardShell,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ConsumerDashboardShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConsumerDashboardShellStory: Story = {
  name: "Consumer Dashboard Shell",
  args: {
    onOpenCommand: fn(),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Commands" }));
    await expect(args.onOpenCommand).toHaveBeenCalled();
    await expect(canvasElement.ownerDocument.body).toHaveTextContent("Open release checks");
  },
};

export const EditorWorkspaceStory: StoryObj<typeof EditorWorkspace> = {
  name: "Editor Workspace",
  render: (args) => <EditorWorkspace {...args} />,
  args: {
    onSelectNode: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Source" }));
    await expect(args.onSelectNode).toHaveBeenCalled();
  },
};

export const FormsSettingsStory: StoryObj<typeof FormsSettings> = {
  name: "Forms Settings",
  render: (args) => <FormsSettings {...args} />,
  args: {
    onSave: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save settings" }));
    await expect(canvas.getAllByRole("alert")[0]).toHaveTextContent("Title is required.");

    await userEvent.type(canvas.getByLabelText("Title"), "0.5.4 release");
    await userEvent.click(canvas.getByRole("button", { name: "Save settings" }));

    await expect(args.onSave).toHaveBeenCalled();
    await expect(canvas.getByRole("status")).toHaveTextContent("Settings saved.");
  },
};

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import {
  WorkflowBuilder,
  type WorkflowBuilderEdge,
  type WorkflowBuilderNodeData,
  type WorkflowBuilderViewport,
} from "./workflow-builder";

const initialNodes: WorkflowBuilderNodeData[] = [
  {
    id: "ingest",
    label: "Ingest files",
    description: "Watch storage and normalize metadata.",
    category: "Source",
    packageLabel: "@platform/media",
    status: "success",
    tone: "success",
    tags: ["storage", "batch"],
    x: 48,
    y: 80,
    outputs: [
      {
        id: "documents",
        label: "Documents",
        kind: "document",
        description: "Structured file manifests with stable source paths.",
        badge: "batch",
      },
      {
        id: "assets",
        label: "Assets",
        kind: "asset",
        description: "Binary file references for layout and preview tasks.",
      },
    ],
  },
  {
    id: "ocr",
    label: "OCR extract",
    description: "Run layout-aware text extraction.",
    category: "Transform",
    packageLabel: "@platform/vision",
    status: "running",
    tone: "info",
    tags: ["gpu", "layout"],
    x: 340,
    y: 60,
    inputs: [
      {
        id: "documents",
        label: "Documents",
        kind: "document",
        required: true,
        description: "Incoming source batches for OCR extraction.",
      },
      {
        id: "assets",
        label: "Assets",
        kind: "asset",
        description: "Original image and PDF assets for visual extraction.",
      },
    ],
    outputs: [
      {
        id: "text",
        label: "Text",
        kind: "text",
        description: "Layout-aware OCR output with confidence spans.",
      },
      {
        id: "pages",
        label: "Pages",
        kind: "page",
        description: "Page images and positional layout blocks.",
      },
    ],
  },
  {
    id: "classify",
    label: "Classify",
    description: "Assign report categories.",
    category: "AI",
    packageLabel: "@platform/classification",
    tags: ["taxonomy", "routing"],
    x: 632,
    y: 138,
    inputs: [
      {
        id: "text",
        label: "Text",
        kind: "text",
        required: true,
        description: "Normalized content ready for taxonomy assignment.",
      },
      {
        id: "pages",
        label: "Pages",
        kind: "page",
        description: "Page context used for evidence links.",
      },
    ],
    outputs: [
      {
        id: "labels",
        label: "Labels",
        kind: "labels",
        description: "Resolved taxonomy labels and confidence scores.",
      },
      {
        id: "review",
        label: "Review",
        kind: "task",
        description: "Human review tasks for low-confidence categories.",
      },
    ],
  },
  {
    id: "publish",
    label: "Publish",
    description: "Compact terminal node for downstream delivery.",
    category: "Sink",
    packageLabel: "@platform/delivery",
    variant: "compact",
    x: 940,
    y: 156,
    inputs: [
      {
        id: "labels",
        label: "Labels",
        kind: "labels",
        required: true,
      },
    ],
    outputs: [
      {
        id: "event",
        label: "Webhook",
        kind: "event",
      },
    ],
  },
];

const initialEdges: WorkflowBuilderEdge[] = [
  {
    id: "ingest-ocr",
    sourceNodeId: "ingest",
    sourcePortId: "documents",
    targetNodeId: "ocr",
    targetPortId: "documents",
    status: "success",
  },
  {
    id: "ingest-assets-ocr",
    sourceNodeId: "ingest",
    sourcePortId: "assets",
    targetNodeId: "ocr",
    targetPortId: "assets",
    status: "success",
  },
  {
    id: "ocr-classify",
    sourceNodeId: "ocr",
    sourcePortId: "text",
    targetNodeId: "classify",
    targetPortId: "text",
    status: "running",
  },
  {
    id: "ocr-pages-classify",
    sourceNodeId: "ocr",
    sourcePortId: "pages",
    targetNodeId: "classify",
    targetPortId: "pages",
  },
  {
    id: "classify-publish",
    sourceNodeId: "classify",
    sourcePortId: "labels",
    targetNodeId: "publish",
    targetPortId: "labels",
  },
];

const connectableEdges = initialEdges.filter((edge) => edge.id !== "classify-publish");

const typeMismatchNodes: WorkflowBuilderNodeData[] = [
  {
    id: "documents",
    label: "Documents",
    category: "Source",
    tone: "info",
    x: 48,
    y: 80,
    outputs: [
      {
        id: "items",
        label: "Items",
        type: "readonly DocumentInput[]",
      },
    ],
  },
  {
    id: "report",
    label: "Report writer",
    category: "Sink",
    tone: "success",
    x: 360,
    y: 80,
    inputs: [
      {
        id: "payload",
        label: "Payload",
        type: "ReportPayload",
      },
    ],
  },
];

const compactNodes: WorkflowBuilderNodeData[] = [
  {
    id: "webhook",
    label: "Webhook",
    variant: "compact",
    status: "success",
    x: 48,
    y: 104,
    outputs: [{ id: "event", label: "Event", kind: "event" }],
  },
  {
    id: "parse",
    label: "Parse",
    variant: "compact",
    x: 328,
    y: 104,
    inputs: [{ id: "event", label: "Event", kind: "event" }],
    outputs: [{ id: "object", label: "Object", kind: "object" }],
  },
  {
    id: "store",
    label: "Store",
    variant: "compact",
    x: 608,
    y: 104,
    inputs: [{ id: "object", label: "Object", kind: "object" }],
  },
];

const compactEdges: WorkflowBuilderEdge[] = [
  {
    id: "webhook-parse",
    sourceNodeId: "webhook",
    sourcePortId: "event",
    targetNodeId: "parse",
    targetPortId: "event",
    status: "success",
  },
];

const fanOutNodes: WorkflowBuilderNodeData[] = [
  {
    id: "source",
    label: "Source",
    category: "Source",
    tone: "success",
    x: 48,
    y: 116,
    outputs: [{ id: "event", label: "Event", kind: "event" }],
  },
  {
    id: "normalize",
    label: "Normalize",
    category: "Transform",
    x: 360,
    y: 48,
    inputs: [{ id: "event", label: "Event", kind: "event" }],
  },
  {
    id: "audit",
    label: "Audit",
    category: "Sink",
    x: 360,
    y: 244,
    inputs: [{ id: "event", label: "Event", kind: "event" }],
  },
];

const occupiedInputNodes: WorkflowBuilderNodeData[] = [
  {
    id: "primary",
    label: "Primary source",
    x: 48,
    y: 48,
    outputs: [{ id: "event", label: "Event", kind: "event" }],
  },
  {
    id: "fallback",
    label: "Fallback source",
    x: 48,
    y: 240,
    outputs: [{ id: "event", label: "Event", kind: "event" }],
  },
  {
    id: "target",
    label: "Target",
    x: 360,
    y: 144,
    inputs: [{ id: "event", label: "Event", kind: "event" }],
  },
];

const occupiedInputEdges: WorkflowBuilderEdge[] = [
  {
    id: "primary-target",
    sourceNodeId: "primary",
    sourcePortId: "event",
    targetNodeId: "target",
    targetPortId: "event",
  },
];

const meta = {
  title: "Components/Editors/Workflow Builder",
  component: WorkflowBuilder,
  tags: ["autodocs", "test"],
  args: {
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange: fn(),
    onEdgesChange: fn(),
    onSelectionChange: fn(),
  },
} satisfies Meta<typeof WorkflowBuilder>;

export default meta;

type Story = StoryObj<typeof meta>;

function WorkflowBuilderDemo(args: React.ComponentProps<typeof WorkflowBuilder>) {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  return (
    <WorkflowBuilder
      {...args}
      nodes={nodes}
      edges={edges}
      onNodesChange={(nextNodes) => {
        setNodes(nextNodes);
        args.onNodesChange?.(nextNodes);
      }}
      onEdgesChange={(nextEdges) => {
        setEdges(nextEdges);
        args.onEdgesChange?.(nextEdges);
      }}
    />
  );
}

function ControlledViewportWorkflowBuilder(args: React.ComponentProps<typeof WorkflowBuilder>) {
  const [viewport, setViewport] = React.useState<WorkflowBuilderViewport>({
    x: 24,
    y: 12,
    zoom: 0.85,
  });

  return (
    <WorkflowBuilder
      {...args}
      viewport={viewport}
      onViewportChange={(nextViewport) => {
        setViewport(nextViewport);
        args.onViewportChange?.(nextViewport);
      }}
    />
  );
}

function StatefulWorkflowBuilder({
  initialEdges: edgesProp,
  initialNodes: nodesProp = initialNodes,
  ...args
}: React.ComponentProps<typeof WorkflowBuilder> & {
  initialNodes?: WorkflowBuilderNodeData[];
  initialEdges: WorkflowBuilderEdge[];
}) {
  const [nodes, setNodes] = React.useState(nodesProp);
  const [edges, setEdges] = React.useState(edgesProp);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span data-testid="workflow-node-count">Nodes: {nodes.length}</span>
        <span data-testid="workflow-edge-count">Edges: {edges.length}</span>
      </div>
      <WorkflowBuilder
        {...args}
        nodes={nodes}
        edges={edges}
        onNodesChange={(nextNodes) => {
          setNodes(nextNodes);
          args.onNodesChange?.(nextNodes);
        }}
        onEdgesChange={(nextEdges) => {
          setEdges(nextEdges);
          args.onEdgesChange?.(nextEdges);
        }}
      />
    </div>
  );
}

export const AiWorkflowGraph: Story = {
  render: (args) => <WorkflowBuilderDemo {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "OCR extract" }));
    await expect(args.onSelectionChange).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await expect(canvas.getByText("110%")).toBeInTheDocument();
  },
};

export const ReadOnly: Story = {
  render: (args) => <WorkflowBuilderDemo {...args} readOnly />,
};

export const ControlledViewport: Story = {
  render: (args) => <ControlledViewportWorkflowBuilder {...args} />,
  args: {
    onViewportChange: fn(),
    onConnectionStart: fn(),
    onConnectionCancel: fn(),
    onConnectionComplete: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("85%")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await expect(args.onViewportChange).toHaveBeenCalled();
  },
};

export const ReadOnlyOverview: Story = {
  render: (args) => (
    <WorkflowBuilder
      {...args}
      nodes={initialNodes}
      edges={initialEdges}
      readOnly
      toolbarLabel="Workflow overview"
      surfaceHeight={420}
      canvasSize={{ width: 1040, height: 620 }}
      showMiniMap
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Workflow overview")).toBeVisible();
    await expect(canvas.getByRole("img", { name: "Workflow minimap" })).toBeVisible();
  },
};

export const ConnectNodes: Story = {
  args: {
    edges: connectableEdges,
    onConnectionStart: fn(),
    onConnectionComplete: fn(),
  },
  render: (args) => <StatefulWorkflowBuilder {...args} initialEdges={connectableEdges} />,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 4");

    await userEvent.click(canvas.getByRole("button", { name: "Start Classify Labels" }));
    await expect(args.onConnectionStart).toHaveBeenCalledWith({
      sourceNodeId: "classify",
      sourcePortId: "labels",
    });
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Publish Labels" }));

    await expect(args.onConnectionComplete).toHaveBeenCalledWith({
      sourceNodeId: "classify",
      sourcePortId: "labels",
      targetNodeId: "publish",
      targetPortId: "labels",
    });
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 5");
  },
};

export const FanOutConnections: Story = {
  args: {
    nodes: fanOutNodes,
    edges: [],
    surfaceHeight: 420,
    toolbarLabel: "Fan-out workflow",
    onConnectionComplete: fn(),
  },
  render: (args) => (
    <StatefulWorkflowBuilder
      {...args}
      initialNodes={fanOutNodes}
      initialEdges={[]}
      canvasSize={{ width: 760, height: 440 }}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 0");

    await userEvent.click(canvas.getByRole("button", { name: "Start Source Event" }));
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Normalize Event" }));
    await userEvent.click(canvas.getByRole("button", { name: "Start Source Event" }));
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Audit Event" }));

    await expect(args.onConnectionComplete).toHaveBeenCalledTimes(2);
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 2");
  },
};

export const DragConnectAndDisconnect: Story = {
  args: {
    nodes: compactNodes,
    edges: [],
    surfaceHeight: 300,
    toolbarLabel: "Drag workflow",
    onConnectionComplete: fn(),
    onConnectionDisconnect: fn(),
  },
  render: (args) => (
    <StatefulWorkflowBuilder
      {...args}
      initialNodes={compactNodes}
      initialEdges={[]}
      canvasSize={{ width: 920, height: 320 }}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: canvas.getByRole("button", { name: "Start Webhook Event" }) },
      { target: canvas.getByRole("button", { name: "Connect to Parse Event" }) },
      {
        keys: "[/MouseLeft]",
        target: canvas.getByRole("button", { name: "Connect to Parse Event" }),
      },
    ]);

    await expect(args.onConnectionComplete).toHaveBeenCalledWith({
      sourceNodeId: "webhook",
      sourcePortId: "event",
      targetNodeId: "parse",
      targetPortId: "event",
    });
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 1");

    await userEvent.dblClick(
      canvas.getByRole("button", { name: "Connection edge-webhook-event-parse-event" }),
    );

    await expect(args.onConnectionDisconnect).toHaveBeenCalled();
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 0");
  },
};

export const InputOccupiedGuard: Story = {
  args: {
    nodes: occupiedInputNodes,
    edges: occupiedInputEdges,
    surfaceHeight: 380,
    toolbarLabel: "Single-source input",
    onConnectionComplete: fn(),
  },
  render: (args) => (
    <StatefulWorkflowBuilder
      {...args}
      initialNodes={occupiedInputNodes}
      initialEdges={occupiedInputEdges}
      canvasSize={{ width: 760, height: 420 }}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 1");

    await userEvent.click(canvas.getByRole("button", { name: "Start Fallback source Event" }));
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Target Event" }));

    await expect(args.onConnectionComplete).not.toHaveBeenCalled();
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 1");
  },
};

export const TypeMismatchGuard: Story = {
  args: {
    nodes: typeMismatchNodes,
    edges: [],
    onConnectionComplete: fn(),
  },
  render: (args) => (
    <StatefulWorkflowBuilder
      {...args}
      initialNodes={typeMismatchNodes}
      initialEdges={[]}
      toolbarLabel="Typed workflow"
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Start Documents Items" }));
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Report writer Payload" }));

    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 0");
    await expect(args.onConnectionComplete).not.toHaveBeenCalled();
  },
};

export const SelectAndDelete: Story = {
  render: (args) => <StatefulWorkflowBuilder {...args} initialEdges={initialEdges} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "OCR extract" }));
    await expect(args.onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "node", id: "ocr" }),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Delete selected" }));

    await expect(canvas.getByTestId("workflow-node-count")).toHaveTextContent("Nodes: 3");
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 1");
  },
};

export const CompactChain: Story = {
  args: {
    nodes: compactNodes,
    edges: compactEdges,
    surfaceHeight: 300,
    toolbarLabel: "Compact workflow",
    onConnectionComplete: fn(),
  },
  render: (args) => (
    <StatefulWorkflowBuilder
      {...args}
      initialNodes={compactNodes}
      initialEdges={compactEdges}
      canvasSize={{ width: 920, height: 320 }}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Compact workflow")).toBeVisible();
    await expect(canvas.getByText("Edges: 1")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Start Parse Object" }));
    await userEvent.click(canvas.getByRole("button", { name: "Connect to Store Object" }));

    await expect(args.onConnectionComplete).toHaveBeenCalledWith({
      sourceNodeId: "parse",
      sourcePortId: "object",
      targetNodeId: "store",
      targetPortId: "object",
    });
    await expect(canvas.getByTestId("workflow-edge-count")).toHaveTextContent("Edges: 2");
  },
};

export const EmptyDraft: Story = {
  args: {
    nodes: [],
    edges: [],
    surfaceHeight: 280,
    showMiniMap: false,
    toolbarLabel: "Empty workflow",
    onViewportChange: fn(),
  },
  render: (args) => <WorkflowBuilder {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("Empty workflow")).toBeVisible();
    await expect(canvas.queryByRole("img", { name: "Workflow minimap" })).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Fit view" }));

    await expect(args.onViewportChange).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 });
  },
};

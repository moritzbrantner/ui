import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, waitFor } from "storybook/test";

import {
  WorkflowInputOnlyNode,
  WorkflowNode,
  WorkflowOutputOnlyNode,
  getWorkflowNodeSize,
  type WorkflowInputOnlyNodeData,
  type WorkflowNodeData,
  type WorkflowOutputOnlyNodeData,
} from "./workflow-node";

const classifierNode: WorkflowNodeData = {
  id: "classify",
  label: "Classify",
  category: "AI",
  packageLabel: "@moritzbrantner/text-classification",
  description: "Assign taxonomy labels from normalized workspace text.",
  kind: "labels",
  status: "running",
  tone: "info",
  tags: ["routing", "review"],
  inputs: [
    {
      id: "text",
      label: "Text",
      kind: "text",
      required: true,
      description: "Normalized OCR output.",
    },
  ],
  outputs: [
    {
      id: "labels",
      label: "Labels",
      kind: "labels",
      description: "Predicted taxonomy labels.",
    },
  ],
};

const compactPublishNode: WorkflowNodeData = {
  id: "publish",
  label: "Publish",
  description: "Forward workflow state to delivery channels.",
  variant: "compact",
  status: "success",
  outputs: [{ id: "event", label: "Webhook", kind: "event" }],
  inputs: [{ id: "labels", label: "Labels", kind: "labels" }],
};

const typedInputNode: WorkflowInputOnlyNodeData = {
  id: "collect-output",
  label: "Collect report",
  category: "Workflow output",
  description: "Accept the final structured report payload.",
  tone: "success",
  inputs: [
    {
      id: "report",
      label: "Report",
      type: {
        label: "ReportPayload",
        source: "Readonly<{ id: string; title: string; labels: readonly string[] }>",
      },
      required: true,
    },
  ],
};

const typedOutputNode: WorkflowOutputOnlyNodeData = {
  id: "workflow-input",
  label: "Workspace input",
  category: "Workflow input",
  description: "Expose the document batch supplied by the consuming app.",
  tone: "info",
  outputs: [
    {
      id: "documents",
      label: "Documents",
      type: "readonly DocumentInput[]",
      required: true,
    },
  ],
};

const reviewNode: WorkflowNodeData = {
  id: "review",
  label: "Human review",
  category: "Decision",
  description: "Route low-confidence labels into a queue with priority and reviewer context.",
  status: "warning",
  tone: "warning",
  inputs: [
    {
      id: "labels",
      label: "Labels",
      kind: "labels",
      required: true,
    },
    {
      id: "evidence",
      label: "Evidence",
      type: {
        label: "EvidenceBundle",
        source: "Readonly<{ labelId: string; pageRefs: readonly string[] }>",
      },
      badge: "optional",
    },
    {
      id: "policy",
      label: "Policy",
      kind: "object",
      color: "#475569",
    },
  ],
  outputs: [
    {
      id: "approved",
      label: "Approved",
      kind: "boolean",
    },
    {
      id: "task",
      label: "Task",
      kind: "task",
      required: true,
    },
    {
      id: "audit",
      label: "Audit event",
      kind: "event",
    },
  ],
};

const emptyNode: WorkflowNodeData = {
  id: "note",
  label: "Annotation",
  category: "Utility",
  description: "A visual note with no connection ports.",
  tone: "slate",
};

const statusNodes: WorkflowNodeData[] = [
  { ...classifierNode, id: "idle", label: "Idle", status: "idle", tone: "neutral" },
  { ...classifierNode, id: "running", label: "Running", status: "running", tone: "info" },
  { ...classifierNode, id: "success", label: "Success", status: "success", tone: "success" },
  { ...classifierNode, id: "warning", label: "Warning", status: "warning", tone: "warning" },
  { ...classifierNode, id: "error", label: "Error", status: "error", tone: "error" },
  { ...classifierNode, id: "custom", label: "Custom tone", status: "queued", tone: "violet" },
];

const meta = {
  title: "Components/Editors/Workflow Node",
  component: WorkflowNode,
  tags: ["autodocs", "test"],
  args: {
    node: classifierNode,
    menuItems: [{ id: "duplicate", label: "Duplicate" }],
    onNodeSelect: fn(),
    onMenuItemSelect: fn(),
  },
} satisfies Meta<typeof WorkflowNode>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const expectedSize = getWorkflowNodeSize(args.node);
    await expect(canvas.getByRole("button", { name: "Classify" })).toBeVisible();
    await expect(canvas.getByText("@moritzbrantner/text-classification")).toBeVisible();
    await expect(canvas.queryByText("running")).not.toBeInTheDocument();
    await expect(canvas.queryByText("routing")).not.toBeInTheDocument();
    await expect(canvas.queryByText("review")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Classify Text" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Classify Labels" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Minimize Classify" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Open Classify menu" })).toBeVisible();
    await expect(canvas.getByTestId("workflow-node-size")).toHaveTextContent(
      `${expectedSize.width}x${expectedSize.height}`,
    );

    await userEvent.click(canvas.getByRole("button", { name: "Classify" }));
    await expect(args.onNodeSelect).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole("button", { name: "Open Classify menu" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    await waitFor(() => {
      expect(screen.queryByRole("menuitem", { name: "Duplicate" })).not.toBeInTheDocument();
    });
    await expect(args.onMenuItemSelect).toHaveBeenCalledTimes(1);
  },
  render: (args) => (
    <div className="grid gap-4 p-4">
      <WorkflowNode {...args} />
      <span data-testid="workflow-node-size" className="text-sm text-muted-foreground">
        {`${getWorkflowNodeSize(args.node).width}x${getWorkflowNodeSize(args.node).height}`}
      </span>
    </div>
  ),
};

export const Compact: Story = {
  args: {
    node: compactPublishNode,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Publish" })).toBeVisible();
    await expect(canvas.getByText("labels -> event")).toBeVisible();
  },
};

export const TypedBoundaryNodes: Story = {
  render: () => (
    <div className="grid max-w-md gap-4 p-4">
      <WorkflowOutputOnlyNode node={typedOutputNode} />
      <WorkflowInputOnlyNode node={typedInputNode} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("readonly DocumentInput[]")).toBeVisible();
    await expect(canvas.getByText("ReportPayload")).toBeVisible();
    await expect(canvas.getAllByText("required")).toHaveLength(2);
  },
};

export const ManyPorts: Story = {
  args: {
    node: reviewNode,
    selected: true,
    onInputClick: fn(),
    onOutputClick: fn(),
    getInputAriaLabel: (port) => `Inspect input ${port.label}`,
    getOutputAriaLabel: (port) => `Inspect output ${port.label}`,
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Human review" })).toBeVisible();
    await expect(canvas.getByText("EvidenceBundle")).toBeVisible();
    await expect(canvas.getByText("optional")).toBeVisible();
    await expect(canvas.getAllByText("required")).toHaveLength(2);

    await userEvent.click(canvas.getByRole("button", { name: "Inspect input Labels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Inspect output Task" }));

    await expect(args.onInputClick).toHaveBeenCalledTimes(1);
    await expect(args.onOutputClick).toHaveBeenCalledTimes(1);
  },
};

export const MinimizedInteractive: Story = {
  args: {
    node: reviewNode,
    onMinimizedChange: fn(),
    onInputClick: fn(),
    onOutputClick: fn(),
  },
  render: (args) => {
    const [minimized, setMinimized] = React.useState(true);

    return (
      <WorkflowNode
        {...args}
        node={{ ...args.node, minimized }}
        onMinimizedChange={(node, nextMinimized) => {
          setMinimized(nextMinimized);
          args.onMinimizedChange?.(node, nextMinimized);
        }}
      />
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("3 in")).toBeVisible();
    await expect(canvas.getByText("3 out")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Expand Human review" }));
    await expect(args.onMinimizedChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "review" }),
      false,
    );
    await expect(canvas.getByRole("button", { name: "Human review Labels" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Human review Labels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Human review Approved" }));

    await expect(args.onInputClick).toHaveBeenCalledTimes(1);
    await expect(args.onOutputClick).toHaveBeenCalledTimes(1);
  },
};

export const MenuStates: Story = {
  args: {
    node: classifierNode,
    menuLabel: "Node actions",
    menuItems: [
      { id: "duplicate", label: "Duplicate" },
      { id: "disabled", label: "Disabled action", disabled: true },
      { id: "delete", label: "Delete", destructive: true },
    ],
    onMenuItemSelect: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Classify" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Open Classify menu" })).toBeVisible();
  },
};

export const EmptyAndDisabledPorts: Story = {
  args: {
    node: emptyNode,
    menuItems: [],
    inputDisabled: true,
    outputDisabled: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Annotation" })).toBeVisible();
    await expect(canvas.getAllByText("none")).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "Open Annotation menu" })).toBeVisible();
  },
};

export const StatusToneGallery: Story = {
  render: () => (
    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {statusNodes.map((node) => (
        <WorkflowNode key={node.id} node={node} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Idle" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Running" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Success" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Warning" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Error" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Custom tone" })).toBeVisible();
  },
};

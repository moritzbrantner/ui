import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen } from "storybook/test";

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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlusIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { expect, userEvent } from "storybook/test";

import { Avatar } from "./avatar";
import {
  OrgChart,
  insertOrgChartNode,
  removeOrgChartNode,
  type OrgChartNodeData,
} from "./org-chart";

const meta = {
  title: "Components/Data Display/Org Chart",
  component: OrgChart,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof OrgChart>;

export default meta;

type Story = StoryObj<typeof meta>;

function getOrgChartStoryNode(
  canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"],
  name: string,
) {
  const branch = canvas.getByRole("treeitem", { name });
  const node = branch.querySelector<HTMLElement>('[data-slot="org-chart-node"]');

  if (!node) {
    throw new Error(`Could not find org chart node ${name}`);
  }

  return node;
}

const teamNodes = [
  {
    id: "mara",
    label: "Mara Klein",
    description: "VP Product Operations",
    meta: "Release owner",
    avatar: <Avatar initials="MK" />,
    children: [
      {
        id: "nina",
        label: "Nina Patel",
        description: "Design Systems",
        meta: "UI package",
        avatar: <Avatar initials="NP" />,
      },
      {
        id: "omar",
        label: "Omar Silva",
        description: "Frontend Platform",
        meta: "Consumer checks",
        avatar: <Avatar initials="OS" />,
        children: [{ id: "ivy", label: "Ivy Chen", description: "Quality" }],
      },
    ],
  },
];

function EditableHierarchyDemo() {
  const [nodes, setNodes] = React.useState<OrgChartNodeData[]>(teamNodes);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("mara");
  const nextNodeId = React.useRef(1);

  return (
    <OrgChart
      nodes={nodes}
      selectedNodeId={selectedNodeId}
      onNodeSelect={(node) => setSelectedNodeId(node.id)}
      nodeActions={(node, context) => [
        {
          id: "add",
          label: "Add child",
          icon: <PlusIcon aria-hidden="true" />,
          onSelect: () => {
            const id = `new-${nextNodeId.current++}`;
            setNodes((currentNodes) =>
              insertOrgChartNode(currentNodes, node.id, {
                id,
                label: `New role ${nextNodeId.current - 1}`,
                description: "Draft node",
              }),
            );
            setSelectedNodeId(id);
          },
        },
        {
          id: "delete",
          label: "Delete node",
          icon: <Trash2Icon aria-hidden="true" />,
          destructive: true,
          disabled: context.depth === 0,
          onSelect: () => {
            setNodes((currentNodes) => removeOrgChartNode(currentNodes, node.id));
            setSelectedNodeId(context.parentNode?.id ?? null);
          },
        },
      ]}
    />
  );
}

export const TeamStructure: Story = {
  args: { nodes: teamNodes },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Mara Klein")).toBeVisible();
    await expect(canvas.getByText("Ivy Chen")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Collapse Mara Klein" }));
    await expect(canvas.queryByText("Nina Patel")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Expand Mara Klein" }));
    await expect(canvas.getByText("Nina Patel")).toBeVisible();
  },
};

export const CompactHierarchy: Story = {
  args: {
    nodes: [
      {
        id: "exec",
        label: "Executive sponsor",
        children: [
          { id: "ops", label: "Operations" },
          { id: "gtm", label: "Go to market" },
          { id: "support", label: "Support" },
        ],
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Go to market")).toBeVisible();
  },
};

export const MinimizedBranch: Story = {
  args: {
    nodes: teamNodes,
    defaultExpandedIds: ["mara"],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Omar Silva")).toBeVisible();
    await expect(canvas.queryByText("Ivy Chen")).not.toBeInTheDocument();
  },
};

export const EditableHierarchy: Story = {
  render: () => <EditableHierarchyDemo />,
  play: async ({ canvas }) => {
    await expect(getOrgChartStoryNode(canvas, "Mara Klein")).toBeVisible();
    await userEvent.click(canvas.getAllByRole("button", { name: "Add child" })[0]);
    await expect(canvas.getByText("New role 1")).toBeVisible();
    const deleteButtons = canvas.getAllByRole("button", { name: "Delete node" });
    await userEvent.click(deleteButtons[deleteButtons.length - 1]);
    await expect(canvas.queryByText("New role 1")).not.toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  render: () => {
    const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("mara");
    const [focusedNodeId, setFocusedNodeId] = React.useState<string | null>("mara");

    return (
      <OrgChart
        nodes={teamNodes}
        selectedNodeId={selectedNodeId}
        focusedNodeId={focusedNodeId}
        onFocusedNodeIdChange={(nodeId) => setFocusedNodeId(nodeId)}
        onNodeSelect={(node) => setSelectedNodeId(node.id)}
        getNodeDisabled={(node) => node.id === "ivy"}
      />
    );
  },
  play: async ({ canvas }) => {
    const mara = getOrgChartStoryNode(canvas, "Mara Klein");

    mara.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(getOrgChartStoryNode(canvas, "Nina Patel")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(getOrgChartStoryNode(canvas, "Omar Silva")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("treeitem", { name: "Omar Silva" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

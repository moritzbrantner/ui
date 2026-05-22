import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  WorkflowBuilder,
  getWorkflowBuilderConnectionValidity,
  type WorkflowBuilderEdge,
  type WorkflowBuilderNodeData,
} from "./workflow-builder";

const nodes: WorkflowBuilderNodeData[] = [
  {
    id: "source",
    label: "Source",
    x: 24,
    y: 48,
    outputs: [{ id: "asset", label: "Asset", kind: "asset" }],
  },
  {
    id: "target",
    label: "Target",
    x: 340,
    y: 48,
    inputs: [{ id: "asset", label: "Asset", kind: "asset" }],
  },
];

const edges: WorkflowBuilderEdge[] = [
  {
    id: "edge-source-target",
    sourceNodeId: "source",
    sourcePortId: "asset",
    targetNodeId: "target",
    targetPortId: "asset",
  },
];

describe("WorkflowBuilder", () => {
  test("connection validity accepts matching ports and explains rejected connections", () => {
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes,
        edges: [],
        sourceNodeId: "source",
        sourcePortId: "asset",
        targetNodeId: "target",
        targetPortId: "asset",
      }),
    ).toEqual({ valid: true });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes,
        edges,
        sourceNodeId: "source",
        sourcePortId: "asset",
        targetNodeId: "target",
        targetPortId: "asset",
      }),
    ).toEqual({ valid: false, reason: "duplicate" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes,
        edges: [],
        sourceNodeId: "source",
        sourcePortId: "missing",
        targetNodeId: "target",
        targetPortId: "asset",
      }),
    ).toEqual({ valid: false, reason: "missing-port" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes: [
          {
            id: "loop",
            label: "Loop",
            x: 0,
            y: 0,
            inputs: [{ id: "asset-in", label: "Asset", kind: "asset" }],
            outputs: [{ id: "asset-out", label: "Asset", kind: "asset" }],
          },
        ],
        edges: [],
        sourceNodeId: "loop",
        sourcePortId: "asset-out",
        targetNodeId: "loop",
        targetPortId: "asset-in",
      }),
    ).toEqual({ valid: false, reason: "self-connection" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes: [
          nodes[0]!,
          {
            ...nodes[1]!,
            inputs: [{ id: "document", label: "Document", kind: "document" }],
          },
        ],
        edges: [],
        sourceNodeId: "source",
        sourcePortId: "asset",
        targetNodeId: "target",
        targetPortId: "document",
      }),
    ).toEqual({ valid: false, reason: "kind-mismatch" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes: [
          {
            ...nodes[0]!,
            outputs: [{ id: "asset", label: "Asset", type: "AssetRef" }],
          },
          {
            ...nodes[1]!,
            inputs: [{ id: "asset", label: "Asset", type: "DocumentRef" }],
          },
        ],
        edges: [],
        sourceNodeId: "source",
        sourcePortId: "asset",
        targetNodeId: "target",
        targetPortId: "asset",
      }),
    ).toEqual({ valid: false, reason: "type-mismatch" });
  });

  test("controlled viewport calls onViewportChange", () => {
    const onViewportChange = vi.fn();

    render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[]}
        viewport={{ x: 12, y: 16, zoom: 1.2 }}
        onViewportChange={onViewportChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(onViewportChange).toHaveBeenCalledWith({ x: 12, y: 16, zoom: 1.3 });
  });

  test("zoom controls clamp at configured min and max", () => {
    const onViewportChange = vi.fn();
    const { rerender } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[]}
        viewport={{ x: 0, y: 0, zoom: 1.2 }}
        minZoom={0.8}
        maxZoom={1.2}
        onViewportChange={onViewportChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onViewportChange).not.toHaveBeenCalled();

    rerender(
      <WorkflowBuilder
        nodes={nodes}
        edges={[]}
        viewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.8}
        maxZoom={1.2}
        onViewportChange={onViewportChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  test("custom connection validation can reject a connection", () => {
    const onEdgesChange = vi.fn();
    const onConnectionComplete = vi.fn();

    render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[]}
        onEdgesChange={onEdgesChange}
        onConnectionComplete={onConnectionComplete}
        isConnectionValid={() => ({ valid: false, reason: "kind-mismatch" })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Source Asset" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect to Target Asset" }));

    expect(onEdgesChange).not.toHaveBeenCalled();
    expect(onConnectionComplete).not.toHaveBeenCalled();
  });

  test("connection lifecycle callbacks fire", () => {
    const onEdgesChange = vi.fn();
    const onConnectionStart = vi.fn();
    const onConnectionCancel = vi.fn();
    const onConnectionComplete = vi.fn();

    const { container } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[]}
        onEdgesChange={onEdgesChange}
        onConnectionStart={onConnectionStart}
        onConnectionCancel={onConnectionCancel}
        onConnectionComplete={onConnectionComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Source Asset" }));
    expect(onConnectionStart).toHaveBeenCalledWith({
      sourceNodeId: "source",
      sourcePortId: "asset",
    });

    fireEvent.keyDown(container.querySelector("[data-slot='workflow-builder']")!, {
      key: "Escape",
    });
    expect(onConnectionCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Start Source Asset" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect to Target Asset" }));

    expect(onEdgesChange).toHaveBeenCalledTimes(1);
    expect(onConnectionComplete).toHaveBeenCalledWith({
      sourceNodeId: "source",
      sourcePortId: "asset",
      targetNodeId: "target",
      targetPortId: "asset",
    });
  });

  test("rejects duplicate connections without completing the lifecycle", () => {
    const onEdgesChange = vi.fn();
    const onConnectionComplete = vi.fn();

    render(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnectionComplete={onConnectionComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Source Asset" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect to Target Asset" }));

    expect(onEdgesChange).not.toHaveBeenCalled();
    expect(onConnectionComplete).not.toHaveBeenCalled();
  });

  test("read-only mode disables connection and delete controls", () => {
    const onEdgesChange = vi.fn();
    render(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        selectedEdgeId="edge-source-target"
        readOnly
        onEdgesChange={onEdgesChange}
      />,
    );

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Start Source Asset" }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Connect to Target Asset" }).disabled,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Delete selected" }).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));
    expect(onEdgesChange).not.toHaveBeenCalled();
  });

  test("Delete removes selected edge only when not read-only", () => {
    const onEdgesChange = vi.fn();
    const { container, rerender } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        selectedEdgeId="edge-source-target"
        onEdgesChange={onEdgesChange}
      />,
    );
    const builder = container.querySelector("[data-slot='workflow-builder']")!;

    fireEvent.keyDown(builder, { key: "Delete" });
    expect(onEdgesChange).toHaveBeenCalledWith([]);

    onEdgesChange.mockClear();
    rerender(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        selectedEdgeId="edge-source-target"
        onEdgesChange={onEdgesChange}
        readOnly
      />,
    );

    fireEvent.keyDown(builder, { key: "Delete" });
    expect(onEdgesChange).not.toHaveBeenCalled();
  });

  test("selecting and deleting a node removes incident edges", () => {
    const onNodesChange = vi.fn();
    const onEdgesChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "node", id: "source" }),
    );
    expect(onNodesChange).toHaveBeenCalledWith([nodes[1]]);
    expect(onEdgesChange).toHaveBeenCalledWith([]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });

  test("node minimize controls update builder nodes without starting a drag", () => {
    const onNodesChange = vi.fn();
    render(<WorkflowBuilder nodes={nodes} edges={[]} onNodesChange={onNodesChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Minimize Source" }));

    expect(onNodesChange).toHaveBeenCalledWith([{ ...nodes[0], minimized: true }, nodes[1]]);
  });

  test("supports minimap visibility, surface height, toolbar labels, and computed fit view", () => {
    const onViewportChange = vi.fn();
    const { container, rerender } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        showMiniMap={false}
        surfaceHeight={360}
        toolbarLabel="Release workflow"
        canvasSize={{ width: 800, height: 400 }}
        onViewportChange={onViewportChange}
      />,
    );

    expect(screen.getByText("Release workflow")).toBeTruthy();
    expect(container.querySelector('[data-slot="workflow-builder-minimap"]')).toBeNull();
    expect(
      (container.querySelector('[data-slot="workflow-builder-surface"]') as HTMLElement).style
        .height,
    ).toBe("360px");

    fireEvent.click(screen.getByRole("button", { name: "Fit view" }));

    expect(onViewportChange).toHaveBeenCalledWith(
      expect.objectContaining({
        zoom: expect.any(Number),
      }),
    );

    rerender(<WorkflowBuilder nodes={nodes} edges={edges} showMiniMap />);

    expect(container.querySelector('[data-slot="workflow-builder-minimap"]')).toBeTruthy();
  });

  test("selects edges with keyboard activation", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <WorkflowBuilder nodes={nodes} edges={edges} onSelectionChange={onSelectionChange} />,
    );
    const edgeHit = container.querySelector('[data-slot="workflow-builder-edge-hit"]')!;

    fireEvent.keyDown(edgeHit, { key: "Enter" });

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "edge", id: "edge-source-target" }),
    );
  });

  test("selects edges with pointer activation and clears selection with Escape", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <WorkflowBuilder nodes={nodes} edges={edges} onSelectionChange={onSelectionChange} />,
    );
    const builder = container.querySelector("[data-slot='workflow-builder']")!;
    const edgeHit = container.querySelector('[data-slot="workflow-builder-edge-hit"]')!;

    fireEvent.click(edgeHit);
    fireEvent.keyDown(builder, { key: "Escape" });

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "edge", id: "edge-source-target" }),
    );
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });

  test("snaps dragged nodes when adjacent ports match", () => {
    const onNodesChange = vi.fn();
    const snapNodes: WorkflowBuilderNodeData[] = [
      {
        id: "source",
        label: "Source",
        x: 0,
        y: 0,
        outputs: [{ id: "asset", label: "Asset", kind: "asset" }],
      },
      {
        id: "target",
        label: "Target",
        x: 320,
        y: 0,
        inputs: [{ id: "asset", label: "Asset", kind: "asset" }],
      },
    ];

    const { container } = render(
      <WorkflowBuilder nodes={snapNodes} edges={[]} onNodesChange={onNodesChange} />,
    );
    const sourceNode = container.querySelector<HTMLElement>(
      "[data-slot='workflow-builder-node'][data-node-id='source']",
    )!;
    const surface = container.querySelector<HTMLElement>("[data-slot='workflow-builder-surface']")!;

    fireEvent.pointerDown(sourceNode, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(surface, { clientX: 12, clientY: 0 });

    expect(onNodesChange).toHaveBeenCalledWith([
      {
        ...snapNodes[0],
        x: 10,
        y: 0,
      },
      snapNodes[1],
    ]);
  });
});

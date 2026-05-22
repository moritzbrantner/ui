import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  WorkflowBuilder,
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
});

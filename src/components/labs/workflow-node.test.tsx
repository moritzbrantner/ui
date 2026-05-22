import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  WorkflowInputOnlyNode,
  WorkflowNode,
  WorkflowOutputOnlyNode,
  getWorkflowNodePortCenterOffset,
  getWorkflowNodePortTypeLabel,
  getWorkflowNodePortTypeSource,
  getWorkflowNodeSize,
  type WorkflowNodeData,
  type WorkflowNodeMenuItem,
} from "./workflow-node";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function openMenu(trigger: HTMLElement) {
  trigger.focus();
  fireEvent.keyDown(trigger, { code: "Enter", key: "Enter" });
}

const duplexNode: WorkflowNodeData = {
  id: "classify",
  label: "Classify",
  category: "AI",
  packageLabel: "@platform/classifier",
  description: "Assign labels to normalized text and route low confidence items.",
  status: "running",
  tags: ["routing", "review"],
  inputs: [
    {
      id: "text",
      label: "Text",
      kind: "text",
      required: true,
      description: "Normalized OCR output.",
    },
    {
      id: "page",
      label: "Page context",
      type: {
        label: "PageContext",
        source: "Readonly<{ page: number; bounds: DOMRectReadOnly[] }>",
      },
      badge: "optional",
      color: "#334155",
    },
  ],
  outputs: [
    {
      id: "labels",
      label: "Labels",
      kind: "labels",
      description: "Predicted taxonomy labels.",
    },
    {
      id: "task",
      label: "Review task",
      kind: "task",
      required: true,
    },
  ],
};

describe("WorkflowNode", () => {
  test("renders metadata, duplex port columns, typed badges, and computed dimensions", () => {
    const { container } = render(<WorkflowNode node={duplexNode} selected />);
    const node = container.querySelector<HTMLElement>('[data-slot="workflow-node"]')!;

    expect(node.dataset.selected).toBe("true");
    expect(node.dataset.status).toBe("running");
    expect(node.style.width).toBe(`${getWorkflowNodeSize(duplexNode).width}px`);
    expect(node.style.height).toBe(`${getWorkflowNodeSize(duplexNode).height}px`);
    expect(screen.getByRole("button", { name: "Classify" })).toBeTruthy();
    expect(screen.getByText("@platform/classifier")).toBeTruthy();
    expect(screen.getByText("AI")).toBeTruthy();
    expect(screen.getByText("Inputs")).toBeTruthy();
    expect(screen.getByText("Outputs")).toBeTruthy();
    expect(screen.getByText("text")).toBeTruthy();
    expect(screen.getByText("PageContext")).toBeTruthy();
    expect(screen.getByText("optional")).toBeTruthy();
    expect(screen.getAllByText("required")).toHaveLength(2);
    expect(
      container
        .querySelector('[data-slot="workflow-node-ports"]')
        ?.getAttribute("data-port-layout"),
    ).toBe("duplex");
  });

  test("calls selection and port callbacks with the selected node and port", () => {
    const onNodeSelect = vi.fn();
    const onInputClick = vi.fn();
    const onOutputClick = vi.fn();

    render(
      <WorkflowNode
        node={duplexNode}
        onNodeSelect={onNodeSelect}
        onInputClick={onInputClick}
        onOutputClick={onOutputClick}
        getInputAriaLabel={(port, node) => `Accept ${node.label} ${port.label}`}
        getOutputAriaLabel={(port, node) => `Emit ${node.label} ${port.label}`}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Classify" }));
    fireEvent.click(screen.getByRole("button", { name: "Accept Classify Text" }));
    fireEvent.click(screen.getByRole("button", { name: "Emit Classify Labels" }));

    expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "classify" }));
    expect(onInputClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "text" }),
      expect.objectContaining({ id: "classify" }),
    );
    expect(onOutputClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "labels" }),
      expect.objectContaining({ id: "classify" }),
    );
  });

  test("supports uncontrolled minimize and expand interactions", () => {
    const onMinimizedChange = vi.fn();
    const { container } = render(
      <WorkflowNode node={duplexNode} onMinimizedChange={onMinimizedChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Minimize Classify" }));

    expect(
      container.querySelector('[data-slot="workflow-node"]')?.getAttribute("data-minimized"),
    ).toBe("true");
    expect(screen.getByText("2 in")).toBeTruthy();
    expect(screen.getByText("2 out")).toBeTruthy();
    expect(onMinimizedChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "classify" }),
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand Classify" }));

    expect(
      container.querySelector('[data-slot="workflow-node"]')?.getAttribute("data-minimized"),
    ).toBeNull();
    expect(onMinimizedChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "classify", minimized: true }),
      false,
    );
  });

  test("keeps controlled minimized state until props change", () => {
    const onMinimizedChange = vi.fn();
    const minimizedNode = { ...duplexNode, minimized: true };
    const { container, rerender } = render(
      <WorkflowNode node={minimizedNode} onMinimizedChange={onMinimizedChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand Classify" }));

    expect(onMinimizedChange).toHaveBeenCalledWith(minimizedNode, false);
    expect(
      container.querySelector('[data-slot="workflow-node"]')?.getAttribute("data-minimized"),
    ).toBe("true");

    rerender(<WorkflowNode node={{ ...duplexNode, minimized: false }} />);

    expect(
      container.querySelector('[data-slot="workflow-node"]')?.getAttribute("data-minimized"),
    ).toBeNull();
  });

  test("renders compact nodes with inline ports and disables output when read-only", () => {
    const onInputClick = vi.fn();
    const onOutputClick = vi.fn();
    const compactNode: WorkflowNodeData = {
      ...duplexNode,
      variant: "compact",
      inputs: [duplexNode.inputs![0]!],
      outputs: [duplexNode.outputs![0]!],
    };

    const { container } = render(
      <WorkflowNode
        node={compactNode}
        readOnly
        onInputClick={onInputClick}
        onOutputClick={onOutputClick}
      />,
    );

    expect(
      container.querySelector('[data-slot="workflow-node"]')?.getAttribute("data-compact"),
    ).toBe("true");
    expect(screen.getByText("text -> labels")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Classify Text" }));
    fireEvent.click(screen.getByRole("button", { name: "Classify Labels" }));

    expect(onInputClick).toHaveBeenCalledTimes(1);
    expect(onOutputClick).not.toHaveBeenCalled();
  });

  test("renders input-only and output-only wrappers with the opposite side unavailable", () => {
    const inputClick = vi.fn();
    const outputClick = vi.fn();

    const { rerender } = render(
      <WorkflowInputOnlyNode
        node={{
          id: "sink",
          label: "Sink",
          inputs: [{ id: "result", label: "Result", kind: "result" }],
        }}
        onInputClick={inputClick}
      />,
    );

    expect(screen.getByText("Inputs")).toBeTruthy();
    expect(screen.queryByText("Outputs")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sink Result" }));
    expect(inputClick).toHaveBeenCalledTimes(1);

    rerender(
      <WorkflowOutputOnlyNode
        node={{
          id: "source",
          label: "Source",
          outputs: [{ id: "asset", label: "Asset", kind: "asset" }],
        }}
        onOutputClick={outputClick}
      />,
    );

    expect(screen.queryByText("Inputs")).toBeNull();
    expect(screen.getByText("Outputs")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Source Asset" }));
    expect(outputClick).toHaveBeenCalledTimes(1);
  });

  test("runs menu item callbacks and suppresses disabled menu actions", async () => {
    const duplicate = vi.fn();
    const disabled = vi.fn();
    const onMenuItemSelect = vi.fn();
    const menuItems: WorkflowNodeMenuItem[] = [
      { id: "duplicate", label: "Duplicate", onSelect: duplicate },
      { id: "disabled", label: "Disabled action", disabled: true, onSelect: disabled },
      { id: "delete", label: "Delete", destructive: true },
    ];

    render(
      <WorkflowNode
        node={duplexNode}
        menuLabel="Node actions"
        menuItems={menuItems}
        onMenuItemSelect={onMenuItemSelect}
      />,
    );

    openMenu(screen.getByRole("button", { name: "Open Classify menu" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

    expect(duplicate).toHaveBeenCalledWith(expect.objectContaining({ id: "classify" }));
    expect(onMenuItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "duplicate" }),
      expect.objectContaining({ id: "classify" }),
    );

    openMenu(screen.getByRole("button", { name: "Open Classify menu" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Disabled action" }));

    expect(disabled).not.toHaveBeenCalled();
  });

  test("exposes stable port type and geometry helpers", () => {
    const textPort = duplexNode.inputs![0]!;
    const typedPort = duplexNode.inputs![1]!;

    expect(getWorkflowNodePortTypeLabel(textPort)).toBe("text");
    expect(getWorkflowNodePortTypeLabel(typedPort)).toBe("PageContext");
    expect(getWorkflowNodePortTypeSource(typedPort)).toBe(
      "Readonly<{ page: number; bounds: DOMRectReadOnly[] }>",
    );
    expect(getWorkflowNodeSize({ ...duplexNode, variant: "compact" })).toEqual({
      width: 240,
      height: 48,
    });
    expect(getWorkflowNodeSize({ ...duplexNode, minimized: true })).toEqual({
      width: 230,
      height: 102,
    });
    expect(getWorkflowNodePortCenterOffset(duplexNode, 0)).toBeLessThan(
      getWorkflowNodePortCenterOffset(duplexNode, 1),
    );
  });
});

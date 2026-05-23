import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { OrgChart, insertOrgChartNode, removeOrgChartNode, updateOrgChartNode } from "./org-chart";

const nodes = [
  {
    id: "vp",
    label: "VP Product",
    description: "Business owner",
    children: [
      { id: "design", label: "Design Lead" },
      { id: "eng", label: "Engineering Lead", children: [{ id: "qa", label: "QA Lead" }] },
    ],
  },
];

describe("OrgChart", () => {
  test("renders recursive child nodes", () => {
    render(<OrgChart nodes={nodes} />);

    expect(screen.getByText("VP Product")).toBeTruthy();
    expect(screen.getByText("Design Lead")).toBeTruthy();
    expect(screen.getByText("QA Lead")).toBeTruthy();
  });

  test("renders an empty state", () => {
    render(<OrgChart nodes={[]} emptyMessage="No team" />);

    expect(screen.getByText("No team")).toBeTruthy();
  });

  test("supports custom node rendering", () => {
    render(<OrgChart nodes={nodes} renderNode={(node) => <strong>{node.id}</strong>} />);

    expect(screen.getByText("vp")).toBeTruthy();
  });

  test("minimizes child branches", () => {
    render(<OrgChart nodes={nodes} />);

    const root = screen.getByRole("treeitem", { name: /VP Product/ });
    expect(root.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Design Lead")).toBeTruthy();
    expect(screen.getByText("QA Lead")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Collapse VP Product" }));

    expect(root.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Design Lead")).toBeNull();
    expect(screen.queryByText("QA Lead")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand VP Product" }));

    expect(root.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Design Lead")).toBeTruthy();
  });

  test("supports controlled expanded nodes", () => {
    const onExpandedIdsChange = vi.fn();

    render(<OrgChart nodes={nodes} expandedIds={[]} onExpandedIdsChange={onExpandedIdsChange} />);

    expect(screen.queryByText("Design Lead")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand VP Product" }));

    expect(onExpandedIdsChange).toHaveBeenCalledWith(["vp"], nodes[0]);
    expect(screen.queryByText("Design Lead")).toBeNull();
  });

  test("selects nodes and runs node actions with nested context", () => {
    const onNodeSelect = vi.fn();
    const onNodeActionSelect = vi.fn();

    const { container } = render(
      <OrgChart
        nodes={nodes}
        selectedNodeId="eng"
        nodeActions={[
          { id: "add", label: "Add child" },
          { id: "delete", label: "Delete node", destructive: true },
        ]}
        onNodeSelect={onNodeSelect}
        onNodeActionSelect={onNodeActionSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Engineering Lead" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Add child" })[2] as HTMLElement);

    const selectedBranch = container.querySelector(
      '[data-slot="org-chart-node-branch"][aria-selected="true"]',
    );

    expect(selectedBranch?.textContent).toContain("Engineering Lead");
    expect(onNodeSelect).toHaveBeenCalledWith(
      nodes[0].children?.[1],
      expect.objectContaining({ depth: 1, path: ["vp", "eng"], selected: true }),
    );
    expect(onNodeActionSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "add" }),
      nodes[0].children?.[1],
      expect.objectContaining({ depth: 1, path: ["vp", "eng"] }),
    );
  });

  test("updates nested node data immutably", () => {
    const inserted = insertOrgChartNode(nodes, "eng", { id: "platform", label: "Platform Lead" });
    const updated = updateOrgChartNode(inserted, "platform", (node) => ({
      ...node,
      description: "Frontend quality",
    }));
    const removed = removeOrgChartNode(updated, "design");

    expect(inserted[0]?.children?.[1]?.children?.map((node) => node.id)).toEqual([
      "qa",
      "platform",
    ]);
    expect(updated[0]?.children?.[1]?.children?.[1]?.description).toBe("Frontend quality");
    expect(removed[0]?.children?.map((node) => node.id)).toEqual(["eng"]);
    expect(nodes[0]?.children?.[1]?.children).toHaveLength(1);
  });
});

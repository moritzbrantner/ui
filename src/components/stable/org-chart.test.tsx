import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

function getOrgChartNode(name: string) {
  const branch = screen.getByRole("treeitem", { name });
  const node = branch.querySelector<HTMLElement>('[data-slot="org-chart-node"]');

  if (!node) {
    throw new Error(`Could not find org chart node ${name}`);
  }

  return node;
}

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

  test("moves focus through visible nodes with arrow up and down", async () => {
    const onNodeSelect = vi.fn();

    render(<OrgChart nodes={nodes} onNodeSelect={onNodeSelect} />);

    const root = getOrgChartNode("VP Product");
    root.focus();

    fireEvent.keyDown(root, { key: "ArrowDown" });

    await waitFor(() => expect(getOrgChartNode("Design Lead")).toBe(document.activeElement));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowUp" });

    await waitFor(() => expect(root).toBe(document.activeElement));
  });

  test("expands collapsed branches and focuses the first child with arrow right", async () => {
    render(<OrgChart nodes={nodes} defaultExpandedIds={[]} onNodeSelect={vi.fn()} />);

    const root = getOrgChartNode("VP Product");
    root.focus();

    fireEvent.keyDown(root, { key: "ArrowRight" });

    await waitFor(() => {
      expect(screen.getByText("Design Lead")).toBeTruthy();
      expect(getOrgChartNode("Design Lead")).toBe(document.activeElement);
    });
  });

  test("collapses expanded branches or moves focus to the parent with arrow left", async () => {
    render(<OrgChart nodes={nodes} defaultFocusedNodeId="eng" onNodeSelect={vi.fn()} />);

    const engineering = getOrgChartNode("Engineering Lead");
    engineering.focus();

    fireEvent.keyDown(engineering, { key: "ArrowLeft" });

    await waitFor(() => expect(screen.queryByText("QA Lead")).toBeNull());
    expect(engineering).toBe(document.activeElement);

    fireEvent.keyDown(engineering, { key: "ArrowLeft" });

    await waitFor(() => expect(getOrgChartNode("VP Product")).toBe(document.activeElement));
  });

  test("moves focus to the first and last visible nodes with home and end", async () => {
    render(<OrgChart nodes={nodes} defaultFocusedNodeId="design" onNodeSelect={vi.fn()} />);

    const design = getOrgChartNode("Design Lead");
    design.focus();

    fireEvent.keyDown(design, { key: "End" });

    await waitFor(() => expect(getOrgChartNode("QA Lead")).toBe(document.activeElement));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Home" });

    await waitFor(() => expect(getOrgChartNode("VP Product")).toBe(document.activeElement));
  });

  test("skips disabled nodes during keyboard navigation", async () => {
    render(
      <OrgChart
        nodes={nodes}
        onNodeSelect={vi.fn()}
        getNodeDisabled={(node) => node.id === "design"}
      />,
    );

    const root = getOrgChartNode("VP Product");
    root.focus();

    fireEvent.keyDown(root, { key: "ArrowDown" });

    await waitFor(() => expect(getOrgChartNode("Engineering Lead")).toBe(document.activeElement));
    expect(
      screen.getByRole("treeitem", { name: "Design Lead" }).getAttribute("aria-disabled"),
    ).toBe("true");
  });

  test("reports focused node changes with node and render context", async () => {
    const onFocusedNodeIdChange = vi.fn();

    render(
      <OrgChart
        nodes={nodes}
        onNodeSelect={vi.fn()}
        onFocusedNodeIdChange={onFocusedNodeIdChange}
      />,
    );

    const root = getOrgChartNode("VP Product");
    root.focus();
    fireEvent.keyDown(root, { key: "ArrowDown" });

    await waitFor(() =>
      expect(onFocusedNodeIdChange).toHaveBeenLastCalledWith(
        "design",
        nodes[0].children?.[0],
        expect.objectContaining({
          depth: 1,
          siblingCount: 2,
          focused: true,
          disabled: false,
          path: ["vp", "design"],
        }),
      ),
    );
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

    fireEvent.click(getOrgChartNode("Engineering Lead"));
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

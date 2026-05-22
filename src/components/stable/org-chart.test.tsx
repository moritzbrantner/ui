import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { OrgChart } from "./org-chart";

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
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

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
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { RelationshipMap } from "./relationship-map";

const nodes = [
  { id: "product", label: "Product", x: 0, y: 0 },
  { id: "sales", label: "Sales", x: 280, y: 0 },
  { id: "support", label: "Support", x: 280, y: 160 },
];

describe("RelationshipMap", () => {
  test("renders nodes and skips invalid edges", () => {
    const { container } = render(
      <RelationshipMap
        ariaLabel="Stakeholder map"
        nodes={nodes}
        edges={[
          { id: "valid", source: "product", target: "sales", label: "aligns" },
          { id: "invalid", source: "missing", target: "sales" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Stakeholder map" })).toBeTruthy();
    expect(screen.getByText("Product")).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="relationship-map-edge"]')).toHaveLength(1);
  });

  test("renders direction markers and manual points", () => {
    const { container } = render(
      <RelationshipMap
        nodes={nodes}
        edges={[
          {
            id: "both",
            source: "product",
            target: "support",
            direction: "both",
            points: [
              { x: 100, y: 100 },
              { x: 180, y: 140 },
              { x: 280, y: 200 },
            ],
          },
        ]}
      />,
    );
    const path = container.querySelector('[data-slot="relationship-map-edge"] path');

    expect(path?.getAttribute("marker-start")).toContain("url(");
    expect(path?.getAttribute("marker-end")).toContain("url(");
    expect(path?.getAttribute("d")).toContain("M 100 100 L 180 140 L 280 200");
  });

  test("renders an empty state", () => {
    render(<RelationshipMap nodes={[]} emptyMessage="No dependencies" />);

    expect(screen.getByText("No dependencies")).toBeTruthy();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  UmlClassDiagram,
  UmlDiagram,
  UmlStateDiagram,
  getUmlDiagramBounds,
  type PositionedUmlDiagramNode,
} from "..";

describe("UML diagram", () => {
  test("renders a generic diagram with accessible SVG and edge labels", () => {
    const { container } = render(
      <UmlDiagram
        ariaLabel="Order flow"
        nodes={[
          { id: "draft", label: "Draft", x: 0, y: 0 },
          { id: "paid", label: "Paid", x: 260, y: 0 },
        ]}
        edges={[
          {
            id: "pay",
            source: "draft",
            target: "paid",
            label: "pay()",
            kind: "transition",
          },
        ]}
        caption="Payment state transition."
      />,
    );

    expect(screen.getByRole("img", { name: "Order flow" })).toBeTruthy();
    expect(screen.getByText("Draft")).toBeTruthy();
    expect(screen.getByText("pay()")).toBeTruthy();
    expect(screen.getByText("Payment state transition.")).toBeTruthy();
    expect(container.querySelector('[data-slot="uml-diagram-edge"]')?.getAttribute("d")).toContain(
      "M",
    );
  });

  test("renders class diagrams with class sections and relationship markers", () => {
    const { container } = render(
      <UmlClassDiagram
        ariaLabel="Billing classes"
        classes={[
          {
            id: "invoice",
            name: "Invoice",
            attributes: ["+ total: Money", "- status: InvoiceStatus"],
            operations: ["+ markPaid(): void"],
            x: 0,
            y: 0,
          },
          {
            id: "payable",
            name: "Payable",
            kind: "interface",
            operations: ["+ pay(): Receipt"],
            x: 300,
            y: 24,
          },
        ]}
        relationships={[
          {
            id: "implements",
            source: "invoice",
            target: "payable",
            kind: "realization",
          },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Billing classes" })).toBeTruthy();
    expect(screen.getByText("Invoice")).toBeTruthy();
    expect(screen.getByText("<<interface>>")).toBeTruthy();
    expect(screen.getByText("+ markPaid(): void")).toBeTruthy();
    expect(
      container.querySelector('[data-kind="realization"] [data-slot="uml-diagram-edge"]'),
    ).toBeTruthy();
    expect(
      container
        .querySelector('[data-kind="realization"] [data-slot="uml-diagram-edge"]')
        ?.getAttribute("marker-end"),
    ).toContain("uml-triangle");
  });

  test("renders state diagrams with pseudo states and transitions", () => {
    const { container } = render(
      <UmlStateDiagram
        ariaLabel="Upload states"
        states={[
          { id: "initial", kind: "initial", x: 0, y: 42 },
          {
            id: "uploading",
            label: "Uploading",
            activities: ["entry / startProgress()", "do / streamFile()"],
            x: 92,
            y: 0,
          },
          { id: "done", kind: "final", x: 360, y: 42 },
        ]}
        transitions={[
          { id: "start", source: "initial", target: "uploading" },
          { id: "finish", source: "uploading", target: "done", label: "complete" },
        ]}
      />,
    );

    expect(screen.getByRole("img", { name: "Upload states" })).toBeTruthy();
    expect(screen.getByText("Uploading")).toBeTruthy();
    expect(screen.getByText("complete")).toBeTruthy();
    expect(container.querySelector('[data-kind="initial"] circle')).toBeTruthy();
    expect(container.querySelector('[data-kind="final"] circle')).toBeTruthy();
  });

  test("computes bounds from nodes and routed edge points", () => {
    const nodes: PositionedUmlDiagramNode[] = [
      { id: "a", label: "A", x: 10, y: 20, width: 100, height: 80 },
      { id: "b", label: "B", x: 260, y: 140, width: 100, height: 80 },
    ];

    expect(
      getUmlDiagramBounds(nodes, [
        { id: "edge", source: "a", target: "b", points: [{ x: 180, y: -20 }] },
      ]),
    ).toEqual({ x: 10, y: -20, width: 350, height: 240 });
  });
});

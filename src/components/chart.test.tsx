import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ChartBarGraph, ChartLineGraph, ChartPretext, ChartPretextText } from "./chart";

const data = [
  { label: "Q1", actual: 24, target: 30 },
  { label: "Q2", actual: 36, target: 34 },
  { label: "Q3", actual: 42, target: 40 },
];

const series = [
  { key: "actual", label: "Actual", color: "var(--chart-1)" },
  { key: "target", label: "Target", color: "var(--chart-2)" },
];

describe("chart graph components", () => {
  test("renders line chart pretext before the visible line series", () => {
    render(
      <ChartLineGraph
        ariaLabel="Quarterly trend"
        data={data}
        series={series}
        pretext={[{ x: 300, y: 100, children: "Target range" }]}
      />,
    );

    const svg = screen.getByRole("img", { name: "Quarterly trend" });
    const pretext = svg.querySelector('[data-slot="chart-pretext"]');
    const seriesGroup = svg.querySelector('[data-slot="chart-line-graph-series"]');

    expect(screen.getByText("Target range")).toBeTruthy();
    expect(pretext).not.toBeNull();
    expect(seriesGroup).not.toBeNull();
    expect(pretext?.compareDocumentPosition(seriesGroup as Element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  test("renders bars and legend labels", () => {
    render(<ChartBarGraph ariaLabel="Quarterly bars" data={data} series={series} />);

    expect(screen.getByRole("img", { name: "Quarterly bars" })).toBeTruthy();
    expect(screen.getAllByText("Actual")).toHaveLength(1);
    expect(screen.getAllByText("Target")).toHaveLength(1);
  });

  test("exposes standalone pretext primitives", () => {
    render(
      <svg>
        <ChartPretext>
          <ChartPretextText x={10} y={10}>
            Annotation
          </ChartPretextText>
        </ChartPretext>
      </svg>,
    );

    expect(screen.getByText("Annotation").getAttribute("data-slot")).toBe("chart-pretext-text");
  });
});

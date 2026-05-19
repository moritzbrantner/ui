import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  ChartAreaGraph,
  ChartBarGraph,
  ChartLineGraph,
  ChartPretext,
  ChartPretextText,
} from "./chart";

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

  test("renders area charts with the shared graph primitives", () => {
    const { container } = render(
      <ChartAreaGraph ariaLabel="Quarterly area" data={data} series={series} />,
    );

    expect(screen.getByRole("img", { name: "Quarterly area" })).toBeTruthy();
    expect(container.querySelector('[data-slot="chart-area-graph-area"]')).not.toBeNull();
  });

  test("shows an interactive tooltip and crosshair on hover", () => {
    const { container } = render(
      <ChartLineGraph ariaLabel="Quarterly trend" data={data} series={series} xKey="label" />,
    );
    const hitAreas = container.querySelectorAll('[data-slot="chart-hit-area"]');

    fireEvent.pointerEnter(hitAreas[1]);

    const tooltip = container.querySelector('[data-slot="chart-graph-tooltip"]');

    expect(tooltip).not.toBeNull();
    expect(container.querySelector('[data-slot="chart-crosshair"]')).not.toBeNull();
    expect(within(tooltip as HTMLElement).getByText("Q2")).toBeTruthy();
    expect(within(tooltip as HTMLElement).getByText("36")).toBeTruthy();
    expect(within(tooltip as HTMLElement).getByText("34")).toBeTruthy();
  });

  test("uses a valid graphics role for labeled svg hit areas", () => {
    const { container } = render(
      <ChartBarGraph ariaLabel="Quarterly bars" data={data} series={series} xKey="label" />,
    );
    const hitArea = container.querySelector('[data-slot="chart-hit-area"]');

    expect(hitArea?.getAttribute("role")).toBe("graphics-symbol");
    expect(hitArea?.getAttribute("aria-label")).toBe("Quarterly bars Q1");
  });

  test("adds a horizontal scroll surface for dense data", () => {
    const denseData = Array.from({ length: 18 }, (_, index) => ({
      label: `W${index + 1}`,
      actual: index + 10,
      target: index + 12,
    }));
    const { container } = render(
      <ChartBarGraph ariaLabel="Weekly bars" data={denseData} series={series} />,
    );
    const scrollContent = container.querySelector(
      '[data-slot="chart-scroll-content"]',
    ) as HTMLElement;

    expect(scrollContent.style.minWidth).toBe("936px");
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

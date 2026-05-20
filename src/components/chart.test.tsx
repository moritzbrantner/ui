import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  ChartAreaGraph,
  ChartBarGraph,
  ChartDonutGraph,
  ChartHistogramGraph,
  ChartLineGraph,
  ChartPretext,
  ChartPretextText,
  ChartSparkline,
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

  test("renders histogram bins from raw values", () => {
    const { container } = render(
      <ChartHistogramGraph
        ariaLabel="Latency distribution"
        values={[1, 2, 2.2, 3.9, 5]}
        bins={2}
        xDomain={[1, 5]}
      />,
    );

    expect(screen.getByRole("img", { name: "Latency distribution" })).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="chart-histogram-graph-bar"]')).toHaveLength(
      2,
    );
    expect(
      container.querySelector('[data-slot="chart-histogram-graph-bar"]')?.textContent,
    ).toContain("1 - 3: 3");
  });

  test("supports pre-binned histogram data and hover inspection", () => {
    const { container } = render(
      <ChartHistogramGraph
        ariaLabel="Score distribution"
        data={[
          { min: 0, max: 10, count: 4, label: "Low" },
          { min: 10, max: 20, count: 7, label: "High", color: "var(--chart-2)" },
        ]}
        countLabel="Responses"
      />,
    );
    const hitAreas = container.querySelectorAll('[data-slot="chart-hit-area"]');

    expect(hitAreas).toHaveLength(2);
    expect(hitAreas[1]?.getAttribute("aria-label")).toBe("Score distribution High");

    fireEvent.pointerEnter(hitAreas[1] as Element);

    const tooltip = container.querySelector('[data-slot="chart-graph-tooltip"]');

    expect(tooltip).not.toBeNull();
    expect(container.querySelector('[data-slot="chart-crosshair"]')).not.toBeNull();
    expect(within(tooltip as HTMLElement).getByText("High")).toBeTruthy();
    expect(within(tooltip as HTMLElement).getByText("Responses")).toBeTruthy();
    expect(within(tooltip as HTMLElement).getByText("7")).toBeTruthy();
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

  test("renders compact sparkline trend paths", () => {
    const { container } = render(
      <ChartSparkline
        ariaLabel="Quarterly sparkline"
        data={data}
        series={{ key: "actual", label: "Actual", color: "var(--chart-3)" }}
        showPoints
      />,
    );

    expect(screen.getByRole("img", { name: "Quarterly sparkline" })).toBeTruthy();
    expect(container.querySelector('[data-slot="chart-sparkline-line"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="chart-sparkline-area"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-slot="chart-sparkline-point"]')).toHaveLength(3);
  });

  test("renders donut segments, center total, and legend values", () => {
    const { container } = render(
      <ChartDonutGraph
        ariaLabel="Channel split"
        data={[
          { channel: "Organic", value: 42 },
          { channel: "Referral", value: 28 },
        ]}
        labelKey="channel"
        centerLabel="Sessions"
      />,
    );

    expect(screen.getByRole("img", { name: "Channel split" })).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="chart-donut-graph-segment"]')).toHaveLength(
      2,
    );
    expect(
      container.querySelector('[data-slot="chart-donut-graph-segment"]')?.getAttribute("tabindex"),
    ).toBeNull();
    expect(screen.getByText("70")).toBeTruthy();
    expect(screen.getByText("Sessions")).toBeTruthy();
    expect(screen.getByText("Organic")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
  });

  test("navigates donut tree data through segments and center click", () => {
    const { container } = render(
      <ChartDonutGraph
        ariaLabel="Folder sizes"
        data={[
          {
            label: "Design",
            children: [
              { label: "Icons", value: 8 },
              { label: "Illustrations", value: 2 },
            ],
          },
          {
            label: "Code",
            children: [
              { label: "Components", value: 4 },
              { label: "Tokens", value: 6 },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Design")).toBeTruthy();
    expect(screen.getByText("Code")).toBeTruthy();
    expect(screen.getByText("20")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Folder sizes" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Design: 10. Enter folder" })).toBeTruthy();

    const [designSegment] = container.querySelectorAll(
      '[data-slot="chart-donut-graph-segment"]',
    );
    fireEvent.click(designSegment);

    expect(screen.getByText("Icons")).toBeTruthy();
    expect(screen.getByText("Illustrations")).toBeTruthy();
    expect(screen.queryByText("Code")).toBeNull();
    expect(screen.getByText("10")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Go one folder up" }));

    expect(screen.getByText("Design")).toBeTruthy();
    expect(screen.getByText("Code")).toBeTruthy();
    expect(screen.queryByText("Icons")).toBeNull();
  });

  test("shows donut empty state when values are not positive", () => {
    render(
      <ChartDonutGraph
        ariaLabel="Empty split"
        data={[{ channel: "Organic", value: 0 }]}
        labelKey="channel"
      />,
    );

    expect(screen.getByRole("img", { name: "Empty split" }).textContent).toBe(
      "No chart data.",
    );
  });
});

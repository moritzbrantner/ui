import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { MetricDelta, MetricStrip, MetricStripItem } from "./metric-strip";

describe("MetricStrip", () => {
  test("renders data-driven items with labels, values, and deltas", () => {
    render(
      <MetricStrip
        items={[
          {
            id: "pipeline",
            label: "Pipeline",
            value: "$1.2M",
            delta: "+12%",
            deltaTone: "positive",
            description: "vs last month",
          },
          { id: "risk", label: "Risk", value: "4", delta: "-2", deltaTone: "negative" },
        ]}
      />,
    );

    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Pipeline")).toBeTruthy();
    expect(screen.getByText("$1.2M")).toBeTruthy();
    expect(screen.getByText("+12%").getAttribute("data-tone")).toBe("positive");
    expect(screen.getByText("-2").getAttribute("data-tone")).toBe("negative");
  });

  test("supports slot composition", () => {
    const { container } = render(
      <MetricStrip>
        <MetricStripItem>
          <span>Custom KPI</span>
          <MetricDelta tone="warning">Review</MetricDelta>
        </MetricStripItem>
      </MetricStrip>,
    );

    expect(screen.getByText("Custom KPI")).toBeTruthy();
    expect(screen.getByText("Review").getAttribute("data-tone")).toBe("warning");
    expect(container.querySelector('[data-slot="metric-strip-item"]')).not.toBeNull();
  });
});

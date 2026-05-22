import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { FunnelChart } from "./funnel-chart";

const data = [
  { id: "visitors", label: "Visitors", value: 1000 },
  { id: "trials", label: "Trials", value: 250 },
  { id: "customers", label: "Customers", value: 100 },
];

describe("FunnelChart", () => {
  test("computes percentages from the largest segment", () => {
    const { container } = render(<FunnelChart ariaLabel="Conversion funnel" data={data} />);
    const segments = container.querySelectorAll('[data-slot="funnel-chart-segment"]');

    expect(screen.getByRole("img", { name: "Conversion funnel" })).toBeTruthy();
    expect(segments).toHaveLength(3);
    expect(segments[0]?.getAttribute("data-percent")).toBe("100");
    expect(segments[1]?.getAttribute("data-percent")).toBe("25");
    expect(segments[2]?.getAttribute("data-percent")).toBe("10");
  });

  test("uses custom value and percent formatters", () => {
    render(
      <FunnelChart
        data={data}
        formatValue={(value) => `${value} leads`}
        formatPercent={(percent) => `${percent.toFixed(1)} pct`}
      />,
    );

    expect(screen.getAllByText("250 leads / 25.0 pct").length).toBeGreaterThan(0);
  });

  test("renders an empty state when all values are zero", () => {
    render(
      <FunnelChart data={[{ id: "empty", label: "Empty", value: 0 }]} emptyMessage="No pipeline" />,
    );

    expect(screen.getByText("No pipeline")).toBeTruthy();
  });
});

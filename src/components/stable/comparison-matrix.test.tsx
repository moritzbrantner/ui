import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ComparisonMatrix } from "./comparison-matrix";

const columns = [
  { id: "starter", label: "Starter" },
  { id: "scale", label: "Scale" },
];

const rows = [
  {
    id: "support",
    label: "Support",
    values: { starter: "Email", scale: "Dedicated" },
    toneByColumn: { scale: "positive" as const },
  },
  {
    id: "sla",
    label: "SLA",
    values: { scale: "99.9%" },
    toneByColumn: { starter: "warning" as const },
  },
];

describe("ComparisonMatrix", () => {
  test("renders columns and rows", () => {
    render(<ComparisonMatrix columns={columns} rows={rows} />);

    expect(screen.getByText("Starter")).toBeTruthy();
    expect(screen.getByText("Scale")).toBeTruthy();
    expect(screen.getByText("Support")).toBeTruthy();
    expect(screen.getByText("Dedicated")).toBeTruthy();
  });

  test("renders stable empty cells and tone attributes", () => {
    const { container } = render(
      <ComparisonMatrix columns={columns} rows={rows} emptyValue="n/a" />,
    );
    const cells = container.querySelectorAll('[data-slot="comparison-matrix-cell"]');

    expect(screen.getByText("n/a")).toBeTruthy();
    expect(cells[1]?.getAttribute("data-tone")).toBe("positive");
    expect(cells[2]?.getAttribute("data-tone")).toBe("warning");
  });
});

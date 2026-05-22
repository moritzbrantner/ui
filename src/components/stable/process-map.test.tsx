import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ProcessMap } from "./process-map";

const steps = [
  { id: "plan", label: "Plan", status: "done" as const, tone: "success" as const },
  { id: "build", label: "Build", status: "active" as const, tone: "accent" as const },
  { id: "ship", label: "Ship", status: "pending" as const },
];

describe("ProcessMap", () => {
  test("renders horizontal and vertical orientations", () => {
    const { rerender, container } = render(<ProcessMap steps={steps} />);

    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      container.querySelector('[data-slot="process-map"]')?.getAttribute("data-orientation"),
    ).toBe("horizontal");

    rerender(<ProcessMap steps={steps} orientation="vertical" />);

    expect(
      container.querySelector('[data-slot="process-map"]')?.getAttribute("data-orientation"),
    ).toBe("vertical");
  });

  test("applies status and tone data attributes and decorative connectors", () => {
    const { container } = render(<ProcessMap steps={steps} />);
    const firstStep = container.querySelector('[data-slot="process-map-step"]');
    const connector = container.querySelector('[data-slot="process-map-connector"]');

    expect(firstStep?.getAttribute("data-status")).toBe("done");
    expect(firstStep?.getAttribute("data-tone")).toBe("success");
    expect(connector?.getAttribute("aria-hidden")).toBe("true");
  });
});

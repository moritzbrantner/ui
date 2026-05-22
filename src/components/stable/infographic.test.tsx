import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Infographic,
  InfographicBody,
  InfographicMetric,
  InfographicMetricGrid,
  InfographicSource,
  InfographicTitle,
} from "./infographic";

describe("Infographic", () => {
  test("renders figure structure, body, and source text", () => {
    const { container } = render(
      <Infographic ariaLabel="Release summary" caption="Source: release report">
        <InfographicTitle>Release summary</InfographicTitle>
        <InfographicBody>
          <InfographicMetricGrid>
            <InfographicMetric label="Adoption" value="72%" description="Pilot teams" />
          </InfographicMetricGrid>
        </InfographicBody>
      </Infographic>,
    );

    expect(screen.getByLabelText("Release summary")).toBeTruthy();
    expect(screen.getByText("Adoption")).toBeTruthy();
    expect(screen.getByText("Source: release report")).toBeTruthy();
    expect(container.querySelector('[data-slot="infographic-body"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="infographic-source"]')).not.toBeNull();
  });

  test("forwards class names and supports explicit source composition", () => {
    const { container } = render(
      <Infographic className="custom-info">
        <InfographicSource>Finance model v3</InfographicSource>
      </Infographic>,
    );

    expect(container.querySelector('[data-slot="infographic"]')?.className).toContain(
      "custom-info",
    );
    expect(screen.getByText("Finance model v3")).toBeTruthy();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Checkbox,
  Field,
  FieldGrid,
  FieldLabel,
  FieldLegend,
  Fieldset,
  ValidationSummary,
} from "../../index";

describe("form layout", () => {
  test("renders semantic fieldset and legend", () => {
    render(
      <Fieldset>
        <FieldLegend>Settings</FieldLegend>
      </Fieldset>,
    );

    expect(screen.getByRole("group", { name: "Settings" })).toBeTruthy();
  });

  test("validation summary only renders when content exists", () => {
    const { rerender } = render(<ValidationSummary errors={[]} />);

    expect(screen.queryByRole("alert")).toBeNull();

    rerender(<ValidationSummary errors={["Name is required"]} />);

    expect(screen.getByRole("alert").textContent).toContain("Name is required");
  });

  test("field grid exposes column data attributes", () => {
    render(<FieldGrid columns="three" data-testid="grid" />);

    expect(screen.getByTestId("grid").getAttribute("data-columns")).toBe("three");
  });

  test("field labels target Radix checked descendant state", () => {
    render(
      <FieldLabel data-testid="checked-field-label">
        <Field>
          <Checkbox defaultChecked aria-label="Enable preview" />
        </Field>
      </FieldLabel>,
    );

    const fieldLabel = screen.getByTestId("checked-field-label");

    expect(fieldLabel.className).toContain("has-[[data-state=checked]]:border-primary/30");
    expect(fieldLabel.className).toContain("has-[[data-state=checked]]:bg-primary/5");
    expect(fieldLabel.className).not.toContain(`has-data-${"checked"}`);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { NumericInput, PropertyRow, PropertySection } from "../../index";

describe("Property presentation", () => {
  test("associates a visible label, description and validation with an app-owned control", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <PropertyRow
        label="Width"
        htmlFor="width"
        description="Document units"
        descriptionId="width-help"
        validationMessage="Check the selected object"
        validationId="width-error"
      >
        <NumericInput
          id="width"
          aria-describedby="width-help width-error"
          aria-invalid
          value={12.3456}
          onValueChange={onValueChange}
          unit="px"
        />
      </PropertyRow>,
    );
    const input = screen.getByRole("spinbutton", { name: "Width" });
    expect(screen.getByLabelText("Width")).toBe(input);
    await user.click(screen.getByText("Width"));
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-describedby")).toBe("width-help width-error");
    expect(screen.getByRole("alert").id).toBe("width-error");
    expect(input.getAttribute("aria-valuenow")).toBe("12.3456");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("uses existing disclosure behavior for keyboard-completable controlled sections", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [open, setOpen] = React.useState(false);
      return (
        <PropertySection title="Transform" collapsible open={open} onOpenChange={setOpen}>
          <NumericInput aria-label="Offset" defaultValue={0} />
        </PropertySection>
      );
    }
    render(<Demo />);
    const trigger = screen.getByRole("button", { name: "Transform" });
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard(" ");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const contentId = trigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    expect(
      screen
        .getByRole("spinbutton", { name: "Offset" })
        .closest('[data-slot="collapsible-content"]')?.id,
    ).toBe(contentId);
    await user.keyboard(" ");
    expect(screen.queryByRole("spinbutton", { name: "Offset" })).toBeNull();
  });

  test("keeps controlled disclosure authority with the consuming app", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <PropertySection title="Locked section" collapsible open={false} onOpenChange={onOpenChange}>
        Contents
      </PropertySection>,
    );
    await user.click(screen.getByRole("button", { name: "Locked section" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Contents")).toBeNull();
  });

  test("supports ordinary always-open property groups without adding disclosure controls", () => {
    render(
      <PropertySection title="Geometry">
        <PropertyRow label="Position">
          <NumericInput aria-label="Position X" defaultValue={1} />
        </PropertyRow>
      </PropertySection>,
    );
    expect(screen.getByRole("heading", { name: "Geometry" })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("spinbutton", { name: "Position X" })).toHaveProperty("value", "1");
  });
});

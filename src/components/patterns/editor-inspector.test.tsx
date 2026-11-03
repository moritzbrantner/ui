import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  Button,
  EditorInspector,
  EditorInspectorContent,
  EditorInspectorFooter,
  EditorInspectorHeader,
  NumericInput,
  PropertyRow,
  PropertySection,
} from "../../index";

describe("EditorInspector", () => {
  test("labels the surface from its header and composes property sections", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onValueChange = vi.fn();
    render(
      <EditorInspector>
        <EditorInspectorHeader
          title="Rectangle"
          description="1 layer selected"
          actions={<Button size="sm">Duplicate</Button>}
        />
        <EditorInspectorContent>
          <PropertySection
            title="Transform"
            collapsible
            actions={
              <Button size="icon-sm" aria-label="Reset transform" onClick={onReset}>
                R
              </Button>
            }
          >
            <PropertyRow label="Width" htmlFor="inspector-width">
              <NumericInput id="inspector-width" value={120} onValueChange={onValueChange} />
            </PropertyRow>
          </PropertySection>
        </EditorInspectorContent>
        <EditorInspectorFooter>
          <Button size="sm">Apply</Button>
        </EditorInspectorFooter>
      </EditorInspector>,
    );

    const inspector = screen.getByRole("region", { name: "Rectangle" });
    expect(inspector.getAttribute("data-slot")).toBe("editor-inspector");
    expect(screen.getByText("1 layer selected").getAttribute("data-slot")).toBe(
      "editor-inspector-description",
    );
    expect(document.querySelector('[data-slot="editor-inspector-content"]')?.className).toContain(
      "@container/field-group",
    );
    expect(document.querySelector('[data-slot="editor-inspector-footer"]')).toBeTruthy();

    // Collapsible sections keep heading navigation.
    const heading = screen.getByRole("heading", { name: "Transform" });
    const trigger = screen.getByRole("button", { name: "Transform" });
    expect(heading.contains(trigger)).toBe(true);
    await user.click(screen.getByRole("button", { name: "Reset transform" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("spinbutton", { name: "Width" })).toBeNull();
  });

  test("uses an explicit label without a header", () => {
    render(
      <EditorInspector label="Selection properties">
        <EditorInspectorContent>
          <PropertySection title="Geometry" actions={<span>Locked</span>}>
            Values
          </PropertySection>
        </EditorInspectorContent>
      </EditorInspector>,
    );
    expect(screen.getByRole("region", { name: "Selection properties" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Geometry" })).toBeTruthy();
    expect(screen.getByText("Locked").parentElement?.getAttribute("data-slot")).toBe(
      "property-section-actions",
    );
  });
});

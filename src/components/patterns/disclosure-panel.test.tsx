import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import { CollapsibleSection, DisclosurePanel } from "./disclosure-panel";

describe("disclosure panel", () => {
  test("renders title, count, actions, and default-open content", () => {
    const onAction = vi.fn();

    render(
      <DisclosurePanel
        title="Filters"
        count={3}
        defaultOpen
        data-testid="panel"
        actions={
          <Button type="button" variant="ghost" size="sm" onClick={onAction}>
            Reset
          </Button>
        }
      >
        Active filter summary
      </DisclosurePanel>,
    );

    expect(screen.getByTestId("panel").getAttribute("data-slot")).toBe("disclosure-panel");
    expect(screen.getByText("Filters")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Active filter summary")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Active filter summary")).toBeTruthy();
  });

  test("toggles uncontrolled content from the trigger", () => {
    render(<DisclosurePanel title="Details">Deferred details</DisclosurePanel>);

    const trigger = screen.getByRole("button", { name: "Details" });
    const content = document.querySelector('[data-slot="disclosure-panel-content"]');

    expect(trigger.getAttribute("data-state")).toBe("closed");
    expect(content?.getAttribute("data-state")).toBe("closed");
    expect(content?.className).toContain("data-[state=open]:animate-accordion-down");
    expect(content?.className).not.toContain("data-open");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(content?.getAttribute("data-state")).toBe("open");
  });

  test("exposes the collapsible section alias", () => {
    render(
      <CollapsibleSection title="Comments" count={0}>
        No comments yet
      </CollapsibleSection>,
    );

    expect(screen.getByRole("button", { name: "Comments 0" })).toBeTruthy();
  });
});

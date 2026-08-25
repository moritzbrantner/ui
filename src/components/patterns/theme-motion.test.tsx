import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  FlowButton,
  KineticAccordion,
  MotionButton,
  MotionTabs,
  MotionTabsContent,
  MotionTabsList,
  MotionTabsTrigger,
  MotionToast,
  UiMotionProvider,
  uiMotionRecipes,
} from "./theme-motion";

describe("theme motion", () => {
  test("keeps Pop and Pulse recipes explicit and distinct", () => {
    expect(uiMotionRecipes.pop.button.hover).toEqual({ y: -2, scale: 1.028 });
    expect(uiMotionRecipes.pulse.button.tap).toEqual({ scale: 0.94 });
    expect(uiMotionRecipes.pop.toast.initial).not.toEqual(uiMotionRecipes.pulse.toast.initial);
  });

  test("inherits the selected motion profile without changing the stable Button contract", () => {
    render(
      <UiMotionProvider profile="pulse" reducedMotion="always">
        <MotionButton>Run interaction</MotionButton>
      </UiMotionProvider>,
    );

    const button = screen.getByRole("button", { name: "Run interaction" });

    expect(button.getAttribute("data-slot")).toBe("motion-button");
    expect(button.getAttribute("data-motion-profile")).toBe("pulse");
  });

  test("keeps FlowButton explicitly Pulse-owned while preserving Button variants", () => {
    render(
      <UiMotionProvider profile="pop" reducedMotion="always">
        <FlowButton variant="outline">Follow pointer</FlowButton>
      </UiMotionProvider>,
    );

    const button = screen.getByRole("button", { name: "Follow pointer" });

    expect(button.getAttribute("data-slot")).toBe("flow-button");
    expect(button.getAttribute("data-motion-profile")).toBe("pulse");
    expect(document.querySelector('[data-slot="flow-button-highlight"]')).toBeTruthy();
  });

  test("moves the shared indicator with controlled Radix tab state", () => {
    render(
      <UiMotionProvider profile="pop">
        <MotionTabs defaultValue="motion">
          <MotionTabsList>
            <MotionTabsTrigger value="motion">Motion</MotionTabsTrigger>
            <MotionTabsTrigger value="tokens">Tokens</MotionTabsTrigger>
          </MotionTabsList>
          <MotionTabsContent value="motion">Motion content</MotionTabsContent>
          <MotionTabsContent value="tokens">Token content</MotionTabsContent>
        </MotionTabs>
      </UiMotionProvider>,
    );

    const tokensTab = screen.getByRole("tab", { name: "Tokens" });

    fireEvent.mouseDown(tokensTab, { button: 0, ctrlKey: false });

    expect(tokensTab.getAttribute("data-state")).toBe("active");
    expect(screen.getByText("Token content")).toBeTruthy();
    expect(document.querySelectorAll('[data-slot="motion-tabs-indicator"]')).toHaveLength(1);
  });

  test("expands kinetic content while leaving ownership of open state optional", () => {
    const onOpenChange = vi.fn();

    render(
      <UiMotionProvider profile="pulse" reducedMotion="always">
        <KineticAccordion
          title="Advanced motion"
          description="Continuous expansion"
          onOpenChange={onOpenChange}
        >
          Kinetic content
        </KineticAccordion>
      </UiMotionProvider>,
    );

    const trigger = screen.getByRole("button", { name: /Advanced motion/ });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();

    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: /Advanced motion/ }).textContent).toContain(
      "Kinetic content",
    );
  });

  test("renders and closes a state-controlled accessible motion toast", () => {
    const onOpenChange = vi.fn();

    render(
      <UiMotionProvider profile="pulse" reducedMotion="always">
        <MotionToast
          open
          onOpenChange={onOpenChange}
          title="Interaction flow ready"
          description="Motion is local to the component."
        />
      </UiMotionProvider>,
    );

    expect(screen.getByRole("status").getAttribute("data-motion-profile")).toBe("pulse");
    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import { HoverPreview } from "./hover-preview";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("HoverPreview", () => {
  test("opens preview content on hover", async () => {
    render(
      <HoverPreview trigger={<Button>Preview user</Button>} title="Mira Brandt" openDelay={0}>
        Product lead
      </HoverPreview>,
    );

    fireEvent.pointerEnter(screen.getByRole("button", { name: "Preview user" }));

    expect(await screen.findByText("Mira Brandt")).toBeTruthy();
    expect(screen.getByText("Product lead")).toBeTruthy();
  });

  test("opens preview content on focus and renders all slots", async () => {
    render(
      <HoverPreview
        trigger={<Button>Preview status</Button>}
        title="Ready"
        description="All checks passed."
        media={<div>Media slot</div>}
        meta="Updated now"
        contentProps={{ className: "preview-contract", "data-testid": "preview-content" }}
      >
        Additional details
      </HoverPreview>,
    );

    fireEvent.focus(screen.getByRole("button", { name: "Preview status" }));

    const content = await screen.findByTestId("preview-content");

    expect(content.className).toContain("preview-contract");
    expect(content.getAttribute("data-slot")).toBe("hover-preview-content");
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("All checks passed.")).toBeTruthy();
    expect(screen.getByText("Media slot")).toBeTruthy();
    expect(screen.getByText("Updated now")).toBeTruthy();
    expect(screen.getByText("Additional details")).toBeTruthy();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { VisuallyHidden } from "./visually-hidden";

describe("Visually Hidden", () => {
  test("keeps accessible content in the DOM while applying screen-reader-only styling", () => {
    render(
      <VisuallyHidden className="custom-hidden" aria-live="polite">
        Screen reader label
      </VisuallyHidden>,
    );

    const element = screen.getByText("Screen reader label");
    expect(element.tagName).toBe("SPAN");
    expect(element.className.split(/\s+/)).toEqual(
      expect.arrayContaining(["sr-only", "custom-hidden"]),
    );
    expect(element.getAttribute("aria-live")).toBe("polite");
    expect(element.getAttribute("data-slot")).toBe("visually-hidden");
  });
});

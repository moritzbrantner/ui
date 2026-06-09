import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Button, CelebrationCallout } from "../../index";

describe("celebration callout", () => {
  test("renders title, description, icon, and actions", () => {
    render(
      <CelebrationCallout
        title="Workspace unlocked"
        description="Invite the team and finish setup."
        icon={<span data-testid="icon">Icon</span>}
        action={<Button>Invite team</Button>}
        secondaryAction={<Button variant="ghost">Later</Button>}
      />,
    );

    expect(screen.getByText("Workspace unlocked")).toBeTruthy();
    expect(screen.getByText("Invite the team and finish setup.")).toBeTruthy();
    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Invite team" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Later" })).toBeTruthy();
  });

  test("applies tone, completion state, class names, and forwarded props", () => {
    render(
      <CelebrationCallout
        title="Launch complete"
        tone="success"
        progress={100}
        className="custom-callout"
        data-testid="callout"
      />,
    );

    const callout = screen.getByTestId("callout");

    expect(callout.getAttribute("data-tone")).toBe("success");
    expect(callout.getAttribute("data-complete")).toBe("true");
    expect(callout.className).toContain("custom-callout");
  });

  test("clamps progress to the supported range", () => {
    const { rerender } = render(<CelebrationCallout title="Too low" progress={-25} />);

    expect(document.querySelector('[data-slot="celebration-callout-progress"]')?.textContent).toBe(
      "0%",
    );

    rerender(<CelebrationCallout title="Too high" progress={140} />);

    expect(document.querySelector('[data-slot="celebration-callout-progress"]')?.textContent).toBe(
      "100%",
    );
  });
});

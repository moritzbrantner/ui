import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Presence, PresenceAvatar, PresenceGroup } from "./presence";
import { TypingIndicator } from "./typing-indicator";

describe("collaboration presence", () => {
  test.each(["online", "away", "busy", "offline"] as const)(
    "renders the %s state with accessible text",
    (status) => {
      render(
        <Presence data-testid="presence" status={status} statusLabel={`${status} now`}>
          <PresenceAvatar name="Ada Lovelace" status={status} statusLabel={`${status} now`} />
        </Presence>,
      );

      expect(screen.getByTestId("presence").getAttribute("data-status")).toBe(status);
      expect(screen.getByText(`${status} now`)).toBeTruthy();
      expect(screen.getByRole("img", { name: `${status} now` })).toBeTruthy();
    },
  );

  test("forwards DOM props and exposes accessible overflow", () => {
    render(
      <PresenceGroup
        aria-label="Active collaborators"
        data-testid="group"
        participants={[
          { id: "ada", name: "Ada", status: "online", statusLabel: "Ada online" },
          { id: "grace", name: "Grace", status: "away", statusLabel: "Grace away" },
          { id: "linus", name: "Linus", status: "busy", statusLabel: "Linus busy" },
        ]}
        maxVisible={2}
        overflowLabel={(count) => `${count} more collaborators`}
      />,
    );

    const group = screen.getByTestId("group");
    expect(group.getAttribute("aria-label")).toBe("Active collaborators");
    expect(within(group).getByLabelText("1 more collaborators")).toBeTruthy();
  });
});

describe("typing indicator", () => {
  test("keeps assistive text stable while dots stay decorative", () => {
    render(<TypingIndicator label="Ada and Grace are typing" />);

    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Ada and Grace are typing");
    expect(
      status.querySelector('[data-slot="typing-indicator-dots"]')?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  test("renders nothing when no app-provided typing content exists", () => {
    const { container } = render(<TypingIndicator />);
    expect(container.firstChild).toBeNull();
  });
});

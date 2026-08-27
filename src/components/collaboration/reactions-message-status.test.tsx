import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { MessageStatus, ReadReceiptGroup, ReadReceiptParticipant } from "./message-status";
import { ReactionButton, ReactionGroup, ReactionPicker } from "./reactions";

describe("reaction controls", () => {
  test("exposes controlled toggle state and arbitrary reaction content", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ReactionGroup aria-label="Message reactions">
        <ReactionButton
          active
          reaction="👏"
          label="Applaud, 3 reactions"
          count="3"
          onClick={onClick}
        />
        <ReactionButton active={false} reaction={<span>Custom</span>} label="Custom reaction" />
      </ReactionGroup>,
    );

    const active = screen.getByRole("button", { name: "Applaud, 3 reactions" });
    expect(active.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Custom reaction" }).getAttribute("aria-pressed"),
    ).toBe("false");
    await user.click(active);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("lets the app provide and receive picker options", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ReactionPicker
        label="Add reaction"
        trigger="+"
        options={[
          { key: "heart", label: "Heart", reaction: "❤️" },
          { key: "blocked", label: "Blocked", reaction: "⛔", disabled: true },
        ]}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add reaction" }));
    await user.click(screen.getByRole("option", { name: "Heart" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: "heart" }));
  });
});

describe("message status and receipts", () => {
  test.each(["sending", "sent", "delivered", "read", "failed"] as const)(
    "renders textual status for %s",
    (state) => {
      render(<MessageStatus state={state} label={`${state} label`} />);
      expect(screen.getByText(`${state} label`)).toBeTruthy();
      expect(
        screen
          .getByText(`${state} label`)
          .closest('[data-slot="message-status"]')
          ?.getAttribute("data-state"),
      ).toBe(state);
    },
  );

  test("keeps receipt overflow accessible", () => {
    render(
      <ReadReceiptGroup maxVisible={2} overflowLabel={(count) => `${count} more readers`}>
        <ReadReceiptParticipant label="Read by Ada" name="Ada" />
        <ReadReceiptParticipant label="Read by Grace" name="Grace" />
        <ReadReceiptParticipant label="Read by Linus" name="Linus" />
      </ReadReceiptGroup>,
    );

    expect(screen.getByLabelText("Read by Ada")).toBeTruthy();
    expect(screen.getByLabelText("1 more readers")).toBeTruthy();
  });

  test("supports a text-only message status", () => {
    render(<MessageStatus state="delivered" label="Delivered" icon={null} />);
    const status = screen.getByText("Delivered").closest('[data-slot="message-status"]');
    expect(status?.querySelector('[data-slot="message-status-icon"]')).toBeNull();
  });
});

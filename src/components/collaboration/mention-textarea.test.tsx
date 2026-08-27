import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { MentionTextarea, getActiveMention, insertMention } from "./mention-textarea";

const candidates = [
  { id: "ada", label: "Ada", secondaryText: "Engineering" },
  { id: "grace", label: "Grace" },
];

function MentionHarness({ onSelect = () => undefined }: { onSelect?: (label: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <>
      <MentionTextarea
        aria-label="Comment"
        value={value}
        candidates={candidates}
        onValueChange={setValue}
        onMentionSelect={(candidate) => onSelect(candidate.label)}
        suggestionsLabel="Mention suggestions"
        emptyContent="No matches"
      />
      <output>{value}</output>
    </>
  );
}

describe("mention range helpers", () => {
  test("detects the mention active at the caret across multiple mentions", () => {
    const value = "Thanks @Ada, please ask @Gra";
    expect(getActiveMention(value, value.length)).toEqual({ start: 24, end: 28, query: "Gra" });
    expect(getActiveMention("email@example.com", 17)).toBeNull();
  });

  test("inserts plain text without owning identity persistence", () => {
    const result = insertMention("Hello @Ad there", { start: 6, end: 9, query: "Ad" }, "Ada");
    expect(result).toEqual({ value: "Hello @Ada there", caret: 10 });
  });
});

describe("MentionTextarea", () => {
  test("supports keyboard selection and reports the selected candidate", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MentionHarness onSelect={onSelect} />);

    const textarea = screen.getByRole("textbox", { name: "Comment" });
    await user.type(textarea, "Hello @G");
    expect(textarea.getAttribute("aria-controls")).toBeTruthy();
    await user.keyboard("{ArrowDown}{Enter}");

    expect((textarea as HTMLTextAreaElement).value).toBe("Hello @Grace ");
    expect(onSelect).toHaveBeenCalledWith("Grace");
  });

  test("escape cancels suggestions without changing text", async () => {
    const user = userEvent.setup();
    render(<MentionHarness />);

    const textarea = screen.getByRole("textbox", { name: "Comment" });
    await user.type(textarea, "@A");
    await user.keyboard("{Escape}");
    expect(textarea.getAttribute("aria-controls")).toBeNull();
    expect((textarea as HTMLTextAreaElement).value).toBe("@A");
  });

  test("supports pointer selection", async () => {
    const user = userEvent.setup();
    render(<MentionHarness />);

    const textarea = screen.getByRole("textbox", { name: "Comment" });
    await user.type(textarea, "@A");
    await user.click(screen.getByRole("option", { name: /Ada/ }));
    expect((textarea as HTMLTextAreaElement).value).toBe("@Ada ");
  });
});

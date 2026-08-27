import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test } from "vitest";

import { CollaboratorPicker } from "./collaborator-picker";

const participants = [
  { id: "ada", name: "Ada Lovelace", secondaryText: "Engineering", presenceLabel: "Online" },
  { id: "grace", name: "Grace Hopper", secondaryText: "Research" },
  { id: "blocked", name: "Disabled Person", disabled: true },
] as const;

function PickerHarness() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  return (
    <CollaboratorPicker
      participants={participants}
      selectedIds={selectedIds}
      onSelectedIdsChange={setSelectedIds}
      multiple
      inputLabel="Find collaborators"
      getRemoveLabel={(participant) => `Remove ${participant.name}`}
      placeholder="Search people"
      emptyContent="No people"
    />
  );
}

describe("CollaboratorPicker", () => {
  test("searches, selects, and removes participants with the keyboard", async () => {
    const user = userEvent.setup();
    render(<PickerHarness />);

    const input = screen.getByRole("combobox", { name: "Find collaborators" });
    await user.click(input);
    await user.type(input, "Ada");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Remove Ada Lovelace" }));
    expect(screen.queryByRole("button", { name: "Remove Ada Lovelace" })).toBeNull();
  });

  test("keeps disabled options unavailable and forwards root props", async () => {
    const user = userEvent.setup();
    render(
      <div data-testid="wrapper">
        <CollaboratorPicker
          data-testid="picker"
          participants={participants}
          selectedId={null}
          onSelectedIdChange={() => undefined}
          inputLabel="Pick one"
          getRemoveLabel={(participant) => `Remove ${participant.name}`}
        />
      </div>,
    );

    await user.click(screen.getByRole("combobox", { name: "Pick one" }));
    expect(
      (await screen.findByRole("option", { name: /Disabled Person/ })).hasAttribute(
        "data-disabled",
      ),
    ).toBe(true);
    expect(screen.getByTestId("picker")).toBeTruthy();
  });

  test("keeps loading distinct from no results", async () => {
    const user = userEvent.setup();
    render(
      <CollaboratorPicker
        participants={[]}
        selectedId={null}
        onSelectedIdChange={() => undefined}
        inputLabel="Pick one"
        getRemoveLabel={(participant) => `Remove ${participant.name}`}
        loading
        loadingContent="Loading collaborators"
        emptyContent="No collaborators"
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Pick one" }));
    expect(await screen.findByText("Loading collaborators")).toBeTruthy();
    expect(screen.queryByText("No collaborators")).toBeNull();
  });
});

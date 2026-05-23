import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { TagInput } from "../../index";

describe("TagInput", () => {
  test("adds tags from keyboard input and removes them", () => {
    const onValueChange = vi.fn();

    render(<TagInput defaultValue={["design"]} onValueChange={onValueChange} />);

    const input = screen.getByLabelText("Tag");
    fireEvent.change(input, { target: { value: "release" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("release")).toBeTruthy();
    expect(onValueChange).toHaveBeenLastCalledWith(["design", "release"]);

    fireEvent.click(screen.getByRole("button", { name: "Remove design" }));

    expect(screen.queryByText("design")).toBeNull();
    expect(onValueChange).toHaveBeenLastCalledWith(["release"]);
  });

  test("supports controlled values", () => {
    const onValueChange = vi.fn();

    render(<TagInput value={["alpha"]} onValueChange={onValueChange} />);

    const input = screen.getByLabelText("Tag");
    fireEvent.change(input, { target: { value: "beta" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.queryByText("beta")).toBeNull();
    expect(onValueChange).toHaveBeenCalledWith(["alpha", "beta"]);
  });

  test("splits pasted comma and newline separated values", () => {
    render(<TagInput />);

    const input = screen.getByLabelText("Tag");
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "alpha, beta\ngamma",
      },
    });

    expect(screen.getByText("alpha")).toBeTruthy();
    expect(screen.getByText("beta")).toBeTruthy();
    expect(screen.getByText("gamma")).toBeTruthy();
  });

  test("renders hidden form inputs and respects duplicate and max tag constraints", () => {
    render(<TagInput name="tags" defaultValue={["alpha"]} maxTags={2} />);

    const input = screen.getByLabelText("Tag");
    fireEvent.change(input, { target: { value: "alpha" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "beta" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getAllByDisplayValue("alpha")).toHaveLength(1);
    expect(screen.getByDisplayValue("beta")).toBeTruthy();
    expect(input.hasAttribute("disabled")).toBe(true);
  });

  test("does not add or remove tags when disabled", () => {
    const onValueChange = vi.fn();

    render(<TagInput disabled defaultValue={["locked"]} onValueChange={onValueChange} />);

    const input = screen.getByLabelText("Tag");
    fireEvent.change(input, { target: { value: "new" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove locked" }));

    expect(screen.getByText("locked")).toBeTruthy();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

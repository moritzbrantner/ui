import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { FilterBar } from "./filter-bar";

const filters = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design", disabled: true },
];

describe("FilterBar", () => {
  test("renders search value and calls onSearchChange", () => {
    const onSearchChange = vi.fn();

    render(
      <FilterBar
        searchValue="release"
        onSearchChange={onSearchChange}
        searchPlaceholder="Search packages"
      />,
    );

    const input = screen.getByPlaceholderText("Search packages") as HTMLInputElement;
    expect(input.value).toBe("release");

    fireEvent.change(input, { target: { value: "tokens" } });
    expect(onSearchChange).toHaveBeenCalledWith("tokens");
  });

  test("renders active filter chips with labels and values", () => {
    render(<FilterBar filters={filters} onClearFilter={() => undefined} />);

    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("Owner")).toBeTruthy();
    expect(screen.getByText("Design")).toBeTruthy();
  });

  test("clears one filter by id", () => {
    const onClearFilter = vi.fn();

    render(<FilterBar filters={filters} onClearFilter={onClearFilter} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear status filter" }));

    expect(onClearFilter).toHaveBeenCalledWith("status");
  });

  test("calls clear all when filters are present", () => {
    const onClearAll = vi.fn();

    render(<FilterBar filters={filters} onClearAll={onClearAll} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  test("does not clear disabled filters", () => {
    const onClearFilter = vi.fn();

    render(<FilterBar filters={filters} onClearFilter={onClearFilter} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear owner filter" }));

    expect(onClearFilter).not.toHaveBeenCalled();
  });
});

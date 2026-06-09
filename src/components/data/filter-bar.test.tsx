import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  BooleanFilterControl,
  DateRangeFilterControl,
  EnumFilterControl,
  FilterBar,
  NumberFilterControl,
  type NumberFilterValue,
  TagFilterControl,
  TextFilterControl,
  isEmptyFilterValue,
} from "./filter-bar";

const filters = [
  { id: "status", label: "Status", value: "Ready" },
  { id: "owner", label: "Owner", value: "Design", disabled: true },
];

describe("FilterBar", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

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

  test("text filter emits contains values", () => {
    const onValueChange = vi.fn();

    render(<TextFilterControl presentation="inline" label="Name" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Filter Name" }), {
      target: { value: "release" },
    });

    expect(onValueChange).toHaveBeenCalledWith({ kind: "text", value: "release" });
  });

  test("text filter supports option checklist values", () => {
    const onValueChange = vi.fn();

    render(
      <TextFilterControl
        presentation="inline"
        label="Status"
        value={{ kind: "text" }}
        options={[{ label: "paid", value: "paid", count: 2 }]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Filter Status by paid" }));

    expect(onValueChange).toHaveBeenCalledWith({ kind: "text", values: ["paid"] });
  });

  test("number filter emits ranges and clears empty ranges", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberFilterControl presentation="inline" label="Amount" onValueChange={onValueChange} />,
    );

    fireEvent.change(screen.getByLabelText("Minimum Amount"), { target: { value: "30" } });
    expect(onValueChange).toHaveBeenCalledWith({ kind: "number", min: "30" });

    rerender(
      <NumberFilterControl
        presentation="inline"
        label="Amount"
        value={{ kind: "number", max: "80" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Maximum Amount"), { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  test("date range filter emits ranges and clears empty ranges", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DateRangeFilterControl
        presentation="inline"
        label="Created"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("From Created"), {
      target: { value: "2026-06-01" },
    });
    expect(onValueChange).toHaveBeenCalledWith({ kind: "date", from: "2026-06-01" });

    rerender(
      <DateRangeFilterControl
        presentation="inline"
        label="Created"
        value={{ kind: "date", to: "2026-06-30" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("To Created"), { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  test("boolean filter emits true, false, and clear states", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <BooleanFilterControl
        presentation="inline"
        label="Published"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Filter Published" }));
    fireEvent.click(await screen.findByRole("option", { name: "True" }));
    expect(onValueChange).toHaveBeenCalledWith({ kind: "boolean", value: "true" });

    rerender(
      <BooleanFilterControl
        presentation="inline"
        label="Published"
        value={{ kind: "boolean", value: "false" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear filter" }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  test("boolean filter renders a select with the active value", () => {
    render(
      <BooleanFilterControl
        presentation="inline"
        label="Published"
        value={{ kind: "boolean", value: "true" }}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Filter Published" }).textContent).toContain(
      "True",
    );
  });

  test("enum filter toggles multiple values", () => {
    const onValueChange = vi.fn();

    render(
      <EnumFilterControl
        presentation="inline"
        label="Status"
        value={{ kind: "enum", values: ["paid"] }}
        options={[
          { label: "paid", value: "paid" },
          { label: "pending", value: "pending" },
        ]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Filter Status by pending" }));
    expect(onValueChange).toHaveBeenCalledWith({ kind: "enum", values: ["paid", "pending"] });
  });

  test("tag filter adds and removes tags", () => {
    const onValueChange = vi.fn();

    render(
      <TagFilterControl
        presentation="inline"
        label="Labels"
        value={{ kind: "tags", values: ["design"] }}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Labels tag"), { target: { value: "release" } });
    fireEvent.keyDown(screen.getByLabelText("Labels tag"), { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith({
      kind: "tags",
      values: ["design", "release"],
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove design" }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  test("trigger clear button clears without opening the popover", () => {
    function ControlledFilter() {
      const [value, setValue] = React.useState<NumberFilterValue | undefined>({
        kind: "number",
        min: "30",
      });

      return <NumberFilterControl label="Amount" value={value} onValueChange={setValue} />;
    }

    render(<ControlledFilter />);
    fireEvent.click(screen.getByRole("button", { name: "Clear Amount filter" }));

    expect(screen.queryByLabelText("Minimum Amount")).toBeNull();
    expect(screen.getByRole("button", { name: "Filter Amount" })).toBeTruthy();
  });

  test("disabled typed filters do not emit changes", () => {
    const onValueChange = vi.fn();

    render(
      <TextFilterControl
        presentation="inline"
        label="Name"
        disabled
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Filter Name" }), {
      target: { value: "release" },
    });

    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("detects empty filter values", () => {
    expect(isEmptyFilterValue(undefined)).toBe(true);
    expect(isEmptyFilterValue("")).toBe(true);
    expect(isEmptyFilterValue({ kind: "text", value: "" })).toBe(true);
    expect(isEmptyFilterValue({ kind: "number", min: "" })).toBe(true);
    expect(isEmptyFilterValue({ kind: "date", to: "" })).toBe(true);
    expect(isEmptyFilterValue({ kind: "boolean" })).toBe(true);
    expect(isEmptyFilterValue({ kind: "enum", values: [] })).toBe(true);
    expect(isEmptyFilterValue({ kind: "tags", values: [] })).toBe(true);
    expect(isEmptyFilterValue({ kind: "number", min: "1" })).toBe(false);
  });
});

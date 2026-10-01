import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { NumericInput } from "../../index";

describe("NumericInput", () => {
  test("edits exact values without committing display rounding, including form submission", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <form aria-label="Properties">
        <NumericInput
          aria-label="Width"
          name="width"
          defaultValue={1.23456789}
          displayPrecision={2}
          unit="px"
          onValueChange={onValueChange}
        />
      </form>,
    );
    const input = screen.getByRole("spinbutton", { name: "Width" });
    expect(input).toHaveProperty("value", "1.23");
    expect(input.getAttribute("aria-valuenow")).toBe("1.23456789");
    const form = screen.getByRole("form", { name: "Properties" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected the property form.");
    expect(new FormData(form).get("width")).toBe("1.23456789");
    await user.click(input);
    expect(input).toHaveProperty("value", "1.23456789");
    await user.tab();
    expect(input).toHaveProperty("value", "1.23");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(input);
    await user.clear(input);
    await user.type(input, "2.3456789");
    await user.tab();
    expect(input).toHaveProperty("value", "2.35");
    expect(new FormData(form).get("width")).toBe("2.3456789");
  });

  test.each(["", "-", "+", ".", "1e", "Infinity", "NaN", "0x10", "1e999"])(
    "keeps %j as a draft and restores the value on blur",
    (text) => {
      const onValueChange = vi.fn();
      render(<NumericInput aria-label="Offset" defaultValue={7} onValueChange={onValueChange} />);
      const input = screen.getByRole("spinbutton", { name: "Offset" });
      fireEvent.change(input, { target: { value: text } });
      expect(input).toHaveProperty("value", text);
      expect(onValueChange).not.toHaveBeenCalled();
      fireEvent.blur(input);
      expect(input).toHaveProperty("value", "7");
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  test("commits bounded drafts explicitly and cancels them without fabricated edits", () => {
    const onValueChange = vi.fn();
    render(
      <NumericInput
        aria-label="Opacity"
        defaultValue={0.5}
        min={0}
        max={1}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Opacity" });
    fireEvent.change(input, { target: { value: "3" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveProperty("value", "0.5");
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveProperty("value", "1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    fireEvent.change(input, { target: { value: "-2" } });
    fireEvent.blur(input);
    expect(input).toHaveProperty("value", "0");
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  test("supports keyboard fine and coarse adjustments with decimal steps and bounds", async () => {
    const user = userEvent.setup();
    render(
      <NumericInput
        aria-label="Distance"
        defaultValue={0.2}
        step={0.1}
        smallStep={0.01}
        largeStep={1}
        min={0}
        max={2}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Distance" });
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveProperty("value", "0.3");
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(input).toHaveProperty("value", "0.29");
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(input).toHaveProperty("value", "1.29");
    await user.keyboard("{PageDown}");
    expect(input).toHaveProperty("value", "0.29");
    await user.keyboard("{End}");
    expect(input).toHaveProperty("value", "2");
    await user.keyboard("{Home}");
    expect(input).toHaveProperty("value", "0");
  });

  test("synchronizes controlled replacements even while editing an incomplete value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumericInput aria-label="Position" value={2} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("spinbutton", { name: "Position" });
    fireEvent.change(input, { target: { value: "-" } });
    rerender(
      <NumericInput
        aria-label="Position"
        value={8.7654}
        displayPrecision={2}
        onValueChange={onValueChange}
      />,
    );
    expect(input).toHaveProperty("value", "8.77");
    expect(input.getAttribute("aria-valuenow")).toBe("8.7654");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("uses the consuming app's accepted value and does not become a second source of truth", () => {
    const onValueChange = vi.fn();
    render(<NumericInput aria-label="Fixed value" value={10} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Fixed value" });
    fireEvent.change(input, { target: { value: "25" } });
    expect(onValueChange).toHaveBeenLastCalledWith(25);
    expect(input).toHaveProperty("value", "10");
    fireEvent.blur(input);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  test("supports controlled accepted edits and a genuinely unset value", () => {
    function Demo() {
      const [value, setValue] = React.useState<number | null>(null);
      return <NumericInput aria-label="Optional position" value={value} onValueChange={setValue} />;
    }
    render(<Demo />);
    const input = screen.getByRole("spinbutton", { name: "Optional position" });
    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuenow")).toBeNull();
    fireEvent.change(input, { target: { value: "1e-3" } });
    expect(input).toHaveProperty("value", "1e-3");
    expect(input.getAttribute("aria-valuenow")).toBe("0.001");
    fireEvent.blur(input);
    expect(input).toHaveProperty("value", "0.001");
  });

  test.each([{ disabled: true }, { readOnly: true }])("blocks edits when %j", (props) => {
    const onValueChange = vi.fn();
    render(
      <NumericInput
        {...props}
        aria-label="Locked"
        defaultValue={4}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Locked" });
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveProperty("value", "4");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

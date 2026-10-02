import { render, screen } from "@testing-library/react";
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
    async (text) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<NumericInput aria-label="Offset" defaultValue={7} onValueChange={onValueChange} />);
      const input = screen.getByRole("spinbutton", { name: "Offset" });
      await user.click(input);
      await user.clear(input);
      if (text) await user.paste(text);
      expect(input).toHaveProperty("value", text);
      expect(onValueChange).not.toHaveBeenCalled();
      await user.tab();
      expect(input).toHaveProperty("value", "7");
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  test("commits bounded drafts explicitly and cancels them without fabricated edits", async () => {
    const user = userEvent.setup();
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
    await user.click(input);
    await user.clear(input);
    await user.paste("3");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(input).toHaveProperty("value", "0.5");
    await user.click(input);
    await user.clear(input);
    await user.paste("3");
    await user.keyboard("{Enter}");
    expect(input).toHaveProperty("value", "1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
    await user.clear(input);
    await user.paste("-2");
    await user.tab();
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

  test("synchronizes controlled replacements even while editing an incomplete value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumericInput aria-label="Position" value={2} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("spinbutton", { name: "Position" });
    await user.click(input);
    await user.clear(input);
    await user.paste("-");
    rerender(
      <NumericInput
        aria-label="Position"
        value={8.7654}
        displayPrecision={2}
        onValueChange={onValueChange}
      />,
    );
    expect(input).toHaveProperty("value", "8.7654");
    expect(input.getAttribute("aria-valuenow")).toBe("8.7654");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.tab();
    expect(input).toHaveProperty("value", "8.77");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("uses the consuming app's accepted value and does not become a second source of truth", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumericInput aria-label="Fixed value" value={10} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton", { name: "Fixed value" });
    await user.click(input);
    await user.clear(input);
    await user.paste("25");
    expect(onValueChange).toHaveBeenLastCalledWith(25);
    expect(input).toHaveProperty("value", "10");
    await user.tab();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  test("supports controlled accepted edits and a genuinely unset value", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [value, setValue] = React.useState<number | null>(null);
      return <NumericInput aria-label="Optional position" value={value} onValueChange={setValue} />;
    }
    render(<Demo />);
    const input = screen.getByRole("spinbutton", { name: "Optional position" });
    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuenow")).toBeNull();
    await user.click(input);
    await user.paste("1e-3");
    expect(input).toHaveProperty("value", "1e-3");
    expect(input.getAttribute("aria-valuenow")).toBe("0.001");
    await user.tab();
    expect(input).toHaveProperty("value", "0.001");
  });

  test.each([{ disabled: true }, { readOnly: true }])("blocks edits when %j", async (props) => {
    const user = userEvent.setup();
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
    await user.click(input);
    await user.type(input, "5");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveProperty("value", "4");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

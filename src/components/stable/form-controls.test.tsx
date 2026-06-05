import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { act } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  Checkbox,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
  NativeSelect,
  NativeSelectOption,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Switch,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "../../index";

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("stable form controls", () => {
  test("forwards props and classes to text controls", () => {
    render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" className="contract-input" data-testid="name-input" />
        <Textarea aria-label="Notes" className="contract-textarea" data-testid="notes" />
        <NativeSelect aria-label="Theme" className="contract-select" defaultValue="paper">
          <NativeSelectOption value="paper">Paper</NativeSelectOption>
          <NativeSelectOption value="studio">Studio</NativeSelectOption>
        </NativeSelect>
      </div>,
    );

    expect(screen.getByLabelText("Name").getAttribute("data-slot")).toBe("input");
    expect(screen.getByTestId("name-input").className).toContain("contract-input");
    expect(screen.getByLabelText("Notes").getAttribute("data-slot")).toBe("textarea");
    expect(screen.getByTestId("notes").className).toContain("contract-textarea");
    expect(screen.getByRole("combobox", { name: "Theme" }).getAttribute("data-slot")).toBe(
      "native-select",
    );
    expect(screen.getByText("Paper").getAttribute("data-slot")).toBe("native-select-option");
  });

  test("fires controlled callbacks for choice controls", () => {
    const onCheckedChange = vi.fn();
    const onSwitchChange = vi.fn();
    const onRadioChange = vi.fn();

    render(
      <div>
        <Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />
        <Switch aria-label="Enable alerts" onCheckedChange={onSwitchChange} />
        <RadioGroup aria-label="Density" onValueChange={onRadioChange}>
          <RadioGroupItem value="compact" aria-label="Compact" />
          <RadioGroupItem value="comfortable" aria-label="Comfortable" />
        </RadioGroup>
      </div>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    fireEvent.click(screen.getByRole("switch", { name: "Enable alerts" }));
    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onSwitchChange).toHaveBeenCalledWith(true);
    expect(onRadioChange).toHaveBeenCalledWith("compact");
  });

  test("uses Radix data-state selectors for checked form-control styling", () => {
    render(
      <div>
        <Checkbox aria-label="Accept terms" />
        <Switch aria-label="Enable alerts" />
        <RadioGroup aria-label="Density">
          <RadioGroupItem value="compact" aria-label="Compact" />
          <RadioGroupItem value="comfortable" aria-label="Comfortable" />
        </RadioGroup>
      </div>,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    const switchControl = screen.getByRole("switch", { name: "Enable alerts" });
    const switchThumb = switchControl.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
    const compactRadio = screen.getByRole("radio", { name: "Compact" });
    const comfortableRadio = screen.getByRole("radio", { name: "Comfortable" });

    expect(checkbox.getAttribute("data-state")).toBe("unchecked");
    expect(switchControl.getAttribute("data-state")).toBe("unchecked");
    expect(compactRadio.getAttribute("data-state")).toBe("unchecked");

    fireEvent.click(checkbox);
    fireEvent.click(switchControl);
    fireEvent.click(compactRadio);

    expect(checkbox.getAttribute("data-state")).toBe("checked");
    expect(switchControl.getAttribute("data-state")).toBe("checked");
    expect(compactRadio.getAttribute("data-state")).toBe("checked");
    expect(comfortableRadio.getAttribute("data-state")).toBe("unchecked");

    expect(switchControl.className).toContain("data-[state=checked]:before:bg-primary");
    expect(switchControl.className).toContain("data-[state=unchecked]:before:bg-input");
    expect(switchThumb?.className).toContain(
      "group-[[data-size=default][data-state=checked]]/switch:translate-x-[30px]",
    );
    expect(checkbox.className).toContain("data-[state=checked]:before:bg-primary");
    expect(compactRadio.className).toContain("data-[state=checked]:before:bg-primary");

    const stateClassNames = [
      checkbox.className,
      switchControl.className,
      switchThumb?.className ?? "",
      compactRadio.className,
    ].join(" ");

    expect(stateClassNames).not.toContain(`data-${"checked"}`);
    expect(stateClassNames).not.toContain(`data-${"unchecked"}`);
  });

  test("does not call handlers for disabled binary controls", () => {
    const onCheckedChange = vi.fn();
    const onSwitchChange = vi.fn();

    render(
      <div>
        <Checkbox aria-label="Disabled checkbox" disabled onCheckedChange={onCheckedChange} />
        <Switch aria-label="Disabled switch" disabled onCheckedChange={onSwitchChange} />
      </div>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Disabled checkbox" }));
    fireEvent.click(screen.getByRole("switch", { name: "Disabled switch" }));

    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onSwitchChange).not.toHaveBeenCalled();
  });

  test("renders slider, toggle, and toggle group controls", () => {
    const onToggle = vi.fn();
    const onToggleGroupChange = vi.fn();

    render(
      <div>
        <Slider aria-label="Volume" defaultValue={[40]} max={100} />
        <Toggle aria-label="Bold" onPressedChange={onToggle}>
          B
        </Toggle>
        <ToggleGroup type="single" aria-label="Text alignment" onValueChange={onToggleGroupChange}>
          <ToggleGroupItem value="left" aria-label="Align left">
            Left
          </ToggleGroupItem>
        </ToggleGroup>
      </div>,
    );

    expect(screen.getByRole("slider", { name: "Volume handle" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    fireEvent.click(screen.getByRole("radio", { name: "Align left" }));

    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onToggleGroupChange).toHaveBeenCalledWith("left");
  });

  test("renders input otp slots without leaking delayed updates", async () => {
    vi.useFakeTimers();

    try {
      const view = render(
        <InputOTP maxLength={3} value="12" onChange={() => {}}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
        </InputOTP>,
      );

      expect(document.querySelector('[data-slot="input-otp"]')).toBeTruthy();
      expect(document.querySelectorAll('[data-slot="input-otp-slot"]').length).toBe(3);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });

      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});

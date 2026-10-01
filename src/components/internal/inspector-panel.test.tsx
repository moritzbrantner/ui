import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { InspectorPanel } from "./inspector-panel";

describe("Inspector numeric fields", () => {
  test("does not convert cleared numeric fields to zero", () => {
    const onValuesChange = vi.fn();
    render(
      <InspectorPanel
        fields={[
          {
            id: "width",
            label: "Width",
            type: "number",
            value: 12.3456,
            displayPrecision: 2,
            unit: "px",
          },
        ]}
        onValuesChange={onValuesChange}
      />,
    );
    const input = screen.getByRole("spinbutton", { name: "Width" });
    fireEvent.change(input, { target: { value: "" } });
    expect(onValuesChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveProperty("value", "12.35");
    fireEvent.change(input, { target: { value: "10.9876" } });
    expect(onValuesChange).toHaveBeenLastCalledWith({ width: 10.9876 }, true);
  });

  test("connects slider and exact input to the same bounded value", () => {
    render(
      <InspectorPanel
        fields={[
          {
            id: "opacity",
            label: "Opacity",
            type: "slider",
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.1,
          },
        ]}
      />,
    );
    const exact = screen.getByRole("spinbutton", { name: "Opacity value" });
    const slider = screen.getByRole("slider", { name: "Opacity handle" });
    fireEvent.change(exact, { target: { value: "0.7" } });
    expect(slider.getAttribute("aria-valuenow")).toBe("0.7");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(exact.getAttribute("aria-valuenow")).toBe("0.8");
    fireEvent.change(exact, { target: { value: "5" } });
    fireEvent.keyDown(exact, { key: "Enter" });
    expect(slider.getAttribute("aria-valuenow")).toBe("1");
    fireEvent.change(exact, { target: { value: "" } });
    fireEvent.blur(exact);
    expect(slider.getAttribute("aria-valuenow")).toBe("1");
  });
});

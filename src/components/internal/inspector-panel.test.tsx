"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { InspectorPanel } from "./inspector-panel";

describe("Inspector numeric fields", () => {
  test("keeps identical property IDs in separate inspectors independently labeled", async () => {
    const user = userEvent.setup();
    const fields = [
      { id: "width", label: "Width", type: "number" as const, description: "Pixels" },
    ];
    render(
      <>
        <InspectorPanel
          fields={fields}
          values={{ width: 1 }}
          validationMessages={{ width: "First error" }}
        />
        <InspectorPanel
          fields={fields}
          values={{ width: 2 }}
          validationMessages={{ width: "Second error" }}
        />
      </>,
    );
    const inputs = screen.getAllByRole("spinbutton", { name: "Width" });
    expect(inputs[0].id).not.toBe(inputs[1].id);
    const labels = screen.getAllByText("Width");
    await user.click(labels[1]);
    expect(document.activeElement).toBe(inputs[1]);
    for (const [index, input] of inputs.entries()) {
      const descriptions = input.getAttribute("aria-describedby")?.split(" ") ?? [];
      expect(descriptions.map((id) => document.getElementById(id)?.textContent)).toEqual([
        "Pixels",
        index === 0 ? "First error" : "Second error",
      ]);
      expect(input.getAttribute("aria-invalid")).toBe("true");
    }
  });

  test("does not convert cleared numeric fields to zero", async () => {
    const user = userEvent.setup();
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
    await user.click(input);
    await user.clear(input);
    expect(onValuesChange).not.toHaveBeenCalled();
    await user.tab();
    expect(input).toHaveProperty("value", "12.35");
    await user.click(input);
    await user.clear(input);
    await user.paste("10.9876");
    expect(onValuesChange).toHaveBeenLastCalledWith({ width: 10.9876 }, true);
  });

  test("connects slider and exact input to the same bounded value", async () => {
    const user = userEvent.setup();
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
    await user.click(exact);
    await user.clear(exact);
    await user.paste("0.7");
    expect(slider.getAttribute("aria-valuenow")).toBe("0.7");
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(slider);
    await user.keyboard("{ArrowRight}");
    expect(exact.getAttribute("aria-valuenow")).toBe("0.8");
    await user.click(exact);
    await user.clear(exact);
    await user.paste("5");
    await user.keyboard("{Enter}");
    expect(slider.getAttribute("aria-valuenow")).toBe("1");
    await user.clear(exact);
    await user.tab();
    expect(slider.getAttribute("aria-valuenow")).toBe("1");
  });
});

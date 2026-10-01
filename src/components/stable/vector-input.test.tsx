import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { Vector2Input, Vector3Input, type Vector2, type Vector3 } from "./vector-input";

describe("Vector inputs", () => {
  test("edits an XY axis without losing the other authoritative coordinate", () => {
    const onValueChange = vi.fn();
    function Demo() {
      const [value, setValue] = React.useState<Vector2>([1.234567, 9.876543]);
      return (
        <Vector2Input
          label="Position"
          value={value}
          displayPrecision={2}
          unit="m"
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Demo />);
    const x = screen.getByRole("spinbutton", { name: "Position X" });
    const y = screen.getByRole("spinbutton", { name: "Position Y" });
    fireEvent.change(x, { target: { value: "3.141592" } });
    fireEvent.blur(x);
    expect(onValueChange).toHaveBeenLastCalledWith([3.141592, 9.876543]);
    expect(x).toHaveProperty("value", "3.14");
    expect(y.getAttribute("aria-valuenow")).toBe("9.876543");
  });

  test("supports XYZ keyboard edits and consuming app replacements", () => {
    function Demo() {
      const [value, setValue] = React.useState<Vector3>([1, 2, 3]);
      return (
        <>
          <Vector3Input
            label="Scale"
            value={value}
            onValueChange={setValue}
            step={0.1}
            smallStep={0.01}
          />
          <button onClick={() => setValue([4, 5, 6])}>Replace selection</button>
        </>
      );
    }
    render(<Demo />);
    const z = screen.getByRole("spinbutton", { name: "Scale Z" });
    fireEvent.keyDown(z, { key: "ArrowUp", altKey: true });
    expect(z).toHaveProperty("value", "3.01");
    fireEvent.change(z, { target: { value: "-" } });
    fireEvent.click(screen.getByRole("button", { name: "Replace selection" }));
    expect(z).toHaveProperty("value", "6");
    expect(screen.getByRole("spinbutton", { name: "Scale X" })).toHaveProperty("value", "4");
    expect(screen.getByRole("spinbutton", { name: "Scale Y" })).toHaveProperty("value", "5");
  });
});

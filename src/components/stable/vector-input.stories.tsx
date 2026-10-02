import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import * as React from "react";

import { Vector2Input, Vector3Input, type Vector2, type Vector3 } from "./vector-input";

const meta = {
  title: "Components/Forms & Inputs/Vector Input",
  component: Vector2Input,
  tags: ["autodocs", "test"],
  args: { label: "Position", value: [1, 2], onValueChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Vector2Input>;
export default meta;
type Story = StoryObj<typeof meta>;

function XYDemo() {
  const [value, setValue] = React.useState<Vector2>([1.234567, 2]);
  return (
    <Vector2Input
      label="Position"
      value={value}
      onValueChange={setValue}
      unit="m"
      step={0.1}
      displayPrecision={2}
    />
  );
}
export const Default: Story = {
  render: () => <XYDemo />,
  play: async ({ canvas, userEvent }) => {
    const x = canvas.getByRole("spinbutton", { name: "Position X" });
    await userEvent.click(x);
    await userEvent.clear(x);
    await userEvent.type(x, "3.141592");
    await userEvent.tab();
    await expect(x).toHaveValue("3.14");
    await expect(x).toHaveAttribute("aria-valuenow", "3.141592");
    await expect(canvas.getByRole("spinbutton", { name: "Position Y" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  },
};
function XYZDemo() {
  const [value, setValue] = React.useState<Vector3>([1, 1, 1]);
  return (
    <Vector3Input
      label="Scale"
      value={value}
      onValueChange={setValue}
      step={0.1}
      smallStep={0.01}
    />
  );
}
export const ThreeAxes: Story = {
  render: () => <XYZDemo />,
  play: async ({ canvas, userEvent }) => {
    const z = canvas.getByRole("spinbutton", { name: "Scale Z" });
    await userEvent.click(z);
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await expect(z).toHaveValue("1.01");
  },
};

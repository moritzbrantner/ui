import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import * as React from "react";

import { NumericInput } from "./numeric-input";

const meta = {
  title: "Components/Forms & Inputs/Numeric Input",
  component: NumericInput,
  tags: ["autodocs", "test"],
  args: {
    "aria-label": "Distance",
    defaultValue: 1.234567,
    unit: "m",
    step: 0.1,
    smallStep: 0.01,
    largeStep: 1,
    displayPrecision: 2,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumericInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Distance" });
    await expect(input).toHaveValue("1.23");
    await userEvent.click(input);
    await expect(input).toHaveValue("1.234567");
    await userEvent.clear(input);
    await userEvent.type(input, "2.345678");
    await userEvent.tab();
    await expect(input).toHaveValue("2.35");
    await expect(input).toHaveAttribute("aria-valuenow", "2.345678");
  },
};

function ControlledDemo() {
  const [value, setValue] = React.useState(0.2);
  return (
    <NumericInput
      aria-label="Opacity"
      value={value}
      onValueChange={setValue}
      min={0}
      max={1}
      step={0.1}
      smallStep={0.01}
      largeStep={0.5}
    />
  );
}
export const Controlled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("spinbutton", { name: "Opacity" });
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("0.3");
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect(input).toHaveValue("0.29");
    await userEvent.clear(input);
    await userEvent.type(input, "-");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("0.29");
  },
};

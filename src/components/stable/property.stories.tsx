import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import * as React from "react";

import { FieldGroup } from "./field";
import { NumericInput } from "./numeric-input";
import { PropertyRow, PropertySection } from "./property";
import { Vector3Input, type Vector3 } from "./vector-input";

function PropertiesDemo() {
  const [width, setWidth] = React.useState(12.34567);
  const [position, setPosition] = React.useState<Vector3>([1, 2, 3]);
  const [open, setOpen] = React.useState(true);
  const widthId = React.useId();
  return (
    <div className="w-full max-w-sm">
      <PropertySection title="Transform" collapsible open={open} onOpenChange={setOpen}>
        <FieldGroup className="gap-3">
          <PropertyRow
            label="Width"
            htmlFor={widthId}
            description="Exact document value"
            descriptionId={`${widthId}-help`}
          >
            <NumericInput
              id={widthId}
              value={width}
              onValueChange={setWidth}
              aria-describedby={`${widthId}-help`}
              unit="px"
              displayPrecision={2}
              step={0.1}
            />
          </PropertyRow>
          <PropertyRow label="Position">
            <Vector3Input
              label="Position"
              value={position}
              onValueChange={setPosition}
              unit="m"
              step={0.1}
            />
          </PropertyRow>
        </FieldGroup>
      </PropertySection>
    </div>
  );
}
const meta = {
  title: "Components/Forms & Inputs/Property",
  component: PropertiesDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof PropertiesDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const width = canvas.getByRole("spinbutton", { name: "Width" });
    await userEvent.click(width);
    await userEvent.clear(width);
    await userEvent.type(width, "9.876543");
    await userEvent.tab();
    await expect(width).toHaveValue("9.88");
    await expect(width).toHaveAttribute("aria-valuenow", "9.876543");
    const trigger = canvas.getByRole("button", { name: "Transform" });
    await userEvent.click(trigger);
    await expect(canvas.queryByRole("spinbutton", { name: "Width" })).not.toBeInTheDocument();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("spinbutton", { name: "Position Z" })).toBeVisible();
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen } from "storybook/test";

import { DatePicker, DateRangePicker } from "./date-picker";

const meta = {
  title: "Components/Forms & Inputs/Date Picker",
  component: DatePicker,
  tags: ["autodocs", "test"],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleDate: Story = {
  args: {
    defaultValue: new Date(2026, 4, 21),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(await screen.findByRole("grid")).toBeInTheDocument();
  },
};

export const DateRange: Story = {
  render: () => <DateRangePicker defaultValue={{ from: new Date(2026, 4, 21) }} />,
};

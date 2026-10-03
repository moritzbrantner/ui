import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ActivityCalendar, type ActivityCalendarDay } from "./activity-calendar";

const data = createFixture("2025-09-01", "2026-08-31");

const meta = {
  title: "Components/Data Display/Activity Calendar",
  component: ActivityCalendar,
  tags: ["autodocs", "test"],
  args: {
    data,
    startDate: "2025-09-01",
    endDate: "2026-08-31",
  },
  render: (args) => (
    <div className="w-[calc(100vw-2rem)] max-w-5xl min-w-0">
      <ActivityCalendar {...args} />
    </div>
  ),
} satisfies Meta<typeof ActivityCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("grid", { name: "Activity calendar" })).toBeVisible();
    await expect(canvas.getByText("Sep")).toBeVisible();
    await expect(canvas.getByText("Less")).toBeVisible();
    await expect(canvas.getByText("More")).toBeVisible();
  },
};

export const Months: Story = {
  args: {
    variant: "months",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    showWeekdayLabels: true,
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
  },
};

function createFixture(startDate: string, endDate: string): ActivityCalendarDay[] {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const dayMs = 86_400_000;
  const fixture: ActivityCalendarDay[] = [];

  for (let timestamp = start, index = 0; timestamp <= end; timestamp += dayMs, index += 1) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const active = index % 9 !== 0 && index % 13 !== 0;
    fixture.push({ date, value: active ? (index * 7 + (index % 11)) % 18 : 0 });
  }

  return fixture;
}

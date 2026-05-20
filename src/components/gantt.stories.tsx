import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { Gantt, type GanttMarker, type GanttTask } from "./gantt";

const tasks: GanttTask[] = [
  {
    id: "brief",
    label: "Project brief",
    start: "2026-04-06",
    end: "2026-04-10",
    progress: 100,
    status: "done",
    group: "Discovery",
  },
  {
    id: "research",
    label: "Customer research",
    start: "2026-04-13",
    end: "2026-04-24",
    progress: 80,
    status: "active",
    group: "Discovery",
    dependencies: ["brief"],
  },
  {
    id: "prototype",
    label: "Prototype",
    start: "2026-04-27",
    end: "2026-05-08",
    progress: 45,
    status: "active",
    group: "Delivery",
    dependencies: ["research"],
  },
  {
    id: "review",
    label: "Stakeholder review",
    start: "2026-05-11",
    milestone: true,
    status: "blocked",
    group: "Delivery",
    dependencies: ["prototype"],
  },
  {
    id: "handoff",
    label: "Engineering handoff",
    start: "2026-05-12",
    end: "2026-05-22",
    progress: 20,
    color: "#0f766e",
    group: "Delivery",
    dependencies: ["review"],
  },
];

const markers: GanttMarker[] = [
  { id: "contract", date: "2026-04-20", label: "Contract gate", color: "#7c3aed" },
  { id: "launch", date: "2026-05-25", label: "Launch target", color: "#dc2626" },
];

function GanttDemo({ onTaskSelect }: { onTaskSelect?: (task: GanttTask) => void }) {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>("prototype");

  return (
    <Gantt
      tasks={tasks}
      markers={markers}
      scale="week"
      startDate="2026-04-06"
      endDate="2026-05-29"
      today="2026-05-20"
      selectedTaskId={selectedTaskId}
      onTaskSelect={(task) => {
        setSelectedTaskId(task.id);
        onTaskSelect?.(task);
      }}
      className="max-w-5xl"
    />
  );
}

const meta = {
  title: "Components/Data Display/Gantt",
  component: GanttDemo,
  tags: ["autodocs", "test"],
  args: {
    onTaskSelect: fn(),
  },
} satisfies Meta<typeof GanttDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole("region", { name: "Gantt chart" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Customer research/ }));
    await expect(args.onTaskSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "research" }),
    );
  },
};

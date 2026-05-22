import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  Gantt,
  getGanttDateRange,
  getGanttDayDiff,
  getGanttParentTaskIds,
  getGanttTaskMetrics,
  getGanttTicks,
  getVisibleGanttTasks,
  normalizeGanttTasks,
  parseGanttDate,
  type GanttTask,
} from "../../labs";

const tasks: GanttTask[] = [
  {
    id: "plan",
    label: "Planning",
    start: "2026-04-06",
    end: "2026-04-10",
    progress: 100,
    status: "done",
  },
  {
    id: "build",
    label: "Build",
    start: "2026-04-13",
    end: "2026-04-24",
    progress: 40,
    dependencies: ["plan"],
  },
  {
    id: "ship",
    label: "Ship",
    start: "2026-04-27",
    milestone: true,
    status: "blocked",
  },
];

const nestedTasks: GanttTask[] = [
  {
    id: "discovery",
    label: "Discovery",
    start: "2026-04-06",
    end: "2026-04-24",
    progress: 70,
    children: [
      {
        id: "research",
        label: "Research",
        start: "2026-04-06",
        end: "2026-04-17",
        progress: 90,
      },
      {
        id: "synthesis",
        label: "Synthesis",
        start: "2026-04-20",
        end: "2026-04-24",
        progress: 30,
        dependencies: ["research"],
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    start: "2026-04-27",
    end: "2026-05-08",
    children: [
      {
        id: "prototype",
        label: "Prototype",
        start: "2026-04-27",
        end: "2026-05-08",
      },
    ],
  },
];

describe("@moritzbrantner/ui gantt", () => {
  test("renders task rows, bars, milestones, markers, and today", () => {
    render(
      <Gantt
        tasks={tasks}
        markers={[{ id: "gate", date: "2026-04-20", label: "Gate" }]}
        startDate="2026-04-06"
        endDate="2026-04-30"
        today="2026-04-22"
      />,
    );

    expect(screen.getByRole("region", { name: "Gantt chart" })).toBeTruthy();
    expect(screen.getAllByText("Planning")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Build/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ship, milestone/ })).toBeTruthy();
    expect(document.querySelector('[data-slot="gantt-marker"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="gantt-today"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="gantt-dependencies"] path')).toBeTruthy();
  });

  test("supports aria label, caption, dependency visibility, and progress labels", () => {
    const { rerender } = render(
      <Gantt
        tasks={tasks}
        ariaLabel="Release plan"
        caption="Release plan caption"
        showDependencyLines={false}
        showProgressLabels
      />,
    );

    expect(screen.getByRole("region", { name: "Release plan" })).toBeTruthy();
    expect(screen.getByText("Release plan caption")).toBeTruthy();
    expect(document.querySelector('[data-slot="gantt-dependencies"]')).toBeNull();
    expect(screen.getByText("40%")).toBeTruthy();

    rerender(<Gantt tasks={tasks} showDependencyLines />);

    expect(document.querySelector('[data-slot="gantt-dependencies"]')).toBeTruthy();
  });

  test("uses a custom task renderer", () => {
    render(
      <Gantt
        tasks={tasks}
        taskRenderer={(task, context) => `${task.label}: ${context.progress}`}
      />,
    );

    expect(screen.getByText("Build: 40")).toBeTruthy();
  });

  test("calls onTaskSelect with the selected task", () => {
    const onTaskSelect = vi.fn();

    render(<Gantt tasks={tasks} onTaskSelect={onTaskSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Build/ }));

    expect(onTaskSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "build" }));
  });

  test("renders nested tasks expanded by default and collapses descendants", () => {
    render(<Gantt tasks={nestedTasks} />);

    expect(screen.getByRole("button", { name: "Collapse Discovery" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Research/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Collapse Discovery" }));

    expect(screen.getByRole("button", { name: "Expand Discovery" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Research/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand Discovery" }));

    expect(screen.getByRole("button", { name: /Research/ })).toBeTruthy();
  });

  test("supports controlled expanded task state", () => {
    const onExpandedTaskIdsChange = vi.fn();

    render(
      <Gantt
        tasks={nestedTasks}
        expandedTaskIds={["discovery"]}
        onExpandedTaskIdsChange={onExpandedTaskIdsChange}
      />,
    );

    expect(screen.getByRole("button", { name: /Research/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Prototype/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Collapse Discovery" }));

    expect(onExpandedTaskIdsChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { name: /Research/ })).toBeTruthy();
  });

  test("normalizes date-only strings and clamps invalid task end dates", () => {
    const parsed = parseGanttDate("2026-04-06");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(3);
    expect(parsed.getDate()).toBe(6);

    const normalized = normalizeGanttTasks([
      { id: "bad-end", label: "Bad end", start: "2026-04-10", end: "2026-04-06" },
    ]);

    expect(getGanttDayDiff(normalized[0].startDate, normalized[0].endDate)).toBe(0);
  });

  test("normalizes nested tasks with hierarchy metadata", () => {
    const normalized = normalizeGanttTasks(nestedTasks);

    expect(normalized.map((task) => task.id)).toEqual([
      "discovery",
      "research",
      "synthesis",
      "delivery",
      "prototype",
    ]);
    expect(normalized.find((task) => task.id === "research")).toEqual(
      expect.objectContaining({ depth: 1, parentId: "discovery", hasChildren: false }),
    );
    expect(getGanttParentTaskIds(normalized)).toEqual(["discovery", "delivery"]);
    expect(getVisibleGanttTasks(normalized, new Set(["delivery"])).map((task) => task.id)).toEqual([
      "discovery",
      "delivery",
      "prototype",
    ]);
  });

  test("creates week ticks over the visible range", () => {
    const normalized = normalizeGanttTasks(tasks);
    const range = getGanttDateRange(normalized, {
      startDate: "2026-04-06",
      endDate: "2026-04-30",
    });
    const ticks = getGanttTicks(
      range,
      "week",
      (date) => `${date.getMonth() + 1}/${date.getDate()}`,
    );

    expect(ticks.map((tick) => tick.label)).toEqual(["4/6", "4/13", "4/20", "4/27"]);
  });

  test("clips task metrics to an explicit visible range", () => {
    const [task] = normalizeGanttTasks([
      { id: "long", label: "Long task", start: "2026-04-01", end: "2026-04-10" },
    ]);
    const range = getGanttDateRange([task], {
      startDate: "2026-04-06",
      endDate: "2026-04-08",
    });
    const metrics = getGanttTaskMetrics(task, range, 10);

    expect(metrics.left).toBe(0);
    expect(metrics.width).toBe(30);
  });
});

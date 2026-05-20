"use client";

import * as React from "react";

import { cn } from "../lib/cn";

type GanttDateInput = Date | string | number;

type GanttScale = "day" | "week" | "month";

type GanttTaskStatus = "pending" | "active" | "done" | "blocked";

type GanttTask = {
  id: string;
  label: string;
  start: GanttDateInput;
  end?: GanttDateInput;
  progress?: number;
  status?: GanttTaskStatus;
  color?: string;
  group?: string;
  groupLabel?: string;
  dependencies?: string[];
  milestone?: boolean;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
};

type GanttMarker = {
  id: string;
  date: GanttDateInput;
  label?: string;
  color?: string;
};

type GanttProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  tasks: GanttTask[];
  markers?: GanttMarker[];
  startDate?: GanttDateInput;
  endDate?: GanttDateInput;
  scale?: GanttScale;
  columnWidth?: number;
  rowHeight?: number;
  labelWidth?: number;
  selectedTaskId?: string | null;
  onTaskSelect?: (task: GanttTask) => void;
  showToday?: boolean;
  today?: GanttDateInput;
  emptyLabel?: string;
  formatDate?: (date: Date, scale: GanttScale) => string;
};

type NormalizedGanttTask = GanttTask & {
  startDate: Date;
  endDate: Date;
};

type GanttDateRange = {
  start: Date;
  end: Date;
};

type GanttTick = {
  id: string;
  start: Date;
  end: Date;
  label: string;
  major: boolean;
};

type GanttTaskMetrics = {
  left: number;
  width: number;
  center: number;
};

const scaleColumnWidth: Record<GanttScale, number> = {
  day: 48,
  week: 96,
  month: 128,
};

const statusColors: Record<GanttTaskStatus, string> = {
  pending: "var(--muted-foreground)",
  active: "var(--chart-1)",
  done: "var(--chart-2)",
  blocked: "var(--destructive)",
};

function Gantt({
  tasks,
  markers = [],
  startDate,
  endDate,
  scale = "week",
  columnWidth,
  rowHeight = 52,
  labelWidth = 220,
  selectedTaskId,
  onTaskSelect,
  showToday = true,
  today = new Date(),
  emptyLabel = "No tasks",
  formatDate = formatGanttDate,
  className,
  ...props
}: GanttProps) {
  const normalizedTasks = normalizeGanttTasks(tasks);
  const normalizedMarkers = markers.map((marker) => ({
    ...marker,
    dateValue: parseGanttDate(marker.date),
  }));
  const range = getGanttDateRange(normalizedTasks, {
    markers: normalizedMarkers.map((marker) => marker.dateValue),
    startDate,
    endDate,
  });
  const ticks = getGanttTicks(range, scale, formatDate);
  const resolvedColumnWidth = columnWidth ?? scaleColumnWidth[scale];
  const dayWidth = resolvedColumnWidth / getScaleDaySpan(scale);
  const totalDays = getGanttDayDiff(range.start, addGanttDays(range.end, 1));
  const timelineWidth = Math.max(totalDays * dayWidth, 320);
  const timelineHeight = normalizedTasks.length * rowHeight;
  const metricsByTaskId = new Map<string, GanttTaskMetrics>();

  for (const task of normalizedTasks) {
    if (isGanttTaskVisible(task, range)) {
      metricsByTaskId.set(task.id, getGanttTaskMetrics(task, range, dayWidth));
    }
  }

  return (
    <div
      data-slot="gantt"
      className={cn("overflow-hidden rounded-md border bg-card text-card-foreground", className)}
      {...props}
    >
      {normalizedTasks.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center px-4 py-10 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div
            role="region"
            aria-label="Gantt chart"
            className="grid"
            style={{
              gridTemplateColumns: `${labelWidth}px ${timelineWidth}px`,
              gridTemplateRows: `44px ${timelineHeight}px`,
              minWidth: labelWidth + timelineWidth,
            }}
          >
            <div
              data-slot="gantt-label-header"
              className="sticky left-0 z-30 flex h-11 items-center border-r border-b bg-card px-3 text-xs font-medium text-muted-foreground"
            >
              Task
            </div>
            <div
              data-slot="gantt-ruler"
              className="relative h-11 border-b bg-muted/30"
              style={{ width: timelineWidth }}
            >
              {ticks.map((tick) => {
                const tickLeft = getGanttDayDiff(range.start, tick.start) * dayWidth;
                const tickWidth = Math.max(
                  getGanttDayDiff(tick.start, tick.end) * dayWidth,
                  1,
                );

                return (
                  <div
                    key={tick.id}
                    data-slot="gantt-tick"
                    className={cn(
                      "absolute top-0 flex h-full items-start border-l border-border px-2 pt-2 text-[11px] text-muted-foreground",
                      tick.major && "font-medium text-foreground",
                    )}
                    style={{ left: tickLeft, width: tickWidth }}
                  >
                    <span className="truncate">{tick.label}</span>
                  </div>
                );
              })}
            </div>

            <div data-slot="gantt-labels" className="sticky left-0 z-20 border-r bg-card">
              {normalizedTasks.map((task) => {
                const groupLabel = task.groupLabel ?? task.group;

                return (
                  <div
                    key={task.id}
                    data-slot="gantt-row-label"
                    className="grid content-center border-b px-3"
                    style={{ height: rowHeight }}
                  >
                    <div className="truncate text-sm font-medium">{task.label}</div>
                    {groupLabel ? (
                      <div className="truncate text-xs text-muted-foreground">{groupLabel}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div
              data-slot="gantt-body"
              className="relative bg-card"
              style={{ height: timelineHeight, width: timelineWidth }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--border) 1px, transparent 1px)",
                  backgroundSize: `${resolvedColumnWidth}px 100%`,
                }}
              />
              {normalizedTasks.map((task, index) => (
                <div
                  key={task.id}
                  aria-hidden="true"
                  data-slot="gantt-row"
                  className="absolute left-0 right-0 border-b"
                  style={{ top: index * rowHeight, height: rowHeight }}
                />
              ))}
              <GanttOverlay
                tasks={normalizedTasks}
                markers={normalizedMarkers}
                metricsByTaskId={metricsByTaskId}
                range={range}
                dayWidth={dayWidth}
                rowHeight={rowHeight}
                timelineWidth={timelineWidth}
                showToday={showToday}
                today={today}
              />
              {normalizedTasks.map((task, index) => {
                const metrics = metricsByTaskId.get(task.id);

                if (!metrics) {
                  return null;
                }

                return (
                  <GanttTaskButton
                    key={task.id}
                    task={task}
                    metrics={metrics}
                    rowHeight={rowHeight}
                    topOffset={index * rowHeight}
                    color={getGanttTaskColor(task)}
                    selected={selectedTaskId === task.id}
                    formatDate={formatDate}
                    scale={scale}
                    onTaskSelect={onTaskSelect}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GanttTaskButton({
  task,
  metrics,
  rowHeight,
  topOffset = 0,
  color,
  selected,
  formatDate,
  scale,
  onTaskSelect,
}: {
  task: NormalizedGanttTask;
  metrics: GanttTaskMetrics;
  rowHeight: number;
  topOffset?: number;
  color: string;
  selected: boolean;
  formatDate: (date: Date, scale: GanttScale) => string;
  scale: GanttScale;
  onTaskSelect?: (task: GanttTask) => void;
}) {
  const ariaLabel = task.milestone
    ? `${task.label}, milestone on ${formatDate(task.startDate, scale)}`
    : `${task.label}, ${formatDate(task.startDate, scale)} to ${formatDate(task.endDate, scale)}`;

  if (task.milestone) {
    return (
      <button
        type="button"
        data-slot="gantt-milestone"
        data-selected={selected ? "true" : undefined}
        disabled={task.disabled}
        aria-label={ariaLabel}
        className="absolute z-10 size-4 -translate-x-1/2 rotate-45 border border-white/70 shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
        style={{
          left: metrics.center,
          top: topOffset + rowHeight / 2 - 8,
          backgroundColor: color,
        }}
        onClick={() => onTaskSelect?.(task)}
      />
    );
  }

  return (
    <button
      type="button"
      data-slot="gantt-task"
      data-selected={selected ? "true" : undefined}
      disabled={task.disabled}
      aria-label={ariaLabel}
      className="absolute z-10 flex min-w-9 items-center overflow-hidden rounded-md border border-white/30 px-2 text-left text-xs font-medium text-white shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
      style={{
        left: metrics.left,
        top: topOffset + rowHeight / 2 - 13,
        width: metrics.width,
        height: 26,
        backgroundColor: color,
      }}
      onClick={() => onTaskSelect?.(task)}
    >
      <span
        aria-hidden="true"
        data-slot="gantt-task-progress"
        className="absolute inset-y-0 left-0 bg-white/25"
        style={{ width: `${clampGanttPercent(task.progress ?? 0)}%` }}
      />
      <span className="relative truncate">{task.label}</span>
    </button>
  );
}

function GanttOverlay({
  tasks,
  markers,
  metricsByTaskId,
  range,
  dayWidth,
  rowHeight,
  timelineWidth,
  showToday,
  today,
}: {
  tasks: NormalizedGanttTask[];
  markers: Array<GanttMarker & { dateValue: Date }>;
  metricsByTaskId: Map<string, GanttTaskMetrics>;
  range: GanttDateRange;
  dayWidth: number;
  rowHeight: number;
  timelineWidth: number;
  showToday: boolean;
  today: GanttDateInput;
}) {
  const chartHeight = rowHeight * tasks.length;
  const todayDate = parseGanttDate(today);
  const todayLeft = getGanttDayDiff(range.start, todayDate) * dayWidth;

  return (
    <>
      <svg
        aria-hidden="true"
        data-slot="gantt-dependencies"
        className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
        width={timelineWidth}
        height={chartHeight}
      >
        {tasks.flatMap((task, taskIndex) =>
          (task.dependencies ?? []).map((dependencyId) => {
            const dependencyIndex = tasks.findIndex((item) => item.id === dependencyId);
            const dependencyMetrics = metricsByTaskId.get(dependencyId);
            const taskMetrics = metricsByTaskId.get(task.id);

            if (!dependencyMetrics || !taskMetrics || dependencyIndex < 0) {
              return null;
            }

            const fromX = dependencyMetrics.left + dependencyMetrics.width;
            const fromY = dependencyIndex * rowHeight + rowHeight / 2;
            const toX = taskMetrics.left;
            const toY = taskIndex * rowHeight + rowHeight / 2;
            const controlOffset = Math.max(24, Math.abs(toX - fromX) / 2);

            return (
              <path
                key={`${dependencyId}-${task.id}`}
                d={`M ${fromX} ${fromY} C ${fromX + controlOffset} ${fromY}, ${
                  toX - controlOffset
                } ${toY}, ${toX} ${toY}`}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
            );
          }),
        )}
      </svg>
      {markers.map((marker) => {
        const left = getGanttDayDiff(range.start, marker.dateValue) * dayWidth;

        return (
          <div
            key={marker.id}
            data-slot="gantt-marker"
            className="pointer-events-none absolute top-0 z-20 h-full border-l-2"
            style={{
              left,
              height: chartHeight,
              borderColor: marker.color ?? "var(--primary)",
            }}
            title={marker.label}
          />
        );
      })}
      {showToday && todayLeft >= 0 && todayLeft <= timelineWidth ? (
        <div
          data-slot="gantt-today"
          className="pointer-events-none absolute top-0 z-20 h-full border-l-2 border-primary"
          style={{ left: todayLeft, height: chartHeight }}
        />
      ) : null}
    </>
  );
}

function normalizeGanttTasks(tasks: GanttTask[]): NormalizedGanttTask[] {
  return tasks
    .map((task) => {
      const start = parseGanttDate(task.start);
      const end = task.end ? parseGanttDate(task.end) : start;
      const endDate = getGanttDayDiff(start, end) < 0 ? start : end;

      return {
        ...task,
        startDate: start,
        endDate,
      };
    })
    .sort((left, right) => {
      const groupSort = (left.groupLabel ?? left.group ?? "").localeCompare(
        right.groupLabel ?? right.group ?? "",
      );

      if (groupSort !== 0) {
        return groupSort;
      }

      return getGanttDayDiff(right.startDate, left.startDate);
    });
}

function parseGanttDate(input: GanttDateInput): Date {
  if (input instanceof Date) {
    return startOfGanttDay(input);
  }

  if (typeof input === "string") {
    const dateOnly = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }
  }

  return startOfGanttDay(new Date(input));
}

function getGanttDateRange(
  tasks: NormalizedGanttTask[],
  options: {
    markers?: Date[];
    startDate?: GanttDateInput;
    endDate?: GanttDateInput;
    today?: GanttDateInput;
  } = {},
): GanttDateRange {
  const explicitStart = options.startDate ? parseGanttDate(options.startDate) : undefined;
  const explicitEnd = options.endDate ? parseGanttDate(options.endDate) : undefined;
  const today = options.today ? parseGanttDate(options.today) : undefined;
  const dates = [
    ...tasks.flatMap((task) => [task.startDate, task.endDate]),
    ...(options.markers ?? []),
    ...(today ? [today] : []),
  ];
  const fallbackStart = today ?? startOfGanttDay(new Date());
  const fallbackEnd = addGanttDays(fallbackStart, 30);
  const start = explicitStart ?? minGanttDate(dates) ?? fallbackStart;
  const end = explicitEnd ?? maxGanttDate(dates) ?? fallbackEnd;

  if (getGanttDayDiff(start, end) < 0) {
    return { start: end, end: start };
  }

  return { start, end };
}

function getGanttTicks(
  range: GanttDateRange,
  scale: GanttScale = "week",
  formatDate: (date: Date, scale: GanttScale) => string = formatGanttDate,
): GanttTick[] {
  const ticks: GanttTick[] = [];
  const rangeEndExclusive = addGanttDays(range.end, 1);
  let cursor = alignGanttTickStart(range.start, scale);

  while (getGanttDayDiff(cursor, rangeEndExclusive) > 0) {
    const next = getNextGanttTick(cursor, scale);
    const visibleStart = getGanttDayDiff(cursor, range.start) > 0 ? range.start : cursor;
    const visibleEnd = getGanttDayDiff(next, rangeEndExclusive) < 0 ? rangeEndExclusive : next;

    if (getGanttDayDiff(visibleStart, visibleEnd) > 0) {
      ticks.push({
        id: `${scale}-${cursor.toISOString()}`,
        start: visibleStart,
        end: visibleEnd,
        label: formatDate(cursor, scale),
        major: isMajorGanttTick(cursor, scale),
      });
    }

    cursor = next;
  }

  return ticks;
}

function getGanttTaskMetrics(
  task: NormalizedGanttTask,
  range: GanttDateRange,
  dayWidth: number,
): GanttTaskMetrics {
  const visibleStart = maxGanttDate([task.startDate, range.start]) ?? task.startDate;
  const visibleEnd = minGanttDate([task.endDate, range.end]) ?? task.endDate;
  const left = Math.max(0, getGanttDayDiff(range.start, visibleStart) * dayWidth);
  const durationDays = task.milestone
    ? 1
    : Math.max(1, getGanttDayDiff(visibleStart, addGanttDays(visibleEnd, 1)));
  const width = Math.max(task.milestone ? 16 : 28, durationDays * dayWidth);

  return {
    left,
    width,
    center: left + (task.milestone ? 0 : width / 2),
  };
}

function isGanttTaskVisible(task: NormalizedGanttTask, range: GanttDateRange) {
  if (task.milestone) {
    return (
      getGanttDayDiff(range.start, task.startDate) >= 0 &&
      getGanttDayDiff(task.startDate, range.end) >= 0
    );
  }

  return (
    getGanttDayDiff(task.endDate, range.start) <= 0 &&
    getGanttDayDiff(task.startDate, range.end) >= 0
  );
}

function formatGanttDate(date: Date, scale: GanttScale = "week") {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: scale === "month" ? "short" : "short",
    day: scale === "month" ? undefined : "numeric",
    year: scale === "month" ? "numeric" : undefined,
  });

  return formatter.format(date);
}

function getGanttTaskColor(task: GanttTask) {
  return task.color ?? statusColors[task.status ?? "active"];
}

function getScaleDaySpan(scale: GanttScale) {
  if (scale === "month") {
    return 30;
  }

  if (scale === "week") {
    return 7;
  }

  return 1;
}

function alignGanttTickStart(date: Date, scale: GanttScale) {
  if (scale === "month") {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  if (scale === "week") {
    const next = startOfGanttDay(date);
    const day = next.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    return addGanttDays(next, offset);
  }

  return startOfGanttDay(date);
}

function getNextGanttTick(date: Date, scale: GanttScale) {
  if (scale === "month") {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  if (scale === "week") {
    return addGanttDays(date, 7);
  }

  return addGanttDays(date, 1);
}

function isMajorGanttTick(date: Date, scale: GanttScale) {
  if (scale === "day") {
    return date.getDate() === 1 || date.getDay() === 1;
  }

  if (scale === "week") {
    return date.getDate() <= 7;
  }

  return true;
}

function startOfGanttDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addGanttDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getGanttDayDiff(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.round((endUtc - startUtc) / 86_400_000);
}

function minGanttDate(dates: Date[]) {
  return dates.reduce<Date | undefined>((current, date) => {
    if (!current || getGanttDayDiff(date, current) > 0) {
      return date;
    }

    return current;
  }, undefined);
}

function maxGanttDate(dates: Date[]) {
  return dates.reduce<Date | undefined>((current, date) => {
    if (!current || getGanttDayDiff(current, date) > 0) {
      return date;
    }

    return current;
  }, undefined);
}

function clampGanttPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export {
  Gantt,
  formatGanttDate,
  getGanttDateRange,
  getGanttDayDiff,
  getGanttTaskMetrics,
  getGanttTicks,
  normalizeGanttTasks,
  parseGanttDate,
};
export type {
  GanttDateInput,
  GanttDateRange,
  GanttMarker,
  NormalizedGanttTask,
  GanttProps,
  GanttScale,
  GanttTask,
  GanttTaskMetrics,
  GanttTaskStatus,
  GanttTick,
};

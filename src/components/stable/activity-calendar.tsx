"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import {
  addDaysToDateKey,
  buildActivityCalendarModel,
  isDateKeyWithinRange,
  parseDateKey,
  type ActivityCalendarVariant,
} from "./activity-calendar/model";

type ActivityCalendarDay = {
  date: string;
  value: number;
  label?: string;
};

type ActivityCalendarLegendLabels = {
  less?: React.ReactNode;
  more?: React.ReactNode;
};

type ActivityCalendarProps = Omit<React.ComponentProps<"div">, "children"> & {
  data: readonly ActivityCalendarDay[];
  startDate?: string;
  endDate?: string;
  levels?: number;
  weekStartsOn?: 0 | 1;
  variant?: ActivityCalendarVariant;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showLegend?: boolean;
  locale?: string | readonly string[];
  legendLabels?: ActivityCalendarLegendLabels;
  formatTooltip?: (day: ActivityCalendarDay) => React.ReactNode;
  formatValue?: (value: number) => string;
  onDayClick?: (day: ActivityCalendarDay) => void;
};

type ActivityCalendarDayCellProps = {
  day: ActivityCalendarDay & { level: number };
  active: boolean;
  levels: number;
  variant: ActivityCalendarVariant;
  ariaLabel: string;
  tooltip: React.ReactNode;
  onActivate: (day: ActivityCalendarDay) => void;
  onFocusDate: (date: string) => void;
  onMoveFocus: (date: string, key: string, direction: "ltr" | "rtl") => void;
  registerDay: (date: string, node: HTMLSpanElement | null) => void;
  interactive: boolean;
};

const variantCellClasses: Record<ActivityCalendarVariant, string> = {
  year: "size-10 sm:size-4",
  months: "size-10 sm:size-5",
  compact: "size-10 sm:size-6",
};

const variantSwatchClasses: Record<ActivityCalendarVariant, string> = {
  year: "size-7 sm:size-3",
  months: "size-7 sm:size-4",
  compact: "size-7 sm:size-5",
};

function ActivityCalendar({
  data,
  startDate,
  endDate,
  levels = 5,
  weekStartsOn = 0,
  variant = "year",
  showMonthLabels = variant !== "compact",
  showWeekdayLabels = variant === "year",
  showLegend = true,
  locale,
  legendLabels,
  formatTooltip,
  formatValue = defaultFormatValue,
  onDayClick,
  className,
  "aria-label": ariaLabel = "Activity calendar",
  ...props
}: ActivityCalendarProps) {
  const formatMonth = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
    [locale],
  );
  const formatWeekday = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    [locale],
  );
  const formatDate = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }),
    [locale],
  );
  const model = React.useMemo(
    () =>
      buildActivityCalendarModel({
        data,
        startDate,
        endDate,
        levels,
        weekStartsOn,
        variant,
        formatMonth: (date) => formatMonth.format(date),
      }),
    [data, endDate, formatMonth, levels, startDate, variant, weekStartsOn],
  );
  const dayRefs = React.useRef(new Map<string, HTMLSpanElement>());
  const [activeDate, setActiveDate] = React.useState(model.endDate);

  React.useEffect(() => {
    if (!isDateKeyWithinRange(activeDate, model.startDate, model.endDate)) {
      setActiveDate(model.endDate);
    }
  }, [activeDate, model.endDate, model.startDate]);

  const weekdays = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const sunday = new Date(Date.UTC(2024, 0, 7));
        const offset = weekStartsOn === 0 ? index : index + 1;
        return formatWeekday.format(new Date(sunday.getTime() + offset * 86_400_000));
      }),
    [formatWeekday, weekStartsOn],
  );
  const visibleWeekdayRows = weekStartsOn === 0 ? new Set([1, 3, 5]) : new Set([0, 2, 4]);

  const registerDay = React.useCallback((date: string, node: HTMLSpanElement | null) => {
    if (node) {
      dayRefs.current.set(date, node);
    } else {
      dayRefs.current.delete(date);
    }
  }, []);

  const moveFocus = React.useCallback(
    (date: string, key: string, direction: "ltr" | "rtl") => {
      let targetDate: string | undefined;
      const weekdayIndex = (parseDateKey(date).getUTCDay() - weekStartsOn + 7) % 7;

      if (key === "ArrowLeft") targetDate = addDaysToDateKey(date, direction === "rtl" ? 7 : -7);
      if (key === "ArrowRight") targetDate = addDaysToDateKey(date, direction === "rtl" ? -7 : 7);
      if (key === "ArrowUp" && weekdayIndex > 0) targetDate = addDaysToDateKey(date, -1);
      if (key === "ArrowDown" && weekdayIndex < 6) targetDate = addDaysToDateKey(date, 1);

      if (!targetDate || !isDateKeyWithinRange(targetDate, model.startDate, model.endDate)) {
        return;
      }

      setActiveDate(targetDate);
      dayRefs.current.get(targetDate)?.focus();
    },
    [model.endDate, model.startDate, weekStartsOn],
  );

  return (
    <div
      data-slot="activity-calendar"
      data-variant={variant}
      data-levels={model.levels}
      aria-label={ariaLabel}
      className={cn("grid min-w-0 gap-2 text-sm", className)}
      {...props}
    >
      <TooltipProvider delayDuration={150}>
        <div
          data-slot="activity-calendar-scroll-area"
          className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1"
        >
          <div data-slot="activity-calendar-layout" className="min-w-max">
            {showMonthLabels ? (
              <div
                data-slot="activity-calendar-months"
                className={cn("mb-1 flex gap-0 sm:gap-1", showWeekdayLabels && "pl-10 sm:pl-8")}
                aria-hidden="true"
              >
                {model.weeks.map((_, weekIndex) => (
                  <div
                    key={weekIndex}
                    className={cn(
                      "shrink-0 overflow-visible whitespace-nowrap text-xs text-muted-foreground",
                      variantCellClasses[variant],
                    )}
                  >
                    {model.monthLabels.get(weekIndex) ?? null}
                  </div>
                ))}
              </div>
            ) : null}

            <div data-slot="activity-calendar-body" className="flex items-start">
              {showWeekdayLabels ? (
                <div
                  data-slot="activity-calendar-weekdays"
                  className="grid w-10 shrink-0 grid-rows-7 sm:w-8"
                  aria-hidden="true"
                >
                  {weekdays.map((weekday, index) => (
                    <div
                      key={`${weekday}-${index}`}
                      className={cn(
                        "flex items-center pr-2 text-xs text-muted-foreground",
                        variantCellClasses[variant],
                      )}
                    >
                      {visibleWeekdayRows.has(index) ? weekday : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <div
                data-slot="activity-calendar-grid"
                role="grid"
                aria-label={ariaLabel}
                className="grid grid-rows-7 gap-0 sm:gap-1"
              >
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <div
                    key={dayIndex}
                    data-slot="activity-calendar-row"
                    role="row"
                    className="flex gap-0 sm:gap-1"
                  >
                    {model.weeks.map((week, weekIndex) => {
                      const day = week[dayIndex];

                      return day ? (
                        <div key={day.date} role="gridcell" data-slot="activity-calendar-gridcell">
                          <ActivityCalendarDayCell
                            day={day}
                            active={activeDate === day.date}
                            levels={model.levels}
                            variant={variant}
                            ariaLabel={
                              day.label ??
                              `${formatValue(day.value)} on ${formatDate.format(parseDateKey(day.date))}`
                            }
                            tooltip={
                              formatTooltip?.({
                                date: day.date,
                                value: day.value,
                                label: day.label,
                              }) ??
                              day.label ??
                              `${formatValue(day.value)} on ${formatDate.format(parseDateKey(day.date))}`
                            }
                            onActivate={({ date, value, label }) =>
                              onDayClick?.({ date, value, label })
                            }
                            onFocusDate={setActiveDate}
                            onMoveFocus={moveFocus}
                            registerDay={registerDay}
                            interactive={Boolean(onDayClick)}
                          />
                        </div>
                      ) : (
                        <div
                          key={`padding-${weekIndex}-${dayIndex}`}
                          data-slot="activity-calendar-padding-day"
                          role="gridcell"
                          aria-hidden="true"
                          className={variantCellClasses[variant]}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showLegend ? (
          <div
            data-slot="activity-calendar-legend"
            className="flex min-w-0 items-center justify-end gap-1 text-xs text-muted-foreground"
            aria-label="Activity intensity"
          >
            <span>{legendLabels?.less ?? "Less"}</span>
            {Array.from({ length: model.levels }, (_, level) => (
              <span
                key={level}
                data-slot="activity-calendar-legend-swatch"
                data-level={level}
                aria-hidden="true"
                className="size-3 rounded-[3px] border border-border/40"
                style={{ backgroundColor: getActivityColor(level, model.levels) }}
              />
            ))}
            <span>{legendLabels?.more ?? "More"}</span>
          </div>
        ) : null}
      </TooltipProvider>
    </div>
  );
}

function ActivityCalendarDayCell({
  day,
  active,
  levels,
  variant,
  ariaLabel,
  tooltip,
  onActivate,
  onFocusDate,
  onMoveFocus,
  registerDay,
  interactive,
}: ActivityCalendarDayCellProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      onMoveFocus(day.date, event.key, getElementDirection(event.currentTarget));
      return;
    }

    if (interactive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onActivate(day);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={(node) => registerDay(day.date, node)}
          data-slot="activity-calendar-day"
          data-date={day.date}
          data-level={day.level}
          role={interactive ? "button" : "img"}
          aria-label={ariaLabel}
          tabIndex={active ? 0 : -1}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            interactive && "cursor-pointer",
            variantCellClasses[variant],
          )}
          onFocus={() => onFocusDate(day.date)}
          onClick={interactive ? () => onActivate(day) : undefined}
          onKeyDown={handleKeyDown}
        >
          <span
            data-slot="activity-calendar-day-swatch"
            aria-hidden="true"
            className={cn(
              "rounded-[3px] border border-border/40 transition-[background-color]",
              variantSwatchClasses[variant],
            )}
            style={{ backgroundColor: getActivityColor(day.level, levels) }}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function getElementDirection(element: HTMLElement) {
  const declaredDirection = element.closest<HTMLElement>('[dir="ltr"], [dir="rtl"]')?.dir;

  if (declaredDirection === "rtl" || declaredDirection === "ltr") {
    return declaredDirection;
  }

  return window.getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
}

function getActivityColor(level: number, levels: number) {
  if (level <= 0) {
    return "var(--activity-calendar-empty, var(--muted))";
  }

  const intensity = Math.round(25 + (75 * level) / Math.max(1, levels - 1));
  return `color-mix(in oklab, var(--activity-calendar-color, var(--chart-1)) ${intensity}%, var(--activity-calendar-empty, var(--muted)))`;
}

function defaultFormatValue(value: number) {
  return `${value} ${value === 1 ? "activity" : "activities"}`;
}

export { ActivityCalendar };
export type {
  ActivityCalendarDay,
  ActivityCalendarLegendLabels,
  ActivityCalendarProps,
  ActivityCalendarVariant,
};

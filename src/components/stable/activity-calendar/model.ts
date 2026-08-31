const DAY_MS = 86_400_000;

export type ActivityCalendarVariant = "year" | "months" | "compact";

export type ActivityCalendarValue<TLabel = string> = {
  date: string;
  value: number;
  label?: TLabel;
};

export type ActivityCalendarModelDay<TLabel = string> = ActivityCalendarValue<TLabel> & {
  level: number;
};

export type ActivityCalendarModel<TLabel = string> = {
  startDate: string;
  endDate: string;
  levels: number;
  weeks: readonly (readonly (ActivityCalendarModelDay<TLabel> | null)[])[];
  monthLabels: ReadonlyMap<number, string>;
};

const variantDayCounts: Record<ActivityCalendarVariant, number> = {
  year: 365,
  months: 183,
  compact: 91,
};

export function buildActivityCalendarModel<TLabel>(options: {
  data: readonly ActivityCalendarValue<TLabel>[];
  startDate?: string;
  endDate?: string;
  levels: number;
  weekStartsOn: 0 | 1;
  variant: ActivityCalendarVariant;
  formatMonth: (date: Date) => string;
}): ActivityCalendarModel<TLabel> {
  const levels = clampLevels(options.levels);
  const { startDate, endDate } = resolveActivityCalendarRange(
    options.startDate,
    options.endDate,
    options.variant,
  );
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  const values = normalizeValues(options.data);
  const days: ActivityCalendarModelDay<TLabel>[] = [];

  for (let current = start; current.getTime() <= end.getTime(); current = addDays(current, 1)) {
    const date = toDateKey(current);
    const entry = values.get(date);
    days.push({
      date,
      value: entry?.value ?? 0,
      label: entry?.label,
      level: 0,
    });
  }

  const maxValue = days.reduce((maximum, day) => Math.max(maximum, day.value), 0);
  const leveledDays = days.map((day) => ({
    ...day,
    level: getActivityLevel(day.value, maxValue, levels),
  }));
  const leadingDays = getLeadingDays(start, options.weekStartsOn);
  const padded: (ActivityCalendarModelDay<TLabel> | null)[] = [
    ...Array.from({ length: leadingDays }, () => null),
    ...leveledDays,
  ];

  while (padded.length % 7 !== 0) {
    padded.push(null);
  }

  const weeks = Array.from({ length: padded.length / 7 }, (_, index) =>
    padded.slice(index * 7, index * 7 + 7),
  );
  const monthLabels = new Map<number, string>();

  leveledDays.forEach((day, dayIndex) => {
    const parsed = parseDateKey(day.date);
    const weekIndex = Math.floor((leadingDays + dayIndex) / 7);

    if (dayIndex === 0 || parsed.getUTCDate() === 1) {
      monthLabels.set(weekIndex, options.formatMonth(parsed));
    }
  });

  return { startDate, endDate, levels, weeks, monthLabels };
}

export function addDaysToDateKey(date: string, amount: number) {
  return toDateKey(addDays(parseDateKey(date), amount));
}

export function isDateKeyWithinRange(date: string, startDate: string, endDate: string) {
  const timestamp = parseDateKey(date).getTime();
  return (
    timestamp >= parseDateKey(startDate).getTime() && timestamp <= parseDateKey(endDate).getTime()
  );
}

export function clampLevels(levels: number) {
  if (!Number.isFinite(levels)) {
    return 5;
  }

  return Math.min(5, Math.max(2, Math.round(levels)));
}

export function parseDateKey(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new TypeError(`Expected a YYYY-MM-DD date, received "${date}".`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new TypeError(`Expected a valid calendar date, received "${date}".`);
  }

  return parsed;
}

function resolveActivityCalendarRange(
  requestedStart: string | undefined,
  requestedEnd: string | undefined,
  variant: ActivityCalendarVariant,
) {
  const dayCount = variantDayCounts[variant];
  let start = requestedStart ? parseDateKey(requestedStart) : undefined;
  let end = requestedEnd ? parseDateKey(requestedEnd) : undefined;

  if (!start && !end) {
    end = parseDateKey(getTodayDateKey());
    start = addDays(end, -(dayCount - 1));
  } else if (start && !end) {
    end = addDays(start, dayCount - 1);
  } else if (!start && end) {
    start = addDays(end, -(dayCount - 1));
  }

  if (!start || !end) {
    throw new Error("Could not resolve the activity calendar date range.");
  }

  if (start.getTime() > end.getTime()) {
    [start, end] = [end, start];
  }

  return { startDate: toDateKey(start), endDate: toDateKey(end) };
}

function normalizeValues<TLabel>(data: readonly ActivityCalendarValue<TLabel>[]) {
  const values = new Map<string, ActivityCalendarValue<TLabel>>();

  for (const item of data) {
    const date = toDateKey(parseDateKey(item.date));
    const value = Number.isFinite(item.value) ? Math.max(0, item.value) : 0;
    const current = values.get(date);

    values.set(date, {
      date,
      value: (current?.value ?? 0) + value,
      label: item.label ?? current?.label,
    });
  }

  return values;
}

function getActivityLevel(value: number, maximum: number, levels: number) {
  if (value <= 0 || maximum <= 0) {
    return 0;
  }

  return Math.max(1, Math.min(levels - 1, Math.ceil((value / maximum) * (levels - 1))));
}

function getLeadingDays(start: Date, weekStartsOn: 0 | 1) {
  return (start.getUTCDay() - weekStartsOn + 7) % 7;
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * DAY_MS);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

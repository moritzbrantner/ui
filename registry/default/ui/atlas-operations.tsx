"use client";

import * as React from "react";

import { cn } from "@/registry/default/lib/cn";

type AtlasTone = "positive" | "negative" | "neutral" | "warning" | "critical";

const toneClassNames: Record<AtlasTone, string> = {
  positive: "text-[var(--data-positive)]",
  negative: "text-[var(--data-negative)]",
  neutral: "text-[var(--data-neutral)]",
  warning: "text-[var(--severity-medium)]",
  critical: "text-[var(--severity-critical)]",
};

type KpiItem = {
  id: React.Key;
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: React.ReactNode;
  tone?: AtlasTone;
  meta?: React.ReactNode;
};

type KpiStripProps = React.ComponentProps<"dl"> & {
  items: readonly KpiItem[];
};

function KpiStrip({ items, className, ...props }: KpiStripProps) {
  return (
    <dl
      data-slot="kpi-strip"
      className={cn(
        "grid divide-y rounded-[var(--ui-radius-surface)] border bg-card text-card-foreground sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] sm:divide-x sm:divide-y-0",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <div key={item.id} className="grid min-w-0 gap-1 px-3 py-2.5">
          <dt className="truncate text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="flex min-w-0 items-baseline justify-between gap-2">
            <span className="truncate text-lg font-semibold tabular-nums">{item.value}</span>
            {item.delta ? (
              <span
                className={cn(
                  "shrink-0 text-xs font-medium tabular-nums",
                  toneClassNames[item.tone ?? "neutral"],
                )}
              >
                {item.delta}
              </span>
            ) : null}
          </dd>
          {item.meta ? (
            <div className="truncate text-xs text-muted-foreground">{item.meta}</div>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

type DeltaCellProps = React.ComponentProps<"span"> & {
  value: React.ReactNode;
  delta: number;
  suffix?: React.ReactNode;
  precision?: number;
};

function DeltaCell({
  value,
  delta,
  suffix = "%",
  precision = 1,
  className,
  ...props
}: DeltaCellProps) {
  const tone: AtlasTone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
  const symbol = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";

  return (
    <span
      data-slot="delta-cell"
      data-tone={tone}
      className={cn("inline-flex min-w-0 items-baseline justify-end gap-2 tabular-nums", className)}
      {...props}
    >
      <span className="truncate font-medium text-foreground">{value}</span>
      <span className={cn("shrink-0 text-xs", toneClassNames[tone])}>
        {symbol} {Math.abs(delta).toFixed(precision)}
        {suffix}
      </span>
    </span>
  );
}

type MapLegendItem = {
  id: React.Key;
  label: React.ReactNode;
  description?: React.ReactNode;
  color?: string;
  visible?: boolean;
};

type MapLegendProps = React.ComponentProps<"div"> & {
  items: readonly MapLegendItem[];
  onVisibilityChange?: (id: React.Key, visible: boolean) => void;
  title?: React.ReactNode;
};

function MapLegend({
  items,
  onVisibilityChange,
  title = "Legend",
  className,
  ...props
}: MapLegendProps) {
  return (
    <div
      data-slot="map-legend"
      className={cn(
        "grid gap-2 rounded-[var(--ui-radius-surface)] border bg-card p-3 text-card-foreground",
        className,
      )}
      {...props}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="grid gap-1">
        {items.map((item) => {
          const visible = item.visible ?? true;
          return (
            <label
              key={item.id}
              className="grid cursor-pointer grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 rounded-[var(--ui-radius-control)] px-1.5 py-1 text-sm hover:bg-muted/60"
            >
              <input
                type="checkbox"
                className="size-3.5 accent-primary"
                checked={visible}
                onChange={(event) => onVisibilityChange?.(item.id, event.currentTarget.checked)}
              />
              <span
                aria-hidden="true"
                className="size-2.5 rounded-sm border"
                style={{ background: item.color ?? "var(--map-layer-accent)" }}
              />
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.label}</span>
                {item.description ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

type OperationalColumn = {
  key: string;
  label: React.ReactNode;
  align?: "left" | "right";
};

type OperationalRow = {
  id: React.Key;
  cells: Readonly<Record<string, React.ReactNode>>;
  tone?: AtlasTone;
};

type OperationalTableProps = React.ComponentProps<"div"> & {
  columns: readonly OperationalColumn[];
  rows: readonly OperationalRow[];
  caption?: React.ReactNode;
};

function OperationalTable({ columns, rows, caption, className, ...props }: OperationalTableProps) {
  return (
    <div
      data-slot="operational-table"
      className={cn("overflow-x-auto rounded-[var(--ui-radius-surface)] border bg-card", className)}
      {...props}
    >
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "h-8 border-b px-2.5 font-medium",
                  column.align === "right" ? "text-right" : "text-left",
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              data-tone={row.tone}
              className="border-b last:border-b-0 hover:bg-muted/35"
            >
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={cn(
                    "h-[var(--ui-table-row-height)] px-2.5",
                    column.align === "right" ? "text-right" : "text-left",
                    row.tone && index === 0 ? toneClassNames[row.tone] : undefined,
                  )}
                >
                  {row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AlertRailItem = {
  id: React.Key;
  title: React.ReactNode;
  detail?: React.ReactNode;
  timestamp?: React.ReactNode;
  severity?: Exclude<AtlasTone, "positive" | "negative">;
};

type AlertRailProps = React.ComponentProps<"ol"> & {
  items: readonly AlertRailItem[];
};

function AlertRail({ items, className, ...props }: AlertRailProps) {
  return (
    <ol data-slot="alert-rail" className={cn("grid gap-1", className)} {...props}>
      {items.map((item) => {
        const severity = item.severity ?? "neutral";
        const color =
          severity === "critical"
            ? "var(--severity-critical)"
            : severity === "warning"
              ? "var(--severity-medium)"
              : "var(--data-neutral)";
        return (
          <li
            key={item.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 border-l-2 px-2 py-1.5"
            style={{ borderColor: color }}
          >
            <span
              aria-hidden="true"
              className="mt-1.5 size-1.5 rounded-full"
              style={{ background: color }}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{item.title}</span>
              {item.detail ? (
                <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
              ) : null}
            </span>
            {item.timestamp ? (
              <time className="text-xs tabular-nums text-muted-foreground">{item.timestamp}</time>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

type SparklineCellProps = React.ComponentProps<"div"> & {
  values: readonly number[];
  value?: React.ReactNode;
  label?: React.ReactNode;
  width?: number;
  height?: number;
};

function SparklineCell({
  values,
  value,
  label,
  width = 88,
  height = 28,
  className,
  ...props
}: SparklineCellProps) {
  const safeValues = values.length > 0 ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const span = max - min || 1;
  const points = safeValues
    .map((entry, index) => {
      const x = safeValues.length === 1 ? width / 2 : (index / (safeValues.length - 1)) * width;
      const y = height - ((entry - min) / span) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      data-slot="sparkline-cell"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <svg
        aria-label={typeof label === "string" ? label : "Trend"}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        className="h-7 w-20 overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--map-layer-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {value ? <span className="font-medium tabular-nums">{value}</span> : null}
    </div>
  );
}

export { AlertRail, DeltaCell, KpiStrip, MapLegend, OperationalTable, SparklineCell };
export type {
  AlertRailItem,
  AlertRailProps,
  AtlasTone,
  DeltaCellProps,
  KpiItem,
  KpiStripProps,
  MapLegendItem,
  MapLegendProps,
  OperationalColumn,
  OperationalRow,
  OperationalTableProps,
  SparklineCellProps,
};

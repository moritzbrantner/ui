"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type FunnelChartSegmentData = {
  id: string;
  label: React.ReactNode;
  value: number;
  description?: React.ReactNode;
  color?: string;
};

type FunnelChartProps = Omit<React.ComponentProps<"figure">, "children"> & {
  data: readonly FunnelChartSegmentData[];
  ariaLabel?: string;
  caption?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  formatValue?: (value: number, segment: FunnelChartSegmentData, index: number) => React.ReactNode;
  formatPercent?: (
    percent: number,
    segment: FunnelChartSegmentData,
    index: number,
  ) => React.ReactNode;
};

export type FunnelChartSegmentProps = React.ComponentProps<"g"> & {
  segment: FunnelChartSegmentData;
  index: number;
  maxValue: number;
  y: number;
  height: number;
  nextPercent: number;
  formatValue: NonNullable<FunnelChartProps["formatValue"]>;
  formatPercent: NonNullable<FunnelChartProps["formatPercent"]>;
};

const FUNNEL_VIEWBOX = { width: 640, height: 360 } as const;
const FUNNEL_HORIZONTAL_PADDING = 40;
const FUNNEL_SEGMENT_GAP = 8;
const FUNNEL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

function defaultFormatValue(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function defaultFormatPercent(percent: number) {
  return `${Math.round(percent)}%`;
}

function getRenderableText(value: React.ReactNode) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function FunnelChart({
  data,
  ariaLabel = "Funnel chart",
  caption,
  emptyMessage = "No funnel data.",
  formatValue = defaultFormatValue,
  formatPercent = defaultFormatPercent,
  className,
  ...props
}: FunnelChartProps) {
  const segments = data.filter((segment) => Number.isFinite(segment.value) && segment.value > 0);
  const maxValue = Math.max(0, ...segments.map((segment) => segment.value));
  const hasData = maxValue > 0;
  const segmentHeight = hasData
    ? (FUNNEL_VIEWBOX.height - FUNNEL_SEGMENT_GAP * (segments.length - 1)) / segments.length
    : FUNNEL_VIEWBOX.height;

  return (
    <figure
      data-slot="funnel-chart"
      className={cn(
        "grid min-w-0 gap-3 rounded-md border bg-card p-4 text-card-foreground",
        className,
      )}
      {...props}
    >
      <svg
        data-slot="funnel-chart-svg"
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${FUNNEL_VIEWBOX.width} ${FUNNEL_VIEWBOX.height}`}
        className="block h-auto w-full min-w-0"
      >
        {hasData ? (
          <g data-slot="funnel-chart-segments">
            {segments.map((segment, index) => {
              const next = segments[index + 1];
              const nextPercent = next
                ? (next.value / maxValue) * 100
                : (segment.value / maxValue) * 100;

              return (
                <FunnelChartSegment
                  key={segment.id}
                  segment={segment}
                  index={index}
                  maxValue={maxValue}
                  y={index * (segmentHeight + FUNNEL_SEGMENT_GAP)}
                  height={segmentHeight}
                  nextPercent={nextPercent}
                  formatValue={formatValue}
                  formatPercent={formatPercent}
                />
              );
            })}
          </g>
        ) : (
          <text
            data-slot="funnel-chart-empty"
            x={FUNNEL_VIEWBOX.width / 2}
            y={FUNNEL_VIEWBOX.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-sm"
          >
            {emptyMessage}
          </text>
        )}
      </svg>
      {hasData ? (
        <div data-slot="funnel-chart-legend" role="list" className="grid gap-2 text-sm">
          {segments.map((segment, index) => {
            const percent = (segment.value / maxValue) * 100;
            return (
              <div
                key={segment.id}
                data-slot="funnel-chart-legend-item"
                role="listitem"
                className="flex min-w-0 items-start justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: segment.color ?? FUNNEL_COLORS[index % FUNNEL_COLORS.length],
                    }}
                  />
                  <span className="min-w-0">{segment.label}</span>
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatValue(segment.value, segment, index)} /{" "}
                  {formatPercent(percent, segment, index)}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
      {caption ? (
        <figcaption
          data-slot="funnel-chart-caption"
          className="text-xs leading-5 text-muted-foreground"
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function FunnelChartSegment({
  segment,
  index,
  maxValue,
  y,
  height,
  nextPercent,
  formatValue,
  formatPercent,
  className,
  ...props
}: FunnelChartSegmentProps) {
  const percent = maxValue ? (segment.value / maxValue) * 100 : 0;
  const topWidth = getFunnelWidth(percent);
  const bottomWidth = getFunnelWidth(nextPercent);
  const center = FUNNEL_VIEWBOX.width / 2;
  const points = [
    [center - topWidth / 2, y],
    [center + topWidth / 2, y],
    [center + bottomWidth / 2, y + height],
    [center - bottomWidth / 2, y + height],
  ]
    .map((point) => point.join(","))
    .join(" ");
  const valueLabel = formatValue(segment.value, segment, index);
  const percentLabel = formatPercent(percent, segment, index);
  const labelText = getRenderableText(segment.label) ?? `Segment ${index + 1}`;

  return (
    <g
      data-slot="funnel-chart-segment"
      data-percent={Math.round(percent)}
      aria-label={`${labelText}: ${getRenderableText(valueLabel) ?? segment.value}, ${getRenderableText(percentLabel) ?? Math.round(percent) + "%"}`}
      className={className}
      {...props}
    >
      <polygon
        points={points}
        fill={segment.color ?? FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
        opacity="0.9"
        className="stroke-background stroke-2"
      />
      <text
        x={center}
        y={y + height / 2 - 8}
        textAnchor="middle"
        className="fill-background text-sm font-semibold"
      >
        {segment.label}
      </text>
      <text
        x={center}
        y={y + height / 2 + 14}
        textAnchor="middle"
        className="fill-background text-xs font-medium"
      >
        {valueLabel} / {percentLabel}
      </text>
    </g>
  );
}

function getFunnelWidth(percent: number) {
  const maxWidth = FUNNEL_VIEWBOX.width - FUNNEL_HORIZONTAL_PADDING * 2;
  const minWidth = 180;

  return Math.max(minWidth, (maxWidth * percent) / 100);
}

export { FunnelChart, FunnelChartSegment };
export type { FunnelChartProps, FunnelChartSegmentData };

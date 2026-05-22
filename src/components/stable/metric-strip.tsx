"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type MetricDeltaTone = "positive" | "negative" | "neutral" | "warning";

type MetricStripItemData = {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: MetricDeltaTone;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
};

type MetricStripProps = React.ComponentProps<"div"> & {
  items?: readonly MetricStripItemData[];
};

type MetricStripItemProps = React.ComponentProps<"div"> & {
  item?: MetricStripItemData;
};

type MetricDeltaProps = React.ComponentProps<"span"> & {
  tone?: MetricDeltaTone;
};

const deltaToneClasses: Record<MetricDeltaTone, string> = {
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
  warning: "text-amber-700 dark:text-amber-400",
};

function MetricStrip({ items, children, className, ...props }: MetricStripProps) {
  const isDataDriven = Boolean(items?.length);

  return (
    <div
      data-slot="metric-strip"
      role={isDataDriven ? "list" : props.role}
      className={cn(
        "grid min-w-0 grid-cols-1 overflow-hidden rounded-md border bg-card text-card-foreground sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]",
        className,
      )}
      {...props}
    >
      {isDataDriven
        ? items?.map((item) => <MetricStripItem key={item.id} item={item} role="listitem" />)
        : children}
    </div>
  );
}

function MetricStripItem({ item, children, className, ...props }: MetricStripItemProps) {
  const Icon = item?.icon;

  return (
    <div
      data-slot="metric-strip-item"
      className={cn(
        "grid min-h-28 min-w-0 content-between gap-3 border-border p-4 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0",
        className,
      )}
      {...props}
    >
      {item ? (
        <>
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div data-slot="metric-strip-label" className="min-w-0 text-sm text-muted-foreground">
              {item.label}
            </div>
            {Icon ? (
              <Icon
                data-slot="metric-strip-icon"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
            ) : null}
          </div>
          <div className="grid min-w-0 gap-1">
            <div
              data-slot="metric-strip-value"
              className="min-h-8 text-2xl font-semibold tracking-normal tabular-nums"
            >
              {item.value}
            </div>
            {item.delta || item.description ? (
              <div className="flex min-h-5 min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {item.delta ? <MetricDelta tone={item.deltaTone}>{item.delta}</MetricDelta> : null}
                {item.description ? (
                  <span data-slot="metric-strip-description" className="text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

function MetricDelta({ tone = "neutral", className, ...props }: MetricDeltaProps) {
  return (
    <span
      data-slot="metric-delta"
      data-tone={tone}
      className={cn("inline-flex font-medium tabular-nums", deltaToneClasses[tone], className)}
      {...props}
    />
  );
}

export { MetricStrip, MetricStripItem, MetricDelta };
export type { MetricStripProps, MetricStripItemData, MetricStripItemProps, MetricDeltaProps };

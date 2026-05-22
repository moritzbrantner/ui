"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type InfographicProps = React.ComponentProps<"figure"> & {
  ariaLabel?: string;
  caption?: React.ReactNode;
};

type InfographicMetricProps = React.ComponentProps<"div"> & {
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  color?: string;
};

type InfographicMetricGridProps = React.ComponentProps<"div">;

type InfographicCalloutProps = React.ComponentProps<"aside"> & {
  tone?: "default" | "accent" | "success" | "warning" | "danger";
};

type InfographicLegendItem = {
  id: string;
  label: React.ReactNode;
  color?: string;
};

type InfographicLegendProps = React.ComponentProps<"div"> & {
  items?: readonly InfographicLegendItem[];
};

const legendColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

const calloutToneClasses: Record<NonNullable<InfographicCalloutProps["tone"]>, string> = {
  default: "border-border bg-muted/40",
  accent: "border-primary/30 bg-primary/5 text-primary",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

function Infographic({ ariaLabel, caption, children, className, ...props }: InfographicProps) {
  return (
    <figure
      data-slot="infographic"
      aria-label={ariaLabel}
      className={cn(
        "grid min-w-0 gap-5 rounded-md border bg-card p-5 text-card-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {caption ? <InfographicSource>{caption}</InfographicSource> : null}
    </figure>
  );
}

function InfographicHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="infographic-header"
      className={cn("grid max-w-3xl gap-2", className)}
      {...props}
    />
  );
}

function InfographicTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="infographic-title"
      className={cn("text-xl font-semibold tracking-normal", className)}
      {...props}
    />
  );
}

function InfographicDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="infographic-description"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

function InfographicBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="infographic-body" className={cn("grid min-w-0 gap-4", className)} {...props} />
  );
}

function InfographicFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="infographic-footer"
      className={cn("flex min-w-0 flex-wrap items-center gap-3 border-t pt-4", className)}
      {...props}
    />
  );
}

function InfographicMetricGrid({ className, ...props }: InfographicMetricGridProps) {
  return (
    <div
      data-slot="infographic-metric-grid"
      className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}
      {...props}
    />
  );
}

function InfographicMetric({
  label,
  value,
  description,
  color,
  className,
  ...props
}: InfographicMetricProps) {
  return (
    <div
      data-slot="infographic-metric"
      className={cn("grid min-h-28 gap-2 rounded-md border bg-background p-4", className)}
      style={
        {
          "--infographic-metric-color": color ?? "var(--chart-1)",
          ...props.style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className="h-1 w-10 rounded-full bg-[var(--infographic-metric-color)]"
        aria-hidden="true"
      />
      <div data-slot="infographic-metric-label" className="text-sm text-muted-foreground">
        {label}
      </div>
      <div data-slot="infographic-metric-value" className="text-2xl font-semibold tabular-nums">
        {value}
      </div>
      {description ? (
        <div
          data-slot="infographic-metric-description"
          className="text-xs leading-5 text-muted-foreground"
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

function InfographicCallout({ tone = "default", className, ...props }: InfographicCalloutProps) {
  return (
    <aside
      data-slot="infographic-callout"
      data-tone={tone}
      className={cn("rounded-md border p-4 text-sm leading-6", calloutToneClasses[tone], className)}
      {...props}
    />
  );
}

function InfographicLegend({ items, children, className, ...props }: InfographicLegendProps) {
  return (
    <div
      data-slot="infographic-legend"
      role={items?.length ? "list" : props.role}
      className={cn("flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-sm", className)}
      {...props}
    >
      {items?.length
        ? items.map((item, index) => (
            <span
              key={item.id}
              data-slot="infographic-legend-item"
              role="listitem"
              className="inline-flex min-w-0 items-center gap-2"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? legendColors[index % legendColors.length] }}
              />
              {item.label}
            </span>
          ))
        : children}
    </div>
  );
}

function InfographicSource({ className, ...props }: React.ComponentProps<"figcaption">) {
  return (
    <figcaption
      data-slot="infographic-source"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Infographic,
  InfographicHeader,
  InfographicTitle,
  InfographicDescription,
  InfographicBody,
  InfographicFooter,
  InfographicMetric,
  InfographicMetricGrid,
  InfographicCallout,
  InfographicLegend,
  InfographicSource,
};
export type {
  InfographicProps,
  InfographicMetricProps,
  InfographicMetricGridProps,
  InfographicCalloutProps,
  InfographicLegendItem,
  InfographicLegendProps,
};

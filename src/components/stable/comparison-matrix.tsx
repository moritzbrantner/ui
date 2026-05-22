"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type ComparisonMatrixCellTone = "positive" | "negative" | "neutral" | "warning";

type ComparisonMatrixColumn = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
};

type ComparisonMatrixRowData = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  values: Record<string, React.ReactNode>;
  toneByColumn?: Partial<Record<string, ComparisonMatrixCellTone>>;
};

type ComparisonMatrixProps = React.ComponentProps<"div"> & {
  columns?: readonly ComparisonMatrixColumn[];
  rows?: readonly ComparisonMatrixRowData[];
  emptyValue?: React.ReactNode;
};

export type ComparisonMatrixHeaderProps = React.ComponentProps<"th">;
export type ComparisonMatrixRowProps = React.ComponentProps<"tr">;
export type ComparisonMatrixCellProps = React.ComponentProps<"td"> & {
  tone?: ComparisonMatrixCellTone;
};
export type ComparisonMatrixBadgeProps = React.ComponentProps<"span"> & {
  tone?: ComparisonMatrixCellTone;
};

const cellToneClasses: Record<ComparisonMatrixCellTone, string> = {
  positive: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  negative: "bg-destructive/10 text-destructive",
  neutral: "bg-muted/50 text-muted-foreground",
  warning: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
};

function ComparisonMatrix({
  columns = [],
  rows = [],
  emptyValue = "-",
  children,
  className,
  ...props
}: ComparisonMatrixProps) {
  const hasData = columns.length > 0 && rows.length > 0;

  return (
    <div
      data-slot="comparison-matrix"
      className={cn("relative min-w-0 overflow-x-auto rounded-md border bg-card", className)}
      {...props}
    >
      {hasData ? (
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <ComparisonMatrixHeader className="sticky left-0 z-10 w-56 bg-muted px-4">
                Criteria
              </ComparisonMatrixHeader>
              {columns.map((column) => (
                <ComparisonMatrixHeader key={column.id}>
                  <div className="grid gap-1">
                    <span>{column.label}</span>
                    {column.description ? (
                      <span className="text-xs font-normal leading-4 text-muted-foreground">
                        {column.description}
                      </span>
                    ) : null}
                  </div>
                </ComparisonMatrixHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ComparisonMatrixRow key={row.id}>
                <th className="sticky left-0 z-10 w-56 border-r bg-card px-4 py-3 text-left align-top">
                  <span data-slot="comparison-matrix-row-label" className="font-medium">
                    {row.label}
                  </span>
                  {row.description ? (
                    <span
                      data-slot="comparison-matrix-row-description"
                      className="mt-1 block text-xs font-normal leading-4 text-muted-foreground"
                    >
                      {row.description}
                    </span>
                  ) : null}
                </th>
                {columns.map((column) => (
                  <ComparisonMatrixCell key={column.id} tone={row.toneByColumn?.[column.id]}>
                    {row.values[column.id] ?? emptyValue}
                  </ComparisonMatrixCell>
                ))}
              </ComparisonMatrixRow>
            ))}
          </tbody>
        </table>
      ) : (
        (children ?? (
          <div data-slot="comparison-matrix-empty" className="p-6 text-sm text-muted-foreground">
            No comparison data.
          </div>
        ))
      )}
    </div>
  );
}

function ComparisonMatrixHeader({ className, ...props }: ComparisonMatrixHeaderProps) {
  return (
    <th
      data-slot="comparison-matrix-header"
      className={cn("min-w-44 px-4 py-3 text-left align-top font-medium", className)}
      {...props}
    />
  );
}

function ComparisonMatrixRow({ className, ...props }: ComparisonMatrixRowProps) {
  return (
    <tr
      data-slot="comparison-matrix-row"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function ComparisonMatrixCell({ tone, className, ...props }: ComparisonMatrixCellProps) {
  return (
    <td
      data-slot="comparison-matrix-cell"
      data-tone={tone}
      className={cn(
        "min-w-44 px-4 py-3 align-top leading-5",
        tone ? cellToneClasses[tone] : undefined,
        className,
      )}
      {...props}
    />
  );
}

function ComparisonMatrixBadge({
  tone = "neutral",
  className,
  ...props
}: ComparisonMatrixBadgeProps) {
  return (
    <span
      data-slot="comparison-matrix-badge"
      data-tone={tone}
      className={cn(
        "inline-flex min-h-6 items-center rounded-md px-2 text-xs font-medium",
        cellToneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

export {
  ComparisonMatrix,
  ComparisonMatrixHeader,
  ComparisonMatrixRow,
  ComparisonMatrixCell,
  ComparisonMatrixBadge,
};
export type {
  ComparisonMatrixProps,
  ComparisonMatrixColumn,
  ComparisonMatrixRowData,
  ComparisonMatrixCellTone,
};

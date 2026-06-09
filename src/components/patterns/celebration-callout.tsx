"use client";

import * as React from "react";
import { SparklesIcon } from "lucide-react";

import { cn } from "../../lib/cn";

type CelebrationCalloutTone = "celebratory" | "primary" | "success" | "info" | "warning";

type CelebrationCalloutProps = React.ComponentPropsWithoutRef<"div"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  progress?: number;
  tone?: CelebrationCalloutTone;
};

const toneLabels = {
  celebratory: "var(--ui-celebratory-accent)",
  primary: "var(--primary)",
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
} satisfies Record<CelebrationCalloutTone, string>;

function CelebrationCallout({
  title,
  description,
  icon,
  action,
  secondaryAction,
  progress,
  tone = "celebratory",
  className,
  style,
  ...props
}: CelebrationCalloutProps) {
  const clampedProgress =
    typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : undefined;
  const isComplete = typeof clampedProgress === "number" && clampedProgress >= 100;
  const resolvedIcon = icon ?? <SparklesIcon aria-hidden="true" className="size-5" />;

  return (
    <div
      data-slot="celebration-callout"
      data-tone={tone}
      data-complete={isComplete ? "true" : "false"}
      className={cn(
        "relative grid max-w-full min-w-0 gap-4 overflow-hidden rounded-[var(--ui-card-radius)] border border-[color-mix(in_oklch,var(--celebration-callout-tone)_28%,transparent)] bg-card p-[var(--ui-card-padding)] text-card-foreground shadow-[var(--ui-shadow-surface)]",
        "sm:grid-cols-[auto_minmax(0,1fr)]",
        className,
      )}
      style={{ "--celebration-callout-tone": toneLabels[tone], ...style } as React.CSSProperties}
      {...props}
    >
      <div
        data-slot="celebration-callout-accent"
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[var(--celebration-callout-tone)]"
      />
      <div
        data-slot="celebration-callout-icon"
        className="grid size-11 place-items-center rounded-[var(--ui-radius-pill)] bg-[color-mix(in_oklch,var(--celebration-callout-tone)_14%,transparent)] text-[var(--celebration-callout-tone)] ring-1 ring-[color-mix(in_oklch,var(--celebration-callout-tone)_26%,transparent)]"
      >
        {resolvedIcon}
      </div>
      <div data-slot="celebration-callout-content" className="grid min-w-0 gap-3">
        <div className="grid min-w-0 gap-1">
          <h2
            data-slot="celebration-callout-title"
            className="text-base font-semibold leading-snug text-foreground"
          >
            {title}
          </h2>
          {description ? (
            <p
              data-slot="celebration-callout-description"
              className="max-w-2xl text-sm leading-6 text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        {typeof clampedProgress === "number" ? (
          <div data-slot="celebration-callout-progress" className="grid gap-1.5">
            <div className="h-2 overflow-hidden rounded-[var(--ui-radius-pill)] bg-[var(--ui-progress-track)]">
              <div
                className="h-full rounded-[var(--ui-radius-pill)] bg-[var(--celebration-callout-tone)] transition-[width] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)]"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        ) : null}
        {action || secondaryAction ? (
          <div
            data-slot="celebration-callout-actions"
            className="flex flex-wrap items-center gap-2"
          >
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { CelebrationCallout, type CelebrationCalloutTone };
export type { CelebrationCalloutProps };

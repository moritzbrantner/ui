"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type LiveIndicatorStatus = "active" | "streaming" | "syncing" | "healthy" | "stale" | "alert";
type LiveIndicatorSize = "sm" | "md";

type LiveIndicatorProps = React.ComponentPropsWithoutRef<"div"> & {
  status: LiveIndicatorStatus;
  label?: React.ReactNode;
  detail?: React.ReactNode;
  size?: LiveIndicatorSize;
  pulse?: boolean;
};

const liveIndicatorLabels = {
  active: "Active",
  streaming: "Streaming",
  syncing: "Syncing",
  healthy: "Healthy",
  stale: "Stale",
  alert: "Alert",
} satisfies Record<LiveIndicatorStatus, string>;

const liveIndicatorPulseStatuses = new Set<LiveIndicatorStatus>(["active", "streaming", "syncing"]);

const liveIndicatorSizeClasses = {
  sm: {
    root: "gap-2 text-xs",
    dot: "size-2",
    detail: "hidden",
  },
  md: {
    root: "gap-2.5 text-sm",
    dot: "size-2.5",
    detail: "text-xs",
  },
} satisfies Record<LiveIndicatorSize, Record<"root" | "dot" | "detail", string>>;

function LiveIndicator({
  status,
  label,
  detail,
  size = "md",
  pulse,
  role,
  "aria-live": ariaLive,
  className,
  ...props
}: LiveIndicatorProps) {
  const shouldPulse = pulse ?? liveIndicatorPulseStatuses.has(status);
  const sizeClasses = liveIndicatorSizeClasses[size];

  return (
    <div
      data-slot="live-indicator"
      data-status={status}
      data-pulse={shouldPulse ? "true" : "false"}
      role={role ?? "status"}
      aria-live={ariaLive ?? "polite"}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center rounded-[var(--ui-radius-pill)] border border-[color-mix(in_oklch,var(--live-indicator-color)_28%,transparent)] bg-[color-mix(in_oklch,var(--live-indicator-color)_10%,transparent)] px-2.5 py-1 text-foreground shadow-xs",
        "[--live-indicator-color:var(--live-active)] data-[status=alert]:[--live-indicator-color:var(--live-alert)] data-[status=healthy]:[--live-indicator-color:var(--live-healthy)] data-[status=stale]:[--live-indicator-color:var(--live-stale)] data-[status=streaming]:[--live-indicator-color:var(--live-streaming)] data-[status=syncing]:[--live-indicator-color:var(--live-syncing)]",
        sizeClasses.root,
        className,
      )}
      {...props}
    >
      <span
        data-slot="live-indicator-dot"
        aria-hidden="true"
        className={cn(
          "shrink-0 rounded-full bg-[var(--live-indicator-color)] shadow-[0_0_0_3px_color-mix(in_oklch,var(--live-indicator-color)_18%,transparent)]",
          sizeClasses.dot,
        )}
      />
      <span className="grid min-w-0 gap-0.5">
        <span data-slot="live-indicator-label" className="truncate font-medium leading-none">
          {label ?? liveIndicatorLabels[status]}
        </span>
        {detail ? (
          <span
            data-slot="live-indicator-detail"
            className={cn("truncate leading-none text-muted-foreground", sizeClasses.detail)}
          >
            {detail}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export { LiveIndicator, type LiveIndicatorSize, type LiveIndicatorStatus };
export type { LiveIndicatorProps };

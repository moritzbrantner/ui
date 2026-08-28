"use client";

import * as React from "react";
import { RefreshCwIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { Button } from "../../stable/button";
import { SelectDropdown } from "../../stable/select";
import { Switch } from "../../stable/switch";

type RefreshIntervalOption = {
  label: React.ReactNode;
  value: number;
};

type RefreshControlProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  autoRefresh?: boolean;
  autoRefreshLabel?: React.ReactNode;
  disabled?: boolean;
  intervalLabel?: string;
  intervalMs?: number;
  intervalOptions?: RefreshIntervalOption[];
  isRefreshing?: boolean;
  lastUpdated?: React.ReactNode;
  onAutoRefreshChange?: (enabled: boolean) => void;
  onIntervalMsChange?: (intervalMs: number) => void;
  onRefresh: () => void;
  refreshLabel?: React.ReactNode;
  refreshingLabel?: React.ReactNode;
};

function RefreshControl({
  autoRefresh,
  autoRefreshLabel = "Auto refresh",
  disabled = false,
  intervalLabel = "Refresh interval",
  intervalMs,
  intervalOptions = [],
  isRefreshing = false,
  lastUpdated,
  onAutoRefreshChange,
  onIntervalMsChange,
  onRefresh,
  refreshLabel = "Refresh",
  refreshingLabel = "Refreshing",
  className,
  children,
  ...props
}: RefreshControlProps) {
  const autoRefreshId = React.useId();
  const showAutoRefresh = autoRefresh !== undefined || onAutoRefreshChange !== undefined;
  const showInterval =
    intervalMs !== undefined && onIntervalMsChange !== undefined && intervalOptions.length > 0;

  return (
    <div
      data-slot="refresh-control"
      data-refreshing={isRefreshing ? true : undefined}
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isRefreshing}
        aria-busy={isRefreshing ? true : undefined}
        onClick={onRefresh}
      >
        <RefreshCwIcon
          aria-hidden="true"
          className={cn(isRefreshing && "motion-safe:animate-spin")}
        />
        {isRefreshing ? refreshingLabel : refreshLabel}
      </Button>

      {showAutoRefresh ? (
        <div data-slot="refresh-control-auto" className="flex min-h-9 items-center gap-2">
          <Switch
            id={autoRefreshId}
            checked={autoRefresh ?? false}
            disabled={disabled}
            onCheckedChange={onAutoRefreshChange}
          />
          <label htmlFor={autoRefreshId} className="text-sm text-muted-foreground">
            {autoRefreshLabel}
          </label>
        </div>
      ) : null}

      {showInterval ? (
        <SelectDropdown
          aria-label={intervalLabel}
          value={String(intervalMs)}
          options={intervalOptions.map((option) => ({
            label: option.label,
            value: String(option.value),
          }))}
          size="sm"
          className="min-w-28"
          disabled={disabled || autoRefresh === false}
          onValueChange={(value) => {
            const nextInterval = Number(value);
            if (Number.isFinite(nextInterval)) {
              onIntervalMsChange(nextInterval);
            }
          }}
        />
      ) : null}

      {lastUpdated ? (
        <span
          data-slot="refresh-control-last-updated"
          className="text-xs text-muted-foreground"
          aria-live="polite"
        >
          {lastUpdated}
        </span>
      ) : null}

      {children}
    </div>
  );
}

export { RefreshControl };
export type { RefreshControlProps, RefreshIntervalOption };

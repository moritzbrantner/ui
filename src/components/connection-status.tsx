"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { AlertTriangleIcon, CheckCheckIcon, RefreshCwIcon } from "lucide-react";

import { cn } from "../lib/cn";

export type ConnectionStatusState =
  | "connected"
  | "synced"
  | "syncing"
  | "disconnected"
  | "out-of-sync";
type ResolvedConnectionStatusState = "synced" | "syncing" | "disconnected";

type ConnectionStatusProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children"
> & {
  status: ConnectionStatusState;
  label?: React.ReactNode;
  detail?: React.ReactNode;
  pending?: boolean;
  onReconnect?: () => void | Promise<void>;
  onSync?: () => void | Promise<void>;
  syncLabel?: React.ReactNode;
  reconnectLabel?: React.ReactNode;
  syncingLabel?: React.ReactNode;
  reconnectingLabel?: React.ReactNode;
};

const connectionStatusVariants = cva(
  "group/connection-status inline-flex max-w-full items-center gap-3 rounded-xl border px-3 py-2 text-left shadow-xs outline-none transition-[border-color,background-color,color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      status: {
        synced:
          "border-emerald-500/30 bg-emerald-500/10 text-foreground hover:bg-emerald-500/14",
        syncing: "border-blue-500/30 bg-blue-500/10 text-foreground",
        disconnected:
          "border-destructive/25 bg-destructive/8 text-foreground hover:bg-destructive/12",
      },
    },
  },
);

const iconToneVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-full",
  {
    variants: {
      status: {
        synced: "bg-emerald-500/16 text-emerald-700 dark:text-emerald-300",
        syncing: "bg-blue-500/14 text-blue-700 dark:text-blue-300",
        disconnected: "bg-destructive/14 text-destructive",
      },
    },
  },
);

const actionToneVariants = cva(
  "inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium transition-[background-color,box-shadow,color,transform] group-hover/connection-status:-translate-y-px group-active/connection-status:translate-y-0",
  {
    variants: {
      status: {
        synced:
          "bg-emerald-500/12 text-emerald-800 group-hover/connection-status:bg-emerald-500/22 group-hover/connection-status:shadow-[0_10px_22px_-14px_rgb(5_150_105_/_0.72)] group-active/connection-status:bg-emerald-500/30 group-active/connection-status:shadow-[0_6px_16px_-12px_rgb(5_150_105_/_0.78)] dark:text-emerald-300",
        syncing: "bg-blue-500/12 text-blue-800 dark:text-blue-300",
        disconnected:
          "bg-destructive/10 text-red-700 group-hover/connection-status:bg-destructive/18 group-hover/connection-status:shadow-[0_10px_22px_-14px_rgb(185_28_28_/_0.68)] group-active/connection-status:bg-destructive/25 group-active/connection-status:shadow-[0_6px_16px_-12px_rgb(185_28_28_/_0.74)] dark:text-red-300",
      },
    },
  },
);

const statusConfig = {
  synced: {
    label: "Connected and synced",
    detail: "All changes are up to date.",
    actionLabel: "Synced up",
    pendingLabel: "Checking...",
    Icon: CheckCheckIcon,
  },
  syncing: {
    label: "Syncing",
    detail: "Changes are syncing now.",
    actionLabel: "Syncing...",
    pendingLabel: "Syncing...",
    Icon: RefreshCwIcon,
  },
  disconnected: {
    label: "Disconnected",
    detail: "Connection lost.",
    actionLabel: "Reconnect",
    pendingLabel: "Reconnecting...",
    Icon: AlertTriangleIcon,
  },
} satisfies Record<
  ResolvedConnectionStatusState,
  {
    label: string;
    detail: string;
    actionLabel: string;
    pendingLabel: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
>;

function resolveConnectionStatus(
  status: ConnectionStatusState,
): ResolvedConnectionStatusState {
  if (status === "connected" || status === "out-of-sync") {
    return "syncing";
  }

  return status;
}

function ConnectionStatus({
  status,
  label,
  detail,
  pending = false,
  disabled = false,
  type = "button",
  className,
  onClick,
  onReconnect,
  onSync,
  syncLabel,
  reconnectLabel,
  syncingLabel,
  reconnectingLabel,
  ...props
}: ConnectionStatusProps) {
  const [isPending, setIsPending] = React.useState(false);
  const resolvedStatus = resolveConnectionStatus(status);
  const config = statusConfig[resolvedStatus];
  const Icon = config.Icon;
  const action =
    resolvedStatus === "disconnected"
      ? onReconnect
      : resolvedStatus === "syncing"
        ? undefined
        : onSync;
  const busy = resolvedStatus === "syncing" || pending || isPending;
  const isDisabled =
    disabled || resolvedStatus === "syncing" || (!action && !onClick);
  const resolvedLabel = label ?? config.label;
  const resolvedDetail = detail ?? config.detail;
  const idleActionLabel =
    resolvedStatus === "disconnected"
      ? (reconnectLabel ?? config.actionLabel)
      : (syncLabel ?? config.actionLabel);
  const pendingActionLabel =
    resolvedStatus === "disconnected"
      ? (reconnectingLabel ?? config.pendingLabel)
      : (syncingLabel ?? config.pendingLabel);
  const actionLabel = busy ? pendingActionLabel : idleActionLabel;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || isDisabled || !action || busy) {
      return;
    }

    try {
      setIsPending(true);
      await Promise.resolve(action());
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      data-slot="connection-status"
      data-status={resolvedStatus}
      data-pending={busy ? "true" : "false"}
      type={type}
      disabled={isDisabled}
      className={cn(
        connectionStatusVariants({ status: resolvedStatus }),
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        data-slot="connection-status-icon"
        className={cn(iconToneVariants({ status: resolvedStatus }))}
      >
        {busy ? (
          <RefreshCwIcon className="size-4 animate-spin" />
        ) : (
          <Icon className="size-4" />
        )}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span
          data-slot="connection-status-label"
          className="truncate text-sm font-medium"
        >
          {resolvedLabel}
        </span>
        <span
          data-slot="connection-status-detail"
          className="truncate text-xs text-muted-foreground"
        >
          {resolvedDetail}
        </span>
      </span>
      <span
        data-slot="connection-status-action"
        className={cn(actionToneVariants({ status: resolvedStatus }))}
      >
        {actionLabel}
      </span>
    </button>
  );
}

export { ConnectionStatus };
export type { ConnectionStatusProps };

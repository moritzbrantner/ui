import * as React from "react";
import { AlertCircleIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { ConnectionStatus, type ConnectionStatusState } from "../patterns/connection-status";
import { PresenceGroup, type PresenceGroupProps } from "./presence";

function CollaborationStatusBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collaboration-status-bar"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 rounded-[var(--ui-radius-surface)] border bg-card px-3 py-2 text-card-foreground sm:flex-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export type CollaborationConnectionProps = React.ComponentProps<typeof ConnectionStatus>;

function CollaborationConnection(props: CollaborationConnectionProps) {
  return (
    <div data-slot="collaboration-connection" className="min-w-0">
      <ConnectionStatus {...props} />
    </div>
  );
}

type CollaborationSyncState = "syncing" | "saved" | "error" | "pending";

export type CollaborationSyncStatusProps = React.ComponentProps<"div"> & {
  state: CollaborationSyncState;
  label: React.ReactNode;
  detail?: React.ReactNode;
};

const syncIcons = {
  syncing: LoaderCircleIcon,
  saved: CheckIcon,
  error: AlertCircleIcon,
  pending: LoaderCircleIcon,
} satisfies Record<CollaborationSyncState, React.ComponentType<{ className?: string }>>;

function CollaborationSyncStatus({
  state,
  label,
  detail,
  className,
  ...props
}: CollaborationSyncStatusProps) {
  const Icon = syncIcons[state];

  return (
    <div
      data-slot="collaboration-sync-status"
      data-state={state}
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-sm data-[state=error]:text-destructive",
        className,
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          state === "syncing" && "animate-spin motion-reduce:animate-none",
        )}
      />
      <span className="min-w-0 truncate">{label}</span>
      {detail ? (
        <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
          {detail}
        </span>
      ) : null}
    </div>
  );
}

function CollaborationParticipants({ className, ...props }: PresenceGroupProps) {
  return (
    <PresenceGroup
      data-slot="collaboration-participants"
      className={cn("ml-auto shrink-0", className)}
      {...props}
    />
  );
}

function CollaborationAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="collaboration-action" className={cn("shrink-0", className)} {...props} />;
}

export {
  CollaborationAction,
  CollaborationConnection,
  CollaborationParticipants,
  CollaborationStatusBar,
  CollaborationSyncStatus,
  type CollaborationSyncState,
  type ConnectionStatusState,
};
export type CollaborationActionProps = React.ComponentProps<typeof CollaborationAction>;
export type CollaborationParticipantsProps = React.ComponentProps<typeof CollaborationParticipants>;
export type CollaborationStatusBarProps = React.ComponentProps<typeof CollaborationStatusBar>;

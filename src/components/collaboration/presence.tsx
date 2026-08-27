import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar, type AvatarProps } from "../stable/avatar";

type PresenceState = "online" | "away" | "busy" | "offline";

const presenceTone: Record<PresenceState, string> = {
  online: "bg-primary",
  away: "bg-[var(--warning)]",
  busy: "bg-destructive",
  offline: "bg-muted-foreground",
};

type PresenceProps = React.ComponentProps<"div"> & {
  status: PresenceState;
  statusLabel: React.ReactNode;
};

function Presence({ status, statusLabel, className, children, ...props }: PresenceProps) {
  return (
    <div
      data-slot="presence"
      data-status={status}
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      {children}
      <span data-slot="presence-status" className="min-w-0 truncate text-sm">
        {statusLabel}
      </span>
    </div>
  );
}

type PresenceAvatarProps = Omit<AvatarProps, "online"> & {
  status: PresenceState;
  statusLabel: string;
};

function PresenceAvatar({ status, statusLabel, className, ...props }: PresenceAvatarProps) {
  return (
    <span data-slot="presence-avatar" className="relative inline-flex shrink-0">
      <Avatar className={className} {...props} />
      <PresenceIndicator status={status} label={statusLabel} />
    </span>
  );
}

type PresenceIndicatorProps = Omit<React.ComponentProps<"span">, "aria-label"> & {
  status: PresenceState;
  label: string;
};

function PresenceIndicator({ status, label, className, ...props }: PresenceIndicatorProps) {
  return (
    <span
      data-slot="presence-indicator"
      data-status={status}
      role="img"
      aria-label={label}
      className={cn(
        "absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
        presenceTone[status],
        className,
      )}
      {...props}
    />
  );
}

type PresenceGroupParticipant = Omit<PresenceAvatarProps, "statusLabel"> & {
  id: React.Key;
  statusLabel: string;
};

type PresenceGroupProps = Omit<React.ComponentProps<"div">, "children"> & {
  participants: readonly PresenceGroupParticipant[];
  maxVisible?: number;
  overflowLabel?: (hiddenCount: number) => string;
};

function PresenceGroup({
  participants,
  maxVisible = participants.length,
  overflowLabel,
  className,
  ...props
}: PresenceGroupProps) {
  const visible = participants.slice(0, Math.max(0, maxVisible));
  const hiddenCount = Math.max(0, participants.length - visible.length);

  return (
    <div
      data-slot="presence-group"
      className={cn(
        "flex -space-x-2 *:data-[slot=presence-avatar]:ring-2 *:data-[slot=presence-avatar]:ring-background",
        className,
      )}
      {...props}
    >
      {visible.map(({ id, ...participant }) => (
        <PresenceAvatar key={id} {...participant} />
      ))}
      {hiddenCount > 0 ? (
        <PresenceCount aria-label={overflowLabel?.(hiddenCount)} count={hiddenCount} />
      ) : null}
    </div>
  );
}

type PresenceCountProps = Omit<React.ComponentProps<"span">, "children"> & {
  count: number;
};

function PresenceCount({ count, className, ...props }: PresenceCountProps) {
  return (
    <span
      data-slot="presence-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background",
        className,
      )}
      {...props}
    >
      +{Math.max(0, count)}
    </span>
  );
}

export {
  Presence,
  PresenceAvatar,
  PresenceCount,
  PresenceGroup,
  PresenceIndicator,
  type PresenceGroupParticipant,
  type PresenceState,
};
export type {
  PresenceAvatarProps,
  PresenceCountProps,
  PresenceGroupProps,
  PresenceIndicatorProps,
  PresenceProps,
};

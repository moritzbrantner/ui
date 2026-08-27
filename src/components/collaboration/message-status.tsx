import * as React from "react";
import { AlertCircleIcon, CheckCheckIcon, CheckIcon, Clock3Icon, SendIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Avatar, type AvatarProps } from "../stable/avatar";

type MessageStatusState = "sending" | "sent" | "delivered" | "read" | "failed";

const statusIcons: Record<MessageStatusState, React.ComponentType<{ className?: string }>> = {
  sending: Clock3Icon,
  sent: SendIcon,
  delivered: CheckIcon,
  read: CheckCheckIcon,
  failed: AlertCircleIcon,
};

export type MessageStatusProps = React.ComponentProps<"span"> & {
  state: MessageStatusState;
  label: React.ReactNode;
  detail?: React.ReactNode;
  compact?: boolean;
  icon?: React.ReactNode;
};

function MessageStatus({
  state,
  label,
  detail,
  compact = false,
  icon,
  className,
  ...props
}: MessageStatusProps) {
  const Icon = statusIcons[state];

  return (
    <span
      data-slot="message-status"
      data-state={state}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground data-[state=failed]:text-destructive",
        className,
      )}
      {...props}
    >
      {icon !== null ? (
        <span data-slot="message-status-icon" aria-hidden="true" className="shrink-0">
          {icon === undefined ? <Icon className="size-3.5" /> : icon}
        </span>
      ) : null}
      <span className={cn("min-w-0 truncate", compact && "sr-only")}>{label}</span>
      {detail ? <span className="min-w-0 truncate">{detail}</span> : null}
    </span>
  );
}

export type ReadReceiptParticipantProps = Omit<AvatarProps, "online"> & {
  label: string;
};

function ReadReceiptParticipant({ label, className, ...props }: ReadReceiptParticipantProps) {
  return (
    <span data-slot="read-receipt-participant" aria-label={label} className="inline-flex">
      <Avatar size="xs" className={className} {...props} />
    </span>
  );
}

export type ReadReceiptGroupProps = React.ComponentProps<"div"> & {
  maxVisible?: number;
  overflowLabel?: (hiddenCount: number) => string;
};

function ReadReceiptGroup({
  maxVisible,
  overflowLabel,
  className,
  children,
  ...props
}: ReadReceiptGroupProps) {
  const items = React.Children.toArray(children);
  const visibleItems = items.slice(0, maxVisible ?? items.length);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div data-slot="read-receipt-group" className={cn("flex -space-x-1.5", className)} {...props}>
      {visibleItems}
      {hiddenCount > 0 ? (
        <span
          data-slot="read-receipt-overflow"
          aria-label={overflowLabel?.(hiddenCount)}
          className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-1 ring-background"
        >
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

export { MessageStatus, ReadReceiptGroup, ReadReceiptParticipant, type MessageStatusState };

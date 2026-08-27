import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar, type AvatarProps } from "../stable/avatar";

type CollaborationTone = "primary" | "warning" | "destructive";

const collaborationToneClasses = {
  primary:
    "text-primary [--collaboration-tone:var(--primary)] [--collaboration-tone-foreground:var(--primary-foreground)]",
  warning:
    "text-[var(--warning)] [--collaboration-tone:var(--warning)] [--collaboration-tone-foreground:var(--warning-foreground)]",
  destructive:
    "text-destructive [--collaboration-tone:var(--destructive)] [--collaboration-tone-foreground:var(--destructive-foreground)]",
} satisfies Record<CollaborationTone, string>;

function CollaborationOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collaboration-overlay"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    />
  );
}

export type LiveCursorProps = Omit<React.ComponentProps<"div">, "children"> & {
  x: number;
  y: number;
  label: string;
  avatar?: AvatarProps;
  content?: React.ReactNode;
  tone?: CollaborationTone;
};

function LiveCursor({
  x,
  y,
  label,
  avatar,
  content,
  tone = "primary",
  className,
  style,
  ...props
}: LiveCursorProps) {
  return (
    <div
      data-slot="live-cursor"
      aria-label={label}
      className={cn(
        "absolute top-0 left-0 inline-flex max-w-40 origin-top-left items-start transition-transform duration-[var(--ui-motion-duration-fast)] ease-[var(--ui-motion-ease-standard)] motion-reduce:transition-none",
        collaborationToneClasses[tone],
        className,
      )}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)`, ...style }}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 18 24" className="size-5 shrink-0 fill-current">
        <path d="M1 1v18l4.8-4.2 3.1 7.1 3.2-1.5-3.2-6.8H16L1 1Z" />
      </svg>
      <span className="-ml-1 flex min-w-0 items-center gap-1 rounded-full bg-[var(--collaboration-tone)] px-2 py-1 text-xs text-[var(--collaboration-tone-foreground)] shadow-sm">
        {avatar ? <Avatar aria-hidden="true" size="xs" {...avatar} /> : null}
        <span className="min-w-0 truncate">{content ?? label}</span>
      </span>
    </div>
  );
}

type RemoteSelectionBounds = { x: number; y: number; width: number; height: number };

export type RemoteSelectionProps = Omit<React.ComponentProps<"div">, "children"> & {
  bounds: RemoteSelectionBounds;
  label: string;
  tone?: CollaborationTone;
};

function RemoteSelection({
  bounds,
  label,
  tone = "primary",
  className,
  style,
  ...props
}: RemoteSelectionProps) {
  return (
    <div
      data-slot="remote-selection"
      role="img"
      aria-label={label}
      className={cn("absolute border-2 bg-current/10", collaborationToneClasses[tone], className)}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: Math.max(0, bounds.width),
        height: Math.max(0, bounds.height),
        ...style,
      }}
      {...props}
    />
  );
}

export {
  CollaborationOverlay,
  LiveCursor,
  RemoteSelection,
  type CollaborationTone,
  type RemoteSelectionBounds,
};
export type CollaborationOverlayProps = React.ComponentProps<typeof CollaborationOverlay>;

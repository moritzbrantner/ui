import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar, type AvatarProps } from "../stable/avatar";

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
  color?: string;
};

function LiveCursor({
  x,
  y,
  label,
  avatar,
  content,
  color = "currentColor",
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
        className,
      )}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)`, color, ...style }}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 18 24" className="size-5 shrink-0 fill-current">
        <path d="M1 1v18l4.8-4.2 3.1 7.1 3.2-1.5-3.2-6.8H16L1 1Z" />
      </svg>
      <span className="-ml-1 flex min-w-0 items-center gap-1 rounded-full bg-current px-2 py-1 text-xs text-primary-foreground shadow-sm">
        {avatar ? <Avatar aria-hidden="true" size="xs" {...avatar} /> : null}
        <span className="min-w-0 truncate text-[color:var(--primary-foreground)]">
          {content ?? label}
        </span>
      </span>
    </div>
  );
}

type RemoteSelectionBounds = { x: number; y: number; width: number; height: number };

export type RemoteSelectionProps = Omit<React.ComponentProps<"div">, "children"> & {
  bounds: RemoteSelectionBounds;
  label: string;
  color?: string;
};

function RemoteSelection({
  bounds,
  label,
  color = "currentColor",
  className,
  style,
  ...props
}: RemoteSelectionProps) {
  return (
    <div
      data-slot="remote-selection"
      role="img"
      aria-label={label}
      className={cn("absolute border-2 bg-current/10", className)}
      style={{
        left: bounds.x,
        top: bounds.y,
        width: Math.max(0, bounds.width),
        height: Math.max(0, bounds.height),
        color,
        ...style,
      }}
      {...props}
    />
  );
}

export { CollaborationOverlay, LiveCursor, RemoteSelection, type RemoteSelectionBounds };
export type CollaborationOverlayProps = React.ComponentProps<typeof CollaborationOverlay>;

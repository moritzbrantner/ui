import * as React from "react";

import { cn } from "../../lib/cn";

function ActivityFeed({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol data-slot="activity-feed" className={cn("grid min-w-0 gap-4", className)} {...props} />
  );
}

function ActivityItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="activity-item"
      className={cn("grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3", className)}
      {...props}
    />
  );
}

function ActivityActor({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="activity-actor" className={cn("font-medium", className)} {...props} />;
}

function ActivityContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-content"
      className={cn("min-w-0 text-sm leading-6 [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

export type ActivityMetaProps = React.ComponentProps<"div"> & {
  dateTime?: string;
  timestamp?: React.ReactNode;
};

function ActivityMeta({ dateTime, timestamp, className, children, ...props }: ActivityMetaProps) {
  return (
    <div
      data-slot="activity-meta"
      className={cn(
        "mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    >
      {timestamp ? <time dateTime={dateTime}>{timestamp}</time> : null}
      {children}
    </div>
  );
}

function ActivityGroup({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="activity-group"
      className={cn(
        "flex items-center gap-3 border-t pt-3 text-xs font-medium text-muted-foreground first:border-t-0 first:pt-0",
        className,
      )}
      {...props}
    />
  );
}

function ActivityEmpty({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="activity-empty"
      className={cn(
        "rounded-[var(--ui-radius-surface)] border border-dashed p-4 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ActivityActor,
  ActivityContent,
  ActivityEmpty,
  ActivityFeed,
  ActivityGroup,
  ActivityItem,
  ActivityMeta,
};
export type ActivityActorProps = React.ComponentProps<typeof ActivityActor>;
export type ActivityContentProps = React.ComponentProps<typeof ActivityContent>;
export type ActivityEmptyProps = React.ComponentProps<typeof ActivityEmpty>;
export type ActivityFeedProps = React.ComponentProps<typeof ActivityFeed>;
export type ActivityGroupProps = React.ComponentProps<typeof ActivityGroup>;
export type ActivityItemProps = React.ComponentProps<typeof ActivityItem>;

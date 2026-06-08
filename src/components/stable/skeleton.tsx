import type * as React from "react";

import { cn } from "../../lib/cn";

function Skeleton({
  className,
  role = "status",
  "aria-label": ariaLabel = "Loading...",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      role={role}
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

export type SkeletonProps = React.ComponentProps<typeof Skeleton>;

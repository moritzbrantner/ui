import * as React from "react";
import { cn } from "../../lib/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-busy="true"
      aria-label="Loading..."
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

export type SkeletonProps = React.ComponentProps<typeof Skeleton>;

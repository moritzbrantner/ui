"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "../../lib/cn";

const progressSizeClasses = {
  sm: "h-1",
  default: "h-2",
  lg: "h-3",
} as const;

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  size?: keyof typeof progressSizeClasses;
};

function Progress({ className, size = "default", value, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex w-full items-center overflow-x-hidden rounded-full bg-muted",
        progressSizeClasses[size],
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

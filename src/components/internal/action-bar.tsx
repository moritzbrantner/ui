import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const actionBarVariants = cva("flex min-w-0 flex-wrap items-center gap-2", {
  variants: {
    align: {
      start: "justify-start",
      end: "justify-end",
      between: "justify-between",
    },
    sticky: {
      true: "sticky bottom-0 z-10 border-t border-border/60 bg-background/80 p-3 shadow-[var(--glass-shadow)] supports-backdrop-filter:backdrop-blur-xl",
      false: "",
    },
  },
  defaultVariants: {
    align: "end",
    sticky: false,
  },
});

export type ActionBarProps = React.ComponentProps<"div"> & {
  align?: "start" | "end" | "between";
  sticky?: boolean;
};

function ActionBar({ className, align = "end", sticky = false, ...props }: ActionBarProps) {
  return (
    <div
      data-slot="action-bar"
      data-align={align}
      data-sticky={sticky}
      className={cn(actionBarVariants({ align, sticky }), className)}
      {...props}
    />
  );
}

export { ActionBar };

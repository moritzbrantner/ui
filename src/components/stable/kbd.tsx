"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import type { LegacyMotionProps } from "../../lib/motion";

function Kbd({
  className,
  layout: _layout,
  transition: _transition,
  initial: _initial,
  animate: _animate,
  exit: _exit,
  whileHover: _whileHover,
  whileTap: _whileTap,
  ...props
}: React.ComponentProps<"kbd"> & LegacyMotionProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({
  className,
  layout: _layout,
  transition: _transition,
  initial: _initial,
  animate: _animate,
  exit: _exit,
  whileHover: _whileHover,
  whileTap: _whileTap,
  ...props
}: React.ComponentProps<"kbd"> & LegacyMotionProps) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };

export type KbdProps = React.ComponentProps<typeof Kbd>;
export type KbdGroupProps = React.ComponentProps<typeof KbdGroup>;

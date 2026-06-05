"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "../../lib/cn";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex h-10 shrink-0 items-center rounded-md outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:w-14 data-[size=sm]:w-12 before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-md before:border before:transition-all data-[size=default]:before:h-6 data-[size=default]:before:w-11 data-[size=sm]:before:h-5 data-[size=sm]:before:w-9 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:before:border-primary data-[state=checked]:before:bg-primary data-[state=unchecked]:before:border-border data-[state=unchecked]:before:bg-input dark:data-[state=unchecked]:before:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none relative z-10 block rounded-full bg-foreground/20 ring-0 transition-transform data-[state=checked]:bg-background group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 group-[[data-size=default][data-state=checked]]/switch:translate-x-[30px] group-[[data-size=sm][data-state=checked]]/switch:translate-x-[26px] dark:data-[state=checked]:bg-primary-foreground group-[[data-size=default][data-state=unchecked]]/switch:translate-x-1.5 group-[[data-size=sm][data-state=unchecked]]/switch:translate-x-1.5 dark:data-[state=unchecked]:bg-foreground/50"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

export type SwitchProps = React.ComponentProps<typeof Switch>;

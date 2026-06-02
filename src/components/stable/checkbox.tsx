"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../lib/cn";
import { CheckIcon } from "lucide-react";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-10 shrink-0 items-center justify-center rounded-md outline-none group-has-disabled/field:opacity-50 before:absolute before:top-1/2 before:left-1/2 before:size-4 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-[4px] before:border before:border-input before:bg-transparent before:transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:before:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-[state=checked]:text-primary-foreground data-[state=checked]:before:border-primary data-[state=checked]:before:bg-primary dark:data-[state=checked]:before:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="z-10 grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

export type CheckboxProps = React.ComponentProps<typeof Checkbox>;

"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Button } from "../stable/button";
import { Popover, PopoverContent, PopoverTrigger } from "../stable/popover";

function ReactionGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="reaction-group"
      role="group"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

export type ReactionButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> & {
  active: boolean;
  count?: number;
  reaction: React.ReactNode;
  label: string;
};

function ReactionButton({
  active,
  count,
  reaction,
  label,
  className,
  variant,
  ...props
}: ReactionButtonProps) {
  const countLabel = count === undefined ? "" : ` ${count}`;

  return (
    <Button
      data-slot="reaction-button"
      type="button"
      size="sm"
      variant={variant ?? (active ? "secondary" : "outline")}
      aria-label={`${label}${countLabel}`}
      aria-pressed={active}
      className={cn("h-10 min-h-10 min-w-11 rounded-full px-2.5", className)}
      {...props}
    >
      <span aria-hidden="true">{reaction}</span>
      {count !== undefined ? (
        <span data-slot="reaction-count" aria-hidden="true" className="tabular-nums">
          {count}
        </span>
      ) : null}
    </Button>
  );
}

type ReactionPickerOption = {
  key: React.Key;
  label: string;
  reaction: React.ReactNode;
  disabled?: boolean;
};

export type ReactionPickerProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onSelect"
> & {
  options: readonly ReactionPickerOption[];
  label: string;
  trigger: React.ReactNode;
  onSelect?: (option: ReactionPickerOption) => void;
};

function ReactionPicker({ options, label, trigger, onSelect, ...props }: ReactionPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button data-slot="reaction-picker-trigger" type="button" aria-label={label} {...props}>
          {trigger}
        </Button>
      </PopoverTrigger>
      <PopoverContent data-slot="reaction-picker" className="w-auto p-2" aria-label={label}>
        <div role="listbox" className="flex flex-wrap gap-1">
          {options.map((option) => (
            <Button
              key={option.key}
              type="button"
              role="option"
              variant="ghost"
              size="icon"
              disabled={option.disabled}
              aria-label={option.label}
              onClick={() => {
                onSelect?.(option);
                setOpen(false);
              }}
            >
              <span aria-hidden="true">{option.reaction}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ReactionButton, ReactionGroup, ReactionPicker, type ReactionPickerOption };
export type ReactionGroupProps = React.ComponentProps<typeof ReactionGroup>;

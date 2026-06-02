"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../../lib/cn";

type DataAttributes = Record<`data-${string}`, string | number | boolean | undefined>;

type SharedDatePickerProps = {
  className?: string;
  placeholder?: React.ReactNode;
  formatString?: string;
  align?: React.ComponentProps<typeof PopoverContent>["align"];
  disabled?: boolean;
  triggerProps?: Omit<React.ComponentProps<typeof Button>, "children"> & DataAttributes;
  contentProps?: React.ComponentProps<typeof PopoverContent> & DataAttributes;
};

type DatePickerProps = SharedDatePickerProps &
  Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect" | "disabled"> & {
    value?: Date;
    defaultValue?: Date;
    onChange?: (value: Date | undefined) => void;
  };

type DateRangePickerProps = SharedDatePickerProps &
  Omit<
    React.ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect" | "numberOfMonths" | "disabled"
  > & {
    value?: DateRange;
    defaultValue?: DateRange;
    numberOfMonths?: React.ComponentProps<typeof Calendar>["numberOfMonths"];
    onChange?: (value: DateRange | undefined) => void;
  };

function DatePicker({
  value,
  defaultValue,
  onChange,
  className,
  placeholder = "Pick a date",
  formatString = "PPP",
  align = "start",
  disabled,
  triggerProps,
  contentProps,
  ...calendarProps
}: DatePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
  const selected = value ?? internalValue;

  const handleSelect = React.useCallback(
    (nextValue: Date | undefined) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [onChange, value],
  );
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-slot="date-picker"
          variant="outline"
          data-empty={!selected}
          disabled={disabled}
          className={cn(
            "w-[min(280px,100%)] min-w-0 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
            triggerClassName,
          )}
          {...restTriggerProps}
        >
          <CalendarIcon />
          {selected ? format(selected, formatString) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Date picker"
        align={align}
        className={cn("w-auto p-0", contentClassName)}
        {...restContentProps}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={disabled}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

function DateRangePicker({
  value,
  defaultValue,
  onChange,
  className,
  placeholder = "Pick a date range",
  formatString = "LLL dd, y",
  align = "start",
  disabled,
  triggerProps,
  contentProps,
  numberOfMonths,
  ...calendarProps
}: DateRangePickerProps) {
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(defaultValue);
  const selected = value ?? internalValue;

  const handleSelect = React.useCallback(
    (nextValue: DateRange | undefined) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [onChange, value],
  );

  const label =
    selected?.from && selected?.to
      ? `${format(selected.from, formatString)} - ${format(selected.to, formatString)}`
      : selected?.from
        ? format(selected.from, formatString)
        : null;
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          data-slot="date-range-picker"
          variant="outline"
          data-empty={!label}
          disabled={disabled}
          className={cn(
            "w-[min(300px,100%)] min-w-0 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
            triggerClassName,
          )}
          {...restTriggerProps}
        >
          <CalendarIcon />
          {label ? <span>{label}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Date range picker"
        align={align}
        className={cn("w-auto p-0", contentClassName)}
        {...restContentProps}
      >
        <Calendar
          mode="range"
          numberOfMonths={numberOfMonths ?? 1}
          selected={selected}
          onSelect={handleSelect}
          disabled={disabled}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DateRangePicker };
export type { DatePickerProps, DateRangePickerProps };

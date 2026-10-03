"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./input-group";

type NumericInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  unit?: string;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  min?: number;
  max?: number;
  displayPrecision?: number;
  inputClassName?: string;
};

type NumericDraft = { text: string; authoritativeValue: number | null };

function parseNumericDraft(text: string) {
  const trimmed = text.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
    return null;
  }
  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

function decimalPlaces(value: number) {
  const [coefficient, exponent = "0"] = String(value).toLowerCase().split("e");
  return Math.max(0, (coefficient?.split(".")[1]?.length ?? 0) - Number(exponent));
}

function addNumericStep(value: number, delta: number) {
  const result = value + delta;
  const precision = Math.max(decimalPlaces(value), decimalPlaces(delta));
  return precision <= 100 ? Number(result.toFixed(precision)) : result;
}

function NumericInput({
  value,
  defaultValue = 0,
  onValueChange,
  unit,
  step = 1,
  smallStep = step / 10,
  largeStep = step * 10,
  min,
  max,
  displayPrecision,
  name,
  form,
  disabled,
  readOnly,
  className,
  inputClassName,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: NumericInputProps) {
  if ([step, smallStep, largeStep].some((amount) => !Number.isFinite(amount) || amount <= 0)) {
    throw new Error("NumericInput steps must be positive finite numbers.");
  }
  if (
    (min !== undefined && !Number.isFinite(min)) ||
    (max !== undefined && !Number.isFinite(max)) ||
    (min !== undefined && max !== undefined && min > max)
  ) {
    throw new Error("NumericInput constraints must be finite and min must not exceed max.");
  }
  if (
    displayPrecision !== undefined &&
    (!Number.isInteger(displayPrecision) || displayPrecision < 0 || displayPrecision > 100)
  ) {
    throw new Error("NumericInput displayPrecision must be an integer between 0 and 100.");
  }

  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [draft, setDraft] = React.useState<NumericDraft | null>(null);
  const [focused, setFocused] = React.useState(false);
  const suppliedValue = value === undefined ? internalValue : value;
  const currentValue =
    suppliedValue !== null && Number.isFinite(suppliedValue) ? suppliedValue : null;
  if (draft !== null && !Object.is(draft.authoritativeValue, currentValue)) {
    setDraft(null);
  }
  const currentDraft =
    draft !== null && Object.is(draft.authoritativeValue, currentValue) ? draft : null;
  const displayValue =
    currentValue === null
      ? ""
      : focused || displayPrecision === undefined
        ? String(currentValue)
        : currentValue.toFixed(displayPrecision);

  function constrain(nextValue: number) {
    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, nextValue));
  }

  function commit(nextValue: number) {
    if (disabled || readOnly || !Number.isFinite(nextValue)) return;
    const constrained = constrain(nextValue);
    if (value === undefined) setInternalValue(constrained);
    if (!Object.is(constrained, currentValue)) onValueChange?.(constrained);
  }

  function commitDraft() {
    if (currentDraft !== null) {
      const parsed = parseNumericDraft(currentDraft.text);
      if (parsed !== null) commit(parsed);
    }
    setDraft(null);
  }

  return (
    <InputGroup data-slot="numeric-input" className={cn("min-w-0", className)}>
      <InputGroupInput
        {...props}
        name={undefined}
        form={form}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        disabled={disabled}
        readOnly={readOnly}
        value={currentDraft?.text ?? displayValue}
        aria-valuenow={currentValue ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={
          currentValue === null ? undefined : `${currentValue}${unit ? ` ${unit}` : ""}`
        }
        className={cn("tabular-nums", inputClassName)}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onChange={(event) => {
          if (disabled || readOnly) return;
          const text = event.currentTarget.value;
          const parsed = parseNumericDraft(text);
          const accepted = parsed !== null && parsed === constrain(parsed);
          setDraft({ text, authoritativeValue: accepted ? parsed : currentValue });
          if (accepted) commit(parsed);
        }}
        onBlur={(event) => {
          commitDraft();
          setFocused(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled || readOnly) return;
          if (event.key === "Enter") {
            event.preventDefault();
            commitDraft();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setDraft(null);
            return;
          }
          const amount = event.altKey ? smallStep : event.shiftKey ? largeStep : step;
          const base =
            (currentDraft && parseNumericDraft(currentDraft.text)) ?? currentValue ?? min ?? 0;
          let nextValue: number;
          switch (event.key) {
            case "ArrowUp":
              nextValue = addNumericStep(base, amount);
              break;
            case "ArrowDown":
              nextValue = addNumericStep(base, -amount);
              break;
            case "PageUp":
              nextValue = addNumericStep(base, largeStep);
              break;
            case "PageDown":
              nextValue = addNumericStep(base, -largeStep);
              break;
            case "Home":
              if (min === undefined) return;
              nextValue = min;
              break;
            case "End":
              if (max === undefined) return;
              nextValue = max;
              break;
            default:
              return;
          }
          event.preventDefault();
          commit(nextValue);
          setDraft(null);
        }}
      />
      {name ? (
        <input
          type="hidden"
          name={name}
          form={form}
          disabled={disabled}
          value={currentValue ?? ""}
        />
      ) : null}
      {unit ? (
        <InputGroupAddon align="inline-end">
          <InputGroupText aria-hidden="true">{unit}</InputGroupText>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export { NumericInput };
export type { NumericInputProps };

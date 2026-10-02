"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { NumericInput, type NumericInputProps } from "./numeric-input";

type Vector2 = readonly [number, number];
type Vector3 = readonly [number, number, number];

type VectorInputProps = Omit<React.ComponentProps<"div">, "onChange"> &
  Pick<
    NumericInputProps,
    | "unit"
    | "step"
    | "smallStep"
    | "largeStep"
    | "min"
    | "max"
    | "displayPrecision"
    | "disabled"
    | "readOnly"
  > & {
    label: string;
  };

type Vector2InputProps = VectorInputProps & {
  value: Vector2;
  onValueChange: (value: Vector2) => void;
};

type Vector3InputProps = VectorInputProps & {
  value: Vector3;
  onValueChange: (value: Vector3) => void;
};

function VectorInputs({
  label,
  value,
  onAxisValueChange,
  unit,
  step,
  smallStep,
  largeStep,
  min,
  max,
  displayPrecision,
  disabled,
  readOnly,
  className,
  ...props
}: VectorInputProps & {
  value: Vector2 | Vector3;
  onAxisValueChange: (axis: number, value: number) => void;
}) {
  return (
    <div
      {...props}
      data-slot="vector-input"
      role="group"
      aria-label={label}
      className={cn("flex min-w-0 gap-2", className)}
    >
      {value.map((coordinate, index) => (
        <div key={index} className="grid min-w-0 flex-1 gap-1">
          <span aria-hidden="true" className="text-xs font-medium text-muted-foreground">
            {"XYZ".charAt(index)}
          </span>
          <NumericInput
            unit={unit}
            step={step}
            smallStep={smallStep}
            largeStep={largeStep}
            min={min}
            max={max}
            displayPrecision={displayPrecision}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={`${label} ${"XYZ".charAt(index)}`}
            value={coordinate}
            onValueChange={(nextValue) => onAxisValueChange(index, nextValue)}
          />
        </div>
      ))}
    </div>
  );
}

function Vector2Input({ value, onValueChange, ...props }: Vector2InputProps) {
  return (
    <VectorInputs
      {...props}
      value={value}
      onAxisValueChange={(axis, nextValue) =>
        onValueChange([axis === 0 ? nextValue : value[0], axis === 1 ? nextValue : value[1]])
      }
    />
  );
}

function Vector3Input({ value, onValueChange, ...props }: Vector3InputProps) {
  return (
    <VectorInputs
      {...props}
      value={value}
      onAxisValueChange={(axis, nextValue) =>
        onValueChange([
          axis === 0 ? nextValue : value[0],
          axis === 1 ? nextValue : value[1],
          axis === 2 ? nextValue : value[2],
        ])
      }
    />
  );
}

export { Vector2Input, Vector3Input };
export type { Vector2, Vector3, Vector2InputProps, Vector3InputProps };

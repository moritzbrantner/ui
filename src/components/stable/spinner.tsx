import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/cn";

const spinnerVariants = cva(
  "shrink-0 text-current [animation:ui-triquetra-spinner_1.8s_cubic-bezier(0.45,0,0.2,1)_infinite]",
  {
    variants: {
      size: {
        xs: "size-3",
        sm: "size-4",
        default: "size-5",
        lg: "size-6",
        xl: "size-8",
      },
      variant: {
        default: "text-current",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        destructive: "text-destructive",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
  },
);

const dotsSpinnerVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 text-current",
  {
    variants: {
      size: {
        xs: "h-3 [--spinner-dot-size:0.1875rem]",
        sm: "h-4 [--spinner-dot-size:0.25rem]",
        default: "h-5 [--spinner-dot-size:0.3125rem]",
        lg: "h-6 [--spinner-dot-size:0.375rem]",
        xl: "h-8 gap-1.5 [--spinner-dot-size:0.5rem]",
      },
      variant: {
        default: "text-current",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary-foreground",
        destructive: "text-destructive",
      },
    },
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
  },
);

const pulseSpinnerVariants = cva("relative inline-flex shrink-0 text-current", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      default: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    variant: {
      default: "text-current",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "default",
  },
});

const geometricSpinnerVariants = cva("shrink-0 text-current", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      default: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    variant: {
      default: "text-current",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "default",
  },
});

type SpinnerAccessibilityProps = {
  label?: string;
  decorative?: boolean;
};

type SpinnerProps = React.ComponentProps<"svg"> &
  VariantProps<typeof spinnerVariants> &
  SpinnerAccessibilityProps;

type DotsSpinnerProps = React.ComponentProps<"span"> &
  VariantProps<typeof dotsSpinnerVariants> &
  SpinnerAccessibilityProps;

type PulseSpinnerProps = React.ComponentProps<"span"> &
  VariantProps<typeof pulseSpinnerVariants> &
  SpinnerAccessibilityProps;

type GeometricSpinnerProps = React.ComponentProps<"svg"> &
  VariantProps<typeof geometricSpinnerVariants> &
  SpinnerAccessibilityProps;

const TRIQUETRA_LOOP_PATH =
  "M32 10C40 10 46 16 46 24C46 33 39 42 32 52C25 42 18 33 18 24C18 16 24 10 32 10Z";
const TRIQUETRA_CIRCLE_PATH =
  "M32 10C44.15 10 54 19.85 54 32C54 44.15 44.15 54 32 54C19.85 54 10 44.15 10 32C10 19.85 19.85 10 32 10Z";
const TRIQUETRA_ROTATIONS = [0, 120, 240] as const;
const ORBIT_DOTS = [
  { cx: 32, cy: 10, r: 5.5, opacity: 1 },
  { cx: 50, cy: 42, r: 4.5, opacity: 0.72 },
  { cx: 14, cy: 42, r: 3.75, opacity: 0.44 },
] as const;
const BLOCK_POSITIONS = [
  { x: 22, y: 22, delay: "0s" },
  { x: 42, y: 22, delay: "0.18s" },
  { x: 42, y: 42, delay: "0.36s" },
  { x: 22, y: 42, delay: "0.54s" },
] as const;

function getLoadingA11yProps({
  ariaLabel,
  decorative,
  label = "Loading",
}: {
  ariaLabel?: string;
  decorative?: boolean | null;
  label?: string | null;
}) {
  return decorative
    ? { "aria-hidden": true }
    : { role: "status", "aria-label": ariaLabel ?? label ?? "Loading" };
}

function Spinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  strokeWidth = 4,
  ...props
}: SpinnerProps) {
  return (
    <svg
      data-slot="spinner"
      data-size={size}
      data-variant={variant}
      className={cn(spinnerVariants({ size, variant }), className)}
      viewBox="0 0 64 64"
      fill="none"
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {TRIQUETRA_ROTATIONS.map((rotation) => (
          <path
            key={rotation}
            data-slot="spinner-loop"
            d={TRIQUETRA_LOOP_PATH}
            transform={rotation === 0 ? undefined : `rotate(${rotation} 32 32)`}
            opacity={rotation === 0 ? 1 : 0.8}
          >
            <animate
              attributeName="d"
              dur="1.8s"
              repeatCount="indefinite"
              values={`${TRIQUETRA_LOOP_PATH};${TRIQUETRA_CIRCLE_PATH};${TRIQUETRA_LOOP_PATH}`}
              keyTimes="0;0.5;1"
              calcMode="spline"
              keySplines="0.45 0 0.2 1;0.45 0 0.2 1"
            />
          </path>
        ))}
        <circle cx="32" cy="32" r="7" opacity="0.32" />
      </g>
    </svg>
  );
}

function DotsSpinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  ...props
}: DotsSpinnerProps) {
  return (
    <span
      data-slot="dots-spinner"
      data-size={size}
      data-variant={variant}
      className={cn(dotsSpinnerVariants({ size, variant }), className)}
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          data-slot="dots-spinner-dot"
          className="size-[var(--spinner-dot-size)] rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  );
}

function PulseSpinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  ...props
}: PulseSpinnerProps) {
  return (
    <span
      data-slot="pulse-spinner"
      data-size={size}
      data-variant={variant}
      className={cn(pulseSpinnerVariants({ size, variant }), className)}
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
      <span className="relative inline-flex size-full rounded-full bg-current" />
    </span>
  );
}

function OrbitSpinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  strokeWidth = 4,
  ...props
}: GeometricSpinnerProps) {
  return (
    <svg
      data-slot="orbit-spinner"
      data-size={size}
      data-variant={variant}
      className={cn(geometricSpinnerVariants({ size, variant }), className)}
      viewBox="0 0 64 64"
      fill="none"
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      <circle
        cx="32"
        cy="32"
        r="21"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.18"
      />
      <g data-slot="orbit-spinner-dots" fill="currentColor">
        <animateTransform
          attributeName="transform"
          dur="1.35s"
          from="0 32 32"
          repeatCount="indefinite"
          to="360 32 32"
          type="rotate"
        />
        {ORBIT_DOTS.map((dot) => (
          <circle key={`${dot.cx}-${dot.cy}`} {...dot} />
        ))}
      </g>
    </svg>
  );
}

function BlocksSpinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  ...props
}: GeometricSpinnerProps) {
  return (
    <svg
      data-slot="blocks-spinner"
      data-size={size}
      data-variant={variant}
      className={cn(geometricSpinnerVariants({ size, variant }), className)}
      viewBox="0 0 64 64"
      fill="currentColor"
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      <g data-slot="blocks-spinner-grid">
        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1.6s"
          keySplines="0.45 0 0.2 1"
          keyTimes="0;1"
          repeatCount="indefinite"
          type="rotate"
          values="0 32 32;90 32 32"
        />
        {BLOCK_POSITIONS.map((block) => (
          <g
            key={`${block.x}-${block.y}`}
            data-slot="blocks-spinner-block"
            transform={`translate(${block.x} ${block.y})`}
          >
            <rect height="16" rx="3" width="16" x="-8" y="-8">
              <animate
                attributeName="opacity"
                begin={block.delay}
                dur="1.44s"
                repeatCount="indefinite"
                values="0.35;1;0.35"
              />
            </rect>
            <animateTransform
              attributeName="transform"
              additive="sum"
              begin={block.delay}
              dur="1.44s"
              repeatCount="indefinite"
              type="scale"
              values="0.82;1;0.82"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

function PolygonSpinner({
  className,
  size = "sm",
  variant = "default",
  label = "Loading",
  decorative,
  "aria-label": ariaLabel,
  strokeWidth = 4,
  ...props
}: GeometricSpinnerProps) {
  return (
    <svg
      data-slot="polygon-spinner"
      data-size={size}
      data-variant={variant}
      className={cn(geometricSpinnerVariants({ size, variant }), className)}
      viewBox="0 0 64 64"
      fill="none"
      {...getLoadingA11yProps({ ariaLabel, decorative, label })}
      {...props}
    >
      <g
        data-slot="polygon-spinner-mark"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        <animateTransform
          attributeName="transform"
          calcMode="spline"
          dur="1.9s"
          keySplines="0.45 0 0.2 1"
          keyTimes="0;1"
          repeatCount="indefinite"
          type="rotate"
          values="0 32 32;360 32 32"
        />
        <polygon
          data-slot="polygon-spinner-shape"
          fill="currentColor"
          fillOpacity="0.16"
          points="32 8 53 44 11 44"
        >
          <animate
            attributeName="points"
            calcMode="spline"
            dur="1.9s"
            keySplines="0.45 0 0.2 1;0.45 0 0.2 1"
            keyTimes="0;0.5;1"
            repeatCount="indefinite"
            values="32 8 53 44 11 44;32 7 56 32 32 57 8 32;32 8 53 44 11 44"
          />
        </polygon>
        <polyline points="32 8 32 32 53 44" opacity="0.58" />
        <polyline points="32 32 11 44" opacity="0.58" />
      </g>
    </svg>
  );
}

export {
  BlocksSpinner,
  DotsSpinner,
  OrbitSpinner,
  PolygonSpinner,
  PulseSpinner,
  Spinner,
  dotsSpinnerVariants,
  geometricSpinnerVariants,
  pulseSpinnerVariants,
  spinnerVariants,
};
export type { DotsSpinnerProps, GeometricSpinnerProps, PulseSpinnerProps, SpinnerProps };

export type BlocksSpinnerProps = React.ComponentProps<typeof BlocksSpinner>;
export type OrbitSpinnerProps = React.ComponentProps<typeof OrbitSpinner>;
export type PolygonSpinnerProps = React.ComponentProps<typeof PolygonSpinner>;

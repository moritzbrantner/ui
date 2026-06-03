"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { cn } from "../../lib/cn";

export type ThemeMode = "light" | "dark";

type ThemeModeSwitchProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children" | "defaultValue" | "onChange" | "value"
> & {
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  lightLabel?: string;
  darkLabel?: string;
};

function ThemeModeSwitch({
  mode,
  defaultMode = "light",
  onModeChange,
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
  className,
  disabled,
  onClick,
  type = "button",
  "aria-label": ariaLabel = "Color mode",
  ...props
}: ThemeModeSwitchProps) {
  const [internalMode, setInternalMode] = React.useState<ThemeMode>(defaultMode);
  const currentMode = mode ?? internalMode;
  const checked = currentMode === "dark";

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || disabled) {
        return;
      }

      const nextMode: ThemeMode = checked ? "light" : "dark";

      if (mode === undefined) {
        setInternalMode(nextMode);
      }

      onModeChange?.(nextMode);
    },
    [checked, disabled, mode, onClick, onModeChange],
  );

  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-description={checked ? darkLabel : lightLabel}
      data-slot="theme-mode-switch"
      data-mode={currentMode}
      disabled={disabled}
      className={cn(
        "group/theme-mode-switch relative isolate inline-grid h-10 w-16 shrink-0 grid-cols-2 items-center rounded-md border border-border bg-background p-1 text-muted-foreground shadow-[0_10px_24px_-18px_rgb(15_23_42_/_0.42)] transition-[background-color,border-color,box-shadow,transform] duration-150 outline-none hover:-translate-y-[1px] hover:border-primary/35 hover:bg-accent/45 hover:shadow-[0_16px_30px_-20px_rgb(15_23_42_/_0.5)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[mode=dark]:border-primary/35 data-[mode=dark]:bg-accent/55 data-[mode=dark]:shadow-[0_16px_30px_-22px_rgb(15_23_42_/_0.58)] dark:bg-input/30 dark:hover:bg-input/50 dark:data-[mode=dark]:bg-input/60",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 z-0 w-7 rounded-[var(--ui-radius-control)] border border-border/70 bg-background shadow-sm transition-transform duration-200 group-data-[mode=dark]/theme-mode-switch:translate-x-7 group-data-[mode=dark]/theme-mode-switch:border-primary/25 dark:bg-background/90 dark:group-data-[mode=dark]/theme-mode-switch:bg-background/80"
      />
      <span
        aria-hidden="true"
        data-slot="theme-mode-switch-light-icon"
        className="relative z-10 grid size-7 place-items-center rounded-[var(--ui-radius-control)] text-foreground transition-colors duration-150 group-data-[mode=dark]/theme-mode-switch:text-muted-foreground"
      >
        <SunIcon className="size-4" strokeWidth={1.75} />
      </span>
      <span
        aria-hidden="true"
        data-slot="theme-mode-switch-dark-icon"
        className="relative z-10 grid size-7 place-items-center rounded-[var(--ui-radius-control)] text-muted-foreground transition-colors duration-150 group-data-[mode=dark]/theme-mode-switch:text-foreground"
      >
        <MoonIcon className="size-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}

export { ThemeModeSwitch };
export type { ThemeModeSwitchProps };

"use client";

import * as React from "react";

import { cn } from "../lib/cn";
import type { UiThemeConfig } from "../theme-config";

type ScopedThemeProps = React.ComponentProps<"div">;

function createScopedThemeComponent(theme: UiThemeConfig) {
  function ScopedTheme({ className, ...props }: ScopedThemeProps) {
    return <div data-ui-theme={theme.name} className={cn(theme.className, className)} {...props} />;
  }

  return ScopedTheme;
}

export { createScopedThemeComponent };
export type { ScopedThemeProps };

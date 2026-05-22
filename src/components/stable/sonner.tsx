"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

type UiToasterProps = ToasterProps & {
  "data-slot"?: string;
};

const Toaster = ({ theme: themeProp, className, ...props }: UiToasterProps) => {
  const { theme = "system" } = useTheme();
  const resolvedTheme = themeProp ?? (theme as ToasterProps["theme"]);

  return (
    <Sonner
      data-slot="toaster"
      theme={resolvedTheme}
      className={className ? `toaster group ${className}` : "toaster group"}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export type { UiToasterProps as ToasterProps };

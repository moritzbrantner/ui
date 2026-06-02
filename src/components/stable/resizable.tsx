"use client";

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../../lib/cn";

function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full aria-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("min-h-0 min-w-0", className)}
      {...props}
    />
  );
}

function setElementRef(
  elementRef: ResizablePrimitive.SeparatorProps["elementRef"] | undefined,
  element: HTMLDivElement | null,
) {
  if (!elementRef) return;

  if (typeof elementRef === "function") {
    elementRef(element);
    return;
  }

  (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
}

function hideDecorativeSeparator(element: HTMLDivElement) {
  const orientation = element.getAttribute("aria-orientation");

  if (orientation) {
    element.setAttribute("data-orientation", orientation);
  }

  element.setAttribute("aria-hidden", "true");
  element.removeAttribute("aria-controls");
  element.removeAttribute("aria-disabled");
  element.removeAttribute("aria-orientation");
  element.removeAttribute("aria-valuemax");
  element.removeAttribute("aria-valuemin");
  element.removeAttribute("aria-valuenow");
  element.removeAttribute("role");
  element.removeAttribute("tabindex");
}

function ResizableHandle({
  withHandle,
  decorative,
  elementRef,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
  decorative?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      elementRef={(element) => {
        if (decorative && element) {
          hideDecorativeSeparator(element);
        }
        setElementRef(elementRef, element);
      }}
      className={cn(
        "relative z-20 -mx-[19.5px] flex min-h-10 w-10 cursor-col-resize items-center justify-center bg-transparent ring-offset-background pointer-events-auto! after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:-my-[19.5px] aria-[orientation=horizontal]:mx-0 aria-[orientation=horizontal]:h-10 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-px aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 data-[orientation=horizontal]:-my-[19.5px] data-[orientation=horizontal]:mx-0 data-[orientation=horizontal]:h-10 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-row-resize data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:top-1/2 data-[orientation=horizontal]:after:h-px data-[orientation=horizontal]:after:w-full data-[orientation=horizontal]:after:translate-x-0 data-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90 [&[data-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };

export type ResizableHandleProps = React.ComponentProps<typeof ResizableHandle>;
export type ResizablePanelProps = React.ComponentProps<typeof ResizablePanel>;
export type ResizablePanelGroupProps = React.ComponentProps<typeof ResizablePanelGroup>;

"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../stable/collapsible";

type DisclosurePanelProps = Omit<React.ComponentProps<typeof Collapsible>, "children"> & {
  title: React.ReactNode;
  count?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  contentClassName?: string;
};

function DisclosurePanel({
  title,
  count,
  actions,
  children,
  className,
  contentClassName,
  defaultOpen,
  ...props
}: DisclosurePanelProps) {
  const hasCount = count !== undefined && count !== null && count !== false;

  return (
    <Collapsible
      data-slot="disclosure-panel"
      defaultOpen={defaultOpen}
      className={cn(
        "group/disclosure-panel rounded-md border border-border/70 bg-card/70 text-card-foreground",
        className,
      )}
      {...props}
    >
      <div
        data-slot="disclosure-panel-header"
        className="flex min-w-0 items-center gap-2 border-border/60 p-2.5 group-data-[state=open]/disclosure-panel:border-b"
      >
        <CollapsibleTrigger
          data-slot="disclosure-panel-trigger"
          className="group/disclosure-panel-trigger flex min-w-0 flex-1 items-center gap-2 rounded-md text-left text-sm font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRightIcon
            data-slot="disclosure-panel-trigger-icon"
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]/disclosure-panel-trigger:rotate-90"
          />
          <span data-slot="disclosure-panel-title" className="min-w-0 truncate">
            {title}
          </span>
          {hasCount ? (
            <span
              data-slot="disclosure-panel-count"
              className="shrink-0 rounded-md border border-border/70 bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
            >
              {count}
            </span>
          ) : null}
        </CollapsibleTrigger>
        {actions ? (
          <div data-slot="disclosure-panel-actions" className="flex shrink-0 items-center gap-1">
            {actions}
          </div>
        ) : null}
      </div>
      <CollapsibleContent
        data-slot="disclosure-panel-content"
        className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
      >
        <div className={cn("min-w-0 p-3 text-sm", contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const CollapsibleSection = DisclosurePanel;

export { CollapsibleSection, DisclosurePanel };
export type { DisclosurePanelProps };
export type CollapsibleSectionProps = DisclosurePanelProps;

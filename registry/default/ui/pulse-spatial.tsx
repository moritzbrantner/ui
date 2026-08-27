"use client";

import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

import { cn } from "@/registry/default/lib/cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/ui/dialog";

type MorphingDialogProps = Omit<React.ComponentProps<"div">, "title"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

function MorphingDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  actions,
  className,
  children,
  ...props
}: MorphingDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  const reduce = useReducedMotion();
  const instanceId = React.useId();
  const layoutId = `pulse-morphing-dialog-${instanceId}`;
  const titleId = `pulse-morphing-dialog-title-${instanceId}`;
  const descriptionId = `pulse-morphing-dialog-description-${instanceId}`;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <LayoutGroup>
      <div data-slot="morphing-dialog" className={className} {...props}>
        <Dialog open={resolvedOpen} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <motion.button
              type="button"
              layoutId={layoutId}
              className="min-h-10 rounded-[var(--ui-radius-control)] border bg-card px-3 py-2 text-sm font-medium"
            >
              {trigger}
            </motion.button>
          </DialogTrigger>
          <DialogContent
            asChild
            showCloseButton={false}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className="w-full max-w-lg gap-4 border bg-card p-5 shadow-[var(--ui-shadow-interactive)] sm:max-w-lg"
          >
            <motion.section
              layoutId={layoutId}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 460, damping: 32 }}
            >
              <div className="grid gap-1">
                <DialogTitle id={titleId} className="text-lg font-semibold">
                  {title}
                </DialogTitle>
                {description ? (
                  <DialogDescription id={descriptionId}>{description}</DialogDescription>
                ) : null}
              </div>
              <div>{children}</div>
              <div className="flex flex-wrap justify-end gap-2">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="h-10 rounded-[var(--ui-radius-control)] border px-3 text-sm"
                  >
                    Close
                  </button>
                </DialogClose>
                {actions}
              </div>
            </motion.section>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutGroup>
  );
}

type KineticListItem = {
  id: string;
  content: React.ReactNode;
};

type KineticListProps = React.ComponentProps<"div"> & {
  items: readonly KineticListItem[];
  renderItem?: (item: KineticListItem) => React.ReactNode;
};

function KineticList({ items, renderItem, className, ...props }: KineticListProps) {
  const reduce = useReducedMotion();
  return (
    <LayoutGroup>
      <div data-slot="kinetic-list" className={cn("grid gap-2", className)} {...props}>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 18, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
              className="rounded-[var(--ui-radius-control)] border bg-card p-3"
            >
              {renderItem ? renderItem(item) : item.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

type SpatialSegment = {
  id: string;
  label: React.ReactNode;
};

type SpatialSegmentedControlProps = React.ComponentProps<"div"> & {
  items: readonly SpatialSegment[];
  value: string;
  onValueChange?: (value: string) => void;
};

function SpatialSegmentedControl({
  items,
  value,
  onValueChange,
  className,
  ...props
}: SpatialSegmentedControlProps) {
  const reduce = useReducedMotion();
  const instanceId = React.useId();
  const layoutId = `pulse-spatial-segment-${instanceId}`;
  return (
    <div
      data-slot="spatial-segmented-control"
      role="radiogroup"
      className={cn(
        "inline-grid grid-flow-col rounded-[var(--ui-radius-surface)] border bg-muted/45 p-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange?.(item.id)}
            className="relative isolate h-10 min-w-20 rounded-[var(--ui-radius-control)] px-3 text-sm font-medium"
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-[var(--ui-radius-control)] bg-background shadow-sm"
                transition={
                  reduce ? { duration: 0 } : { type: "spring", stiffness: 540, damping: 34 }
                }
              />
            ) : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

type ExpandingCardProps = Omit<HTMLMotionProps<"article">, "children" | "title"> & {
  children?: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  title: React.ReactNode;
  summary?: React.ReactNode;
  actions?: React.ReactNode;
};

function ExpandingCard({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  title,
  summary,
  actions,
  className,
  children,
  ...props
}: ExpandingCardProps) {
  const [internal, setInternal] = React.useState(defaultExpanded);
  const resolved = expanded ?? internal;
  const reduce = useReducedMotion();
  const setExpanded = (next: boolean) => {
    if (expanded === undefined) setInternal(next);
    onExpandedChange?.(next);
  };

  return (
    <motion.article
      data-slot="expanding-card"
      layout={!reduce}
      className={cn("grid gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-4", className)}
      {...props}
    >
      <button
        type="button"
        aria-expanded={resolved}
        onClick={() => setExpanded(!resolved)}
        className="flex min-h-10 items-start justify-between gap-4 text-left"
      >
        <span className="grid gap-1">
          <span className="font-semibold">{title}</span>
          {summary ? <span className="text-sm text-muted-foreground">{summary}</span> : null}
        </span>
        <motion.span aria-hidden="true" animate={{ rotate: resolved ? 180 : 0 }}>
          ⌄
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {resolved ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 border-t pt-3">
              {children}
              {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

type KineticBreadcrumb = {
  id: string;
  label: React.ReactNode;
};

type KineticBreadcrumbsProps = React.ComponentProps<"nav"> & {
  items: readonly KineticBreadcrumb[];
  onSelect?: (id: string) => void;
};

function KineticBreadcrumbs({ items, onSelect, className, ...props }: KineticBreadcrumbsProps) {
  return (
    <LayoutGroup>
      <nav
        data-slot="kinetic-breadcrumbs"
        aria-label="Breadcrumb"
        className={cn("flex min-w-0 items-center gap-1 overflow-hidden text-sm", className)}
        {...props}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div key={item.id} layout className="inline-flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <span aria-hidden="true" className="text-muted-foreground">
                  ›
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onSelect?.(item.id)}
                className={cn(
                  "min-h-10 max-w-40 truncate rounded px-1.5 py-1",
                  index === items.length - 1
                    ? "font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>
    </LayoutGroup>
  );
}

type PanelStackItem = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
};

type PanelStackProps = React.ComponentProps<"div"> & {
  panels: readonly PanelStackItem[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
};

function PanelStack({
  panels,
  activeIndex,
  onActiveIndexChange,
  className,
  ...props
}: PanelStackProps) {
  const reduce = useReducedMotion();
  const clamped = Math.min(Math.max(activeIndex, 0), Math.max(panels.length - 1, 0));
  const panel = panels[clamped];

  return (
    <div data-slot="panel-stack" className={cn("grid gap-3", className)} {...props}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={clamped <= 0}
          onClick={() => onActiveIndexChange?.(clamped - 1)}
          className="h-10 rounded-[var(--ui-radius-control)] border px-2 text-xs disabled:opacity-40"
        >
          Back
        </button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {panels.length ? `${clamped + 1} / ${panels.length}` : "0 / 0"}
        </span>
        <button
          type="button"
          disabled={clamped >= panels.length - 1}
          onClick={() => onActiveIndexChange?.(clamped + 1)}
          className="h-10 rounded-[var(--ui-radius-control)] border px-2 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <div className="relative min-h-40 overflow-hidden rounded-[var(--ui-radius-surface)] border bg-card">
        <AnimatePresence initial={false} mode="wait">
          {panel ? (
            <motion.section
              key={panel.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 460, damping: 34 }}
              className="grid gap-3 p-4"
            >
              <h2 className="font-semibold">{panel.title}</h2>
              <div>{panel.content}</div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export {
  ExpandingCard,
  KineticBreadcrumbs,
  KineticList,
  MorphingDialog,
  PanelStack,
  SpatialSegmentedControl,
};
export type {
  ExpandingCardProps,
  KineticBreadcrumb,
  KineticBreadcrumbsProps,
  KineticListItem,
  KineticListProps,
  MorphingDialogProps,
  PanelStackItem,
  PanelStackProps,
  SpatialSegment,
  SpatialSegmentedControlProps,
};

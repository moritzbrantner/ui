"use client";

import * as React from "react";

import { cn } from "@/registry/default/lib/cn";

const glassSurface =
  "border border-white/15 bg-card/70 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] supports-[backdrop-filter]:bg-card/55";

type GlassDockAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type GlassDockProps = React.ComponentProps<"nav"> & {
  actions: readonly GlassDockAction[];
  activeId?: string | null;
  onAction?: (id: string) => void;
};

function GlassDock({ actions, activeId = null, onAction, className, ...props }: GlassDockProps) {
  return (
    <nav
      data-slot="glass-dock"
      aria-label="Application dock"
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-[var(--ui-radius-overlay)] p-1.5",
        glassSurface,
        className,
      )}
      {...props}
    >
      {actions.map((action) => {
        const active = action.id === activeId;
        return (
          <button
            key={action.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onAction?.(action.id)}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-[var(--ui-radius-control)] px-2 text-xs font-medium transition",
              active
                ? "bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
                : "hover:bg-white/10",
            )}
          >
            {action.icon}
            <span className="sr-only sm:not-sr-only">{action.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

type CommandDeckItem = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: React.ReactNode;
  disabled?: boolean;
};

type CommandDeckProps = React.ComponentProps<"div"> & {
  items: readonly CommandDeckItem[];
  onCommand?: (id: string) => void;
};

function CommandDeck({ items, onCommand, className, ...props }: CommandDeckProps) {
  return (
    <div
      data-slot="command-deck"
      className={cn(
        "grid overflow-hidden rounded-[var(--ui-radius-overlay)] p-1.5",
        glassSurface,
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          onClick={() => onCommand?.(item.id)}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--ui-radius-control)] px-3 py-2 text-left transition hover:bg-white/10 disabled:opacity-40"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{item.label}</span>
            {item.description ? (
              <span className="block truncate text-xs text-muted-foreground">
                {item.description}
              </span>
            ) : null}
          </span>
          {item.shortcut ? (
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
              {item.shortcut}
            </kbd>
          ) : null}
        </button>
      ))}
    </div>
  );
}

type StatusCapsuleProps = React.ComponentProps<"div"> & {
  status?: "healthy" | "active" | "warning" | "critical";
  label: React.ReactNode;
  detail?: React.ReactNode;
};

function StatusCapsule({
  status = "healthy",
  label,
  detail,
  className,
  ...props
}: StatusCapsuleProps) {
  const color =
    status === "critical"
      ? "var(--live-alert)"
      : status === "warning"
        ? "var(--severity-medium)"
        : status === "active"
          ? "var(--live-active)"
          : "var(--live-healthy)";
  return (
    <div
      data-slot="status-capsule"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        glassSurface,
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full shadow-[0_0_10px_currentColor]"
        style={{ background: color, color }}
      />
      <span className="text-sm font-medium">{label}</span>
      {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
    </div>
  );
}

type LaunchCardProps = React.ComponentProps<"article"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  media?: React.ReactNode;
};

function LaunchCard({
  eyebrow,
  title,
  description,
  action,
  media,
  className,
  ...props
}: LaunchCardProps) {
  return (
    <article
      data-slot="launch-card"
      className={cn(
        "relative isolate grid min-h-56 overflow-hidden rounded-[var(--ui-radius-overlay)] p-5",
        glassSurface,
        className,
      )}
      {...props}
    >
      {media ? <div className="absolute inset-0 -z-10 opacity-40">{media}</div> : null}
      <div className="mt-auto grid gap-2">
        {eyebrow ? (
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </article>
  );
}

type QuickSwitcherItem = {
  id: string;
  label: string;
  detail?: React.ReactNode;
};

type QuickSwitcherProps = React.ComponentProps<"div"> & {
  items: readonly QuickSwitcherItem[];
  value?: string | null;
  onValueChange?: (id: string) => void;
  placeholder?: string;
};

function QuickSwitcher({
  items,
  value = null,
  onValueChange,
  placeholder = "Filter contexts…",
  className,
  ...props
}: QuickSwitcherProps) {
  const [query, setQuery] = React.useState("");
  const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      data-slot="quick-switcher"
      className={cn("grid gap-1 rounded-[var(--ui-radius-overlay)] p-1.5", glassSurface, className)}
      {...props}
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder={placeholder}
        className="h-9 rounded-[var(--ui-radius-control)] border border-white/15 bg-background/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <div role="listbox" aria-label="Contexts" className="grid max-h-56 overflow-y-auto">
        {filtered.map((item) => {
          const selected = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onValueChange?.(item.id)}
              className={cn(
                "grid min-h-10 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[var(--ui-radius-control)] px-3 py-2 text-left text-sm hover:bg-white/10",
                selected && "bg-white/10",
              )}
            >
              <span className="truncate font-medium">{item.label}</span>
              {item.detail ? (
                <span className="text-xs text-muted-foreground">{item.detail}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type HudMetric = {
  id: React.Key;
  label: React.ReactNode;
  value: React.ReactNode;
};

type HudPanelProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode;
  metrics: readonly HudMetric[];
  footer?: React.ReactNode;
};

function HudPanel({ title = "HUD", metrics, footer, className, ...props }: HudPanelProps) {
  return (
    <section
      data-slot="hud-panel"
      className={cn("grid gap-3 rounded-[var(--ui-radius-overlay)] p-3", glassSurface, className)}
      {...props}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-[var(--live-active)] shadow-[0_0_10px_var(--live-active)]"
        />
      </header>
      <dl className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div key={metric.id} className="grid gap-0.5">
            <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </dt>
            <dd className="text-lg font-semibold tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
      {footer ? (
        <footer className="border-t border-white/10 pt-2 text-xs text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

export { CommandDeck, GlassDock, HudPanel, LaunchCard, QuickSwitcher, StatusCapsule };
export type {
  CommandDeckItem,
  CommandDeckProps,
  GlassDockAction,
  GlassDockProps,
  HudMetric,
  HudPanelProps,
  LaunchCardProps,
  QuickSwitcherItem,
  QuickSwitcherProps,
  StatusCapsuleProps,
};

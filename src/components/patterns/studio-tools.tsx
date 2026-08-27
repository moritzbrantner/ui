"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

function formatTime(value: number) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type MediaTransportProps = React.ComponentProps<"div"> & {
  playing: boolean;
  currentTime: number;
  duration: number;
  onPlayingChange?: (playing: boolean) => void;
  onSeek?: (time: number) => void;
  onStep?: (direction: -1 | 1) => void;
  loop?: boolean;
  onLoopChange?: (loop: boolean) => void;
};

function MediaTransport({
  playing,
  currentTime,
  duration,
  onPlayingChange,
  onSeek,
  onStep,
  loop = false,
  onLoopChange,
  className,
  ...props
}: MediaTransportProps) {
  return (
    <div
      data-slot="media-transport"
      className={cn(
        "grid gap-2 rounded-[var(--ui-radius-surface)] border bg-[var(--editor-timeline)] p-2 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-10 min-w-10 rounded-[var(--ui-radius-control)] border px-2 text-xs"
          onClick={() => onStep?.(-1)}
        >
          −1f
        </button>
        <button
          type="button"
          className="h-10 rounded-[var(--ui-radius-control)] bg-primary px-3 text-sm font-medium text-primary-foreground"
          onClick={() => onPlayingChange?.(!playing)}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="h-10 min-w-10 rounded-[var(--ui-radius-control)] border px-2 text-xs"
          onClick={() => onStep?.(1)}
        >
          +1f
        </button>
        <button
          type="button"
          aria-pressed={loop}
          className={cn(
            "ml-auto h-10 rounded-[var(--ui-radius-control)] border px-2 text-xs",
            loop && "bg-accent",
          )}
          onClick={() => onLoopChange?.(!loop)}
        >
          Loop
        </button>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <input
          aria-label="Timeline position"
          type="range"
          min={0}
          max={Math.max(duration, 0)}
          step="any"
          value={Math.min(Math.max(currentTime, 0), Math.max(duration, 0))}
          onChange={(event) => onSeek?.(event.currentTarget.valueAsNumber)}
          className="h-9 w-full accent-[var(--editor-playhead)]"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

type TimelineSegment = {
  id: React.Key;
  label: React.ReactNode;
  start: number;
  end: number;
  color?: string;
};

type TimelineTrackProps = React.ComponentProps<"div"> & {
  duration: number;
  segments: readonly TimelineSegment[];
  selectedId?: React.Key | null;
  onSelect?: (id: React.Key) => void;
};

function TimelineTrack({
  duration,
  segments,
  selectedId = null,
  onSelect,
  className,
  ...props
}: TimelineTrackProps) {
  const safeDuration = duration > 0 ? duration : 1;

  return (
    <div
      data-slot="timeline-track"
      className={cn(
        "relative h-12 overflow-hidden rounded-[var(--ui-radius-control)] border bg-[var(--editor-timeline)]",
        className,
      )}
      {...props}
    >
      {segments.map((segment) => {
        const left = (Math.max(0, segment.start) / safeDuration) * 100;
        const width =
          ((Math.max(segment.end, segment.start) - Math.max(0, segment.start)) / safeDuration) *
          100;
        const selected = selectedId === segment.id;
        return (
          <button
            key={segment.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect?.(segment.id)}
            className={cn(
              "absolute inset-y-1 min-h-10 overflow-hidden rounded-[var(--ui-radius-control)] border px-2 text-left text-xs font-medium",
              selected && "ring-2 ring-[var(--editor-selection)] ring-offset-1",
            )}
            style={{
              left: `${Math.min(left, 100)}%`,
              width: `${Math.max(Math.min(width, 100 - left), 1)}%`,
              background: segment.color ?? "var(--editor-layer)",
            }}
          >
            <span className="block truncate">{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type PlayheadProps = React.ComponentProps<"div"> & {
  position: number;
};

function Playhead({ position, className, ...props }: PlayheadProps) {
  const clamped = Math.min(Math.max(position, 0), 1);
  return (
    <div
      data-slot="playhead"
      className={cn("pointer-events-none absolute inset-y-0 z-20 w-px", className)}
      style={{ left: `${clamped * 100}%` }}
      {...props}
    >
      <span className="absolute inset-y-0 left-0 w-px bg-[var(--editor-playhead)]" />
      <span className="absolute -top-0.5 -left-1 size-2 rotate-45 bg-[var(--editor-playhead)]" />
    </div>
  );
}

type ScrubberProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: number;
  onValueChange?: (value: number) => void;
};

function Scrubber({
  value,
  onValueChange,
  className,
  min = 0,
  max = 1,
  step = "any",
  ...props
}: ScrubberProps) {
  return (
    <input
      data-slot="scrubber"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onValueChange?.(event.currentTarget.valueAsNumber)}
      className={cn("h-9 w-full accent-[var(--editor-playhead)]", className)}
      {...props}
    />
  );
}

type StudioLayer = {
  id: React.Key;
  label: React.ReactNode;
  visible?: boolean;
  locked?: boolean;
  depth?: number;
};

type LayerStackProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  layers: readonly StudioLayer[];
  selectedId?: React.Key | null;
  onSelect?: (id: React.Key) => void;
  onVisibilityChange?: (id: React.Key, visible: boolean) => void;
  onLockChange?: (id: React.Key, locked: boolean) => void;
};

function LayerStack({
  layers,
  selectedId = null,
  onSelect,
  onVisibilityChange,
  onLockChange,
  className,
  ...props
}: LayerStackProps) {
  return (
    <div
      data-slot="layer-stack"
      className={cn("grid divide-y rounded-[var(--ui-radius-surface)] border bg-card", className)}
      {...props}
    >
      {layers.map((layer) => {
        const selected = selectedId === layer.id;
        return (
          <div
            key={layer.id}
            className={cn(
              "grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-1.5 px-2 py-1.5",
              selected && "bg-[var(--editor-selection)]",
            )}
          >
            <button
              type="button"
              aria-label={`${layer.visible === false ? "Show" : "Hide"} layer`}
              aria-pressed={layer.visible !== false}
              className="size-10 rounded-[var(--ui-radius-control)] text-xs"
              onClick={() => onVisibilityChange?.(layer.id, layer.visible === false)}
            >
              {layer.visible === false ? "○" : "●"}
            </button>
            <button
              type="button"
              aria-label={`${layer.locked ? "Unlock" : "Lock"} layer`}
              aria-pressed={layer.locked ?? false}
              className="size-10 rounded-[var(--ui-radius-control)] text-xs"
              onClick={() => onLockChange?.(layer.id, !layer.locked)}
            >
              {layer.locked ? "L" : "U"}
            </button>
            <button
              type="button"
              onClick={() => onSelect?.(layer.id)}
              className="min-h-10 min-w-0 rounded-[var(--ui-radius-control)] px-2 py-1 text-left text-sm"
              style={{ paddingLeft: `${0.5 + (layer.depth ?? 0) * 0.75}rem` }}
            >
              <span className="block truncate">{layer.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

type InspectorGroup = {
  id: React.Key;
  label: React.ReactNode;
  content: React.ReactNode;
};

type InspectorPanelProps = React.ComponentProps<"aside"> & {
  title?: React.ReactNode;
  groups: readonly InspectorGroup[];
};

function InspectorPanel({ title = "Inspector", groups, className, ...props }: InspectorPanelProps) {
  return (
    <aside
      data-slot="inspector-panel"
      className={cn(
        "grid content-start gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-3",
        className,
      )}
      {...props}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {groups.map((group) => (
        <section key={group.id} className="grid gap-2 border-t pt-2 first:border-t-0 first:pt-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <div className="grid gap-2">{group.content}</div>
        </section>
      ))}
    </aside>
  );
}

type StudioTool = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
};

type ToolShelfProps = React.ComponentProps<"div"> & {
  tools: readonly StudioTool[];
  activeTool?: string | null;
  onToolChange?: (tool: string) => void;
};

function ToolShelf({
  tools,
  activeTool = null,
  onToolChange,
  className,
  ...props
}: ToolShelfProps) {
  return (
    <div
      data-slot="tool-shelf"
      role="toolbar"
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-[var(--ui-radius-surface)] border bg-card p-1",
        className,
      )}
      {...props}
    >
      {tools.map((tool) => {
        const active = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            type="button"
            aria-pressed={active}
            title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
            onClick={() => onToolChange?.(tool.id)}
            className={cn(
              "inline-flex h-10 min-w-10 items-center gap-1.5 rounded-[var(--ui-radius-control)] px-2 text-xs font-medium",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {tool.icon}
            {tool.label}
          </button>
        );
      })}
    </div>
  );
}

type BeforeAfterProps = React.ComponentProps<"div"> & {
  before: React.ReactNode;
  after: React.ReactNode;
  value?: number;
  onValueChange?: (value: number) => void;
  beforeLabel?: string;
  afterLabel?: string;
};

function BeforeAfter({
  before,
  after,
  value,
  onValueChange,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
  ...props
}: BeforeAfterProps) {
  const [internalValue, setInternalValue] = React.useState(50);
  const resolved = value ?? internalValue;
  const setValue = (next: number) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <div data-slot="before-after" className={cn("grid gap-2", className)} {...props}>
      <div className="relative min-h-48 overflow-hidden rounded-[var(--ui-radius-surface)] border bg-[var(--editor-canvas)]">
        <div className="absolute inset-0">{before}</div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - resolved}% 0 0)` }}
        >
          {after}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[var(--editor-playhead)]"
          style={{ left: `${resolved}%` }}
        />
        <span className="absolute top-2 left-2 rounded bg-background/80 px-1.5 py-0.5 text-xs">
          {beforeLabel}
        </span>
        <span className="absolute top-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-xs">
          {afterLabel}
        </span>
      </div>
      <input
        aria-label="Before and after comparison"
        type="range"
        min={0}
        max={100}
        value={resolved}
        onChange={(event) => setValue(event.currentTarget.valueAsNumber)}
        className="h-9 w-full accent-[var(--editor-playhead)]"
      />
    </div>
  );
}

export {
  BeforeAfter,
  InspectorPanel,
  LayerStack,
  MediaTransport,
  Playhead,
  Scrubber,
  TimelineTrack,
  ToolShelf,
};
export type {
  BeforeAfterProps,
  InspectorGroup,
  InspectorPanelProps,
  LayerStackProps,
  MediaTransportProps,
  PlayheadProps,
  ScrubberProps,
  StudioLayer,
  StudioTool,
  TimelineSegment,
  TimelineTrackProps,
  ToolShelfProps,
};

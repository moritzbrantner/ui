"use client";

import * as React from "react";
import { ArrowRightIcon, CircleIcon, Maximize2Icon, Minimize2Icon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge } from "../stable/badge";

type WorkflowNodePort = {
  id: string;
  label: string;
  kind?: string;
  required?: boolean;
  description?: string;
  badge?: string;
  metadata?: Record<string, unknown>;
};

type WorkflowNodeData = {
  id: string;
  label: string;
  description?: string;
  kind?: string;
  category?: string;
  eyebrow?: string;
  packageLabel?: string;
  status?: "idle" | "running" | "success" | "error" | "warning" | string;
  tone?: "neutral" | "info" | "success" | "warning" | "error" | string;
  variant?: "default" | "compact";
  minimized?: boolean;
  tags?: string[];
  inputs?: WorkflowNodePort[];
  outputs?: WorkflowNodePort[];
  metadata?: Record<string, unknown>;
};

type WorkflowNodeSize = {
  width: number;
  height: number;
};

type WorkflowNodeProps = React.ComponentProps<"div"> & {
  node: WorkflowNodeData;
  selected?: boolean;
  readOnly?: boolean;
  inputDisabled?: boolean;
  outputDisabled?: boolean;
  onNodeSelect?: (node: WorkflowNodeData) => void;
  onMinimizedChange?: (node: WorkflowNodeData, minimized: boolean) => void;
  onInputClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  onOutputClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  getInputAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
  getOutputAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
};

const workflowNodeCompactWidth = 224;
const workflowNodeDefaultWidth = 248;
const workflowNodeMinimizedWidth = 192;
const workflowNodeCompactHeight = 84;
const workflowNodeMinimizedHeight = 52;
const workflowNodeHeaderHeight = 72;
const workflowNodeDescriptionHeight = 28;
const workflowNodePortRowHeight = 112;

function WorkflowNode({
  node,
  selected,
  readOnly = false,
  inputDisabled = false,
  outputDisabled = false,
  onNodeSelect,
  onMinimizedChange,
  onInputClick,
  onOutputClick,
  getInputAriaLabel,
  getOutputAriaLabel,
  className,
  style,
  ...props
}: WorkflowNodeProps) {
  const compact = workflowNodeUsesCompactVariant(node);
  const minimized = workflowNodeUsesMinimizedVariant(node);
  const size = getWorkflowNodeSize(node);

  return (
    <div
      data-slot="workflow-node"
      data-compact={compact ? "true" : undefined}
      data-minimized={minimized ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-status={node.status}
      className={cn(
        "relative flex flex-col overflow-visible rounded-xl border bg-card text-card-foreground shadow-sm transition-colors",
        "data-[selected=true]:border-primary data-[selected=true]:bg-primary/5",
        className,
      )}
      style={{ width: size.width, height: size.height, ...style }}
      {...props}
    >
      <div
        data-slot="workflow-node-header"
        className={cn(
          "shrink-0 overflow-hidden px-3 py-2",
          minimized ? "rounded-xl border-b-0" : "rounded-t-xl border-b",
          minimized ? "h-full" : compact ? "h-[48px]" : node.description ? "h-[100px]" : "h-[72px]",
          getWorkflowNodeToneClasses(node.tone ?? getWorkflowNodeToneFromStatus(node.status)),
        )}
      >
        <div
          className={cn("flex justify-between gap-3", minimized ? "items-center" : "items-start")}
        >
          <button
            type="button"
            data-slot="workflow-node-select"
            aria-label={node.label}
            className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onClick={(event) => {
              event.stopPropagation();
              onNodeSelect?.(node);
            }}
          >
            {(node.eyebrow ?? node.category ?? node.kind) ? (
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {node.eyebrow ?? node.category ?? node.kind}
              </div>
            ) : null}
            <div className="truncate text-sm font-semibold">{node.label}</div>
          </button>
          <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
            {node.status && !minimized ? (
              <Badge variant={getWorkflowNodeStatusVariant(node.status)}>{node.status}</Badge>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "block size-2.5 rounded-full",
                getWorkflowNodeToneDotClass(
                  node.tone ?? getWorkflowNodeToneFromStatus(node.status),
                ),
              )}
            />
            {onMinimizedChange ? (
              <button
                type="button"
                data-slot="workflow-node-minimize"
                aria-label={minimized ? `Expand ${node.label}` : `Minimize ${node.label}`}
                aria-pressed={minimized}
                className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-background/70 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onMinimizedChange(node, !minimized);
                }}
              >
                {minimized ? (
                  <Maximize2Icon className="size-3.5" aria-hidden="true" />
                ) : (
                  <Minimize2Icon className="size-3.5" aria-hidden="true" />
                )}
              </button>
            ) : null}
          </div>
        </div>
        {node.description && !compact && !minimized ? (
          <p className={cn("mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground")}>
            {node.description}
          </p>
        ) : null}
      </div>
      {minimized ? (
        <WorkflowNodeMinimizedPorts node={node} />
      ) : compact ? (
        <div
          data-slot="workflow-node-compact-ports"
          className="relative flex min-h-0 flex-1 items-center justify-center px-8 py-2 text-xs"
        >
          <WorkflowNodePortAnchor
            direction="input"
            node={node}
            port={(node.inputs ?? [])[0]}
            disabled={inputDisabled}
            onClick={onInputClick}
            getAriaLabel={getInputAriaLabel}
            compact
          />
          <div
            data-slot="workflow-node-summary"
            className="flex min-w-0 items-center justify-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <span className="truncate">{workflowNodeCompactPortSummary(node)}</span>
            <ArrowRightIcon className="size-3 shrink-0" aria-hidden="true" />
          </div>
          <WorkflowNodePortAnchor
            direction="output"
            node={node}
            port={(node.outputs ?? [])[0]}
            disabled={outputDisabled || readOnly}
            onClick={onOutputClick}
            getAriaLabel={getOutputAriaLabel}
            compact
          />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-2 text-xs">
          <WorkflowNodePortColumn
            title="Inputs"
            direction="input"
            node={node}
            ports={node.inputs ?? []}
            disabled={inputDisabled}
            onClick={onInputClick}
            getAriaLabel={getInputAriaLabel}
          />
          <WorkflowNodePortColumn
            title="Outputs"
            direction="output"
            node={node}
            ports={node.outputs ?? []}
            disabled={outputDisabled || readOnly}
            onClick={onOutputClick}
            getAriaLabel={getOutputAriaLabel}
          />
        </div>
      )}
    </div>
  );
}

function WorkflowNodeMinimizedPorts({ node }: { node: WorkflowNodeData }) {
  return (
    <>
      {(node.inputs?.length ?? 0) > 0 ? (
        <span
          data-slot="workflow-node-minimized-port"
          data-port-direction="input"
          className={cn(
            "absolute top-1/2 left-0 flex size-4 -translate-x-1/2 -translate-y-1/2",
            "items-center justify-center rounded-full border bg-card text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <CircleIcon className="size-2.5 fill-current" />
        </span>
      ) : null}
      {(node.outputs?.length ?? 0) > 0 ? (
        <span
          data-slot="workflow-node-minimized-port"
          data-port-direction="output"
          className={cn(
            "absolute top-1/2 right-0 flex size-4 translate-x-1/2 -translate-y-1/2",
            "items-center justify-center rounded-full border bg-card text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <CircleIcon className="size-2.5 fill-current" />
        </span>
      ) : null}
    </>
  );
}

function WorkflowNodePortColumn({
  title,
  direction,
  node,
  ports,
  disabled,
  onClick,
  getAriaLabel,
}: {
  title: string;
  direction: "input" | "output";
  node: WorkflowNodeData;
  ports: WorkflowNodePort[];
  disabled: boolean;
  onClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  getAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-1 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </div>
      {ports.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center rounded-lg border border-dashed px-2 py-1.5 text-muted-foreground">
          none
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-1">
          {ports.map((port) => (
            <WorkflowNodePortAnchor
              key={`${direction}-${port.id}`}
              direction={direction}
              node={node}
              port={port}
              disabled={disabled}
              onClick={onClick}
              getAriaLabel={getAriaLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowNodePortAnchor({
  direction,
  node,
  port,
  disabled,
  onClick,
  getAriaLabel,
  compact = false,
}: {
  direction: "input" | "output";
  node: WorkflowNodeData;
  port?: WorkflowNodePort;
  disabled: boolean;
  onClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  getAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
  compact?: boolean;
}) {
  const isInput = direction === "input";

  if (!port) {
    return (
      <div
        data-slot="workflow-node-port"
        data-port-direction={direction}
        className={cn(
          "flex min-h-0 items-center rounded-lg border border-dashed px-2 py-1.5 text-muted-foreground",
          compact && "h-full justify-center text-center",
        )}
      >
        none
      </div>
    );
  }

  return (
    <button
      type="button"
      data-slot="workflow-node-port"
      data-port-direction={direction}
      data-port-id={port.id}
      disabled={disabled || !onClick}
      aria-label={getAriaLabel?.(port, node) ?? `${node.label} ${port.label}`}
      className={cn(
        "relative block h-full min-h-0 w-full overflow-visible rounded-lg border px-2 py-1.5 text-left outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
        isInput
          ? "border-border/80 bg-muted/20 hover:bg-muted/40"
          : "border-border/80 bg-background hover:bg-muted/30",
        compact &&
          cn(
            "absolute top-1/2 size-6 rounded-full p-1.5",
            isInput
              ? "left-0 -translate-x-1/2 -translate-y-1/2"
              : "right-0 translate-x-1/2 -translate-y-1/2",
          ),
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(port, node);
      }}
    >
      <div
        className={cn(
          "flex h-full min-h-0 items-start gap-2",
          !isInput && !compact && "flex-row-reverse text-right",
          compact && "items-center justify-center",
        )}
      >
        <CircleIcon
          data-slot="workflow-node-port-dot"
          className={cn(
            "size-3 shrink-0 fill-current",
            !compact &&
              cn("absolute top-1/2 -translate-y-1/2", isInput ? "-left-3.5" : "-right-3.5"),
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "min-w-0 flex-1 overflow-hidden",
            compact && "sr-only",
            !isInput && !compact && "items-end",
          )}
        >
          <div className="truncate text-xs font-medium text-foreground">{port.label}</div>
          {compact ? null : (
            <div className={cn("mt-1 flex flex-wrap gap-1", !isInput && "justify-end")}>
              {port.kind ? <Badge variant="secondary">{port.kind}</Badge> : null}
              {port.badge ? <Badge variant="outline">{port.badge}</Badge> : null}
              {port.required ? <Badge variant="outline">required</Badge> : null}
            </div>
          )}
          {port.description && !compact ? <div className="sr-only">{port.description}</div> : null}
        </div>
      </div>
    </button>
  );
}

function workflowNodeCompactPortSummary(node: WorkflowNodeData) {
  const input = node.inputs?.[0];
  const output = node.outputs?.[0];

  if (input && output) {
    return `${workflowNodePortSummaryLabel(input)} to ${workflowNodePortSummaryLabel(output)}`;
  }

  if (input || output) {
    return workflowNodePortSummaryLabel(input ?? output);
  }

  return "No ports";
}

function workflowNodePortSummaryLabel(port: WorkflowNodePort | undefined) {
  if (!port) {
    return "port";
  }

  return port.kind ?? port.badge ?? port.label;
}

function workflowNodeUsesCompactVariant(node: WorkflowNodeData) {
  return node.variant === "compact";
}

function workflowNodeUsesMinimizedVariant(node: WorkflowNodeData) {
  return node.minimized === true;
}

function getWorkflowNodeSize(node: WorkflowNodeData): WorkflowNodeSize {
  if (workflowNodeUsesMinimizedVariant(node)) {
    return {
      width: workflowNodeMinimizedWidth,
      height: workflowNodeMinimizedHeight,
    };
  }

  if (workflowNodeUsesCompactVariant(node)) {
    return {
      width: workflowNodeCompactWidth,
      height: workflowNodeCompactHeight,
    };
  }

  const rows = Math.max(node.inputs?.length ?? 0, node.outputs?.length ?? 0, 1);
  const descriptionHeight = node.description ? workflowNodeDescriptionHeight : 0;

  return {
    width: workflowNodeDefaultWidth,
    height: workflowNodeHeaderHeight + descriptionHeight + rows * workflowNodePortRowHeight,
  };
}

function getWorkflowNodePortCenterOffset(node: WorkflowNodeData, portIndex: number) {
  if (workflowNodeUsesCompactVariant(node) || workflowNodeUsesMinimizedVariant(node)) {
    return getWorkflowNodeSize(node).height / 2;
  }

  const descriptionHeight = node.description ? workflowNodeDescriptionHeight : 0;

  return (
    workflowNodeHeaderHeight +
    descriptionHeight +
    portIndex * workflowNodePortRowHeight +
    workflowNodePortRowHeight / 2
  );
}

function getWorkflowNodeToneFromStatus(status?: string): WorkflowNodeData["tone"] {
  if (status === "success") {
    return "success";
  }
  if (status === "warning") {
    return "warning";
  }
  if (status === "error") {
    return "error";
  }
  if (status === "running") {
    return "info";
  }
  return "neutral";
}

function getWorkflowNodeToneClasses(tone?: WorkflowNodeData["tone"]) {
  if (tone === "success") {
    return "bg-emerald-500/8";
  }
  if (tone === "warning") {
    return "bg-amber-500/8";
  }
  if (tone === "error") {
    return "bg-destructive/10";
  }
  if (tone === "info") {
    return "bg-primary/10";
  }
  return "bg-muted/10";
}

function getWorkflowNodeToneDotClass(tone?: WorkflowNodeData["tone"]) {
  if (tone === "success") {
    return "bg-emerald-500";
  }
  if (tone === "warning") {
    return "bg-amber-500";
  }
  if (tone === "error") {
    return "bg-destructive";
  }
  if (tone === "info") {
    return "bg-blue-500";
  }
  return "bg-muted-foreground";
}

function getWorkflowNodeStatusVariant(
  status: string,
): React.ComponentProps<typeof Badge>["variant"] {
  if (status === "error") {
    return "destructive";
  }
  if (status === "running" || status === "success") {
    return "secondary";
  }
  return "outline";
}

export { WorkflowNode, getWorkflowNodePortCenterOffset, getWorkflowNodeSize };
export type { WorkflowNodeData, WorkflowNodePort, WorkflowNodeProps, WorkflowNodeSize };

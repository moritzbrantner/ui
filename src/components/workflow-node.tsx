"use client";

import * as React from "react";
import { ArrowRightIcon, CircleIcon } from "lucide-react";

import { cn } from "../lib/cn";
import { Badge } from "./badge";

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
  onInputClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  onOutputClick?: (port: WorkflowNodePort, node: WorkflowNodeData) => void;
  getInputAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
  getOutputAriaLabel?: (port: WorkflowNodePort, node: WorkflowNodeData) => string;
};

const workflowNodeCompactWidth = 224;
const workflowNodeDefaultWidth = 248;
const workflowNodeCompactHeight = 84;
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
  onInputClick,
  onOutputClick,
  getInputAriaLabel,
  getOutputAriaLabel,
  className,
  style,
  ...props
}: WorkflowNodeProps) {
  const compact = workflowNodeUsesCompactVariant(node);
  const size = getWorkflowNodeSize(node);

  return (
    <div
      data-slot="workflow-node"
      data-compact={compact ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-status={node.status}
      className={cn(
        "flex flex-col overflow-visible rounded-xl border bg-card text-card-foreground shadow-sm transition-colors",
        "data-[selected=true]:border-primary data-[selected=true]:bg-primary/5",
        compact ? "w-[224px]" : "w-[248px]",
        className,
      )}
      style={{ width: size.width, height: size.height, ...style }}
      {...props}
    >
      <div
        data-slot="workflow-node-header"
        className={cn(
          "shrink-0 overflow-hidden rounded-t-xl border-b px-3 py-2",
          compact
            ? "h-[48px]"
            : node.description
              ? "h-[100px]"
              : "h-[72px]",
          getWorkflowNodeToneClasses(node.tone ?? getWorkflowNodeToneFromStatus(node.status)),
        )}
      >
        <div className="flex items-start justify-between gap-3">
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
            {node.status ? (
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
          </div>
        </div>
        {node.description && !compact ? (
          <p
            className={cn(
              "mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground",
            )}
          >
            {node.description}
          </p>
        ) : null}
      </div>
      {compact ? (
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
              cn(
                "absolute top-1/2 -translate-y-1/2",
                isInput ? "-left-3.5" : "-right-3.5",
              ),
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
          {port.description && !compact ? (
            <div className="sr-only">
              {port.description}
            </div>
          ) : null}
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

function getWorkflowNodeSize(node: WorkflowNodeData): WorkflowNodeSize {
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

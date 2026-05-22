"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "../../lib/cn";

type OrgChartNodeData = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  avatar?: React.ReactNode;
  children?: OrgChartNodeData[];
};

type OrgChartRenderNodeContext = {
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  toggleExpanded: () => void;
};

type OrgChartProps = React.ComponentProps<"div"> & {
  nodes?: readonly OrgChartNodeData[];
  emptyMessage?: React.ReactNode;
  renderNode?: (
    node: OrgChartNodeData,
    depth: number,
    context: OrgChartRenderNodeContext,
  ) => React.ReactNode;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedIdsChange?: (nodeIds: string[], node: OrgChartNodeData) => void;
};

export type OrgChartNodeProps = React.ComponentProps<"div"> & {
  node: OrgChartNodeData;
  depth?: number;
  renderNode?: OrgChartProps["renderNode"];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean, node: OrgChartNodeData) => void;
  getNodeExpanded?: (node: OrgChartNodeData) => boolean;
  onToggleNode?: (node: OrgChartNodeData, expanded: boolean) => void;
};

function OrgChart({
  nodes = [],
  emptyMessage = "No organization data.",
  renderNode,
  expandedIds,
  defaultExpandedIds,
  onExpandedIdsChange,
  children,
  className,
  ...props
}: OrgChartProps) {
  const defaultExpandableIds = React.useMemo(() => collectExpandableNodeIds(nodes), [nodes]);
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[] | undefined>(() =>
    defaultExpandedIds ? [...defaultExpandedIds] : undefined,
  );
  const currentExpandedIds = React.useMemo(
    () => new Set(expandedIds ?? internalExpandedIds ?? defaultExpandableIds),
    [defaultExpandableIds, expandedIds, internalExpandedIds],
  );

  const toggleNode = React.useCallback(
    (node: OrgChartNodeData, expanded: boolean) => {
      const nextExpandedIds = expanded
        ? Array.from(new Set([...currentExpandedIds, node.id]))
        : Array.from(currentExpandedIds).filter((nodeId) => nodeId !== node.id);

      if (!expandedIds) {
        setInternalExpandedIds(nextExpandedIds);
      }

      onExpandedIdsChange?.(nextExpandedIds, node);
    },
    [currentExpandedIds, expandedIds, onExpandedIdsChange],
  );

  return (
    <div
      data-slot="org-chart"
      className={cn(
        "min-w-0 overflow-x-auto rounded-md border bg-card p-4 text-card-foreground",
        className,
      )}
      {...props}
    >
      {nodes.length ? (
        <div
          data-slot="org-chart-roots"
          role="tree"
          className="flex min-w-max gap-6 md:justify-center"
        >
          {nodes.map((node) => (
            <OrgChartNode
              key={node.id}
              node={node}
              renderNode={renderNode}
              getNodeExpanded={(chartNode) => currentExpandedIds.has(chartNode.id)}
              onToggleNode={toggleNode}
            />
          ))}
        </div>
      ) : (
        (children ?? (
          <div data-slot="org-chart-empty" className="text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ))
      )}
    </div>
  );
}

function OrgChartNode({
  node,
  depth = 0,
  renderNode,
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
  getNodeExpanded,
  onToggleNode,
  className,
  ...props
}: OrgChartNodeProps) {
  const hasChildren = Boolean(node.children?.length);
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const expanded = hasChildren
    ? (getNodeExpanded?.(node) ?? expandedProp ?? internalExpanded)
    : false;
  const accessibleName = getNodeAccessibleName(node);
  const toggleExpanded = React.useCallback(() => {
    const nextExpanded = !expanded;

    if (expandedProp === undefined && !getNodeExpanded) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded, node);
    onToggleNode?.(node, nextExpanded);
  }, [expanded, expandedProp, getNodeExpanded, node, onExpandedChange, onToggleNode]);

  const renderContext = React.useMemo<OrgChartRenderNodeContext>(
    () => ({
      depth,
      expanded,
      hasChildren,
      toggleExpanded,
    }),
    [depth, expanded, hasChildren, toggleExpanded],
  );

  return (
    <div
      data-slot="org-chart-node-branch"
      data-depth={depth}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      className={cn("grid justify-items-center gap-3", className)}
      {...props}
    >
      <div
        data-slot="org-chart-node"
        className="relative min-w-56 rounded-md border bg-background p-3 shadow-sm"
      >
        {hasChildren ? (
          <button
            type="button"
            data-slot="org-chart-node-toggle"
            aria-label={`${expanded ? "Collapse" : "Expand"} ${accessibleName}`}
            aria-expanded={expanded}
            className={cn(
              "absolute right-2 top-2 inline-grid size-7 place-items-center rounded-sm text-muted-foreground outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              "[&_svg]:size-4",
            )}
            onClick={toggleExpanded}
          >
            {expanded ? (
              <ChevronDownIcon aria-hidden="true" />
            ) : (
              <ChevronRightIcon aria-hidden="true" />
            )}
          </button>
        ) : null}
        <div className={cn(hasChildren && "pr-8")}>
          {renderNode ? (
            renderNode(node, depth, renderContext)
          ) : (
            <div className="flex min-w-0 items-start gap-3">
              {node.avatar ? (
                <div data-slot="org-chart-node-avatar" className="shrink-0">
                  {node.avatar}
                </div>
              ) : null}
              <div className="grid min-w-0 gap-1">
                <div data-slot="org-chart-node-label" className="font-medium leading-5">
                  {node.label}
                </div>
                {node.description ? (
                  <div
                    data-slot="org-chart-node-description"
                    className="text-sm leading-5 text-muted-foreground"
                  >
                    {node.description}
                  </div>
                ) : null}
                {node.meta ? (
                  <div data-slot="org-chart-node-meta" className="text-xs text-muted-foreground">
                    {node.meta}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      {hasChildren && expanded ? (
        <>
          <div data-slot="org-chart-connector" aria-hidden="true" className="h-6 w-px bg-border" />
          <div
            data-slot="org-chart-children"
            role="group"
            className="grid gap-3 md:flex md:items-start md:gap-4"
          >
            {node.children?.map((child) => (
              <OrgChartNode
                key={child.id}
                node={child}
                depth={depth + 1}
                renderNode={renderNode}
                getNodeExpanded={getNodeExpanded}
                onToggleNode={onToggleNode}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function collectExpandableNodeIds(nodes: readonly OrgChartNodeData[]) {
  const expandedNodeIds: string[] = [];

  for (const node of nodes) {
    if (node.children?.length) {
      expandedNodeIds.push(node.id);
      expandedNodeIds.push(...collectExpandableNodeIds(node.children));
    }
  }

  return expandedNodeIds;
}

function getNodeAccessibleName(node: OrgChartNodeData) {
  return typeof node.label === "string" || typeof node.label === "number"
    ? String(node.label)
    : node.id;
}

export { OrgChart, OrgChartNode };
export type { OrgChartProps, OrgChartNodeData, OrgChartRenderNodeContext };

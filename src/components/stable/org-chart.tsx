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
  index: number;
  parentNode?: OrgChartNodeData;
  path: string[];
  expanded: boolean;
  hasChildren: boolean;
  selected: boolean;
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
  selectedNodeId?: string | null;
  nodeActions?:
    | readonly OrgChartNodeAction[]
    | ((
        node: OrgChartNodeData,
        context: OrgChartRenderNodeContext,
      ) => readonly OrgChartNodeAction[]);
  onNodeSelect?: (node: OrgChartNodeData, context: OrgChartRenderNodeContext) => void;
  onNodeActionSelect?: (
    action: OrgChartNodeAction,
    node: OrgChartNodeData,
    context: OrgChartRenderNodeContext,
  ) => void;
};

type OrgChartNodeAction = {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: (node: OrgChartNodeData, context: OrgChartRenderNodeContext) => void;
};

export type OrgChartNodeProps = React.ComponentProps<"div"> & {
  node: OrgChartNodeData;
  depth?: number;
  index?: number;
  parentNode?: OrgChartNodeData;
  path?: string[];
  renderNode?: OrgChartProps["renderNode"];
  nodeActions?: OrgChartProps["nodeActions"];
  expanded?: boolean;
  defaultExpanded?: boolean;
  selected?: boolean;
  selectedNodeId?: string | null;
  onExpandedChange?: (expanded: boolean, node: OrgChartNodeData) => void;
  getNodeExpanded?: (node: OrgChartNodeData) => boolean;
  onToggleNode?: (node: OrgChartNodeData, expanded: boolean) => void;
  onNodeSelect?: OrgChartProps["onNodeSelect"];
  onNodeActionSelect?: OrgChartProps["onNodeActionSelect"];
};

function OrgChart({
  nodes = [],
  emptyMessage = "No organization data.",
  renderNode,
  expandedIds,
  defaultExpandedIds,
  onExpandedIdsChange,
  selectedNodeId,
  nodeActions,
  onNodeSelect,
  onNodeActionSelect,
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
          {nodes.map((node, index) => (
            <OrgChartNode
              key={node.id}
              node={node}
              index={index}
              path={[node.id]}
              renderNode={renderNode}
              nodeActions={nodeActions}
              getNodeExpanded={(chartNode) => currentExpandedIds.has(chartNode.id)}
              onToggleNode={toggleNode}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              onNodeActionSelect={onNodeActionSelect}
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
  index = 0,
  parentNode,
  path = [node.id],
  renderNode,
  nodeActions,
  expanded: expandedProp,
  defaultExpanded = true,
  selected: selectedProp,
  selectedNodeId,
  onExpandedChange,
  getNodeExpanded,
  onToggleNode,
  onNodeSelect,
  onNodeActionSelect,
  className,
  ...props
}: OrgChartNodeProps) {
  const hasChildren = Boolean(node.children?.length);
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const expanded = hasChildren
    ? (getNodeExpanded?.(node) ?? expandedProp ?? internalExpanded)
    : false;
  const selected = selectedProp ?? selectedNodeId === node.id;
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
      index,
      parentNode,
      path,
      expanded,
      hasChildren,
      selected,
      toggleExpanded,
    }),
    [depth, expanded, hasChildren, index, parentNode, path, selected, toggleExpanded],
  );
  const resolvedActions = React.useMemo(
    () =>
      typeof nodeActions === "function" ? nodeActions(node, renderContext) : (nodeActions ?? []),
    [node, nodeActions, renderContext],
  );
  const selectNode = React.useCallback(() => {
    onNodeSelect?.(node, renderContext);
  }, [node, onNodeSelect, renderContext]);
  const handleNodeKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onNodeSelect || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }

      event.preventDefault();
      selectNode();
    },
    [onNodeSelect, selectNode],
  );

  return (
    <div
      data-slot="org-chart-node-branch"
      data-depth={depth}
      role="treeitem"
      aria-label={accessibleName}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selected || undefined}
      className={cn("grid justify-items-center gap-3", className)}
      {...props}
    >
      <div
        data-slot="org-chart-node"
        data-selected={selected ? "true" : undefined}
        role={onNodeSelect ? "button" : undefined}
        tabIndex={onNodeSelect ? 0 : undefined}
        aria-label={onNodeSelect ? accessibleName : undefined}
        className={cn(
          "relative min-w-56 rounded-md border bg-background p-3 shadow-sm outline-none transition-colors",
          selected && "border-primary ring-2 ring-primary/20",
          onNodeSelect &&
            "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
        )}
        onClick={onNodeSelect ? selectNode : undefined}
        onKeyDown={handleNodeKeyDown}
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
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
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
        {resolvedActions.length ? (
          <div data-slot="org-chart-node-actions" className="mt-3 flex flex-wrap gap-1.5">
            {resolvedActions.map((action) => (
              <button
                key={action.id}
                type="button"
                data-slot="org-chart-node-action"
                data-action-id={action.id}
                data-destructive={action.destructive ? "true" : undefined}
                aria-label={getActionAccessibleLabel(action)}
                disabled={action.disabled}
                className={cn(
                  "inline-flex h-7 items-center justify-center gap-1.5 rounded-sm border px-2 text-xs font-medium outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                  action.destructive &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
                  action.icon && "w-7 px-0 [&_svg]:size-3.5",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  action.onSelect?.(node, renderContext);
                  onNodeActionSelect?.(action, node, renderContext);
                }}
              >
                {action.icon ?? action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {hasChildren && expanded ? (
        <>
          <div data-slot="org-chart-connector" aria-hidden="true" className="h-6 w-px bg-border" />
          <div
            data-slot="org-chart-children"
            role="group"
            className="grid gap-3 md:flex md:items-start md:gap-4"
          >
            {node.children?.map((child, childIndex) => (
              <OrgChartNode
                key={child.id}
                node={child}
                depth={depth + 1}
                index={childIndex}
                parentNode={node}
                path={[...path, child.id]}
                renderNode={renderNode}
                nodeActions={nodeActions}
                getNodeExpanded={getNodeExpanded}
                onToggleNode={onToggleNode}
                selectedNodeId={selectedNodeId}
                onNodeSelect={onNodeSelect}
                onNodeActionSelect={onNodeActionSelect}
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

function getActionAccessibleLabel(action: OrgChartNodeAction) {
  return typeof action.label === "string" || typeof action.label === "number"
    ? String(action.label)
    : action.id;
}

function insertOrgChartNode(
  nodes: readonly OrgChartNodeData[],
  parentNodeId: string | null,
  node: OrgChartNodeData,
): OrgChartNodeData[] {
  if (parentNodeId == null) {
    return [...nodes, node];
  }

  return nodes.map((currentNode) => {
    if (currentNode.id === parentNodeId) {
      return {
        ...currentNode,
        children: [...(currentNode.children ?? []), node],
      };
    }

    if (!currentNode.children?.length) {
      return currentNode;
    }

    return {
      ...currentNode,
      children: insertOrgChartNode(currentNode.children, parentNodeId, node),
    };
  });
}

function updateOrgChartNode(
  nodes: readonly OrgChartNodeData[],
  nodeId: string,
  updater: (node: OrgChartNodeData) => OrgChartNodeData,
): OrgChartNodeData[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateOrgChartNode(node.children, nodeId, updater),
    };
  });
}

function removeOrgChartNode(
  nodes: readonly OrgChartNodeData[],
  nodeId: string,
): OrgChartNodeData[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) =>
      node.children?.length
        ? {
            ...node,
            children: removeOrgChartNode(node.children, nodeId),
          }
        : node,
    );
}

export { OrgChart, OrgChartNode };
export { insertOrgChartNode, removeOrgChartNode, updateOrgChartNode };
export type { OrgChartProps, OrgChartNodeAction, OrgChartNodeData, OrgChartRenderNodeContext };

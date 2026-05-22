"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type OrgChartNodeData = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  avatar?: React.ReactNode;
  children?: OrgChartNodeData[];
};

type OrgChartProps = React.ComponentProps<"div"> & {
  nodes?: readonly OrgChartNodeData[];
  emptyMessage?: React.ReactNode;
  renderNode?: (node: OrgChartNodeData, depth: number) => React.ReactNode;
};

type OrgChartNodeProps = React.ComponentProps<"div"> & {
  node: OrgChartNodeData;
  depth?: number;
  renderNode?: OrgChartProps["renderNode"];
};

function OrgChart({
  nodes = [],
  emptyMessage = "No organization data.",
  renderNode,
  children,
  className,
  ...props
}: OrgChartProps) {
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
            <OrgChartNode key={node.id} node={node} renderNode={renderNode} />
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

function OrgChartNode({ node, depth = 0, renderNode, className, ...props }: OrgChartNodeProps) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <div
      data-slot="org-chart-node-branch"
      data-depth={depth}
      role="treeitem"
      aria-expanded={hasChildren ? true : undefined}
      className={cn("grid justify-items-center gap-3", className)}
      {...props}
    >
      <div
        data-slot="org-chart-node"
        className="min-w-56 rounded-md border bg-background p-3 shadow-sm"
      >
        {renderNode ? (
          renderNode(node, depth)
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
      {hasChildren ? (
        <>
          <div data-slot="org-chart-connector" aria-hidden="true" className="h-6 w-px bg-border" />
          <div
            data-slot="org-chart-children"
            role="group"
            className="grid gap-3 md:flex md:items-start md:gap-4"
          >
            {node.children?.map((child) => (
              <OrgChartNode key={child.id} node={child} depth={depth + 1} renderNode={renderNode} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export { OrgChart, OrgChartNode };
export type { OrgChartProps, OrgChartNodeData };

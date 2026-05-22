"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type UmlDiagramNodeVariant = "default" | "accent" | "muted" | "warning" | "danger";
type UmlDiagramEdgeKind =
  | "association"
  | "aggregation"
  | "composition"
  | "dependency"
  | "inheritance"
  | "realization"
  | "transition";
type UmlDiagramEdgeDirection = "forward" | "backward" | "both" | "none";

type UmlDiagramPoint = {
  x: number;
  y: number;
};

type UmlDiagramSection = {
  id?: string;
  label?: React.ReactNode;
  items: readonly React.ReactNode[];
};

type UmlDiagramNode = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  annotation?: React.ReactNode;
  kind?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  variant?: UmlDiagramNodeVariant;
  sections?: readonly UmlDiagramSection[];
};

type UmlDiagramEdge = {
  id: string;
  source: string;
  target: string;
  label?: React.ReactNode;
  sourceLabel?: React.ReactNode;
  targetLabel?: React.ReactNode;
  kind?: UmlDiagramEdgeKind;
  direction?: UmlDiagramEdgeDirection;
  points?: readonly UmlDiagramPoint[];
  className?: string;
};

type PositionedUmlDiagramNode = UmlDiagramNode &
  Required<Pick<UmlDiagramNode, "x" | "y">> & {
    width: number;
    height: number;
  };

type UmlDiagramBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type UmlDiagramProps = Omit<React.ComponentProps<"figure">, "children"> & {
  nodes: readonly UmlDiagramNode[];
  edges?: readonly UmlDiagramEdge[];
  ariaLabel?: string;
  caption?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  padding?: number;
  autoLayoutColumns?: number;
  renderNode?: (node: PositionedUmlDiagramNode) => React.ReactNode;
  renderEdge?: (edge: UmlDiagramEdge, context: UmlDiagramEdgeRenderContext) => React.ReactNode;
};

type UmlDiagramEdgeRenderContext = {
  nodes: Map<string, PositionedUmlDiagramNode>;
  markerIds: UmlDiagramMarkerIds;
  edgeIndex: number;
};

type UmlClassKind = "class" | "abstract" | "interface" | "enum";

type UmlClass = {
  id: string;
  name: React.ReactNode;
  stereotype?: React.ReactNode;
  kind?: UmlClassKind;
  attributes?: readonly React.ReactNode[];
  operations?: readonly React.ReactNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  annotation?: React.ReactNode;
};

type UmlClassRelationship = UmlDiagramEdge & {
  kind?: Exclude<UmlDiagramEdgeKind, "transition">;
};

type UmlClassDiagramProps = Omit<UmlDiagramProps, "nodes" | "edges" | "renderNode"> & {
  classes: readonly UmlClass[];
  relationships?: readonly UmlClassRelationship[];
};

type UmlStateKind = "state" | "initial" | "final" | "choice" | "history" | "fork" | "join";

type UmlState = {
  id: string;
  label?: React.ReactNode;
  kind?: UmlStateKind;
  activities?: readonly React.ReactNode[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  annotation?: React.ReactNode;
};

type UmlStateTransition = UmlDiagramEdge & {
  kind?: "transition" | "dependency";
};

type UmlStateDiagramProps = Omit<UmlDiagramProps, "nodes" | "edges" | "renderNode"> & {
  states: readonly UmlState[];
  transitions?: readonly UmlStateTransition[];
};

type UmlDiagramMarkerIds = {
  arrow: string;
  diamond: string;
  filledDiamond: string;
  triangle: string;
};

const DEFAULT_NODE_SIZE = {
  width: 200,
  height: 96,
} as const;

const UML_AUTO_LAYOUT_GAP = {
  x: 96,
  y: 80,
} as const;

const UML_CLASS_ROW_HEIGHT = 22;
const UML_CLASS_HEADER_HEIGHT = 48;
const UML_CLASS_SECTION_PADDING = 18;
const UML_STATE_ACTIVITY_HEIGHT = 20;
const UML_STATE_HEADER_HEIGHT = 48;
const UML_STATE_SIMPLE_SIZE = 36;
const UML_STATE_BAR_WIDTH = 88;
const UML_STATE_BAR_HEIGHT = 16;

function UmlDiagram({
  nodes,
  edges = [],
  ariaLabel = "UML diagram",
  caption,
  emptyMessage = "No diagram elements.",
  padding = 32,
  autoLayoutColumns,
  renderNode = renderDefaultUmlNode,
  renderEdge = renderDefaultUmlEdge,
  className,
  ...props
}: UmlDiagramProps) {
  const markerPrefix = React.useId().replace(/:/g, "");
  const positionedNodes = React.useMemo(
    () => getPositionedUmlDiagramNodes(nodes, autoLayoutColumns),
    [nodes, autoLayoutColumns],
  );
  const nodeMap = React.useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes],
  );
  const bounds = getUmlDiagramBounds(positionedNodes, edges);
  const viewBox = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${
    bounds.height + padding * 2
  }`;
  const markerIds: UmlDiagramMarkerIds = {
    arrow: `uml-arrow-${markerPrefix}`,
    diamond: `uml-diamond-${markerPrefix}`,
    filledDiamond: `uml-filled-diamond-${markerPrefix}`,
    triangle: `uml-triangle-${markerPrefix}`,
  };

  return (
    <figure
      data-slot="uml-diagram"
      className={cn(
        "grid min-w-0 gap-2 overflow-hidden rounded-md border bg-card text-card-foreground",
        className,
      )}
      {...props}
    >
      <div data-slot="uml-diagram-scroll-area" className="overflow-auto">
        <svg
          data-slot="uml-diagram-svg"
          role="img"
          aria-label={ariaLabel}
          viewBox={viewBox}
          className="block min-h-64 w-full min-w-160 text-foreground"
        >
          <UmlDiagramMarkers ids={markerIds} />
          {positionedNodes.length ? (
            <>
              <g data-slot="uml-diagram-edges">
                {edges.map((edge, edgeIndex) => (
                  <React.Fragment key={edge.id}>
                    {renderEdge(edge, { nodes: nodeMap, markerIds, edgeIndex })}
                  </React.Fragment>
                ))}
              </g>
              <g data-slot="uml-diagram-nodes">
                {positionedNodes.map((node) => (
                  <React.Fragment key={node.id}>{renderNode(node)}</React.Fragment>
                ))}
              </g>
            </>
          ) : (
            <text
              data-slot="uml-diagram-empty"
              x={bounds.x + bounds.width / 2}
              y={bounds.y + bounds.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-sm"
            >
              {emptyMessage}
            </text>
          )}
        </svg>
      </div>
      {caption ? (
        <figcaption
          data-slot="uml-diagram-caption"
          className="border-t px-3 py-2 text-xs leading-5 text-muted-foreground"
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function UmlClassDiagram({
  classes,
  relationships = [],
  ariaLabel = "UML class diagram",
  ...props
}: UmlClassDiagramProps) {
  const nodes = React.useMemo(() => classes.map(getUmlClassNode), [classes]);

  return (
    <UmlDiagram
      ariaLabel={ariaLabel}
      nodes={nodes}
      edges={relationships}
      renderNode={renderUmlClassNode}
      {...props}
    />
  );
}

function UmlStateDiagram({
  states,
  transitions = [],
  ariaLabel = "UML state diagram",
  ...props
}: UmlStateDiagramProps) {
  const nodes = React.useMemo(() => states.map(getUmlStateNode), [states]);
  const edges = React.useMemo(
    () => transitions.map((transition) => ({ kind: "transition" as const, ...transition })),
    [transitions],
  );

  return (
    <UmlDiagram
      ariaLabel={ariaLabel}
      nodes={nodes}
      edges={edges}
      renderNode={renderUmlStateNode}
      {...props}
    />
  );
}

function UmlDiagramMarkers({ ids }: { ids: UmlDiagramMarkerIds }) {
  return (
    <defs>
      <marker
        id={ids.arrow}
        markerHeight="8"
        markerUnits="strokeWidth"
        markerWidth="8"
        orient="auto"
        refX="7"
        refY="4"
        viewBox="0 0 8 8"
      >
        <path d="M 0 0 L 8 4 L 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      <marker
        id={ids.triangle}
        markerHeight="10"
        markerUnits="strokeWidth"
        markerWidth="10"
        orient="auto"
        refX="9"
        refY="5"
        viewBox="0 0 10 10"
      >
        <path d="M 1 1 L 9 5 L 1 9 Z" className="fill-card stroke-current" strokeWidth="1.25" />
      </marker>
      <marker
        id={ids.diamond}
        markerHeight="12"
        markerUnits="strokeWidth"
        markerWidth="14"
        orient="auto"
        refX="1"
        refY="6"
        viewBox="0 0 14 12"
      >
        <path
          d="M 1 6 L 7 1 L 13 6 L 7 11 Z"
          className="fill-card stroke-current"
          strokeWidth="1.25"
        />
      </marker>
      <marker
        id={ids.filledDiamond}
        markerHeight="12"
        markerUnits="strokeWidth"
        markerWidth="14"
        orient="auto"
        refX="1"
        refY="6"
        viewBox="0 0 14 12"
      >
        <path d="M 1 6 L 7 1 L 13 6 L 7 11 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

function renderDefaultUmlNode(node: PositionedUmlDiagramNode) {
  return (
    <g
      data-slot="uml-diagram-node"
      data-node-id={node.id}
      data-variant={node.variant ?? "default"}
      transform={`translate(${node.x} ${node.y})`}
    >
      <rect
        width={node.width}
        height={node.height}
        rx="8"
        className={cn(
          "fill-card stroke-border",
          node.variant === "accent" && "fill-primary/5 stroke-primary/40",
          node.variant === "muted" && "fill-muted/45",
          node.variant === "warning" && "fill-yellow-500/10 stroke-yellow-500/35",
          node.variant === "danger" && "fill-destructive/10 stroke-destructive/35",
        )}
      />
      <foreignObject width={node.width} height={node.height}>
        <div className="grid h-full content-start gap-1 overflow-hidden p-3 text-sm">
          <div className="truncate font-medium leading-5">{node.label}</div>
          {node.description ? (
            <div className="line-clamp-2 text-xs leading-4 text-muted-foreground">
              {node.description}
            </div>
          ) : null}
          {node.sections?.map((section, index) => (
            <div key={section.id ?? index} className="mt-1 border-t pt-1 text-xs leading-4">
              {section.label ? (
                <div className="mb-0.5 font-medium text-muted-foreground">{section.label}</div>
              ) : null}
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="truncate">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </foreignObject>
      {node.annotation ? (
        <text
          data-slot="uml-diagram-node-annotation"
          x={node.width}
          y="-8"
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {node.annotation}
        </text>
      ) : null}
    </g>
  );
}

function renderUmlClassNode(node: PositionedUmlDiagramNode) {
  const classKind = node.kind;

  return (
    <g
      data-slot="uml-class-diagram-class"
      data-node-id={node.id}
      data-kind={classKind}
      transform={`translate(${node.x} ${node.y})`}
    >
      <rect width={node.width} height={node.height} rx="4" className="fill-card stroke-border" />
      <foreignObject width={node.width} height={node.height}>
        <div className="flex h-full flex-col text-xs">
          <div className="grid min-h-12 place-items-center border-b px-3 py-2 text-center">
            {node.annotation ? (
              <div className="text-[10px] leading-4 text-muted-foreground">{node.annotation}</div>
            ) : null}
            <div
              className={cn(
                "max-w-full truncate text-sm font-semibold leading-5",
                classKind === "abstract" && "italic",
              )}
            >
              {node.label}
            </div>
          </div>
          {node.sections?.map((section, sectionIndex) => (
            <div
              key={section.id ?? sectionIndex}
              data-slot="uml-class-diagram-section"
              className="min-h-8 border-b px-3 py-2 last:border-b-0"
            >
              {section.label ? (
                <div className="mb-1 text-[10px] font-medium uppercase tracking-normal text-muted-foreground">
                  {section.label}
                </div>
              ) : null}
              {section.items.length ? (
                <div className="grid gap-1">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="truncate font-mono leading-4">
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-4" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </foreignObject>
    </g>
  );
}

function renderUmlStateNode(node: PositionedUmlDiagramNode) {
  const kind = (node.kind ?? "default") as UmlStateKind | "default";
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;

  if (kind === "initial") {
    return (
      <g data-slot="uml-state-diagram-state" data-node-id={node.id} data-kind={kind}>
        <circle cx={centerX} cy={centerY} r="10" className="fill-foreground" />
      </g>
    );
  }

  if (kind === "final") {
    return (
      <g data-slot="uml-state-diagram-state" data-node-id={node.id} data-kind={kind}>
        <circle cx={centerX} cy={centerY} r="14" className="fill-card stroke-foreground" />
        <circle cx={centerX} cy={centerY} r="9" className="fill-foreground" />
      </g>
    );
  }

  if (kind === "choice") {
    const points = [
      `${centerX},${node.y}`,
      `${node.x + node.width},${centerY}`,
      `${centerX},${node.y + node.height}`,
      `${node.x},${centerY}`,
    ].join(" ");

    return (
      <g data-slot="uml-state-diagram-state" data-node-id={node.id} data-kind={kind}>
        <polygon points={points} className="fill-card stroke-border" />
      </g>
    );
  }

  if (kind === "history") {
    return (
      <g data-slot="uml-state-diagram-state" data-node-id={node.id} data-kind={kind}>
        <circle cx={centerX} cy={centerY} r="16" className="fill-card stroke-border" />
        <text
          x={centerX}
          y={centerY + 5}
          textAnchor="middle"
          className="fill-foreground text-sm font-semibold"
        >
          H
        </text>
      </g>
    );
  }

  if (kind === "fork" || kind === "join") {
    return (
      <g data-slot="uml-state-diagram-state" data-node-id={node.id} data-kind={kind}>
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx="3"
          className="fill-foreground"
        />
      </g>
    );
  }

  return (
    <g
      data-slot="uml-state-diagram-state"
      data-node-id={node.id}
      data-kind="state"
      transform={`translate(${node.x} ${node.y})`}
    >
      <rect width={node.width} height={node.height} rx="12" className="fill-card stroke-border" />
      <foreignObject width={node.width} height={node.height}>
        <div className="flex h-full flex-col text-xs">
          <div className="grid min-h-12 place-items-center border-b px-3 py-2 text-center">
            <div className="max-w-full truncate text-sm font-semibold leading-5">{node.label}</div>
          </div>
          {node.sections?.map((section, sectionIndex) => (
            <div key={section.id ?? sectionIndex} className="grid gap-1 px-3 py-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="truncate font-mono leading-4">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </foreignObject>
      {node.annotation ? (
        <text
          data-slot="uml-state-diagram-state-annotation"
          x={node.width}
          y="-8"
          textAnchor="end"
          className="fill-muted-foreground text-[10px]"
        >
          {node.annotation}
        </text>
      ) : null}
    </g>
  );
}

function renderDefaultUmlEdge(
  edge: UmlDiagramEdge,
  { nodes, markerIds, edgeIndex }: UmlDiagramEdgeRenderContext,
) {
  const sourceNode = nodes.get(edge.source);
  const targetNode = nodes.get(edge.target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const route = getUmlDiagramEdgeRoute(edge, sourceNode, targetNode, edgeIndex);
  const markerProps = getUmlDiagramEdgeMarkerProps(edge, markerIds);
  const isDashed = edge.kind === "dependency" || edge.kind === "realization";

  return (
    <g
      data-slot="uml-diagram-edge-group"
      data-edge-id={edge.id}
      data-kind={edge.kind ?? "association"}
    >
      <path
        data-slot="uml-diagram-edge"
        d={route.path}
        className={cn(
          "fill-none stroke-muted-foreground",
          edge.kind === "transition" && "stroke-foreground",
          edge.className,
        )}
        strokeDasharray={isDashed ? "6 4" : undefined}
        strokeWidth="1.5"
        {...markerProps}
      />
      {edge.label ? (
        <UmlDiagramEdgeLabel x={route.labelPoint.x} y={route.labelPoint.y}>
          {edge.label}
        </UmlDiagramEdgeLabel>
      ) : null}
      {edge.sourceLabel ? (
        <UmlDiagramEdgeLabel x={route.sourceLabelPoint.x} y={route.sourceLabelPoint.y}>
          {edge.sourceLabel}
        </UmlDiagramEdgeLabel>
      ) : null}
      {edge.targetLabel ? (
        <UmlDiagramEdgeLabel x={route.targetLabelPoint.x} y={route.targetLabelPoint.y}>
          {edge.targetLabel}
        </UmlDiagramEdgeLabel>
      ) : null}
    </g>
  );
}

function UmlDiagramEdgeLabel({
  x,
  y,
  children,
}: React.PropsWithChildren<{ x: number; y: number }>) {
  return (
    <g data-slot="uml-diagram-edge-label" transform={`translate(${x} ${y})`}>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        paintOrder="stroke"
        className="fill-foreground stroke-card stroke-[5px] text-[11px]"
      >
        {children}
      </text>
    </g>
  );
}

function getUmlClassNode(umlClass: UmlClass): UmlDiagramNode {
  const attributes = umlClass.attributes ?? [];
  const operations = umlClass.operations ?? [];
  const sectionCount = 2;
  const itemCount = Math.max(1, attributes.length) + Math.max(1, operations.length);
  const stereotype =
    umlClass.stereotype ??
    (umlClass.kind === "interface"
      ? "<<interface>>"
      : umlClass.kind === "enum"
        ? "<<enumeration>>"
        : undefined);

  return {
    id: umlClass.id,
    label: umlClass.name,
    x: umlClass.x,
    y: umlClass.y,
    width: umlClass.width ?? 220,
    height:
      umlClass.height ??
      UML_CLASS_HEADER_HEIGHT +
        itemCount * UML_CLASS_ROW_HEIGHT +
        sectionCount * UML_CLASS_SECTION_PADDING,
    kind: umlClass.kind ?? "class",
    annotation: stereotype,
    sections: [
      {
        id: "attributes",
        label: "Attributes",
        items: attributes,
      },
      {
        id: "operations",
        label: "Operations",
        items: operations,
      },
    ],
  };
}

function getUmlStateNode(state: UmlState): UmlDiagramNode {
  const kind = state.kind ?? "state";
  const activities = state.activities ?? [];

  if (kind === "initial" || kind === "final" || kind === "choice" || kind === "history") {
    return {
      id: state.id,
      label: state.label ?? kind,
      x: state.x,
      y: state.y,
      width: state.width ?? UML_STATE_SIMPLE_SIZE,
      height: state.height ?? UML_STATE_SIMPLE_SIZE,
      kind,
      annotation: state.annotation,
    };
  }

  if (kind === "fork" || kind === "join") {
    return {
      id: state.id,
      label: state.label ?? kind,
      x: state.x,
      y: state.y,
      width: state.width ?? UML_STATE_BAR_WIDTH,
      height: state.height ?? UML_STATE_BAR_HEIGHT,
      kind,
      annotation: state.annotation,
    };
  }

  return {
    id: state.id,
    label: state.label ?? state.id,
    x: state.x,
    y: state.y,
    width: state.width ?? 188,
    height:
      state.height ??
      UML_STATE_HEADER_HEIGHT + Math.max(1, activities.length) * UML_STATE_ACTIVITY_HEIGHT + 16,
    kind,
    annotation: state.annotation,
    sections: activities.length
      ? [
          {
            id: "activities",
            items: activities,
          },
        ]
      : undefined,
  };
}

function getPositionedUmlDiagramNodes(
  nodes: readonly UmlDiagramNode[],
  autoLayoutColumns?: number,
): PositionedUmlDiagramNode[] {
  const columns = autoLayoutColumns ?? Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  const seenIds = new Set<string>();

  return nodes.flatMap((node, index) => {
    if (seenIds.has(node.id)) {
      return [];
    }

    seenIds.add(node.id);
    const width = node.width ?? DEFAULT_NODE_SIZE.width;
    const height = node.height ?? DEFAULT_NODE_SIZE.height;
    const column = index % columns;
    const row = Math.floor(index / columns);

    return [
      {
        ...node,
        width,
        height,
        x: node.x ?? column * (width + UML_AUTO_LAYOUT_GAP.x),
        y: node.y ?? row * (height + UML_AUTO_LAYOUT_GAP.y),
      },
    ];
  });
}

function getUmlDiagramBounds(
  nodes: readonly PositionedUmlDiagramNode[],
  edges: readonly UmlDiagramEdge[] = [],
): UmlDiagramBounds {
  if (!nodes.length) {
    return {
      x: 0,
      y: 0,
      width: 640,
      height: 280,
    };
  }

  const points = nodes.flatMap((node) => [
    { x: node.x, y: node.y },
    { x: node.x + node.width, y: node.y + node.height },
  ]);

  for (const edge of edges) {
    if (edge.points) {
      points.push(...edge.points);
    }
  }

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function getUmlDiagramEdgeRoute(
  edge: UmlDiagramEdge,
  sourceNode: PositionedUmlDiagramNode,
  targetNode: PositionedUmlDiagramNode,
  edgeIndex: number,
) {
  const sourceCenter = getUmlDiagramNodeCenter(sourceNode);
  const targetCenter = getUmlDiagramNodeCenter(targetNode);

  if (sourceNode.id === targetNode.id) {
    const offset = 28 + (edgeIndex % 3) * 16;
    const start = {
      x: sourceNode.x + sourceNode.width,
      y: sourceNode.y + sourceNode.height * 0.35,
    };
    const end = { x: sourceNode.x + sourceNode.width, y: sourceNode.y + sourceNode.height * 0.68 };
    const c1 = { x: start.x + offset, y: start.y - offset };
    const c2 = { x: end.x + offset, y: end.y + offset };

    return {
      path: `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
      labelPoint: {
        x: sourceNode.x + sourceNode.width + offset + 12,
        y: sourceNode.y + sourceNode.height / 2,
      },
      sourceLabelPoint: { x: start.x + 8, y: start.y - 8 },
      targetLabelPoint: { x: end.x + 8, y: end.y + 8 },
    };
  }

  const source = getUmlDiagramBoundaryPoint(sourceNode, targetCenter);
  const target = getUmlDiagramBoundaryPoint(targetNode, sourceCenter);
  const points = [source, ...(edge.points ?? []), target];
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const labelPoint = edge.points?.length
    ? edge.points[Math.floor(edge.points.length / 2)]
    : getUmlDiagramMidpoint(source, target);
  const sourceLabelPoint = getUmlDiagramMidpoint(source, points[1] ?? target, 0.35);
  const targetLabelPoint = getUmlDiagramMidpoint(points[points.length - 2] ?? source, target, 0.65);

  return {
    path,
    labelPoint,
    sourceLabelPoint,
    targetLabelPoint,
  };
}

function getUmlDiagramEdgeMarkerProps(edge: UmlDiagramEdge, markerIds: UmlDiagramMarkerIds) {
  const kind = edge.kind ?? "association";
  const direction = edge.direction ?? (kind === "association" ? "none" : "forward");
  const markerStart =
    kind === "aggregation"
      ? `url(#${markerIds.diamond})`
      : kind === "composition"
        ? `url(#${markerIds.filledDiamond})`
        : direction === "backward" || direction === "both"
          ? `url(#${markerIds.arrow})`
          : undefined;
  const markerEnd =
    kind === "inheritance" || kind === "realization"
      ? `url(#${markerIds.triangle})`
      : direction === "forward" || direction === "both"
        ? `url(#${markerIds.arrow})`
        : undefined;

  return {
    markerStart,
    markerEnd,
  };
}

function getUmlDiagramNodeCenter(node: PositionedUmlDiagramNode): UmlDiagramPoint {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function getUmlDiagramBoundaryPoint(
  node: PositionedUmlDiagramNode,
  toward: UmlDiagramPoint,
): UmlDiagramPoint {
  const center = getUmlDiagramNodeCenter(node);
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const halfWidth = node.width / 2;
  const halfHeight = node.height / 2;

  if (Math.abs(dx) * halfHeight > Math.abs(dy) * halfWidth) {
    return {
      x: center.x + (dx > 0 ? halfWidth : -halfWidth),
      y: center.y + (dy * halfWidth) / Math.max(Math.abs(dx), 1),
    };
  }

  return {
    x: center.x + (dx * halfHeight) / Math.max(Math.abs(dy), 1),
    y: center.y + (dy > 0 ? halfHeight : -halfHeight),
  };
}

function getUmlDiagramMidpoint(
  start: UmlDiagramPoint,
  end: UmlDiagramPoint,
  ratio = 0.5,
): UmlDiagramPoint {
  return {
    x: start.x + (end.x - start.x) * ratio,
    y: start.y + (end.y - start.y) * ratio,
  };
}

export {
  UmlClassDiagram,
  UmlDiagram,
  UmlStateDiagram,
  getUmlDiagramBounds,
  type PositionedUmlDiagramNode,
  type UmlClass,
  type UmlClassDiagramProps,
  type UmlClassKind,
  type UmlClassRelationship,
  type UmlDiagramBounds,
  type UmlDiagramEdge,
  type UmlDiagramEdgeDirection,
  type UmlDiagramEdgeKind,
  type UmlDiagramNode,
  type UmlDiagramNodeVariant,
  type UmlDiagramPoint,
  type UmlDiagramProps,
  type UmlDiagramSection,
  type UmlState,
  type UmlStateDiagramProps,
  type UmlStateKind,
  type UmlStateTransition,
};

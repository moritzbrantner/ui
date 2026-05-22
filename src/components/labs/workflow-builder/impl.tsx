"use client";

import * as React from "react";
import { Maximize2Icon, MinusIcon, PlusIcon, Trash2Icon, WorkflowIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { Badge } from "../../stable/badge";
import { Button } from "../../stable/button";
import { Separator } from "../../stable/separator";
import {
  WorkflowNode,
  getWorkflowNodePortCenterOffset,
  getWorkflowNodeSize,
  type WorkflowNodeData as WorkflowCanvasNodeData,
  type WorkflowNodePort as WorkflowCanvasNodePort,
} from "../workflow-node";

type WorkflowBuilderPort<TypeScriptType = unknown> = WorkflowCanvasNodePort<TypeScriptType>;

type WorkflowBuilderNodeData<
  Inputs extends readonly WorkflowBuilderPort[] = WorkflowBuilderPort[],
  Outputs extends readonly WorkflowBuilderPort[] = WorkflowBuilderPort[],
> = WorkflowCanvasNodeData<Inputs, Outputs> & {
  x: number;
  y: number;
};

type WorkflowBuilderEdge = {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  status?: "idle" | "running" | "success" | "error" | "warning" | string;
  metadata?: Record<string, unknown>;
};

type WorkflowBuilderSelection =
  | { type: "node"; id: string; node: WorkflowBuilderNodeData }
  | { type: "edge"; id: string; edge: WorkflowBuilderEdge }
  | null;

type WorkflowBuilderConnectionValidityInput = {
  nodes: WorkflowBuilderNodeData[];
  edges: WorkflowBuilderEdge[];
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  ignoreEdgeId?: string;
};

type WorkflowBuilderConnectionValidity = {
  valid: boolean;
  reason?:
    | "duplicate"
    | "input-occupied"
    | "kind-mismatch"
    | "missing-port"
    | "self-connection"
    | "type-mismatch";
};

type WorkflowBuilderViewport = {
  x: number;
  y: number;
  zoom: number;
};

type WorkflowBuilderConnection = {
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
};

type WorkflowBuilderDisconnectReason =
  | "edge-delete"
  | "edge-double-click"
  | "endpoint-detach"
  | "node-delete"
  | "rewire";

type WorkflowBuilderProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  nodes: WorkflowBuilderNodeData[];
  edges: WorkflowBuilderEdge[];
  onNodesChange?: (nodes: WorkflowBuilderNodeData[]) => void;
  onEdgesChange?: (edges: WorkflowBuilderEdge[]) => void;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectionChange?: (selection: WorkflowBuilderSelection) => void;
  readOnly?: boolean;
  defaultZoom?: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  viewport?: WorkflowBuilderViewport;
  defaultViewport?: WorkflowBuilderViewport;
  onViewportChange?: (viewport: WorkflowBuilderViewport) => void;
  isConnectionValid?: (
    connection: WorkflowBuilderConnectionValidityInput,
  ) => WorkflowBuilderConnectionValidity;
  onConnectionStart?: (
    connection: Pick<WorkflowBuilderConnection, "sourceNodeId" | "sourcePortId">,
  ) => void;
  onConnectionCancel?: () => void;
  onConnectionComplete?: (connection: WorkflowBuilderConnection) => void;
  onConnectionDisconnect?: (
    edge: WorkflowBuilderEdge,
    reason: WorkflowBuilderDisconnectReason,
  ) => void;
  minZoom?: number;
  maxZoom?: number;
  surfaceHeight?: number | string;
  canvasSize?: { width: number; height: number };
  showMiniMap?: boolean;
  toolbarLabel?: React.ReactNode;
};

export type WorkflowBuilderNodeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  node: WorkflowBuilderNodeData;
  selected?: boolean;
  readOnly?: boolean;
  pendingConnection?: PendingConnection | null;
  inputsConnectable?: boolean;
  onNodeSelect?: (node: WorkflowBuilderNodeData) => void;
  onNodeMinimizedChange?: (nodeId: string, minimized: boolean) => void;
  onStartConnection?: (nodeId: string, portId: string) => void;
  onCompleteConnection?: (nodeId: string, portId: string) => void;
  onInputPointerUp?: (
    event: React.PointerEvent<HTMLButtonElement>,
    nodeId: string,
    portId: string,
  ) => void;
  onOutputPointerDown?: (
    event: React.PointerEvent<HTMLButtonElement>,
    nodeId: string,
    portId: string,
  ) => void;
  onOutputPointerUp?: (
    event: React.PointerEvent<HTMLButtonElement>,
    nodeId: string,
    portId: string,
  ) => void;
  onNodePointerDown?: (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
    node: WorkflowBuilderNodeData,
  ) => void;
};

export type WorkflowBuilderToolbarProps = React.ComponentProps<"div"> & {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  readOnly?: boolean;
  selectedLabel?: string;
  toolbarLabel?: React.ReactNode;
  onZoomChange?: (zoom: number) => void;
  onFitView?: () => void;
  onDeleteSelection?: () => void;
};

export type WorkflowBuilderMiniMapProps = React.ComponentProps<"div"> & {
  nodes: WorkflowBuilderNodeData[];
  edges?: WorkflowBuilderEdge[];
  selectedNodeId?: string | null;
};

type PendingConnection = {
  sourceNodeId: string;
  sourcePortId: string;
};

type WorkflowBuilderConnectionDrag =
  | {
      type: "new";
      sourceNodeId: string;
      sourcePortId: string;
      startPoint: WorkflowBuilderPoint;
      pointerPoint: WorkflowBuilderPoint;
      started: boolean;
      targetNodeId?: string;
      targetPortId?: string;
      targetValid?: boolean;
    }
  | {
      type: "rewire-source";
      edge: WorkflowBuilderEdge;
      startPoint: WorkflowBuilderPoint;
      pointerPoint: WorkflowBuilderPoint;
      targetNodeId?: string;
      targetPortId?: string;
      targetValid?: boolean;
    }
  | {
      type: "rewire-target";
      edge: WorkflowBuilderEdge;
      startPoint: WorkflowBuilderPoint;
      pointerPoint: WorkflowBuilderPoint;
      targetNodeId?: string;
      targetPortId?: string;
      targetValid?: boolean;
    };

type WorkflowBuilderPortDirection = "input" | "output";

type WorkflowBuilderPoint = {
  x: number;
  y: number;
};

type WorkflowBuilderPortPointMap = Record<string, WorkflowBuilderPoint>;

type DragState = {
  nodeId: string;
  startX: number;
  startY: number;
  originalX: number;
  originalY: number;
} | null;

const workflowBuilderSnapDistance = 28;
const workflowBuilderConnectionDragThreshold = 4;

function WorkflowBuilder({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodeId,
  selectedEdgeId,
  onSelectionChange,
  readOnly = false,
  defaultZoom = 1,
  zoom,
  onZoomChange,
  viewport,
  defaultViewport,
  onViewportChange,
  isConnectionValid = getWorkflowBuilderConnectionValidity,
  onConnectionStart,
  onConnectionCancel,
  onConnectionComplete,
  onConnectionDisconnect,
  minZoom = 0.5,
  maxZoom = 1.75,
  surfaceHeight = "32rem",
  canvasSize,
  showMiniMap = true,
  toolbarLabel = "Workflow",
  className,
  ...props
}: WorkflowBuilderProps) {
  const [internalZoom, setInternalZoom] = React.useState(defaultZoom);
  const [internalViewport, setInternalViewport] = React.useState<WorkflowBuilderViewport>(
    defaultViewport ?? { x: 0, y: 0, zoom: defaultZoom },
  );
  const [internalSelectedNodeId, setInternalSelectedNodeId] = React.useState<string | null>(null);
  const [internalSelectedEdgeId, setInternalSelectedEdgeId] = React.useState<string | null>(null);
  const [pendingConnection, setPendingConnection] = React.useState<PendingConnection | null>(null);
  const [connectionDrag, setConnectionDrag] = React.useState<WorkflowBuilderConnectionDrag | null>(
    null,
  );
  const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);
  const [dragState, setDragState] = React.useState<DragState>(null);
  const [portPoints, setPortPoints] = React.useState<WorkflowBuilderPortPointMap>({});
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const suppressNextPortClickRef = React.useRef(false);
  const currentViewport = viewport ?? {
    ...internalViewport,
    zoom: zoom ?? internalViewport.zoom ?? internalZoom,
  };
  const currentZoom = currentViewport.zoom;
  const currentSelectedNodeId = selectedNodeId ?? internalSelectedNodeId;
  const currentSelectedEdgeId = selectedEdgeId ?? internalSelectedEdgeId;
  const selectedNode = nodes.find((node) => node.id === currentSelectedNodeId);
  const selectedEdge = edges.find((edge) => edge.id === currentSelectedEdgeId);

  const commitViewport = (nextViewport: WorkflowBuilderViewport) => {
    const safeViewport = {
      ...nextViewport,
      zoom: clampWorkflowValue(nextViewport.zoom, minZoom, maxZoom),
    };
    setInternalViewport(safeViewport);
    setInternalZoom(safeViewport.zoom);
    onZoomChange?.(safeViewport.zoom);
    onViewportChange?.(safeViewport);
  };

  const commitZoom = (nextZoom: number) => {
    const safeZoom = clampWorkflowValue(nextZoom, minZoom, maxZoom);
    commitViewport({ ...currentViewport, zoom: safeZoom });
  };

  const commitSelection = (selection: WorkflowBuilderSelection) => {
    setInternalSelectedNodeId(selection?.type === "node" ? selection.id : null);
    setInternalSelectedEdgeId(selection?.type === "edge" ? selection.id : null);
    onSelectionChange?.(selection);
  };

  const selectNode = (node: WorkflowBuilderNodeData) => {
    commitSelection({ type: "node", id: node.id, node });
  };

  const selectEdge = (edge: WorkflowBuilderEdge) => {
    commitSelection({ type: "edge", id: edge.id, edge });
  };

  const removeEdge = (edge: WorkflowBuilderEdge, reason: WorkflowBuilderDisconnectReason) => {
    onEdgesChange?.(edges.filter((currentEdge) => currentEdge.id !== edge.id));
    onConnectionDisconnect?.(edge, reason);
    if (currentSelectedEdgeId === edge.id) {
      commitSelection(null);
    }
  };

  const getConnectionValidity = (connection: WorkflowBuilderConnection, ignoreEdgeId?: string) =>
    isConnectionValid({
      nodes,
      edges,
      ...connection,
      ignoreEdgeId,
    });

  const addConnection = (connection: WorkflowBuilderConnection) => {
    const validity = getConnectionValidity(connection);

    if (!validity.valid) {
      return false;
    }

    onEdgesChange?.([
      ...edges,
      {
        id: `edge-${connection.sourceNodeId}-${connection.sourcePortId}-${connection.targetNodeId}-${connection.targetPortId}`,
        ...connection,
      },
    ]);
    onConnectionComplete?.(connection);
    return true;
  };

  const rewireConnection = (edge: WorkflowBuilderEdge, connection: WorkflowBuilderConnection) => {
    const validity = getConnectionValidity(connection, edge.id);

    if (!validity.valid) {
      return false;
    }

    const nextEdge = { ...edge, ...connection };
    onEdgesChange?.(
      edges.map((currentEdge) => (currentEdge.id === edge.id ? nextEdge : currentEdge)),
    );
    onConnectionDisconnect?.(edge, "rewire");
    onConnectionComplete?.(connection);
    commitSelection({ type: "edge", id: edge.id, edge: nextEdge });
    return true;
  };

  const deleteSelection = () => {
    if (readOnly) {
      return;
    }

    if (selectedNode) {
      const incidentEdges = edges.filter(
        (edge) => edge.sourceNodeId === selectedNode.id || edge.targetNodeId === selectedNode.id,
      );
      onNodesChange?.(nodes.filter((node) => node.id !== selectedNode.id));
      onEdgesChange?.(
        edges.filter(
          (edge) => edge.sourceNodeId !== selectedNode.id && edge.targetNodeId !== selectedNode.id,
        ),
      );
      incidentEdges.forEach((edge) => onConnectionDisconnect?.(edge, "node-delete"));
      commitSelection(null);
      return;
    }

    if (selectedEdge) {
      removeEdge(selectedEdge, "edge-delete");
    }
  };

  const getConnectionDragCandidate = (
    event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
    drag: WorkflowBuilderConnectionDrag,
  ) => {
    const direction = drag.type === "rewire-source" ? "output" : "input";
    const portElement = getWorkflowBuilderPortElementFromPoint(
      event.clientX,
      event.clientY,
      direction,
    );
    const nodeElement = portElement?.closest<HTMLElement>("[data-slot='workflow-builder-node']");
    const nodeId = nodeElement?.dataset.nodeId;
    const portId = portElement?.dataset.portId;

    if (!nodeId || !portId) {
      return {};
    }

    const connection =
      drag.type === "new"
        ? {
            sourceNodeId: drag.sourceNodeId,
            sourcePortId: drag.sourcePortId,
            targetNodeId: nodeId,
            targetPortId: portId,
          }
        : drag.type === "rewire-target"
          ? {
              sourceNodeId: drag.edge.sourceNodeId,
              sourcePortId: drag.edge.sourcePortId,
              targetNodeId: nodeId,
              targetPortId: portId,
            }
          : {
              sourceNodeId: nodeId,
              sourcePortId: portId,
              targetNodeId: drag.edge.targetNodeId,
              targetPortId: drag.edge.targetPortId,
            };
    const validity = getConnectionValidity(
      connection,
      drag.type === "new" ? undefined : drag.edge.id,
    );

    return {
      targetNodeId: nodeId,
      targetPortId: portId,
      targetValid: validity.valid,
    };
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => {
    if (connectionDrag && !readOnly) {
      const pointerPoint = getWorkflowBuilderPointerPoint(event, viewportRef.current, currentZoom);
      const distance = getWorkflowPointDistance(connectionDrag.startPoint, pointerPoint);
      const candidate = getConnectionDragCandidate(event, connectionDrag);

      setConnectionDrag((currentDrag) => {
        if (!currentDrag) {
          return currentDrag;
        }

        if (currentDrag.type === "new" && !currentDrag.started) {
          const started = distance >= workflowBuilderConnectionDragThreshold;

          if (started) {
            onConnectionStart?.({
              sourceNodeId: currentDrag.sourceNodeId,
              sourcePortId: currentDrag.sourcePortId,
            });
          }

          return {
            ...currentDrag,
            ...candidate,
            pointerPoint,
            started,
          };
        }

        return {
          ...currentDrag,
          ...candidate,
          pointerPoint,
        };
      });
      return;
    }

    if (!dragState || readOnly) {
      return;
    }
    const pointer = getWorkflowPointer(event);
    const draggedNode = nodes.find((node) => node.id === dragState.nodeId);

    if (!draggedNode) {
      return;
    }

    const rawPosition = {
      x: Math.round(dragState.originalX + (pointer.x - dragState.startX) / currentZoom),
      y: Math.round(dragState.originalY + (pointer.y - dragState.startY) / currentZoom),
    };
    const nextPosition = getWorkflowBuilderSnappedNodePosition(draggedNode, nodes, rawPosition);
    const nextNodes = nodes.map((node) =>
      node.id === dragState.nodeId ? { ...node, ...nextPosition } : node,
    );
    onNodesChange?.(nextNodes);
  };

  const handleNodePointerDown = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
    node: WorkflowBuilderNodeData,
  ) => {
    selectNode(node);
    if (
      readOnly ||
      (event.button !== 0 && event.button !== undefined) ||
      isWorkflowNodeControlEvent(event.target)
    ) {
      return;
    }
    const pointer = getWorkflowPointer(event);
    setDragState({
      nodeId: node.id,
      startX: pointer.x,
      startY: pointer.y,
      originalX: node.x,
      originalY: node.y,
    });
  };

  const completeConnection = (targetNodeId: string, targetPortId: string) => {
    if (!pendingConnection || readOnly) {
      return;
    }

    addConnection({
      sourceNodeId: pendingConnection.sourceNodeId,
      sourcePortId: pendingConnection.sourcePortId,
      targetNodeId,
      targetPortId,
    });

    setPendingConnection(null);
  };

  const completeConnectionDragOnPort = (
    direction: WorkflowBuilderPortDirection,
    nodeId: string,
    portId: string,
  ) => {
    if (!connectionDrag || readOnly) {
      return false;
    }

    if (connectionDrag.type === "new" && direction === "input") {
      const completed = addConnection({
        sourceNodeId: connectionDrag.sourceNodeId,
        sourcePortId: connectionDrag.sourcePortId,
        targetNodeId: nodeId,
        targetPortId: portId,
      });
      setConnectionDrag(null);
      setPendingConnection(null);
      suppressNextPortClickRef.current = true;
      return completed;
    }

    if (connectionDrag.type === "rewire-target" && direction === "input") {
      const completed = rewireConnection(connectionDrag.edge, {
        sourceNodeId: connectionDrag.edge.sourceNodeId,
        sourcePortId: connectionDrag.edge.sourcePortId,
        targetNodeId: nodeId,
        targetPortId: portId,
      });
      setConnectionDrag(null);
      setPendingConnection(null);
      return completed;
    }

    if (connectionDrag.type === "rewire-source" && direction === "output") {
      const completed = rewireConnection(connectionDrag.edge, {
        sourceNodeId: nodeId,
        sourcePortId: portId,
        targetNodeId: connectionDrag.edge.targetNodeId,
        targetPortId: connectionDrag.edge.targetPortId,
      });
      setConnectionDrag(null);
      setPendingConnection(null);
      return completed;
    }

    return false;
  };

  const cancelOrDetachConnectionDrag = () => {
    if (!connectionDrag || readOnly) {
      setConnectionDrag(null);
      setPendingConnection(null);
      return;
    }

    if (connectionDrag.type === "new") {
      if (connectionDrag.started) {
        onConnectionCancel?.();
      }
      setConnectionDrag(null);
      setPendingConnection(null);
      return;
    }

    removeEdge(connectionDrag.edge, "endpoint-detach");
    setConnectionDrag(null);
    setPendingConnection(null);
  };

  const completeConnectionDragFromPointer = (
    event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
  ) => {
    if (!connectionDrag || readOnly) {
      return;
    }

    const direction = connectionDrag.type === "rewire-source" ? "output" : "input";
    const portElement = getWorkflowBuilderPortElementFromPoint(
      event.clientX,
      event.clientY,
      direction,
    );
    const nodeElement = portElement?.closest<HTMLElement>("[data-slot='workflow-builder-node']");
    const nodeId = nodeElement?.dataset.nodeId;
    const portId = portElement?.dataset.portId;

    if (nodeId && portId && completeConnectionDragOnPort(direction, nodeId, portId)) {
      return;
    }

    cancelOrDetachConnectionDrag();
  };

  const changeNodeMinimized = (nodeId: string, minimized: boolean) => {
    onNodesChange?.(nodes.map((node) => (node.id === nodeId ? { ...node, minimized } : node)));
  };

  const fitView = () => {
    if (!canvasSize || nodes.length === 0) {
      commitViewport({ x: 0, y: 0, zoom: 1 });
      return;
    }

    const bounds = getWorkflowBounds(nodes);
    const padding = 48;
    const nextZoom = Math.min(
      maxZoom,
      Math.max(
        minZoom,
        Math.min(
          canvasSize.width / Math.max(bounds.width + padding * 2, 1),
          canvasSize.height / Math.max(bounds.height + padding * 2, 1),
        ),
      ),
    );

    commitViewport({
      x: Math.round(padding - bounds.x * nextZoom),
      y: Math.round(padding - bounds.y * nextZoom),
      zoom: nextZoom,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelection();
    }
    if (event.key === "Escape") {
      if (pendingConnection || connectionDrag?.type === "new") {
        onConnectionCancel?.();
      }
      setPendingConnection(null);
      setConnectionDrag(null);
      commitSelection(null);
    }
  };

  React.useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const measuredPortPoints = measureWorkflowBuilderPortPoints(viewport, currentZoom);

    if (Object.keys(measuredPortPoints).length === 0) {
      setPortPoints((currentPortPoints) =>
        Object.keys(currentPortPoints).length === 0 ? currentPortPoints : {},
      );
      return;
    }

    setPortPoints((currentPortPoints) =>
      workflowBuilderPortPointMapsAreEqual(currentPortPoints, measuredPortPoints)
        ? currentPortPoints
        : measuredPortPoints,
    );
  }, [connectionDrag, currentZoom, edges, nodes, pendingConnection]);

  return (
    <div
      data-slot="workflow-builder"
      data-read-only={readOnly ? "true" : undefined}
      className={cn("space-y-3", className)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <WorkflowBuilderToolbar
        zoom={currentZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        readOnly={readOnly}
        selectedLabel={selectedNode?.label ?? selectedEdge?.id}
        toolbarLabel={toolbarLabel}
        onZoomChange={commitZoom}
        onFitView={fitView}
        onDeleteSelection={deleteSelection}
      />
      <div
        data-slot="workflow-builder-surface"
        tabIndex={0}
        className="relative overflow-auto rounded-md border bg-muted/20"
        style={{ height: typeof surfaceHeight === "number" ? `${surfaceHeight}px` : surfaceHeight }}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          completeConnectionDragFromPointer(event);
          setDragState(null);
        }}
        onPointerLeave={() => setDragState(null)}
        onMouseMove={handlePointerMove}
        onMouseUp={(event) => {
          completeConnectionDragFromPointer(event);
          setDragState(null);
        }}
        onMouseLeave={() => setDragState(null)}
      >
        <div
          ref={viewportRef}
          data-slot="workflow-builder-viewport"
          className="relative min-h-[52rem] min-w-[72rem] origin-top-left"
          style={{
            transform: `translate(${currentViewport.x}px, ${currentViewport.y}px) scale(${currentZoom})`,
            minWidth: canvasSize?.width,
            minHeight: canvasSize?.height,
            width: `${100 / currentZoom}%`,
          }}
        >
          <svg
            data-slot="workflow-builder-edges"
            aria-label="Workflow connections"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            {edges.map((edge) => {
              const line = getWorkflowEdgeLine(nodes, edge, portPoints);
              const selected = edge.id === currentSelectedEdgeId;
              const showEndpointHandles = !readOnly && (selected || edge.id === hoveredEdgeId);
              const sourcePoint = getWorkflowEdgeEndpointPoint(nodes, edge, "source", portPoints);
              const targetPoint = getWorkflowEdgeEndpointPoint(nodes, edge, "target", portPoints);
              return (
                <g
                  key={edge.id}
                  onPointerEnter={() => setHoveredEdgeId(edge.id)}
                  onPointerLeave={() =>
                    setHoveredEdgeId((currentHoveredEdgeId) =>
                      currentHoveredEdgeId === edge.id ? null : currentHoveredEdgeId,
                    )
                  }
                >
                  <path
                    data-slot="workflow-builder-edge-hit"
                    role="button"
                    tabIndex={0}
                    aria-label={`Connection ${edge.id}`}
                    d={line.path}
                    className="pointer-events-auto cursor-pointer fill-none stroke-transparent"
                    strokeWidth={16}
                    onClick={() => selectEdge(edge)}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      if (!readOnly) {
                        removeEdge(edge, "edge-double-click");
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectEdge(edge);
                      }
                    }}
                  />
                  <path
                    data-slot="workflow-builder-edge"
                    data-status={edge.status}
                    data-selected={selected ? "true" : undefined}
                    d={line.path}
                    className={cn(
                      "fill-none stroke-border",
                      selected && "stroke-primary",
                      edge.status === "error" && "stroke-destructive",
                      edge.status === "success" && "stroke-emerald-500",
                      edge.status === "running" && "stroke-blue-500",
                    )}
                    strokeWidth={selected ? 3 : 2}
                  />
                  {showEndpointHandles ? (
                    <>
                      <WorkflowBuilderEdgeHandle
                        label={`Rewire source for connection ${edge.id}`}
                        point={sourcePoint}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          selectEdge(edge);
                          setPendingConnection(null);
                          const pointerPoint = getWorkflowBuilderPointerPoint(
                            event,
                            viewportRef.current,
                            currentZoom,
                          );
                          setConnectionDrag({
                            type: "rewire-source",
                            edge,
                            startPoint: pointerPoint,
                            pointerPoint,
                          });
                        }}
                      />
                      <WorkflowBuilderEdgeHandle
                        label={`Rewire target for connection ${edge.id}`}
                        point={targetPoint}
                        onPointerDown={(event) => {
                          event.stopPropagation();
                          selectEdge(edge);
                          setPendingConnection(null);
                          const pointerPoint = getWorkflowBuilderPointerPoint(
                            event,
                            viewportRef.current,
                            currentZoom,
                          );
                          setConnectionDrag({
                            type: "rewire-target",
                            edge,
                            startPoint: pointerPoint,
                            pointerPoint,
                          });
                        }}
                      />
                    </>
                  ) : null}
                </g>
              );
            })}
            {connectionDrag ? (
              <path
                data-slot="workflow-builder-connection-preview"
                d={getWorkflowConnectionDragLine(nodes, connectionDrag, portPoints).path}
                className={cn(
                  "fill-none stroke-muted-foreground",
                  connectionDrag.targetValid === true && "stroke-primary",
                  connectionDrag.targetValid === false && "stroke-destructive",
                )}
                strokeDasharray={connectionDrag.targetValid ? undefined : "6 5"}
                strokeWidth={3}
              />
            ) : null}
          </svg>
          {nodes.map((node) => (
            <WorkflowBuilderNode
              key={node.id}
              node={node}
              selected={node.id === currentSelectedNodeId}
              readOnly={readOnly}
              pendingConnection={pendingConnection}
              inputsConnectable={
                connectionDrag?.type === "new" || connectionDrag?.type === "rewire-target"
              }
              onNodeSelect={selectNode}
              onNodeMinimizedChange={onNodesChange ? changeNodeMinimized : undefined}
              onStartConnection={(sourceNodeId, sourcePortId) => {
                if (suppressNextPortClickRef.current) {
                  suppressNextPortClickRef.current = false;
                  return;
                }
                const nextConnection = { sourceNodeId, sourcePortId };
                if (
                  pendingConnection?.sourceNodeId === sourceNodeId &&
                  pendingConnection.sourcePortId === sourcePortId
                ) {
                  return;
                }
                setConnectionDrag(null);
                setPendingConnection(nextConnection);
                onConnectionStart?.(nextConnection);
              }}
              onCompleteConnection={completeConnection}
              onInputPointerUp={(_, nodeId, portId) => {
                completeConnectionDragOnPort("input", nodeId, portId);
              }}
              onOutputPointerDown={(event, nodeId, portId) => {
                if (readOnly || (event.button !== 0 && event.button !== undefined)) {
                  return;
                }
                const pointerPoint = getWorkflowBuilderPointerPoint(
                  event,
                  viewportRef.current,
                  currentZoom,
                );
                const nextConnection = { sourceNodeId: nodeId, sourcePortId: portId };
                setPendingConnection(null);
                setPendingConnection(nextConnection);
                onConnectionStart?.(nextConnection);
                setConnectionDrag({
                  type: "new",
                  sourceNodeId: nodeId,
                  sourcePortId: portId,
                  startPoint: pointerPoint,
                  pointerPoint,
                  started: true,
                });
              }}
              onOutputPointerUp={(_, nodeId, portId) => {
                completeConnectionDragOnPort("output", nodeId, portId);
              }}
              onNodePointerDown={handleNodePointerDown}
            />
          ))}
        </div>
        {showMiniMap ? (
          <WorkflowBuilderMiniMap
            nodes={nodes}
            edges={edges}
            selectedNodeId={currentSelectedNodeId}
            className="absolute right-3 bottom-3"
          />
        ) : null}
      </div>
    </div>
  );
}

function WorkflowBuilderNode({
  node,
  selected,
  readOnly,
  pendingConnection,
  inputsConnectable,
  onNodeSelect,
  onNodeMinimizedChange,
  onStartConnection,
  onCompleteConnection,
  onInputPointerUp,
  onOutputPointerDown,
  onOutputPointerUp,
  onNodePointerDown,
  className,
  ...props
}: WorkflowBuilderNodeProps) {
  const nodeSize = getWorkflowNodeSize(node);

  return (
    <div
      data-slot="workflow-builder-node"
      data-node-id={node.id}
      data-selected={selected ? "true" : undefined}
      data-status={node.status}
      className={cn("absolute", className)}
      style={{ left: node.x, top: node.y, width: nodeSize.width }}
      onPointerDown={(event) => onNodePointerDown?.(event, node)}
      onMouseDown={(event) => onNodePointerDown?.(event, node)}
      {...props}
    >
      <WorkflowNode
        node={node}
        selected={selected}
        readOnly={readOnly}
        inputDisabled={readOnly || !(pendingConnection || inputsConnectable)}
        outputDisabled={readOnly}
        onNodeSelect={() => onNodeSelect?.(node)}
        onMinimizedChange={(_, minimized) => onNodeMinimizedChange?.(node.id, minimized)}
        onInputClick={(port) => onCompleteConnection?.(node.id, port.id)}
        onOutputClick={(port) => onStartConnection?.(node.id, port.id)}
        onInputPointerUp={(port, _, event) => onInputPointerUp?.(event, node.id, port.id)}
        onOutputPointerDown={(port, _, event) => onOutputPointerDown?.(event, node.id, port.id)}
        onOutputPointerUp={(port, _, event) => onOutputPointerUp?.(event, node.id, port.id)}
        getInputAriaLabel={(port) => `Connect to ${node.label} ${port.label}`}
        getOutputAriaLabel={(port) => `Start ${node.label} ${port.label}`}
      />
    </div>
  );
}

function WorkflowBuilderToolbar({
  zoom,
  minZoom = 0.5,
  maxZoom = 1.75,
  readOnly,
  selectedLabel,
  toolbarLabel = "Workflow",
  onZoomChange,
  onFitView,
  onDeleteSelection,
  className,
  ...props
}: WorkflowBuilderToolbarProps) {
  return (
    <div
      data-slot="workflow-builder-toolbar"
      role="toolbar"
      aria-label="Workflow builder controls"
      className={cn("flex flex-wrap items-center justify-between gap-2", className)}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <WorkflowIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        {toolbarLabel}
        {selectedLabel ? <Badge variant="secondary">{selectedLabel}</Badge> : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Zoom out"
          disabled={zoom <= minZoom}
          onClick={() => onZoomChange?.(zoom - 0.1)}
        >
          <MinusIcon />
        </Button>
        <span className="min-w-12 text-center text-xs text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Zoom in"
          disabled={zoom >= maxZoom}
          onClick={() => onZoomChange?.(zoom + 0.1)}
        >
          <PlusIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Fit view"
          onClick={onFitView}
        >
          <Maximize2Icon />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Delete selected"
          disabled={readOnly || !selectedLabel}
          onClick={onDeleteSelection}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

function WorkflowBuilderMiniMap({
  nodes,
  edges: _edges,
  selectedNodeId,
  className,
  ...props
}: WorkflowBuilderMiniMapProps) {
  void _edges;
  const bounds = getWorkflowBounds(nodes);

  return (
    <div
      data-slot="workflow-builder-minimap"
      role="img"
      aria-label="Workflow minimap"
      className={cn("h-24 w-36 rounded-md border bg-background/90 p-2 shadow-sm", className)}
      {...props}
    >
      <div className="relative size-full">
        {nodes.map((node) => {
          const left = ((node.x - bounds.x) / bounds.width) * 100;
          const top = ((node.y - bounds.y) / bounds.height) * 100;
          return (
            <span
              key={node.id}
              data-slot="workflow-builder-minimap-node"
              data-selected={node.id === selectedNodeId ? "true" : undefined}
              className="absolute size-2 rounded-sm bg-muted-foreground data-[selected=true]:bg-primary"
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function WorkflowBuilderEdgeHandle({
  label,
  point,
  onPointerDown,
}: {
  label: string;
  point: WorkflowBuilderPoint;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
}) {
  return (
    <g
      data-slot="workflow-builder-edge-handle"
      role="button"
      tabIndex={0}
      aria-label={label}
      className="pointer-events-auto cursor-grab outline-none"
      transform={`translate(${point.x} ${point.y})`}
      onPointerDown={onPointerDown}
    >
      <circle r={12} className="fill-transparent" />
      <circle r={5} className="fill-background stroke-primary" strokeWidth={2} />
    </g>
  );
}

function getWorkflowBuilderConnectionValidity({
  nodes,
  edges,
  sourceNodeId,
  sourcePortId,
  targetNodeId,
  targetPortId,
  ignoreEdgeId,
}: WorkflowBuilderConnectionValidityInput): WorkflowBuilderConnectionValidity {
  const sourceNode = nodes.find((node) => node.id === sourceNodeId);
  const targetNode = nodes.find((node) => node.id === targetNodeId);
  const sourcePort = sourceNode?.outputs?.find((port) => port.id === sourcePortId);
  const targetPort = targetNode?.inputs?.find((port) => port.id === targetPortId);

  if (!sourceNode || !targetNode || !sourcePort || !targetPort) {
    return { valid: false, reason: "missing-port" };
  }

  if (sourceNodeId === targetNodeId) {
    return { valid: false, reason: "self-connection" };
  }

  const sourceType = getWorkflowBuilderPortTypeSource(sourcePort);
  const targetType = getWorkflowBuilderPortTypeSource(targetPort);

  if (sourceType && targetType && sourceType !== targetType) {
    return { valid: false, reason: "type-mismatch" };
  }

  if (sourcePort.kind && targetPort.kind && sourcePort.kind !== targetPort.kind) {
    return { valid: false, reason: "kind-mismatch" };
  }

  const duplicate = edges.some(
    (edge) =>
      edge.id !== ignoreEdgeId &&
      edge.sourceNodeId === sourceNodeId &&
      edge.sourcePortId === sourcePortId &&
      edge.targetNodeId === targetNodeId &&
      edge.targetPortId === targetPortId,
  );

  if (duplicate) {
    return { valid: false, reason: "duplicate" };
  }

  const incomingEdge = getWorkflowBuilderIncomingEdge(
    edges,
    targetNodeId,
    targetPortId,
    ignoreEdgeId,
  );

  if (incomingEdge) {
    return { valid: false, reason: "input-occupied" };
  }

  return { valid: true };
}

function getWorkflowBuilderIncomingEdge(
  edges: WorkflowBuilderEdge[],
  targetNodeId: string,
  targetPortId: string,
  ignoreEdgeId?: string,
) {
  return edges.find(
    (edge) =>
      edge.id !== ignoreEdgeId &&
      edge.targetNodeId === targetNodeId &&
      edge.targetPortId === targetPortId,
  );
}

function getWorkflowEdgeLine(
  nodes: WorkflowBuilderNodeData[],
  edge: WorkflowBuilderEdge,
  portPoints: WorkflowBuilderPortPointMap = {},
) {
  const sourceNode = nodes.find((node) => node.id === edge.sourceNodeId);
  const targetNode = nodes.find((node) => node.id === edge.targetNodeId);
  const source = sourceNode
    ? getWorkflowNodePortPoint(sourceNode, "output", edge.sourcePortId, portPoints)
    : { x: 0, y: 0 };
  const target = targetNode
    ? getWorkflowNodePortPoint(targetNode, "input", edge.targetPortId, portPoints)
    : { x: 0, y: 0 };
  const handle = Math.max(48, Math.abs(target.x - source.x) / 2);

  return {
    path: `M ${source.x} ${source.y} C ${source.x + handle} ${source.y}, ${target.x - handle} ${target.y}, ${target.x} ${target.y}`,
  };
}

function getWorkflowBuilderConnectionPreviewLine(
  source: WorkflowBuilderPoint,
  target: WorkflowBuilderPoint,
) {
  const handle = Math.max(48, Math.abs(target.x - source.x) / 2);

  return {
    path: `M ${source.x} ${source.y} C ${source.x + handle} ${source.y}, ${target.x - handle} ${target.y}, ${target.x} ${target.y}`,
  };
}

function getWorkflowConnectionDragLine(
  nodes: WorkflowBuilderNodeData[],
  drag: WorkflowBuilderConnectionDrag,
  portPoints: WorkflowBuilderPortPointMap = {},
) {
  if (drag.type === "rewire-source") {
    const targetNode = nodes.find((node) => node.id === drag.edge.targetNodeId);
    const target = targetNode
      ? getWorkflowNodePortPoint(targetNode, "input", drag.edge.targetPortId, portPoints)
      : drag.pointerPoint;

    return getWorkflowBuilderConnectionPreviewLine(drag.pointerPoint, target);
  }

  const sourceNode = nodes.find((node) =>
    drag.type === "new" ? node.id === drag.sourceNodeId : node.id === drag.edge.sourceNodeId,
  );
  const sourcePortId = drag.type === "new" ? drag.sourcePortId : drag.edge.sourcePortId;
  const source = sourceNode
    ? getWorkflowNodePortPoint(sourceNode, "output", sourcePortId, portPoints)
    : drag.pointerPoint;

  return getWorkflowBuilderConnectionPreviewLine(source, drag.pointerPoint);
}

function getWorkflowEdgeEndpointPoint(
  nodes: WorkflowBuilderNodeData[],
  edge: WorkflowBuilderEdge,
  endpoint: "source" | "target",
  portPoints: WorkflowBuilderPortPointMap = {},
) {
  const node = nodes.find((currentNode) =>
    endpoint === "source"
      ? currentNode.id === edge.sourceNodeId
      : currentNode.id === edge.targetNodeId,
  );

  if (!node) {
    return { x: 0, y: 0 };
  }

  return getWorkflowNodePortPoint(
    node,
    endpoint === "source" ? "output" : "input",
    endpoint === "source" ? edge.sourcePortId : edge.targetPortId,
    portPoints,
  );
}

function getWorkflowNodePortPoint(
  node: WorkflowBuilderNodeData,
  direction: WorkflowBuilderPortDirection,
  portId: string,
  portPoints: WorkflowBuilderPortPointMap = {},
): WorkflowBuilderPoint {
  const size = getWorkflowNodeSize(node);
  const compact = node.variant === "compact";
  const measuredPoint = portPoints[getWorkflowBuilderPortPointKey(node.id, direction, portId)];

  if (measuredPoint) {
    return measuredPoint;
  }

  const x = node.x + getWorkflowNodePortDotXOffset(node, direction);

  if (compact) {
    return {
      x,
      y: node.y + size.height / 2,
    };
  }

  const ports = direction === "input" ? (node.inputs ?? []) : (node.outputs ?? []);
  const portIndex = ports.findIndex((port) => port.id === portId);

  if (portIndex === -1) {
    return {
      x,
      y: node.y + size.height / 2,
    };
  }

  return {
    x,
    y: node.y + getWorkflowNodePortCenterOffset(node, portIndex),
  };
}

function getWorkflowBounds(nodes: WorkflowBuilderNodeData[]) {
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs, 0);
  const minY = Math.min(...ys, 0);
  const sizes = nodes.map((node) => getWorkflowNodeSize(node));
  const maxX = Math.max(
    ...xs.map((x, index) => x + sizes[index]!.width),
    workflowNodeSizeFallback().width,
  );
  const maxY = Math.max(
    ...ys.map((y, index) => y + sizes[index]!.height),
    workflowNodeSizeFallback().height,
  );

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function getWorkflowNodePortDotXOffset(
  node: WorkflowBuilderNodeData,
  direction: WorkflowBuilderPortDirection,
) {
  const size = getWorkflowNodeSize(node);

  return direction === "input" ? 0 : size.width;
}

function getWorkflowBuilderSnappedNodePosition(
  node: WorkflowBuilderNodeData,
  nodes: WorkflowBuilderNodeData[],
  position: WorkflowBuilderPoint,
): WorkflowBuilderPoint {
  let closestSnap: (WorkflowBuilderPoint & { distance: number }) | null = null;
  const nodeSize = getWorkflowNodeSize(node);

  for (const otherNode of nodes) {
    if (otherNode.id === node.id) {
      continue;
    }

    const otherSize = getWorkflowNodeSize(otherNode);

    for (const inputMatch of getWorkflowBuilderPortMatches(node.inputs, otherNode.outputs)) {
      const snap = {
        x: otherNode.x + otherSize.width,
        y:
          otherNode.y +
          getWorkflowNodePortCenterOffset(otherNode, inputMatch.otherIndex) -
          getWorkflowNodePortCenterOffset(node, inputMatch.nodeIndex),
      };
      const distance = getWorkflowPointDistance(position, snap);

      if (
        distance <= workflowBuilderSnapDistance &&
        (!closestSnap || distance < closestSnap.distance)
      ) {
        closestSnap = { ...snap, distance };
      }
    }

    for (const outputMatch of getWorkflowBuilderPortMatches(node.outputs, otherNode.inputs)) {
      const snap = {
        x: otherNode.x - nodeSize.width,
        y:
          otherNode.y +
          getWorkflowNodePortCenterOffset(otherNode, outputMatch.otherIndex) -
          getWorkflowNodePortCenterOffset(node, outputMatch.nodeIndex),
      };
      const distance = getWorkflowPointDistance(position, snap);

      if (
        distance <= workflowBuilderSnapDistance &&
        (!closestSnap || distance < closestSnap.distance)
      ) {
        closestSnap = { ...snap, distance };
      }
    }
  }

  return closestSnap ? { x: closestSnap.x, y: closestSnap.y } : position;
}

function getWorkflowBuilderPortMatches(
  nodePorts: readonly WorkflowBuilderPort[] | undefined,
  otherPorts: readonly WorkflowBuilderPort[] | undefined,
) {
  const matches: { nodeIndex: number; otherIndex: number }[] = [];

  nodePorts?.forEach((nodePort, nodeIndex) => {
    otherPorts?.forEach((otherPort, otherIndex) => {
      if (workflowBuilderPortsMatch(nodePort, otherPort)) {
        matches.push({ nodeIndex, otherIndex });
      }
    });
  });

  return matches;
}

function workflowBuilderPortsMatch(
  firstPort: WorkflowBuilderPort,
  secondPort: WorkflowBuilderPort,
) {
  return getWorkflowBuilderPortMatchKey(firstPort) === getWorkflowBuilderPortMatchKey(secondPort);
}

function getWorkflowBuilderPortMatchKey(port: WorkflowBuilderPort) {
  const typeSource = getWorkflowBuilderPortTypeSource(port);

  if (typeSource) {
    return `type:${typeSource}`;
  }

  return (port.kind ?? port.id ?? port.label).trim().toLowerCase();
}

function getWorkflowBuilderPortTypeSource(port: WorkflowBuilderPort) {
  if (!port.type) {
    return undefined;
  }

  return (typeof port.type === "string" ? port.type : port.type.source).trim();
}

function getWorkflowPointDistance(
  firstPoint: WorkflowBuilderPoint,
  secondPoint: WorkflowBuilderPoint,
) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function measureWorkflowBuilderPortPoints(
  viewport: HTMLElement,
  zoom: number,
): WorkflowBuilderPortPointMap {
  const viewportRect = viewport.getBoundingClientRect();

  if (viewportRect.width === 0 || viewportRect.height === 0 || zoom <= 0) {
    return {};
  }

  const portPoints: WorkflowBuilderPortPointMap = {};
  const portElements = viewport.querySelectorAll<HTMLElement>(
    "[data-slot='workflow-node-port'][data-port-id]",
  );

  portElements.forEach((portElement) => {
    const nodeElement = portElement.closest<HTMLElement>("[data-slot='workflow-builder-node']");
    const dotElement = portElement.querySelector<HTMLElement>(
      "[data-slot='workflow-node-port-dot']",
    );
    const nodeId = nodeElement?.dataset.nodeId;
    const portId = portElement.dataset.portId;
    const direction = portElement.dataset.portDirection as WorkflowBuilderPortDirection | undefined;

    if (!nodeId || !portId || !dotElement || !isWorkflowBuilderPortDirection(direction)) {
      return;
    }

    const dotRect = dotElement.getBoundingClientRect();

    if (dotRect.width === 0 || dotRect.height === 0) {
      return;
    }

    portPoints[getWorkflowBuilderPortPointKey(nodeId, direction, portId)] = {
      x: (dotRect.left + dotRect.width / 2 - viewportRect.left) / zoom,
      y: (dotRect.top + dotRect.height / 2 - viewportRect.top) / zoom,
    };
  });

  return portPoints;
}

function workflowBuilderPortPointMapsAreEqual(
  first: WorkflowBuilderPortPointMap,
  second: WorkflowBuilderPortPointMap,
) {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);

  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every((key) => first[key]?.x === second[key]?.x && first[key]?.y === second[key]?.y)
  );
}

function getWorkflowBuilderPortPointKey(
  nodeId: string,
  direction: WorkflowBuilderPortDirection,
  portId: string,
) {
  return getWorkflowBuilderPortKey(nodeId, direction, portId);
}

function getWorkflowBuilderPortKey(
  nodeId: string,
  direction: WorkflowBuilderPortDirection,
  portId: string,
) {
  return `${nodeId}:${direction}:${portId}`;
}

function isWorkflowBuilderPortDirection(
  direction: string | undefined,
): direction is WorkflowBuilderPortDirection {
  return direction === "input" || direction === "output";
}

function isWorkflowNodeControlEvent(target: EventTarget) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        [
          "[data-slot='workflow-builder-port']",
          "[data-slot='workflow-node-port']",
          "[data-slot='workflow-node-minimize']",
          "[data-slot='workflow-node-menu-trigger']",
        ].join(", "),
      ),
    )
  );
}

function getWorkflowPointer(event: React.PointerEvent<Element> | React.MouseEvent<Element>) {
  const nativeEvent = event.nativeEvent as (PointerEvent | MouseEvent) & {
    pageX?: number;
    pageY?: number;
    x?: number;
    y?: number;
  };
  const x = [nativeEvent.clientX, nativeEvent.pageX, nativeEvent.x, event.clientX].find(
    (value) => typeof value === "number" && Number.isFinite(value),
  );
  const y = [nativeEvent.clientY, nativeEvent.pageY, nativeEvent.y, event.clientY].find(
    (value) => typeof value === "number" && Number.isFinite(value),
  );

  return {
    x: x ?? 0,
    y: y ?? 0,
  };
}

function getWorkflowBuilderPointerPoint(
  event: React.PointerEvent<Element> | React.MouseEvent<Element>,
  viewport: HTMLElement | null,
  zoom: number,
) {
  const pointer = getWorkflowPointer(event);
  const viewportRect = viewport?.getBoundingClientRect();

  if (!viewportRect || zoom <= 0) {
    return pointer;
  }

  return {
    x: (pointer.x - viewportRect.left) / zoom,
    y: (pointer.y - viewportRect.top) / zoom,
  };
}

function getWorkflowBuilderPortElementFromPoint(
  clientX: number,
  clientY: number,
  direction: WorkflowBuilderPortDirection,
) {
  const elementFromPoint = document.elementFromPoint?.(clientX, clientY);
  const portElement = elementFromPoint?.closest<HTMLElement>(
    `[data-slot='workflow-node-port'][data-port-direction='${direction}'][data-port-id]`,
  );

  return portElement ?? null;
}

function clampWorkflowValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function workflowNodeSizeFallback() {
  return {
    width: 248,
    height: 124,
  };
}

export {
  WorkflowBuilder,
  WorkflowBuilderMiniMap,
  WorkflowBuilderNode,
  WorkflowBuilderToolbar,
  getWorkflowBuilderConnectionValidity,
};
export type {
  WorkflowBuilderConnection,
  WorkflowBuilderConnectionValidity,
  WorkflowBuilderConnectionValidityInput,
  WorkflowBuilderDisconnectReason,
  WorkflowBuilderEdge,
  WorkflowBuilderNodeData,
  WorkflowBuilderPort,
  WorkflowBuilderProps,
  WorkflowBuilderSelection,
  WorkflowBuilderViewport,
};

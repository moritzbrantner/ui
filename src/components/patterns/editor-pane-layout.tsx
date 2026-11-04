"use client";

import * as React from "react";
import {
  PanelBottomCloseIcon,
  PanelBottomOpenIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PanelTopCloseIcon,
  PanelTopOpenIcon,
  XIcon,
} from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../stable/button";

type EditorPaneLayoutOrientation = "horizontal" | "vertical";
type EditorPaneSide = "start" | "end";
type EditorPanePresentation = "docked" | "overlay";

type EditorPaneSnapshot = {
  label: string;
  side: EditorPaneSide;
  orientation: EditorPaneLayoutOrientation;
  open: boolean;
};

type EditorPaneLayoutContextValue = {
  orientation: EditorPaneLayoutOrientation;
  presentation: EditorPanePresentation;
  panes: Readonly<Record<string, EditorPaneSnapshot>>;
  registerPane: (id: string, snapshot: EditorPaneSnapshot, toggle: () => void) => void;
  unregisterPane: (id: string) => void;
  togglePane: (id: string) => void;
  setResizing: (resizing: boolean) => void;
};

type EditorPaneContextValue = {
  id: string;
  label: string;
  side: EditorPaneSide;
  open: boolean;
  closable: boolean;
  presentation: EditorPanePresentation;
  orientation: EditorPaneLayoutOrientation;
  setOpen: (open: boolean) => void;
};

const EditorPaneLayoutContext = React.createContext<EditorPaneLayoutContextValue | null>(null);
const EditorPaneContext = React.createContext<EditorPaneContextValue | null>(null);

const DEFAULT_NARROW_BREAKPOINT = 768;
const DEFAULT_PANE_SIZE = 280;
const DEFAULT_MIN_SIZE = 180;
const DEFAULT_MAX_SIZE = 560;
const DEFAULT_KEYBOARD_STEP = 16;
const DEFAULT_LARGE_KEYBOARD_STEP = 64;

function useEditorPaneLayoutContext(component: string) {
  const context = React.useContext(EditorPaneLayoutContext);
  if (!context) throw new Error(`${component} must be rendered inside EditorPaneLayout.`);
  return context;
}

/** Returns the surrounding pane state, or `null` outside an `EditorPane`. */
function useEditorPane() {
  return React.useContext(EditorPaneContext);
}

function clampSize(size: number, min: number, max: number) {
  return Math.min(Math.max(size, min), Math.max(min, max));
}

function isRtl(element: Element | null) {
  if (!element || typeof window === "undefined") return false;
  return window.getComputedStyle(element).direction === "rtl";
}

export type EditorPaneLayoutProps = React.ComponentProps<"div"> & {
  /** `horizontal` places start/end panes left/right of the main region; `vertical` places them above/below. */
  orientation?: EditorPaneLayoutOrientation;
  /**
   * `auto` docks panes and switches horizontal layouts to overlay drawers below `narrowBreakpoint`.
   * `docked` and `overlay` force one presentation.
   */
  presentation?: "auto" | EditorPanePresentation;
  /**
   * Container inline size in pixels below which `auto` presentation uses overlay panes and docked
   * splitters get full-size touch grab areas.
   */
  narrowBreakpoint?: number;
  onPresentationChange?: (presentation: EditorPanePresentation) => void;
};

function EditorPaneLayout({
  orientation = "horizontal",
  presentation = "auto",
  narrowBreakpoint = DEFAULT_NARROW_BREAKPOINT,
  onPresentationChange,
  className,
  ref,
  children,
  ...props
}: EditorPaneLayoutProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [narrow, setNarrow] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);
  const [panes, setPanes] = React.useState<Record<string, EditorPaneSnapshot>>({});
  const togglesRef = React.useRef(new Map<string, () => void>());
  // Nested layouts also register their panes with ancestors, so a toggle in an outer toolbar can
  // reach a pane inside an inner layout.
  const parent = React.useContext(EditorPaneLayoutContext);
  const parentRegister = parent?.registerPane;
  const parentUnregister = parent?.unregisterPane;

  React.useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = (width: number) => setNarrow(width > 0 && width < narrowBreakpoint);
    measure(element.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [narrowBreakpoint]);

  const resolvedPresentation: EditorPanePresentation =
    orientation === "vertical"
      ? "docked"
      : presentation === "auto"
        ? narrow
          ? "overlay"
          : "docked"
        : presentation;

  const onPresentationChangeRef = React.useRef(onPresentationChange);
  onPresentationChangeRef.current = onPresentationChange;
  const previousPresentation = React.useRef(resolvedPresentation);
  React.useEffect(() => {
    if (previousPresentation.current === resolvedPresentation) return;
    previousPresentation.current = resolvedPresentation;
    onPresentationChangeRef.current?.(resolvedPresentation);
  }, [resolvedPresentation]);

  const registerPane = React.useCallback(
    (id: string, snapshot: EditorPaneSnapshot, toggle: () => void) => {
      togglesRef.current.set(id, toggle);
      setPanes((current) => {
        const existing = current[id];
        if (
          existing &&
          existing.label === snapshot.label &&
          existing.side === snapshot.side &&
          existing.orientation === snapshot.orientation &&
          existing.open === snapshot.open
        )
          return current;
        return { ...current, [id]: snapshot };
      });
      parentRegister?.(id, snapshot, toggle);
    },
    [parentRegister],
  );
  const unregisterPane = React.useCallback(
    (id: string) => {
      togglesRef.current.delete(id);
      setPanes((current) => {
        if (!(id in current)) return current;
        const next = { ...current };
        delete next[id];
        return next;
      });
      parentUnregister?.(id);
    },
    [parentUnregister],
  );
  const togglePane = React.useCallback((id: string) => togglesRef.current.get(id)?.(), []);

  const context = React.useMemo<EditorPaneLayoutContextValue>(
    () => ({
      orientation,
      presentation: resolvedPresentation,
      panes,
      registerPane,
      unregisterPane,
      togglePane,
      setResizing,
    }),
    [orientation, panes, registerPane, resolvedPresentation, togglePane, unregisterPane],
  );

  return (
    <EditorPaneLayoutContext.Provider value={context}>
      <div
        {...props}
        ref={(element) => {
          rootRef.current = element;
          if (typeof ref === "function") return ref(element);
          if (ref) ref.current = element;
        }}
        data-slot="editor-pane-layout"
        data-orientation={orientation}
        data-presentation={resolvedPresentation}
        data-resizing={resizing ? "true" : undefined}
        data-narrow={narrow ? "true" : undefined}
        className={cn(
          "group/editor-panes relative flex h-full min-h-0 w-full min-w-0 overflow-hidden data-[orientation=vertical]:flex-col data-[resizing=true]:select-none",
          className,
        )}
      >
        {children}
      </div>
    </EditorPaneLayoutContext.Provider>
  );
}

export type EditorPaneMainProps = React.ComponentProps<"div">;

/** The dominant work surface between panes. It always takes the remaining space. */
function EditorPaneMain({ className, ...props }: EditorPaneMainProps) {
  return (
    <div
      data-slot="editor-pane-main"
      className={cn("relative min-h-0 min-w-0 flex-1 basis-0 overflow-auto", className)}
      {...props}
    />
  );
}

export type EditorPaneProps = Omit<React.ComponentProps<"section">, "aria-label"> & {
  /** Which edge of the layout the pane is attached to. */
  side: EditorPaneSide;
  /** Accessible pane name, also used by the resizer, rail, and toggle labels. */
  label: string;
  /** Controlled size in pixels along the layout axis. */
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  /** Called once a pointer or keyboard resize finishes; a good moment to persist layout. */
  onResizeEnd?: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  collapsible?: boolean;
  /** Controlled docked collapse state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Controlled open state while the layout presents panes as overlays. */
  overlayOpen?: boolean;
  defaultOverlayOpen?: boolean;
  onOverlayOpenChange?: (open: boolean) => void;
  /** Show a compact rail with an expand button while the pane is collapsed or a closed overlay. */
  rail?: boolean;
  keyboardStep?: number;
  largeKeyboardStep?: number;
};

function EditorPane({
  side,
  label,
  id,
  size: sizeProp,
  defaultSize = DEFAULT_PANE_SIZE,
  onSizeChange,
  onResizeEnd,
  minSize = DEFAULT_MIN_SIZE,
  maxSize = DEFAULT_MAX_SIZE,
  resizable = true,
  collapsible = true,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  overlayOpen: overlayOpenProp,
  defaultOverlayOpen = false,
  onOverlayOpenChange,
  rail = true,
  keyboardStep = DEFAULT_KEYBOARD_STEP,
  largeKeyboardStep = DEFAULT_LARGE_KEYBOARD_STEP,
  className,
  style,
  children,
  onKeyDown,
  onBlur,
  ...props
}: EditorPaneProps) {
  const layout = useEditorPaneLayoutContext("EditorPane");
  const generatedId = React.useId();
  const paneId = id ?? `editor-pane-${generatedId.replaceAll(":", "")}`;
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const railButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const resizerRef = React.useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);
  const focusAfterCloseRef = React.useRef(false);

  const [internalSize, setInternalSize] = React.useState(() =>
    clampSize(defaultSize, minSize, maxSize),
  );
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  const [internalOverlayOpen, setInternalOverlayOpen] = React.useState(defaultOverlayOpen);
  const size = clampSize(sizeProp ?? internalSize, minSize, maxSize);
  const collapsed = collapsible ? (collapsedProp ?? internalCollapsed) : false;
  const overlayOpen = overlayOpenProp ?? internalOverlayOpen;
  const overlay = layout.presentation === "overlay";
  const open = overlay ? overlayOpen : !collapsed;
  const horizontal = layout.orientation === "horizontal";

  const latestSizeRef = React.useRef(size);
  latestSizeRef.current = size;
  const setSize = (next: number) => {
    const clamped = Math.round(clampSize(next, minSize, maxSize));
    if (clamped === latestSizeRef.current) return;
    latestSizeRef.current = clamped;
    if (sizeProp === undefined) setInternalSize(clamped);
    onSizeChange?.(clamped);
  };
  const setCollapsed = (next: boolean) => {
    if (!collapsible || next === collapsed) return;
    if (collapsedProp === undefined) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };
  const setOverlayOpen = (next: boolean) => {
    if (next === overlayOpen) return;
    if (next && typeof document !== "undefined") {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (overlayOpenProp === undefined) setInternalOverlayOpen(next);
    onOverlayOpenChange?.(next);
  };
  const setOpen = (next: boolean) => {
    if (!next && sectionRef.current?.contains(document.activeElement)) {
      focusAfterCloseRef.current = true;
    }
    if (overlay) setOverlayOpen(next);
    else setCollapsed(!next);
  };

  const setOpenRef = React.useRef(setOpen);
  setOpenRef.current = setOpen;
  const openRef = React.useRef(open);
  openRef.current = open;
  const stableToggle = React.useCallback(() => setOpenRef.current(!openRef.current), []);

  const { registerPane, unregisterPane } = layout;
  React.useEffect(() => {
    registerPane(paneId, { label, side, orientation: layout.orientation, open }, stableToggle);
  }, [label, layout.orientation, open, paneId, registerPane, side, stableToggle]);
  React.useEffect(() => () => unregisterPane(paneId), [paneId, unregisterPane]);

  // A pane that leaves overlay presentation must not reappear as an open drawer later.
  const previousOverlay = React.useRef(overlay);
  React.useEffect(() => {
    if (previousOverlay.current === overlay) return;
    previousOverlay.current = overlay;
    if (!overlay && overlayOpenProp === undefined) setInternalOverlayOpen(false);
  }, [overlay, overlayOpenProp]);

  // Move focus into an opened overlay and back out when it closes.
  const previousOpen = React.useRef(open);
  React.useEffect(() => {
    const wasOpen = previousOpen.current;
    previousOpen.current = open;
    if (overlay && open && !wasOpen) {
      sectionRef.current?.focus({ preventScroll: true });
      return;
    }
    if (wasOpen && !open && focusAfterCloseRef.current) {
      focusAfterCloseRef.current = false;
      const restore = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (overlay && restore?.isConnected) {
        restore.focus({ preventScroll: true });
      } else {
        (railButtonRef.current ?? resizerRef.current)?.focus({ preventScroll: true });
      }
    }
  }, [open, overlay]);

  const paneContext = React.useMemo<EditorPaneContextValue>(
    () => ({
      id: paneId,
      label,
      side,
      open,
      closable: overlay || collapsible,
      presentation: layout.presentation,
      orientation: layout.orientation,
      setOpen: (next) => setOpenRef.current(next),
    }),
    [collapsible, label, layout.orientation, layout.presentation, open, overlay, paneId, side],
  );

  const showRail = rail && !open && (overlay || collapsible);
  const showResizer = resizable && !overlay;
  const paneStyle: React.CSSProperties = {
    ...style,
    ["--editor-pane-size" as string]: `${size}px`,
    ...(!overlay && open ? (horizontal ? { width: size } : { height: size }) : null),
  };

  const items: React.ReactNode[] = [];
  if (showResizer && side === "end") {
    items.push(
      <EditorPaneResizer
        key="resizer"
        ref={resizerRef}
        paneId={paneId}
        label={label}
        side={side}
        orientation={layout.orientation}
        size={size}
        open={open}
        minSize={minSize}
        maxSize={maxSize}
        collapsible={collapsible}
        keyboardStep={keyboardStep}
        largeKeyboardStep={largeKeyboardStep}
        onSize={setSize}
        onCollapse={setCollapsed}
        onReset={() => setSize(defaultSize)}
        onResizeEnd={() => onResizeEnd?.(latestSizeRef.current)}
        onResizingChange={layout.setResizing}
      />,
    );
  }
  if (showRail) {
    items.push(
      <EditorPaneRail
        key="rail"
        ref={railButtonRef}
        paneId={paneId}
        label={label}
        side={side}
        orientation={layout.orientation}
        onOpen={() => setOpen(true)}
      />,
    );
  }
  if (overlay && open) {
    items.push(
      <div
        key="scrim"
        aria-hidden="true"
        data-slot="editor-pane-scrim"
        className="absolute inset-0 z-30 bg-background/60 motion-safe:animate-in motion-safe:fade-in-0"
        onClick={() => {
          focusAfterCloseRef.current = true;
          setOverlayOpen(false);
        }}
      />,
    );
  }
  items.push(
    <section
      key="pane"
      {...props}
      ref={sectionRef}
      id={paneId}
      aria-label={label}
      tabIndex={-1}
      data-slot="editor-pane"
      data-side={side}
      data-orientation={layout.orientation}
      data-presentation={layout.presentation}
      data-state={open ? "open" : "closed"}
      style={paneStyle}
      hidden={!open && !overlay}
      onBlur={(event) => {
        onBlur?.(event);
        // Overlay drawers light-dismiss when keyboard focus moves elsewhere, except to a control
        // for this pane (which toggles it itself).
        const next = event.relatedTarget;
        if (!overlay || !open || !(next instanceof Element)) return;
        if (event.currentTarget.contains(next)) return;
        if (next.closest(`[aria-controls="${paneId}"]`)) return;
        setOverlayOpen(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !overlay || !open || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        focusAfterCloseRef.current = true;
        setOverlayOpen(false);
      }}
      className={cn(
        "flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden bg-card/65 text-sm text-card-foreground outline-none",
        "transition-[width,height] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)] group-data-[resizing=true]/editor-panes:transition-none motion-reduce:transition-none",
        "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
        // Docked panes keep the main region usable when the container is tight.
        "data-[orientation=horizontal]:data-[presentation=docked]:max-w-[calc(100%-12rem)] data-[orientation=vertical]:max-h-[calc(100%-6rem)]",
        "data-[side=start]:data-[orientation=horizontal]:border-e data-[side=end]:data-[orientation=horizontal]:border-s data-[side=start]:data-[orientation=vertical]:border-b data-[side=end]:data-[orientation=vertical]:border-t border-border/60",
        // Overlay panes slide over the main region as drawers.
        "data-[presentation=overlay]:absolute data-[presentation=overlay]:inset-y-0 data-[presentation=overlay]:z-40 data-[presentation=overlay]:w-[min(var(--editor-pane-size),calc(100%-2.5rem))] data-[presentation=overlay]:bg-card data-[presentation=overlay]:shadow-[var(--ui-shadow-interactive)] data-[presentation=overlay]:transition-transform data-[presentation=overlay]:data-[state=closed]:transition-[transform,visibility] motion-reduce:data-[presentation=overlay]:transition-none motion-reduce:data-[presentation=overlay]:data-[state=closed]:transition-none",
        "data-[presentation=overlay]:data-[side=start]:start-0 data-[presentation=overlay]:data-[side=end]:end-0",
        "data-[presentation=overlay]:data-[state=closed]:invisible data-[presentation=overlay]:data-[side=start]:data-[state=closed]:-translate-x-full data-[presentation=overlay]:data-[side=end]:data-[state=closed]:translate-x-full rtl:data-[presentation=overlay]:data-[side=start]:data-[state=closed]:translate-x-full rtl:data-[presentation=overlay]:data-[side=end]:data-[state=closed]:-translate-x-full",
        className,
      )}
    >
      <EditorPaneContext.Provider value={paneContext}>{children}</EditorPaneContext.Provider>
    </section>,
  );
  if (showResizer && side === "start") {
    items.push(
      <EditorPaneResizer
        key="resizer"
        ref={resizerRef}
        paneId={paneId}
        label={label}
        side={side}
        orientation={layout.orientation}
        size={size}
        open={open}
        minSize={minSize}
        maxSize={maxSize}
        collapsible={collapsible}
        keyboardStep={keyboardStep}
        largeKeyboardStep={largeKeyboardStep}
        onSize={setSize}
        onCollapse={setCollapsed}
        onReset={() => setSize(defaultSize)}
        onResizeEnd={() => onResizeEnd?.(latestSizeRef.current)}
        onResizingChange={layout.setResizing}
      />,
    );
  }

  return <>{items}</>;
}

type EditorPaneResizerProps = {
  ref?: React.Ref<HTMLDivElement>;
  paneId: string;
  label: string;
  side: EditorPaneSide;
  orientation: EditorPaneLayoutOrientation;
  size: number;
  open: boolean;
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  keyboardStep: number;
  largeKeyboardStep: number;
  onSize: (size: number) => void;
  onCollapse: (collapsed: boolean) => void;
  onReset: () => void;
  onResizeEnd: () => void;
  onResizingChange: (resizing: boolean) => void;
};

function EditorPaneResizer({
  ref,
  paneId,
  label,
  side,
  orientation,
  size,
  open,
  minSize,
  maxSize,
  collapsible,
  keyboardStep,
  largeKeyboardStep,
  onSize,
  onCollapse,
  onReset,
  onResizeEnd,
  onResizingChange,
}: EditorPaneResizerProps) {
  const dragRef = React.useRef<{
    pointerId: number;
    origin: number;
    startSize: number;
    direction: number;
  } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const horizontal = orientation === "horizontal";

  const direction = (element: Element) => {
    const towardEnd = side === "start" ? 1 : -1;
    return horizontal && isRtl(element) ? -towardEnd : towardEnd;
  };

  const applySize = (raw: number) => {
    if (collapsible && raw < minSize / 2) {
      onCollapse(true);
      return;
    }
    if (!open) onCollapse(false);
    onSize(raw);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    onResizingChange(false);
    onResizeEnd();
  };

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-label={`Resize ${label}`}
      aria-controls={paneId}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuemin={collapsible ? 0 : minSize}
      aria-valuemax={maxSize}
      aria-valuenow={open ? size : 0}
      aria-valuetext={open ? `${size} pixels` : "Collapsed"}
      data-slot="editor-pane-resizer"
      data-side={side}
      data-orientation={orientation}
      data-dragging={dragging ? "true" : undefined}
      className={cn(
        "relative z-20 shrink-0 touch-none bg-transparent outline-none select-none",
        "after:absolute after:bg-border after:transition-colors after:duration-[var(--ui-motion-duration-fast)] motion-reduce:after:transition-none",
        "hover:after:bg-primary/60 focus-visible:after:bg-ring data-[dragging=true]:after:bg-primary",
        // Horizontal layouts: a vertical bar with a generous hit area around a 1px line.
        "data-[orientation=horizontal]:-mx-1.5 data-[orientation=horizontal]:w-3 data-[orientation=horizontal]:cursor-col-resize data-[orientation=horizontal]:after:inset-y-0 data-[orientation=horizontal]:after:start-1/2 data-[orientation=horizontal]:after:w-px data-[orientation=horizontal]:focus-visible:after:w-0.5 data-[orientation=horizontal]:pointer-coarse:-mx-3 data-[orientation=horizontal]:pointer-coarse:w-6",
        // Narrow containers are usually touch surfaces: widen the grab area to a full touch target.
        "group-data-[narrow=true]/editor-panes:data-[orientation=horizontal]:-mx-5 group-data-[narrow=true]/editor-panes:data-[orientation=horizontal]:w-10",
        "data-[orientation=vertical]:-my-1.5 data-[orientation=vertical]:h-3 data-[orientation=vertical]:cursor-row-resize data-[orientation=vertical]:after:inset-x-0 data-[orientation=vertical]:after:top-1/2 data-[orientation=vertical]:after:h-px data-[orientation=vertical]:focus-visible:after:h-0.5 data-[orientation=vertical]:pointer-coarse:-my-3 data-[orientation=vertical]:pointer-coarse:h-6",
        "group-data-[narrow=true]/editor-panes:data-[orientation=vertical]:-my-5 group-data-[narrow=true]/editor-panes:data-[orientation=vertical]:h-10",
      )}
      onPointerDown={(event) => {
        if (event.button !== 0 || event.isPrimary === false) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture?.(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          origin: horizontal ? event.clientX : event.clientY,
          startSize: open ? size : 0,
          direction: direction(event.currentTarget),
        };
        setDragging(true);
        onResizingChange(true);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const position = horizontal ? event.clientX : event.clientY;
        applySize(drag.startSize + (position - drag.origin) * drag.direction);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onDoubleClick={() => {
        if (!open) onCollapse(false);
        onReset();
        onResizeEnd();
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? largeKeyboardStep : keyboardStep;
        const forwardKey = horizontal ? "ArrowRight" : "ArrowDown";
        const backwardKey = horizontal ? "ArrowLeft" : "ArrowUp";
        let handled = true;
        if (event.key === forwardKey || event.key === backwardKey) {
          const delta = (event.key === forwardKey ? step : -step) * direction(event.currentTarget);
          if (!open) {
            if (delta > 0) applySize(minSize);
          } else if (collapsible && delta < 0 && size <= minSize) {
            onCollapse(true);
          } else {
            onSize(size + delta);
          }
        } else if (event.key === "Home") {
          if (!open) onCollapse(false);
          onSize(minSize);
        } else if (event.key === "End") {
          if (!open) onCollapse(false);
          onSize(maxSize);
        } else if (event.key === "Enter" && collapsible) {
          onCollapse(open);
        } else {
          handled = false;
        }
        if (handled) {
          event.preventDefault();
          onResizeEnd();
        }
      }}
    />
  );
}

const railIcons = {
  horizontal: { start: PanelLeftOpenIcon, end: PanelRightOpenIcon },
  vertical: { start: PanelTopOpenIcon, end: PanelBottomOpenIcon },
} as const;
const closeIcons = {
  horizontal: { start: PanelLeftCloseIcon, end: PanelRightCloseIcon },
  vertical: { start: PanelTopCloseIcon, end: PanelBottomCloseIcon },
} as const;

function EditorPaneRail({
  ref,
  paneId,
  label,
  side,
  orientation,
  onOpen,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  paneId: string;
  label: string;
  side: EditorPaneSide;
  orientation: EditorPaneLayoutOrientation;
  onOpen: () => void;
}) {
  const Icon = railIcons[orientation][side];
  return (
    <div
      data-slot="editor-pane-rail"
      data-side={side}
      data-orientation={orientation}
      className={cn(
        "flex shrink-0 items-center justify-center border-border/60 bg-card/65 p-1",
        "data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:justify-start data-[side=start]:data-[orientation=horizontal]:border-e data-[side=end]:data-[orientation=horizontal]:border-s",
        "data-[orientation=vertical]:justify-start data-[side=start]:data-[orientation=vertical]:border-b data-[side=end]:data-[orientation=vertical]:border-t",
      )}
    >
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Show ${label}`}
        aria-expanded={false}
        aria-controls={paneId}
        className="pointer-coarse:size-11"
        onClick={onOpen}
      >
        <Icon aria-hidden="true" />
      </Button>
    </div>
  );
}

export type EditorPaneHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  actions?: React.ReactNode;
  /** Render the built-in hide/close control when the pane can close. Defaults to `true`. */
  closeButton?: boolean;
};

/** Compact pane title row with optional actions and the pane's hide/close control. */
function EditorPaneHeader({
  title,
  actions,
  closeButton = true,
  className,
  ...props
}: EditorPaneHeaderProps) {
  const pane = useEditorPane();
  const CloseIcon = pane
    ? pane.presentation === "overlay"
      ? XIcon
      : closeIcons[pane.orientation][pane.side]
    : null;
  return (
    <div
      data-slot="editor-pane-header"
      className={cn(
        "flex min-h-[var(--ui-control-height-lg)] min-w-0 shrink-0 items-center gap-[var(--ui-control-gap)] border-b border-border/60 px-[var(--ui-surface-padding-sm)] py-1",
        className,
      )}
      {...props}
    >
      <h2 data-slot="editor-pane-title" className="min-w-0 flex-1 truncate text-sm font-medium">
        {title}
      </h2>
      {actions ? (
        <div data-slot="editor-pane-actions" className="flex shrink-0 items-center gap-1">
          {actions}
        </div>
      ) : null}
      {closeButton && pane?.closable && CloseIcon ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Hide ${pane.label}`}
          aria-controls={pane.id}
          aria-expanded={pane.open}
          className="shrink-0 pointer-coarse:size-11"
          onClick={() => pane.setOpen(false)}
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

export type EditorPaneContentProps = React.ComponentProps<"div">;

/** Scrollable pane body that keeps the header fixed. */
function EditorPaneContent({ className, ...props }: EditorPaneContentProps) {
  return (
    <div
      data-slot="editor-pane-content"
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-auto p-[var(--ui-surface-padding-sm)]",
        className,
      )}
      {...props}
    />
  );
}

export type EditorPaneToggleProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** The `id` of the `EditorPane` this button shows and hides. */
  paneId: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * Toolbar-friendly button that shows or hides a pane in both docked and overlay presentation. It
 * reaches panes in its own `EditorPaneLayout` and in any layout nested inside it, so a toolbar can
 * be the first child of an outer vertical layout.
 */
function EditorPaneToggle({
  paneId,
  variant = "ghost",
  size = "icon",
  className,
  children,
  onClick,
  disabled,
  ...props
}: EditorPaneToggleProps) {
  const layout = useEditorPaneLayoutContext("EditorPaneToggle");
  const pane = layout.panes[paneId];
  const Icon = pane
    ? (pane.open ? closeIcons : railIcons)[pane.orientation][pane.side]
    : PanelLeftOpenIcon;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={children ? undefined : (pane?.label ?? paneId)}
      aria-expanded={pane?.open ?? false}
      aria-controls={paneId}
      data-slot="editor-pane-toggle"
      data-state={pane?.open ? "open" : "closed"}
      {...props}
      disabled={!pane || disabled}
      className={cn("pointer-coarse:min-h-11 pointer-coarse:min-w-11", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) layout.togglePane(paneId);
      }}
    >
      {children ?? <Icon aria-hidden="true" />}
    </Button>
  );
}

export {
  EditorPane,
  EditorPaneContent,
  EditorPaneHeader,
  EditorPaneLayout,
  EditorPaneMain,
  EditorPaneToggle,
  useEditorPane,
};
export type {
  EditorPaneLayoutOrientation,
  EditorPanePresentation,
  EditorPaneSide,
  EditorPaneContextValue,
};

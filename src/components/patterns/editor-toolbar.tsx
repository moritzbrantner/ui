"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Button } from "../stable/button";
import { Kbd } from "../stable/kbd";
import { Toolbar, ToolbarGroup, type ToolbarProps } from "../stable/toolbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../stable/tooltip";

type EditorToolbarDensity = "compact" | "default" | "comfortable";
type EditorToolbarOrientation = "horizontal" | "vertical";

type EditorToolbarContextValue = {
  density: EditorToolbarDensity;
  orientation: EditorToolbarOrientation;
};

const EditorToolbarContext = React.createContext<EditorToolbarContextValue | null>(null);

// Composite widgets keep their own arrow-key model; the toolbar treats each as a single stop.
const NESTED_COMPOSITE_SELECTOR = [
  '[role="radiogroup"]',
  '[role="tablist"]',
  '[role="listbox"]',
  '[role="menubar"]',
  '[role="tree"]',
  '[role="grid"]',
  '[role="toolbar"]',
  '[data-slot="toggle-group"]',
].join(",");
const FOCUSABLE_SELECTOR = [
  "button",
  "a[href]",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "[tabindex]",
  "[contenteditable='true']",
].join(",");
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

type ToolbarStop = { element: HTMLElement; composite: HTMLElement | null };

function isUsable(element: HTMLElement) {
  if (element.matches(":disabled")) return false;
  if (element.closest("[hidden],[inert]")) return false;
  return element.getAttribute("aria-hidden") !== "true";
}

const MANAGED_ATTRIBUTE = "data-editor-toolbar-item";

// A nested composite owns its arrow keys when it already removes its own items from the tab order.
function isSelfManagedComposite(composite: HTMLElement) {
  return Array.from(composite.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).some(
    (item) =>
      isUsable(item) &&
      item.getAttribute("tabindex") === "-1" &&
      !item.hasAttribute(MANAGED_ATTRIBUTE),
  );
}

function getToolbarStops(root: HTMLElement): ToolbarStop[] {
  const stops: ToolbarStop[] = [];
  const compositeStops = new Map<HTMLElement, boolean>();
  for (const element of root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
    if (!isUsable(element)) continue;
    const composite = element.parentElement?.closest<HTMLElement>(NESTED_COMPOSITE_SELECTOR);
    const nested = composite && composite !== root && root.contains(composite) ? composite : null;
    if (nested) {
      let selfManaged = compositeStops.get(nested);
      if (selfManaged === undefined) {
        selfManaged = isSelfManagedComposite(nested);
        compositeStops.set(nested, selfManaged);
        if (selfManaged) {
          const items = Array.from(nested.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
            isUsable,
          );
          const current = items.find((item) => item.tabIndex >= 0) ?? items[0];
          if (current) stops.push({ element: current, composite: nested });
        }
      }
      if (selfManaged) continue;
    }
    stops.push({ element, composite: null });
  }
  return stops;
}

function isTextEntry(target: EventTarget | null) {
  if (target instanceof HTMLInputElement) return !NON_TEXT_INPUT_TYPES.has(target.type);
  return (
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export type EditorToolbarProps = Omit<ToolbarProps, "density"> & {
  /** Arrow-key axis. Vertical toolbars stack their contents. */
  orientation?: EditorToolbarOrientation;
  /** Control rhythm for `EditorToolbarButton`s. `default` follows the theme's density tokens. */
  density?: EditorToolbarDensity;
  /** `wrap` lets groups flow onto new rows; `scroll` keeps one row and scrolls it on narrow surfaces. */
  overflow?: "wrap" | "scroll";
  /** Wrap focus from the last item to the first and back. */
  loop?: boolean;
};

/**
 * Editor command bar implementing the WAI-ARIA toolbar pattern: a single Tab stop, with arrow
 * keys, Home, and End moving between items. Text inputs keep their own caret keys. A nested
 * composite that manages its own roving focus (for example a default `ToggleGroup`) stays one
 * stop with its own arrow keys; pass `rovingFocus={false}` to a `ToggleGroup` to join its items
 * to the toolbar sequence instead.
 */
function EditorToolbar({
  orientation = "horizontal",
  density = "default",
  overflow = "wrap",
  loop = true,
  className,
  children,
  onKeyDown,
  onFocus,
  ref,
  ...props
}: EditorToolbarProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const activeRef = React.useRef<HTMLElement | null>(null);

  const syncTabStops = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const stops = getToolbarStops(root);
    const active =
      stops.find((stop) => stop.element === activeRef.current) ??
      stops.find((stop) => stop.composite?.contains(activeRef.current)) ??
      stops[0];
    activeRef.current = active?.element ?? null;
    for (const stop of stops) {
      if (stop.composite) continue;
      stop.element.setAttribute(MANAGED_ATTRIBUTE, "");
      const nextTabIndex = stop === active ? "0" : "-1";
      if (stop.element.getAttribute("tabindex") !== nextTabIndex) {
        stop.element.setAttribute("tabindex", nextTabIndex);
      }
    }
  }, []);

  React.useLayoutEffect(() => {
    syncTabStops();
  });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) => record.type === "childList" || record.attributeName !== "tabindex")
      )
        syncTabStops();
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled", "hidden", "inert"],
    });
    return () => observer.disconnect();
  }, [syncTabStops]);

  const context = React.useMemo(() => ({ density, orientation }), [density, orientation]);

  return (
    <EditorToolbarContext.Provider value={context}>
      <TooltipProvider>
        <Toolbar
          {...props}
          ref={(element: HTMLDivElement | null) => {
            rootRef.current = element;
            if (typeof ref === "function") return ref(element);
            if (ref) ref.current = element;
          }}
          aria-orientation={orientation}
          density={density === "compact" ? "compact" : "default"}
          data-slot="editor-toolbar"
          data-orientation={orientation}
          data-editor-density={density}
          data-overflow={overflow}
          className={cn(
            "data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:flex-nowrap",
            "data-[orientation=horizontal]:data-[overflow=scroll]:flex-nowrap data-[orientation=horizontal]:data-[overflow=scroll]:overflow-x-auto data-[orientation=horizontal]:data-[overflow=scroll]:overscroll-x-contain data-[overflow=scroll]:[&>*]:shrink-0 data-[orientation=horizontal]:data-[overflow=scroll]:[contain:inline-size]",
            density === "comfortable" &&
              "min-h-[var(--ui-control-height-lg)] gap-[var(--ui-space-3)]",
            className,
          )}
          onFocus={(event) => {
            onFocus?.(event);
            const root = rootRef.current;
            if (!root || !(event.target instanceof HTMLElement)) return;
            const stop = getToolbarStops(root).find(
              (candidate) =>
                candidate.element === event.target ||
                candidate.composite?.contains(event.target as Node),
            );
            if (stop && activeRef.current !== stop.element) {
              activeRef.current = stop.element;
              syncTabStops();
            }
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            const root = rootRef.current;
            if (event.defaultPrevented || !root || event.altKey || event.ctrlKey || event.metaKey)
              return;
            const target = event.target as HTMLElement;
            if (target.closest('[data-slot="editor-toolbar"]') !== root) return;
            const stops = getToolbarStops(root);
            const index = stops.findIndex(
              (stop) => stop.element === target || stop.composite?.contains(target),
            );
            if (index === -1) return;
            const inComposite = Boolean(stops[index]?.composite);
            const rtl = window.getComputedStyle(root).direction === "rtl";
            const nextKey =
              orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
            const previousKey =
              orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
            let nextIndex: number | null = null;
            if (event.key === nextKey || event.key === previousKey) {
              if (inComposite || isTextEntry(target)) return;
              const delta = event.key === nextKey ? 1 : -1;
              const candidate = index + delta;
              nextIndex = loop
                ? (candidate + stops.length) % stops.length
                : Math.min(Math.max(candidate, 0), stops.length - 1);
            } else if (event.key === "Home" || event.key === "End") {
              if (isTextEntry(target)) return;
              nextIndex = event.key === "Home" ? 0 : stops.length - 1;
            }
            if (nextIndex === null) return;
            event.preventDefault();
            const next = stops[nextIndex];
            if (!next || next.element === target) return;
            activeRef.current = next.element;
            syncTabStops();
            next.element.focus();
          }}
        >
          {children}
        </Toolbar>
      </TooltipProvider>
    </EditorToolbarContext.Provider>
  );
}

export type EditorToolbarGroupProps = React.ComponentProps<typeof ToolbarGroup>;

/** Labelled cluster of related toolbar commands. Give it an `aria-label`. */
function EditorToolbarGroup({ className, ...props }: EditorToolbarGroupProps) {
  const context = React.useContext(EditorToolbarContext);
  return (
    <ToolbarGroup
      data-slot="editor-toolbar-group"
      data-orientation={context?.orientation}
      className={cn(
        "flex-nowrap gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
      {...props}
    />
  );
}

export type EditorToolbarButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "size" | "aria-pressed"
> & {
  /** Accessible command name, also shown in the tooltip. */
  label: string;
  icon?: React.ReactNode;
  /** Display-only shortcut hint, for example `Mod+Z`. */
  shortcut?: string;
  /** Toggle state; renders `aria-pressed` when defined. */
  pressed?: boolean;
  /** Show `label` next to the icon instead of only in the tooltip. */
  showLabel?: boolean;
  /** Show the hover/focus tooltip. Defaults to `true` for icon-only buttons. */
  tooltip?: boolean;
};

const buttonSizes = {
  compact: { icon: "icon-sm", text: "sm" },
  default: { icon: "icon", text: "default" },
  comfortable: { icon: "icon-lg", text: "lg" },
} as const;

/** Icon-first toolbar command with tooltip, shortcut hint, toggle state, and coarse-pointer sizing. */
function EditorToolbarButton({
  label,
  icon,
  shortcut,
  pressed,
  showLabel = false,
  tooltip,
  variant,
  className,
  children,
  ...props
}: EditorToolbarButtonProps) {
  const context = React.useContext(EditorToolbarContext);
  const density = context?.density ?? "default";
  const iconOnly = !showLabel && !children;
  const button = (
    <Button
      type="button"
      variant={variant ?? (pressed ? "secondary" : "ghost")}
      size={buttonSizes[density][iconOnly ? "icon" : "text"]}
      aria-label={iconOnly ? label : undefined}
      aria-pressed={pressed}
      data-slot="editor-toolbar-button"
      data-state={pressed === undefined ? undefined : pressed ? "on" : "off"}
      className={cn(
        "shrink-0 pointer-coarse:min-h-11 pointer-coarse:min-w-11",
        pressed && "ring-1 ring-border",
        className,
      )}
      {...props}
    >
      {icon}
      {iconOnly ? null : (children ?? label)}
    </Button>
  );
  if (!(tooltip ?? iconOnly)) return button;
  const content = (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={context?.orientation === "vertical" ? "right" : "bottom"}>
        <span>{label}</span>
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
  return context ? content : <TooltipProvider>{content}</TooltipProvider>;
}

export { EditorToolbar, EditorToolbarButton, EditorToolbarGroup };
export type { EditorToolbarDensity, EditorToolbarOrientation };

"use client";

import * as React from "react";
import {
  createSwapy,
  type BeforeSwapEvent,
  type BeforeSwapHandler,
  type Config as SwapyConfig,
  type SwapEndEvent,
  type SwapEvent,
  type SwapStartEvent,
} from "swapy";

import { cn } from "../lib/cn";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";
import { tabsListVariants } from "./tabs";

type SwapyTabsItem = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
};

type SwapyTabsProps = Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> & {
  items: SwapyTabsItem[];
  orientation?: "horizontal" | "vertical";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  order?: string[];
  defaultOrder?: string[];
  onOrderChange?: (order: string[]) => void;
  onBeforeSwap?: BeforeSwapHandler;
  onSwapStart?: (event: SwapStartEvent) => void;
  onSwap?: (event: SwapEvent) => void;
  onSwapEnd?: (event: SwapEndEvent) => void;
  swapyConfig?: Partial<SwapyConfig> | false;
  resizable?: boolean;
  listVariant?: "default" | "line";
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  panelClassName?: string;
  resizeHandleClassName?: string;
  withResizeHandles?: boolean;
  triggerDefaultSize?: number;
  triggerMinSize?: number;
  triggerMaxSize?: number;
};

const swapySlotPrefix = "tab-slot-";

function normalizeOrder(order: string[] | undefined, items: SwapyTabsItem[]) {
  const values = items.map((item) => item.value);
  const valueSet = new Set(values);
  const nextOrder = (order ?? []).filter((value, index, source) => {
    return valueSet.has(value) && source.indexOf(value) === index;
  });

  for (const value of values) {
    if (!nextOrder.includes(value)) {
      nextOrder.push(value);
    }
  }

  return nextOrder;
}

function slotIndex(slot: string) {
  const index = Number.parseInt(slot.replace(swapySlotPrefix, ""), 10);
  return Number.isFinite(index) ? index : Number.MAX_SAFE_INTEGER;
}

function orderFromSwapEvent(event: SwapEndEvent, fallbackOrder: string[]) {
  const nextOrder = event.slotItemMap.asArray
    .filter(({ slot, item }) => slot.startsWith(swapySlotPrefix) && item)
    .sort((left, right) => slotIndex(left.slot) - slotIndex(right.slot))
    .map(({ item }) => item);

  return nextOrder.length > 0 ? nextOrder : fallbackOrder;
}

function SwapyTabs({
  items,
  order: orderProp,
  defaultOrder,
  onOrderChange,
  onBeforeSwap,
  onSwapStart,
  onSwap,
  onSwapEnd,
  swapyConfig,
  resizable = true,
  orientation = "horizontal",
  defaultValue,
  value,
  onValueChange,
  listVariant = "default",
  listClassName,
  triggerClassName,
  contentClassName,
  panelClassName,
  resizeHandleClassName,
  withResizeHandles = true,
  triggerDefaultSize,
  triggerMinSize = 10,
  triggerMaxSize,
  className,
  ...props
}: SwapyTabsProps) {
  const tabsId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [uncontrolledOrder, setUncontrolledOrder] = React.useState(() =>
    normalizeOrder(defaultOrder, items),
  );
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);

  const isControlledOrder = orderProp !== undefined;
  const order = React.useMemo(
    () => normalizeOrder(isControlledOrder ? orderProp : uncontrolledOrder, items),
    [isControlledOrder, items, orderProp, uncontrolledOrder],
  );
  const orderedItems = React.useMemo(() => {
    const itemMap = new Map(items.map((item) => [item.value, item]));
    return order.map((itemValue) => itemMap.get(itemValue)).filter(Boolean) as SwapyTabsItem[];
  }, [items, order]);

  const applyOrder = React.useCallback(
    (nextOrder: string[]) => {
      const normalizedOrder = normalizeOrder(nextOrder, items);
      if (!isControlledOrder) {
        setUncontrolledOrder(normalizedOrder);
      }
      onOrderChange?.(normalizedOrder);
    },
    [isControlledOrder, items, onOrderChange],
  );

  React.useEffect(() => {
    if (swapyConfig === false || !listRef.current) return;

    const swapy = createSwapy(listRef.current, {
      animation: "dynamic",
      dragAxis: orientation === "vertical" ? "y" : "x",
      manualSwap: true,
      swapMode: "drop",
      ...swapyConfig,
    });

    swapy.onBeforeSwap((event: BeforeSwapEvent) => {
      return onBeforeSwap ? onBeforeSwap(event) : true;
    });
    swapy.onSwapStart((event) => {
      onSwapStart?.(event);
    });
    swapy.onSwap((event) => {
      onSwap?.(event);
    });
    swapy.onSwapEnd((event) => {
      if (event.hasChanged) {
        applyOrder(orderFromSwapEvent(event, order));
      }
      onSwapEnd?.(event);
    });

    return () => {
      swapy.destroy();
    };
  }, [
    applyOrder,
    onBeforeSwap,
    onSwap,
    onSwapEnd,
    onSwapStart,
    order,
    orientation,
    swapyConfig,
  ]);

  const firstValue = orderedItems[0]?.value;
  const activeValue = value ?? uncontrolledValue ?? firstValue;
  const activeItem = orderedItems.find((item) => item.value === activeValue);
  const activeContentId = activeValue ? `${tabsId}-content-${activeValue}` : undefined;
  const activeTriggerId = activeValue ? `${tabsId}-trigger-${activeValue}` : undefined;

  const selectValue = React.useCallback(
    (nextValue: string) => {
      const nextItem = orderedItems.find((item) => item.value === nextValue);
      if (!nextItem || nextItem.disabled) return;
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [onValueChange, orderedItems, value],
  );

  const focusValue = React.useCallback((nextValue: string) => {
    requestAnimationFrame(() => {
      triggerRefs.current.get(nextValue)?.focus();
    });
  }, []);

  const moveFocus = React.useCallback(
    (currentValue: string, direction: 1 | -1 | "first" | "last") => {
      const enabledItems = orderedItems.filter((item) => !item.disabled);
      if (enabledItems.length === 0) return;

      const currentIndex = enabledItems.findIndex((item) => item.value === currentValue);
      const nextItem =
        direction === "first"
          ? enabledItems[0]
          : direction === "last"
            ? enabledItems[enabledItems.length - 1]
            : enabledItems[
                (Math.max(currentIndex, 0) + direction + enabledItems.length) %
                  enabledItems.length
              ];

      if (!nextItem) return;
      selectValue(nextItem.value);
      focusValue(nextItem.value);
    },
    [focusValue, orderedItems, selectValue],
  );

  return (
    <div
      data-slot="swapy-tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex min-w-0 gap-2 data-horizontal:flex-col", className)}
      {...props}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-orientation={orientation}
        data-slot="swapy-tabs-list"
        data-variant={listVariant}
        className={cn(
          "group/tabs-list",
          tabsListVariants({ variant: listVariant }),
          "max-w-full overflow-hidden",
          orientation === "horizontal" ? "w-full justify-start" : "w-fit items-stretch",
          listClassName,
        )}
      >
        {resizable ? (
          <ResizablePanelGroup
            orientation={orientation === "vertical" ? "vertical" : "horizontal"}
            className={cn(orientation === "horizontal" ? "h-full min-w-0" : "min-h-0 w-full")}
          >
            {orderedItems.map((item, index) => (
              <React.Fragment key={item.value}>
                <ResizablePanel
                  defaultSize={
                    item.defaultSize ?? triggerDefaultSize ?? 100 / Math.max(orderedItems.length, 1)
                  }
                  minSize={item.minSize ?? triggerMinSize}
                  maxSize={item.maxSize ?? triggerMaxSize}
                  className={cn("min-w-0", panelClassName)}
                >
                  <SwapyTabsSlot index={index}>
                    <SwapyTabsTrigger
                      tabsId={tabsId}
                      item={item}
                      active={item.value === activeValue}
                      setTriggerRef={(element) => {
                        if (element) {
                          triggerRefs.current.set(item.value, element);
                        } else {
                          triggerRefs.current.delete(item.value);
                        }
                      }}
                      onSelect={selectValue}
                      onMoveFocus={moveFocus}
                      triggerClassName={triggerClassName}
                      orientation={orientation}
                    />
                  </SwapyTabsSlot>
                </ResizablePanel>
                {index < orderedItems.length - 1 ? (
                  <ResizableHandle
                    withHandle={withResizeHandles}
                    className={cn("bg-border/70", resizeHandleClassName)}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        ) : (
          orderedItems.map((item, index) => (
            <SwapyTabsSlot key={item.value} index={index}>
              <SwapyTabsTrigger
                tabsId={tabsId}
                item={item}
                active={item.value === activeValue}
                setTriggerRef={(element) => {
                  if (element) {
                    triggerRefs.current.set(item.value, element);
                  } else {
                    triggerRefs.current.delete(item.value);
                  }
                }}
                onSelect={selectValue}
                onMoveFocus={moveFocus}
                triggerClassName={triggerClassName}
                orientation={orientation}
              />
            </SwapyTabsSlot>
          ))
        )}
      </div>

      <div
        id={activeContentId}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={activeTriggerId}
        data-slot="swapy-tabs-content"
        className={cn(
          "flex-1 text-sm outline-none",
          contentClassName,
          activeItem?.contentClassName,
        )}
      >
        {activeItem?.content}
      </div>
    </div>
  );
}

function SwapyTabsSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  return (
    <div
      data-slot="swapy-tabs-slot"
      data-swapy-slot={`${swapySlotPrefix}${index}`}
      className={cn("h-full min-w-0", className)}
      {...props}
    />
  );
}

function SwapyTabsTrigger({
  tabsId,
  item,
  active,
  setTriggerRef,
  onSelect,
  onMoveFocus,
  triggerClassName,
  orientation,
}: {
  tabsId: string;
  item: SwapyTabsItem;
  active: boolean;
  setTriggerRef: (element: HTMLButtonElement | null) => void;
  onSelect: (value: string) => void;
  onMoveFocus: (value: string, direction: 1 | -1 | "first" | "last") => void;
  triggerClassName?: string;
  orientation: SwapyTabsProps["orientation"];
}) {
  const triggerId = `${tabsId}-trigger-${item.value}`;
  const contentId = `${tabsId}-content-${item.value}`;

  return (
    <button
      ref={setTriggerRef}
      id={triggerId}
      role="tab"
      type="button"
      aria-selected={active}
      aria-controls={contentId}
      tabIndex={active ? 0 : -1}
      data-slot="swapy-tabs-trigger"
      data-active={active ? "" : undefined}
      data-swapy-item={item.value}
      data-swapy-handle
      disabled={item.disabled}
      className={cn(
        "relative inline-flex h-full min-w-0 flex-1 items-center justify-center gap-[var(--ui-control-gap)] overflow-hidden rounded-[var(--ui-tabs-radius,var(--ui-radius-control))] border border-transparent px-2 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        "w-full",
        triggerClassName,
        item.triggerClassName,
      )}
      onClick={() => {
        onSelect(item.value);
      }}
      onKeyDown={(event) => {
        const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
        const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

        if (event.key === previousKey) {
          event.preventDefault();
          onMoveFocus(item.value, -1);
        } else if (event.key === nextKey) {
          event.preventDefault();
          onMoveFocus(item.value, 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          onMoveFocus(item.value, "first");
        } else if (event.key === "End") {
          event.preventDefault();
          onMoveFocus(item.value, "last");
        }
      }}
    >
      {item.icon ? <span data-icon="inline-start">{item.icon}</span> : null}
      <span className="min-w-0 truncate">{item.label}</span>
    </button>
  );
}

export {
  SwapyTabs,
  type SwapyTabsItem,
  type SwapyTabsProps,
};

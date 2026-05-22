"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import {
  renderContextActionItem,
  type MenuActionRenderSlots,
} from "../internal/menu-action-rendering";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "../stable/context-menu";
import {
  type MenuActionItem,
  type MenuActionRenderContext,
  type MenuActionSelectHandler,
} from "./menu-actions";

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type ContextActionMenuProps = Omit<React.ComponentProps<typeof ContextMenu>, "children"> & {
  children: React.ReactElement;
  items: MenuActionItem[];
  emptyMessage?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onItemSelect?: MenuActionSelectHandler;
  renderItem?: (item: MenuActionItem, context: MenuActionRenderContext) => React.ReactNode;
  contentProps?: React.ComponentProps<typeof ContextMenuContent> & DataAttributes;
};

const contextActionMenuSlots = {
  item: "context-action-menu-item",
  icon: "context-action-menu-item-icon",
  content: "context-action-menu-item-content",
  description: "context-action-menu-item-description",
  shortcut: "context-action-menu-item-shortcut",
} satisfies MenuActionRenderSlots;

function ContextActionMenu({
  children,
  items,
  emptyMessage = "No actions available",
  header,
  footer,
  onItemSelect,
  renderItem,
  contentProps,
  onOpenChange,
  ...props
}: ContextActionMenuProps) {
  const context = React.useMemo<MenuActionRenderContext>(
    () => ({ variant: "context", close: () => onOpenChange?.(false) }),
    [onOpenChange],
  );
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <ContextMenu {...props} data-slot="context-action-menu" onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild data-slot="context-action-menu-trigger">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        {...restContentProps}
        data-slot="context-action-menu-content"
        className={cn("min-w-44 max-w-[min(22rem,calc(100vw-2rem))]", contentClassName)}
      >
        {header}
        <div data-slot="context-action-menu-list" className="grid gap-0.5">
          {items.length > 0 ? (
            items.map((item) =>
              renderContextActionItem(item, {
                context,
                onItemSelect,
                renderItem,
                slots: contextActionMenuSlots,
              }),
            )
          ) : (
            <div
              data-slot="context-action-menu-empty"
              className="px-2 py-4 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </div>
          )}
        </div>
        {footer}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export { ContextActionMenu };

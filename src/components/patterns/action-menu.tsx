"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import {
  renderDropdownActionItem,
  useControllableOpen,
  type MenuActionRenderSlots,
} from "../internal/menu-action-rendering";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../stable/dropdown-menu";
import {
  type MenuActionItem,
  type MenuActionRenderContext,
  type MenuActionSelectHandler,
} from "./menu-actions";

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type ActionMenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, "children"> & {
  trigger: React.ReactElement;
  items: MenuActionItem[];
  label?: string;
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"];
  sideOffset?: number;
  emptyMessage?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onItemSelect?: MenuActionSelectHandler;
  renderItem?: (item: MenuActionItem, context: MenuActionRenderContext) => React.ReactNode;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent> & DataAttributes;
};

const actionMenuSlots = {
  item: "action-menu-item",
  icon: "action-menu-item-icon",
  content: "action-menu-item-content",
  description: "action-menu-item-description",
  shortcut: "action-menu-item-shortcut",
} satisfies MenuActionRenderSlots;

function ActionMenu({
  trigger,
  items,
  label,
  align = "end",
  side,
  sideOffset = 6,
  emptyMessage = "No actions available",
  header,
  footer,
  onItemSelect,
  renderItem,
  contentProps,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ActionMenuProps) {
  const [resolvedOpen, setOpen] = useControllableOpen({ open, defaultOpen, onOpenChange });
  const context = React.useMemo<MenuActionRenderContext>(
    () => ({ variant: "dropdown", close: () => setOpen(false) }),
    [setOpen],
  );
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <DropdownMenu {...props} data-slot="action-menu" open={resolvedOpen} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild data-slot="action-menu-trigger">
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...restContentProps}
        data-slot="action-menu-content"
        aria-label={restContentProps["aria-label"] ?? label}
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("min-w-44 max-w-[min(22rem,calc(100vw-2rem))]", contentClassName)}
      >
        {header}
        <div data-slot="action-menu-list" className="grid gap-0.5">
          {items.length > 0 ? (
            items.map((item) =>
              renderDropdownActionItem(item, {
                context,
                onItemSelect,
                renderItem,
                slots: actionMenuSlots,
              }),
            )
          ) : (
            <div
              data-slot="action-menu-empty"
              className="px-2 py-4 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </div>
          )}
        </div>
        {footer}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ActionMenu };

"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import {
  renderSheetActionItem,
  useControllableOpen,
  type MenuActionRenderSlots,
} from "../internal/menu-action-rendering";
import {
  MobileSlide,
  MobileSlideBody,
  MobileSlideContent,
  MobileSlideDescription,
  MobileSlideFooter,
  MobileSlideHeader,
  MobileSlideTitle,
  MobileSlideTrigger,
} from "../stable/mobile-slide";
import {
  type MenuActionItem,
  type MenuActionRenderContext,
  type MenuActionSelectHandler,
} from "./menu-actions";

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type ActionSheetProps = Omit<
  React.ComponentProps<typeof MobileSlide>,
  "children" | "direction"
> & {
  trigger?: React.ReactElement;
  items: MenuActionItem[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  direction?: "top" | "right" | "bottom" | "left";
  emptyMessage?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnSelect?: boolean;
  onItemSelect?: MenuActionSelectHandler;
  renderItem?: (item: MenuActionItem, context: MenuActionRenderContext) => React.ReactNode;
  contentProps?: React.ComponentProps<typeof MobileSlideContent> & DataAttributes;
  bodyProps?: React.ComponentProps<typeof MobileSlideBody> & DataAttributes;
};

const actionSheetSlots = {
  item: "action-sheet-item",
  icon: "action-sheet-item-icon",
  content: "action-sheet-item-content",
  description: "action-sheet-item-description",
  shortcut: "action-sheet-item-shortcut",
} satisfies MenuActionRenderSlots;

function ActionSheet({
  trigger,
  items,
  title,
  description,
  direction = "bottom",
  emptyMessage = "No actions available",
  header,
  footer,
  showCloseButton = true,
  closeOnSelect,
  onItemSelect,
  renderItem,
  contentProps,
  bodyProps,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ActionSheetProps) {
  const [resolvedOpen, setOpen] = useControllableOpen({ open, defaultOpen, onOpenChange });
  const context = React.useMemo<MenuActionRenderContext>(
    () => ({ variant: "sheet", close: () => setOpen(false) }),
    [setOpen],
  );
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};
  const { className: bodyClassName, ...restBodyProps } = bodyProps ?? {};
  const hasHeader = title || description || header;
  const mobileSlideProps = props as React.ComponentProps<typeof MobileSlide>;

  return (
    <MobileSlide
      {...mobileSlideProps}
      data-slot="action-sheet"
      direction={direction}
      open={resolvedOpen}
      onOpenChange={setOpen}
    >
      {trigger ? (
        <MobileSlideTrigger asChild data-slot="action-sheet-trigger">
          {trigger}
        </MobileSlideTrigger>
      ) : null}
      <MobileSlideContent
        {...restContentProps}
        data-slot="action-sheet-content"
        showCloseButton={showCloseButton}
        className={cn("max-w-full", contentClassName)}
      >
        {hasHeader ? (
          <MobileSlideHeader data-slot="action-sheet-header">
            {title ? <MobileSlideTitle>{title}</MobileSlideTitle> : null}
            {description ? <MobileSlideDescription>{description}</MobileSlideDescription> : null}
            {header}
          </MobileSlideHeader>
        ) : null}
        <MobileSlideBody
          {...restBodyProps}
          data-slot="action-sheet-body"
          role="menu"
          className={cn("grid gap-1", bodyClassName)}
        >
          {items.length > 0 ? (
            items.map((item) =>
              renderSheetActionItem(item, {
                closeOnSelect,
                context,
                onItemSelect,
                renderItem,
                slots: actionSheetSlots,
              }),
            )
          ) : (
            <div
              data-slot="action-sheet-empty"
              className="px-2 py-8 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </div>
          )}
        </MobileSlideBody>
        {footer ? (
          <MobileSlideFooter data-slot="action-sheet-footer">{footer}</MobileSlideFooter>
        ) : null}
      </MobileSlideContent>
    </MobileSlide>
  );
}

export { ActionSheet };

"use client";

import * as React from "react";

import { useIsMobile } from "../hooks/use-mobile";
import { ActionMenu, type ActionMenuProps } from "./action-menu";
import { ActionSheet, type ActionSheetProps } from "./action-sheet";
import {
  type MenuActionItem,
  type MenuActionRenderContext,
  type MenuActionSelectHandler,
} from "./menu-actions";

export type ResponsiveActionMenuMode = "auto" | "desktop" | "mobile";

export type ResponsiveActionMenuProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children" | "title"
> & {
  mode?: ResponsiveActionMenuMode;
  trigger: React.ReactElement;
  items: MenuActionItem[];
  label?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onItemSelect?: MenuActionSelectHandler;
  renderItem?: (item: MenuActionItem, context: MenuActionRenderContext) => React.ReactNode;
  desktopProps?: Omit<ActionMenuProps, "trigger" | "items" | "onItemSelect" | "renderItem">;
  mobileProps?: Omit<ActionSheetProps, "trigger" | "items" | "onItemSelect" | "renderItem">;
};

function ResponsiveActionMenu({ mode = "auto", ...props }: ResponsiveActionMenuProps) {
  if (mode === "desktop") {
    return <ResponsiveActionMenuDesktop {...props} />;
  }

  if (mode === "mobile") {
    return <ResponsiveActionMenuMobile {...props} />;
  }

  return <ResponsiveActionMenuAuto {...props} />;
}

function ResponsiveActionMenuAuto(props: Omit<ResponsiveActionMenuProps, "mode">) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <ResponsiveActionMenuMobile {...props} />;
  }

  return <ResponsiveActionMenuDesktop {...props} />;
}

function ResponsiveActionMenuMobile({
  trigger,
  items,
  label,
  title,
  description,
  emptyMessage,
  header,
  footer,
  onItemSelect,
  renderItem,
  desktopProps: _desktopProps,
  mobileProps,
  className,
  ...wrapperProps
}: Omit<ResponsiveActionMenuProps, "mode">) {
  return (
    <div {...wrapperProps} data-slot="responsive-action-menu" className={className}>
      <ActionSheet
        title={title ?? label}
        description={description}
        emptyMessage={emptyMessage}
        header={header}
        footer={footer}
        {...mobileProps}
        trigger={trigger}
        items={items}
        onItemSelect={onItemSelect}
        renderItem={renderItem}
      />
    </div>
  );
}

function ResponsiveActionMenuDesktop({
  trigger,
  items,
  label,
  title: _title,
  description: _description,
  emptyMessage,
  header,
  footer,
  onItemSelect,
  renderItem,
  desktopProps,
  mobileProps: _mobileProps,
  className,
  ...wrapperProps
}: Omit<ResponsiveActionMenuProps, "mode">) {
  return (
    <div {...wrapperProps} data-slot="responsive-action-menu" className={className}>
      <ActionMenu
        label={label}
        emptyMessage={emptyMessage}
        header={header}
        footer={footer}
        {...desktopProps}
        trigger={trigger}
        items={items}
        onItemSelect={onItemSelect}
        renderItem={renderItem}
      />
    </div>
  );
}

export { ResponsiveActionMenu };

import type * as React from "react";

export type MenuActionSelectHandler<TItem extends MenuActionItem = MenuActionItem> = (
  id: string,
  item: TItem,
) => void;

export type MenuActionBase = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type MenuActionCommandItem = MenuActionBase & {
  type?: "item";
  destructive?: boolean;
  shortcut?: string | React.ReactNode;
  href?: string;
  linkProps?: Omit<React.ComponentPropsWithoutRef<"a">, "children" | "href">;
  closeOnSelect?: boolean;
  onSelect?: MenuActionSelectHandler<MenuActionCommandItem>;
};

export type MenuActionCheckboxItem = MenuActionBase & {
  type: "checkbox";
  checked?: boolean;
  shortcut?: string | React.ReactNode;
  onCheckedChange?: (checked: boolean, id: string, item: MenuActionCheckboxItem) => void;
};

export type MenuActionRadioOption = MenuActionBase & {
  value: string;
};

export type MenuActionRadioGroupItem = {
  id: string;
  type: "radio-group";
  label?: React.ReactNode;
  value?: string;
  options: MenuActionRadioOption[];
  onValueChange?: (value: string, id: string, item: MenuActionRadioGroupItem) => void;
};

export type MenuActionLabelItem = {
  id: string;
  type: "label";
  label: React.ReactNode;
  description?: React.ReactNode;
};

export type MenuActionSeparatorItem = {
  id: string;
  type: "separator";
};

export type MenuActionCustomItem = {
  id: string;
  type: "custom";
  render: (context: MenuActionRenderContext) => React.ReactNode;
};

export type MenuActionItem =
  | MenuActionCommandItem
  | MenuActionCheckboxItem
  | MenuActionRadioGroupItem
  | MenuActionLabelItem
  | MenuActionSeparatorItem
  | MenuActionCustomItem;

export type MenuActionRenderContext = {
  variant: "dropdown" | "context" | "sheet";
  close: () => void;
};

export function getMenuActionItemText(item: MenuActionItem): string | undefined {
  if ("label" in item && typeof item.label === "string") {
    return item.label;
  }

  return undefined;
}

export function isMenuActionItemDisabled(item: MenuActionItem): boolean {
  return "disabled" in item && Boolean(item.disabled);
}

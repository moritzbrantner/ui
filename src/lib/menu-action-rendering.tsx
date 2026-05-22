"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import {
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
} from "../components/context-menu";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "../components/dropdown-menu";
import {
  type MenuActionCommandItem,
  type MenuActionItem,
  type MenuActionRenderContext,
  type MenuActionSelectHandler,
  isMenuActionItemDisabled,
} from "../components/menu-actions";
import { cn } from "./cn";

export type MenuActionRenderSlots = {
  item: string;
  icon: string;
  content: string;
  description: string;
  shortcut: string;
};

type BaseRenderOptions = {
  context: MenuActionRenderContext;
  onItemSelect?: MenuActionSelectHandler;
  renderItem?: (item: MenuActionItem, context: MenuActionRenderContext) => React.ReactNode;
  slots: MenuActionRenderSlots;
};

type SheetRenderOptions = BaseRenderOptions & {
  closeOnSelect?: boolean;
};

export function useControllableOpen({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const resolvedOpen = controlled ? open : uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!controlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlled, onOpenChange],
  );

  return [resolvedOpen, setOpen] as const;
}

export function renderDropdownActionItem(item: MenuActionItem, options: BaseRenderOptions) {
  if (options.renderItem) {
    return renderCustomWrapper(item, options);
  }

  switch (item.type) {
    case "separator":
      return <DropdownMenuSeparator key={item.id} />;
    case "label":
      return (
        <DropdownMenuLabel key={item.id}>
          <LabelContent item={item} slots={options.slots} />
        </DropdownMenuLabel>
      );
    case "checkbox":
      return (
        <DropdownMenuCheckboxItem
          key={item.id}
          data-slot={options.slots.item}
          checked={item.checked}
          disabled={item.disabled}
          onCheckedChange={(checked) => item.onCheckedChange?.(checked === true, item.id, item)}
          onSelect={(event) => event.preventDefault()}
        >
          <RowContent item={item} slots={options.slots} />
        </DropdownMenuCheckboxItem>
      );
    case "radio-group":
      return (
        <React.Fragment key={item.id}>
          {item.label ? <DropdownMenuLabel>{item.label}</DropdownMenuLabel> : null}
          <DropdownMenuRadioGroup
            value={item.value}
            onValueChange={(value) => item.onValueChange?.(value, item.id, item)}
          >
            {item.options.map((option) => (
              <DropdownMenuRadioItem
                key={option.id}
                data-slot={options.slots.item}
                value={option.value}
                disabled={option.disabled}
                onSelect={(event) => event.preventDefault()}
              >
                <RowContent item={option} slots={options.slots} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </React.Fragment>
      );
    case "custom":
      return <React.Fragment key={item.id}>{item.render(options.context)}</React.Fragment>;
    default:
      return renderDropdownCommandItem(item, options);
  }
}

export function renderContextActionItem(item: MenuActionItem, options: BaseRenderOptions) {
  if (options.renderItem) {
    return renderCustomWrapper(item, options);
  }

  switch (item.type) {
    case "separator":
      return <ContextMenuSeparator key={item.id} />;
    case "label":
      return (
        <ContextMenuLabel key={item.id}>
          <LabelContent item={item} slots={options.slots} />
        </ContextMenuLabel>
      );
    case "checkbox":
      return (
        <ContextMenuCheckboxItem
          key={item.id}
          data-slot={options.slots.item}
          checked={item.checked}
          disabled={item.disabled}
          onCheckedChange={(checked) => item.onCheckedChange?.(checked === true, item.id, item)}
          onSelect={(event) => event.preventDefault()}
        >
          <RowContent item={item} slots={options.slots} />
        </ContextMenuCheckboxItem>
      );
    case "radio-group":
      return (
        <React.Fragment key={item.id}>
          {item.label ? <ContextMenuLabel>{item.label}</ContextMenuLabel> : null}
          <ContextMenuRadioGroup
            value={item.value}
            onValueChange={(value) => item.onValueChange?.(value, item.id, item)}
          >
            {item.options.map((option) => (
              <ContextMenuRadioItem
                key={option.id}
                data-slot={options.slots.item}
                value={option.value}
                disabled={option.disabled}
                onSelect={(event) => event.preventDefault()}
              >
                <RowContent item={option} slots={options.slots} />
              </ContextMenuRadioItem>
            ))}
          </ContextMenuRadioGroup>
        </React.Fragment>
      );
    case "custom":
      return <React.Fragment key={item.id}>{item.render(options.context)}</React.Fragment>;
    default:
      return renderContextCommandItem(item, options);
  }
}

export function renderSheetActionItem(item: MenuActionItem, options: SheetRenderOptions) {
  if (options.renderItem) {
    return renderCustomWrapper(item, options);
  }

  switch (item.type) {
    case "separator":
      return <div key={item.id} role="separator" className="-mx-1 my-1 h-px bg-border" />;
    case "label":
      return (
        <div key={item.id} className="px-1 py-2 text-xs font-medium text-muted-foreground">
          <LabelContent item={item} slots={options.slots} />
        </div>
      );
    case "checkbox":
      return (
        <button
          key={item.id}
          type="button"
          role="menuitemcheckbox"
          aria-checked={Boolean(item.checked)}
          disabled={item.disabled}
          data-slot={options.slots.item}
          className={sheetItemClassName()}
          onClick={() => {
            if (!item.disabled) {
              item.onCheckedChange?.(!item.checked, item.id, item);
            }
          }}
        >
          <RowContent item={item} slots={options.slots} />
          {item.checked ? <CheckIcon className="ml-auto size-4 shrink-0" /> : null}
        </button>
      );
    case "radio-group":
      return (
        <div key={item.id} role="group" aria-label={getAriaLabel(item.label)}>
          {item.label ? (
            <div className="px-1 py-2 text-xs font-medium text-muted-foreground">{item.label}</div>
          ) : null}
          {item.options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={item.value === option.value}
              disabled={option.disabled}
              data-slot={options.slots.item}
              className={sheetItemClassName()}
              onClick={() => {
                if (!option.disabled) {
                  item.onValueChange?.(option.value, item.id, item);
                }
              }}
            >
              <RowContent item={option} slots={options.slots} />
              {item.value === option.value ? (
                <CheckIcon className="ml-auto size-4 shrink-0" />
              ) : null}
            </button>
          ))}
        </div>
      );
    case "custom":
      return <React.Fragment key={item.id}>{item.render(options.context)}</React.Fragment>;
    default:
      return renderSheetCommandItem(item, options);
  }
}

function renderDropdownCommandItem(item: MenuActionCommandItem, options: BaseRenderOptions) {
  const closeOnSelect = item.closeOnSelect !== false;
  const handleSelect = (event: Event) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.onSelect?.(item.id, item);
    options.onItemSelect?.(item.id, item);

    if (!closeOnSelect) {
      event.preventDefault();
    }
  };

  if (item.href) {
    return (
      <DropdownMenuItem
        key={item.id}
        asChild
        data-slot={options.slots.item}
        data-destructive={item.destructive ? "" : undefined}
        disabled={item.disabled}
        variant={item.destructive ? "destructive" : "default"}
        onSelect={handleSelect}
      >
        <a
          {...item.linkProps}
          href={item.disabled ? undefined : item.href}
          aria-disabled={item.disabled || undefined}
          tabIndex={item.disabled ? -1 : item.linkProps?.tabIndex}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault();
              return;
            }
            item.linkProps?.onClick?.(event);
          }}
        >
          <RowContent item={item} slots={options.slots} />
        </a>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      key={item.id}
      data-slot={options.slots.item}
      data-destructive={item.destructive ? "" : undefined}
      disabled={item.disabled}
      variant={item.destructive ? "destructive" : "default"}
      onSelect={handleSelect}
    >
      <RowContent item={item} slots={options.slots} />
    </DropdownMenuItem>
  );
}

function renderContextCommandItem(item: MenuActionCommandItem, options: BaseRenderOptions) {
  const closeOnSelect = item.closeOnSelect !== false;
  const handleSelect = (event: Event) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    item.onSelect?.(item.id, item);
    options.onItemSelect?.(item.id, item);

    if (!closeOnSelect) {
      event.preventDefault();
    }
  };

  if (item.href) {
    return (
      <ContextMenuItem
        key={item.id}
        asChild
        data-slot={options.slots.item}
        data-destructive={item.destructive ? "" : undefined}
        disabled={item.disabled}
        variant={item.destructive ? "destructive" : "default"}
        onSelect={handleSelect}
      >
        <a
          {...item.linkProps}
          href={item.disabled ? undefined : item.href}
          aria-disabled={item.disabled || undefined}
          tabIndex={item.disabled ? -1 : item.linkProps?.tabIndex}
          onClick={(event) => {
            if (item.disabled) {
              event.preventDefault();
              return;
            }
            item.linkProps?.onClick?.(event);
          }}
        >
          <RowContent item={item} slots={options.slots} />
        </a>
      </ContextMenuItem>
    );
  }

  return (
    <ContextMenuItem
      key={item.id}
      data-slot={options.slots.item}
      data-destructive={item.destructive ? "" : undefined}
      disabled={item.disabled}
      variant={item.destructive ? "destructive" : "default"}
      onSelect={handleSelect}
    >
      <RowContent item={item} slots={options.slots} />
    </ContextMenuItem>
  );
}

function renderSheetCommandItem(item: MenuActionCommandItem, options: SheetRenderOptions) {
  const itemCloseOnSelect = item.closeOnSelect ?? options.closeOnSelect ?? true;
  const handleSelect = () => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.(item.id, item);
    options.onItemSelect?.(item.id, item);

    if (itemCloseOnSelect) {
      options.context.close();
    }
  };

  if (item.href) {
    return (
      <a
        key={item.id}
        {...item.linkProps}
        href={item.disabled ? undefined : item.href}
        role="menuitem"
        aria-disabled={item.disabled || undefined}
        data-slot={options.slots.item}
        data-destructive={item.destructive ? "" : undefined}
        className={sheetItemClassName(item.destructive)}
        tabIndex={item.disabled ? -1 : item.linkProps?.tabIndex}
        onClick={(event) => {
          if (item.disabled) {
            event.preventDefault();
            return;
          }
          item.linkProps?.onClick?.(event);
          handleSelect();
        }}
      >
        <RowContent item={item} slots={options.slots} />
      </a>
    );
  }

  return (
    <button
      key={item.id}
      type="button"
      role="menuitem"
      disabled={item.disabled}
      data-slot={options.slots.item}
      data-destructive={item.destructive ? "" : undefined}
      className={sheetItemClassName(item.destructive)}
      onClick={handleSelect}
    >
      <RowContent item={item} slots={options.slots} />
    </button>
  );
}

function renderCustomWrapper(item: MenuActionItem, options: BaseRenderOptions) {
  return (
    <React.Fragment key={item.id}>{options.renderItem?.(item, options.context)}</React.Fragment>
  );
}

function RowContent({
  item,
  slots,
}: {
  item:
    | MenuActionCommandItem
    | Exclude<MenuActionItem, { type: "radio-group" | "separator" | "label" | "custom" }>;
  slots: MenuActionRenderSlots;
}) {
  return (
    <>
      {"icon" in item && item.icon ? (
        <span data-slot={slots.icon} className="shrink-0 text-muted-foreground">
          {item.icon}
        </span>
      ) : null}
      <span data-slot={slots.content} className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        {item.description ? (
          <span
            data-slot={slots.description}
            className="mt-0.5 block whitespace-normal text-xs leading-snug text-muted-foreground"
          >
            {item.description}
          </span>
        ) : null}
      </span>
      {"shortcut" in item && item.shortcut ? (
        <span
          data-slot={slots.shortcut}
          className="ml-auto shrink-0 text-xs tracking-widest text-muted-foreground"
        >
          {item.shortcut}
        </span>
      ) : null}
    </>
  );
}

function LabelContent({
  item,
  slots,
}: {
  item: { label: React.ReactNode; description?: React.ReactNode };
  slots: MenuActionRenderSlots;
}) {
  return (
    <span data-slot={slots.content} className="block min-w-0">
      <span className="block truncate">{item.label}</span>
      {item.description ? (
        <span
          data-slot={slots.description}
          className="mt-0.5 block whitespace-normal text-xs font-normal leading-snug text-muted-foreground"
        >
          {item.description}
        </span>
      ) : null}
    </span>
  );
}

function sheetItemClassName(destructive?: boolean) {
  return cn(
    "flex min-h-11 w-full items-center gap-[var(--ui-control-gap)] rounded-[var(--ui-menu-item-radius,var(--ui-radius-control))] px-2.5 py-2 text-left text-sm outline-hidden transition-colors focus-visible:bg-accent focus-visible:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    destructive
      ? "text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive dark:focus-visible:bg-destructive/20"
      : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

function getAriaLabel(label: React.ReactNode) {
  return typeof label === "string" ? label : undefined;
}

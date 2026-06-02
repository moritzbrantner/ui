"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar } from "../stable/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../stable/dropdown-menu";

export type AccountMenuUser = {
  name: React.ReactNode;
  email?: React.ReactNode;
  imageUrl?: string | null;
  initials?: string;
  meta?: React.ReactNode;
};

export type AccountMenuItem = {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
};

type DataAttributes = Record<`data-${string}`, string | number | boolean | undefined>;

export type AccountMenuProps = Omit<React.ComponentPropsWithoutRef<"button">, "children"> & {
  user: AccountMenuUser | null;
  modal?: React.ComponentProps<typeof DropdownMenu>["modal"];
  label?: string;
  guestLabel?: React.ReactNode;
  items?: AccountMenuItem[];
  triggerVariant?: "icon" | "inline";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  triggerProps?: Omit<React.ComponentPropsWithoutRef<"button">, "children"> & DataAttributes;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent> & DataAttributes;
};

function AccountMenu({
  user,
  modal,
  label = "Open account menu",
  guestLabel = "Guest",
  items = [],
  triggerVariant = "icon",
  align = "end",
  sideOffset = 8,
  className,
  triggerProps,
  contentProps,
  ...buttonProps
}: AccountMenuProps): React.ReactElement {
  const fallbackName = getAccountMenuText(user?.name) ?? getAccountMenuText(guestLabel) ?? label;
  const secondaryText = user?.meta ?? user?.email;
  const inlineUser = triggerVariant === "inline" ? user : null;
  const iconTrigger = inlineUser === null;
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="account-menu-trigger"
          aria-label={label}
          title={label}
          {...buttonProps}
          {...restTriggerProps}
          className={cn(
            inlineUser
              ? "inline-flex h-10 max-w-56 shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/45 px-2.5 pr-3 text-left shadow-[var(--glass-shadow)] outline-none transition-[box-shadow,transform,background-color,border-color] hover:-translate-y-[1px] hover:border-border hover:bg-accent/45 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              : "group/account-menu inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            className,
            triggerClassName,
          )}
        >
          <Avatar
            className={
              iconTrigger
                ? "shadow-[var(--glass-shadow)] transition-[box-shadow,transform,filter] group-hover/account-menu:-translate-y-[1px] group-hover/account-menu:brightness-[1.03] group-data-[state=open]/account-menu:-translate-y-[1px]"
                : undefined
            }
            size={inlineUser ? "sm" : "default"}
            name={fallbackName}
            initials={user?.initials}
            imageUrl={user?.imageUrl}
          />
          {inlineUser ? (
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium text-foreground">
                {inlineUser.name}
              </span>
              {secondaryText ? (
                <span className="truncate text-xs text-muted-foreground">{secondaryText}</span>
              ) : null}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...restContentProps}
        data-slot="account-menu"
        aria-label={restContentProps["aria-label"] ?? label}
        align={align}
        sideOffset={sideOffset}
        className={cn("w-72", contentClassName)}
      >
        <DropdownMenuLabel className="grid gap-0.5 px-2 py-2">
          <span className="truncate text-sm font-medium text-popover-foreground">
            {user?.name ?? guestLabel}
          </span>
          {user?.email ? <span className="truncate text-xs">{user.email}</span> : null}
          {user?.meta ? <span className="truncate text-xs">{user.meta}</span> : null}
        </DropdownMenuLabel>
        {items.length > 0 ? <DropdownMenuSeparator /> : null}
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={item.disabled}
            variant={item.destructive ? "destructive" : "default"}
            onSelect={item.onSelect}
          >
            {item.icon}
            <span className="min-w-0 truncate">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getAccountMenuText(value: React.ReactNode): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export { AccountMenu };

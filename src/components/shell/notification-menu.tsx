"use client";

import * as React from "react";
import { BellIcon, CheckCheckIcon, CheckIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../stable/dropdown-menu";

export type NotificationMenuItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  unread?: boolean;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  onMarkRead?: (itemId: string, item: NotificationMenuItem) => void;
};

type DataAttributes = Record<`data-${string}`, string | number | boolean | undefined>;

export type NotificationMenuProps = {
  modal?: React.ComponentProps<typeof DropdownMenu>["modal"];
  label?: string;
  titleHref?: string;
  titleLinkProps?: Omit<React.ComponentPropsWithoutRef<"a">, "children" | "href">;
  unreadCount?: number;
  maxCount?: number;
  items?: NotificationMenuItem[];
  emptyLabel?: React.ReactNode;
  markAllReadLabel?: React.ReactNode;
  markReadLabel?: React.ReactNode;
  onMarkAllRead?: () => void;
  onMarkRead?: (itemId: string, item: NotificationMenuItem) => void;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  maxItems?: number;
  className?: string;
  triggerProps?: Omit<React.ComponentProps<typeof Button>, "children"> & DataAttributes;
  contentProps?: React.ComponentProps<typeof DropdownMenuContent> & DataAttributes;
};

function NotificationMenu({
  modal,
  label = "Notifications",
  titleHref,
  titleLinkProps,
  unreadCount,
  maxCount = 99,
  items = [],
  emptyLabel = "No notifications",
  markAllReadLabel = "Mark all read",
  markReadLabel = "Mark read",
  onMarkAllRead,
  onMarkRead,
  align = "end",
  sideOffset = 8,
  maxItems,
  className,
  triggerProps,
  contentProps,
}: NotificationMenuProps): React.ReactElement {
  const [readItemIds, setReadItemIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const [localUnreadAdjustment, setLocalUnreadAdjustment] = React.useState(0);
  const previousUnreadCountRef = React.useRef(unreadCount);
  const instanceId = React.useId();
  const unreadItemIds = React.useMemo(
    () => new Set(items.filter((item) => item.unread).map((item) => item.id)),
    [items],
  );
  const visibleItems = React.useMemo(
    () =>
      (typeof maxItems === "number" ? items.slice(0, maxItems) : items).map((item) =>
        readItemIds.has(item.id) ? { ...item, unread: false } : item,
      ),
    [items, maxItems, readItemIds],
  );
  const localReadCount = [...readItemIds].filter((itemId) => unreadItemIds.has(itemId)).length;
  const effectiveUnreadCount = Math.max(
    0,
    unreadCount === undefined
      ? unreadItemIds.size - localReadCount
      : unreadCount - localUnreadAdjustment,
  );
  const countLabel = formatNotificationMenuCount(effectiveUnreadCount, maxCount);
  const accessibleLabel =
    effectiveUnreadCount > 0 ? `${label}, ${effectiveUnreadCount} unread` : label;
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};
  const markReadText = getNotificationMenuText(markReadLabel) ?? "Mark read";
  const getItemTitleId = React.useCallback(
    (itemId: string) => `${instanceId}-notification-${itemId}-title`,
    [instanceId],
  );

  React.useEffect(() => {
    setReadItemIds((currentReadItemIds) => {
      const nextReadItemIds = new Set(
        [...currentReadItemIds].filter((itemId) => unreadItemIds.has(itemId)),
      );

      return nextReadItemIds.size === currentReadItemIds.size
        ? currentReadItemIds
        : nextReadItemIds;
    });
  }, [unreadItemIds]);

  React.useEffect(() => {
    if (previousUnreadCountRef.current === unreadCount) {
      return;
    }

    previousUnreadCountRef.current = unreadCount;
    setLocalUnreadAdjustment(0);
  }, [unreadCount]);

  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-slot="notification-menu-trigger"
          variant="outline"
          size="icon"
          aria-label={accessibleLabel}
          title={accessibleLabel}
          className={cn("relative", className, triggerClassName)}
          {...restTriggerProps}
        >
          <BellIcon />
          {effectiveUnreadCount > 0 ? (
            <Badge
              asChild
              className="absolute right-0.5 top-0.5 h-4 min-w-4 justify-center px-1 text-[10px] leading-none"
            >
              <span aria-hidden="true">{countLabel}</span>
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...restContentProps}
        data-slot="notification-menu"
        aria-label={restContentProps["aria-label"] ?? label}
        align={align}
        sideOffset={sideOffset}
        className={cn("w-80", contentClassName)}
      >
        {titleHref ? (
          <DropdownMenuItem asChild className="justify-between gap-3 px-2 py-2">
            <a
              {...titleLinkProps}
              href={titleHref}
              className={cn(
                "min-w-0 rounded-sm text-sm font-medium text-popover-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                titleLinkProps?.className,
              )}
            >
              <span className="truncate">{label}</span>
              {effectiveUnreadCount > 0 ? (
                <span className="shrink-0 text-xs font-normal text-muted-foreground">
                  {effectiveUnreadCount} unread
                </span>
              ) : null}
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuLabel className="flex items-center justify-between gap-3 px-2 py-2">
            <span className="truncate text-sm font-medium text-popover-foreground">{label}</span>
            {effectiveUnreadCount > 0 ? (
              <span className="shrink-0 text-xs">{effectiveUnreadCount} unread</span>
            ) : null}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        {visibleItems.length === 0 ? (
          <DropdownMenuLabel className="px-2 py-3 text-sm">{emptyLabel}</DropdownMenuLabel>
        ) : (
          visibleItems.map((item) => {
            const itemMarkRead = item.onMarkRead ?? onMarkRead;
            const canMarkRead = Boolean(item.unread && !item.disabled);
            const itemTitle = getNotificationMenuText(item.title);
            const markReadActionTitle = itemTitle ? `Mark ${itemTitle} as read` : markReadText;

            return (
              <React.Fragment key={item.id}>
                <DropdownMenuItem
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className="items-start gap-2 py-2 pr-1"
                >
                  {item.icon ? <span className="mt-0.5 shrink-0">{item.icon}</span> : null}
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span id={getItemTitleId(item.id)} className="min-w-0 truncate font-medium">
                        {item.title}
                      </span>
                      {item.unread ? (
                        <span
                          aria-hidden="true"
                          data-slot="notification-menu-unread-indicator"
                          className="size-2 shrink-0 rounded-full bg-primary"
                        />
                      ) : null}
                    </span>
                    {item.description ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {item.meta ? (
                    <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                      {item.meta}
                    </span>
                  ) : null}
                </DropdownMenuItem>
                {canMarkRead ? (
                  <DropdownMenuItem
                    aria-label={markReadText}
                    aria-describedby={itemTitle ? getItemTitleId(item.id) : undefined}
                    title={markReadActionTitle}
                    onSelect={() => {
                      if (!readItemIds.has(item.id)) {
                        setReadItemIds((currentReadItemIds) => {
                          const nextReadItemIds = new Set(currentReadItemIds);
                          nextReadItemIds.add(item.id);

                          return nextReadItemIds;
                        });
                        setLocalUnreadAdjustment((currentAdjustment) => currentAdjustment + 1);
                      }

                      if (item.onMarkRead) {
                        item.onMarkRead(item.id, item);
                        return;
                      }

                      itemMarkRead?.(item.id, item);
                    }}
                    className="pl-8 text-xs text-muted-foreground"
                  >
                    <CheckIcon className="size-3.5" />
                    {markReadLabel}
                  </DropdownMenuItem>
                ) : null}
              </React.Fragment>
            );
          })
        )}
        {onMarkAllRead ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={effectiveUnreadCount === 0} onSelect={onMarkAllRead}>
              <CheckCheckIcon />
              {markAllReadLabel}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatNotificationMenuCount(count: number, maxCount: number): string {
  const safeCount = Math.max(0, Math.trunc(count));
  const safeMax = Math.max(1, Math.trunc(maxCount));

  return safeCount > safeMax ? `${safeMax}+` : String(safeCount);
}

function getNotificationMenuText(value: React.ReactNode): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export { NotificationMenu };

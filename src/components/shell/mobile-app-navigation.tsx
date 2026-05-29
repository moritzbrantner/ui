"use client";

import * as React from "react";
import { MenuIcon } from "lucide-react";

import { cn } from "../../lib/cn";
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
import type { NavbarGroup, NavbarItem } from "./navbar";

export type MobileAppNavigationTabItem = NavbarItem & {
  groupId?: string;
  ariaLabel?: string;
};

export type MobileAppNavigationRenderLinkProps = MobileAppNavigationTabItem & {
  className: string;
  children: React.ReactNode;
  placement: "tab" | "drawer";
  "aria-current"?: "page";
  onClick: () => void;
};

export type MobileAppNavigationProps = Omit<React.ComponentPropsWithoutRef<"nav">, "children"> & {
  brand?: React.ReactNode;
  groups: NavbarGroup[];
  tabs?: MobileAppNavigationTabItem[];
  maxTabs?: 3 | 4 | 5;
  activeItemId?: string;
  activeGroupId?: string;
  menuLabel?: string;
  menuTitle?: React.ReactNode;
  menuDescription?: React.ReactNode;
  actionSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  drawerOpen?: boolean;
  defaultDrawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  onNavigate?: (item: NavbarItem, group?: NavbarGroup) => void;
  renderLink?: (props: MobileAppNavigationRenderLinkProps) => React.ReactNode;
};

export type MobileAppNavigationBarProps = React.ComponentPropsWithoutRef<"div">;
export type MobileAppNavigationTabProps = MobileAppNavigationRenderLinkProps;
export type MobileAppNavigationMenuButtonProps = React.ComponentPropsWithoutRef<"button">;
export type MobileAppNavigationDrawerProps = React.ComponentProps<typeof MobileSlideContent>;

function getInitialTabs(groups: NavbarGroup[], maxTabs: 3 | 4 | 5): MobileAppNavigationTabItem[] {
  const derivedTabs: MobileAppNavigationTabItem[] = [];

  for (const group of groups) {
    const item = group.items.find((candidate) => !candidate.disabled);

    if (item) {
      derivedTabs.push({ ...item, groupId: group.id });
    }

    if (derivedTabs.length >= maxTabs) {
      break;
    }
  }

  return derivedTabs;
}

function getGroupForItem(groups: NavbarGroup[], item: MobileAppNavigationTabItem) {
  if (item.groupId) {
    return groups.find((group) => group.id === item.groupId);
  }

  return groups.find((group) => group.items.some((candidate) => candidate.id === item.id));
}

function useControllableDrawer({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const resolvedOpen = open ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  return [resolvedOpen, setOpen] as const;
}

function DefaultMobileAppNavigationLink({
  href,
  disabled,
  className,
  children,
  onClick,
  ariaLabel,
  placement,
  ...props
}: MobileAppNavigationRenderLinkProps) {
  const slot = placement === "tab" ? "mobile-app-navigation-tab" : undefined;

  if (disabled || !href) {
    return (
      <button
        type="button"
        data-slot={slot}
        className={className}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        aria-label={ariaLabel}
        aria-current={props["aria-current"]}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      data-slot={slot}
      href={href}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={props["aria-current"]}
    >
      {children}
    </a>
  );
}

function MobileAppNavigationBar({ className, ...props }: MobileAppNavigationBarProps) {
  return (
    <div
      data-slot="mobile-app-navigation-bar"
      className={cn(
        "grid min-h-16 w-full auto-cols-fr grid-flow-col items-stretch gap-1 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
        className,
      )}
      {...props}
    />
  );
}

function MobileAppNavigationTab({ className, children, ...props }: MobileAppNavigationTabProps) {
  return DefaultMobileAppNavigationLink({
    ...props,
    className: cn(
      "group inline-flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-center text-xs font-medium outline-none transition-[background-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
      props["aria-current"] === "page"
        ? "bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
        : "text-muted-foreground hover:bg-accent/55 hover:text-foreground",
      className,
    ),
    children,
  });
}

function MobileAppNavigationMenuButton({
  className,
  children,
  ...props
}: MobileAppNavigationMenuButtonProps) {
  return (
    <button
      type="button"
      data-slot="mobile-app-navigation-menu-button"
      className={cn(
        "inline-flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-center text-xs font-medium text-muted-foreground outline-none transition-[background-color,color,box-shadow,transform] hover:bg-accent/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <MenuIcon className="size-5" aria-hidden="true" />
          <span className="max-w-full truncate">Menu</span>
        </>
      )}
    </button>
  );
}

function MobileAppNavigationDrawer({
  className,
  children,
  ...props
}: MobileAppNavigationDrawerProps) {
  return (
    <MobileSlideContent
      showCloseButton
      data-slot="mobile-app-navigation-drawer"
      className={cn("max-h-[88dvh]", className)}
      {...props}
    >
      {children}
    </MobileSlideContent>
  );
}

function MobileAppNavigation({
  brand,
  groups,
  tabs,
  maxTabs = 5,
  activeItemId,
  activeGroupId,
  menuLabel = "Open navigation menu",
  menuTitle,
  menuDescription,
  actionSlot,
  footerSlot,
  drawerOpen,
  defaultDrawerOpen,
  onDrawerOpenChange,
  onNavigate,
  renderLink,
  className,
  "aria-label": ariaLabel = "Mobile app navigation",
  ...props
}: MobileAppNavigationProps) {
  const [resolvedDrawerOpen, setDrawerOpen] = useControllableDrawer({
    open: drawerOpen,
    defaultOpen: defaultDrawerOpen,
    onOpenChange: onDrawerOpenChange,
  });
  const resolvedTabs = tabs ?? getInitialTabs(groups, maxTabs);
  const resolvedMenuTitle = menuTitle ?? brand ?? "Navigation";
  const renderNavigationLink = renderLink ?? DefaultMobileAppNavigationLink;

  const handleSelect = React.useCallback(
    (item: NavbarItem, group?: NavbarGroup, closeDrawer = false) => {
      if (item.disabled) {
        return;
      }

      item.onSelect?.();
      onNavigate?.(item, group);

      if (closeDrawer) {
        setDrawerOpen(false);
      }
    },
    [onNavigate, setDrawerOpen],
  );

  return (
    <MobileSlide direction="bottom" open={resolvedDrawerOpen} onOpenChange={setDrawerOpen}>
      <nav
        data-slot="mobile-app-navigation"
        aria-label={ariaLabel}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/85 text-card-foreground shadow-[0_-18px_45px_-32px_rgb(15_23_42_/_0.45)] backdrop-blur-2xl supports-backdrop-filter:backdrop-blur-2xl",
          className,
        )}
        {...props}
      >
        <MobileAppNavigationBar>
          {resolvedTabs.map((item) => {
            const group = getGroupForItem(groups, item);
            const isCurrent =
              item.id === activeItemId ||
              item.active ||
              (activeGroupId !== undefined && item.groupId === activeGroupId);
            const content = (
              <>
                {item.icon ? <span className="shrink-0 text-current">{item.icon}</span> : null}
                <span className="max-w-full truncate">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-1 right-2 rounded-full bg-destructive px-1.5 py-0.5 text-[0.625rem] leading-none text-destructive-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </>
            );
            const className = cn(
              "relative inline-flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-center text-xs font-medium outline-none transition-[background-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
              isCurrent
                ? "bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
                : "text-muted-foreground hover:bg-accent/55 hover:text-foreground",
            );

            return (
              <React.Fragment key={item.id}>
                {renderNavigationLink({
                  ...item,
                  className,
                  children: content,
                  placement: "tab",
                  "aria-current": isCurrent ? "page" : undefined,
                  onClick: () => handleSelect(item, group),
                })}
              </React.Fragment>
            );
          })}
          <MobileSlideTrigger asChild>
            <MobileAppNavigationMenuButton aria-label={menuLabel} />
          </MobileSlideTrigger>
        </MobileAppNavigationBar>
      </nav>

      <MobileAppNavigationDrawer>
        <MobileSlideHeader>
          <MobileSlideTitle>{resolvedMenuTitle}</MobileSlideTitle>
          {menuDescription ? (
            <MobileSlideDescription>{menuDescription}</MobileSlideDescription>
          ) : (
            <MobileSlideDescription className="sr-only">
              Mobile navigation destinations
            </MobileSlideDescription>
          )}
          {actionSlot ? (
            <div
              data-slot="mobile-app-navigation-actions"
              className="mt-3 flex min-w-0 flex-wrap items-center gap-2 [&>*]:min-w-0"
            >
              {actionSlot}
            </div>
          ) : null}
        </MobileSlideHeader>
        <MobileSlideBody className="grid gap-4">
          {groups.map((group) => (
            <section
              key={group.id}
              data-slot="mobile-app-navigation-drawer-group"
              className="grid gap-2"
            >
              <div className="grid gap-0.5 px-1">
                <h3 className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                  {group.icon ? <span className="shrink-0 text-current">{group.icon}</span> : null}
                  <span className="min-w-0 truncate">{group.label}</span>
                </h3>
                {group.description ? (
                  <p className="text-xs leading-5 text-muted-foreground">{group.description}</p>
                ) : null}
              </div>
              <div className="grid gap-1">
                {group.items.map((item) => {
                  const isCurrent = item.id === activeItemId || item.active;
                  const drawerItem = { ...item, groupId: group.id };
                  const className = cn(
                    "group flex min-h-12 min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                    isCurrent
                      ? "border-primary/45 bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
                      : "border-border/45 bg-background/35 text-foreground hover:border-border hover:bg-accent/45",
                  );
                  const content = (
                    <>
                      {item.icon ? (
                        <span className="shrink-0 text-current">{item.icon}</span>
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">{item.label}</span>
                          {item.badge ? (
                            <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[0.68rem]">
                              {item.badge}
                            </span>
                          ) : null}
                        </span>
                        {item.description ? (
                          <span
                            className={cn(
                              "mt-0.5 block text-xs leading-5",
                              isCurrent ? "text-primary-foreground/75" : "text-muted-foreground",
                            )}
                          >
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                      {item.meta ? (
                        <span
                          className={cn(
                            "shrink-0 text-xs",
                            isCurrent ? "text-primary-foreground/75" : "text-muted-foreground",
                          )}
                        >
                          {item.meta}
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <div key={item.id} data-slot="mobile-app-navigation-drawer-item">
                      {renderNavigationLink({
                        ...drawerItem,
                        className,
                        children: content,
                        placement: "drawer",
                        "aria-current": isCurrent ? "page" : undefined,
                        onClick: () => handleSelect(item, group, true),
                      })}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </MobileSlideBody>
        {footerSlot ? (
          <MobileSlideFooter>
            <div data-slot="mobile-app-navigation-footer" className="min-w-0">
              {footerSlot}
            </div>
          </MobileSlideFooter>
        ) : null}
      </MobileAppNavigationDrawer>
    </MobileSlide>
  );
}

export {
  MobileAppNavigation,
  MobileAppNavigationBar,
  MobileAppNavigationDrawer,
  MobileAppNavigationMenuButton,
  MobileAppNavigationTab,
};

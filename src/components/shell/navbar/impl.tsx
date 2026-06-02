"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { MenuIcon, MoreHorizontalIcon } from "lucide-react";

import { useIsMobile } from "../../../hooks/use-mobile";
import { cn } from "../../../lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../stable/dropdown-menu";

export type NavbarItem = {
  id: string;
  label: React.ReactNode;
  href?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export type NavbarGroup = {
  id: string;
  label: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  items: NavbarItem[];
};

export type NavbarVariant = "mobile" | "web" | "desktop";
export type NavbarResponsiveVariant = NavbarVariant | "auto";

export type NavbarRenderLinkProps = NavbarItem & {
  className: string;
  children: React.ReactNode;
  "aria-current"?: "page";
  onClick: () => void;
};

export type NavbarProps = Omit<React.ComponentPropsWithoutRef<"nav">, "children"> & {
  brand: React.ReactNode;
  groups: NavbarGroup[];
  actions?: React.ReactNode;
  actionSlot?: React.ReactNode;
  variant?: NavbarResponsiveVariant;
  activeItemId?: string;
  activeGroupId?: string;
  defaultOpenGroupId?: string | null;
  openGroupId?: string | null;
  onOpenGroupChange?: (groupId: string | null) => void;
  onNavigate?: (item: NavbarItem, group: NavbarGroup) => void;
  renderLink?: (props: NavbarRenderLinkProps) => React.ReactNode;
};

const variantConfig = {
  mobile: {
    nav: "mx-auto w-full max-w-md rounded-xl p-2",
    chrome: "flex-col gap-2",
    brand: "w-full px-3",
    groups: "w-full gap-1",
    trigger: "min-h-12 flex-col px-2 py-1.5 text-xs",
    panel: "origin-top overflow-y-auto rounded-xl p-2",
    list: "grid gap-2",
  },
  web: {
    nav: "mx-auto w-full max-w-5xl rounded-xl p-1.5",
    chrome: "items-center gap-2",
    brand: "min-w-36 px-4",
    groups: "flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto",
    trigger: "h-10 px-4 text-sm",
    panel: "origin-top rounded-xl p-3",
    list: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
  },
  desktop: {
    nav: "w-full rounded-lg p-1.5",
    chrome: "items-center gap-2",
    brand: "min-w-44 px-3",
    groups: "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto",
    trigger: "h-9 px-3 text-sm",
    panel: "origin-top rounded-xl p-2",
    list: "grid gap-1.5 sm:grid-cols-2",
  },
} satisfies Record<
  NavbarVariant,
  {
    nav: string;
    chrome: string;
    brand: string;
    groups: string;
    trigger: string;
    panel: string;
    list: string;
  }
>;

const submenuSizeConfig = {
  mobile: { gap: 8, margin: 8, maxWidth: 28 * 16 },
  web: { gap: 12, margin: 16, maxWidth: 58 * 16 },
  desktop: { gap: 10, margin: 16, maxWidth: 44 * 16 },
} satisfies Record<NavbarVariant, { gap: number; margin: number; maxWidth: number }>;

const navbarOpenEvent = "navbar:open";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    >
      <path d="M4 6 8 10l4-4" />
    </svg>
  );
}

function DefaultLink({
  href,
  disabled,
  className,
  children,
  onClick,
  ...props
}: NavbarRenderLinkProps) {
  if (disabled || !href) {
    return (
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        aria-current={props["aria-current"]}
      >
        {children}
      </button>
    );
  }

  return (
    <a href={href} className={className} onClick={onClick} aria-current={props["aria-current"]}>
      {children}
    </a>
  );
}

function NavbarMobileActionsMenu({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="navbar-mobile-actions-trigger"
          aria-label="More navigation actions"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border/55 bg-background/36 px-2.5 text-foreground/78 outline-none transition-[background-color,border-color,color,box-shadow,transform] hover:-translate-y-px hover:border-border hover:bg-accent/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.97] motion-reduce:transition-none"
        >
          <MoreHorizontalIcon className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        data-slot="navbar-mobile-actions-menu"
        className="w-auto max-w-[calc(100vw-1rem)] min-w-0 p-2 [&>[data-slot=navbar-actions]]:flex-wrap [&>[data-slot=navbar-actions]]:justify-start [&>[data-slot=navbar-actions]]:overflow-visible"
      >
        <DropdownMenuLabel>Navigation actions</DropdownMenuLabel>
        <div data-slot="navbar-mobile-actions" className="min-w-0">
          {children}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitialOpenGroupId(
  groups: NavbarGroup[],
  activeGroupId?: string,
  activeItemId?: string,
  defaultOpenGroupId?: string | null,
) {
  if (defaultOpenGroupId !== undefined) {
    return defaultOpenGroupId;
  }

  if (activeGroupId && groups.some((group) => group.id === activeGroupId)) {
    return activeGroupId;
  }

  const activeGroup = groups.find((group) =>
    group.items.some((item) => item.id === activeItemId || item.active),
  );

  return activeGroup?.id ?? null;
}

export type NavbarActionGroupProps = React.ComponentPropsWithoutRef<"div">;

export function NavbarActionGroup({ className, ...props }: NavbarActionGroupProps) {
  return (
    <div
      data-slot="navbar-actions"
      className={cn(
        "flex min-w-0 shrink-0 items-center justify-end gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:min-h-10 [&>button]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function Navbar({
  brand,
  groups,
  actions,
  actionSlot,
  variant = "auto",
  activeItemId,
  activeGroupId,
  defaultOpenGroupId,
  openGroupId,
  onOpenGroupChange,
  onNavigate,
  renderLink,
  className,
  "aria-label": ariaLabel = "Primary navigation",
  ...props
}: NavbarProps) {
  const isMobile = useIsMobile();
  const instanceId = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const submenuRef = React.useRef<HTMLDivElement>(null);
  const triggerRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  const [submenuStyle, setSubmenuStyle] = React.useState<React.CSSProperties>();
  const [uncontrolledOpenGroupId, setUncontrolledOpenGroupId] = React.useState<string | null>(() =>
    getInitialOpenGroupId(groups, activeGroupId, activeItemId, defaultOpenGroupId),
  );
  const resolvedVariant: NavbarVariant =
    variant === "auto" ? (isMobile ? "mobile" : "web") : variant;
  const config = variantConfig[resolvedVariant];
  const shouldCollapseMobileGroups = resolvedVariant === "mobile" && groups.length > 3;
  const groupListClassName = cn(
    config.groups,
    resolvedVariant === "mobile" ? (shouldCollapseMobileGroups ? "grid" : "grid") : undefined,
  );
  const groupListStyle: React.CSSProperties | undefined =
    resolvedVariant === "mobile" && !shouldCollapseMobileGroups
      ? { gridTemplateColumns: `repeat(${Math.max(groups.length, 1)}, minmax(0, 1fr))` }
      : undefined;
  const currentOpenGroupId = openGroupId !== undefined ? openGroupId : uncontrolledOpenGroupId;
  const openGroup = shouldCollapseMobileGroups
    ? null
    : (groups.find((group) => group.id === currentOpenGroupId && group.items.length > 0) ?? null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderedActions =
    actionSlot ?? (actions ? <NavbarActionGroup>{actions}</NavbarActionGroup> : null);

  const resolvedActiveGroupId =
    activeGroupId ??
    groups.find((group) => group.items.some((item) => item.id === activeItemId || item.active))?.id;

  const setOpenGroupId = React.useCallback(
    (groupId: string | null) => {
      if (openGroupId === undefined) {
        setUncontrolledOpenGroupId(groupId);
      }
      onOpenGroupChange?.(groupId);
    },
    [onOpenGroupChange, openGroupId],
  );

  const getSubmenuId = React.useCallback(
    (groupId: string) => `navbar-${instanceId}-submenu-${groupId}`,
    [instanceId],
  );
  const mobileMenuId = `navbar-${instanceId}-mobile-menu`;
  const mobileMenuTriggerId = `navbar-${instanceId}-mobile-menu-trigger`;
  const getTriggerId = React.useCallback(
    (groupId: string) => `navbar-${instanceId}-trigger-${groupId}`,
    [instanceId],
  );

  const containsNavbarTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof Node)) {
      return false;
    }

    return Boolean(containerRef.current?.contains(target) || submenuRef.current?.contains(target));
  }, []);

  const handleBlurCapture = React.useCallback(
    (event: React.FocusEvent) => {
      if (!containsNavbarTarget(event.relatedTarget)) {
        setOpenGroupId(null);
        setIsMobileMenuOpen(false);
      }
    },
    [containsNavbarTarget, setOpenGroupId],
  );

  const updateSubmenuPosition = React.useCallback(() => {
    if ((!openGroup && !isMobileMenuOpen) || typeof window === "undefined") {
      setSubmenuStyle(undefined);
      return;
    }

    const container = containerRef.current;
    const trigger = openGroup ? triggerRefs.current.get(openGroup.id) : undefined;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const navRect = navRef.current?.getBoundingClientRect() ?? containerRect;
    const triggerRect = trigger?.getBoundingClientRect();
    const submenuRect = submenuRef.current?.getBoundingClientRect();
    const { gap, margin, maxWidth } = submenuSizeConfig[resolvedVariant];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableWidth = Math.max(0, viewportWidth - margin * 2);
    const anchorRect = resolvedVariant === "mobile" ? navRect : containerRect;
    const anchorWidth = anchorRect.width || availableWidth;
    const preferredMobileWidth = Math.min(anchorWidth - margin * 2, maxWidth);
    const width =
      resolvedVariant === "mobile"
        ? Math.min(Math.max(preferredMobileWidth, 0), availableWidth)
        : Math.min(maxWidth, availableWidth);
    const triggerCenter =
      triggerRect && triggerRect.width > 0
        ? triggerRect.left + triggerRect.width / 2
        : anchorRect.left + anchorWidth / 2;
    const rawLeft =
      resolvedVariant === "mobile" ? anchorRect.left + margin : triggerCenter - width / 2;
    const left = clamp(rawLeft, margin, viewportWidth - width - margin);
    const verticalAnchorRect = navRect;
    const belowTop = verticalAnchorRect.bottom + gap;
    const availableBelow = viewportHeight - belowTop - margin;
    const aboveBottom = verticalAnchorRect.top - gap;
    const availableAbove = aboveBottom - margin;
    const measuredHeight = submenuRect?.height ?? 0;
    const preferredHeight = Math.max(measuredHeight, 160);
    const shouldOpenAbove = availableBelow < 160 && availableAbove > availableBelow;
    const maxHeight = Math.max(160, shouldOpenAbove ? availableAbove : availableBelow);
    const top = shouldOpenAbove
      ? Math.max(margin, aboveBottom - Math.min(preferredHeight, maxHeight))
      : belowTop;

    setSubmenuStyle({
      left,
      maxHeight,
      top,
      transformOrigin: shouldOpenAbove ? "bottom center" : "top center",
      width,
    });
  }, [isMobileMenuOpen, openGroup, resolvedVariant]);

  React.useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  React.useEffect(() => {
    function handleNavbarOpen(event: Event) {
      const openedInstanceId = (event as CustomEvent<{ instanceId?: string }>).detail?.instanceId;

      if (openedInstanceId && openedInstanceId !== instanceId) {
        setOpenGroupId(null);
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener(navbarOpenEvent, handleNavbarOpen);

    return () => {
      window.removeEventListener(navbarOpenEvent, handleNavbarOpen);
    };
  }, [instanceId, setOpenGroupId]);

  React.useEffect(() => {
    if (!openGroup && !isMobileMenuOpen) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(navbarOpenEvent, {
        detail: { instanceId },
      }),
    );
  }, [instanceId, isMobileMenuOpen, openGroup]);

  React.useLayoutEffect(() => {
    if (!openGroup && !isMobileMenuOpen) {
      setSubmenuStyle(undefined);
      return;
    }

    updateSubmenuPosition();
    const frame = window.requestAnimationFrame(updateSubmenuPosition);

    window.addEventListener("resize", updateSubmenuPosition);
    window.addEventListener("scroll", updateSubmenuPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSubmenuPosition);
      window.removeEventListener("scroll", updateSubmenuPosition, true);
    };
  }, [isMobileMenuOpen, openGroup, portalContainer, updateSubmenuPosition]);

  React.useEffect(() => {
    if (!openGroup && !isMobileMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containsNavbarTarget(event.target)) {
        setOpenGroupId(null);
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroupId(null);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containsNavbarTarget, isMobileMenuOpen, openGroup, setOpenGroupId]);

  const submenu = openGroup ? (
    <div
      key={openGroup.id}
      ref={submenuRef}
      id={getSubmenuId(openGroup.id)}
      data-slot="navbar-submenu"
      data-open
      aria-labelledby={getTriggerId(openGroup.id)}
      className={cn(
        "fixed z-[100] overflow-x-hidden overflow-y-auto border border-border/60 bg-popover/74 text-popover-foreground opacity-100 shadow-[var(--glass-shadow)] backdrop-blur-2xl transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        config.panel,
      )}
      style={submenuStyle}
      onBlurCapture={handleBlurCapture}
    >
      {openGroup.eyebrow || openGroup.description ? (
        <div className="mb-2 px-2 py-1">
          {openGroup.eyebrow ? (
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {openGroup.eyebrow}
            </p>
          ) : null}
          {openGroup.description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{openGroup.description}</p>
          ) : null}
        </div>
      ) : null}

      <div className={config.list}>
        {openGroup.items.map((item) => {
          const isCurrent = item.id === activeItemId || item.active;
          const itemClassName = cn(
            "group flex min-h-16 min-w-0 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            isCurrent
              ? "border-primary/45 bg-primary text-primary-foreground"
              : "border-border/45 bg-background/36 text-foreground hover:border-border hover:bg-accent/45",
            item.disabled ? "pointer-events-none opacity-50" : undefined,
          );
          const content = (
            <>
              {item.icon ? <span className="shrink-0 text-current">{item.icon}</span> : null}
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
                      "mt-1 block text-xs leading-5",
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
          const handleItemClick = () => {
            item.onSelect?.();
            onNavigate?.(item, openGroup);
            setOpenGroupId(null);
            setIsMobileMenuOpen(false);
          };

          return (
            <div
              key={item.id}
              className="transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
            >
              {(renderLink ?? DefaultLink)({
                ...item,
                className: itemClassName,
                children: content,
                "aria-current": isCurrent ? "page" : undefined,
                onClick: handleItemClick,
              })}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
  const mobileMenu =
    isMobileMenuOpen && shouldCollapseMobileGroups ? (
      <div
        ref={submenuRef}
        id={mobileMenuId}
        data-slot="navbar-mobile-menu"
        data-open
        aria-labelledby={mobileMenuTriggerId}
        className={cn(
          "fixed z-[100] overflow-x-hidden overflow-y-auto border border-border/60 bg-popover/74 text-popover-foreground opacity-100 shadow-[var(--glass-shadow)] backdrop-blur-2xl transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          config.panel,
        )}
        style={submenuStyle}
        onBlurCapture={handleBlurCapture}
      >
        <div className="mb-2 px-2 py-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">Navigation</p>
        </div>

        <div className="grid gap-3">
          {groups.map((group) => (
            <section key={group.id} data-slot="navbar-mobile-menu-group" className="grid gap-2">
              <div className="flex min-w-0 items-center gap-2 px-2">
                {group.icon ? (
                  <span className="shrink-0 text-muted-foreground">{group.icon}</span>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{group.label}</p>
                  {group.description ? (
                    <p className="truncate text-xs text-muted-foreground">{group.description}</p>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-2">
                {group.items.map((item) => {
                  const isCurrent = item.id === activeItemId || item.active;
                  const itemClassName = cn(
                    "group flex min-h-12 min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                    isCurrent
                      ? "border-primary/45 bg-primary text-primary-foreground"
                      : "border-border/45 bg-background/36 text-foreground hover:border-border hover:bg-accent/45",
                    item.disabled ? "pointer-events-none opacity-50" : undefined,
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
                              "mt-1 block text-xs leading-5",
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
                  const handleItemClick = () => {
                    item.onSelect?.();
                    onNavigate?.(item, group);
                    setOpenGroupId(null);
                    setIsMobileMenuOpen(false);
                  };

                  return (
                    <div
                      key={item.id}
                      data-slot="navbar-mobile-menu-item"
                      className="transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
                    >
                      {(renderLink ?? DefaultLink)({
                        ...item,
                        className: itemClassName,
                        children: content,
                        "aria-current": isCurrent ? "page" : undefined,
                        onClick: handleItemClick,
                      })}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    ) : null;

  const floatingContent = mobileMenu ?? submenu;
  const mobileMenuTrigger = shouldCollapseMobileGroups ? (
    <button
      type="button"
      id={mobileMenuTriggerId}
      data-slot="navbar-mobile-menu-trigger"
      aria-controls={isMobileMenuOpen ? mobileMenuId : undefined}
      aria-expanded={isMobileMenuOpen}
      className={cn(
        "relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md border px-3 text-sm font-medium outline-none transition-[transform,background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none hover:-translate-y-px active:scale-[0.97]",
        isMobileMenuOpen
          ? "border-primary/45 bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
          : "border-border/55 bg-background/36 text-foreground/78 hover:border-border hover:bg-accent/45 hover:text-foreground",
      )}
      onClick={() => {
        setOpenGroupId(null);
        setIsMobileMenuOpen((isOpen) => !isOpen);
      }}
    >
      {isMobileMenuOpen ? <span className="absolute inset-0 -z-10 rounded-md bg-primary" /> : null}
      <MenuIcon className="size-4 shrink-0" aria-hidden="true" />
      <span>Menu</span>
    </button>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative overflow-visible"
        onBlurCapture={handleBlurCapture}
      >
        <nav
          ref={navRef}
          aria-label={ariaLabel}
          data-slot="navbar"
          data-variant={resolvedVariant}
          className={cn(
            "relative isolate overflow-hidden border border-border/60 bg-card/70 text-foreground shadow-[var(--glass-shadow)] backdrop-blur-2xl supports-backdrop-filter:backdrop-blur-2xl",
            config.nav,
            className,
          )}
          {...props}
        >
          <div className={cn("flex min-w-0", config.chrome)}>
            <div className={cn("flex min-w-0 items-center gap-2", config.brand)}>
              <div className="min-w-0 flex-1 truncate text-sm font-semibold">{brand}</div>
              {mobileMenuTrigger}
              {resolvedVariant === "mobile" && renderedActions ? (
                <NavbarMobileActionsMenu>{renderedActions}</NavbarMobileActionsMenu>
              ) : null}
            </div>

            {!shouldCollapseMobileGroups ? (
              <div data-slot="navbar-groups" className={groupListClassName} style={groupListStyle}>
                {groups.map((group) => {
                  const isOpen = group.id === openGroup?.id;
                  const isActive = group.id === resolvedActiveGroupId;

                  return (
                    <button
                      key={group.id}
                      data-slot="navbar-trigger"
                      ref={(node) => {
                        if (node) {
                          triggerRefs.current.set(group.id, node);
                        } else {
                          triggerRefs.current.delete(group.id);
                        }
                      }}
                      type="button"
                      id={getTriggerId(group.id)}
                      aria-controls={isOpen ? getSubmenuId(group.id) : undefined}
                      aria-expanded={isOpen}
                      className={cn(
                        "relative inline-flex min-w-0 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md border text-center font-medium outline-none transition-[transform,background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none hover:-translate-y-px active:scale-[0.97]",
                        config.trigger,
                        resolvedVariant === "mobile" ? "w-full" : undefined,
                        isOpen || isActive
                          ? "border-primary/45 bg-primary text-primary-foreground shadow-[var(--glass-interactive-shadow)]"
                          : "border-border/55 bg-background/36 text-foreground/78 hover:border-border hover:bg-accent/45 hover:text-foreground",
                      )}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setOpenGroupId(group.id);
                      }}
                    >
                      {isOpen ? (
                        <span className="absolute inset-0 -z-10 rounded-md bg-primary" />
                      ) : null}
                      {group.icon ? (
                        <span className="shrink-0 text-current">{group.icon}</span>
                      ) : null}
                      <span className="min-w-0 truncate">{group.label}</span>
                      <ChevronIcon
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-200",
                          isOpen ? "rotate-180" : undefined,
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}

            {resolvedVariant !== "mobile" ? renderedActions : null}
          </div>
        </nav>
      </div>
      {portalContainer ? createPortal(floatingContent, portalContainer) : floatingContent}
    </>
  );
}

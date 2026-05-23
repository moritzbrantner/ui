"use client";

import * as React from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge, type BadgeProps } from "../stable/badge";
import { Breadcrumb } from "../stable/breadcrumb";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../stable/breadcrumb";
import { Button } from "../stable/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../stable/tabs";
import { ActionMenu, type ActionMenuProps } from "./action-menu";

type ViewHeaderBreadcrumbItem = {
  id: string;
  label: React.ReactNode;
  href?: string;
  current?: boolean;
};

type ViewHeaderBadge = {
  id: string;
  label: React.ReactNode;
  variant?: BadgeProps["variant"];
};

type ViewHeaderTab = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type ViewHeaderActionMenuProps = Omit<ActionMenuProps, "trigger"> & {
  triggerLabel?: string;
};

type ViewHeaderProps = React.ComponentProps<"header"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  breadcrumbs?: ViewHeaderBreadcrumbItem[];
  badges?: ViewHeaderBadge[];
  actions?: React.ReactNode;
  actionMenu?: ViewHeaderActionMenuProps;
  tabs?: ViewHeaderTab[];
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (value: string) => void;
};

function ViewHeader({
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  badges = [],
  actions,
  actionMenu,
  tabs = [],
  activeTab,
  defaultActiveTab,
  onTabChange,
  className,
  children,
  ...props
}: ViewHeaderProps) {
  const hasTabs = tabs.length > 0;

  return (
    <header
      data-slot="view-header"
      className={cn(
        "grid min-w-0 gap-4 rounded-[var(--ui-radius-surface)] border border-border/60 bg-card/70 p-4 text-card-foreground shadow-[var(--ui-shadow-surface)] supports-backdrop-filter:backdrop-blur-xl md:p-5",
        className,
      )}
      {...props}
    >
      {breadcrumbs.length > 0 ? <ViewHeaderBreadcrumbs items={breadcrumbs} /> : null}
      <div
        data-slot="view-header-main"
        className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      >
        <div data-slot="view-header-copy" className="grid min-w-0 gap-2">
          {eyebrow ? (
            <div
              data-slot="view-header-eyebrow"
              className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            data-slot="view-header-title-row"
            className="flex min-w-0 flex-wrap items-center gap-2"
          >
            <h1
              data-slot="view-header-title"
              className="min-w-0 text-2xl font-semibold leading-tight text-balance text-foreground md:text-3xl"
            >
              {title}
            </h1>
            {badges.length > 0 ? (
              <div
                data-slot="view-header-badges"
                className="flex min-w-0 flex-wrap items-center gap-1.5"
              >
                {badges.map((badge) => (
                  <Badge key={badge.id} variant={badge.variant ?? "secondary"}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          {description ? (
            <p
              data-slot="view-header-description"
              className="max-w-3xl text-sm leading-6 text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions || actionMenu ? (
          <div
            data-slot="view-header-actions"
            className="flex min-w-0 flex-wrap items-center gap-2 md:justify-end [&>*]:min-w-0"
          >
            {actions}
            {actionMenu ? <ViewHeaderActionMenu actionMenu={actionMenu} /> : null}
          </div>
        ) : null}
      </div>
      {children}
      {hasTabs ? (
        <Tabs
          data-slot="view-header-tabs"
          value={activeTab}
          defaultValue={defaultActiveTab ?? tabs[0]?.value}
          onValueChange={onTabChange}
        >
          <TabsList variant="line" className="max-w-full overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} forceMount hidden />
          ))}
        </Tabs>
      ) : null}
    </header>
  );
}

function ViewHeaderActionMenu({ actionMenu }: { actionMenu: ViewHeaderActionMenuProps }) {
  const { triggerLabel = "Open page actions", ...actionMenuProps } = actionMenu;

  return (
    <ActionMenu
      {...actionMenuProps}
      trigger={
        <Button type="button" variant="outline" size="icon-sm" aria-label={triggerLabel}>
          <MoreHorizontalIcon />
        </Button>
      }
    />
  );
}

function ViewHeaderBreadcrumbs({
  items,
  className,
  ...props
}: React.ComponentProps<typeof Breadcrumb> & {
  items: ViewHeaderBreadcrumbItem[];
}) {
  return (
    <Breadcrumb data-slot="view-header-breadcrumbs" className={className} {...props}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const current = item.current || index === items.length - 1;

          return (
            <React.Fragment key={item.id}>
              <BreadcrumbItem>
                {current ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href ?? "#"}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export { ViewHeader, ViewHeaderBreadcrumbs };
export type {
  ViewHeaderActionMenuProps,
  ViewHeaderBadge,
  ViewHeaderBreadcrumbItem,
  ViewHeaderProps,
  ViewHeaderTab,
};

export type ViewHeaderBreadcrumbsProps = React.ComponentProps<typeof ViewHeaderBreadcrumbs>;

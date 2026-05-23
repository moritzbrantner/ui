"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Badge, type BadgeProps } from "../stable/badge";
import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "../stable/description-list";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../stable/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../stable/tabs";

type DetailsPanelBadge = {
  id: string;
  label: React.ReactNode;
  variant?: BadgeProps["variant"];
};

type DetailsPanelItem = {
  id: string;
  term: React.ReactNode;
  detail: React.ReactNode;
};

type DetailsPanelTab = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

type DetailsPanelProps = Omit<React.ComponentProps<typeof Sheet>, "children"> & {
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  badges?: DetailsPanelBadge[];
  actions?: React.ReactNode;
  items?: DetailsPanelItem[];
  tabs?: DetailsPanelTab[];
  defaultTabValue?: string;
  tabValue?: string;
  onTabValueChange?: (value: string) => void;
  side?: React.ComponentProps<typeof SheetContent>["side"];
  footer?: React.ReactNode;
  children?: React.ReactNode;
  contentProps?: Omit<React.ComponentProps<typeof SheetContent>, "children" | "side">;
};

function DetailsPanel({
  trigger,
  title,
  description,
  badges = [],
  actions,
  items = [],
  tabs = [],
  defaultTabValue,
  tabValue,
  onTabValueChange,
  side = "right",
  footer,
  children,
  contentProps,
  ...props
}: DetailsPanelProps) {
  const { className: contentClassName, ...restContentProps } = contentProps ?? {};

  return (
    <Sheet {...props}>
      {trigger ? (
        <SheetTrigger asChild data-slot="details-panel-trigger">
          {trigger}
        </SheetTrigger>
      ) : null}
      <SheetContent
        {...restContentProps}
        data-slot="details-panel"
        side={side}
        className={cn("gap-0 sm:max-w-md", contentClassName)}
      >
        <SheetHeader className="gap-3 border-b">
          <div
            data-slot="details-panel-heading"
            className="flex min-w-0 items-start justify-between gap-3"
          >
            <div data-slot="details-panel-copy" className="grid min-w-0 gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <SheetTitle>{title}</SheetTitle>
                {badges.length > 0 ? (
                  <div
                    data-slot="details-panel-badges"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {badges.map((badge) => (
                      <Badge key={badge.id} variant={badge.variant ?? "secondary"}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
              {description ? <SheetDescription>{description}</SheetDescription> : null}
            </div>
            {actions ? (
              <div
                data-slot="details-panel-actions"
                className="flex shrink-0 items-center gap-2 pr-8"
              >
                {actions}
              </div>
            ) : null}
          </div>
        </SheetHeader>
        <DetailsPanelBody>
          {tabs.length > 0 ? (
            <Tabs
              data-slot="details-panel-tabs"
              value={tabValue}
              defaultValue={defaultTabValue ?? tabs[0]?.value}
              onValueChange={onTabValueChange}
            >
              <TabsList variant="line" className="max-w-full overflow-x-auto">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="pt-4">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : null}
          {items.length > 0 ? <DetailsPanelDescriptionList items={items} /> : null}
          {children}
        </DetailsPanelBody>
        {footer ? <SheetFooter className="border-t">{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}

function DetailsPanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="details-panel-body"
      className={cn("grid min-h-0 flex-1 gap-4 overflow-y-auto p-4", className)}
      {...props}
    />
  );
}

function DetailsPanelDescriptionList({
  items,
  className,
  ...props
}: React.ComponentProps<typeof DescriptionList> & {
  items: DetailsPanelItem[];
}) {
  return (
    <DescriptionList data-slot="details-panel-description-list" className={className} {...props}>
      {items.map((item) => (
        <DescriptionListItem key={item.id}>
          <DescriptionListTerm>{item.term}</DescriptionListTerm>
          <DescriptionListDetail>{item.detail}</DescriptionListDetail>
        </DescriptionListItem>
      ))}
    </DescriptionList>
  );
}

export { DetailsPanel, DetailsPanelBody, DetailsPanelDescriptionList };
export type { DetailsPanelBadge, DetailsPanelItem, DetailsPanelProps, DetailsPanelTab };

export type DetailsPanelBodyProps = React.ComponentProps<typeof DetailsPanelBody>;
export type DetailsPanelDescriptionListProps = React.ComponentProps<
  typeof DetailsPanelDescriptionList
>;

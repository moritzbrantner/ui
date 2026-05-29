"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Button } from "../stable/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StateViewActions,
  StateViewDescription,
  StateViewTitle,
} from "../patterns/state-view";
import { FilterBar, type FilterBarFilter } from "./filter-bar";
import { SelectionToolbar } from "./selection-toolbar";

type ResourceListStatus = "idle" | "loading" | "empty" | "error";

type ResourceListProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterBarFilter[];
  onClearFilter?: (id: string) => void;
  onClearAll?: () => void;
  filterActions?: React.ReactNode;
  filterChildren?: React.ReactNode;
  selectedCount?: number;
  totalCount?: number;
  selectionLabel?: React.ReactNode;
  onClearSelection?: () => void;
  selectionActions?: React.ReactNode;
  status?: ResourceListStatus;
  loadingLabel?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  errorTitle?: React.ReactNode;
  errorDescription?: React.ReactNode;
  stateActions?: React.ReactNode;
};

function ResourceList({
  title,
  description,
  toolbar,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search resources...",
  filters = [],
  onClearFilter,
  onClearAll,
  filterActions,
  filterChildren,
  selectedCount = 0,
  totalCount,
  selectionLabel,
  onClearSelection,
  selectionActions,
  status = "idle",
  loadingLabel = "Loading resources",
  emptyTitle = "No resources found",
  emptyDescription,
  errorTitle = "Could not load resources",
  errorDescription,
  stateActions,
  className,
  children,
  ...props
}: ResourceListProps) {
  const hasHeader = title || description || toolbar;
  const hasFilters = onSearchChange || filters.length > 0 || filterActions || filterChildren;

  return (
    <section
      data-slot="resource-list"
      data-status={status}
      className={cn("grid min-w-0 gap-3", className)}
      {...props}
    >
      {hasHeader ? (
        <ResourceListHeader>
          <div data-slot="resource-list-copy" className="grid min-w-0 gap-1">
            {title ? (
              <h2 data-slot="resource-list-title" className="text-base font-medium leading-snug">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                data-slot="resource-list-description"
                className="text-sm leading-6 text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
          {toolbar ? <ResourceListToolbar>{toolbar}</ResourceListToolbar> : null}
        </ResourceListHeader>
      ) : null}
      {hasFilters ? (
        <FilterBar
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          onSearchChange={onSearchChange}
          onClearFilter={onClearFilter}
          onClearAll={onClearAll}
          actions={filterActions}
        >
          {filterChildren}
        </FilterBar>
      ) : null}
      <SelectionToolbar
        selectedCount={selectedCount}
        totalCount={totalCount}
        label={selectionLabel}
        onClearSelection={onClearSelection}
      >
        {selectionActions}
      </SelectionToolbar>
      <ResourceListContent>
        {status === "idle"
          ? children
          : renderResourceListState(status, {
              loadingLabel,
              emptyTitle,
              emptyDescription,
              errorTitle,
              errorDescription,
              stateActions,
            })}
      </ResourceListContent>
    </section>
  );
}

function ResourceListHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-list-header"
      className={cn(
        "flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

function ResourceListToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-list-toolbar"
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function ResourceListContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resource-list-content"
      className={cn(
        "min-w-0 overflow-hidden rounded-md border bg-card/70 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function renderResourceListState(
  status: Exclude<ResourceListStatus, "idle">,
  options: Pick<
    ResourceListProps,
    | "loadingLabel"
    | "emptyTitle"
    | "emptyDescription"
    | "errorTitle"
    | "errorDescription"
    | "stateActions"
  >,
) {
  if (status === "loading") {
    return <LoadingState label={options.loadingLabel} className="rounded-none border-0" />;
  }

  if (status === "error") {
    return (
      <ErrorState className="rounded-none border-0">
        <StateViewTitle>{options.errorTitle}</StateViewTitle>
        {options.errorDescription ? (
          <StateViewDescription>{options.errorDescription}</StateViewDescription>
        ) : null}
        {options.stateActions ? <StateViewActions>{options.stateActions}</StateViewActions> : null}
      </ErrorState>
    );
  }

  return (
    <EmptyState className="rounded-none border-0">
      <StateViewTitle>{options.emptyTitle}</StateViewTitle>
      {options.emptyDescription ? (
        <StateViewDescription>{options.emptyDescription}</StateViewDescription>
      ) : null}
      {options.stateActions ? <StateViewActions>{options.stateActions}</StateViewActions> : null}
    </EmptyState>
  );
}

function ResourceListResetButton({
  children = "Reset filters",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-slot="resource-list-reset-button"
      {...props}
    >
      {children}
    </Button>
  );
}

export {
  ResourceList,
  ResourceListContent,
  ResourceListHeader,
  ResourceListResetButton,
  ResourceListToolbar,
};
export type { ResourceListProps, ResourceListStatus };

export type ResourceListContentProps = React.ComponentProps<typeof ResourceListContent>;
export type ResourceListHeaderProps = React.ComponentProps<typeof ResourceListHeader>;
export type ResourceListResetButtonProps = React.ComponentProps<typeof ResourceListResetButton>;
export type ResourceListToolbarProps = React.ComponentProps<typeof ResourceListToolbar>;

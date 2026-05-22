"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { SearchField } from "./search-field";

type FilterBarFilter = {
  id: string;
  label: React.ReactNode;
  value?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

type FilterBarProps = React.ComponentProps<"div"> & {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterBarFilter[];
  onClearFilter?: (id: string) => void;
  onClearAll?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

type FilterChipProps = React.ComponentProps<"button"> & {
  filter: FilterBarFilter;
  onClear?: (id: string) => void;
};

function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilter,
  onClearAll,
  actions,
  children,
  className,
  ...props
}: FilterBarProps) {
  const hasFilters = filters.length > 0;

  return (
    <div
      data-slot="filter-bar"
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-md border bg-card/70 p-3 text-card-foreground",
        className,
      )}
      {...props}
    >
      <FilterBarContent>
        {onSearchChange ? (
          <FilterBarSearch
            value={searchValue ?? ""}
            onValueChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        ) : null}
        {children}
        {actions ? <FilterBarActions>{actions}</FilterBarActions> : null}
      </FilterBarContent>
      {hasFilters ? (
        <div
          data-slot="filter-bar-active-row"
          className="flex min-w-0 flex-wrap items-center gap-2"
        >
          <FilterChipGroup>
            {filters.map((filter) => (
              <FilterChip key={filter.id} filter={filter} onClear={onClearFilter} />
            ))}
          </FilterChipGroup>
          {onClearAll ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterBarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-bar-content"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

function FilterBarSearch(props: React.ComponentProps<typeof SearchField>) {
  return (
    <SearchField
      data-slot="filter-bar-search"
      className={cn("min-w-64 flex-1", props.className)}
      {...props}
    />
  );
}

function FilterBarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-bar-actions"
      className={cn("ml-auto flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

function FilterChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-chip-group"
      className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
}

function FilterChip({ filter, onClear, className, disabled, ...props }: FilterChipProps) {
  const chipDisabled = disabled ?? filter.disabled ?? !onClear;

  return (
    <button
      type="button"
      data-slot="filter-chip"
      disabled={chipDisabled}
      aria-label={`Clear ${filter.id} filter`}
      className={cn(
        "group/filter-chip inline-flex min-h-7 max-w-full items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      onClick={() => onClear?.(filter.id)}
      {...props}
    >
      <Badge variant="secondary" className="max-w-40 truncate">
        {filter.label}
      </Badge>
      {filter.value ? <span className="max-w-48 truncate">{filter.value}</span> : null}
      {filter.description ? <span className="sr-only">{filter.description}</span> : null}
      {onClear ? (
        <XIcon
          aria-hidden="true"
          className="size-3 text-muted-foreground transition-colors group-hover/filter-chip:text-foreground"
        />
      ) : null}
    </button>
  );
}

export {
  FilterBar,
  FilterBarActions,
  FilterBarContent,
  FilterBarSearch,
  FilterChip,
  FilterChipGroup,
};
export type { FilterBarFilter, FilterBarProps, FilterChipProps };

export type FilterBarActionsProps = React.ComponentProps<typeof FilterBarActions>;
export type FilterBarContentProps = React.ComponentProps<typeof FilterBarContent>;
export type FilterBarSearchProps = React.ComponentProps<typeof FilterBarSearch>;
export type FilterChipGroupProps = React.ComponentProps<typeof FilterChipGroup>;

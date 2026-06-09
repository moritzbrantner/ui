"use client";

import * as React from "react";
import { ChevronDownIcon, ListFilterIcon, XIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { Checkbox } from "../stable/checkbox";
import { Input } from "../stable/input";
import { Label } from "../stable/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../stable/popover";
import { SelectDropdown } from "../stable/select";
import { TagInput } from "../stable/tag-input";
import { SearchField } from "./search-field";

type FilterPrimitiveValue = string | number | boolean | Date | null | undefined;

type FilterOption = {
  value: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
  description?: React.ReactNode;
};

type TextFilterValue = {
  kind: "text";
  value?: string;
  values?: string[];
};

type NumberFilterValue = {
  kind: "number";
  min?: string;
  max?: string;
};

type DateRangeFilterValue = {
  kind: "date";
  from?: string;
  to?: string;
};

type BooleanFilterValue = {
  kind: "boolean";
  value?: "true" | "false";
};

type EnumFilterValue = {
  kind: "enum";
  values?: string[];
};

type TagFilterValue = {
  kind: "tags";
  values?: string[];
};

type FilterValue =
  | string
  | TextFilterValue
  | NumberFilterValue
  | DateRangeFilterValue
  | BooleanFilterValue
  | EnumFilterValue
  | TagFilterValue;

type FilterControlPresentation = "popover" | "inline";

type BaseFilterControlProps<TValue> = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  id?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  value?: TValue;
  onValueChange?: (value: TValue | undefined) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  summary?: React.ReactNode;
  clearLabel?: string;
  applyLabel?: string;
  presentation?: FilterControlPresentation;
};

type TextFilterControlProps = BaseFilterControlProps<TextFilterValue> & {
  options?: FilterOption[];
};

type NumberFilterControlProps = BaseFilterControlProps<NumberFilterValue> & {
  minPlaceholder?: string;
  maxPlaceholder?: string;
};

type DateRangeFilterControlProps = BaseFilterControlProps<DateRangeFilterValue>;

type BooleanFilterControlProps = BaseFilterControlProps<BooleanFilterValue> & {
  trueLabel?: React.ReactNode;
  falseLabel?: React.ReactNode;
  allLabel?: React.ReactNode;
};

type EnumFilterControlProps = BaseFilterControlProps<EnumFilterValue> & {
  options: FilterOption[];
};

type TagFilterControlProps = BaseFilterControlProps<TagFilterValue> & {
  inputLabel?: string;
  addLabel?: string;
};

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
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
      {...props}
    />
  );
}

function FilterBarSearch(props: React.ComponentProps<typeof SearchField>) {
  return (
    <SearchField
      data-slot="filter-bar-search"
      className={cn("w-full min-w-0 flex-1 sm:min-w-64", props.className)}
      {...props}
    />
  );
}

function FilterBarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-bar-actions"
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function FilterBarControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-bar-controls"
      className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
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
        "group/filter-chip inline-flex min-h-10 max-w-full items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
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

function FilterPopover(props: React.ComponentProps<typeof Popover>) {
  return <Popover {...props} />;
}

function FilterPopoverTrigger(props: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger {...props} />;
}

function FilterPopoverContent({
  className,
  align = "start",
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="filter-popover-content"
      align={align}
      className={cn("w-80 gap-3", className)}
      {...props}
    />
  );
}

function FilterControl({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="filter-control" className={cn("grid min-w-0 gap-3", className)} {...props} />
  );
}

function FilterControlHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <PopoverHeader data-slot="filter-control-header" className={className} {...props} />;
}

function FilterControlTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <PopoverTitle data-slot="filter-control-title" className={className} {...props} />;
}

function FilterControlDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <PopoverDescription data-slot="filter-control-description" className={className} {...props} />
  );
}

function FilterControlFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="filter-control-footer"
      className={cn("flex min-w-0 items-center justify-end gap-2 border-t pt-2", className)}
      {...props}
    />
  );
}

function TextFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  placeholder = "Contains...",
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  options = [],
  className,
  ...props
}: TextFilterControlProps) {
  const currentValue = getTextFilterValue(value);
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue, options);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (nextValue: TextFilterValue) => {
    onValueChange?.(cleanFilterValue(nextValue) as TextFilterValue | undefined);
  };

  const body = (
    <TextFilterFields
      label={labelText}
      value={currentValue}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      onValueChange={commitValue}
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function NumberFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  minPlaceholder,
  maxPlaceholder,
  className,
  ...props
}: NumberFilterControlProps) {
  const currentValue = isNumberFilterValue(value) ? value : { kind: "number" as const };
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (nextValue: NumberFilterValue) => {
    onValueChange?.(cleanFilterValue(nextValue) as NumberFilterValue | undefined);
  };

  const body = (
    <NumberFilterFields
      label={labelText}
      value={currentValue}
      disabled={disabled}
      minPlaceholder={minPlaceholder}
      maxPlaceholder={maxPlaceholder}
      onValueChange={commitValue}
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function DateRangeFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  className,
  ...props
}: DateRangeFilterControlProps) {
  const currentValue = isDateRangeFilterValue(value) ? value : { kind: "date" as const };
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (nextValue: DateRangeFilterValue) => {
    onValueChange?.(cleanFilterValue(nextValue) as DateRangeFilterValue | undefined);
  };

  const body = (
    <DateRangeFilterFields
      label={labelText}
      value={currentValue}
      disabled={disabled}
      onValueChange={commitValue}
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function BooleanFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  allLabel = "All",
  trueLabel = "True",
  falseLabel = "False",
  className,
  ...props
}: BooleanFilterControlProps) {
  const currentValue = isBooleanFilterValue(value) ? value : { kind: "boolean" as const };
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (nextValue: BooleanFilterValue) => {
    onValueChange?.(cleanFilterValue(nextValue) as BooleanFilterValue | undefined);
  };

  const body = (
    <BooleanFilterFields
      label={labelText}
      value={currentValue}
      disabled={disabled}
      allLabel={allLabel}
      trueLabel={trueLabel}
      falseLabel={falseLabel}
      onValueChange={commitValue}
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function EnumFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  options,
  className,
  ...props
}: EnumFilterControlProps) {
  const currentValue = isEnumFilterValue(value) ? value : { kind: "enum" as const };
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue, options);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (nextValue: EnumFilterValue) => {
    onValueChange?.(cleanFilterValue(nextValue) as EnumFilterValue | undefined);
  };

  const body = (
    <OptionFilterFields
      label={labelText}
      value={currentValue.values ?? []}
      options={options}
      disabled={disabled}
      onValueChange={(values) => commitValue({ kind: "enum", values })}
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function TagFilterControl({
  label,
  description,
  value,
  onValueChange,
  onClear,
  disabled,
  placeholder = "Add tag",
  summary,
  clearLabel = "Clear filter",
  presentation = "popover",
  inputLabel,
  addLabel,
  className,
  ...props
}: TagFilterControlProps) {
  const currentValue = isTagFilterValue(value) ? value : { kind: "tags" as const };
  const labelText = getNodeText(label, "filter");
  const resolvedSummary = summary ?? getFilterValueSummary(currentValue);
  const active = !isEmptyFilterValue(currentValue);

  const commitValue = (values: string[]) => {
    onValueChange?.(cleanFilterValue({ kind: "tags", values }) as TagFilterValue | undefined);
  };

  const body = (
    <TagInput
      value={currentValue.values ?? []}
      onValueChange={commitValue}
      disabled={disabled}
      placeholder={placeholder}
      inputLabel={inputLabel ?? `${labelText} tag`}
      addLabel={addLabel}
      addOnBlur
    />
  );

  return renderTypedFilterControl({
    active,
    body,
    className,
    clearLabel,
    description,
    disabled,
    label,
    labelText,
    onClear: () => clearTypedFilter(onValueChange, onClear),
    presentation,
    props,
    summary: resolvedSummary,
  });
}

function TextFilterFields({
  label,
  value,
  options,
  placeholder,
  disabled,
  onValueChange,
}: {
  label: string;
  value: TextFilterValue;
  options: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
  onValueChange: (value: TextFilterValue) => void;
}) {
  return (
    <div data-slot="text-filter-fields" className="grid gap-3">
      <Label className="grid gap-1.5 text-xs text-muted-foreground">
        Contains
        <Input
          aria-label={`Filter ${label}`}
          value={value.value ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onValueChange({ ...value, kind: "text", value: event.target.value });
          }}
        />
      </Label>
      {options.length ? (
        <OptionFilterFields
          label={label}
          value={value.values ?? []}
          options={options}
          disabled={disabled}
          onValueChange={(values) => onValueChange({ ...value, kind: "text", values })}
        />
      ) : null}
    </div>
  );
}

function NumberFilterFields({
  label,
  value,
  disabled,
  minPlaceholder,
  maxPlaceholder,
  onValueChange,
}: {
  label: string;
  value: NumberFilterValue;
  disabled?: boolean;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  onValueChange: (value: NumberFilterValue) => void;
}) {
  return (
    <div data-slot="number-filter-fields" className="grid grid-cols-2 gap-2">
      <Label className="grid gap-1.5 text-xs text-muted-foreground">
        Min
        <Input
          aria-label={`Minimum ${label}`}
          type="number"
          value={value.min ?? ""}
          placeholder={minPlaceholder}
          disabled={disabled}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onValueChange({ ...value, kind: "number", min: event.target.value });
          }}
        />
      </Label>
      <Label className="grid gap-1.5 text-xs text-muted-foreground">
        Max
        <Input
          aria-label={`Maximum ${label}`}
          type="number"
          value={value.max ?? ""}
          placeholder={maxPlaceholder}
          disabled={disabled}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onValueChange({ ...value, kind: "number", max: event.target.value });
          }}
        />
      </Label>
    </div>
  );
}

function DateRangeFilterFields({
  label,
  value,
  disabled,
  onValueChange,
}: {
  label: string;
  value: DateRangeFilterValue;
  disabled?: boolean;
  onValueChange: (value: DateRangeFilterValue) => void;
}) {
  return (
    <div data-slot="date-range-filter-fields" className="grid grid-cols-2 gap-2">
      <Label className="grid gap-1.5 text-xs text-muted-foreground">
        From
        <Input
          aria-label={`From ${label}`}
          type="date"
          value={value.from ?? ""}
          disabled={disabled}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onValueChange({ ...value, kind: "date", from: event.target.value });
          }}
        />
      </Label>
      <Label className="grid gap-1.5 text-xs text-muted-foreground">
        To
        <Input
          aria-label={`To ${label}`}
          type="date"
          value={value.to ?? ""}
          disabled={disabled}
          onChange={(event) => {
            if (disabled) {
              return;
            }

            onValueChange({ ...value, kind: "date", to: event.target.value });
          }}
        />
      </Label>
    </div>
  );
}

function BooleanFilterFields({
  label,
  value,
  disabled,
  allLabel,
  trueLabel,
  falseLabel,
  onValueChange,
}: {
  label: string;
  value: BooleanFilterValue;
  disabled?: boolean;
  allLabel: React.ReactNode;
  trueLabel: React.ReactNode;
  falseLabel: React.ReactNode;
  onValueChange: (value: BooleanFilterValue) => void;
}) {
  return (
    <Label className="grid gap-1.5 text-xs text-muted-foreground">
      Value
      <SelectDropdown
        aria-label={`Filter ${label}`}
        size="sm"
        value={value.value ?? "all"}
        disabled={disabled}
        onValueChange={(nextValue) => {
          if (disabled) {
            return;
          }

          onValueChange({
            kind: "boolean",
            value: nextValue === "true" || nextValue === "false" ? nextValue : undefined,
          });
        }}
        options={[
          { label: allLabel, value: "all" },
          { label: trueLabel, value: "true" },
          { label: falseLabel, value: "false" },
        ]}
      />
    </Label>
  );
}

function OptionFilterFields({
  label,
  value,
  options,
  disabled,
  onValueChange,
}: {
  label: string;
  value: string[];
  options: FilterOption[];
  disabled?: boolean;
  onValueChange: (values: string[]) => void;
}) {
  return (
    <div data-slot="option-filter-fields" className="grid gap-1">
      <p className="px-0 text-xs font-medium text-muted-foreground">Values</p>
      <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
        {options.map((option) => {
          const checked = value.includes(option.value);
          const optionText = getOptionText(option);

          return (
            <Label
              key={option.value}
              className={cn(
                "flex min-h-7 items-center gap-2 rounded-md px-1.5 text-sm font-normal hover:bg-accent",
                (disabled || option.disabled) && "opacity-60",
              )}
            >
              <Checkbox
                aria-label={`Filter ${label} by ${optionText}`}
                checked={checked}
                disabled={disabled || option.disabled}
                onCheckedChange={(nextChecked) => {
                  if (disabled || option.disabled) {
                    return;
                  }

                  const nextValues = nextChecked
                    ? [...value, option.value]
                    : value.filter((currentValue) => currentValue !== option.value);

                  onValueChange(nextValues);
                }}
              />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count !== undefined ? (
                <span className="text-xs text-muted-foreground">{option.count}</span>
              ) : null}
              {option.description ? <span className="sr-only">{option.description}</span> : null}
            </Label>
          );
        })}
      </div>
    </div>
  );
}

function renderTypedFilterControl({
  active,
  body,
  className,
  clearLabel,
  description,
  disabled,
  label,
  labelText,
  onClear,
  presentation,
  props,
  summary,
}: {
  active: boolean;
  body: React.ReactNode;
  className?: string;
  clearLabel: string;
  description?: React.ReactNode;
  disabled?: boolean;
  label: React.ReactNode;
  labelText: string;
  onClear: () => void;
  presentation: FilterControlPresentation;
  props: React.ComponentProps<"div">;
  summary?: React.ReactNode;
}) {
  const visibleSummary = active && summary ? summary : null;

  if (presentation === "inline") {
    return (
      <FilterControl className={className} {...props}>
        {description ? (
          <FilterControlDescription className="text-xs">{description}</FilterControlDescription>
        ) : null}
        {body}
        <FilterControlFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!active || disabled}
            onClick={onClear}
          >
            {clearLabel}
          </Button>
        </FilterControlFooter>
      </FilterControl>
    );
  }

  return (
    <FilterControl className={cn("w-fit", className)} {...props}>
      <FilterPopover>
        <div data-slot="filter-control-trigger-group" className="inline-flex min-w-0 items-center">
          <FilterPopoverTrigger asChild>
            <Button
              type="button"
              variant={active ? "secondary" : "outline"}
              size="sm"
              data-slot="filter-control-trigger"
              data-active={active ? true : undefined}
              aria-label={`Filter ${labelText}`}
              disabled={disabled}
              className={cn(
                "max-w-full rounded-r-none border-r-0",
                !active && "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
              )}
            >
              <ListFilterIcon aria-hidden="true" />
              <span className="min-w-0 truncate">{label}</span>
              {visibleSummary ? (
                <span className="min-w-0 max-w-36 truncate text-muted-foreground">
                  {visibleSummary}
                </span>
              ) : null}
              <ChevronDownIcon aria-hidden="true" />
            </Button>
          </FilterPopoverTrigger>
          {active ? (
            <Button
              type="button"
              variant={active ? "secondary" : "outline"}
              size="icon-sm"
              data-slot="filter-control-clear"
              aria-label={`Clear ${labelText} filter`}
              disabled={disabled}
              className="rounded-l-none px-2"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
        <FilterPopoverContent aria-label={`Filter ${labelText}`}>
          <FilterControlHeader>
            <FilterControlTitle>Filter {label}</FilterControlTitle>
            {description ? (
              <FilterControlDescription>{description}</FilterControlDescription>
            ) : null}
          </FilterControlHeader>
          {body}
          <FilterControlFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!active || disabled}
              onClick={onClear}
            >
              {clearLabel}
            </Button>
          </FilterControlFooter>
        </FilterPopoverContent>
      </FilterPopover>
    </FilterControl>
  );
}

function clearTypedFilter<TValue>(
  onValueChange: ((value: TValue | undefined) => void) | undefined,
  onClear: (() => void) | undefined,
) {
  onValueChange?.(undefined);
  onClear?.();
}

function cleanFilterValue(value: FilterValue) {
  return isEmptyFilterValue(value) ? undefined : value;
}

function getTextFilterValue(value: unknown): TextFilterValue {
  if (isTextFilterValue(value)) {
    return value;
  }

  if (typeof value === "string") {
    return { kind: "text", value };
  }

  return { kind: "text" };
}

function isEmptyFilterValue(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (isTextFilterValue(value)) {
    return !value.value?.trim() && !value.values?.length;
  }

  if (isNumberFilterValue(value)) {
    return !value.min?.trim() && !value.max?.trim();
  }

  if (isDateRangeFilterValue(value)) {
    return !value.from?.trim() && !value.to?.trim();
  }

  if (isBooleanFilterValue(value)) {
    return value.value !== "true" && value.value !== "false";
  }

  if (isEnumFilterValue(value) || isTagFilterValue(value)) {
    return !value.values?.length;
  }

  return false;
}

function normalizeFilterText(value: unknown) {
  return String(value ?? "").toLocaleLowerCase();
}

function coerceFilterNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function coerceFilterBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLocaleLowerCase() === "true") {
      return true;
    }

    if (value.toLocaleLowerCase() === "false") {
      return false;
    }
  }

  return undefined;
}

function coerceFilterDateTimestamp(value: unknown, endOfDay = false) {
  if (value instanceof Date) {
    const timestamp = value.getTime();

    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const timestamp = Date.parse(
    endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59.999` : value,
  );

  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function getFilterValueSummary(value: FilterValue, options: FilterOption[] = []) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (isTextFilterValue(value)) {
    const parts = [
      value.value?.trim() ? `contains "${value.value.trim()}"` : "",
      getOptionValueSummary(value.values, options),
    ].filter(Boolean);

    return parts.join("; ");
  }

  if (isNumberFilterValue(value)) {
    if (value.min?.trim() && value.max?.trim()) {
      return `${value.min.trim()}-${value.max.trim()}`;
    }

    if (value.min?.trim()) {
      return `>= ${value.min.trim()}`;
    }

    if (value.max?.trim()) {
      return `<= ${value.max.trim()}`;
    }
  }

  if (isDateRangeFilterValue(value)) {
    if (value.from?.trim() && value.to?.trim()) {
      return `${value.from.trim()}-${value.to.trim()}`;
    }

    if (value.from?.trim()) {
      return `from ${value.from.trim()}`;
    }

    if (value.to?.trim()) {
      return `to ${value.to.trim()}`;
    }
  }

  if (isBooleanFilterValue(value)) {
    if (value.value === "true") {
      return "True";
    }

    if (value.value === "false") {
      return "False";
    }
  }

  if (isEnumFilterValue(value) || isTagFilterValue(value)) {
    return getOptionValueSummary(value.values, options);
  }

  return "";
}

function getOptionValueSummary(values: string[] | undefined, options: FilterOption[]) {
  if (!values?.length) {
    return "";
  }

  return values
    .map((value) => options.find((option) => option.value === value))
    .map((option, index) => (option ? getOptionText(option) : values[index]))
    .join(", ");
}

function isTextFilterValue(value: unknown): value is TextFilterValue {
  return isRecord(value) && value.kind === "text";
}

function isNumberFilterValue(value: unknown): value is NumberFilterValue {
  return isRecord(value) && value.kind === "number";
}

function isDateRangeFilterValue(value: unknown): value is DateRangeFilterValue {
  return isRecord(value) && value.kind === "date";
}

function isBooleanFilterValue(value: unknown): value is BooleanFilterValue {
  return isRecord(value) && value.kind === "boolean";
}

function isEnumFilterValue(value: unknown): value is EnumFilterValue {
  return isRecord(value) && value.kind === "enum";
}

function isTagFilterValue(value: unknown): value is TagFilterValue {
  return isRecord(value) && value.kind === "tags";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOptionText(option: FilterOption) {
  return getNodeText(option.label, option.value);
}

function getNodeText(node: React.ReactNode, fallback: string) {
  if (typeof node === "string") {
    return node;
  }

  if (typeof node === "number") {
    return String(node);
  }

  return fallback;
}

export {
  BooleanFilterControl,
  DateRangeFilterControl,
  EnumFilterControl,
  FilterBar,
  FilterBarActions,
  FilterBarContent,
  FilterBarControls,
  FilterBarSearch,
  FilterChip,
  FilterChipGroup,
  FilterControl,
  FilterControlDescription,
  FilterControlFooter,
  FilterControlHeader,
  FilterControlTitle,
  FilterPopover,
  FilterPopoverContent,
  FilterPopoverTrigger,
  NumberFilterControl,
  TagFilterControl,
  TextFilterControl,
  coerceFilterBoolean,
  coerceFilterDateTimestamp,
  coerceFilterNumber,
  getFilterValueSummary,
  isEmptyFilterValue,
  normalizeFilterText,
};
export type {
  BaseFilterControlProps,
  BooleanFilterControlProps,
  BooleanFilterValue,
  DateRangeFilterControlProps,
  DateRangeFilterValue,
  EnumFilterControlProps,
  EnumFilterValue,
  FilterBarFilter,
  FilterBarProps,
  FilterChipProps,
  FilterOption,
  FilterPrimitiveValue,
  FilterValue,
  NumberFilterControlProps,
  NumberFilterValue,
  TagFilterControlProps,
  TagFilterValue,
  TextFilterControlProps,
  TextFilterValue,
};

export type FilterBarActionsProps = React.ComponentProps<typeof FilterBarActions>;
export type FilterBarContentProps = React.ComponentProps<typeof FilterBarContent>;
export type FilterBarControlsProps = React.ComponentProps<typeof FilterBarControls>;
export type FilterBarSearchProps = React.ComponentProps<typeof FilterBarSearch>;
export type FilterChipGroupProps = React.ComponentProps<typeof FilterChipGroup>;
export type FilterControlProps = React.ComponentProps<typeof FilterControl>;
export type FilterControlDescriptionProps = React.ComponentProps<typeof FilterControlDescription>;
export type FilterControlFooterProps = React.ComponentProps<typeof FilterControlFooter>;
export type FilterControlHeaderProps = React.ComponentProps<typeof FilterControlHeader>;
export type FilterControlTitleProps = React.ComponentProps<typeof FilterControlTitle>;
export type FilterPopoverProps = React.ComponentProps<typeof FilterPopover>;
export type FilterPopoverContentProps = React.ComponentProps<typeof FilterPopoverContent>;
export type FilterPopoverTriggerProps = React.ComponentProps<typeof FilterPopoverTrigger>;

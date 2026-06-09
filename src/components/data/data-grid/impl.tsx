"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type OnChangeFn,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as ReactTable,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  EyeIcon,
  FilterIcon,
} from "lucide-react";

import { cn } from "../../../lib/cn";
import { Button } from "../../stable/button";
import { Checkbox } from "../../stable/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../stable/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../stable/dropdown-menu";
import { Input } from "../../stable/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../stable/table";
import {
  BooleanFilterControl,
  DateRangeFilterControl,
  NumberFilterControl,
  TextFilterControl,
  coerceFilterBoolean,
  coerceFilterDateTimestamp,
  coerceFilterNumber,
  isEmptyFilterValue,
  normalizeFilterText,
  type BooleanFilterValue,
  type DateRangeFilterValue,
  type FilterOption,
  type NumberFilterValue,
  type TextFilterValue,
} from "../filter-bar";

type DataGridDensity = "compact" | "comfortable" | "spacious";
type DataGridStatus = "idle" | "loading" | "error" | "empty";
type DataGridColumnFilterKind = "text" | "number" | "date" | "boolean";

type DataGridColumnFilterMeta = {
  dataGridFilter?: DataGridColumnFilterKind | false;
};

type DataGridColumnFilterValue =
  | string
  | TextFilterValue
  | NumberFilterValue
  | DateRangeFilterValue
  | BooleanFilterValue;

type DataGridControlledState = {
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  rowSelection?: RowSelectionState;
  globalFilter?: string;
  pagination?: PaginationState;
};

type DataGridServerProps = {
  state?: DataGridControlledState;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onGlobalFilterChange?: OnChangeFn<string>;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> extends DataGridColumnFilterMeta {}
}

type DataGridProps<TData, TValue = unknown> = Omit<React.ComponentProps<"div">, "children"> & {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (originalRow: TData, index: number, parent?: { id: string }) => string;
  enableRowSelection?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  error?: React.ReactNode;
  loading?: boolean;
  density?: DataGridDensity;
  onDensityChange?: (density: DataGridDensity) => void;
  onSelectedRowsChange?: (rows: TData[]) => void;
  toolbar?: React.ReactNode | ((table: ReactTable<TData>) => React.ReactNode);
} & DataGridServerProps;

export type DataGridToolbarProps<TData> = React.ComponentProps<"div"> & {
  table?: ReactTable<TData>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
};

export type DataGridPaginationProps<TData> = React.ComponentProps<"div"> & {
  table: ReactTable<TData>;
};

export type DataGridColumnHeaderProps<TData, TValue> = React.ComponentProps<"button"> & {
  column: Column<TData, TValue>;
  title: React.ReactNode;
};

export type DataGridViewOptionsProps<TData> = React.ComponentProps<typeof Button> & {
  table: ReactTable<TData>;
};

type DataGridColumnFilterContextProps<TData, TValue> = {
  column: Column<TData, TValue>;
  children: React.ReactElement;
};

type DataGridColumnFilterMenuProps<TData, TValue> = {
  column: Column<TData, TValue>;
  filterKind: DataGridColumnFilterKind;
};

const densityClasses: Record<DataGridDensity, string> = {
  compact: "[&_td]:py-1.5 [&_th]:h-8",
  comfortable: "[&_td]:py-2 [&_th]:h-10",
  spacious: "[&_td]:py-3 [&_th]:h-12",
};

const dataGridFilterFn: FilterFn<RowData> = (row, columnId, filterValue) => {
  if (isEmptyFilterValue(filterValue)) {
    return true;
  }

  const cellValue = row.getValue(columnId);

  if (isDataGridNumberFilterValue(filterValue)) {
    const numericValue = coerceFilterNumber(cellValue);
    const min = coerceFilterNumber(filterValue.min);
    const max = coerceFilterNumber(filterValue.max);

    if (numericValue === undefined) {
      return false;
    }

    return (min === undefined || numericValue >= min) && (max === undefined || numericValue <= max);
  }

  if (isDataGridDateFilterValue(filterValue)) {
    const timestamp = coerceFilterDateTimestamp(cellValue);
    const from = coerceFilterDateTimestamp(filterValue.from);
    const to = coerceFilterDateTimestamp(filterValue.to, true);

    if (timestamp === undefined) {
      return false;
    }

    return (from === undefined || timestamp >= from) && (to === undefined || timestamp <= to);
  }

  if (isDataGridBooleanFilterValue(filterValue)) {
    const booleanValue = coerceFilterBoolean(cellValue);

    return booleanValue !== undefined && String(booleanValue) === filterValue.value;
  }

  if (isDataGridTextFilterValue(filterValue)) {
    const normalizedValue = normalizeFilterText(cellValue);
    const textMatch = filterValue.value
      ? normalizedValue.includes(normalizeFilterText(filterValue.value))
      : true;
    const valueMatch = filterValue.values?.length
      ? filterValue.values.includes(String(cellValue))
      : true;

    return textMatch && valueMatch;
  }

  return normalizeFilterText(cellValue).includes(normalizeFilterText(filterValue));
};

dataGridFilterFn.autoRemove = isEmptyFilterValue;

function DataGrid<TData, TValue = unknown>({
  columns,
  data,
  getRowId,
  enableRowSelection = false,
  pageSize = 10,
  searchPlaceholder = "Search rows...",
  emptyMessage = "No results.",
  loadingMessage = "Loading rows...",
  error,
  loading = false,
  density = "comfortable",
  onSelectedRowsChange,
  toolbar,
  state: controlledState,
  onSortingChange,
  onColumnFiltersChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
  onGlobalFilterChange,
  onPaginationChange,
  manualSorting,
  manualFiltering,
  manualPagination,
  pageCount,
  rowCount,
  className,
  ...props
}: DataGridProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    if (controlledState?.pagination === undefined) {
      setPagination((current) => ({ ...current, pageSize }));
    }
  }, [controlledState?.pagination, pageSize]);

  const resolvedSorting = controlledState?.sorting ?? sorting;
  const resolvedColumnFilters = controlledState?.columnFilters ?? columnFilters;
  const resolvedColumnVisibility = controlledState?.columnVisibility ?? columnVisibility;
  const resolvedRowSelection = controlledState?.rowSelection ?? rowSelection;
  const resolvedGlobalFilter = controlledState?.globalFilter ?? globalFilter;
  const resolvedPagination = controlledState?.pagination ?? pagination;

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    if (controlledState?.sorting === undefined) {
      setSorting(updater);
    }
    onSortingChange?.(updater);
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    if (controlledState?.columnFilters === undefined) {
      setColumnFilters(updater);
    }
    onColumnFiltersChange?.(updater);
  };

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (updater) => {
    if (controlledState?.columnVisibility === undefined) {
      setColumnVisibility(updater);
    }
    onColumnVisibilityChange?.(updater);
  };

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updater) => {
    if (controlledState?.rowSelection === undefined) {
      setRowSelection(updater);
    }
    onRowSelectionChange?.(updater);
  };

  const handleGlobalFilterChange: OnChangeFn<string> = (updater) => {
    if (controlledState?.globalFilter === undefined) {
      setGlobalFilter(updater);
    }
    onGlobalFilterChange?.(updater);
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    if (controlledState?.pagination === undefined) {
      setPagination(updater);
    }
    onPaginationChange?.(updater);
  };

  const tableColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) {
      return columns as ColumnDef<TData, unknown>[];
    }

    return [
      {
        id: "__select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all rows"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          />
        ),
      },
      ...(columns as ColumnDef<TData, unknown>[]),
    ];
  }, [columns, enableRowSelection]);
  const hasFacetedColumnFilters = React.useMemo(
    () => tableColumns.some(hasDataGridFilterMeta),
    [tableColumns],
  );
  const densityClassName = densityClasses[density];

  const table = useReactTable<TData>({
    data,
    columns: tableColumns,
    getRowId,
    state: {
      sorting: resolvedSorting,
      columnFilters: resolvedColumnFilters,
      columnVisibility: resolvedColumnVisibility,
      rowSelection: resolvedRowSelection,
      globalFilter: resolvedGlobalFilter,
      pagination: resolvedPagination,
    },
    enableRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: handlePaginationChange,
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount,
    rowCount,
    defaultColumn: {
      filterFn: dataGridFilterFn as FilterFn<TData>,
    },
    getCoreRowModel: getCoreRowModel(),
    ...(hasFacetedColumnFilters
      ? {
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
        }
      : {}),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });
  const selectedRows = React.useMemo(
    () => table.getSelectedRowModel().rows.map((row) => row.original),
    [resolvedRowSelection, table],
  );

  React.useEffect(() => {
    onSelectedRowsChange?.(selectedRows);
  }, [onSelectedRowsChange, selectedRows]);

  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1);
  const status: DataGridStatus = loading
    ? "loading"
    : error
      ? "error"
      : table.getRowModel().rows.length === 0
        ? "empty"
        : "idle";

  return (
    <div
      data-slot="data-grid"
      data-density={density}
      data-status={status}
      className={cn("w-full max-w-full min-w-0 space-y-4", className)}
      {...props}
    >
      {toolbar === undefined ? (
        <DataGridToolbar
          table={table}
          searchValue={resolvedGlobalFilter}
          onSearchChange={(value) => handleGlobalFilterChange(value)}
          searchPlaceholder={searchPlaceholder}
        />
      ) : typeof toolbar === "function" ? (
        toolbar(table)
      ) : (
        toolbar
      )}
      <div className={cn("max-w-full min-w-0 overflow-x-auto rounded-md border", densityClassName)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    data-filtered={header.column.getIsFiltered() ? "true" : undefined}
                    className="data-[filtered=true]:bg-accent/40"
                  >
                    {header.isPlaceholder ? null : (
                      <DataGridColumnFilterContext column={header.column}>
                        <div
                          data-slot="data-grid-column-filter-trigger"
                          className="-mx-2 flex min-h-full items-center px-2"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      </DataGridColumnFilterContext>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === "loading" || status === "error" || status === "empty" ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                  <div
                    role={status === "loading" ? "status" : undefined}
                    className="text-sm text-muted-foreground"
                  >
                    {status === "loading"
                      ? loadingMessage
                      : status === "error"
                        ? error
                        : emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataGridPagination table={table} />
    </div>
  );
}

function DataGridToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search rows...",
  children,
  className,
  ...props
}: DataGridToolbarProps<TData>) {
  return (
    <div
      data-slot="data-grid-toolbar"
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex w-full min-w-0 flex-1 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {onSearchChange ? (
          <Input
            aria-label="Search rows"
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:max-w-sm"
          />
        ) : null}
        {children}
      </div>
      {table ? <DataGridViewOptions table={table} /> : null}
    </div>
  );
}

function DataGridPagination<TData>({ table, className, ...props }: DataGridPaginationProps<TData>) {
  return (
    <div
      data-slot="data-grid-pagination"
      className={cn(
        "flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <p className="min-w-0 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected
      </p>
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <span className="min-w-0 flex-1 text-sm text-muted-foreground sm:flex-none">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function DataGridColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataGridColumnHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();
  const filtered = column.getIsFiltered();

  if (!column.getCanSort()) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <span>{title}</span>
        {filtered ? (
          <FilterIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
        ) : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      data-slot="data-grid-column-header"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md text-left font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
      {...props}
    >
      <span>{title}</span>
      {filtered ? (
        <FilterIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      ) : null}
      {sorted === "asc" ? (
        <ArrowUpIcon aria-hidden="true" className="size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon aria-hidden="true" className="size-3.5" />
      ) : (
        <ArrowUpDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

function DataGridColumnFilterContext<TData, TValue>({
  column,
  children,
}: DataGridColumnFilterContextProps<TData, TValue>) {
  const filterKind = getColumnFilterKind(column);

  if (!filterKind) {
    return children;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <DataGridColumnFilterMenu column={column} filterKind={filterKind} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DataGridColumnFilterMenu<TData, TValue>({
  column,
  filterKind,
}: DataGridColumnFilterMenuProps<TData, TValue>) {
  const label = getColumnFilterLabel(column);
  const filterValue = column.getFilterValue();

  return (
    <div data-slot="data-grid-column-filter-menu" className="space-y-2 p-1">
      <ContextMenuLabel className="flex items-center gap-1.5 px-0">
        <FilterIcon aria-hidden="true" className="size-3.5" />
        Filter {label}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      {filterKind === "number" ? (
        <DataGridNumberFilter column={column} filterValue={filterValue} label={label} />
      ) : filterKind === "date" ? (
        <DataGridDateFilter column={column} filterValue={filterValue} label={label} />
      ) : filterKind === "boolean" ? (
        <DataGridBooleanFilter column={column} filterValue={filterValue} label={label} />
      ) : (
        <DataGridTextFilter column={column} filterValue={filterValue} label={label} />
      )}
    </div>
  );
}

function DataGridTextFilter<TData, TValue>({
  column,
  filterValue,
  label,
}: {
  column: Column<TData, TValue>;
  filterValue: unknown;
  label: string;
}) {
  const textFilter = getTextFilterValue(filterValue);
  const options = getTextFilterOptions(column);

  return (
    <TextFilterControl
      presentation="inline"
      label={label}
      value={textFilter}
      options={options}
      onValueChange={(value) => column.setFilterValue(value)}
    />
  );
}

function DataGridNumberFilter<TData, TValue>({
  column,
  filterValue,
  label,
}: {
  column: Column<TData, TValue>;
  filterValue: unknown;
  label: string;
}) {
  const numberFilter = isDataGridNumberFilterValue(filterValue)
    ? filterValue
    : { kind: "number" as const };

  return (
    <NumberFilterControl
      presentation="inline"
      label={label}
      value={numberFilter}
      onValueChange={(value) => column.setFilterValue(value)}
    />
  );
}

function DataGridDateFilter<TData, TValue>({
  column,
  filterValue,
  label,
}: {
  column: Column<TData, TValue>;
  filterValue: unknown;
  label: string;
}) {
  const dateFilter = isDataGridDateFilterValue(filterValue)
    ? filterValue
    : { kind: "date" as const };

  return (
    <DateRangeFilterControl
      presentation="inline"
      label={label}
      value={dateFilter}
      onValueChange={(value) => column.setFilterValue(value)}
    />
  );
}

function DataGridBooleanFilter<TData, TValue>({
  column,
  filterValue,
  label,
}: {
  column: Column<TData, TValue>;
  filterValue: unknown;
  label: string;
}) {
  const booleanFilter = isDataGridBooleanFilterValue(filterValue)
    ? filterValue
    : { kind: "boolean" as const };

  return (
    <BooleanFilterControl
      presentation="inline"
      label={label}
      value={booleanFilter}
      onValueChange={(value) => column.setFilterValue(value)}
    />
  );
}

function DataGridViewOptions<TData>({
  table,
  className,
  ...props
}: DataGridViewOptionsProps<TData>) {
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());

  if (hideableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-slot="data-grid-view-options"
          className={cn("ml-auto", className)}
          {...props}
        >
          <EyeIcon />
          View
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColumnFilterKind<TData, TValue>(
  column: Column<TData, TValue>,
): DataGridColumnFilterKind | null {
  if (!column.getCanFilter() || column.columnDef.meta?.dataGridFilter === false) {
    return null;
  }

  if (column.columnDef.meta?.dataGridFilter) {
    return column.columnDef.meta.dataGridFilter;
  }

  const values = getColumnSampleValues(column);

  if (values.length === 0) {
    return "text";
  }

  if (values.every((value) => coerceFilterBoolean(value) !== undefined)) {
    return "boolean";
  }

  if (values.every((value) => coerceFilterNumber(value) !== undefined)) {
    return "number";
  }

  if (values.every((value) => isDateLikeValue(value))) {
    return "date";
  }

  return "text";
}

function getColumnFilterLabel<TData, TValue>(column: Column<TData, TValue>) {
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header;
  }

  return humanizeColumnId(column.id);
}

function getColumnSampleValues<TData, TValue>(column: Column<TData, TValue>) {
  return Array.from(column.getFacetedUniqueValues().keys())
    .filter((value) => !isBlankValue(value))
    .slice(0, 25);
}

function getTextFilterOptions<TData, TValue>(column: Column<TData, TValue>): FilterOption[] {
  const uniqueValues = column.getFacetedUniqueValues();
  const options =
    uniqueValues.size <= 12
      ? Array.from(uniqueValues.entries())
          .filter(([value]) => !isBlankValue(value))
          .map(([value, count]) => ({
            value: String(value),
            label: String(value),
            count,
          }))
          .sort((first, second) => first.label.localeCompare(second.label))
      : [];

  return options;
}

function hasDataGridFilterMeta<TData>(column: ColumnDef<TData, unknown>): boolean {
  if ("columns" in column && Array.isArray(column.columns)) {
    return column.columns.some((childColumn) =>
      hasDataGridFilterMeta(childColumn as ColumnDef<TData, unknown>),
    );
  }

  return column.meta?.dataGridFilter !== false;
}

function getTextFilterValue(filterValue: unknown): TextFilterValue {
  if (isDataGridTextFilterValue(filterValue)) {
    return filterValue;
  }

  if (typeof filterValue === "string") {
    return { kind: "text", value: filterValue };
  }

  return { kind: "text" };
}

function isDataGridTextFilterValue(filterValue: unknown): filterValue is TextFilterValue {
  return isRecord(filterValue) && filterValue.kind === "text";
}

function isDataGridNumberFilterValue(filterValue: unknown): filterValue is NumberFilterValue {
  return isRecord(filterValue) && filterValue.kind === "number";
}

function isDataGridDateFilterValue(filterValue: unknown): filterValue is DateRangeFilterValue {
  return isRecord(filterValue) && filterValue.kind === "date";
}

function isDataGridBooleanFilterValue(filterValue: unknown): filterValue is BooleanFilterValue {
  return isRecord(filterValue) && filterValue.kind === "boolean";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBlankValue(value: unknown) {
  return value == null || String(value).trim().length === 0;
}

function isDateLikeValue(value: unknown) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime());
  }

  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value) &&
    coerceFilterDateTimestamp(value) !== undefined
  );
}

function humanizeColumnId(columnId: string) {
  return columnId.replace(/[_-]+/g, " ");
}

export { DataGrid, DataGridColumnHeader, DataGridPagination, DataGridToolbar, DataGridViewOptions };
export type {
  DataGridColumnFilterKind,
  DataGridColumnFilterMeta,
  DataGridControlledState,
  DataGridDensity,
  DataGridProps,
  DataGridServerProps,
  DataGridStatus,
};

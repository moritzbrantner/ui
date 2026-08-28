"use client";

import * as React from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "../../../lib/cn";

type ReorderId = string | number;

type ReorderChange = {
  id: ReorderId;
  fromIndex: number;
  toIndex: number;
};

type ReorderableListProps = React.ComponentProps<"div"> & {
  onReorder?: (change: ReorderChange) => void;
};

type ReorderableItemProps = Omit<React.ComponentProps<"div">, "id"> & {
  id: ReorderId;
  index: number;
  disabled?: boolean;
};

type ReorderHandleProps = Omit<React.ComponentProps<"button">, "disabled" | "ref"> & {
  disabled?: boolean;
};

type ReorderableItemContextValue = {
  disabled: boolean;
  handleRef: React.RefCallback<Element>;
  isDragging: boolean;
};

const ReorderableItemContext = React.createContext<ReorderableItemContextValue | null>(null);

function ReorderableList({
  onReorder,
  className,
  children,
  role = "list",
  ...props
}: ReorderableListProps) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const { source } = event.operation;

        if (!isSortable(source) || source.initialIndex === source.index) {
          return;
        }

        onReorder?.({
          id: source.id,
          fromIndex: source.initialIndex,
          toIndex: source.index,
        });
      }}
    >
      <div
        data-slot="reorderable-list"
        role={role}
        className={cn("grid min-w-0 gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </DragDropProvider>
  );
}

function ReorderableItem({
  id,
  index,
  disabled = false,
  className,
  children,
  role = "listitem",
  ...props
}: ReorderableItemProps) {
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled });

  const contextValue = React.useMemo(
    () => ({ disabled, handleRef, isDragging }),
    [disabled, handleRef, isDragging],
  );

  return (
    <ReorderableItemContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="reorderable-item"
        data-disabled={disabled ? true : undefined}
        data-dragging={isDragging ? true : undefined}
        role={role}
        className={cn(
          "min-w-0 rounded-md border bg-card text-card-foreground transition-shadow data-[dragging=true]:shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ReorderableItemContext.Provider>
  );
}

function ReorderHandle({
  disabled,
  className,
  children,
  type = "button",
  "aria-label": ariaLabel = "Reorder item",
  ...props
}: ReorderHandleProps) {
  const item = React.useContext(ReorderableItemContext);

  if (!item) {
    throw new Error("ReorderHandle must be rendered inside ReorderableItem.");
  }

  const isDisabled = disabled ?? item.disabled;

  return (
    <button
      ref={item.handleRef}
      data-slot="reorder-handle"
      data-dragging={item.isDragging ? true : undefined}
      type={type}
      aria-label={ariaLabel}
      disabled={isDisabled}
      className={cn(
        "inline-flex size-9 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[dragging=true]:cursor-grabbing",
        className,
      )}
      {...props}
    >
      {children ?? <GripVerticalIcon aria-hidden="true" className="size-4" />}
    </button>
  );
}

export { ReorderableItem, ReorderableList, ReorderHandle };
export type {
  ReorderChange,
  ReorderHandleProps,
  ReorderId,
  ReorderableItemProps,
  ReorderableListProps,
};

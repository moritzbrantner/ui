"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar } from "../stable/avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../stable/combobox";
import { Button } from "../stable/button";
import { XIcon } from "lucide-react";

type CollaboratorPickerParticipant = {
  id: string;
  name: string;
  secondaryText?: React.ReactNode;
  imageUrl?: string;
  presenceLabel?: string;
  disabled?: boolean;
};

type CollaboratorPickerBaseProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  participants: readonly CollaboratorPickerParticipant[];
  inputLabel: string;
  getRemoveLabel: (participant: CollaboratorPickerParticipant) => string;
  placeholder?: string;
  emptyContent?: React.ReactNode;
  loadingContent?: React.ReactNode;
  loading?: boolean;
};

type CollaboratorPickerSingleProps = CollaboratorPickerBaseProps & {
  multiple?: false;
  selectedId: string | null;
  onSelectedIdChange: (selectedId: string | null) => void;
};

type CollaboratorPickerMultipleProps = CollaboratorPickerBaseProps & {
  multiple: true;
  selectedIds: readonly string[];
  onSelectedIdsChange: (selectedIds: string[]) => void;
};

export type CollaboratorPickerProps =
  | CollaboratorPickerSingleProps
  | CollaboratorPickerMultipleProps;

function resolveSelectionProps(props: CollaboratorPickerProps) {
  if (props.multiple) {
    const { multiple, selectedIds, onSelectedIdsChange, ...baseProps } = props;
    return {
      multiple,
      selectedIds,
      onSelectedIdsChange,
      baseProps,
    };
  }

  const { multiple, selectedId, onSelectedIdChange, ...baseProps } = props;
  return {
    multiple: false as const,
    selectedIds: selectedId ? [selectedId] : [],
    onSelectedIdsChange: (selectedIds: string[]) => onSelectedIdChange(selectedIds[0] ?? null),
    baseProps,
  };
}

function CollaboratorPicker(pickerProps: CollaboratorPickerProps) {
  const { multiple, selectedIds, onSelectedIdsChange, baseProps } =
    resolveSelectionProps(pickerProps);
  const {
    participants,
    inputLabel,
    getRemoveLabel,
    placeholder,
    emptyContent,
    loadingContent,
    loading = false,
    className,
    ...props
  } = baseProps;
  const selected = new Set(selectedIds);
  const selectedParticipants = participants.filter((participant) => selected.has(participant.id));

  const handleValueChange = (value: unknown) => {
    if (typeof value !== "string") {
      return;
    }

    if (multiple) {
      const next = selected.has(value)
        ? selectedIds.filter((id) => id !== value)
        : [...selectedIds, value];
      onSelectedIdsChange(next);
      return;
    }

    onSelectedIdsChange(value ? [value] : []);
  };

  return (
    <div data-slot="collaborator-picker" className={cn("grid min-w-0 gap-2", className)} {...props}>
      {selectedParticipants.length > 0 ? (
        <div data-slot="collaborator-picker-selection" className="flex flex-wrap gap-1.5">
          {selectedParticipants.map((participant) => (
            <span
              key={participant.id}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-muted py-1 pr-1 pl-2 text-sm"
            >
              <Avatar size="xs" name={participant.name} imageUrl={participant.imageUrl} />
              <span className="max-w-40 truncate">{participant.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={getRemoveLabel(participant)}
                onClick={() =>
                  onSelectedIdsChange(selectedIds.filter((id) => id !== participant.id))
                }
              >
                <XIcon />
              </Button>
            </span>
          ))}
        </div>
      ) : null}

      <Combobox
        value={multiple ? null : (selectedIds[0] ?? null)}
        onValueChange={handleValueChange}
      >
        <ComboboxInput aria-label={inputLabel} placeholder={placeholder} showTrigger={false} />
        <ComboboxContent>
          <ComboboxList>
            {loading ? (
              <div
                data-slot="collaborator-picker-loading"
                className="p-3 text-sm text-muted-foreground"
              >
                {loadingContent}
              </div>
            ) : (
              participants.map((participant) => (
                <ComboboxItem
                  key={participant.id}
                  value={participant.id}
                  disabled={participant.disabled}
                  aria-selected={selected.has(participant.id)}
                >
                  <Avatar size="sm" name={participant.name} imageUrl={participant.imageUrl} />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate">{participant.name}</span>
                    {participant.secondaryText ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {participant.secondaryText}
                      </span>
                    ) : null}
                  </span>
                  {participant.presenceLabel ? (
                    <span className="text-xs text-muted-foreground">
                      {participant.presenceLabel}
                    </span>
                  ) : null}
                </ComboboxItem>
              ))
            )}
          </ComboboxList>
          {loading ? null : <ComboboxEmpty>{emptyContent}</ComboboxEmpty>}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export { CollaboratorPicker, type CollaboratorPickerParticipant };

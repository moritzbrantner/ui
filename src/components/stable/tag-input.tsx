"use client";

import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "./button";

type TagInputProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  inputLabel?: string;
  addLabel?: string;
  removeLabel?: (tag: string) => string;
  name?: string;
  disabled?: boolean;
  maxTags?: number;
  allowDuplicates?: boolean;
  addOnBlur?: boolean;
  normalizeTag?: (tag: string) => string;
  validateTag?: (tag: string, tags: string[]) => boolean;
  inputProps?: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "disabled">;
};

const defaultNormalizeTag = (tag: string) => tag.trim();
const defaultRemoveLabel = (tag: string) => `Remove ${tag}`;

function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Add tag",
  inputLabel = "Tag",
  addLabel = "Add tag",
  removeLabel = defaultRemoveLabel,
  name,
  disabled = false,
  maxTags,
  allowDuplicates = false,
  addOnBlur = false,
  normalizeTag = defaultNormalizeTag,
  validateTag,
  inputProps,
  className,
  ...props
}: TagInputProps) {
  const controlled = value !== undefined;
  const [internalTags, setInternalTags] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState("");
  const tags = controlled ? value : internalTags;
  const canAddMore = maxTags === undefined || tags.length < maxTags;

  const setTags = React.useCallback(
    (nextTags: string[]) => {
      if (!controlled) {
        setInternalTags(nextTags);
      }

      onValueChange?.(nextTags);
    },
    [controlled, onValueChange],
  );

  const addTags = React.useCallback(
    (rawTags: string[]) => {
      if (disabled || rawTags.length === 0) {
        return false;
      }

      const nextTags = [...tags];
      let changed = false;

      for (const rawTag of rawTags) {
        if (maxTags !== undefined && nextTags.length >= maxTags) {
          break;
        }

        const tag = normalizeTag(rawTag);

        if (!tag) {
          continue;
        }

        if (!allowDuplicates && nextTags.includes(tag)) {
          continue;
        }

        if (validateTag && !validateTag(tag, nextTags)) {
          continue;
        }

        nextTags.push(tag);
        changed = true;
      }

      if (changed) {
        setTags(nextTags);
      }

      return changed;
    },
    [allowDuplicates, disabled, maxTags, normalizeTag, setTags, tags, validateTag],
  );

  const addInputValue = React.useCallback(() => {
    const added = addTags([inputValue]);

    if (added) {
      setInputValue("");
    }

    return added;
  }, [addTags, inputValue]);

  const removeTag = React.useCallback(
    (index: number) => {
      if (disabled) {
        return;
      }

      setTags(tags.filter((_, tagIndex) => tagIndex !== index));
    },
    [disabled, setTags, tags],
  );

  return (
    <div
      data-slot="tag-input"
      data-disabled={disabled ? true : undefined}
      data-full={canAddMore ? undefined : true}
      className={cn("grid w-full gap-2", className)}
      {...props}
    >
      <div
        data-slot="tag-input-control"
        role="group"
        aria-disabled={disabled || undefined}
        className={cn(
          "flex min-h-[var(--ui-input-height,var(--ui-control-height-md))] w-full min-w-0 flex-wrap items-center gap-1.5 rounded-[var(--ui-input-radius,var(--ui-radius-control))] border border-input bg-transparent px-2 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "focus-within:border-ring focus-within:ring-[var(--ui-focus-ring-width)] focus-within:ring-ring/50",
          "has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            data-slot="tag-input-tag"
            className="inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium text-foreground"
          >
            <span data-slot="tag-input-tag-label" className="truncate">
              {tag}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={removeLabel(tag)}
              disabled={disabled}
              data-slot="tag-input-remove"
              className="-mr-1 size-5 rounded-[calc(var(--radius)-3px)] opacity-60 hover:opacity-100"
              onClick={() => removeTag(index)}
            >
              <XIcon />
            </Button>
            {name ? <input type="hidden" name={name} value={tag} /> : null}
          </span>
        ))}
        <input
          aria-label={inputLabel}
          placeholder={canAddMore ? placeholder : undefined}
          {...inputProps}
          value={inputValue}
          disabled={disabled || !canAddMore}
          data-slot="tag-input-field"
          className={cn(
            "h-7 min-w-20 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            inputProps?.className,
          )}
          onBlur={(event) => {
            inputProps?.onBlur?.(event);

            if (!event.defaultPrevented && addOnBlur) {
              addInputValue();
            }
          }}
          onChange={(event) => {
            inputProps?.onChange?.(event);

            if (!event.defaultPrevented) {
              setInputValue(event.target.value);
            }
          }}
          onKeyDown={(event) => {
            inputProps?.onKeyDown?.(event);

            if (event.defaultPrevented) {
              return;
            }

            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addInputValue();
              return;
            }

            if (event.key === "Backspace" && inputValue === "" && tags.length > 0) {
              event.preventDefault();
              removeTag(tags.length - 1);
            }
          }}
          onPaste={(event) => {
            inputProps?.onPaste?.(event);

            if (event.defaultPrevented) {
              return;
            }

            const pastedText = event.clipboardData.getData("text");
            const pastedTags = pastedText.split(/[\n,]/).map((tag) => tag.trim());

            if (pastedTags.length > 1) {
              event.preventDefault();

              if (addTags(pastedTags)) {
                setInputValue("");
              }
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={addLabel}
          disabled={disabled || !canAddMore || normalizeTag(inputValue) === ""}
          data-slot="tag-input-add"
          className="shrink-0"
          onClick={addInputValue}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}

export { TagInput };
export type { TagInputProps };

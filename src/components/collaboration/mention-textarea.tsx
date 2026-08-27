"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { Avatar } from "../stable/avatar";
import { Textarea } from "../stable/textarea";

type MentionCandidate = {
  id: string;
  label: string;
  secondaryText?: React.ReactNode;
  imageUrl?: string;
  disabled?: boolean;
};

type MentionRange = {
  start: number;
  end: number;
  query: string;
};

function getActiveMention(value: string, caret: number): MentionRange | null {
  const safeCaret = Math.min(Math.max(0, caret), value.length);
  const beforeCaret = value.slice(0, safeCaret);
  const match = beforeCaret.match(/(?:^|\s)@([^\s@]*)$/u);

  if (!match) {
    return null;
  }

  const query = match[1] ?? "";
  const start = safeCaret - query.length - 1;
  return { start, end: safeCaret, query };
}

function insertMention(value: string, range: MentionRange, label: string) {
  const before = value.slice(0, range.start);
  const after = value.slice(range.end);
  const needsSpace = after.length === 0 || !/^\s/u.test(after);
  const inserted = `@${label}${needsSpace ? " " : ""}`;
  return {
    value: `${before}${inserted}${after}`,
    caret: before.length + inserted.length,
  };
}

export type MentionTextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "value" | "defaultValue" | "onChange" | "onSelect"
> & {
  value: string;
  candidates: readonly MentionCandidate[];
  onValueChange: (value: string) => void;
  onMentionQueryChange?: (range: MentionRange | null) => void;
  onMentionSelect?: (candidate: MentionCandidate, range: MentionRange) => void;
  suggestionsLabel: string;
  emptyContent?: React.ReactNode;
};

function MentionTextarea({
  value,
  candidates,
  onValueChange,
  onMentionQueryChange,
  onMentionSelect,
  suggestionsLabel,
  emptyContent,
  className,
  onKeyDown,
  ...props
}: MentionTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [range, setRange] = React.useState<MentionRange | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const open = range !== null;
  const enabledCandidates = candidates.filter((candidate) => !candidate.disabled);
  const activeCandidate = enabledCandidates[activeIndex] ?? null;
  const listboxId = React.useId();

  const updateRange = (element: HTMLTextAreaElement, nextValue = element.value) => {
    const nextRange = getActiveMention(nextValue, element.selectionStart ?? nextValue.length);
    setRange(nextRange);
    setActiveIndex(0);
    onMentionQueryChange?.(nextRange);
  };

  const selectCandidate = (candidate: MentionCandidate) => {
    if (!range || candidate.disabled) {
      return;
    }

    const insertion = insertMention(value, range, candidate.label);
    onValueChange(insertion.value);
    onMentionSelect?.(candidate, range);
    setRange(null);
    onMentionQueryChange?.(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(insertion.caret, insertion.caret);
    });
  };

  return (
    <div data-slot="mention-textarea" className={cn("relative grid gap-1", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeCandidate ? `${listboxId}-${activeCandidate.id}` : undefined
        }
        onChange={(event) => {
          onValueChange(event.currentTarget.value);
          updateRange(event.currentTarget);
        }}
        onSelect={(event) => updateRange(event.currentTarget)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !open) {
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex((current) =>
              enabledCandidates.length === 0
                ? 0
                : (current + direction + enabledCandidates.length) % enabledCandidates.length,
            );
            return;
          }

          if ((event.key === "Enter" || event.key === "Tab") && activeCandidate) {
            event.preventDefault();
            selectCandidate(activeCandidate);
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setRange(null);
            onMentionQueryChange?.(null);
          }
        }}
        {...props}
      />
      {open ? (
        <MentionSuggestions id={listboxId} aria-label={suggestionsLabel}>
          {candidates.length > 0
            ? candidates.map((candidate) => (
                <MentionOption
                  key={candidate.id}
                  id={`${listboxId}-${candidate.id}`}
                  candidate={candidate}
                  active={activeCandidate?.id === candidate.id}
                  onSelect={() => selectCandidate(candidate)}
                />
              ))
            : emptyContent}
        </MentionSuggestions>
      ) : null}
    </div>
  );
}

function MentionSuggestions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mention-suggestions"
      role="listbox"
      className={cn(
        "absolute top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--ui-radius-overlay)] bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10",
        className,
      )}
      {...props}
    />
  );
}

export type MentionOptionProps = Omit<React.ComponentProps<"button">, "onSelect"> & {
  candidate: MentionCandidate;
  active?: boolean;
  onSelect?: () => void;
};

function MentionOption({
  candidate,
  active = false,
  onSelect,
  className,
  ...props
}: MentionOptionProps) {
  return (
    <button
      data-slot="mention-option"
      type="button"
      role="option"
      aria-selected={active}
      disabled={candidate.disabled}
      className={cn(
        "flex min-h-11 w-full items-center gap-2 rounded-[var(--ui-radius-control)] px-2 py-1.5 text-left text-sm outline-none hover:bg-accent aria-selected:bg-accent disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      {...props}
    >
      <Avatar size="sm" name={candidate.label} imageUrl={candidate.imageUrl} />
      <span className="grid min-w-0">
        <span className="truncate font-medium">{candidate.label}</span>
        {candidate.secondaryText ? (
          <span className="truncate text-xs text-muted-foreground">{candidate.secondaryText}</span>
        ) : null}
      </span>
    </button>
  );
}

export {
  MentionOption,
  MentionSuggestions,
  MentionTextarea,
  getActiveMention,
  insertMention,
  type MentionCandidate,
  type MentionRange,
};
export type MentionSuggestionsProps = React.ComponentProps<typeof MentionSuggestions>;

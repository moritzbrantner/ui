"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import {
  CommandPalette,
  type CommandPaletteAction,
  type CommandPaletteGroup,
} from "./command-palette";
import { ShortcutHelpDialog, type ShortcutHelpGroup, type ShortcutHelpItem } from "./shortcut-help";
import { WorkbenchLayout, type WorkbenchLayoutProps } from "./workbench-layout";

export type EditorWorkbenchCommand = Omit<CommandPaletteAction, "shortcut"> & {
  groupId?: string;
  groupLabel?: React.ReactNode;
  shortcut?: string;
};

export type EditorWorkbenchProps = Omit<
  WorkbenchLayoutProps,
  "toolbar" | "leftPanel" | "rightPanel" | "bottomPanel"
> & {
  commands?: readonly EditorWorkbenchCommand[];
  toolbar?: React.ReactNode;
  navigator?: React.ReactNode;
  inspector?: React.ReactNode;
  bottomPanel?: React.ReactNode;
  selectionSummary?: React.ReactNode;
  commandPaletteOpen?: boolean;
  defaultCommandPaletteOpen?: boolean;
  onCommandPaletteOpenChange?: (open: boolean) => void;
  shortcutHelpOpen?: boolean;
  defaultShortcutHelpOpen?: boolean;
  onShortcutHelpOpenChange?: (open: boolean) => void;
  enableKeyboardShortcuts?: boolean;
  commandPaletteShortcut?: string;
  shortcutHelpShortcut?: string;
  commandPalettePlaceholder?: string;
  commandPaletteEmptyMessage?: React.ReactNode;
};

export type EditorInspectorPanelProps = React.ComponentProps<"aside"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

export type EditorSelectionSummaryProps = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

function EditorWorkbench({
  commands = [],
  toolbar,
  navigator,
  inspector,
  bottomPanel,
  selectionSummary,
  commandPaletteOpen,
  defaultCommandPaletteOpen = false,
  onCommandPaletteOpenChange,
  shortcutHelpOpen,
  defaultShortcutHelpOpen = false,
  onShortcutHelpOpenChange,
  enableKeyboardShortcuts = true,
  commandPaletteShortcut = "Mod+K",
  shortcutHelpShortcut = "Shift+?",
  commandPalettePlaceholder = "Search editor commands...",
  commandPaletteEmptyMessage = "No editor commands found.",
  children,
  ...layoutProps
}: EditorWorkbenchProps) {
  const [internalCommandPaletteOpen, setInternalCommandPaletteOpen] =
    React.useState(defaultCommandPaletteOpen);
  const [internalShortcutHelpOpen, setInternalShortcutHelpOpen] =
    React.useState(defaultShortcutHelpOpen);
  const resolvedCommandPaletteOpen = commandPaletteOpen ?? internalCommandPaletteOpen;
  const resolvedShortcutHelpOpen = shortcutHelpOpen ?? internalShortcutHelpOpen;
  const commandGroups = React.useMemo(() => createEditorCommandPaletteGroups(commands), [commands]);
  const shortcutGroups = React.useMemo(() => createEditorShortcutGroups(commands), [commands]);

  const setCommandPaletteOpen = React.useCallback(
    (open: boolean) => {
      if (commandPaletteOpen === undefined) {
        setInternalCommandPaletteOpen(open);
      }
      onCommandPaletteOpenChange?.(open);
    },
    [commandPaletteOpen, onCommandPaletteOpenChange],
  );

  const setShortcutHelpOpen = React.useCallback(
    (open: boolean) => {
      if (shortcutHelpOpen === undefined) {
        setInternalShortcutHelpOpen(open);
      }
      onShortcutHelpOpenChange?.(open);
    },
    [onShortcutHelpOpenChange, shortcutHelpOpen],
  );

  React.useEffect(() => {
    if (!enableKeyboardShortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesEditorShortcut(event, commandPaletteShortcut)) {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (
        !isEditableKeyboardTarget(event.target) &&
        matchesEditorShortcut(event, shortcutHelpShortcut)
      ) {
        event.preventDefault();
        setShortcutHelpOpen(true);
        return;
      }

      for (const command of commands) {
        if (
          command.shortcut &&
          !command.disabled &&
          command.onSelect &&
          (!isEditableKeyboardTarget(event.target) || hasCommandModifier(event)) &&
          matchesEditorShortcut(event, command.shortcut)
        ) {
          event.preventDefault();
          command.onSelect();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    commandPaletteShortcut,
    commands,
    enableKeyboardShortcuts,
    setCommandPaletteOpen,
    setShortcutHelpOpen,
    shortcutHelpShortcut,
  ]);

  const resolvedToolbar =
    toolbar || selectionSummary ? (
      <>
        {toolbar}
        {selectionSummary ? (
          <EditorSelectionSummary className="ml-auto">{selectionSummary}</EditorSelectionSummary>
        ) : null}
      </>
    ) : undefined;

  return (
    <>
      <WorkbenchLayout
        {...layoutProps}
        toolbar={resolvedToolbar}
        leftPanel={navigator}
        rightPanel={inspector}
        bottomPanel={bottomPanel}
      >
        {children}
      </WorkbenchLayout>
      <CommandPalette
        open={resolvedCommandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        groups={commandGroups}
        placeholder={commandPalettePlaceholder}
        emptyMessage={commandPaletteEmptyMessage}
        footer={
          shortcutGroups.length > 0 ? (
            <span>Press {shortcutHelpShortcut} for keyboard shortcuts.</span>
          ) : undefined
        }
      />
      <ShortcutHelpDialog
        open={resolvedShortcutHelpOpen}
        onOpenChange={setShortcutHelpOpen}
        groups={shortcutGroups}
        description="Keyboard commands available in this editor."
      />
    </>
  );
}

function EditorInspectorPanel({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: EditorInspectorPanelProps) {
  return (
    <aside
      data-slot="editor-inspector"
      aria-label={typeof title === "string" ? title : "Editor inspector"}
      className={cn("grid min-h-0 content-start gap-3", className)}
      {...props}
    >
      <header className="grid gap-1 border-b border-border/60 pb-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h2 className="min-w-0 truncate text-sm font-semibold">{title}</h2>
          {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
        </div>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </header>
      <div data-slot="editor-inspector-body" className="grid min-h-0 gap-3">
        {children}
      </div>
    </aside>
  );
}

function EditorSelectionSummary({ className, children, ...props }: EditorSelectionSummaryProps) {
  return (
    <div
      data-slot="editor-selection-summary"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "min-w-0 truncate text-xs text-muted-foreground [font-variant-numeric:tabular-nums]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function createEditorCommandPaletteGroups(
  commands: readonly EditorWorkbenchCommand[],
): CommandPaletteGroup[] {
  const groups = new Map<string, { label?: React.ReactNode; actions: CommandPaletteAction[] }>();

  for (const command of commands) {
    const groupId = command.groupId ?? "commands";
    const group = groups.get(groupId) ?? {
      label: command.groupLabel ?? (groupId === "commands" ? "Commands" : groupId),
      actions: [],
    };
    group.actions.push(command);
    groups.set(groupId, group);
  }

  return [...groups].map(([id, group]) => ({ id, ...group }));
}

function createEditorShortcutGroups(
  commands: readonly EditorWorkbenchCommand[],
): ShortcutHelpGroup[] {
  const groups = new Map<string, { label: React.ReactNode; shortcuts: ShortcutHelpItem[] }>();

  for (const command of commands) {
    if (!command.shortcut) {
      continue;
    }
    const groupId = command.groupId ?? "commands";
    const group = groups.get(groupId) ?? {
      label: command.groupLabel ?? (groupId === "commands" ? "Commands" : groupId),
      shortcuts: [],
    };
    group.shortcuts.push({
      id: command.id,
      label: command.label,
      description: command.description,
      shortcut: command.shortcut,
    });
    groups.set(groupId, group);
  }

  return [...groups].map(([id, group]) => ({ id, ...group }));
}

function matchesEditorShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
  const key = parts.at(-1)?.toLowerCase();
  if (!key) {
    return false;
  }

  const modifiers = new Set(parts.slice(0, -1).map((part) => part.toLowerCase()));
  const mod = event.metaKey || event.ctrlKey;
  if (modifiers.has("mod") !== mod) return false;
  if (modifiers.has("ctrl") !== event.ctrlKey && !modifiers.has("mod")) return false;
  if (modifiers.has("meta") !== event.metaKey && !modifiers.has("mod")) return false;
  if (modifiers.has("alt") ? !event.altKey : event.altKey) return false;
  if (modifiers.has("shift") ? !event.shiftKey : event.shiftKey) return false;

  return event.key.toLowerCase() === key;
}

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function hasCommandModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

export {
  EditorInspectorPanel,
  EditorSelectionSummary,
  EditorWorkbench,
  createEditorCommandPaletteGroups,
  createEditorShortcutGroups,
  matchesEditorShortcut,
};

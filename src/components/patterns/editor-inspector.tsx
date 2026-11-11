"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

export type EditorInspectorProps = React.ComponentProps<"section"> & {
  /** Accessible name when no `EditorInspectorHeader` title labels the surface. */
  label?: string;
};

type EditorInspectorContextValue = { titleId: string; registerTitle: () => () => void };
const EditorInspectorContext = React.createContext<EditorInspectorContextValue | null>(null);

/**
 * Inspector surface for app-owned selection properties: a fixed header, a scrolling body of
 * `PropertySection`s and `PropertyRow`s, and an optional fixed footer. Rows switch between stacked
 * and side-by-side labels from the inspector content width, not the viewport.
 */
function EditorInspector({
  label,
  className,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: EditorInspectorProps) {
  const titleId = React.useId();
  const [titleCount, setTitleCount] = React.useState(0);
  const registerTitle = React.useCallback(() => {
    setTitleCount((count) => count + 1);
    return () => setTitleCount((count) => count - 1);
  }, []);
  const context = React.useMemo(() => ({ titleId, registerTitle }), [registerTitle, titleId]);
  return (
    <EditorInspectorContext.Provider value={context}>
      <section
        aria-label={label}
        aria-labelledby={ariaLabelledBy ?? (!label && titleCount > 0 ? titleId : undefined)}
        data-slot="editor-inspector"
        className={cn(
          "@container/editor-inspector flex h-full min-h-0 min-w-0 flex-col bg-card/65 text-sm text-card-foreground",
          className,
        )}
        {...props}
      />
    </EditorInspectorContext.Provider>
  );
}

export type EditorInspectorHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode;
  /** Secondary line such as the selection summary (`3 nodes selected`). */
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

function EditorInspectorHeader({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: EditorInspectorHeaderProps) {
  const context = React.useContext(EditorInspectorContext);
  const registerTitle = context?.registerTitle;
  React.useLayoutEffect(() => registerTitle?.(), [registerTitle]);
  return (
    <header
      data-slot="editor-inspector-header"
      className={cn(
        "grid shrink-0 gap-1 border-b border-border/60 px-[var(--ui-surface-padding-sm)] py-2",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-[var(--ui-control-height-sm)] min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2
            id={context?.titleId}
            data-slot="editor-inspector-title"
            className="truncate text-sm font-medium"
          >
            {title}
          </h2>
          {description ? (
            <p
              data-slot="editor-inspector-description"
              className="truncate text-xs text-muted-foreground [font-variant-numeric:tabular-nums]"
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div data-slot="editor-inspector-actions" className="flex shrink-0 items-center gap-1">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </header>
  );
}

export type EditorInspectorContentProps = React.ComponentProps<"div">;

/** Scrolling body. Place `PropertySection`s here; sections are separated by the surface rhythm. */
function EditorInspectorContent({ className, ...props }: EditorInspectorContentProps) {
  return (
    <div
      data-slot="editor-inspector-content"
      className={cn(
        // PropertyRow's responsive orientation follows this container's width, not the viewport.
        "group/field-group @container/field-group grid min-h-0 min-w-0 flex-1 content-start gap-1 overflow-y-auto overscroll-contain px-[var(--ui-surface-padding-sm)] py-1",
        className,
      )}
      {...props}
    />
  );
}

export type EditorInspectorFooterProps = React.ComponentProps<"footer">;

/** Fixed footer for apply/reset or status. Omit it for immediately-applied edits. */
function EditorInspectorFooter({ className, ...props }: EditorInspectorFooterProps) {
  return (
    <footer
      data-slot="editor-inspector-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border/60 px-[var(--ui-surface-padding-sm)] py-2",
        className,
      )}
      {...props}
    />
  );
}

export { EditorInspector, EditorInspectorContent, EditorInspectorFooter, EditorInspectorHeader };

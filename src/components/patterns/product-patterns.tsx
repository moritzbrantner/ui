"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type SettingsSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

function SettingsSection({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: SettingsSectionProps) {
  return (
    <section
      data-slot="settings-section"
      className={cn(
        "grid gap-4 border-b py-5 last:border-b-0 md:grid-cols-[minmax(12rem,0.65fr)_minmax(0,1.35fr)]",
        className,
      )}
      {...props}
    >
      <header className="grid content-start gap-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {actions ? <div className="pt-1">{actions}</div> : null}
      </header>
      <div className="grid min-w-0 content-start gap-3">{children}</div>
    </section>
  );
}

type ProductEmptyStateProps = Omit<React.ComponentProps<"section">, "title"> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};

function ProductEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  ...props
}: ProductEmptyStateProps) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "grid min-h-56 place-items-center rounded-[var(--ui-radius-surface)] border border-dashed bg-muted/20 p-6 text-center",
        className,
      )}
      {...props}
    >
      <div className="grid max-w-md justify-items-center gap-3">
        {icon ? (
          <div className="grid size-10 place-items-center rounded-full bg-muted">{icon}</div>
        ) : null}
        <div className="grid gap-1">
          <h2 className="font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action || secondaryAction ? (
          <div className="flex flex-wrap justify-center gap-2">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type ProductFormActionsProps = React.ComponentProps<"div"> & {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
  sticky?: boolean;
};

function ProductFormActions({
  primary,
  secondary,
  tertiary,
  sticky = false,
  className,
  ...props
}: ProductFormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-wrap items-center gap-2 border-t bg-background/95 py-3",
        sticky && "sticky bottom-0 z-10 backdrop-blur",
        className,
      )}
      {...props}
    >
      <div className="mr-auto">{tertiary}</div>
      {secondary}
      {primary}
    </div>
  );
}

type InlineEditProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value: string;
  onChange?: (value: string) => void;
  onCommit?: (value: string) => void;
  label?: string;
  placeholder?: string;
};

function InlineEdit({
  value,
  onChange,
  onCommit,
  label = "Edit value",
  placeholder,
  className,
  ...props
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  const commit = () => {
    onChange?.(draft);
    onCommit?.(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        data-slot="inline-edit"
        className={cn("group inline-flex min-w-0 items-center gap-2", className)}
        {...props}
      >
        <span className="truncate">{value || placeholder}</span>
        <button
          type="button"
          className="min-h-10 rounded-[var(--ui-radius-control)] border px-2 py-1 text-xs opacity-70 group-hover:opacity-100"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div
      data-slot="inline-edit"
      className={cn("inline-flex min-w-0 items-center gap-1.5", className)}
      {...props}
    >
      <input
        aria-label={label}
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setEditing(false);
        }}
        className="h-9 min-w-0 rounded-[var(--ui-radius-control)] border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="button"
        className="h-10 rounded-[var(--ui-radius-control)] bg-primary px-2 text-xs text-primary-foreground"
        onClick={commit}
      >
        Save
      </button>
      <button
        type="button"
        className="h-10 rounded-[var(--ui-radius-control)] border px-2 text-xs"
        onClick={() => setEditing(false)}
      >
        Cancel
      </button>
    </div>
  );
}

type ResponsiveToolbarProps = React.ComponentProps<"div"> & {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  overflow?: React.ReactNode;
};

function ResponsiveToolbar({
  primary,
  secondary,
  overflow,
  className,
  ...props
}: ResponsiveToolbarProps) {
  return (
    <div
      data-slot="responsive-toolbar"
      role="toolbar"
      className={cn(
        "flex min-h-[var(--ui-toolbar-min-height)] flex-wrap items-center gap-[var(--ui-toolbar-gap)] rounded-[var(--ui-radius-surface)] border bg-card px-[var(--ui-toolbar-padding-x)] py-[var(--ui-toolbar-padding-y)]",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{primary}</div>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">{secondary}</div>
      {overflow ? <div className="shrink-0">{overflow}</div> : null}
    </div>
  );
}

type ResourceCardProps = Omit<React.ComponentProps<"article">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  href?: string;
};

function ResourceCard({
  title,
  description,
  meta,
  media,
  actions,
  href,
  className,
  ...props
}: ResourceCardProps) {
  const titleContent = href ? (
    <a href={href} className="underline-offset-4 hover:underline">
      {title}
    </a>
  ) : (
    title
  );

  return (
    <article
      data-slot="resource-card"
      className={cn(
        "grid overflow-hidden rounded-[var(--ui-radius-surface)] border bg-card text-card-foreground sm:grid-cols-[8rem_minmax(0,1fr)]",
        className,
      )}
      {...props}
    >
      {media ? <div className="min-h-28 bg-muted">{media}</div> : null}
      <div className="grid min-w-0 content-start gap-2 p-4">
        <div className="grid gap-1">
          <h2 className="truncate font-semibold">{titleContent}</h2>
          {description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
        {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
      </div>
    </article>
  );
}

export {
  ProductEmptyState,
  ProductFormActions,
  InlineEdit,
  ResourceCard,
  ResponsiveToolbar,
  SettingsSection,
};
export type {
  ProductEmptyStateProps,
  ProductFormActionsProps,
  InlineEditProps,
  ResourceCardProps,
  ResponsiveToolbarProps,
  SettingsSectionProps,
};

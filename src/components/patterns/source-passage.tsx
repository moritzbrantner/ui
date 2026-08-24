"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type SourcePassageProps = React.ComponentPropsWithoutRef<"article">;

type SourcePassageHeaderProps = React.ComponentPropsWithoutRef<"header">;

type SourcePassageTitleProps = React.ComponentPropsWithoutRef<"h2">;

type SourcePassageLocatorProps = React.ComponentPropsWithoutRef<"span">;

type SourcePassageColumnsProps = React.ComponentPropsWithoutRef<"div">;

type SourcePassageTextProps = Omit<React.ComponentPropsWithoutRef<"section">, "title"> & {
  label: React.ReactNode;
  language?: React.ReactNode;
};

type SourcePassageHighlightProps = React.ComponentPropsWithoutRef<"mark">;

function SourcePassage({ className, ...props }: SourcePassageProps) {
  return (
    <article
      data-slot="source-passage"
      className={cn(
        "grid min-w-0 gap-4 rounded-[var(--ui-radius-surface)] border border-border/70 bg-card p-[var(--ui-card-padding)] text-card-foreground shadow-[var(--ui-shadow-surface)]",
        className,
      )}
      {...props}
    />
  );
}

function SourcePassageHeader({ className, ...props }: SourcePassageHeaderProps) {
  return (
    <header
      data-slot="source-passage-header"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3",
        className,
      )}
      {...props}
    />
  );
}

function SourcePassageTitle({ className, ...props }: SourcePassageTitleProps) {
  return (
    <h2
      data-slot="source-passage-title"
      className={cn("font-heading text-lg font-semibold leading-snug text-foreground", className)}
      {...props}
    />
  );
}

function SourcePassageLocator({ className, ...props }: SourcePassageLocatorProps) {
  return (
    <span
      data-slot="source-passage-locator"
      className={cn(
        "font-mono text-xs leading-5 tabular-nums text-[var(--document-citation)]",
        className,
      )}
      {...props}
    />
  );
}

function SourcePassageColumns({ className, ...props }: SourcePassageColumnsProps) {
  return (
    <div
      data-slot="source-passage-columns"
      className={cn("grid min-w-0 gap-5 md:grid-cols-2 md:divide-x md:divide-border/60", className)}
      {...props}
    />
  );
}

function SourcePassageText({
  label,
  language,
  className,
  children,
  ...props
}: SourcePassageTextProps) {
  return (
    <section
      data-slot="source-passage-text"
      className={cn(
        "grid min-w-0 content-start gap-2 md:pr-5 md:last:pr-0 md:last:pl-5",
        className,
      )}
      {...props}
    >
      <div
        data-slot="source-passage-text-heading"
        className="flex min-w-0 flex-wrap items-baseline justify-between gap-2"
      >
        <h3 className="font-control text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </h3>
        {language ? (
          <span className="font-control text-xs text-muted-foreground">{language}</span>
        ) : null}
      </div>
      <div
        data-slot="source-passage-text-content"
        className="font-body text-base leading-8 text-foreground"
      >
        {children}
      </div>
    </section>
  );
}

function SourcePassageHighlight({ className, ...props }: SourcePassageHighlightProps) {
  return (
    <mark
      data-slot="source-passage-highlight"
      className={cn(
        "rounded-sm bg-[var(--document-highlight)] px-1 text-inherit decoration-clone box-decoration-clone",
        className,
      )}
      {...props}
    />
  );
}

export {
  SourcePassage,
  SourcePassageColumns,
  SourcePassageHeader,
  SourcePassageHighlight,
  SourcePassageLocator,
  SourcePassageText,
  SourcePassageTitle,
};
export type {
  SourcePassageColumnsProps,
  SourcePassageHeaderProps,
  SourcePassageHighlightProps,
  SourcePassageLocatorProps,
  SourcePassageProps,
  SourcePassageTextProps,
  SourcePassageTitleProps,
};

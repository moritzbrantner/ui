"use client";

import * as React from "react";

import { cn } from "@/registry/default/lib/cn";

type ScholarlyNoteTone = "annotation" | "commentary" | "translation" | "variant";

type ScholarlyNoteProps = Omit<React.ComponentPropsWithoutRef<"aside">, "title"> & {
  title: React.ReactNode;
  label?: React.ReactNode;
  locator?: React.ReactNode;
  tone?: ScholarlyNoteTone;
};

const toneClassNames = {
  annotation: "border-l-[color:var(--document-annotation)]",
  commentary: "border-l-[color:var(--document-margin-note)]",
  translation: "border-l-[color:var(--document-citation)]",
  variant: "border-l-[color:var(--document-callout)]",
} satisfies Record<ScholarlyNoteTone, string>;

function ScholarlyNote({
  title,
  label,
  locator,
  tone = "annotation",
  className,
  children,
  ...props
}: ScholarlyNoteProps) {
  return (
    <aside
      data-slot="scholarly-note"
      data-tone={tone}
      className={cn(
        "grid min-w-0 gap-2 border-l-2 bg-muted/35 px-3 py-2.5 text-sm",
        toneClassNames[tone],
        className,
      )}
      {...props}
    >
      <div
        data-slot="scholarly-note-heading"
        className="flex min-w-0 flex-wrap items-baseline justify-between gap-2"
      >
        <div className="grid min-w-0 gap-0.5">
          {label ? (
            <span className="font-control text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </span>
          ) : null}
          <h3 className="font-heading text-sm font-semibold leading-5 text-foreground">{title}</h3>
        </div>
        {locator ? (
          <span className="font-mono text-xs text-[var(--document-citation)]">{locator}</span>
        ) : null}
      </div>
      <div data-slot="scholarly-note-content" className="font-body leading-6 text-muted-foreground">
        {children}
      </div>
    </aside>
  );
}

export { ScholarlyNote };
export type { ScholarlyNoteProps, ScholarlyNoteTone };

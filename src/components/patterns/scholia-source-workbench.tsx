"use client";

import * as React from "react";

import { cn } from "../../lib/cn";
import { ApparatusList, type ApparatusEntryData } from "./apparatus-list";
import { ScholarlyNote, type ScholarlyNoteTone } from "./scholarly-note";
import {
  SourcePassage,
  SourcePassageColumns,
  SourcePassageHeader,
  SourcePassageLocator,
  SourcePassageText,
  SourcePassageTitle,
} from "./source-passage";

type ScholiaWorkbenchNote = {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  label?: React.ReactNode;
  locator?: React.ReactNode;
  tone?: ScholarlyNoteTone;
};

type ScholiaSourceWorkbenchProps = Omit<React.ComponentPropsWithoutRef<"section">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  source?: React.ReactNode;
  locator?: React.ReactNode;
  original: React.ReactNode;
  originalLabel?: React.ReactNode;
  originalLanguage?: React.ReactNode;
  originalLanguageCode?: string;
  originalDirection?: React.HTMLAttributes<HTMLElement>["dir"];
  translation?: React.ReactNode;
  translationLabel?: React.ReactNode;
  translationLanguage?: React.ReactNode;
  translationLanguageCode?: string;
  toolbar?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  notes?: readonly ScholiaWorkbenchNote[];
  apparatus?: readonly ApparatusEntryData[];
};

function ScholiaSourceWorkbench({
  title,
  description,
  source,
  locator,
  original,
  originalLabel = "Source text",
  originalLanguage,
  originalLanguageCode,
  originalDirection,
  translation,
  translationLabel = "Translation",
  translationLanguage,
  translationLanguageCode,
  toolbar,
  metadata,
  actions,
  notes = [],
  apparatus = [],
  className,
  ...props
}: ScholiaSourceWorkbenchProps) {
  return (
    <section
      data-slot="scholia-source-workbench"
      className={cn(
        "grid min-w-0 overflow-hidden rounded-[var(--ui-radius-surface)] border border-border/70 bg-background text-foreground shadow-[var(--ui-shadow-surface)]",
        className,
      )}
      {...props}
    >
      <header
        data-slot="scholia-source-workbench-header"
        className="grid min-w-0 gap-3 border-b border-border/70 bg-card px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
      >
        <div className="grid min-w-0 gap-1">
          {source ? (
            <span className="font-control text-xs font-semibold tracking-wide text-[var(--document-citation)] uppercase">
              {source}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-xl font-semibold leading-snug">{title}</h1>
            {locator ? (
              <span className="font-mono text-xs text-[var(--document-citation)]">{locator}</span>
            ) : null}
          </div>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div data-slot="scholia-source-workbench-actions" className="flex flex-wrap gap-2">
            {actions}
          </div>
        ) : null}
      </header>
      {toolbar ? (
        <div
          data-slot="scholia-source-workbench-toolbar"
          className="flex min-w-0 flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2"
        >
          {toolbar}
        </div>
      ) : null}
      <div
        data-slot="scholia-source-workbench-layout"
        className={cn(
          "grid min-w-0",
          metadata || notes.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : undefined,
        )}
      >
        <div data-slot="scholia-source-workbench-main" className="grid min-w-0 gap-5 p-4 md:p-5">
          <SourcePassage>
            <SourcePassageHeader>
              <SourcePassageTitle>{title}</SourcePassageTitle>
              {locator ? <SourcePassageLocator>{locator}</SourcePassageLocator> : null}
            </SourcePassageHeader>
            <SourcePassageColumns
              className={translation ? undefined : "md:grid-cols-1 md:divide-x-0"}
            >
              <SourcePassageText
                label={originalLabel}
                language={originalLanguage}
                lang={originalLanguageCode}
                dir={originalDirection}
                className={translation ? undefined : "md:px-0"}
              >
                {original}
              </SourcePassageText>
              {translation ? (
                <SourcePassageText
                  label={translationLabel}
                  language={translationLanguage}
                  lang={translationLanguageCode}
                >
                  {translation}
                </SourcePassageText>
              ) : null}
            </SourcePassageColumns>
          </SourcePassage>
          {apparatus.length > 0 ? (
            <section data-slot="scholia-source-workbench-apparatus" className="grid gap-2">
              <h2 className="font-heading text-base font-semibold">Critical apparatus</h2>
              <ApparatusList entries={apparatus} />
            </section>
          ) : null}
        </div>
        {metadata || notes.length > 0 ? (
          <aside
            data-slot="scholia-source-workbench-sidebar"
            className="grid content-start gap-4 border-t border-border/60 bg-card/45 p-4 lg:border-t-0 lg:border-l"
          >
            {metadata}
            {notes.length > 0 ? (
              <div data-slot="scholia-source-workbench-notes" className="grid gap-3">
                {notes.map((note) => (
                  <ScholarlyNote
                    key={note.id}
                    title={note.title}
                    label={note.label}
                    locator={note.locator}
                    tone={note.tone}
                  >
                    {note.content}
                  </ScholarlyNote>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export { ScholiaSourceWorkbench };
export type { ScholiaSourceWorkbenchProps, ScholiaWorkbenchNote };

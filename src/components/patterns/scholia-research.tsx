"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type MarginaliaNote = {
  id: React.Key;
  locator?: React.ReactNode;
  label?: React.ReactNode;
  children: React.ReactNode;
};

type MarginaliaRailProps = React.ComponentProps<"aside"> & {
  notes: readonly MarginaliaNote[];
  title?: React.ReactNode;
};

function MarginaliaRail({ notes, title = "Marginalia", className, ...props }: MarginaliaRailProps) {
  return (
    <aside
      data-slot="marginalia-rail"
      className={cn(
        "grid content-start gap-3 border-l border-[var(--document-margin-note)] pl-4 font-body",
        className,
      )}
      {...props}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {notes.map((note) => (
        <article key={note.id} className="grid gap-1 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--document-annotation)]">{note.label ?? "Note"}</span>
            {note.locator ? <span className="text-muted-foreground">{note.locator}</span> : null}
          </div>
          <div>{note.children}</div>
        </article>
      ))}
    </aside>
  );
}

type CitationTrailItem = {
  id: React.Key;
  author: React.ReactNode;
  work: React.ReactNode;
  locator?: React.ReactNode;
  relation?: React.ReactNode;
  href?: string;
};

type CitationTrailProps = React.ComponentProps<"ol"> & {
  items: readonly CitationTrailItem[];
};

function CitationTrail({ items, className, ...props }: CitationTrailProps) {
  return (
    <ol
      data-slot="citation-trail"
      className={cn("flex flex-wrap items-stretch gap-1 font-body text-sm", className)}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <li className="min-w-0 rounded-[var(--ui-radius-control)] border border-[var(--document-citation)] bg-card px-2.5 py-1.5">
            {item.href ? (
              <a href={item.href} className="font-semibold underline-offset-4 hover:underline">
                {item.author}
              </a>
            ) : (
              <span className="font-semibold">{item.author}</span>
            )}
            <span className="text-muted-foreground">, {item.work}</span>
            {item.locator ? <span className="text-muted-foreground"> {item.locator}</span> : null}
          </li>
          {index < items.length - 1 ? (
            <li aria-hidden="true" className="grid place-items-center px-1 text-xs text-muted-foreground">
              {item.relation ?? "→"}
            </li>
          ) : null}
        </React.Fragment>
      ))}
    </ol>
  );
}

type InterpretationReading = {
  id: React.Key;
  label: React.ReactNode;
  source?: React.ReactNode;
  children: React.ReactNode;
  preferred?: boolean;
};

type InterpretationCompareProps = React.ComponentProps<"div"> & {
  readings: readonly InterpretationReading[];
};

function InterpretationCompare({ readings, className, ...props }: InterpretationCompareProps) {
  return (
    <div data-slot="interpretation-compare" className={cn("grid gap-3 md:grid-cols-2", className)} {...props}>
      {readings.map((reading) => (
        <article
          key={reading.id}
          data-preferred={reading.preferred ? "true" : undefined}
          className={cn(
            "grid content-start gap-2 rounded-[var(--ui-radius-surface)] border bg-card p-4 font-body",
            reading.preferred && "border-[var(--document-citation)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base font-semibold">{reading.label}</h3>
            {reading.preferred ? (
              <span className="rounded-full border border-[var(--document-citation)] px-2 py-0.5 text-xs">
                Preferred
              </span>
            ) : null}
          </div>
          <div className="text-sm leading-relaxed">{reading.children}</div>
          {reading.source ? <footer className="text-xs text-muted-foreground">{reading.source}</footer> : null}
        </article>
      ))}
    </div>
  );
}

type PassageNavigatorProps = React.ComponentProps<"nav"> & {
  work?: React.ReactNode;
  book?: React.ReactNode;
  chapter?: React.ReactNode;
  section?: React.ReactNode;
  locator?: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
};

function PassageNavigator({
  work,
  book,
  chapter,
  section,
  locator,
  onPrevious,
  onNext,
  className,
  ...props
}: PassageNavigatorProps) {
  const crumbs = [work, book, chapter, section].filter(Boolean);
  return (
    <nav
      data-slot="passage-navigator"
      aria-label="Passage navigation"
      className={cn("flex flex-wrap items-center gap-2 border-y py-2 font-body text-sm", className)}
      {...props}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!onPrevious}
        className="h-8 rounded-[var(--ui-radius-control)] border px-2 disabled:opacity-40"
      >
        Previous
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {crumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 ? <span aria-hidden="true" className="text-muted-foreground">/</span> : null}
              <span className="truncate">{crumb}</span>
            </React.Fragment>
          ))}
        </div>
        {locator ? <div className="text-xs text-muted-foreground">{locator}</div> : null}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        className="h-8 rounded-[var(--ui-radius-control)] border px-2 disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

type WitnessMatrixRow = {
  id: React.Key;
  lemma: React.ReactNode;
  readings: Readonly<Record<string, React.ReactNode>>;
};

type WitnessMatrixProps = React.ComponentProps<"div"> & {
  witnesses: readonly string[];
  rows: readonly WitnessMatrixRow[];
  caption?: React.ReactNode;
};

function WitnessMatrix({ witnesses, rows, caption, className, ...props }: WitnessMatrixProps) {
  return (
    <div
      data-slot="witness-matrix"
      className={cn(
        "overflow-x-auto rounded-[var(--ui-radius-surface)] border bg-card font-body",
        className,
      )}
      {...props}
    >
      <table className="w-full border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-muted/45">
            <th scope="col" className="border-b px-2 py-1.5 text-left text-xs">Lemma</th>
            {witnesses.map((witness) => (
              <th
                key={witness}
                scope="col"
                className="border-b border-l px-2 py-1.5 text-left text-xs font-semibold"
              >
                {witness}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <th
                scope="row"
                className="px-2 py-1.5 text-left font-medium text-[var(--document-annotation)]"
              >
                {row.lemma}
              </th>
              {witnesses.map((witness) => (
                <td key={witness} className="border-l px-2 py-1.5">{row.readings[witness] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type LemmaAnchorProps = React.ComponentProps<"mark"> & {
  lemmaId?: string;
  noteCount?: number;
  active?: boolean;
};

function LemmaAnchor({ lemmaId, noteCount, active = false, className, children, ...props }: LemmaAnchorProps) {
  return (
    <mark
      data-slot="lemma-anchor"
      data-lemma-id={lemmaId}
      data-active={active ? "true" : undefined}
      className={cn(
        "relative rounded-sm bg-[var(--document-highlight)] px-0.5 text-inherit",
        active && "outline-2 outline-offset-2 outline-[var(--document-selection)]",
        className,
      )}
      {...props}
    >
      {children}
      {noteCount ? (
        <sup className="ml-0.5 font-sans text-[0.65em] font-semibold text-[var(--document-citation)]">{noteCount}</sup>
      ) : null}
    </mark>
  );
}

export { CitationTrail, InterpretationCompare, LemmaAnchor, MarginaliaRail, PassageNavigator, WitnessMatrix };
export type {
  CitationTrailItem,
  CitationTrailProps,
  InterpretationCompareProps,
  InterpretationReading,
  LemmaAnchorProps,
  MarginaliaNote,
  MarginaliaRailProps,
  PassageNavigatorProps,
  WitnessMatrixProps,
  WitnessMatrixRow,
};

"use client";

import * as React from "react";

import { cn } from "@/registry/default/lib/cn";

type ApparatusEntryData = {
  id: string;
  witness: React.ReactNode;
  reading: React.ReactNode;
  locator?: React.ReactNode;
  note?: React.ReactNode;
};

type ApparatusListProps = React.ComponentPropsWithoutRef<"ol"> & {
  entries?: readonly ApparatusEntryData[];
};

type ApparatusEntryProps = React.ComponentPropsWithoutRef<"li"> & {
  entry?: ApparatusEntryData;
};

type ApparatusWitnessProps = React.ComponentPropsWithoutRef<"span">;

type ApparatusReadingProps = React.ComponentPropsWithoutRef<"span">;

type ApparatusNoteProps = React.ComponentPropsWithoutRef<"span">;

function ApparatusList({ entries, className, children, ...props }: ApparatusListProps) {
  return (
    <ol
      data-slot="apparatus-list"
      className={cn("grid divide-y divide-border/60 border-y border-border/60", className)}
      {...props}
    >
      {children ?? entries?.map((entry) => <ApparatusEntry key={entry.id} entry={entry} />)}
    </ol>
  );
}

function ApparatusEntry({ entry, className, children, ...props }: ApparatusEntryProps) {
  return (
    <li
      data-slot="apparatus-entry"
      className={cn(
        "grid min-w-0 gap-1 py-2.5 text-sm sm:grid-cols-[minmax(5rem,auto)_minmax(0,1fr)] sm:gap-x-4",
        className,
      )}
      {...props}
    >
      {children ??
        (entry ? (
          <>
            <ApparatusWitness>{entry.witness}</ApparatusWitness>
            <div className="grid min-w-0 gap-1">
              <ApparatusReading>{entry.reading}</ApparatusReading>
              {entry.locator || entry.note ? (
                <ApparatusNote>
                  {entry.locator}
                  {entry.locator && entry.note ? " · " : null}
                  {entry.note}
                </ApparatusNote>
              ) : null}
            </div>
          </>
        ) : null)}
    </li>
  );
}

function ApparatusWitness({ className, ...props }: ApparatusWitnessProps) {
  return (
    <span
      data-slot="apparatus-witness"
      className={cn(
        "font-mono text-xs font-semibold leading-6 text-[var(--document-citation)]",
        className,
      )}
      {...props}
    />
  );
}

function ApparatusReading({ className, ...props }: ApparatusReadingProps) {
  return (
    <span
      data-slot="apparatus-reading"
      className={cn("font-body leading-6 text-foreground", className)}
      {...props}
    />
  );
}

function ApparatusNote({ className, ...props }: ApparatusNoteProps) {
  return (
    <span
      data-slot="apparatus-note"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

export { ApparatusEntry, ApparatusList, ApparatusNote, ApparatusReading, ApparatusWitness };
export type {
  ApparatusEntryData,
  ApparatusEntryProps,
  ApparatusListProps,
  ApparatusNoteProps,
  ApparatusReadingProps,
  ApparatusWitnessProps,
};

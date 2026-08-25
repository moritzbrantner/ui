"use client";

import * as React from "react";

import { cn } from "@/registry/default/lib/cn";

type DocumentPageProps = React.ComponentProps<"article"> & {
  pageNumber?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
};

function DocumentPage({
  pageNumber,
  header,
  footer,
  className,
  children,
  ...props
}: DocumentPageProps) {
  return (
    <article
      data-slot="document-page"
      className={cn(
        "mx-auto grid min-h-[36rem] w-full max-w-[46rem] grid-rows-[auto_1fr_auto] gap-5 border bg-card p-8 font-body text-card-foreground shadow-[var(--ui-shadow-surface)]",
        className,
      )}
      style={{
        backgroundImage: "linear-gradient(var(--document-ruled-background) 1px, transparent 1px)",
        backgroundSize: "100% 1.5rem",
      }}
      {...props}
    >
      <header className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>{header}</span>
        {pageNumber ? <span className="tabular-nums">p. {pageNumber}</span> : null}
      </header>
      <div className="min-w-0 leading-7">{children}</div>
      <footer className="border-t pt-3 text-xs text-muted-foreground">{footer}</footer>
    </article>
  );
}

type PageThumbnail = {
  id: React.Key;
  label: React.ReactNode;
  thumbnail?: React.ReactNode;
};

type PageThumbnailRailProps = React.ComponentProps<"nav"> & {
  pages: readonly PageThumbnail[];
  selectedId?: React.Key | null;
  onSelect?: (id: React.Key) => void;
};

function PageThumbnailRail({
  pages,
  selectedId = null,
  onSelect,
  className,
  ...props
}: PageThumbnailRailProps) {
  return (
    <nav
      data-slot="page-thumbnail-rail"
      aria-label="Document pages"
      className={cn("grid content-start gap-2", className)}
      {...props}
    >
      {pages.map((page) => {
        const selected = page.id === selectedId;
        return (
          <button
            key={page.id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onSelect?.(page.id)}
            className={cn(
              "grid gap-1 rounded-[var(--ui-radius-control)] border p-1.5 text-left text-xs",
              selected && "border-[var(--document-selection)] bg-[var(--document-highlight)]",
            )}
          >
            <span className="grid aspect-[3/4] place-items-center overflow-hidden bg-card text-muted-foreground">
              {page.thumbnail ?? page.label}
            </span>
            <span className="truncate">{page.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function splitLines(value: string) {
  return value.replace(/\r\n/g, "\n").split("\n");
}

type OcrDiffProps = React.ComponentProps<"div"> & {
  original: string;
  extracted: string;
  originalLabel?: React.ReactNode;
  extractedLabel?: React.ReactNode;
};

function OcrDiff({
  original,
  extracted,
  originalLabel = "Original",
  extractedLabel = "OCR",
  className,
  ...props
}: OcrDiffProps) {
  const originalLines = splitLines(original);
  const extractedLines = splitLines(extracted);
  const lineCount = Math.max(originalLines.length, extractedLines.length);
  const columns = [
    { label: originalLabel, lines: originalLines, other: extractedLines },
    { label: extractedLabel, lines: extractedLines, other: originalLines },
  ];

  return (
    <div
      data-slot="ocr-diff"
      className={cn(
        "grid overflow-hidden rounded-[var(--ui-radius-surface)] border md:grid-cols-2",
        className,
      )}
      {...props}
    >
      {columns.map((column, columnIndex) => (
        <section
          key={columnIndex}
          className="min-w-0 border-b last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
        >
          <header className="border-b bg-muted/45 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {column.label}
          </header>
          <div className="grid font-mono text-xs leading-6">
            {Array.from({ length: lineCount }, (_, index) => {
              const line = column.lines[index] ?? "";
              const differs = line !== (column.other[index] ?? "");
              return (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-[2.5rem_minmax(0,1fr)] border-b last:border-b-0",
                    differs && "bg-[var(--document-highlight)]",
                  )}
                >
                  <span className="border-r px-2 text-right text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-words px-2">{line || " "}</span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

type TranslationPairProps = React.ComponentProps<"div"> & {
  source: React.ReactNode;
  translation: React.ReactNode;
  sourceLanguage?: React.ReactNode;
  translationLanguage?: React.ReactNode;
};

function TranslationPair({
  source,
  translation,
  sourceLanguage = "Source",
  translationLanguage = "Translation",
  className,
  ...props
}: TranslationPairProps) {
  return (
    <div
      data-slot="translation-pair"
      className={cn(
        "grid gap-5 rounded-[var(--ui-radius-surface)] border bg-card p-5 font-body md:grid-cols-2",
        className,
      )}
      {...props}
    >
      <section className="grid content-start gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {sourceLanguage}
        </h3>
        <div className="leading-7">{source}</div>
      </section>
      <section className="grid content-start gap-2 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {translationLanguage}
        </h3>
        <div className="leading-7">{translation}</div>
      </section>
    </div>
  );
}

type DocumentOutlineItem = {
  id: string;
  label: React.ReactNode;
  level?: number;
  page?: React.ReactNode;
};

type DocumentOutlineProps = React.ComponentProps<"nav"> & {
  items: readonly DocumentOutlineItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

function DocumentOutline({
  items,
  activeId = null,
  onSelect,
  className,
  ...props
}: DocumentOutlineProps) {
  return (
    <nav
      data-slot="document-outline"
      aria-label="Document outline"
      className={cn("grid gap-0.5 font-body text-sm", className)}
      {...props}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "location" : undefined}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "flex min-w-0 items-center justify-between gap-3 rounded-[var(--ui-radius-control)] py-1.5 pr-2 text-left hover:bg-muted/50",
              active && "bg-[var(--document-selection)]",
            )}
            style={{ paddingLeft: `${0.5 + Math.max((item.level ?? 1) - 1, 0) * 0.75}rem` }}
          >
            <span className="truncate">{item.label}</span>
            {item.page ? (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {item.page}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

type AnnotationEntry = {
  id: React.Key;
  author?: React.ReactNode;
  timestamp?: React.ReactNode;
  body: React.ReactNode;
};

type AnnotationThreadProps = React.ComponentProps<"section"> & {
  entries: readonly AnnotationEntry[];
  title?: React.ReactNode;
};

function AnnotationThread({
  entries,
  title = "Annotations",
  className,
  ...props
}: AnnotationThreadProps) {
  return (
    <section
      data-slot="annotation-thread"
      className={cn(
        "grid gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-4 font-body",
        className,
      )}
      {...props}
    >
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <ol className="grid gap-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="grid gap-1 border-l-2 border-[var(--document-annotation)] pl-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold">{entry.author ?? "Note"}</span>
              {entry.timestamp ? (
                <time className="text-muted-foreground">{entry.timestamp}</time>
              ) : null}
            </div>
            <div className="text-sm leading-relaxed">{entry.body}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export {
  AnnotationThread,
  DocumentOutline,
  DocumentPage,
  OcrDiff,
  PageThumbnailRail,
  TranslationPair,
};
export type {
  AnnotationEntry,
  AnnotationThreadProps,
  DocumentOutlineItem,
  DocumentOutlineProps,
  DocumentPageProps,
  OcrDiffProps,
  PageThumbnail,
  PageThumbnailRailProps,
  TranslationPairProps,
};

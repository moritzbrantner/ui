"use client";

import * as React from "react";
import {
  AlertTriangleIcon,
  AudioLinesIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileTextIcon,
  InfoIcon,
  LinkIcon,
  TextQuoteIcon,
} from "lucide-react";

import { cn } from "../../lib/cn";

type CitationStatus = "cited" | "supporting" | "disputed" | "missing";
type CitationKind = "text" | "audio" | "youtube" | "pdf" | "web";
type CitationTextPartType = "text" | "hidden" | "added" | "highlight";

type CitationTextPart = {
  type?: CitationTextPartType;
  text: React.ReactNode;
  marker?: React.ReactNode;
};

type CitationContextSource =
  | CitationTextContextSource
  | CitationAudioContextSource
  | CitationYouTubeContextSource
  | CitationPdfContextSource;

type CitationTextContextSource = {
  type: "text";
  text: React.ReactNode;
  citedText?: React.ReactNode;
  parts?: readonly CitationTextPart[];
  startText?: string;
  endText?: string;
  label?: React.ReactNode;
};

type CitationAudioContextSource = {
  type: "audio";
  src: string;
  title?: React.ReactNode;
  startTime?: number;
  endTime?: number;
  transcript?: React.ReactNode;
};

type CitationYouTubeContextSource = {
  type: "youtube";
  videoId?: string;
  url?: string;
  title?: React.ReactNode;
  startTime?: number;
};

type CitationPdfContextSource = {
  type: "pdf";
  src: string;
  title?: React.ReactNode;
  page?: number;
  search?: string;
};

type CitationData = {
  id?: string;
  label?: React.ReactNode;
  kind?: CitationKind;
  title: React.ReactNode;
  authors?: readonly React.ReactNode[];
  source?: React.ReactNode;
  publisher?: React.ReactNode;
  issued?: React.ReactNode;
  accessed?: React.ReactNode;
  locator?: React.ReactNode;
  url?: string;
  excerpt?: React.ReactNode;
  context?: React.ReactNode;
  contextSource?: CitationContextSource;
  citedText?: React.ReactNode;
  fullText?: React.ReactNode;
  textParts?: readonly CitationTextPart[];
  contextStartText?: string;
  contextEndText?: string;
  note?: React.ReactNode;
  status?: CitationStatus;
};

export type CitationListProps = React.ComponentProps<"ol"> & {
  citations?: readonly CitationData[];
  compact?: boolean;
};

export type CitationItemProps = React.ComponentProps<"li"> & {
  citation?: CitationData;
  compact?: boolean;
};

export type CitationReferenceProps = React.ComponentProps<"sup"> & {
  label: React.ReactNode;
  href?: string;
};

export type CitationStatusBadgeProps = React.ComponentProps<"span"> & {
  status: CitationStatus;
};

export type CitationExcerptProps = React.ComponentProps<"blockquote"> & {
  context?: React.ReactNode;
  contextSource?: CitationContextSource;
  defaultContextOpen?: boolean;
  contextLabel?: React.ReactNode;
  collapseContextLabel?: React.ReactNode;
};

export type CitationTextContextProps = React.ComponentProps<"div"> & {
  text?: React.ReactNode;
  citedText?: React.ReactNode;
  parts?: readonly CitationTextPart[];
  startText?: string;
  endText?: string;
  label?: React.ReactNode;
  active?: boolean;
};

export type CitationAudioContextProps = Omit<React.ComponentProps<"div">, "title"> & {
  src: string;
  title?: React.ReactNode;
  startTime?: number;
  endTime?: number;
  transcript?: React.ReactNode;
  active?: boolean;
  audioProps?: Omit<React.ComponentProps<"audio">, "children" | "src">;
};

export type CitationYouTubeContextProps = Omit<React.ComponentProps<"div">, "title"> & {
  videoId?: string;
  url?: string;
  title?: React.ReactNode;
  startTime?: number;
  active?: boolean;
  iframeProps?: Omit<React.ComponentProps<"iframe">, "src" | "title">;
};

export type CitationPdfContextProps = Omit<React.ComponentProps<"div">, "title"> & {
  src: string;
  title?: React.ReactNode;
  page?: number;
  search?: string;
  active?: boolean;
  iframeProps?: Omit<React.ComponentProps<"iframe">, "src" | "title">;
};

const statusLabels: Record<CitationStatus, string> = {
  cited: "Cited",
  disputed: "Disputed",
  missing: "Missing",
  supporting: "Supporting",
};

const statusClassNames: Record<CitationStatus, string> = {
  cited: "border-primary/30 bg-primary/10 text-primary",
  disputed:
    "border-destructive/35 bg-destructive/10 text-red-700 dark:bg-destructive/20 dark:text-red-300",
  missing: "border-border bg-muted text-muted-foreground",
  supporting: "border-primary/30 bg-primary/10 text-primary",
};

function CitationList({
  citations,
  compact = false,
  className,
  children,
  ...props
}: CitationListProps) {
  return (
    <ol
      data-slot="citation-list"
      data-compact={compact ? "true" : undefined}
      className={cn("grid gap-3 text-sm", compact && "gap-2", className)}
      {...props}
    >
      {children ??
        citations?.map((citation, index) => (
          <CitationItem
            key={citation.id ?? index}
            citation={{
              ...citation,
              label: citation.label ?? index + 1,
            }}
            compact={compact}
          />
        ))}
    </ol>
  );
}

function CitationItem({
  citation,
  compact = false,
  className,
  children,
  ...props
}: CitationItemProps) {
  return (
    <li
      data-slot="citation-item"
      data-kind={citation ? getCitationKind(citation) : undefined}
      data-status={citation?.status}
      data-compact={compact ? "true" : undefined}
      className={cn(
        "grid gap-3 rounded-md border bg-card p-4 text-card-foreground",
        compact && "grid-cols-[auto_1fr] gap-3 p-3",
        className,
      )}
      {...props}
    >
      {children ??
        (citation ? (
          <>
            <CitationHeader>
              <CitationMarker>{citation.label}</CitationMarker>
              <div className="min-w-0">
                <CitationTitle href={citation.url}>{citation.title}</CitationTitle>
                <CitationMeta>{formatCitationMeta(citation)}</CitationMeta>
              </div>
              {citation.status ? <CitationStatusBadge status={citation.status} /> : null}
            </CitationHeader>
            {getCitationExcerpt(citation) ||
            citation.context ||
            getCitationContextSource(citation) ? (
              <CitationExcerpt
                context={citation.context}
                contextSource={getCitationContextSource(citation)}
              >
                {getCitationExcerpt(citation)}
              </CitationExcerpt>
            ) : null}
            {citation.note ? <CitationNote>{citation.note}</CitationNote> : null}
          </>
        ) : null)}
    </li>
  );
}

function CitationReference({ label, href, className, children, ...props }: CitationReferenceProps) {
  const content = children ?? label;

  return (
    <sup
      data-slot="citation-reference"
      className={cn("align-super text-[0.75em] leading-none", className)}
      {...props}
    >
      {href ? (
        <a
          href={href}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border bg-muted px-2 font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {content}
        </a>
      ) : (
        <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border bg-muted px-2 font-medium text-muted-foreground">
          {content}
        </span>
      )}
    </sup>
  );
}

function CitationHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-header"
      className={cn("grid grid-cols-[auto_1fr_auto] items-start gap-3", className)}
      {...props}
    />
  );
}

function CitationMarker({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="citation-marker"
      className={cn(
        "grid min-h-7 min-w-7 place-items-center rounded-md border bg-muted px-2 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CitationTitle({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { href?: string }) {
  if (href) {
    return (
      <a
        data-slot="citation-title"
        href={href}
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 font-medium leading-5 text-foreground underline-offset-4 hover:underline",
          className,
        )}
        {...props}
      >
        <span className="min-w-0">{children}</span>
        <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </a>
    );
  }

  return (
    <span
      data-slot="citation-title"
      className={cn("block min-w-0 font-medium leading-5 text-foreground", className)}
    >
      {children}
    </span>
  );
}

function CitationMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-meta"
      className={cn(
        "mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CitationMetaItem({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="citation-meta-item"
      className={cn("inline-flex min-w-0 items-center gap-1", className)}
      {...props}
    />
  );
}

function CitationExcerpt({
  className,
  children,
  context,
  contextSource,
  defaultContextOpen = false,
  contextLabel = "Show context",
  collapseContextLabel = "Hide context",
  ...props
}: CitationExcerptProps) {
  const contextId = React.useId();
  const [contextOpen, setContextOpen] = React.useState(defaultContextOpen);
  const hasContext =
    contextSource !== undefined || (context !== undefined && context !== null && context !== false);

  return (
    <blockquote
      data-slot="citation-excerpt"
      className={cn(
        "border-l-2 border-border pl-3 text-sm leading-6 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children ? children : null}
      {hasContext ? (
        <>
          <button
            type="button"
            aria-controls={contextId}
            aria-expanded={contextOpen}
            className="mt-2 flex min-h-10 w-fit items-center gap-1 rounded-md px-2 text-xs font-medium text-primary outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50"
            onClick={() => setContextOpen((open) => !open)}
          >
            {contextOpen ? collapseContextLabel : contextLabel}
            <ChevronDownIcon
              className={cn("size-3.5 transition-transform", contextOpen && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          {contextOpen ? (
            <CitationContext id={contextId}>
              {contextSource ? (
                <CitationContextSourceView source={contextSource} active={contextOpen} />
              ) : null}
              {context ? <CitationContextText>{context}</CitationContextText> : null}
            </CitationContext>
          ) : null}
        </>
      ) : null}
    </blockquote>
  );
}

function CitationContext({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-context"
      className={cn("mt-2 rounded-md bg-muted/60 px-3 py-2 text-xs leading-5", className)}
      {...props}
    />
  );
}

function CitationContextText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-context-text"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

function CitationTextContext({
  className,
  children,
  text,
  citedText,
  parts,
  startText,
  endText,
  label,
  active = true,
  ...props
}: CitationTextContextProps) {
  const citedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (active) {
      scrollCitationTargetIntoView(citedRef.current);
    }
  }, [active]);

  const content =
    children ?? renderTextContext({ text, citedText, parts, startText, endText }, citedRef);

  return (
    <div
      data-slot="citation-text-context"
      className={cn("grid gap-2 text-xs leading-5 text-muted-foreground", className)}
      {...props}
    >
      {label ? <div className="font-medium text-foreground">{label}</div> : null}
      <div>{content}</div>
    </div>
  );
}

function CitationTextParts({
  parts,
  mode = "excerpt",
}: {
  parts: readonly CitationTextPart[];
  mode?: "excerpt" | "context";
}) {
  return (
    <>
      {parts.map((part, index) => (
        <CitationTextPartView key={index} part={part} mode={mode} />
      ))}
    </>
  );
}

function CitationTextPartView({
  part,
  mode,
}: {
  part: CitationTextPart;
  mode: "excerpt" | "context";
}) {
  const type = part.type ?? "text";

  if (type === "hidden") {
    if (mode === "excerpt") {
      return (
        <span
          data-slot="citation-text-omission"
          className="rounded-sm bg-muted px-1 font-medium text-muted-foreground"
        >
          {part.marker ?? "[...]"}
        </span>
      );
    }

    return (
      <span
        data-slot="citation-text-hidden"
        className="inline rounded-sm bg-muted px-1 text-muted-foreground duration-300 animate-in fade-in-0 slide-in-from-bottom-1"
      >
        {part.text}
      </span>
    );
  }

  if (type === "added") {
    return (
      <span data-slot="citation-text-added" className="font-medium text-foreground">
        [{part.text}]
      </span>
    );
  }

  if (type === "highlight") {
    return (
      <mark
        data-slot="citation-text-highlight"
        className="rounded-sm bg-primary/15 px-0.5 text-foreground"
      >
        {part.text}
      </mark>
    );
  }

  return <>{part.text}</>;
}

function CitationAudioContext({
  className,
  src,
  title,
  startTime,
  endTime,
  transcript,
  active = true,
  audioProps,
  ...props
}: CitationAudioContextProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (!active || !audioRef.current) {
      return;
    }

    audioRef.current.load();

    if (typeof startTime === "number") {
      try {
        audioRef.current.currentTime = startTime;
      } catch {
        // Some browsers only allow seeking after metadata loads.
      }
    }
  }, [active, startTime]);

  return (
    <div data-slot="citation-audio-context" className={cn("grid gap-2", className)} {...props}>
      <CitationMediaHeader icon={<AudioLinesIcon className="size-3.5" aria-hidden="true" />}>
        {title ?? "Audio source"}
        {typeof startTime === "number" ? (
          <span className="font-normal text-muted-foreground">
            {formatCitationTimestamp(startTime)}
            {typeof endTime === "number" ? `-${formatCitationTimestamp(endTime)}` : null}
          </span>
        ) : null}
      </CitationMediaHeader>
      <audio
        ref={audioRef}
        controls
        preload={active ? "metadata" : "none"}
        src={src}
        className="w-full"
        {...audioProps}
      />
      {transcript ? <CitationContextText>{transcript}</CitationContextText> : null}
    </div>
  );
}

function CitationYouTubeContext({
  className,
  videoId,
  url,
  title = "YouTube video",
  startTime,
  active = true,
  iframeProps,
  ...props
}: CitationYouTubeContextProps) {
  const embedSrc = getYouTubeEmbedUrl({ videoId, url, startTime });

  return (
    <div data-slot="citation-youtube-context" className={cn("grid gap-2", className)} {...props}>
      <CitationMediaHeader icon={<FileVideoIcon className="size-3.5" aria-hidden="true" />}>
        {title}
        {typeof startTime === "number" ? (
          <span className="font-normal text-muted-foreground">
            {formatCitationTimestamp(startTime)}
          </span>
        ) : null}
      </CitationMediaHeader>
      {embedSrc && active ? (
        <iframe
          title={String(title)}
          src={embedSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full rounded-md border bg-background"
          {...iframeProps}
        />
      ) : null}
    </div>
  );
}

function CitationPdfContext({
  className,
  src,
  title = "PDF source",
  page,
  search,
  active = true,
  iframeProps,
  ...props
}: CitationPdfContextProps) {
  const framedSrc = getPdfViewerUrl(src, page, search);

  return (
    <div data-slot="citation-pdf-context" className={cn("grid gap-2", className)} {...props}>
      <CitationMediaHeader icon={<FileTextIcon className="size-3.5" aria-hidden="true" />}>
        {title}
        {page ? <span className="font-normal text-muted-foreground">p. {page}</span> : null}
      </CitationMediaHeader>
      {active ? (
        <iframe
          title={String(title)}
          src={framedSrc}
          className="h-80 w-full rounded-md border bg-background"
          {...iframeProps}
        />
      ) : null}
    </div>
  );
}

function CitationContextSourceView({
  source,
  active,
}: {
  source: CitationContextSource;
  active: boolean;
}) {
  if (source.type === "text") {
    return (
      <CitationTextContext
        text={source.text}
        citedText={source.citedText}
        parts={source.parts}
        startText={source.startText}
        endText={source.endText}
        label={source.label}
        active={active}
      />
    );
  }

  if (source.type === "audio") {
    return (
      <CitationAudioContext
        src={source.src}
        title={source.title}
        startTime={source.startTime}
        endTime={source.endTime}
        transcript={source.transcript}
        active={active}
      />
    );
  }

  if (source.type === "youtube") {
    return (
      <CitationYouTubeContext
        videoId={source.videoId}
        url={source.url}
        title={source.title}
        startTime={source.startTime}
        active={active}
      />
    );
  }

  return (
    <CitationPdfContext
      src={source.src}
      title={source.title}
      page={source.page}
      search={source.search}
      active={active}
    />
  );
}

function CitationMediaHeader({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon: React.ReactNode }) {
  return (
    <div
      data-slot="citation-media-header"
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs font-medium text-foreground",
        className,
      )}
      {...props}
    >
      <span className="inline-flex size-6 items-center justify-center rounded-md border bg-background text-muted-foreground">
        {icon}
      </span>
      {children}
    </div>
  );
}

function CitationNote({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="citation-note"
      className={cn(
        "rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CitationStatusBadge({ status, className, children, ...props }: CitationStatusBadgeProps) {
  const Icon =
    status === "disputed" ? AlertTriangleIcon : status === "missing" ? InfoIcon : CheckCircle2Icon;

  return (
    <span
      data-slot="citation-status-badge"
      data-status={status}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
        statusClassNames[status],
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children ?? statusLabels[status]}
    </span>
  );
}

function formatCitationMeta(citation: CitationData) {
  const items: React.ReactNode[] = [];
  const kind = getCitationKind(citation);

  if (kind) {
    items.push(formatCitationKind(kind));
  }

  if (citation.authors?.length) {
    items.push(formatCitationAuthors(citation.authors));
  }
  if (citation.source) {
    items.push(
      <>
        <FileTextIcon className="size-3.5 shrink-0" aria-hidden="true" />
        {citation.source}
      </>,
    );
  }
  if (citation.publisher) {
    items.push(citation.publisher);
  }
  if (citation.issued) {
    items.push(citation.issued);
  }
  if (citation.locator) {
    items.push(citation.locator);
  }
  if (citation.accessed) {
    items.push(<>Accessed {citation.accessed}</>);
  }
  if (citation.url) {
    items.push(
      <>
        <LinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
        URL
      </>,
    );
  }

  return items.map((item, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <span aria-hidden="true">/</span> : null}
      <CitationMetaItem>{item}</CitationMetaItem>
    </React.Fragment>
  ));
}

function formatCitationKind(kind: CitationKind) {
  const Icon =
    kind === "audio"
      ? FileAudioIcon
      : kind === "youtube"
        ? FileVideoIcon
        : kind === "text"
          ? TextQuoteIcon
          : kind === "pdf"
            ? FileTextIcon
            : LinkIcon;

  const label =
    kind === "youtube" ? "YouTube" : kind === "pdf" ? "PDF" : kind[0].toUpperCase() + kind.slice(1);

  return (
    <>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </>
  );
}

function getCitationKind(citation: CitationData): CitationKind | undefined {
  if (citation.kind) {
    return citation.kind;
  }

  if (citation.contextSource) {
    return citation.contextSource.type;
  }

  if (citation.fullText || citation.citedText || citation.textParts) {
    return "text";
  }

  if (citation.url) {
    return "web";
  }

  return undefined;
}

function getCitationExcerpt(citation: CitationData) {
  if (citation.textParts) {
    return <CitationTextParts parts={citation.textParts} />;
  }

  return citation.excerpt ?? citation.citedText;
}

function getCitationContextSource(citation: CitationData): CitationContextSource | undefined {
  if (citation.contextSource) {
    return citation.contextSource;
  }

  if (citation.fullText || citation.textParts) {
    return {
      type: "text",
      text: citation.fullText,
      citedText: getCitationExcerpt(citation),
      parts: citation.textParts,
      startText: citation.contextStartText,
      endText: citation.contextEndText,
    };
  }

  return undefined;
}

function formatCitationAuthors(authors: readonly React.ReactNode[]) {
  return authors.map((author, index) => (
    <React.Fragment key={index}>
      {index > 0 ? ", " : null}
      {author}
    </React.Fragment>
  ));
}

function renderTextContext(
  {
    text,
    citedText,
    parts,
    startText,
    endText,
  }: {
    text: React.ReactNode;
    citedText: React.ReactNode;
    parts?: readonly CitationTextPart[];
    startText?: string;
    endText?: string;
  },
  citedRef: React.RefObject<HTMLElement | null>,
) {
  if (parts) {
    return <CitationTextParts parts={parts} mode="context" />;
  }

  const rangedText =
    typeof text === "string" ? getTextContextRange(text, startText, endText) : text;

  if (typeof rangedText === "string" && typeof citedText === "string") {
    const citationIndex = rangedText.indexOf(citedText);

    if (citationIndex >= 0) {
      return (
        <>
          {rangedText.slice(0, citationIndex)}
          <mark
            ref={citedRef}
            data-slot="citation-text-highlight"
            className="rounded-sm bg-primary/15 px-0.5 text-foreground"
          >
            {citedText}
          </mark>
          {rangedText.slice(citationIndex + citedText.length)}
        </>
      );
    }
  }

  return rangedText;
}

function getTextContextRange(text: string, startText?: string, endText?: string) {
  let startIndex = 0;
  let endIndex = text.length;

  if (startText) {
    const index = text.indexOf(startText);

    if (index >= 0) {
      startIndex = index;
    }
  }

  if (endText) {
    const index = text.indexOf(endText, startIndex);

    if (index >= 0) {
      endIndex = index + endText.length;
    }
  }

  return text.slice(startIndex, endIndex);
}

function scrollCitationTargetIntoView(element: HTMLElement | null) {
  if (!element || typeof element.scrollIntoView !== "function") {
    return;
  }

  try {
    element.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });
  } catch {
    element.scrollIntoView();
  }
}

function getYouTubeEmbedUrl({
  videoId,
  url,
  startTime,
}: {
  videoId?: string;
  url?: string;
  startTime?: number;
}) {
  const id = videoId ?? getYouTubeVideoId(url);

  if (!id) {
    return undefined;
  }

  const params = new URLSearchParams({ rel: "0" });

  if (typeof startTime === "number") {
    params.set("start", String(Math.max(0, Math.floor(startTime))));
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function getYouTubeVideoId(url?: string) {
  if (!url) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "") || undefined;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") ?? parsedUrl.pathname.split("/").pop() ?? undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getPdfViewerUrl(src: string, page?: number, search?: string) {
  const fragments: string[] = [];

  if (page) {
    fragments.push(`page=${page}`);
  }

  if (search) {
    fragments.push(`search=${encodeURIComponent(search)}`);
  }

  if (!fragments.length) {
    return src;
  }

  return `${src}#${fragments.join("&")}`;
}

function formatCitationTimestamp(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export {
  CitationExcerpt,
  CitationAudioContext,
  CitationContext,
  CitationContextText,
  CitationHeader,
  CitationItem,
  CitationList,
  CitationMarker,
  CitationMeta,
  CitationMetaItem,
  CitationNote,
  CitationPdfContext,
  CitationReference,
  CitationStatusBadge,
  CitationTextContext,
  CitationTitle,
  CitationYouTubeContext,
  type CitationAudioContextSource,
  type CitationData,
  type CitationContextSource,
  type CitationKind,
  type CitationPdfContextSource,
  type CitationStatus,
  type CitationTextPart,
  type CitationTextPartType,
  type CitationTextContextSource,
  type CitationYouTubeContextSource,
};

export type CitationContextProps = React.ComponentProps<typeof CitationContext>;
export type CitationContextTextProps = React.ComponentProps<typeof CitationContextText>;
export type CitationHeaderProps = React.ComponentProps<typeof CitationHeader>;
export type CitationMarkerProps = React.ComponentProps<typeof CitationMarker>;
export type CitationMetaProps = React.ComponentProps<typeof CitationMeta>;
export type CitationMetaItemProps = React.ComponentProps<typeof CitationMetaItem>;
export type CitationNoteProps = React.ComponentProps<typeof CitationNote>;
export type CitationTitleProps = React.ComponentProps<typeof CitationTitle>;

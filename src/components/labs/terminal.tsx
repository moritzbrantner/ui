import * as React from "react";

import { cn } from "../../lib/cn";

type TerminalLineVariant = "default" | "muted" | "success" | "warning" | "error" | "info";

const terminalLineVariantClasses: Record<TerminalLineVariant, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  success: "text-[var(--chart-2)]",
  warning: "text-[var(--chart-3)]",
  error: "text-destructive",
  info: "text-[var(--chart-1)]",
};

function Terminal({ className, ...props }: React.ComponentProps<"figure">) {
  return (
    <figure
      data-slot="terminal"
      className={cn(
        "group/terminal overflow-hidden rounded-[var(--ui-card-radius,var(--ui-radius-surface))] border border-border bg-card text-sm text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function TerminalHeader({ className, ...props }: React.ComponentProps<"figcaption">) {
  return (
    <figcaption
      data-slot="terminal-header"
      className={cn(
        "flex min-h-10 items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}

function TerminalControls({
  className,
  children,
  "aria-hidden": ariaHidden = true,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="terminal-controls"
      className={cn("flex shrink-0 items-center gap-1.5", className)}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children ?? (
        <>
          <span className="size-2.5 rounded-full bg-destructive" />
          <span className="size-2.5 rounded-full bg-[var(--chart-3)]" />
          <span className="size-2.5 rounded-full bg-[var(--chart-2)]" />
        </>
      )}
    </div>
  );
}

function TerminalTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="terminal-title"
      className={cn(
        "min-w-0 truncate font-mono text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TerminalActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="terminal-actions"
      className={cn("flex shrink-0 items-center gap-1.5", className)}
      {...props}
    />
  );
}

function TerminalContent({ className, ...props }: React.ComponentProps<"pre">) {
  return (
    <pre
      data-slot="terminal-content"
      className={cn(
        "max-h-96 overflow-auto p-3 font-mono text-xs leading-6 whitespace-pre",
        className,
      )}
      {...props}
    />
  );
}

function TerminalLine({
  className,
  variant = "default",
  wrap = false,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: TerminalLineVariant;
  wrap?: boolean;
}) {
  return (
    <span
      data-slot="terminal-line"
      data-variant={variant}
      className={cn(
        "block min-h-6",
        wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        terminalLineVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

function TerminalPrompt({ className, children = "$", ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="terminal-prompt"
      className={cn("mr-2 select-none text-[var(--chart-2)]", className)}
      {...props}
    >
      {children}
    </span>
  );
}

function TerminalCommand({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="terminal-command"
      className={cn("font-mono text-foreground", className)}
      {...props}
    />
  );
}

function TerminalOutput({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="terminal-output"
      className={cn("font-mono text-muted-foreground", className)}
      {...props}
    />
  );
}

function TerminalCursor({
  className,
  children = " ",
  "aria-hidden": ariaHidden = true,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="terminal-cursor"
      className={cn(
        "ml-1 inline-block h-4 w-2 animate-pulse bg-foreground align-[-0.125em]",
        className,
      )}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </span>
  );
}

export {
  Terminal,
  TerminalActions,
  TerminalCommand,
  TerminalContent,
  TerminalControls,
  TerminalCursor,
  TerminalHeader,
  TerminalLine,
  TerminalOutput,
  TerminalPrompt,
  TerminalTitle,
};
export type { TerminalLineVariant };

export type TerminalProps = React.ComponentProps<typeof Terminal>;
export type TerminalActionsProps = React.ComponentProps<typeof TerminalActions>;
export type TerminalCommandProps = React.ComponentProps<typeof TerminalCommand>;
export type TerminalContentProps = React.ComponentProps<typeof TerminalContent>;
export type TerminalControlsProps = React.ComponentProps<typeof TerminalControls>;
export type TerminalCursorProps = React.ComponentProps<typeof TerminalCursor>;
export type TerminalHeaderProps = React.ComponentProps<typeof TerminalHeader>;
export type TerminalLineProps = React.ComponentProps<typeof TerminalLine>;
export type TerminalOutputProps = React.ComponentProps<typeof TerminalOutput>;
export type TerminalPromptProps = React.ComponentProps<typeof TerminalPrompt>;
export type TerminalTitleProps = React.ComponentProps<typeof TerminalTitle>;

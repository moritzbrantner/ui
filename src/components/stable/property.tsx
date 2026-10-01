"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "./field";
import { Separator } from "./separator";

type PropertyRowProps = React.ComponentProps<typeof Field> & {
  label: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  descriptionId?: string;
  validationMessage?: React.ReactNode;
  validationId?: string;
};

type PropertySectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
} & (
    | { collapsible?: false; open?: never; defaultOpen?: never; onOpenChange?: never }
    | {
        collapsible: true;
        open?: boolean;
        defaultOpen?: boolean;
        onOpenChange?: (open: boolean) => void;
      }
  );

function PropertyRow({
  label,
  htmlFor,
  description,
  descriptionId,
  validationMessage,
  validationId,
  orientation = "responsive",
  children,
  className,
  ...props
}: PropertyRowProps) {
  const labelId = React.useId();
  return (
    <Field
      {...props}
      data-slot="property-row"
      orientation={orientation}
      aria-labelledby={htmlFor ? undefined : labelId}
      data-invalid={validationMessage ? true : undefined}
      className={cn("min-w-0", className)}
    >
      {htmlFor ? (
        <FieldLabel id={labelId} htmlFor={htmlFor} className="text-xs">
          {label}
        </FieldLabel>
      ) : (
        <FieldTitle id={labelId} className="text-xs">
          {label}
        </FieldTitle>
      )}
      <FieldContent className="min-w-0 gap-1.5">
        {children}
        {description ? (
          <FieldDescription id={descriptionId} className="text-xs">
            {description}
          </FieldDescription>
        ) : null}
        {validationMessage ? (
          <FieldError id={validationId} className="text-xs">
            {validationMessage}
          </FieldError>
        ) : null}
      </FieldContent>
    </Field>
  );
}

function PropertySection({
  title,
  description,
  collapsible = false,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  className,
  ...props
}: PropertySectionProps) {
  const headingId = React.useId();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const heading = (
    <>
      <span id={headingId} className="block text-sm font-medium">
        {title}
      </span>
      {description ? (
        <span className="block text-xs text-muted-foreground">{description}</span>
      ) : null}
    </>
  );
  const sectionClassName = cn("min-w-0", className);
  if (!collapsible) {
    return (
      <section
        {...props}
        data-slot="property-section"
        aria-labelledby={headingId}
        className={sectionClassName}
      >
        <h3 className="py-2">{heading}</h3>
        <Separator />
        <div className="py-2">{children}</div>
      </section>
    );
  }
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (open === undefined) setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}
      asChild
    >
      <section
        {...props}
        data-slot="property-section"
        aria-labelledby={headingId}
        data-open={isOpen ? "true" : undefined}
        className={sectionClassName}
      >
        <CollapsibleTrigger className="flex min-h-10 w-full items-center justify-between gap-2 px-2 py-2 text-left outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50">
          <span>{heading}</span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <div className="py-2">{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

export { PropertyRow, PropertySection };
export type { PropertyRowProps, PropertySectionProps };

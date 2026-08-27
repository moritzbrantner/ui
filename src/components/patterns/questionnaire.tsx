"use client";

import * as React from "react";

import { cn } from "../../lib/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag = `h${HeadingLevel}`;

type QuestionnaireQuestionVariant = "cards" | "list" | "scale";
type QuestionnaireQuestionColumns = 1 | 2 | 3;

export type QuestionnaireOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

export type QuestionnaireProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  titleLevel?: HeadingLevel;
  currentStep?: number;
  totalSteps?: number;
  progressLabel?: React.ReactNode;
  progressAriaLabel?: string;
  footer?: React.ReactNode;
};

function Questionnaire({
  className,
  title,
  description,
  titleLevel = 2,
  currentStep,
  totalSteps,
  progressLabel,
  progressAriaLabel = "Questionnaire progress",
  footer,
  children,
  ...props
}: QuestionnaireProps) {
  const Heading = `h${titleLevel}` as HeadingTag;
  const hasProgress =
    typeof currentStep === "number" &&
    typeof totalSteps === "number" &&
    Number.isFinite(currentStep) &&
    Number.isFinite(totalSteps) &&
    totalSteps > 0;
  const resolvedTotalSteps = hasProgress ? Math.max(1, Math.round(totalSteps)) : 1;
  const resolvedCurrentStep = hasProgress
    ? Math.min(resolvedTotalSteps, Math.max(1, Math.round(currentStep)))
    : 1;
  const progress = (resolvedCurrentStep / resolvedTotalSteps) * 100;

  return (
    <section
      data-slot="questionnaire"
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-[var(--ui-card-radius,var(--ui-radius-surface))] bg-card text-card-foreground ring-1 ring-foreground/10",
        className,
      )}
      {...props}
    >
      {(title || description || hasProgress) && (
        <header
          data-slot="questionnaire-header"
          className="grid gap-4 border-b border-border/70 px-[var(--ui-surface-padding-md)] py-[var(--ui-surface-padding-md)]"
        >
          {hasProgress && (
            <div data-slot="questionnaire-progress" className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span data-slot="questionnaire-progress-label">
                  {progressLabel ?? `${resolvedCurrentStep}/${resolvedTotalSteps}`}
                </span>
                <span aria-hidden="true">{Math.round(progress)}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={progressAriaLabel}
                aria-valuemin={1}
                aria-valuemax={resolvedTotalSteps}
                aria-valuenow={resolvedCurrentStep}
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  data-slot="questionnaire-progress-indicator"
                  className="h-full rounded-full bg-primary transition-[width] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)] motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {(title || description) && (
            <div className="grid gap-1.5">
              {title && (
                <Heading
                  data-slot="questionnaire-title"
                  className="font-heading text-xl leading-tight font-semibold tracking-tight"
                >
                  {title}
                </Heading>
              )}
              {description && (
                <div
                  data-slot="questionnaire-description"
                  className="max-w-prose text-sm leading-6 text-muted-foreground"
                >
                  {description}
                </div>
              )}
            </div>
          )}
        </header>
      )}

      <div
        data-slot="questionnaire-content"
        className="px-[var(--ui-surface-padding-md)] py-[var(--ui-surface-padding-md)]"
      >
        {children}
      </div>

      {footer && (
        <footer
          data-slot="questionnaire-footer"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/30 px-[var(--ui-surface-padding-md)] py-[var(--ui-surface-padding-sm)]"
        >
          {footer}
        </footer>
      )}
    </section>
  );
}

export type QuestionnaireQuestionProps = Omit<
  React.ComponentProps<"fieldset">,
  "children" | "onChange"
> & {
  legend: React.ReactNode;
  description?: React.ReactNode;
  options: readonly QuestionnaireOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  variant?: QuestionnaireQuestionVariant;
  columns?: QuestionnaireQuestionColumns;
  required?: boolean;
  error?: React.ReactNode;
  scaleStartLabel?: React.ReactNode;
  scaleEndLabel?: React.ReactNode;
};

function QuestionnaireQuestion({
  className,
  legend,
  description,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  variant = "cards",
  columns = 1,
  required = false,
  error,
  scaleStartLabel,
  scaleEndLabel,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: QuestionnaireQuestionProps) {
  const generatedId = React.useId();
  const generatedName = `questionnaire-${generatedId}`;
  const resolvedName = name ?? generatedName;
  const descriptionId = `${generatedId}-description`;
  const errorId = `${generatedId}-error`;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null, ariaDescribedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  const selectValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <fieldset
      data-slot="questionnaire-question"
      data-variant={variant}
      className={cn("min-w-0 border-0 p-0", className)}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      <legend
        data-slot="questionnaire-legend"
        className="font-heading max-w-prose text-lg leading-snug font-medium"
      >
        {legend}
      </legend>

      {description && (
        <div
          id={descriptionId}
          data-slot="questionnaire-question-description"
          className="mt-1.5 max-w-prose text-sm leading-6 text-muted-foreground"
        >
          {description}
        </div>
      )}

      <div
        data-slot="questionnaire-options"
        data-variant={variant}
        data-columns={columns}
        className={cn(
          "mt-5 min-w-0",
          variant === "cards" &&
            "grid grid-cols-1 gap-3 sm:data-[columns=2]:grid-cols-2 sm:data-[columns=3]:grid-cols-3",
          variant === "list" && "grid gap-2",
          variant === "scale" && "grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-2",
        )}
      >
        {options.map((option, index) => {
          const optionId = `${generatedId}-${index}`;
          const selected = option.value === selectedValue;
          const optionDisabled = Boolean(disabled || option.disabled);
          const accessibleLabel =
            option.ariaLabel ?? (typeof option.label === "string" ? option.label : undefined);

          return (
            <div key={option.value} data-slot="questionnaire-option" className="min-w-0">
              <input
                id={optionId}
                data-slot="questionnaire-input"
                className="peer sr-only"
                type="radio"
                name={resolvedName}
                value={option.value}
                checked={selected}
                disabled={optionDisabled}
                required={required}
                aria-label={accessibleLabel}
                aria-invalid={error ? true : undefined}
                onChange={() => selectValue(option.value)}
              />
              <label
                htmlFor={optionId}
                data-slot="questionnaire-option-label"
                data-selected={selected ? "true" : "false"}
                data-disabled={optionDisabled ? "true" : undefined}
                className={cn(
                  "relative outline-none transition-[background-color,border-color,box-shadow,transform] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)] peer-focus-visible:ring-[var(--ui-focus-ring-width)] peer-focus-visible:ring-ring/50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 motion-reduce:transition-none",
                  variant === "cards" &&
                    "flex min-h-24 cursor-pointer items-start gap-3 rounded-[var(--ui-card-radius,var(--ui-radius-surface))] border border-border bg-background p-4 shadow-[var(--ui-shadow-surface)] hover:-translate-y-px hover:border-primary/40 hover:bg-accent/30 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-[var(--ui-shadow-interactive)] motion-reduce:hover:translate-y-0",
                  variant === "list" &&
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--ui-radius-control)] border border-border bg-background px-3 py-2.5 hover:border-primary/40 hover:bg-accent/40 data-[selected=true]:border-primary data-[selected=true]:bg-primary/5",
                  variant === "scale" &&
                    "flex min-h-12 cursor-pointer items-center justify-center rounded-[var(--ui-radius-control)] border border-border bg-background px-2 py-2 text-center text-sm font-medium hover:border-primary/50 hover:bg-accent data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:shadow-[var(--ui-shadow-interactive)]",
                )}
              >
                {variant !== "scale" && (
                  <span
                    aria-hidden="true"
                    data-slot="questionnaire-option-marker"
                    data-state={selected ? "checked" : "unchecked"}
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  >
                    <span
                      data-slot="questionnaire-option-dot"
                      className={cn(
                        "size-2 rounded-full bg-primary-foreground transition-transform duration-[var(--ui-motion-duration-fast)] motion-reduce:transition-none",
                        selected ? "scale-100" : "scale-0",
                      )}
                    />
                  </span>
                )}

                {variant !== "scale" && option.leading && (
                  <span
                    aria-hidden="true"
                    data-slot="questionnaire-option-leading"
                    className="flex size-8 shrink-0 items-center justify-center rounded-[var(--ui-radius-control)] bg-muted text-muted-foreground [&_svg]:size-4"
                  >
                    {option.leading}
                  </span>
                )}

                <span
                  data-slot="questionnaire-option-content"
                  className={cn("min-w-0", variant !== "scale" && "grid flex-1 gap-0.5")}
                >
                  <span
                    data-slot="questionnaire-option-title"
                    className={cn(
                      "font-medium",
                      variant === "cards" && "leading-snug",
                      variant === "list" && "text-sm leading-snug",
                    )}
                  >
                    {option.label}
                  </span>
                  {variant !== "scale" && option.description && (
                    <span
                      data-slot="questionnaire-option-description"
                      className="text-sm leading-5 text-muted-foreground"
                    >
                      {option.description}
                    </span>
                  )}
                </span>

                {variant !== "scale" && selected && (
                  <span
                    aria-hidden="true"
                    data-slot="questionnaire-option-selected"
                    className="self-center text-xs font-medium text-primary"
                  >
                    ✓
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>

      {variant === "scale" && (scaleStartLabel || scaleEndLabel) && (
        <div
          data-slot="questionnaire-scale-labels"
          className="mt-2 flex items-start justify-between gap-4 text-xs leading-5 text-muted-foreground"
        >
          <span>{scaleStartLabel}</span>
          <span className="text-right">{scaleEndLabel}</span>
        </div>
      )}

      {error && (
        <div
          id={errorId}
          data-slot="questionnaire-error"
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
    </fieldset>
  );
}

export { Questionnaire, QuestionnaireQuestion };
export type { HeadingLevel, QuestionnaireQuestionColumns, QuestionnaireQuestionVariant };

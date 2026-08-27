import * as React from "react";

import { cn } from "../../lib/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag = `h${HeadingLevel}`;

type QuestionnaireChoiceVariant = "cards" | "list" | "scale" | "pop" | "pulse";
type QuestionnaireQuestionColumns = 1 | 2 | 3;
type QuestionnairePollResultsVariant = "default" | "pop" | "pulse";
type QuestionnaireTextAnswerVariant = "default" | "pop" | "pulse";

export type QuestionnaireOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

export type QuestionnairePollResult = {
  value: string;
  label: React.ReactNode;
  count: number;
  percentage?: number;
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

export type QuestionnaireQuestionProps = Omit<React.ComponentProps<"fieldset">, "id"> & {
  id: string;
  legend: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
};

function QuestionnaireQuestion({
  className,
  id,
  legend,
  description,
  error,
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: QuestionnaireQuestionProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      id={id}
      data-slot="questionnaire-question"
      className={cn("min-w-0 border-0 p-0", className)}
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

      <div data-slot="questionnaire-question-content" className="mt-5 grid min-w-0 gap-4">
        {children}
      </div>

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

export type QuestionnaireSingleChoiceProps = Omit<React.ComponentProps<"div">, "children"> & {
  options: readonly QuestionnaireOption[];
  name: string;
  defaultValue?: string;
  variant?: QuestionnaireChoiceVariant;
  columns?: QuestionnaireQuestionColumns;
  required?: boolean;
  disabled?: boolean;
  scaleStartLabel?: React.ReactNode;
  scaleEndLabel?: React.ReactNode;
};

function QuestionnaireSingleChoice({
  className,
  id,
  options,
  name,
  defaultValue,
  variant = "cards",
  columns = 1,
  required = false,
  disabled = false,
  scaleStartLabel,
  scaleEndLabel,
  ...props
}: QuestionnaireSingleChoiceProps) {
  const optionIdPrefix = (id ?? name).trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  const isScale = variant === "scale";
  const isCardLayout = variant === "cards" || variant === "pop";

  return (
    <div
      id={id}
      data-slot="questionnaire-single-choice"
      data-variant={variant}
      data-columns={columns}
      className={cn("min-w-0", className)}
      {...props}
    >
      <div
        data-slot="questionnaire-options"
        data-variant={variant}
        data-columns={columns}
        className={cn(
          "min-w-0",
          isCardLayout &&
            "grid grid-cols-1 gap-3 sm:data-[columns=2]:grid-cols-2 sm:data-[columns=3]:grid-cols-3",
          (variant === "list" || variant === "pulse") && "grid gap-2",
          isScale && "grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-2",
        )}
      >
        {options.map((option, index) => {
          const optionId = `${optionIdPrefix}-${index}`;
          const optionDisabled = Boolean(disabled || option.disabled);
          const accessibleLabel =
            option.ariaLabel ?? (typeof option.label === "string" ? option.label : undefined);

          return (
            <div key={option.value} data-slot="questionnaire-option" className="relative min-w-0">
              <input
                id={optionId}
                data-slot="questionnaire-input"
                className="peer sr-only"
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={option.value === defaultValue}
                disabled={optionDisabled}
                required={required}
                aria-label={accessibleLabel}
              />

              {!isScale && (
                <span
                  aria-hidden="true"
                  data-slot="questionnaire-option-marker"
                  className={cn(
                    "pointer-events-none absolute z-10 flex size-5 items-center justify-center rounded-full border border-input bg-background after:size-2 after:scale-0 after:rounded-full after:bg-primary-foreground after:content-[''] peer-checked:border-primary peer-checked:bg-primary peer-checked:after:scale-100 peer-disabled:opacity-50",
                    variant === "list" || variant === "pulse" ? "top-3.5 left-3" : "top-4 left-4",
                  )}
                />
              )}

              <label
                htmlFor={optionId}
                data-slot="questionnaire-option-label"
                className={cn(
                  "relative outline-none transition-[background-color,border-color,box-shadow,transform] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)] peer-focus-visible:ring-[var(--ui-focus-ring-width)] peer-focus-visible:ring-ring/50 peer-disabled:pointer-events-none peer-disabled:opacity-50 motion-reduce:transition-none",
                  variant === "cards" &&
                    "flex min-h-24 cursor-pointer items-start gap-3 rounded-[var(--ui-card-radius,var(--ui-radius-surface))] border border-border bg-background p-4 pl-12 shadow-[var(--ui-shadow-surface)] hover:-translate-y-px hover:border-primary/40 hover:bg-accent/30 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[var(--ui-shadow-interactive)] motion-reduce:hover:translate-y-0",
                  variant === "pop" &&
                    "flex min-h-24 cursor-pointer items-start gap-3 rounded-[var(--ui-card-radius,var(--ui-radius-surface))] border border-border bg-background p-4 pl-12 shadow-[var(--ui-shadow-surface)] hover:-translate-y-1 hover:border-primary/50 hover:bg-accent/40 active:scale-[0.99] peer-checked:scale-[1.015] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-[var(--ui-shadow-interactive)] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 motion-reduce:peer-checked:scale-100",
                  variant === "list" &&
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--ui-radius-control)] border border-border bg-background px-3 py-2.5 pl-11 hover:border-primary/40 hover:bg-accent/40 peer-checked:border-primary peer-checked:bg-primary/5",
                  variant === "pulse" &&
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--ui-radius-control)] border border-border bg-background px-3 py-2.5 pl-11 hover:border-primary/50 hover:bg-accent/50 active:scale-[0.995] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary/15 motion-reduce:active:scale-100",
                  isScale &&
                    "flex min-h-12 cursor-pointer items-center justify-center rounded-[var(--ui-radius-control)] border border-border bg-background px-2 py-2 text-center text-sm font-medium hover:border-primary/50 hover:bg-accent peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:shadow-[var(--ui-shadow-interactive)]",
                )}
              >
                {!isScale && option.leading && (
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
                  className={cn("min-w-0", !isScale && "grid flex-1 gap-0.5")}
                >
                  <span
                    data-slot="questionnaire-option-title"
                    className={cn(
                      "font-medium",
                      (variant === "cards" || variant === "pop") && "leading-snug",
                      (variant === "list" || variant === "pulse") && "text-sm leading-snug",
                    )}
                  >
                    {option.label}
                  </span>
                  {!isScale && option.description && (
                    <span
                      data-slot="questionnaire-option-description"
                      className="text-sm leading-5 text-muted-foreground"
                    >
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      {isScale && (scaleStartLabel || scaleEndLabel) && (
        <div
          data-slot="questionnaire-scale-labels"
          className="mt-2 flex items-start justify-between gap-4 text-xs leading-5 text-muted-foreground"
        >
          <span>{scaleStartLabel}</span>
          <span className="text-right">{scaleEndLabel}</span>
        </div>
      )}
    </div>
  );
}

export type QuestionnaireTextAnswerProps = Omit<
  React.ComponentProps<"textarea">,
  "children" | "id"
> & {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  variant?: QuestionnaireTextAnswerVariant;
  inputClassName?: string;
};

function QuestionnaireTextAnswer({
  className,
  inputClassName,
  id,
  label,
  hint,
  variant = "default",
  rows = 5,
  "aria-describedby": ariaDescribedBy,
  ...props
}: QuestionnaireTextAnswerProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div
      data-slot="questionnaire-text-answer"
      data-variant={variant}
      className={cn("grid gap-2", className)}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        data-slot="questionnaire-textarea"
        data-variant={variant}
        rows={rows}
        aria-describedby={describedBy}
        className={cn(
          "min-h-28 w-full resize-y rounded-[var(--ui-radius-control)] border border-input bg-background px-3 py-2 text-base shadow-[var(--ui-shadow-surface)] outline-none transition-[border-color,box-shadow,transform] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm motion-reduce:transition-none",
          variant === "pop" &&
            "focus-visible:-translate-y-px focus-visible:shadow-[var(--ui-shadow-interactive)] motion-reduce:focus-visible:translate-y-0",
          variant === "pulse" && "focus-visible:ring-2 focus-visible:ring-primary/20",
          inputClassName,
        )}
        {...props}
      />
      {hint && (
        <div
          id={hintId}
          data-slot="questionnaire-text-answer-hint"
          className="text-xs text-muted-foreground"
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export type QuestionnairePollResultsProps = Omit<
  React.ComponentProps<"div">,
  "children" | "results"
> & {
  results: readonly QuestionnairePollResult[];
  totalResponses?: number;
  selectedValue?: string;
  showCounts?: boolean;
  caption?: React.ReactNode;
  variant?: QuestionnairePollResultsVariant;
};

function QuestionnairePollResults({
  className,
  results,
  totalResponses,
  selectedValue,
  showCounts = true,
  caption,
  variant = "default",
  ...props
}: QuestionnairePollResultsProps) {
  const normalizedCounts = results.map((result) =>
    Number.isFinite(result.count) ? Math.max(0, Math.round(result.count)) : 0,
  );
  const computedTotal = normalizedCounts.reduce((sum, count) => sum + count, 0);
  const resolvedTotal =
    typeof totalResponses === "number" && Number.isFinite(totalResponses) && totalResponses >= 0
      ? Math.round(totalResponses)
      : computedTotal;

  return (
    <div
      data-slot="questionnaire-poll-results"
      data-variant={variant}
      className={cn("grid gap-3", className)}
      {...props}
    >
      {caption && (
        <div
          data-slot="questionnaire-poll-results-caption"
          className="text-sm text-muted-foreground"
        >
          {caption}
        </div>
      )}

      <ul data-slot="questionnaire-poll-results-list" className="grid gap-2.5">
        {results.map((result, index) => {
          const count = normalizedCounts[index] ?? 0;
          const rawPercentage =
            typeof result.percentage === "number" && Number.isFinite(result.percentage)
              ? result.percentage
              : resolvedTotal > 0
                ? (count / resolvedTotal) * 100
                : 0;
          const percentage = Math.min(100, Math.max(0, rawPercentage));
          const roundedPercentage = Math.round(percentage);
          const selected = result.value === selectedValue;
          const accessibleLabel =
            result.ariaLabel ?? (typeof result.label === "string" ? result.label : undefined);

          return (
            <li
              key={result.value}
              data-slot="questionnaire-poll-result"
              data-selected={selected ? "true" : undefined}
              className={cn(
                "grid gap-1.5",
                variant === "pop" &&
                  "rounded-[var(--ui-radius-control)] border border-transparent p-2 transition-transform duration-[var(--ui-motion-duration-base)] data-[selected=true]:scale-[1.01] data-[selected=true]:border-primary/30 data-[selected=true]:bg-primary/5 motion-reduce:data-[selected=true]:scale-100",
                variant === "pulse" &&
                  "rounded-[var(--ui-radius-control)] px-2 py-1.5 data-[selected=true]:bg-primary/5",
              )}
            >
              <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
                <span data-slot="questionnaire-poll-result-label" className="min-w-0 font-medium">
                  {result.label}
                  {selected && (
                    <span className="ml-1.5 text-xs font-normal text-primary" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <strong className="font-medium text-foreground">{roundedPercentage}%</strong>
                  {showCounts && <span> · {count}</span>}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={accessibleLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={roundedPercentage}
                aria-valuetext={`${roundedPercentage}%${showCounts ? `, ${count} responses` : ""}`}
                className={cn(
                  "h-2 overflow-hidden rounded-full bg-muted",
                  variant === "pop" && "h-2.5",
                  variant === "pulse" && "h-1.5",
                )}
              >
                <div
                  data-slot="questionnaire-poll-result-indicator"
                  className={cn(
                    "h-full rounded-full bg-primary transition-[width] duration-[var(--ui-motion-duration-base)] ease-[var(--ui-motion-ease-standard)] motion-reduce:transition-none",
                    variant === "pop" && "shadow-[var(--ui-shadow-interactive)]",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export {
  Questionnaire,
  QuestionnairePollResults,
  QuestionnaireQuestion,
  QuestionnaireSingleChoice,
  QuestionnaireTextAnswer,
};
export type {
  HeadingLevel,
  QuestionnaireChoiceVariant,
  QuestionnairePollResultsVariant,
  QuestionnaireQuestionColumns,
  QuestionnaireTextAnswerVariant,
};

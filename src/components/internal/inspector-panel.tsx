"use client";

import * as React from "react";
import { CheckIcon, RotateCcwIcon } from "lucide-react";

import { cn } from "../../lib/cn";
import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { Checkbox } from "../stable/checkbox";
import { Input } from "../stable/input";
import { NumericInput } from "../stable/numeric-input";
import { ScrollArea } from "../stable/scroll-area";
import { SelectDropdown } from "../stable/select";
import { FieldGroup } from "../stable/field";
import { PropertyRow, PropertySection } from "../stable/property";
import { Slider } from "../stable/slider";
import { Textarea } from "../stable/textarea";

type InspectorFieldValue = string | number | boolean | string[] | null | undefined;

type InspectorFieldOption = {
  label: string;
  value: string | number | boolean;
};

type InspectorFieldDefinition = {
  id: string;
  label: string;
  type:
    | "text"
    | "number"
    | "slider"
    | "boolean"
    | "select"
    | "textarea"
    | "code"
    | "color"
    | "className"
    | "custom";
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  unit?: string;
  displayPrecision?: number;
  placeholder?: string;
  readOnly?: boolean;
  options?: InspectorFieldOption[];
  value?: InspectorFieldValue;
  render?: (
    value: InspectorFieldValue,
    onChange: (value: InspectorFieldValue) => void,
  ) => React.ReactNode;
};

type InspectorPanelSectionData = {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  fields: InspectorFieldDefinition[];
};

type InspectorPanelProps = Omit<React.ComponentProps<"aside">, "onChange"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  sections?: InspectorPanelSectionData[];
  fields?: InspectorFieldDefinition[];
  values?: Record<string, InspectorFieldValue>;
  defaultValues?: Record<string, InspectorFieldValue>;
  readOnly?: boolean;
  validationMessages?: Record<string, React.ReactNode>;
  onValuesChange?: (values: Record<string, InspectorFieldValue>, dirty: boolean) => void;
  onApply?: (values: Record<string, InspectorFieldValue>) => void;
  onReset?: () => void;
};

export type InspectorPanelHeaderProps = React.ComponentProps<"div"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  dirty?: boolean;
};

export type InspectorPanelSectionProps = React.ComponentProps<"section"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type InspectorFieldProps = React.ComponentProps<"div"> & {
  field: InspectorFieldDefinition;
  value?: InspectorFieldValue;
  readOnly?: boolean;
  validationMessage?: React.ReactNode;
  onValueChange?: (value: InspectorFieldValue) => void;
};

export type InspectorFieldGroupProps = React.ComponentProps<"div">;

export type InspectorActionsProps = React.ComponentProps<"div"> & {
  dirty?: boolean;
  readOnly?: boolean;
  onApply?: () => void;
  onReset?: () => void;
};

function InspectorPanel({
  title = "Inspector",
  description,
  sections,
  fields,
  values,
  defaultValues,
  readOnly = false,
  validationMessages,
  onValuesChange,
  onApply,
  onReset,
  className,
  ...props
}: InspectorPanelProps) {
  const normalizedSections = React.useMemo(
    () =>
      sections?.length
        ? sections
        : [
            {
              id: "properties",
              title: "Properties",
              defaultOpen: true,
              fields: fields ?? [],
            },
          ],
    [fields, sections],
  );
  const initialValues = React.useMemo(
    () => ({
      ...collectInspectorFieldValues(normalizedSections),
      ...defaultValues,
    }),
    [defaultValues, normalizedSections],
  );
  const [internalValues, setInternalValues] =
    React.useState<Record<string, InspectorFieldValue>>(initialValues);
  const currentValues = values ?? internalValues;
  const dirty = !areInspectorValuesEqual(currentValues, initialValues);

  React.useEffect(() => {
    if (values) {
      return;
    }
    setInternalValues((current) => ({ ...initialValues, ...current }));
  }, [initialValues, values]);

  const commitValue = (fieldId: string, value: InspectorFieldValue) => {
    const nextValues = { ...currentValues, [fieldId]: value };
    setInternalValues(nextValues);
    onValuesChange?.(nextValues, !areInspectorValuesEqual(nextValues, initialValues));
  };

  const resetValues = () => {
    setInternalValues(initialValues);
    onValuesChange?.(initialValues, false);
    onReset?.();
  };

  return (
    <aside
      data-slot="inspector-panel"
      data-read-only={readOnly ? "true" : undefined}
      className={cn(
        "flex h-full min-h-[32rem] flex-col rounded-md border bg-card text-card-foreground",
        className,
      )}
      {...props}
    >
      <InspectorPanelHeader title={title} description={description} dirty={dirty} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-3">
          {normalizedSections.map((section) => (
            <InspectorPanelSection
              key={section.id}
              title={section.title}
              description={section.description}
              defaultOpen={section.defaultOpen ?? true}
            >
              <InspectorFieldGroup>
                {section.fields.map((field) => (
                  <InspectorField
                    key={field.id}
                    field={field}
                    value={currentValues[field.id]}
                    readOnly={readOnly}
                    validationMessage={validationMessages?.[field.id]}
                    onValueChange={(value) => commitValue(field.id, value)}
                  />
                ))}
              </InspectorFieldGroup>
            </InspectorPanelSection>
          ))}
        </div>
      </ScrollArea>
      <InspectorActions
        dirty={dirty}
        readOnly={readOnly}
        onApply={() => onApply?.(currentValues)}
        onReset={resetValues}
      />
    </aside>
  );
}

function InspectorPanelHeader({
  title,
  description,
  dirty,
  className,
  ...props
}: InspectorPanelHeaderProps) {
  return (
    <div
      data-slot="inspector-panel-header"
      className={cn("space-y-1 border-b p-3", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {dirty ? <Badge variant="secondary">Unsaved</Badge> : null}
      </div>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function InspectorPanelSection({
  title,
  description,
  defaultOpen = true,
  open,
  onOpenChange,
  ...props
}: InspectorPanelSectionProps) {
  return (
    <PropertySection
      {...props}
      title={title}
      description={description}
      collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function InspectorFieldGroup({ className, ...props }: InspectorFieldGroupProps) {
  return (
    <FieldGroup data-slot="inspector-field-group" className={cn("gap-3", className)} {...props} />
  );
}

function InspectorField({
  field,
  value,
  readOnly,
  validationMessage,
  onValueChange,
  className,
  ...props
}: InspectorFieldProps) {
  const disabled = readOnly || field.readOnly;
  const inputId = React.useId();
  const descriptionId = field.description ? `${inputId}-description` : undefined;
  const validationId = validationMessage ? `${inputId}-validation` : undefined;
  const describedBy = [descriptionId, validationId].filter(Boolean).join(" ") || undefined;

  return (
    <PropertyRow
      {...props}
      label={field.label}
      htmlFor={field.type === "custom" ? undefined : inputId}
      description={field.description}
      descriptionId={descriptionId}
      validationMessage={validationMessage}
      validationId={validationId}
      className={className}
    >
      <InspectorFieldEditor
        id={inputId}
        describedBy={describedBy}
        invalid={Boolean(validationMessage)}
        field={field}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    </PropertyRow>
  );
}

function InspectorFieldEditor({
  id,
  describedBy,
  invalid,
  field,
  value,
  disabled,
  onValueChange,
}: {
  id: string;
  describedBy?: string;
  invalid?: boolean;
  field: InspectorFieldDefinition;
  value?: InspectorFieldValue;
  disabled?: boolean;
  onValueChange?: (value: InspectorFieldValue) => void;
}) {
  if (field.type === "custom") {
    return <>{field.render?.(value, (nextValue) => !disabled && onValueChange?.(nextValue))}</>;
  }

  if (field.type === "boolean") {
    return (
      <label className="flex h-8 items-center gap-2 rounded-md border px-2 text-sm">
        <Checkbox
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          checked={Boolean(value)}
          disabled={disabled}
          onCheckedChange={(checked) => onValueChange?.(checked === true)}
        />
        Enabled
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <SelectDropdown
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={field.label}
        value={String(value ?? "")}
        disabled={disabled}
        onValueChange={(nextValue) => onValueChange?.(nextValue)}
        options={(field.options ?? []).map((option) => ({
          label: option.label,
          value: String(option.value),
        }))}
      />
    );
  }

  if (field.type === "slider") {
    const numericValue = typeof value === "number" ? value : Number(value ?? field.min ?? 0);

    return (
      <div className="flex items-center gap-3">
        <Slider
          id={`${id}-slider`}
          aria-label={field.label}
          value={[Number.isFinite(numericValue) ? numericValue : (field.min ?? 0)]}
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          disabled={disabled}
          onValueChange={(values) => onValueChange?.(values[0] ?? field.min ?? 0)}
        />
        <NumericInput
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-label={`${field.label} value`}
          value={Number.isFinite(numericValue) ? numericValue : null}
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step}
          smallStep={field.smallStep}
          largeStep={field.largeStep}
          unit={field.unit}
          displayPrecision={field.displayPrecision}
          disabled={disabled}
          className="w-24 shrink-0"
          onValueChange={onValueChange}
        />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="flex items-center gap-2">
        <Input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-label={field.label}
          type="color"
          value={String(value || "#000000")}
          disabled={disabled}
          className="h-8 w-12 shrink-0 p-1"
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
        />
        <Input
          aria-label={`${field.label} color value`}
          value={String(value ?? "")}
          disabled={disabled}
          placeholder={field.placeholder ?? "#000000"}
          className="font-mono text-xs"
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
        />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "code") {
    return (
      <Textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={field.label}
        value={String(value ?? "")}
        disabled={disabled}
        placeholder={field.placeholder}
        className={cn(field.type === "code" && "font-mono text-xs")}
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
      />
    );
  }

  if (field.type === "className") {
    return (
      <Textarea
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={field.label}
        value={String(value ?? "")}
        disabled={disabled}
        placeholder={field.placeholder ?? "rounded-md border-border/60"}
        className="min-h-20 font-mono text-xs"
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
      />
    );
  }

  if (field.type === "number") {
    return (
      <NumericInput
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-label={field.label}
        value={typeof value === "number" ? value : null}
        min={field.min}
        max={field.max}
        step={field.step}
        smallStep={field.smallStep}
        largeStep={field.largeStep}
        unit={field.unit}
        displayPrecision={field.displayPrecision}
        disabled={disabled}
        placeholder={field.placeholder}
        onValueChange={onValueChange}
      />
    );
  }

  return (
    <Input
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-label={field.label}
      type="text"
      value={String(value ?? "")}
      disabled={disabled}
      placeholder={field.placeholder}
      onChange={(event) => onValueChange?.(event.currentTarget.value)}
    />
  );
}

function InspectorActions({
  dirty,
  readOnly,
  onApply,
  onReset,
  className,
  ...props
}: InspectorActionsProps) {
  return (
    <div
      data-slot="inspector-actions"
      className={cn("flex items-center justify-end gap-2 border-t p-3", className)}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={readOnly || !dirty}
        onClick={onReset}
      >
        <RotateCcwIcon />
        Reset
      </Button>
      <Button type="button" size="sm" disabled={readOnly || !dirty} onClick={onApply}>
        <CheckIcon />
        Apply
      </Button>
    </div>
  );
}

function collectInspectorFieldValues(sections: InspectorPanelSectionData[]) {
  return sections.reduce<Record<string, InspectorFieldValue>>((values, section) => {
    for (const field of section.fields) {
      values[field.id] = field.value;
    }
    return values;
  }, {});
}

function areInspectorValuesEqual(
  left: Record<string, InspectorFieldValue>,
  right: Record<string, InspectorFieldValue>,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export {
  InspectorActions,
  InspectorField,
  InspectorFieldGroup,
  InspectorPanel,
  InspectorPanelHeader,
  InspectorPanelSection,
};
export type {
  InspectorFieldDefinition,
  InspectorFieldOption,
  InspectorFieldValue,
  InspectorPanelProps,
  InspectorPanelSectionData,
};

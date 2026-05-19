import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FormEvent, useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "./button";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend } from "./field";
import {
  FieldGrid,
  FieldRow,
  Fieldset,
  FormActions,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  ValidationSummary,
} from "./form-layout";
import { Input } from "./input";
import { Switch } from "./switch";

type ValidatedFormDemoProps = {
  onSave?: (values: { name: string; owner: string; sync: boolean }) => void;
};

function FormLayoutDemo() {
  return (
    <form className="grid max-w-3xl gap-4">
      <ValidationSummary
        errors={["Workspace name is required.", "Notification email is invalid."]}
      />
      <FormSection>
        <FormSectionHeader>
          <FormSectionTitle>Workspace settings</FormSectionTitle>
          <FormSectionDescription>
            Shared form structure without product-specific state.
          </FormSectionDescription>
        </FormSectionHeader>
        <Fieldset>
          <FieldLegend>Details</FieldLegend>
          <FieldGrid>
            <Field>
              <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
              <Input id="workspace-name" placeholder="Research workspace" />
            </Field>
            <Field>
              <FieldLabel htmlFor="workspace-owner">Owner email</FieldLabel>
              <Input id="workspace-owner" type="email" placeholder="owner@example.com" />
            </Field>
          </FieldGrid>
          <FieldRow align="center">
            <Switch id="workspace-sync" />
            <FieldLabel htmlFor="workspace-sync">Sync automatically</FieldLabel>
            <FieldDescription>Keep connected surfaces updated when data changes.</FieldDescription>
          </FieldRow>
        </Fieldset>
      </FormSection>
      <FormActions>
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </FormActions>
    </form>
  );
}

function ValidatedFormDemo({ onSave = () => undefined }: ValidatedFormDemoProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("workspace-name") ?? "").trim();
    const owner = String(formData.get("workspace-owner") ?? "").trim();
    const sync = formData.get("workspace-sync") === "on";
    const nextErrors = [
      !name ? "Workspace name is required." : undefined,
      !owner.includes("@") ? "Owner email must include @." : undefined,
    ].filter(Boolean) as string[];

    setErrors(nextErrors);

    if (nextErrors.length === 0) {
      setSaved(true);
      onSave({ name, owner, sync });
    } else {
      setSaved(false);
    }
  }

  return (
    <form className="grid max-w-3xl gap-4" noValidate onSubmit={submit}>
      <ValidationSummary errors={errors} />
      {saved ? (
        <div role="status" className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Saved workspace settings.
        </div>
      ) : null}
      <FormSection>
        <FormSectionHeader>
          <FormSectionTitle>Validated workspace settings</FormSectionTitle>
          <FormSectionDescription>
            Submit the form to see validation feedback and saved state.
          </FormSectionDescription>
        </FormSectionHeader>
        <Fieldset>
          <FieldLegend>Details</FieldLegend>
          <FieldGrid>
            <Field data-invalid={errors.includes("Workspace name is required.") || undefined}>
              <FieldLabel htmlFor="validated-workspace-name">Workspace name</FieldLabel>
              <Input
                id="validated-workspace-name"
                name="workspace-name"
                aria-invalid={errors.includes("Workspace name is required.") || undefined}
                placeholder="Research workspace"
              />
              <FieldError>
                {errors.includes("Workspace name is required.")
                  ? "Workspace name is required."
                  : null}
              </FieldError>
            </Field>
            <Field data-invalid={errors.includes("Owner email must include @.") || undefined}>
              <FieldLabel htmlFor="validated-workspace-owner">Owner email</FieldLabel>
              <Input
                id="validated-workspace-owner"
                name="workspace-owner"
                type="email"
                aria-invalid={errors.includes("Owner email must include @.") || undefined}
                placeholder="owner@example.com"
              />
              <FieldError>
                {errors.includes("Owner email must include @.") ? "Owner email must include @." : null}
              </FieldError>
            </Field>
          </FieldGrid>
          <FieldRow align="center">
            <Switch id="validated-workspace-sync" name="workspace-sync" />
            <FieldLabel htmlFor="validated-workspace-sync">Sync automatically</FieldLabel>
            <FieldDescription>Keep connected surfaces updated when data changes.</FieldDescription>
          </FieldRow>
        </Fieldset>
      </FormSection>
      <FormActions>
        <Button type="reset" variant="outline" onClick={() => setSaved(false)}>
          Reset
        </Button>
        <Button type="submit">Save changes</Button>
      </FormActions>
    </form>
  );
}

const meta = {
  title: "Components/Forms & Inputs/Form Layout",
  component: FormLayoutDemo,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof FormLayoutDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SettingsForm: Story = {};

export const StickyActions: Story = {
  render: () => (
    <div className="h-96 overflow-auto">
      <FormLayoutDemo />
      <FormActions sticky>
        <Button>Sticky save</Button>
      </FormActions>
    </div>
  ),
};

export const ValidatedInteraction: StoryObj<typeof ValidatedFormDemo> = {
  render: (args) => <ValidatedFormDemo {...args} />,
  args: {
    onSave: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getAllByRole("alert")[0]).toHaveTextContent("Workspace name is required.");

    await userEvent.type(canvas.getByLabelText("Workspace name"), "Research hub");
    await userEvent.type(canvas.getByLabelText("Owner email"), "owner@example.com");
    await userEvent.click(canvas.getByRole("switch", { name: "Sync automatically" }));
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));

    await expect(args.onSave).toHaveBeenCalledWith({
      name: "Research hub",
      owner: "owner@example.com",
      sync: true,
    });
    await expect(canvas.getByRole("status")).toHaveTextContent("Saved workspace settings.");
  },
};

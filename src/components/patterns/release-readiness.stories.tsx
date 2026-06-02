import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BellIcon, CommandIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { expect, fn, screen } from "storybook/test";

import { Badge } from "../stable/badge";
import { Button } from "../stable/button";
import { CommandPalette, type CommandPaletteGroup } from "./command-palette";
import { DataGrid } from "../data/data-grid";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend } from "../stable/field";
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
} from "../stable/form-layout";
import { Input } from "../stable/input";
import { NotificationMenu } from "../shell/notification-menu";
import { PageContent, PageHeader, PageShell, PageTitle, Surface } from "../shell/app-layout";
import { Navbar, type NavbarGroup } from "../shell/navbar";
import { NavbarActions } from "../shell/navbar-actions";
import { SelectDropdown } from "../stable/select";
import { Switch } from "../stable/switch";
import { Toaster } from "../stable/sonner";

const dashboardRows = [
  { package: "@moritzbrantner/ui", status: "Ready", coverage: "CI only", owner: "Design" },
  { package: "@moritzbrantner/social", status: "Watching", coverage: "Smoke", owner: "App" },
  { package: "@moritzbrantner/api", status: "Queued", coverage: "Contract", owner: "Core" },
];

const dashboardGroups = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", active: true },
      { id: "releases", label: "Releases", badge: "3" },
      { id: "checks", label: "Checks" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "components", label: "Components" },
      { id: "tokens", label: "Tokens" },
    ],
  },
] satisfies NavbarGroup[];

const commandGroups = [
  {
    id: "release",
    label: "Release",
    actions: [
      {
        id: "open-checks",
        label: "Open release checks",
        description: "Review package, visual, and consumer confidence.",
        icon: <SearchIcon />,
        shortcut: "R",
      },
      {
        id: "publish-notes",
        label: "Draft publish notes",
        description: "Prepare release communication.",
        icon: <FileTextIcon />,
      },
    ],
  },
] satisfies CommandPaletteGroup[];

function ConsumerDashboardShell({
  onOpenCommand = () => undefined,
}: {
  onOpenCommand?: () => void;
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <PageShell className="min-h-[680px] w-[min(1180px,calc(100vw-2rem))]">
      <Navbar
        brand={<span className="font-semibold">Release Console</span>}
        groups={dashboardGroups}
        defaultOpenGroupId="workspace"
        actionSlot={
          <NavbarActions
            notificationMenu={{
              unreadCount: 2,
              items: [
                {
                  id: "coverage",
                  title: "Coverage requires CI",
                  description: "Real V8 coverage is enforced by Node in GitHub Actions.",
                  unread: true,
                },
              ],
            }}
            accountMenu={{ user: { name: "Ada Lovelace", initials: "AL" } }}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setCommandOpen(true);
                onOpenCommand();
              }}
            >
              <CommandIcon />
              Commands
            </Button>
          </NavbarActions>
        }
      />
      <PageHeader>
        <div>
          <PageTitle>Release readiness</PageTitle>
          <p className="text-sm text-muted-foreground">
            Package confidence, consumer footprint, and pending manual checks.
          </p>
        </div>
      </PageHeader>
      <PageContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Surface className="min-w-0">
            <DataGrid
              columns={[
                { accessorKey: "package", header: "Package" },
                { accessorKey: "status", header: "Status" },
                { accessorKey: "coverage", header: "Coverage" },
                { accessorKey: "owner", header: "Owner" },
              ]}
              data={dashboardRows}
            />
          </Surface>
          <Surface className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BellIcon className="size-4 text-muted-foreground" />
              Release signals
            </div>
            <Badge variant="secondary">Storybook checked</Badge>
            <Badge variant="outline">Consumer chunk watched</Badge>
            <NotificationMenu
              items={[{ id: "visual", title: "Visual checks expanded", unread: true }]}
            />
          </Surface>
        </div>
      </PageContent>
      <CommandPalette
        open={commandOpen}
        groups={commandGroups}
        onOpenChange={setCommandOpen}
        footer={<span>Release commands are UI-only in this package.</span>}
      />
      <Toaster />
    </PageShell>
  );
}

function FormsSettings({ onSave = () => undefined }: { onSave?: () => void }) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState(false);

  return (
    <form
      className="grid w-[min(760px,calc(100vw-2rem))] gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        const nextErrors = title ? [] : ["Title is required."];

        setErrors(nextErrors);
        setSaved(nextErrors.length === 0);

        if (nextErrors.length === 0) {
          onSave();
        }
      }}
    >
      <ValidationSummary errors={errors} />
      {saved ? (
        <div role="status" className="rounded-md border bg-primary/5 p-3 text-sm">
          Settings saved.
        </div>
      ) : null}
      <FormSection>
        <FormSectionHeader>
          <FormSectionTitle>Release settings</FormSectionTitle>
          <FormSectionDescription>
            Reusable field, validation, select, input, and toggle controls.
          </FormSectionDescription>
        </FormSectionHeader>
        <Fieldset>
          <FieldLegend>Details</FieldLegend>
          <FieldGrid>
            <Field data-invalid={errors.length > 0 || undefined}>
              <FieldLabel htmlFor="release-title">Title</FieldLabel>
              <Input
                id="release-title"
                name="title"
                aria-invalid={errors.length > 0 || undefined}
              />
              <FieldError>{errors[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="release-owner">Owner</FieldLabel>
              <SelectDropdown
                id="release-owner"
                name="owner"
                defaultValue="design"
                options={[
                  { label: "Design system", value: "design" },
                  { label: "Frontend", value: "frontend" },
                ]}
              />
            </Field>
          </FieldGrid>
          <FieldRow align="center">
            <Switch id="release-notify" name="notify" defaultChecked />
            <FieldLabel htmlFor="release-notify">Notify consumers</FieldLabel>
            <FieldDescription>
              Keep app packages informed when the design system ships.
            </FieldDescription>
          </FieldRow>
        </Fieldset>
      </FormSection>
      <FormActions>
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save settings</Button>
      </FormActions>
    </form>
  );
}

const meta = {
  title: "Patterns/Release Readiness",
  component: ConsumerDashboardShell,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ConsumerDashboardShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConsumerDashboardShellStory: Story = {
  name: "Consumer Dashboard Shell",
  args: {
    onOpenCommand: fn(),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "More navigation actions" }));
    await userEvent.click(await screen.findByRole("button", { name: "Commands" }));
    await expect(args.onOpenCommand).toHaveBeenCalled();
    await expect(canvasElement.ownerDocument.body).toHaveTextContent("Open release checks");
  },
};

export const FormsSettingsStory: StoryObj<typeof FormsSettings> = {
  name: "Forms Settings",
  render: (args) => <FormsSettings {...args} />,
  args: {
    onSave: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save settings" }));
    await expect(canvas.getAllByRole("alert")[0]).toHaveTextContent("Title is required.");

    await userEvent.type(canvas.getByLabelText("Title"), "0.5.4 release");
    await userEvent.click(canvas.getByRole("button", { name: "Save settings" }));

    await expect(args.onSave).toHaveBeenCalled();
    await expect(canvas.getByRole("status")).toHaveTextContent("Settings saved.");
  },
};

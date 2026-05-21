import "@moritzbrantner/ui/styles.css";

import * as React from "react";

import {
  AccountMenu,
  Button,
  CommandPalette,
  DataGrid,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldLabel,
  FormActions,
  FormSection,
  FormSectionDescription,
  FormSectionHeader,
  FormSectionTitle,
  NotificationMenu,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageShell,
  PageTitle,
  PlatformNavbar,
  SearchField,
  Surface,
  SurfaceContent,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
  ThemeModeSwitch,
  Toaster,
  ValidationSummary,
} from "@moritzbrantner/ui";

const rows = [
  { id: "pkg-ui", name: "UI package", status: "Ready", owner: "Design system" },
  { id: "pkg-app", name: "Frontend app", status: "Review", owner: "Product" },
  { id: "pkg-docs", name: "Docs", status: "Blocked", owner: "Platform" },
];

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "owner", header: "Owner" },
];

const navigationGroups = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "#overview", active: true },
      { id: "data", label: "Data", href: "#data" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { id: "members", label: "Members", href: "#members" },
      { id: "billing", label: "Billing", href: "#billing" },
    ],
  },
];

export function App() {
  const [query, setQuery] = React.useState("");
  const visibleRows = rows.filter((row) =>
    [row.name, row.status, row.owner].join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageShell background="muted" maxWidth="wide">
      <PlatformNavbar
        brand={<strong>Consumer Fixture</strong>}
        groups={navigationGroups}
        activeItemId="overview"
        notificationMenu={{
          unreadCount: 2,
          items: [
            { id: "review", title: "Review requested", unread: true, meta: "4m" },
            { id: "build", title: "Consumer build passed", meta: "1h" },
          ],
        }}
        accountMenu={{
          user: { name: "Ada Lovelace", email: "ada@example.com", initials: "AL" },
          items: [{ id: "profile", label: "Profile" }],
        }}
        themeModeSwitch
      />

      <PageHeader>
        <div className="grid gap-2">
          <PageTitle>App usage fixture</PageTitle>
          <PageDescription>
            A compact consumer surface that exercises layout, forms, data, overlays, feedback, and
            theme controls from the packaged API.
          </PageDescription>
        </div>
        <PageActions>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Consumer dialog</DialogTitle>
                <DialogDescription>
                  This dialog is imported from the published package root.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <ThemeModeSwitch />
        </PageActions>
      </PageHeader>

      <PageContent>
        <Surface>
          <SurfaceHeader>
            <SurfaceTitle>Package status</SurfaceTitle>
            <SurfaceDescription>DataGrid with controlled app-side filtering.</SurfaceDescription>
          </SurfaceHeader>
          <SurfaceContent className="mt-4 grid gap-4">
            <SearchField value={query} onValueChange={setQuery} resultCount={visibleRows.length} />
            <DataGrid columns={columns} data={visibleRows} pageSize={2} />
            {visibleRows.length === 0 ? (
              <EmptyState>No packages match the search.</EmptyState>
            ) : null}
          </SurfaceContent>
        </Surface>

        <FormSection>
          <FormSectionHeader>
            <FormSectionTitle>Validated form</FormSectionTitle>
            <FormSectionDescription>
              Form composition stays presentational and leaves submit behavior to the app.
            </FormSectionDescription>
          </FormSectionHeader>
          <ValidationSummary errors={["Owner email is required for release notifications."]} />
          <FieldGrid>
            <Field>
              <FieldLabel htmlFor="fixture-name">Workspace name</FieldLabel>
              <input
                id="fixture-name"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                defaultValue="Release workspace"
              />
              <FieldDescription>Visible to collaborators.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="fixture-owner">Owner email</FieldLabel>
              <input
                id="fixture-owner"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-invalid="true"
              />
              <FieldError>Owner email is required.</FieldError>
            </Field>
          </FieldGrid>
          <FormActions sticky>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </FormActions>
        </FormSection>
      </PageContent>

      <CommandPalette
        open={false}
        groups={[
          {
            id: "actions",
            label: "Actions",
            actions: [
              { id: "open-dialog", label: "Open dialog" },
              { id: "toggle-theme", label: "Toggle theme" },
            ],
          },
        ]}
      />
      <NotificationMenu className="hidden" items={[]} />
      <AccountMenu className="hidden" user={null} />
      <Toaster theme="system" />
    </PageShell>
  );
}

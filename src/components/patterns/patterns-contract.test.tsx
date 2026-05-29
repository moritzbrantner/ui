import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import { ActionMenu } from "./action-menu";
import { ActionSheet } from "./action-sheet";
import { CommandPalette, type CommandPaletteGroup } from "./command-palette";
import { ConfirmAction } from "./confirm-action";
import { ContextActionMenu } from "./context-action-menu";
import { DetailsPanel } from "./details-panel";
import { Dropzone, DropzoneInput } from "./dropzone";
import { ResponsiveActionMenu } from "./responsive-action-menu";
import { StateView } from "./state-view";
import { UploadQueue, type UploadQueueFile } from "./upload-queue";
import { ViewHeader } from "./view-header";
import { WorkbenchLayout } from "./workbench-layout";
import { DataGrid } from "../data/data-grid";
import { FilterBar } from "../data/filter-bar";
import { ResourceList } from "../data/resource-list";
import { SearchField } from "../data/search-field";
import { SelectionToolbar } from "../data/selection-toolbar";
import { AccountMenu } from "../shell/account-menu";
import { NotificationMenu } from "../shell/notification-menu";
import { Navbar, type NavbarGroup } from "../shell/navbar";

const rows = [{ name: "Package" }];
const columns = [{ accessorKey: "name", header: "Name" }];
const navigationGroups: NavbarGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [{ id: "overview", label: "Overview", active: true }],
  },
];
const commandGroups: CommandPaletteGroup[] = [
  { id: "actions", label: "Actions", actions: [{ id: "search", label: "Search" }] },
];
const uploads: UploadQueueFile[] = [
  { id: "upload", name: "report.pdf", status: "uploading", progress: 40 },
];

beforeAll(() => {
  globalThis.ResizeObserver ??= class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("patterns component contract", () => {
  test("renders state-light pattern surfaces with slots and callbacks", () => {
    const onSelectionClear = vi.fn();
    const onConfirm = vi.fn();

    render(
      <>
        <ViewHeader
          title="Package registry"
          breadcrumbs={[
            { id: "workspace", label: "Workspace", href: "#" },
            { id: "packages", label: "Packages" },
          ]}
          badges={[{ id: "stable", label: "Stable" }]}
        />
        <ResourceList title="Resources" status="idle">
          <div>Resource row</div>
        </ResourceList>
        <ConfirmAction
          trigger={<Button>Confirm delete</Button>}
          title="Delete resource?"
          confirmLabel="Delete"
          onConfirm={onConfirm}
        />
        <DetailsPanel
          trigger={<Button>Open package details</Button>}
          title="Package details"
          items={[{ id: "owner", term: "Owner", detail: "Design system" }]}
        />
        <ActionMenu
          trigger={<Button>Open actions</Button>}
          items={[{ id: "copy", label: "Copy" }]}
        />
        <ContextActionMenu items={[{ id: "open", label: "Open" }]}>
          <button type="button">Context target</button>
        </ContextActionMenu>
        <ActionSheet
          trigger={<Button>Mobile actions</Button>}
          items={[{ id: "archive", label: "Archive" }]}
          title="Mobile actions"
        />
        <ResponsiveActionMenu
          mode="desktop"
          trigger={<Button>Responsive actions</Button>}
          items={[{ id: "share", label: "Share" }]}
        />
        <DataGrid columns={columns} data={rows} />
        <FilterBar searchValue="" onSearchChange={() => {}} filters={[]} />
        <StateView>
          <span>Empty</span>
          <span>Nothing to show.</span>
        </StateView>
        <SearchField value="" onValueChange={() => {}} />
        <SelectionToolbar selectedCount={2} onClearSelection={onSelectionClear}>
          <Button>Delete</Button>
        </SelectionToolbar>
        <AccountMenu user={{ name: "Ada Lovelace", initials: "AL" }} items={[]} />
        <NotificationMenu items={[{ id: "note", title: "Review", unread: true }]} />
        <Navbar brand="Platform" groups={navigationGroups} />
        <CommandPalette open={false} groups={commandGroups} />
        <UploadQueue items={uploads} />
        <Dropzone htmlFor="contract-upload">
          <DropzoneInput id="contract-upload" />
        </Dropzone>
        <WorkbenchLayout leftPanel={<nav>Tools</nav>}>Workbench</WorkbenchLayout>
      </>,
    );

    expect(screen.getByText("Package")).toBeTruthy();
    expect(screen.getByText("Package registry")).toBeTruthy();
    expect(screen.getByText("Resource row")).toBeTruthy();
    expect(screen.getByText("Empty")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear selection" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSelectionClear).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open package details" }));
    expect(screen.getByText("Design system")).toBeTruthy();
    expect(screen.getByText("Platform")).toBeTruthy();
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.getAllByText("Workbench").length).toBeGreaterThan(0);
  });
});

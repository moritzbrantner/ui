import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { Button } from "../stable/button";
import { AccountMenu } from "./account-menu";
import { ActionMenu } from "./action-menu";
import { ActionSheet } from "./action-sheet";
import { CommandPalette, type CommandPaletteGroup } from "./command-palette";
import { ContextActionMenu } from "./context-action-menu";
import { DataGrid } from "./data-grid";
import { Dropzone, DropzoneInput } from "./dropzone";
import { FilterBar } from "./filter-bar";
import { NotificationMenu } from "./notification-menu";
import { PlatformNavbar, type PlatformNavbarGroup } from "./platform-navbar";
import { ResponsiveActionMenu } from "./responsive-action-menu";
import { SearchField } from "./search-field";
import { SelectionToolbar } from "./selection-toolbar";
import { StateView } from "./state-view";
import { UploadQueue, type UploadQueueFile } from "./upload-queue";
import { WorkbenchLayout } from "./workbench-layout";

const rows = [{ name: "Package" }];
const columns = [{ accessorKey: "name", header: "Name" }];
const navigationGroups: PlatformNavbarGroup[] = [
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

    render(
      <>
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
        <PlatformNavbar brand="Platform" groups={navigationGroups} />
        <CommandPalette open={false} groups={commandGroups} />
        <UploadQueue items={uploads} />
        <Dropzone htmlFor="contract-upload">
          <DropzoneInput id="contract-upload" />
        </Dropzone>
        <WorkbenchLayout leftPanel={<nav>Tools</nav>}>Workbench</WorkbenchLayout>
      </>,
    );

    expect(screen.getByText("Package")).toBeTruthy();
    expect(screen.getByText("Empty")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear selection" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onSelectionClear).toHaveBeenCalled();
    expect(screen.getByText("Platform")).toBeTruthy();
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.getAllByText("Workbench").length).toBeGreaterThan(0);
  });
});

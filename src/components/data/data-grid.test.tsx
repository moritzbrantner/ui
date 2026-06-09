import { existsSync, readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Calendar,
  CalendarCardDayButton,
  CalendarDayButton,
  type CalendarCellComponentProps,
  type CalendarDayComponentProps,
  type CalendarIcsData,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
  CommandShortcut,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
  cn,
  CopyButton,
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DotsSpinner,
  Dropzone,
  DropzoneContent,
  DropzoneDefaultIcon,
  DropzoneDescription,
  DropzoneIcon,
  DropzoneInput,
  DropzoneTitle,
  DropdownMenuShortcut,
  Empty,
  EmptyDescription,
  EmptyTitle,
  Kbd,
  LoadingBar,
  MenubarShortcut,
  MobileSlide,
  MobileSlideBody,
  MobileSlideClose,
  MobileSlideContent,
  MobileSlideDescription,
  MobileSlideFooter,
  MobileSlideHeader,
  MobileSlideTitle,
  MobileSlideTrigger,
  Spinner,
  PulseSpinner,
  Stat,
  StatDelta,
  StatGroup,
  StatLabel,
  StatValue,
  Stepper,
  StepperConnector,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  Switch,
  Toggle,
  ToggleSetting,
  Toolbar,
  ToolbarGroup,
  ToolbarSpacer,
  ToolbarTitle,
  defaultUiThemeName,
  themeConfig,
  uiThemeLabels,
  uiThemeNames,
  type UiThemeName,
} from "../../index";
import { DataGrid, DataGridColumnHeader } from "../../data";
import {
  ActionBar,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageShell,
  PageTitle,
  Navbar,
  type NavbarGroup,
  SectionGrid,
  Surface,
  SurfaceContent,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "../../shell";
import {
  Chat,
  ChatBubble,
  ChatComposer,
  ChatComposerInput,
  ChatHeader,
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageMeta,
  ChatSendButton,
  ChatThread,
  ChatTitle,
} from "../../social";
import {
  AnnotationCanvas,
  type AnnotationCanvasAnnotation,
  type AnnotationCanvasTool,
  AssetBrowser,
  type AssetBrowserItem,
  DocumentViewer,
  type DocumentViewerHighlight,
  type DocumentViewerPageData,
  QueryBuilder,
  evaluateQueryBuilderExpression,
  serializeQueryBuilderExpression,
  type QueryBuilderExpression,
  type QueryBuilderField,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from "../../labs";
import { AtlasTheme, atlasTheme, uiTheme as atlasUiTheme } from "../../atlas";
import { BobbaTheme, bobbaTheme, uiTheme as bobbaUiTheme } from "../../bobba";
import { PaperTheme, paperTheme, uiTheme as paperUiTheme } from "../../paper";
import { StudioTheme, studioTheme, uiTheme as studioUiTheme } from "../../studio";
import { ZleekTheme, uiTheme as zleekUiTheme, zleekTheme } from "../../zleek";
import { Button as BobbaButton, Button as ZleekButton } from "../stable/button";

const shadcnBasicComponentFiles = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "date-picker",
  "dialog",
  "direction",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "loading-bar",
  "menubar",
  "native-select",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
  "typography",
] as const;

const calendarIcsData = [
  "vcalendar",
  [
    ["version", {}, "text", "2.0"],
    ["prodid", {}, "text", "-//platform-packages//Calendar Test//EN"],
  ],
  [
    [
      "vevent",
      [
        ["uid", {}, "text", "design-sync"],
        ["summary", {}, "text", "Design sync"],
        ["dtstart", {}, "date-time", "2026-04-15T09:00:00Z"],
        ["dtend", {}, "date-time", "2026-04-15T09:30:00Z"],
      ],
      [],
    ],
    [
      "vevent",
      [
        ["uid", {}, "text", "release-window"],
        ["summary", {}, "text", "Release window"],
        ["dtstart", {}, "date", "2026-04-18"],
        ["dtend", {}, "date", "2026-04-20"],
      ],
      [],
    ],
    [
      "vevent",
      [
        ["uid", {}, "text", "product-summit"],
        ["summary", {}, "text", "Product summit"],
        ["dtstart", {}, "date", "2026-04-21"],
        ["dtend", {}, "date", "2026-04-24"],
      ],
      [],
    ],
    [
      "vevent",
      [
        ["uid", {}, "text", "company-holiday"],
        ["summary", {}, "text", "Company holiday"],
        ["dtstart", {}, "date", "2026-04-27"],
        ["dtend", {}, "date", "2026-04-28"],
      ],
      [],
    ],
  ],
] as const satisfies CalendarIcsData;

const navigationGroups = [
  {
    id: "discover",
    label: "Discover",
    eyebrow: "Public",
    description: "Open routes for visitors.",
    items: [
      {
        id: "about",
        label: "About",
        href: "#about",
        description: "Project overview and status.",
      },
      {
        id: "story",
        label: "Story Demo",
        href: "#story",
        description: "Narrative component preview.",
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "people",
        label: "People",
        href: "#people",
        description: "Directory and profiles.",
      },
      {
        id: "forms",
        label: "Forms",
        href: "#forms",
      },
    ],
  },
] as const satisfies NavbarGroup[];

function createRect({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON() {
      return this;
    },
  } as DOMRect;
}

describe("@moritzbrantner/ui data-grid", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  test("renders DataGrid workflows for filtering, sorting, selection, columns, and pagination", async () => {
    type Row = {
      id: string;
      name: string;
      status: string;
    };
    const rows: Row[] = [
      { id: "1", name: "Charlie", status: "pending" },
      { id: "2", name: "Alpha", status: "paid" },
      { id: "3", name: "Beta", status: "overdue" },
    ];
    const columns: ColumnDef<Row>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => <DataGridColumnHeader column={column} title="Name" />,
      },
      {
        accessorKey: "status",
        header: "status",
      },
    ];
    const onSelectedRowsChange = vi.fn();

    render(
      <DataGrid
        columns={columns}
        data={rows}
        enableRowSelection
        pageSize={2}
        onSelectedRowsChange={onSelectedRowsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search rows"), { target: { value: "Beta" } });
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.queryByText("Charlie")).toBeNull();

    fireEvent.change(screen.getByLabelText("Search rows"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(screen.getByText("Alpha")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    await waitFor(() => {
      expect(onSelectedRowsChange).toHaveBeenCalledWith([
        expect.objectContaining({ name: "Alpha" }),
      ]);
    });

    expect(screen.getByRole("button", { name: /View/ })).toBeTruthy();
    expect(
      screen.getByLabelText("Search rows").closest('[data-slot="data-grid-toolbar"]')?.className,
    ).toContain("flex-col");
    expect(
      screen.getByText(/row\(s\) selected/).closest('[data-slot="data-grid-pagination"]')
        ?.className,
    ).toContain("flex-col");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Charlie")).toBeTruthy();
  });

  test("toggles DataGrid column visibility through the table toolbar API", () => {
    type Row = { name: string; status: string };
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "status", header: "Status" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[{ name: "Alpha", status: "paid" }]}
        toolbar={(table) => (
          <button type="button" onClick={() => table.getColumn("status")?.toggleVisibility(false)}>
            Hide status
          </button>
        )}
      />,
    );

    expect(screen.getByText("paid")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hide status" }));
    expect(screen.queryByText("paid")).toBeNull();
  });

  test("filters DataGrid columns from the header context menu", async () => {
    type Row = {
      name: string;
      status: string;
    };
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "status", header: "Status" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[
          { name: "Alpha", status: "paid" },
          { name: "Beta", status: "pending" },
          { name: "Charlie", status: "overdue" },
        ]}
      />,
    );

    fireEvent.contextMenu(screen.getByText("Status"));

    expect(await screen.findByText("Filter Status")).toBeTruthy();

    fireEvent.click(screen.getByRole("checkbox", { name: "Filter Status by paid" }));

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeTruthy();
      expect(screen.queryByText("Beta")).toBeNull();
      expect(screen.queryByText("Charlie")).toBeNull();
    });
  });

  test("uses numeric inputs for number column header filters", async () => {
    type Row = {
      name: string;
      amount: number;
    };
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "amount", header: "Amount" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[
          { name: "Small", amount: 15 },
          { name: "Medium", amount: 40 },
          { name: "Large", amount: 90 },
        ]}
      />,
    );

    fireEvent.contextMenu(screen.getByText("Amount"));

    expect(await screen.findByText("Filter Amount")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Minimum Amount"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Maximum Amount"), { target: { value: "80" } });

    await waitFor(() => {
      expect(screen.queryByText("Small")).toBeNull();
      expect(screen.getByText("Medium")).toBeTruthy();
      expect(screen.queryByText("Large")).toBeNull();
    });
  });

  test("uses date inputs for date column header filters", async () => {
    type Row = {
      name: string;
      created: string;
    };
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "created", header: "Created" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[
          { name: "Early", created: "2026-05-20" },
          { name: "Inside", created: "2026-06-12" },
          { name: "Late", created: "2026-07-02" },
        ]}
      />,
    );

    fireEvent.contextMenu(screen.getByText("Created"));

    expect(await screen.findByText("Filter Created")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("From Created"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("To Created"), {
      target: { value: "2026-06-30" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Early")).toBeNull();
      expect(screen.getByText("Inside")).toBeTruthy();
      expect(screen.queryByText("Late")).toBeNull();
    });
  });

  test("uses boolean selects for boolean column header filters", async () => {
    type Row = {
      name: string;
      published: boolean;
    };
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "published", header: "Published" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[
          { name: "Draft", published: false },
          { name: "Live", published: true },
        ]}
      />,
    );

    fireEvent.contextMenu(screen.getByText("Published"));

    expect(await screen.findByText("Filter Published")).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: "Filter Published" }));
    fireEvent.click(await screen.findByRole("option", { name: "False" }));

    await waitFor(() => {
      expect(screen.getByText("Draft")).toBeTruthy();
      expect(screen.queryByText("Live")).toBeNull();
    });
  });

  test("renders DataGrid loading, empty, and error states", () => {
    const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];
    const { rerender } = render(<DataGrid columns={columns} data={[]} loading />);

    expect(screen.getByRole("status").textContent).toContain("Loading rows");

    rerender(<DataGrid columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeTruthy();

    rerender(<DataGrid columns={columns} data={[]} error="Load failed" />);
    expect(screen.getByText("Load failed")).toBeTruthy();
  });

  test("uses controlled global filter state", () => {
    const onGlobalFilterChange = vi.fn();
    const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];

    render(
      <DataGrid
        columns={columns}
        data={[{ name: "Alpha" }, { name: "Beta" }]}
        state={{ globalFilter: "Alpha" }}
        onGlobalFilterChange={onGlobalFilterChange}
      />,
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.queryByText("Beta")).toBeNull();

    fireEvent.change(screen.getByLabelText("Search rows"), { target: { value: "Beta" } });

    expect(onGlobalFilterChange).toHaveBeenCalledWith("Beta");
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  test("supports manual pagination callbacks", () => {
    const onPaginationChange = vi.fn();
    const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];

    render(
      <DataGrid
        columns={columns}
        data={[{ name: "Alpha" }]}
        manualPagination
        pageCount={3}
        state={{ pagination: { pageIndex: 0, pageSize: 1 } }}
        onPaginationChange={onPaginationChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPaginationChange).toHaveBeenCalled();
  });

  test("passes manual sorting and filtering callbacks without local-only assumptions", () => {
    const onSortingChange = vi.fn();
    const onColumnFiltersChange = vi.fn();
    const columns: ColumnDef<{ name: string; status: string }>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => <DataGridColumnHeader column={column} title="Name" />,
      },
      { accessorKey: "status", header: "Status" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[{ name: "Alpha", status: "paid" }]}
        manualSorting
        manualFiltering
        onSortingChange={onSortingChange}
        onColumnFiltersChange={onColumnFiltersChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Name/i }));

    expect(onSortingChange).toHaveBeenCalled();

    fireEvent.contextMenu(screen.getByText("Status"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Filter Status by paid" }));

    expect(onColumnFiltersChange).toHaveBeenCalled();
  });

  test("selection callback still returns selected rows", async () => {
    const onSelectedRowsChange = vi.fn();
    const columns: ColumnDef<{ id: string; name: string }>[] = [
      { accessorKey: "name", header: "Name" },
    ];

    render(
      <DataGrid
        columns={columns}
        data={[{ id: "a", name: "Alpha" }]}
        getRowId={(row) => row.id}
        enableRowSelection
        onSelectedRowsChange={onSelectedRowsChange}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row" }));

    await waitFor(() => {
      expect(onSelectedRowsChange).toHaveBeenLastCalledWith([{ id: "a", name: "Alpha" }]);
    });
  });
});

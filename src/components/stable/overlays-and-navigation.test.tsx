import { existsSync, readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  ActionMenu,
  ActionSheet,
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
  ContextActionMenu,
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
  HoverPreview,
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
  ResponsiveActionMenu,
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
  NavbarActions,
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
import {
  BobbaTheme,
  Button as BobbaButton,
  bobbaTheme,
  uiTheme as bobbaUiTheme,
} from "../../bobba";
import { PaperTheme, paperTheme, uiTheme as paperUiTheme } from "../../paper";
import { StudioTheme, studioTheme, uiTheme as studioUiTheme } from "../../studio";
import {
  Button as ZleekButton,
  ZleekTheme,
  uiTheme as zleekUiTheme,
  zleekTheme,
} from "../../zleek";

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
  "chart",
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

describe("@moritzbrantner/ui overlays-and-navigation", () => {
  test("opens context menus and invokes selected menu actions", async () => {
    const onSelect = vi.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button variant="outline">Clip</Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Duplicate</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));

    const item = await screen.findByText("Duplicate");
    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("shows shortcut hints based on pressed modifiers", async () => {
    render(
      <>
        <CommandShortcut data-testid="plain-command-shortcut" shortcut="r" />
        <ContextMenuShortcut data-testid="child-plain-shortcut">O</ContextMenuShortcut>
        <DropdownMenuShortcut data-testid="modified-dropdown-shortcut" shortcut="ctrl+k" />
        <MenubarShortcut data-testid="child-modified-shortcut">Ctrl+N</MenubarShortcut>
      </>,
    );

    expect(screen.getByTestId("plain-command-shortcut").textContent).toBe("R");
    expect(screen.getByTestId("child-plain-shortcut").textContent).toBe("O");
    expect(screen.queryByTestId("modified-dropdown-shortcut")).toBeNull();
    expect(screen.queryByTestId("child-modified-shortcut")).toBeNull();

    fireEvent.keyDown(window, { ctrlKey: true, key: "Control" });

    await waitFor(() => {
      expect(screen.queryByTestId("plain-command-shortcut")).toBeNull();
      expect(screen.queryByTestId("child-plain-shortcut")).toBeNull();
      expect(screen.getByTestId("modified-dropdown-shortcut").textContent).toBe("Ctrl+K");
      expect(screen.getByTestId("child-modified-shortcut").textContent).toBe("Ctrl+N");
    });

    fireEvent.keyUp(window, { ctrlKey: false, key: "Control" });

    await waitFor(() => {
      expect(screen.getByTestId("plain-command-shortcut").textContent).toBe("R");
      expect(screen.getByTestId("child-plain-shortcut").textContent).toBe("O");
      expect(screen.queryByTestId("modified-dropdown-shortcut")).toBeNull();
      expect(screen.queryByTestId("child-modified-shortcut")).toBeNull();
    });
  });

  test("opens dialogs from triggers and renders accessible content", async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open details</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Package details</DialogTitle>
            <DialogDescription>Stable downstream dialog contract.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open details" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Package details")).toBeTruthy();
    expect(screen.getByText("Stable downstream dialog contract.")).toBeTruthy();
  });

  test("opens a mobile slide with accessible drawer content", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <MobileSlide>
        <MobileSlideTrigger asChild>
          <Button>Open filters</Button>
        </MobileSlideTrigger>
        <MobileSlideContent showCloseButton>
          <MobileSlideHeader>
            <MobileSlideTitle>Filters</MobileSlideTitle>
            <MobileSlideDescription>Review queue controls.</MobileSlideDescription>
          </MobileSlideHeader>
          <MobileSlideBody>Only show blockers.</MobileSlideBody>
          <MobileSlideFooter>
            <MobileSlideClose asChild>
              <Button>Apply</Button>
            </MobileSlideClose>
          </MobileSlideFooter>
        </MobileSlideContent>
      </MobileSlide>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open filters" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Filters")).toBeTruthy();
    expect(screen.getByText("Only show blockers.")).toBeTruthy();
  });

  test("renders composed action overlays without changing primitive escape hatches", async () => {
    render(
      <>
        <ActionMenu
          defaultOpen
          modal={false}
          trigger={<Button>Open action menu</Button>}
          items={[{ id: "copy", label: "Copy" }]}
        />
        <ContextActionMenu items={[{ id: "inspect", label: "Inspect" }]}>
          <Button>Context target</Button>
        </ContextActionMenu>
        <ActionSheet
          trigger={<Button>Open sheet actions</Button>}
          title="Sheet actions"
          description="Touch-first action surface."
          items={[{ id: "archive", label: "Archive" }]}
        />
        <ResponsiveActionMenu
          mode="desktop"
          trigger={<Button>Open responsive actions</Button>}
          items={[{ id: "share", label: "Share" }]}
        />
        <HoverPreview
          open
          trigger={<Button>Preview target</Button>}
          title="Preview"
          description="Read-only content."
        />
      </>,
    );

    expect(await screen.findByRole("menuitem", { name: "Copy" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open sheet actions" })).toBeTruthy();
    expect(screen.getByText("Preview")).toBeTruthy();

    fireEvent.contextMenu(screen.getByRole("button", { name: "Context target" }));
    expect(await screen.findByRole("menuitem", { name: "Inspect" })).toBeTruthy();
  });

  test("renders an animated glass navbar with an open submenu", () => {
    render(
      <Navbar
        brand="Platform"
        groups={navigationGroups}
        activeItemId="people"
        defaultOpenGroupId="workspace"
        variant="web"
      />,
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
    const trigger = screen.getByRole("button", { name: /Workspace/ });
    const submenu = screen
      .getByText("Directory and profiles.")
      .closest('[data-slot="navbar-submenu"]');

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(submenu?.id);
    expect(submenu?.className).toContain("fixed");
    expect(submenu?.className).toContain("z-[100]");
    expect(screen.getByRole("link", { name: /People/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Directory and profiles.")).toBeTruthy();
  });

  test("renders the composed theme, notification, and avatar actions", () => {
    render(
      <Navbar
        brand="Platform"
        groups={navigationGroups}
        defaultOpenGroupId={null}
        variant="web"
        actionSlot={
          <NavbarActions
            accountMenu={{
              user: { name: "Mira Brandt", email: "mira@example.com", initials: "MB" },
              items: [{ id: "profile", label: "Profile" }],
            }}
            notificationMenu={{
              unreadCount: 3,
              items: [{ id: "mention", title: "New mention", unread: true }],
            }}
            languageSwitcher={{ defaultValue: "de" }}
            themeModeSwitch={{ defaultMode: "dark" }}
          />
        }
      />,
    );

    expect(screen.getByRole("button", { name: "Language: Deutsch" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Color mode" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Notifications, 3 unread" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open account menu" })).toBeTruthy();
    expect(screen.getByText("MB")).toBeTruthy();
    expect(screen.queryByText("Mira Brandt")).toBeNull();
  });

  test("anchors the mobile navbar submenu to the centered navbar", async () => {
    render(
      <Navbar
        brand="Platform"
        groups={navigationGroups}
        defaultOpenGroupId={null}
        variant="mobile"
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Primary navigation" });
    const container = nav.parentElement;
    const trigger = screen.getByRole("button", { name: /Workspace/ });

    expect(container).toBeTruthy();
    vi.spyOn(container as HTMLElement, "getBoundingClientRect").mockReturnValue(
      createRect({ left: 0, top: 0, width: 800, height: 220 }),
    );
    vi.spyOn(nav, "getBoundingClientRect").mockReturnValue(
      createRect({ left: 176, top: 0, width: 448, height: 80 }),
    );
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(
      createRect({ left: 320, top: 24, width: 160, height: 48 }),
    );

    fireEvent.click(trigger);

    await waitFor(() => {
      const submenu = screen
        .getByText("Directory and profiles.")
        .closest('[data-slot="navbar-submenu"]') as HTMLElement | null;

      expect(submenu?.style.left).toBe("184px");
      expect(submenu?.style.top).toBe("88px");
      expect(submenu?.style.width).toBe("432px");
    });
  });

  test("keeps only the latest navbar submenu open across mounted navbars", async () => {
    render(
      <>
        <Navbar
          aria-label="First navigation"
          brand="First"
          groups={navigationGroups}
          defaultOpenGroupId="discover"
          variant="web"
        />
        <Navbar
          aria-label="Second navigation"
          brand="Second"
          groups={navigationGroups}
          defaultOpenGroupId="workspace"
          variant="web"
        />
      </>,
    );

    await waitFor(() => {
      expect(document.querySelectorAll('[data-slot="navbar-submenu"]').length).toBe(1);
    });
    expect(screen.queryByText("Open routes for visitors.")).toBeNull();
    expect(screen.getByText("Directory and profiles.")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: /Discover/ })[0]);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-slot="navbar-submenu"]').length).toBe(1);
    });
    expect(screen.getByText("Open routes for visitors.")).toBeTruthy();
    expect(screen.queryByText("Directory and profiles.")).toBeNull();
  });

  test("opens submenus and reports selected navbar items", () => {
    const onNavigate = vi.fn();

    render(
      <Navbar
        brand="Platform"
        groups={navigationGroups}
        defaultOpenGroupId={null}
        onNavigate={onNavigate}
        variant="desktop"
      />,
    );

    expect(screen.queryByRole("link", { name: /About/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Discover/ }));
    expect(screen.getByRole("link", { name: /About/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: /Story Demo/ }));
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "story" }),
      expect.objectContaining({ id: "discover" }),
    );
  });
});

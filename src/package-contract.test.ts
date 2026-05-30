import { existsSync, readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import {
  ActionMenu,
  type ActionMenuProps,
  ActionSheet,
  type ActionSheetProps,
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
  CommandPalette,
  CommandShortcut,
  type CommandPaletteGroup,
  ContextActionMenu,
  type ContextActionMenuProps,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
  cn,
  CopyButton,
  ComparisonMatrix,
  type ComparisonMatrixColumn,
  type ComparisonMatrixRowData,
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
  BlocksSpinner,
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
  EmptyState,
  ErrorState,
  FunnelChart,
  type FunnelChartSegmentData,
  HoverPreview,
  type HoverPreviewProps,
  Infographic,
  Kbd,
  LanguageSwitcher,
  type LanguageSwitcherLanguage,
  LoadingBar,
  LoadingState,
  type MenuActionCheckboxItem,
  type MenuActionCommandItem,
  type MenuActionItem,
  type MenuActionRadioGroupItem,
  MenubarShortcut,
  MetricStrip,
  type MetricStripItemData,
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
  type ResponsiveActionMenuProps,
  ShortcutList,
  Spinner,
  OrbitSpinner,
  OrgChart,
  type OrgChartNodeData,
  PolygonSpinner,
  PulseSpinner,
  ProcessMap,
  type ProcessMapStepData,
  Stat,
  StatDelta,
  StatGroup,
  StatLabel,
  StatValue,
  StateView,
  Stepper,
  StepperConnector,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  Switch,
  ThemeModeSwitch,
  type ThemeMode,
  Toggle,
  ToggleSetting,
  Toolbar,
  ToolbarGroup,
  ToolbarSpacer,
  ToolbarTitle,
  UploadQueue,
  ValidationSummary,
  WorkbenchLayout,
  RelationshipMap,
  type RelationshipMapEdge,
  type RelationshipMapNode,
  defaultUiThemeName,
  themeConfig,
  uiThemeLabels,
  uiThemeNames,
  type UiThemeName,
} from ".";
import * as RootExports from ".";
import {
  DataGrid,
  DataGridColumnHeader,
  FilterBar,
  FilterChip,
  SearchField,
  SelectionToolbar,
} from "./data";
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
} from "./shell";
import { AtlasTheme, atlasTheme, uiTheme as atlasUiTheme } from "./atlas";
import { atlasTheme as atlasServerTheme, uiTheme as atlasServerUiTheme } from "./atlas-server";
import { BobbaTheme, Button as BobbaButton, bobbaTheme, uiTheme as bobbaUiTheme } from "./bobba";
import { bobbaTheme as bobbaServerTheme, uiTheme as bobbaServerUiTheme } from "./bobba-server";
import { Button as ClientButton, Dialog as ClientDialog } from "./client";
import { Button as SubpathButton } from "./components/stable/button";
import { ComparisonMatrix as SubpathComparisonMatrix } from "./components/stable/comparison-matrix";
import { FunnelChart as SubpathFunnelChart } from "./components/stable/funnel-chart";
import { Infographic as SubpathInfographic } from "./components/stable/infographic";
import { MetricStrip as SubpathMetricStrip } from "./components/stable/metric-strip";
import { OrgChart as SubpathOrgChart } from "./components/stable/org-chart";
import { ProcessMap as SubpathProcessMap } from "./components/stable/process-map";
import { RelationshipMap as SubpathRelationshipMap } from "./components/stable/relationship-map";
import { ActionMenu as SubpathActionMenu } from "./components/patterns/action-menu";
import { ActionSheet as SubpathActionSheet } from "./components/patterns/action-sheet";
import { ContextActionMenu as SubpathContextActionMenu } from "./components/patterns/context-action-menu";
import { DataGrid as SubpathDataGrid } from "./components/data/data-grid";
import { Dialog as SubpathDialog } from "./components/stable/dialog";
import { FilterBar as SubpathFilterBar } from "./components/data/filter-bar";
import { HoverPreview as SubpathHoverPreview } from "./components/patterns/hover-preview";
import { Navbar as SubpathNavbar } from "./components/shell/navbar";
import { NavbarActions as SubpathNavbarActions } from "./components/shell/navbar-actions";
import { Chat as SubpathChat } from "./components/social/chat";
import { getMenuActionItemText as subpathGetMenuActionItemText } from "./components/patterns/menu-actions";
import { ResponsiveActionMenu as SubpathResponsiveActionMenu } from "./components/patterns/responsive-action-menu";
import { componentRegistry } from "./component-registry";
import { AnimatedImage, ImageCarousel, ImageGallery, ImageThumbnailStrip } from "./media";
import { AnimatedImage as SubpathAnimatedImage } from "./components/media/animated-image";
import { ImageCarousel as SubpathImageCarousel } from "./components/media/image-carousel";
import { ImageGallery as SubpathImageGallery } from "./components/media/image-gallery";
import { ImageThumbnailStrip as SubpathImageThumbnailStrip } from "./components/media/image-thumbnail-strip";
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
  createQueryBuilderGroup,
  evaluateQueryBuilderExpression,
  serializeQueryBuilderExpression,
  type QueryBuilderExpression,
  type QueryBuilderField,
  type QueryBuilderIdFactory,
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from "./labs";
import { PaperTheme, paperTheme, uiTheme as paperUiTheme } from "./paper";
import { paperTheme as paperServerTheme, uiTheme as paperServerUiTheme } from "./paper-server";
import { cn as serverCn, themeConfig as serverThemeConfig } from "./server";
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
  ProfileSummary,
  SocialActionGroup,
  SocialPost,
} from "./social";
import { StudioTheme, studioTheme, uiTheme as studioUiTheme } from "./studio";
import { studioTheme as studioServerTheme, uiTheme as studioServerUiTheme } from "./studio-server";
import { Button as ZleekButton, ZleekTheme, uiTheme as zleekUiTheme, zleekTheme } from "./zleek";
import { uiTheme as zleekServerUiTheme, zleekTheme as zleekServerTheme } from "./zleek-server";

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

describe("@moritzbrantner/ui package-contract", () => {
  test("declares the reusable design-system package contract", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const consumerExample = readFileSync("examples/consumer/src/App.tsx", "utf8");

    expect(packageJson.name).toBe("@moritzbrantner/ui");
    expect(packageJson.private).toBe(false);
    expect(packageJson.peerDependencies.react).toBeTruthy();
    expect(packageJson.peerDependencies["react-dom"]).toBeTruthy();
    expect(packageJson.files).toEqual(
      expect.arrayContaining([
        "dist",
        "styles.css",
        "theme-scopes.css",
        "zleek",
        "bobba",
        "atlas",
        "studio",
        "paper",
      ]),
    );
    expect(packageJson.sideEffects).toEqual(expect.arrayContaining(["*.css"]));
    expect(packageJson.exports["./styles.css"]).toBe("./styles.css");
    expect(packageJson.exports["./theme-scopes.css"]).toBe("./theme-scopes.css");
    expect(packageJson.exports["./zleek/styles.css"]).toBe("./zleek/styles.css");
    expect(packageJson.exports["./bobba/styles.css"]).toBe("./bobba/styles.css");
    expect(packageJson.exports["./atlas"].import).toBe("./dist/atlas.js");
    expect(packageJson.exports["./atlas/server"].import).toBe("./dist/atlas/server.js");
    expect(packageJson.exports["./atlas/server"].types).toBe("./dist/atlas/server.d.ts");
    expect(packageJson.exports["./studio"].import).toBe("./dist/studio.js");
    expect(packageJson.exports["./studio/server"].import).toBe("./dist/studio/server.js");
    expect(packageJson.exports["./studio/server"].types).toBe("./dist/studio/server.d.ts");
    expect(packageJson.exports["./paper"].import).toBe("./dist/paper.js");
    expect(packageJson.exports["./paper/server"].import).toBe("./dist/paper/server.js");
    expect(packageJson.exports["./paper/server"].types).toBe("./dist/paper/server.d.ts");
    expect(packageJson.exports["./zleek/server"].import).toBe("./dist/zleek/server.js");
    expect(packageJson.exports["./zleek/server"].types).toBe("./dist/zleek/server.d.ts");
    expect(packageJson.exports["./bobba/server"].import).toBe("./dist/bobba/server.js");
    expect(packageJson.exports["./bobba/server"].types).toBe("./dist/bobba/server.d.ts");
    expect(packageJson.exports["./server"].import).toBe("./dist/server.js");
    expect(packageJson.exports["./server"].types).toBe("./dist/server.d.ts");
    expect(packageJson.exports["./client"].import).toBe("./dist/client.js");
    expect(packageJson.exports["./client"].types).toBe("./dist/client.d.ts");
    expect(packageJson.exports["./stable"].import).toBe("./dist/stable.js");
    expect(packageJson.exports["./patterns"].import).toBe("./dist/patterns.js");
    expect(packageJson.exports["./data"].import).toBe("./dist/data.js");
    expect(packageJson.exports["./shell"].import).toBe("./dist/shell.js");
    expect(packageJson.exports["./social"].import).toBe("./dist/social.js");
    expect(packageJson.exports["./social"].types).toBe("./dist/social.d.ts");
    expect(packageJson.exports["./media"].import).toBe("./dist/media.js");
    expect(packageJson.exports["./media"].types).toBe("./dist/media.d.ts");
    expect(packageJson.exports["./labs"].import).toBe("./dist/labs.js");
    expect(packageJson.exports["./legacy"]).toBeUndefined();
    expect(packageJson.exports["./atlas/styles.css"]).toBe("./atlas/styles.css");
    expect(packageJson.exports["./studio/styles.css"]).toBe("./studio/styles.css");
    expect(packageJson.exports["./paper/styles.css"]).toBe("./paper/styles.css");
    expect(packageJson.exports["./components/*"]).toBeUndefined();
    expect(packageJson.exports["./components/stable/*"].import).toBe(
      "./dist/components/stable/*.js",
    );
    expect(packageJson.exports["./components/patterns/*"].import).toBe(
      "./dist/components/patterns/*.js",
    );
    expect(packageJson.exports["./components/data/*"].import).toBe("./dist/components/data/*.js");
    expect(packageJson.exports["./components/shell/*"].import).toBe("./dist/components/shell/*.js");
    expect(packageJson.exports["./components/social/*"].import).toBe(
      "./dist/components/social/*.js",
    );
    expect(packageJson.exports["./components/media/*"].import).toBe("./dist/components/media/*.js");
    expect(packageJson.exports["./components/labs/*"].import).toBe("./dist/components/labs/*.js");
    expect(packageJson.exports["./components/legacy/*"]).toBeUndefined();
    expect(packageJson.exports["./lib/cn"].import).toBe("./dist/lib/cn.js");
    expect(consumerExample).toContain('import "@moritzbrantner/ui/styles.css";');
    expect(consumerExample).toContain('from "@moritzbrantner/ui"');
  });

  test("ships tiered component source and root barrels by governance policy", () => {
    const indexSource = readFileSync("src/index.ts", "utf8");
    const stableSource = readFileSync("src/stable.ts", "utf8");
    const patternsSource = readFileSync("src/patterns.ts", "utf8");

    for (const componentFile of shadcnBasicComponentFiles) {
      const entry = componentRegistry.find((component) => component.fileName === componentFile);
      expect(entry, `${componentFile} must be registered`).toBeTruthy();
      expect(existsSync(`src/components/${entry?.tier}/${componentFile}.tsx`)).toBe(true);
      if (entry?.tier === "stable") {
        expect(stableSource).toContain(`export * from "./components/stable/${componentFile}";`);
      }
      if (entry?.tier === "patterns") {
        expect(patternsSource).toContain(`export * from "./components/patterns/${componentFile}";`);
      }
    }

    expect(indexSource).toContain('export * from "./stable";');
    expect(indexSource).toContain('export * from "./patterns";');
    expect(indexSource).not.toContain('export * from "./data";');
    expect(indexSource).not.toContain('export * from "./shell";');
    expect(indexSource).not.toContain('export * from "./media";');
    expect(indexSource).not.toContain('export * from "./labs";');
    expect(Object.hasOwn(RootExports, "DataTable")).toBe(false);
    expect(Object.hasOwn(RootExports, "DataGrid")).toBe(false);
    expect(Object.hasOwn(RootExports, "Navbar")).toBe(false);
    expect(Object.hasOwn(RootExports, "AnimatedImage")).toBe(false);
    expect(Object.hasOwn(RootExports, "ImageCarousel")).toBe(false);
    expect(Object.hasOwn(RootExports, "ImageCropper")).toBe(false);
    expect(Object.hasOwn(RootExports, "ImageGallery")).toBe(false);
    expect(Object.hasOwn(RootExports, "ImageThumbnailStrip")).toBe(false);
    expect(Object.hasOwn(RootExports, "WorkflowBuilder")).toBe(false);
    expect(Object.hasOwn(RootExports, "Chat")).toBe(false);
    expect(Object.hasOwn(RootExports, "Chat" + "Box")).toBe(false);
  });

  test("merges class names", () => {
    expect(cn("px-4", "px-2", "font-semibold")).toBe("px-2 font-semibold");
  });

  test("exposes explicit server, client, and representative subpath APIs", () => {
    expect(serverCn("px-4", "px-2")).toBe("px-2");
    expect(serverThemeConfig.bobba.name).toBe("bobba");
    expect(ClientButton).toBe(Button);
    expect(ClientDialog).toBe(Dialog);
    expect(SubpathButton).toBe(Button);
    expect(SubpathComparisonMatrix).toBe(ComparisonMatrix);
    expect(SubpathFunnelChart).toBe(FunnelChart);
    expect(SubpathInfographic).toBe(Infographic);
    expect(SubpathMetricStrip).toBe(MetricStrip);
    expect(SubpathOrgChart).toBe(OrgChart);
    expect(SubpathProcessMap).toBe(ProcessMap);
    expect(SubpathRelationshipMap).toBe(RelationshipMap);
    expect(SubpathActionMenu).toBe(ActionMenu);
    expect(SubpathActionSheet).toBe(ActionSheet);
    expect(SubpathContextActionMenu).toBe(ContextActionMenu);
    expect(SubpathDataGrid).toBe(DataGrid);
    expect(SubpathDialog).toBe(Dialog);
    expect(SubpathFilterBar).toBe(FilterBar);
    expect(SubpathHoverPreview).toBe(HoverPreview);
    expect(SubpathNavbar).toBe(Navbar);
    expect(SubpathNavbarActions).toBe(NavbarActions);
    expect(SubpathResponsiveActionMenu).toBe(ResponsiveActionMenu);
    expect(SubpathChat).toBe(Chat);
    expect(SubpathAnimatedImage).toBe(AnimatedImage);
    expect(SubpathImageCarousel).toBe(ImageCarousel);
    expect(SubpathImageGallery).toBe(ImageGallery);
    expect(SubpathImageThumbnailStrip).toBe(ImageThumbnailStrip);
    expect(subpathGetMenuActionItemText({ id: "contract", label: "Contract" })).toBe("Contract");
    expect(typeof FilterChip).toBe("function");
    expect(typeof ActionMenu).toBe("function");
    expect(typeof ContextActionMenu).toBe("function");
    expect(typeof ActionSheet).toBe("function");
    expect(typeof ResponsiveActionMenu).toBe("function");
    expect(typeof HoverPreview).toBe("function");
    expect(typeof FunnelChart).toBe("function");
    expect(typeof MetricStrip).toBe("function");
    expect(typeof ProcessMap).toBe("function");
    expect(typeof ComparisonMatrix).toBe("function");
    expect(typeof OrgChart).toBe("function");
    expect(typeof RelationshipMap).toBe("function");
    expect(typeof Infographic).toBe("function");
    expect(typeof SocialActionGroup).toBe("function");
    expect(typeof SocialPost).toBe("function");
    expect(typeof ProfileSummary).toBe("function");
    expect(typeof AnimatedImage).toBe("function");
    expect(typeof ImageCarousel).toBe("function");
    expect(typeof ImageGallery).toBe("function");
    expect(typeof ImageThumbnailStrip).toBe("function");
    const rootMenuActionItem: MenuActionItem = { id: "contract-action", label: "Contract action" };
    const rootCommandItem: MenuActionCommandItem = {
      id: "contract-command",
      label: "Contract command",
    };
    const rootCheckboxItem: MenuActionCheckboxItem = {
      id: "contract-checkbox",
      type: "checkbox",
      label: "Contract checkbox",
    };
    const rootRadioGroupItem: MenuActionRadioGroupItem = {
      id: "contract-radio",
      type: "radio-group",
      options: [{ id: "one", label: "One", value: "one" }],
    };
    const actionMenuProps: ActionMenuProps = {
      trigger: React.createElement("button", { type: "button" }, "Actions"),
      items: [rootMenuActionItem],
    };
    const contextActionMenuProps: ContextActionMenuProps = {
      children: React.createElement("button", { type: "button" }, "Target"),
      items: [rootCommandItem],
    };
    const actionSheetProps: ActionSheetProps = { items: [rootCheckboxItem] };
    const responsiveActionMenuProps: ResponsiveActionMenuProps = {
      trigger: React.createElement("button", { type: "button" }, "Responsive"),
      items: [rootRadioGroupItem],
    };
    const hoverPreviewProps: HoverPreviewProps = {
      trigger: React.createElement("button", { type: "button" }, "Preview"),
      title: "Preview",
    };
    const metricItem: MetricStripItemData = {
      id: "contract-metric",
      label: "Contract metric",
      value: "42",
      deltaTone: "positive",
    };
    const funnelSegment: FunnelChartSegmentData = {
      id: "contract-segment",
      label: "Contract segment",
      value: 42,
    };
    const processStep: ProcessMapStepData = {
      id: "contract-step",
      label: "Contract step",
      status: "active",
      tone: "accent",
    };
    const matrixColumn: ComparisonMatrixColumn = {
      id: "contract-column",
      label: "Contract column",
    };
    const matrixRow: ComparisonMatrixRowData = {
      id: "contract-row",
      label: "Contract row",
      values: { "contract-column": "Ready" },
      toneByColumn: { "contract-column": "positive" },
    };
    const orgNode: OrgChartNodeData = {
      id: "contract-node",
      label: "Contract node",
      children: [{ id: "contract-child", label: "Contract child" }],
    };
    const relationshipNode: RelationshipMapNode = {
      id: "contract-source",
      label: "Contract source",
      tone: "accent",
    };
    const relationshipEdge: RelationshipMapEdge = {
      id: "contract-edge",
      source: "contract-source",
      target: "contract-target",
      kind: "dependency",
      direction: "both",
    };
    expect(actionMenuProps.items).toHaveLength(1);
    expect(contextActionMenuProps.items).toHaveLength(1);
    expect(actionSheetProps.items).toHaveLength(1);
    expect(responsiveActionMenuProps.items).toHaveLength(1);
    expect(hoverPreviewProps.title).toBe("Preview");
    expect(metricItem.deltaTone).toBe("positive");
    expect(funnelSegment.value).toBe(42);
    expect(processStep.status).toBe("active");
    expect(matrixColumn.id).toBe("contract-column");
    expect(matrixRow.toneByColumn?.["contract-column"]).toBe("positive");
    expect(orgNode.children).toHaveLength(1);
    expect(relationshipNode.tone).toBe("accent");
    expect(relationshipEdge.direction).toBe("both");
    const queryBuilderIdFactory: QueryBuilderIdFactory = (kind) => `contract-${kind}`;
    const queryBuilderGroup = createQueryBuilderGroup([], queryBuilderIdFactory);
    expect(queryBuilderGroup.id).toBe("contract-group");
  });

  test("exposes metadata-only theme server entrypoints", () => {
    const serverThemeEntries = [
      {
        name: "zleek",
        label: "Zleek",
        uiTheme: zleekServerUiTheme,
        theme: zleekServerTheme,
      },
      {
        name: "bobba",
        label: "Bobba",
        uiTheme: bobbaServerUiTheme,
        theme: bobbaServerTheme,
      },
      {
        name: "atlas",
        label: "Atlas",
        uiTheme: atlasServerUiTheme,
        theme: atlasServerTheme,
      },
      {
        name: "studio",
        label: "Studio",
        uiTheme: studioServerUiTheme,
        theme: studioServerTheme,
      },
      {
        name: "paper",
        label: "Paper",
        uiTheme: paperServerUiTheme,
        theme: paperServerTheme,
      },
    ] as const;

    for (const themeEntry of serverThemeEntries) {
      expect(themeEntry.uiTheme.name).toBe(themeEntry.name);
      expect(themeEntry.theme.name).toBe(themeEntry.name);
      expect(themeEntry.uiTheme).toBe(themeEntry.theme);
      expect(themeEntry.uiTheme).toBe(serverThemeConfig[themeEntry.name]);
      expect(uiThemeLabels[themeEntry.name]).toBe(themeEntry.label);
    }
  });
});

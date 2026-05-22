import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  AccountMenu,
  NotificationMenu,
  PlatformNavbar,
  type PlatformNavbarGroup,
} from "../../index";
import {
  DocumentViewer,
  ImageCropper,
  ImageFilterEditor,
  InspectorPanel,
  QueryBuilder,
  TimelineEditor,
  WorkflowBuilder,
  WorkflowNode,
  type InspectorPanelSectionData,
  type QueryBuilderExpression,
  type QueryBuilderField,
  type TimelineEditorTrack,
  type WorkflowBuilderEdge,
  type WorkflowBuilderNodeData,
} from "../../labs";

const imageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23d9e2ff'/%3E%3C/svg%3E";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    bottom: 240,
    height: 240,
    left: 0,
    right: 320,
    toJSON: () => ({}),
    top: 0,
    width: 320,
    x: 0,
    y: 0,
  }));
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function openMenu(trigger: HTMLElement) {
  fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });
}

const workflowNodes: WorkflowBuilderNodeData[] = [
  {
    id: "source",
    label: "Source",
    x: 24,
    y: 40,
    outputs: [{ id: "records", label: "Records", kind: "record" }],
  },
  {
    id: "review",
    label: "Review",
    x: 320,
    y: 72,
    inputs: [{ id: "records", label: "Records", kind: "record" }],
  },
];

const workflowEdges: WorkflowBuilderEdge[] = [
  {
    id: "source-review",
    sourceNodeId: "source",
    sourcePortId: "records",
    targetNodeId: "review",
    targetPortId: "records",
  },
];

describe("@moritzbrantner/ui release readiness composed components", () => {
  test("document viewer changes pages, searches text, and selects highlights", async () => {
    const onPageChange = vi.fn();
    const onHighlightSelect = vi.fn();

    render(
      <DocumentViewer
        pages={[
          { id: "page-1", pageNumber: 1, width: 320, height: 420, text: "Release checklist" },
          { id: "page-2", pageNumber: 2, width: 320, height: 420, text: "Exception report" },
        ]}
        highlights={[
          {
            id: "risk",
            label: "Risk note",
            pageId: "page-1",
            rects: [{ x: 0.1, y: 0.1, width: 0.3, height: 0.08 }],
          },
        ]}
        onHighlightSelect={onHighlightSelect}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByLabelText("Document page 1").getAttribute("data-slot")).toBe(
      "document-viewer-page",
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ id: "page-2" }));

    fireEvent.change(screen.getByLabelText("Search document"), {
      target: { value: "exception" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: "page-2" }));

    fireEvent.click(screen.getByRole("button", { name: "Thumbnail page 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Risk note" }));
    expect(onHighlightSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "risk" }));
  });

  test("image cropper supports keyboard and button crop changes", () => {
    const onCropChange = vi.fn();

    render(<ImageCropper src={imageSrc} alt="Release preview" onCropChange={onCropChange} />);

    const surface = screen.getByRole("application", { name: "Crop image" });
    expect(surface.getAttribute("data-slot")).toBe("image-cropper-surface");

    surface.focus();
    fireEvent.keyDown(surface, { key: "ArrowRight" });
    expect(onCropChange).toHaveBeenCalledWith(expect.objectContaining({ x: 8 }));

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onCropChange).toHaveBeenLastCalledWith(expect.objectContaining({ zoom: 1.1 }));
  });

  test("image filter editor applies presets, compare mode, and reset", () => {
    const onValueChange = vi.fn();

    render(
      <ImageFilterEditor
        src={imageSrc}
        alt="Filtered release image"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Warm" }));
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ sepia: 18 }));

    fireEvent.click(screen.getByRole("button", { name: "Show compare preview" }));
    expect(screen.getByText("Before / After")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ brightness: 100, contrast: 100, sepia: 0 }),
    );
  });

  test("inspector panel tracks dirty values, validation text, reset, and apply callbacks", () => {
    const onValuesChange = vi.fn();
    const onApply = vi.fn();
    const sections: InspectorPanelSectionData[] = [
      {
        id: "content",
        title: "Content",
        fields: [
          { id: "title", label: "Title", type: "text", value: "Draft release" },
          { id: "published", label: "Published", type: "boolean", value: false },
        ],
      },
    ];

    render(
      <InspectorPanel
        sections={sections}
        validationMessages={{ title: "Title needs review." }}
        onApply={onApply}
        onValuesChange={onValuesChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Release 0.5.4" } });

    expect(screen.getByText("Unsaved")).toBeTruthy();
    expect(screen.getByText("Title needs review.")).toBeTruthy();
    expect(onValuesChange).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Release 0.5.4" }),
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ title: "Release 0.5.4" }));

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onValuesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Draft release" }),
      false,
    );
  });

  test("platform navbar opens a group, navigates, and renders integrated action menus", async () => {
    const onNavigate = vi.fn();
    const groups: PlatformNavbarGroup[] = [
      {
        id: "workspace",
        label: "Workspace",
        items: [
          { id: "overview", label: "Overview" },
          { id: "reports", label: "Reports" },
        ],
      },
    ];

    render(
      <PlatformNavbar
        brand="Platform"
        groups={groups}
        defaultOpenGroupId="workspace"
        notificationMenu={{
          unreadCount: 1,
          items: [{ id: "approval", title: "Approval needed", unread: true }],
        }}
        accountMenu={{ user: { name: "Ada Lovelace", initials: "AL" } }}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(await screen.findByText("Reports"));
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "reports" }),
      expect.objectContaining({ id: "workspace" }),
    );
    expect(screen.getByRole("button", { name: "Notifications, 1 unread" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open account menu" })).toBeTruthy();
  });

  test("query builder reports expression changes from UI edits", () => {
    const onExpressionChange = vi.fn();
    const fields: QueryBuilderField[] = [
      { id: "title", label: "Title", type: "text" },
      { id: "score", label: "Score", type: "number" },
    ];

    render(<QueryBuilder fields={fields} onExpressionChange={onExpressionChange} />);

    fireEvent.change(screen.getByLabelText("Rule value"), {
      target: { value: "release" },
    });

    expect(onExpressionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        rules: [expect.objectContaining({ fieldId: "title", value: "release" })],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    expect(onExpressionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rules: expect.arrayContaining([expect.objectContaining({ fieldId: "title" })]),
      }),
    );
  });

  test("timeline editor selects clips, nudges selected clips, deletes, and moves playhead", () => {
    const onTracksChange = vi.fn();
    const onClipDelete = vi.fn();
    const onCurrentTimeChange = vi.fn();
    const tracks: TimelineEditorTrack[] = [
      {
        id: "main",
        label: "Main",
        clips: [{ id: "intro", label: "Intro", start: 1, end: 3 }],
      },
    ];

    render(
      <TimelineEditor
        tracks={tracks}
        duration={10}
        selectedClipId="intro"
        onClipDelete={onClipDelete}
        onCurrentTimeChange={onCurrentTimeChange}
        onTracksChange={onTracksChange}
      />,
    );

    const editor = screen
      .getByText("Intro")
      .closest('[data-slot="timeline-editor"]') as HTMLElement;

    fireEvent.keyDown(editor, { key: "ArrowRight" });
    expect(onTracksChange).toHaveBeenCalledWith([
      expect.objectContaining({
        clips: [expect.objectContaining({ id: "intro", start: 1.25, end: 3.25 })],
      }),
    ]);

    fireEvent.keyDown(editor, { key: "Delete" });
    expect(onClipDelete).toHaveBeenCalledWith("intro");

    fireEvent.pointerDown(document.querySelector('[data-slot="timeline-editor-ruler"]')!);
    expect(onCurrentTimeChange).toHaveBeenCalledWith(0);
  });

  test("workflow builder selects nodes and deletes the selected graph item", () => {
    const onNodesChange = vi.fn();
    const onEdgesChange = vi.fn();
    const onSelectionChange = vi.fn();

    render(
      <WorkflowBuilder
        nodes={workflowNodes}
        edges={workflowEdges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "node", id: "source" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));
    expect(onNodesChange).toHaveBeenCalledWith([expect.objectContaining({ id: "review" })]);
    expect(onEdgesChange).toHaveBeenCalledWith([]);
  });

  test("workflow node exposes selection, port, and minimized callbacks", () => {
    const onNodeSelect = vi.fn();
    const onOutputClick = vi.fn();
    const onMinimizedChange = vi.fn();

    render(
      <WorkflowNode
        node={workflowNodes[0]}
        onMinimizedChange={onMinimizedChange}
        onNodeSelect={onNodeSelect}
        onOutputClick={onOutputClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Source" }));
    expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "source" }));

    fireEvent.click(screen.getByRole("button", { name: "Source Records" }));
    expect(onOutputClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "records" }),
      expect.objectContaining({ id: "source" }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Minimize Source" }));
    expect(onMinimizedChange).toHaveBeenCalledWith(expect.objectContaining({ id: "source" }), true);
  });

  test("account and notification menus preserve state-light callbacks and disabled states", async () => {
    const onAccountSelect = vi.fn();
    const onNotificationSelect = vi.fn();

    render(
      <>
        <AccountMenu
          user={{ name: "Ada Lovelace", initials: "AL" }}
          items={[
            { id: "settings", label: "Settings", onSelect: onAccountSelect },
            { id: "billing", label: "Billing", disabled: true },
          ]}
        />
        <NotificationMenu
          items={[
            {
              id: "approval",
              title: "Approval needed",
              unread: true,
              onSelect: onNotificationSelect,
            },
            { id: "archived", title: "Archived", disabled: true },
          ]}
          maxItems={1}
        />
      </>,
    );

    openMenu(screen.getByRole("button", { name: "Open account menu" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Settings" }));
    await waitFor(() => expect(onAccountSelect).toHaveBeenCalledTimes(1));

    openMenu(screen.getByRole("button", { name: "Notifications, 1 unread" }));
    const notificationMenu = await screen.findByRole("menu");
    fireEvent.click(within(notificationMenu).getByRole("menuitem", { name: /Approval needed/ }));
    expect(onNotificationSelect).toHaveBeenCalledTimes(1);
    expect(within(notificationMenu).queryByText("Archived")).toBeNull();
  });
});

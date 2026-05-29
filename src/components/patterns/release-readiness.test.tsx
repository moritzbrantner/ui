import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  AccountMenu,
  NotificationMenu,
  PlatformNavbar,
  PlatformNavbarActions,
  type PlatformNavbarGroup,
} from "../../index";
import {
  DocumentViewer,
  ImageCropper,
  ImageFilterEditor,
  QueryBuilder,
  type QueryBuilderExpression,
  type QueryBuilderField,
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
        actionSlot={
          <PlatformNavbarActions
            notificationMenu={{
              unreadCount: 1,
              items: [{ id: "approval", title: "Approval needed", unread: true }],
            }}
            accountMenu={{ user: { name: "Ada Lovelace", initials: "AL" } }}
          />
        }
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

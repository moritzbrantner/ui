import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { Calendar, CalendarCardDayButton, type CalendarIcsData } from "../../stable";
import { DataGrid } from "../../patterns";
import {
  AnnotationCanvas,
  DocumentViewer,
  type TimelineEditorTrack,
  WorkflowBuilder,
  WorkflowNode,
  getWorkflowBuilderConnectionValidity,
  getWorkflowNodeSize,
  moveTimelineEditorClip,
  resizeTimelineEditorClip,
} from "../../labs";

describe("@moritzbrantner/ui component edge cases", () => {
  test("renders cross-month calendar events in card layouts", () => {
    const icsData: CalendarIcsData = [
      "vcalendar",
      [
        ["version", {}, "text", "2.0"],
        ["prodid", {}, "text", "-//platform-packages//Cross Month Test//EN"],
      ],
      [
        [
          "vevent",
          [
            ["uid", {}, "text", "cross-month"],
            ["summary", {}, "text", "Cross-month launch"],
            ["dtstart", {}, "date", "2026-03-31"],
            ["dtend", {}, "date", "2026-04-03"],
          ],
          [],
        ],
      ],
    ];

    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 3, 1)}
        mode="single"
        showOutsideDays={false}
        variant="cards"
        dayComponent={CalendarCardDayButton}
        icsData={icsData}
      />,
    );

    expect(screen.getAllByText("Cross-month launch").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-multi-day-event='true']")).toBeTruthy();
  });

  test("keeps DataGrid selection callbacks aligned after filtering and sorting", async () => {
    type Row = { id: string; name: string; status: string };
    const rows: Row[] = [
      { id: "1", name: "Charlie", status: "pending" },
      { id: "2", name: "Alpha", status: "paid" },
      { id: "3", name: "Beta", status: "overdue" },
    ];
    const columns: ColumnDef<Row>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "status", header: "Status" },
    ];
    const onSelectedRowsChange = vi.fn();

    render(
      <DataGrid
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        enableRowSelection
        onSelectedRowsChange={onSelectedRowsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search rows"), { target: { value: "Alpha" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row" }));

    await waitFor(() => {
      expect(onSelectedRowsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ id: "2", name: "Alpha" }),
      ]);
    });
  });

  test("DocumentViewer handles empty searches without page navigation", () => {
    const onPageChange = vi.fn();

    render(<DocumentViewer pages={[]} onPageChange={onPageChange} />);

    fireEvent.change(screen.getByLabelText("Search document"), { target: { value: "invoice" } });

    expect(screen.getByText("0 matches")).toBeTruthy();
    expect(screen.getByText("No document pages available.")).toBeTruthy();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test("timeline helpers clamp moves and resizes to duration and minimum size", () => {
    const tracks: TimelineEditorTrack[] = [
      {
        id: "main",
        label: "Main",
        clips: [{ id: "clip", label: "Clip", start: 2, end: 5 }],
      },
    ];

    expect(moveTimelineEditorClip(tracks, "clip", -4, { duration: 10 })[0].clips[0]).toEqual(
      expect.objectContaining({ start: 0, end: 3 }),
    );
    expect(moveTimelineEditorClip(tracks, "clip", 20, { duration: 10 })[0].clips[0]).toEqual(
      expect.objectContaining({ start: 7, end: 10 }),
    );
    expect(
      resizeTimelineEditorClip(tracks, "clip", "start", 4.95, { minDuration: 1 })[0].clips[0],
    ).toEqual(expect.objectContaining({ start: 4 }));
    expect(
      resizeTimelineEditorClip(tracks, "clip", "end", 20, { duration: 8 })[0].clips[0],
    ).toEqual(expect.objectContaining({ end: 8 }));
  });

  test("workflow connection validation rejects missing ports, duplicate edges, and kind mismatches", () => {
    const nodes = [
      {
        id: "source",
        label: "Source",
        x: 0,
        y: 0,
        outputs: [{ id: "document", label: "Document", kind: "document" }],
      },
      {
        id: "ocr",
        label: "OCR",
        x: 200,
        y: 0,
        inputs: [{ id: "text", label: "Text", kind: "text" }],
      },
    ];
    const duplicateEdge = {
      id: "edge",
      sourceNodeId: "source",
      sourcePortId: "document",
      targetNodeId: "ocr",
      targetPortId: "document",
    };

    expect(
      getWorkflowBuilderConnectionValidity({
        nodes,
        edges: [],
        sourceNodeId: "missing",
        sourcePortId: "document",
        targetNodeId: "ocr",
        targetPortId: "text",
      }),
    ).toEqual({ valid: false, reason: "missing-port" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes,
        edges: [],
        sourceNodeId: "source",
        sourcePortId: "document",
        targetNodeId: "ocr",
        targetPortId: "text",
      }),
    ).toEqual({ valid: false, reason: "kind-mismatch" });
    expect(
      getWorkflowBuilderConnectionValidity({
        nodes: [
          nodes[0],
          {
            ...nodes[1],
            inputs: [{ id: "document", label: "Document", kind: "document" }],
          },
        ],
        edges: [duplicateEdge],
        sourceNodeId: "source",
        sourcePortId: "document",
        targetNodeId: "ocr",
        targetPortId: "document",
      }),
    ).toEqual({ valid: false, reason: "duplicate" });
  });

  test("workflow builder connects the selected output port to the selected input port", () => {
    const onEdgesChange = vi.fn();
    const nodes = [
      {
        id: "source",
        label: "Source",
        x: 0,
        y: 0,
        outputs: [
          { id: "image", label: "Image", kind: "image" },
          { id: "text", label: "Text", kind: "text" },
        ],
      },
      {
        id: "merge",
        label: "Merge",
        x: 320,
        y: 0,
        inputs: [
          { id: "image", label: "Image", kind: "image" },
          { id: "table", label: "Table", kind: "table" },
          { id: "text", label: "Text", kind: "text" },
        ],
      },
    ];

    const { container } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[
          {
            id: "source-text-merge-text",
            sourceNodeId: "source",
            sourcePortId: "text",
            targetNodeId: "merge",
            targetPortId: "text",
          },
        ]}
        onEdgesChange={onEdgesChange}
      />,
    );

    expect(container.querySelector("[data-slot='workflow-builder-edge']")?.getAttribute("d")).toBe(
      "M 310 209 C 358 209, 272 281, 320 281",
    );

    fireEvent.click(screen.getByRole("button", { name: "Start Source Image" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect to Merge Image" }));

    expect(onEdgesChange).toHaveBeenCalledWith([
      {
        id: "source-text-merge-text",
        sourceNodeId: "source",
        sourcePortId: "text",
        targetNodeId: "merge",
        targetPortId: "text",
      },
      {
        id: "edge-source-image-merge-image",
        sourceNodeId: "source",
        sourcePortId: "image",
        targetNodeId: "merge",
        targetPortId: "image",
      },
    ]);
  });

  test("workflow builder minimizes nodes without losing edge routing", () => {
    const onNodesChange = vi.fn();
    const nodes = [
      {
        id: "source",
        label: "Source",
        x: 0,
        y: 0,
        outputs: [
          { id: "image", label: "Image", kind: "image" },
          { id: "text", label: "Text", kind: "text" },
        ],
      },
      {
        id: "merge",
        label: "Merge",
        x: 320,
        y: 0,
        minimized: true,
        inputs: [
          { id: "image", label: "Image", kind: "image" },
          { id: "text", label: "Text", kind: "text" },
        ],
      },
    ];

    const { container } = render(
      <WorkflowBuilder
        nodes={nodes}
        edges={[
          {
            id: "source-text-merge-text",
            sourceNodeId: "source",
            sourcePortId: "text",
            targetNodeId: "merge",
            targetPortId: "text",
          },
        ]}
        onNodesChange={onNodesChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Expand Merge" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(container.querySelector("[data-slot='workflow-builder-edge']")?.getAttribute("d")).toBe(
      "M 310 209 C 358 209, 272 86, 320 86",
    );

    fireEvent.click(screen.getByRole("button", { name: "Minimize Source" }));

    expect(onNodesChange).toHaveBeenCalledWith([
      {
        ...nodes[0],
        minimized: true,
      },
      nodes[1],
    ]);
  });

  test("annotation and workflow surfaces preserve read-only and empty-state contracts", () => {
    const onAnnotationsChange = vi.fn();
    const onNodesChange = vi.fn();

    const { container } = render(
      <>
        <AnnotationCanvas
          annotations={[]}
          tool="rectangle"
          readOnly
          width={200}
          height={120}
          onAnnotationsChange={onAnnotationsChange}
        />
        <WorkflowBuilder nodes={[]} edges={[]} onNodesChange={onNodesChange} />
      </>,
    );

    fireEvent.pointerDown(screen.getByRole("img", { name: "Annotation canvas" }), {
      clientX: 20,
      clientY: 20,
    });
    fireEvent.keyDown(container.querySelector("[data-slot='workflow-builder']")!, {
      key: "Delete",
    });

    expect(onAnnotationsChange).not.toHaveBeenCalled();
    expect(onNodesChange).not.toHaveBeenCalled();
    expect(container.querySelector("[data-slot='workflow-builder-surface']")).toBeTruthy();
  });

  test("workflow node supports compact summaries and expanded port metadata", () => {
    const onMenuItemSelect = vi.fn();

    render(
      <>
        <WorkflowNode
          node={{
            id: "expanded",
            label: "Classify",
            category: "AI",
            packageLabel: "@platform/classification",
            description: "Assign taxonomy labels from normalized text.",
            tags: ["routing", "review"],
            inputs: [
              {
                id: "text",
                label: "Text",
                kind: "text",
                required: true,
                description: "Normalized OCR output.",
              },
            ],
            outputs: [
              {
                id: "labels",
                label: "Labels",
                kind: "labels",
                description: "Predicted taxonomy labels.",
              },
            ],
          }}
          menuItems={[{ id: "inspect", label: "Inspect" }]}
          onMenuItemSelect={onMenuItemSelect}
        />
        <WorkflowNode
          node={{
            id: "compact",
            label: "Publish",
            variant: "compact",
            description: "Forward workflow state to delivery channels.",
            inputs: [{ id: "labels", label: "Labels", kind: "labels" }],
            outputs: [{ id: "event", label: "Webhook", kind: "event" }],
          }}
        />
        <WorkflowNode
          node={{
            id: "minimized",
            label: "Review",
            minimized: true,
            description: "Hidden while minimized.",
            inputs: [{ id: "task", label: "Task", kind: "task" }],
            outputs: [{ id: "done", label: "Done", kind: "event" }],
          }}
          onMinimizedChange={vi.fn()}
        />
      </>,
    );

    expect(screen.getByText("Assign taxonomy labels from normalized text.")).toBeTruthy();
    expect(screen.getByText("@platform/classification")).toBeTruthy();
    expect(screen.queryByText("routing")).toBeNull();
    expect(screen.queryByText("review")).toBeNull();
    expect(document.querySelector("[data-slot='workflow-node-ports']")?.className).toContain(
      "px-0",
    );
    expect(screen.getByText("required")).toBeTruthy();
    expect(screen.getByText("labels -> event")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Minimize Classify" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Classify menu" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Expand Review" })).toBeTruthy();
    expect(screen.queryByText("Hidden while minimized.")).toBeNull();
    fireEvent.keyDown(screen.getByRole("button", { name: "Open Classify menu" }), {
      code: "Enter",
      key: "Enter",
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Inspect" }));
    expect(onMenuItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "inspect" }),
      expect.objectContaining({ id: "expanded" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Minimize Classify" }));
    expect(screen.getByRole("button", { name: "Expand Classify" })).toBeTruthy();
    expect(getWorkflowNodeSize({ id: "compact", label: "Publish", variant: "compact" })).toEqual({
      width: 240,
      height: 48,
    });
    expect(getWorkflowNodeSize({ id: "minimized", label: "Review", minimized: true })).toEqual({
      width: 230,
      height: 94,
    });
  });
});

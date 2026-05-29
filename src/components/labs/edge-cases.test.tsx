import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

import { Calendar, CalendarCardDayButton, type CalendarIcsData } from "../../stable";
import { DataGrid } from "../../data";
import { AnnotationCanvas, DocumentViewer } from "../../labs";

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

  test("annotation canvas preserves read-only contracts", () => {
    const onAnnotationsChange = vi.fn();

    render(
      <AnnotationCanvas
        annotations={[]}
        tool="rectangle"
        readOnly
        width={200}
        height={120}
        onAnnotationsChange={onAnnotationsChange}
      />,
    );

    fireEvent.pointerDown(screen.getByRole("img", { name: "Annotation canvas" }), {
      clientX: 20,
      clientY: 20,
    });

    expect(onAnnotationsChange).not.toHaveBeenCalled();
  });
});

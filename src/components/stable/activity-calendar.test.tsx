import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ActivityCalendar } from "./activity-calendar";

describe("activity calendar", () => {
  test("renders a date-indexed intensity calendar with generic labels", () => {
    render(
      <ActivityCalendar
        data={[
          { date: "2026-08-03", value: 5 },
          { date: "2026-08-04", value: 10 },
        ]}
        startDate="2026-08-01"
        endDate="2026-08-14"
      />,
    );

    expect(screen.getByRole("grid", { name: "Activity calendar" })).toBeTruthy();
    expect(screen.getByText("Aug")).toBeTruthy();
    expect(screen.getByLabelText("5 activities on August 3, 2026").getAttribute("data-level")).toBe(
      "2",
    );
    expect(
      screen.getByLabelText("10 activities on August 4, 2026").getAttribute("data-level"),
    ).toBe("4");
  });

  test("combines duplicate dates before calculating intensity", () => {
    render(
      <ActivityCalendar
        data={[
          { date: "2026-08-03", value: 2 },
          { date: "2026-08-03", value: 3 },
        ]}
        startDate="2026-08-03"
        endDate="2026-08-03"
      />,
    );

    expect(screen.getByLabelText("5 activities on August 3, 2026")).toBeTruthy();
  });

  test("supports arrow-key navigation between days", () => {
    render(
      <ActivityCalendar
        data={[]}
        startDate="2026-08-01"
        endDate="2026-08-14"
        showMonthLabels={false}
        showWeekdayLabels={false}
      />,
    );

    const first = screen.getByLabelText("0 activities on August 1, 2026");
    const nextDay = screen.getByLabelText("0 activities on August 2, 2026");
    const nextWeek = screen.getByLabelText("0 activities on August 9, 2026");

    fireEvent.focus(first);
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(nextDay);

    fireEvent.keyDown(nextDay, { key: "ArrowRight" });
    expect(document.activeElement).toBe(nextWeek);
  });

  test("aligns ARIA rows with the visual weekday rows", () => {
    render(
      <ActivityCalendar
        data={[]}
        startDate="2026-08-01"
        endDate="2026-08-14"
        showMonthLabels={false}
        showWeekdayLabels={false}
      />,
    );

    const augustSecond = screen.getByLabelText("0 activities on August 2, 2026");
    const augustNinth = screen.getByLabelText("0 activities on August 9, 2026");
    const augustThird = screen.getByLabelText("0 activities on August 3, 2026");

    const sundayRow = augustSecond.closest('[role="row"]');

    expect(sundayRow?.contains(augustNinth)).toBe(true);
    expect(sundayRow?.contains(augustThird)).toBe(false);
    expect(screen.getAllByRole("row")).toHaveLength(7);
  });

  test("moves between visual week columns in RTL direction", () => {
    render(
      <div dir="rtl">
        <ActivityCalendar
          data={[]}
          startDate="2026-08-01"
          endDate="2026-08-14"
          showMonthLabels={false}
          showWeekdayLabels={false}
        />
      </div>,
    );

    const currentWeek = screen.getByLabelText("0 activities on August 2, 2026");
    const visuallyLeftWeek = screen.getByLabelText("0 activities on August 9, 2026");

    fireEvent.focus(currentWeek);
    fireEvent.keyDown(currentWeek, { key: "ArrowLeft" });

    expect(document.activeElement).toBe(visuallyLeftWeek);
  });

  test("activates days without embedding product-specific activity semantics", () => {
    const onDayClick = vi.fn();

    render(
      <ActivityCalendar
        data={[{ date: "2026-08-03", value: 7, label: "Seven completed items" }]}
        startDate="2026-08-03"
        endDate="2026-08-03"
        onDayClick={onDayClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Seven completed items" }));

    expect(onDayClick).toHaveBeenCalledWith({
      date: "2026-08-03",
      value: 7,
      label: "Seven completed items",
    });
  });

  test("supports presentation variants and custom value formatting", () => {
    render(
      <ActivityCalendar
        data={[{ date: "2026-08-03", value: 1 }]}
        startDate="2026-08-03"
        endDate="2026-08-03"
        variant="compact"
        formatValue={(value) => `${value} contribution`}
      />,
    );

    expect(screen.getByLabelText("1 contribution on August 3, 2026")).toBeTruthy();
    expect(
      document.querySelector('[data-slot="activity-calendar"]')?.getAttribute("data-variant"),
    ).toBe("compact");
  });
});

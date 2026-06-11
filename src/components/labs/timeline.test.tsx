import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "./timeline";

describe("Timeline", () => {
  test("renders a composable timeline with stable slots", () => {
    const { container } = render(
      <Timeline aria-label="Release milestones">
        <TimelineItem>
          <div>
            <TimelineIndicator />
            <TimelineConnector />
          </div>
          <TimelineContent>
            <TimelineTime dateTime="2026-06-10">June 10, 2026</TimelineTime>
            <TimelineTitle>Release checks ready</TimelineTitle>
            <TimelineDescription>
              Package checks can run against the labs surface.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByText("Release checks ready")).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-item"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-indicator"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-connector"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-content"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-title"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-description"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="timeline-time"]')).toBeTruthy();
    expect(screen.getByText("June 10, 2026").getAttribute("dateTime")).toBe("2026-06-10");
  });
});

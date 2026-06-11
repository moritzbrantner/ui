import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

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

const meta = {
  title: "Components/Data Display/Timeline",
  component: Timeline,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReleaseMilestones: Story = {
  render: () => (
    <Timeline className="max-w-2xl">
      <TimelineItem>
        <div className="grid justify-items-center">
          <TimelineIndicator />
          <TimelineConnector />
        </div>
        <TimelineContent>
          <TimelineTime dateTime="2026-06-03">June 3, 2026</TimelineTime>
          <TimelineTitle>Boundary review completed</TimelineTitle>
          <TimelineDescription>
            Component ownership findings were captured for shell, data display, and labs surfaces.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <div className="grid justify-items-center">
          <TimelineIndicator />
          <TimelineConnector />
        </div>
        <TimelineContent>
          <TimelineTime dateTime="2026-06-06">June 6, 2026</TimelineTime>
          <TimelineTitle>Coverage pass staged</TimelineTitle>
          <TimelineDescription>
            Labs display components received focused story and test coverage.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <div className="grid justify-items-center">
          <TimelineIndicator />
          <TimelineConnector />
        </div>
        <TimelineContent>
          <TimelineTime dateTime="2026-06-10">June 10, 2026</TimelineTime>
          <TimelineTitle>Release checks ready</TimelineTitle>
          <TimelineDescription>
            Package checks can run against the documented design-system contract.
          </TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Boundary review completed")).toBeVisible();
    await expect(canvas.getByText("June 10, 2026")).toBeVisible();
  },
};

export const Compact: Story = {
  render: () => (
    <Timeline className="max-w-sm">
      <TimelineItem>
        <div className="grid justify-items-center">
          <TimelineIndicator />
          <TimelineConnector />
        </div>
        <TimelineContent>
          <TimelineTime dateTime="2026-05-28">May 28</TimelineTime>
          <TimelineTitle>API reviewed</TimelineTitle>
          <TimelineDescription>Subpath imports and slots were checked.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <div className="grid justify-items-center">
          <TimelineIndicator />
          <TimelineConnector />
        </div>
        <TimelineContent>
          <TimelineTime dateTime="2026-06-04">June 4</TimelineTime>
          <TimelineTitle>Docs updated</TimelineTitle>
          <TimelineDescription>Follow-up decisions were recorded.</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

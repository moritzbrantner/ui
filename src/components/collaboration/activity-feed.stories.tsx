import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "../stable/avatar";
import {
  ActivityActor,
  ActivityContent,
  ActivityEmpty,
  ActivityFeed,
  ActivityGroup,
  ActivityItem,
  ActivityMeta,
} from "./activity-feed";

const meta = {
  title: "Components/Collaboration/Activity Feed",
  component: ActivityFeed,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof ActivityFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {
  render: () => (
    <ActivityFeed aria-label="Workspace activity" className="max-w-xl">
      <ActivityGroup>Today</ActivityGroup>
      <ActivityItem>
        <Avatar name="Ada Lovelace" />
        <ActivityContent>
          <ActivityActor>Ada Lovelace</ActivityActor> updated{" "}
          <a className="inline-flex min-h-10 items-center underline" href="#object">
            Launch brief
          </a>
          .
          <ActivityMeta dateTime="2026-08-27T10:42:00Z" timestamp="10:42">
            <button type="button" className="inline-flex min-h-10 items-center underline">
              View change
            </button>
          </ActivityMeta>
        </ActivityContent>
      </ActivityItem>
      <ActivityItem>
        <Avatar name="Grace Hopper" />
        <ActivityContent>
          <ActivityActor>Grace Hopper</ActivityActor> commented with a long note that wraps cleanly
          on narrow screens.
          <ActivityMeta dateTime="2026-08-27T09:18:00Z" timestamp="09:18" />
        </ActivityContent>
      </ActivityItem>
      <ActivityGroup>Yesterday</ActivityGroup>
      <ActivityItem>
        <Avatar name="Linus Torvalds" />
        <ActivityContent>
          <ActivityActor>Linus</ActivityActor> created the object.
        </ActivityContent>
      </ActivityItem>
    </ActivityFeed>
  ),
};

export const Empty: Story = {
  render: () => (
    <ActivityFeed>
      <ActivityEmpty>No activity yet</ActivityEmpty>
    </ActivityFeed>
  ),
};

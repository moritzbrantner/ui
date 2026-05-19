import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";
import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "./description-list";
import { Stat, StatDelta, StatGroup, StatLabel, StatValue } from "./stat";
import {
  Terminal,
  TerminalActions,
  TerminalCommand,
  TerminalContent,
  TerminalControls,
  TerminalHeader,
  TerminalLine,
  TerminalOutput,
  TerminalPrompt,
  TerminalTitle,
} from "./terminal";
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

function DisplayPreview() {
  return (
    <div className="grid max-w-3xl gap-6">
      <StatGroup>
        <Stat>
          <StatLabel>Requests</StatLabel>
          <StatValue>24.8k</StatValue>
          <StatDelta variant="positive">+8.2%</StatDelta>
        </Stat>
        <Stat>
          <StatLabel>Errors</StatLabel>
          <StatValue>12</StatValue>
          <StatDelta variant="negative">+3</StatDelta>
        </Stat>
      </StatGroup>

      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Environment</DescriptionListTerm>
          <DescriptionListDetail>Production</DescriptionListDetail>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Owner</DescriptionListTerm>
          <DescriptionListDetail>Platform</DescriptionListDetail>
        </DescriptionListItem>
      </DescriptionList>

      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>package.ts</CodeBlockTitle>
          <CodeBlockActions>
            <Badge variant="outline">tsx</Badge>
            <Button variant="ghost" size="xs">
              Copy
            </Button>
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent>
          <CodeBlockCode>{`export function ready() {
  return true
}`}</CodeBlockCode>
        </CodeBlockContent>
      </CodeBlock>

      <Terminal aria-label="Install command output">
        <TerminalHeader>
          <div className="flex min-w-0 items-center gap-3">
            <TerminalControls />
            <TerminalTitle>~/workspace/ui</TerminalTitle>
          </div>
          <TerminalActions>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              bash
            </Badge>
          </TerminalActions>
        </TerminalHeader>
        <TerminalContent>
          <TerminalLine>
            <TerminalPrompt />
            <TerminalCommand>bun install</TerminalCommand>
          </TerminalLine>
          <TerminalLine variant="muted">
            <TerminalOutput>Resolved, downloaded and extracted [214]</TerminalOutput>
          </TerminalLine>
          <TerminalLine variant="success">
            <TerminalOutput>Saved lockfile</TerminalOutput>
          </TerminalLine>
        </TerminalContent>
      </Terminal>

      <Timeline>
        <TimelineItem>
          <div>
            <TimelineIndicator />
            <TimelineConnector />
          </div>
          <TimelineContent>
            <TimelineTime dateTime="2026-04-20">Today</TimelineTime>
            <TimelineTitle>Components added</TimelineTitle>
            <TimelineDescription>
              Display primitives are exported from the UI package.
            </TimelineDescription>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <div>
            <TimelineIndicator />
            <TimelineConnector />
          </div>
          <TimelineContent>
            <TimelineTitle>Styles refined</TimelineTitle>
            <TimelineDescription>Cards and dialogs use calmer glass surfaces.</TimelineDescription>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  );
}

const meta = {
  title: "Components/Display",
  component: DisplayPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof DisplayPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("24.8k")).toBeVisible();
    await expect(canvas.getByText("package.ts")).toBeVisible();
    await expect(canvas.getByText("bun install")).toBeVisible();
    await expect(canvas.getByText("Components added")).toBeVisible();
  },
};

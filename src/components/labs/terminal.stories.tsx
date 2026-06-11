import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import {
  Terminal,
  TerminalCommand,
  TerminalContent,
  TerminalControls,
  TerminalCursor,
  TerminalHeader,
  TerminalLine,
  TerminalOutput,
  TerminalPrompt,
  TerminalTitle,
} from "./terminal";

const meta = {
  title: "Components/Data Display/Terminal",
  component: Terminal,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Terminal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Transcript: Story = {
  render: () => (
    <Terminal aria-label="Deploy transcript" className="max-w-2xl">
      <TerminalHeader>
        <TerminalControls />
        <TerminalTitle>~/workspace/ui</TerminalTitle>
      </TerminalHeader>
      <TerminalContent>
        <TerminalLine>
          <TerminalPrompt />
          <TerminalCommand>bun run verify</TerminalCommand>
        </TerminalLine>
        <TerminalLine>
          <TerminalOutput>checking package contract</TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="success">
          <TerminalOutput>success: type checks passed</TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="warning">
          <TerminalOutput>warning: benchmark cache reused</TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="error">
          <TerminalOutput>error: visual snapshot missing</TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="info">
          <TerminalOutput>info: open Storybook for review</TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="muted">
          <TerminalOutput>completed in 8.4s</TerminalOutput>
          <TerminalCursor />
        </TerminalLine>
      </TerminalContent>
    </Terminal>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("~/workspace/ui")).toBeVisible();
    await expect(canvas.getByText("bun run verify")).toBeVisible();
    await expect(canvas.getByText("success: type checks passed")).toBeVisible();
  },
};

export const WrappedOutput: Story = {
  render: () => (
    <Terminal aria-label="Wrapped terminal output" className="max-w-md">
      <TerminalHeader>
        <TerminalControls />
        <TerminalTitle>package-consumption.log</TerminalTitle>
      </TerminalHeader>
      <TerminalContent>
        <TerminalLine>
          <TerminalPrompt />
          <TerminalCommand>bun run verify:consumer</TerminalCommand>
        </TerminalLine>
        <TerminalLine variant="muted" wrap>
          <TerminalOutput>
            examples/consumer imports the published CSS entrypoints and component subpaths through
            the package boundary.
          </TerminalOutput>
        </TerminalLine>
        <TerminalLine variant="success">
          <TerminalOutput>success: consumer build completed</TerminalOutput>
        </TerminalLine>
      </TerminalContent>
    </Terminal>
  ),
};

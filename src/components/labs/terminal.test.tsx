import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

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

describe("Terminal", () => {
  test("renders a composable terminal transcript", () => {
    const { container } = render(
      <Terminal aria-label="Build output">
        <TerminalHeader>
          <TerminalControls />
          <TerminalTitle>~/workspace/ui</TerminalTitle>
        </TerminalHeader>
        <TerminalContent>
          <TerminalLine>
            <TerminalPrompt />
            <TerminalCommand>bun run build</TerminalCommand>
          </TerminalLine>
          <TerminalLine variant="success">
            <TerminalOutput>Build completed</TerminalOutput>
          </TerminalLine>
          <TerminalLine variant="muted" wrap>
            <TerminalOutput>dist/index.js 36.8 kB</TerminalOutput>
            <TerminalCursor />
          </TerminalLine>
        </TerminalContent>
      </Terminal>,
    );

    expect(screen.getByText("~/workspace/ui")).toBeTruthy();
    expect(screen.getByText("bun run build")).toBeTruthy();
    expect(screen.getByText("Build completed")).toBeTruthy();
    const root = container.querySelector("[data-slot='terminal']");
    const header = container.querySelector("[data-slot='terminal-header']");
    const defaultLine = container.querySelector("[data-slot='terminal-line']");
    const successLine = screen.getByText("Build completed").closest("[data-slot='terminal-line']");

    expect(root).toBeTruthy();
    expect(root?.className).toContain("bg-card");
    expect(root?.className).toContain("border-border");
    expect(root?.className).not.toContain("zinc-");
    expect(header?.className).not.toContain("zinc-");
    expect(defaultLine?.className).not.toContain("zinc-");
    expect(successLine?.className).toContain("text-[var(--chart-2)]");
    expect(container.querySelector("[data-slot='terminal-controls']")).toBeTruthy();
    expect(defaultLine?.getAttribute("data-variant")).toBe("default");
    expect(successLine?.getAttribute("data-variant")).toBe("success");
  });
});

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
    expect(container.querySelector("[data-slot='terminal']")).toBeTruthy();
    expect(container.querySelector("[data-slot='terminal-controls']")).toBeTruthy();
    expect(
      container.querySelector("[data-slot='terminal-line']")?.getAttribute("data-variant"),
    ).toBe("default");
    expect(
      screen
        .getByText("Build completed")
        .closest("[data-slot='terminal-line']")
        ?.getAttribute("data-variant"),
    ).toBe("success");
  });
});

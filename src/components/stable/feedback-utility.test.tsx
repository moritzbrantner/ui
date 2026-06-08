import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  CodeBlock,
  CodeBlockCode,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
  CopyButton,
  Kbd,
  KbdGroup,
  Spinner,
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  TypographyBlockquote,
  TypographyH2,
  TypographyInlineCode,
  TypographyLead,
  TypographyMuted,
  TypographyP,
} from "../../index";

beforeAll(() => {
  window.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("stable feedback and utility components", () => {
  test("renders alerts, badges, spinners, keyboard hints, and typography with slots", () => {
    render(
      <div>
        <Alert className="contract-alert">
          <AlertTitle>Release ready</AlertTitle>
          <AlertDescription>All checks passed.</AlertDescription>
          <AlertAction>
            <Button size="sm">View</Button>
          </AlertAction>
        </Alert>
        <Badge className="contract-badge">Stable</Badge>
        <Spinner aria-label="Loading package" />
        <KbdGroup>
          <Kbd>Meta</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <TypographyH2>Heading</TypographyH2>
        <TypographyLead>Lead text</TypographyLead>
        <TypographyP>Paragraph text</TypographyP>
        <TypographyMuted>Muted text</TypographyMuted>
        <TypographyBlockquote>Quoted text</TypographyBlockquote>
        <TypographyInlineCode>const value = true</TypographyInlineCode>
      </div>,
    );

    expect(screen.getByRole("alert").className).toContain("contract-alert");
    expect(screen.getByRole("heading", { level: 3, name: "Release ready" })).toBeTruthy();
    expect(screen.getByText("Stable").className).toContain("contract-badge");
    expect(screen.getByText("Stable").className).toContain("rounded-full");
    expect(screen.getByText("Stable").className).not.toContain("rounded-4xl");
    expect(screen.getByLabelText("Loading package")).toBeTruthy();
    expect(screen.getByText("Meta").getAttribute("data-slot")).toBe("kbd");
    expect(screen.getByRole("heading", { name: "Heading" })).toBeTruthy();
    expect(screen.getByText("const value = true").getAttribute("data-slot")).toBe(
      "typography-inline-code",
    );
  });

  test("supports configurable alert heading levels", () => {
    render(
      <Alert>
        <AlertTitle level={4}>Nested alert</AlertTitle>
      </Alert>,
    );

    expect(screen.getByRole("heading", { level: 4, name: "Nested alert" })).toBeTruthy();
  });

  test("renders code block and copy button workflow", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);

    render(
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>example.ts</CodeBlockTitle>
          <CopyButton value="const ok = true" copiedLabel="Copied code" copy={copy} />
        </CodeBlockHeader>
        <CodeBlockContent>
          <CodeBlockCode>const ok = true</CodeBlockCode>
        </CodeBlockContent>
      </CodeBlock>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => expect(copy).toHaveBeenCalledWith("const ok = true"));
    expect(await screen.findByRole("button", { name: "Copied code" })).toBeTruthy();
    expect(screen.getByText("example.ts").getAttribute("data-slot")).toBe("code-block-title");
  });

  test("renders toast primitives and sonner toaster container", () => {
    render(
      <div>
        <ToastProvider>
          <Toast open>
            <ToastTitle>Saved</ToastTitle>
            <ToastDescription>Changes were saved.</ToastDescription>
            <ToastAction altText="Undo">Undo</ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
        <Toaster visibleToasts={1} />
      </div>,
    );

    expect(screen.getByText("Saved").getAttribute("data-slot")).toBe("toast-title");
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(document.querySelector('[data-slot="toast-viewport"]')).toBeTruthy();
    expect(Toaster).toBeTruthy();
  });
});

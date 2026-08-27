import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { KpiStrip, OperationalTable } from "./atlas-operations";
import { OcrDiff } from "./paper-documents";
import { CompletionRing, RewardChecklist } from "./pop-rewards-extended";
import { ProductEmptyState, InlineEdit } from "./product-patterns";
import { ExpandingCard, SpatialSegmentedControl } from "./pulse-spatial";
import { InterpretationCompare, LemmaAnchor } from "./scholia-research";
import { MediaTransport } from "./studio-tools";
import { QuickSwitcher } from "./zleek-shells";

describe("theme vocabulary components", () => {
  test("keeps Atlas data surfaces dense and semantic", () => {
    render(
      <>
        <KpiStrip
          items={[
            {
              id: "throughput",
              label: "Throughput",
              value: "12.4k",
              delta: "+8.1%",
              tone: "positive",
            },
          ]}
        />
        <OperationalTable
          caption="Services"
          columns={[
            { key: "service", label: "Service" },
            { key: "latency", label: "Latency", align: "right" },
          ]}
          rows={[{ id: "api", cells: { service: "API", latency: "42ms" } }]}
        />
      </>,
    );

    expect(screen.getByText("Throughput")).toBeTruthy();
    expect(screen.getByRole("table").textContent).toContain("42ms");
  });

  test("lets Studio transport controls report editing intent", () => {
    const onPlayingChange = vi.fn();
    const onSeek = vi.fn();

    render(
      <MediaTransport
        playing={false}
        currentTime={12}
        duration={60}
        onPlayingChange={onPlayingChange}
        onSeek={onSeek}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(onPlayingChange).toHaveBeenCalledWith(true);

    fireEvent.change(screen.getByRole("slider", { name: "Timeline position" }), {
      target: { value: "24" },
    });
    expect(onSeek).toHaveBeenCalledWith(24);
  });

  test("keeps Scholia interpretations and lemma anchors explicit", () => {
    render(
      <InterpretationCompare
        readings={[
          {
            id: "a",
            label: "Actuality reading",
            children: <LemmaAnchor noteCount={2}>actuality</LemmaAnchor>,
          },
          {
            id: "b",
            label: "Process reading",
            children: "A second legitimate interpretation.",
          },
        ]}
      />,
    );

    expect(screen.getByText("Actuality reading")).toBeTruthy();
    expect(document.querySelector('[data-slot="lemma-anchor"]')?.textContent).toContain(
      "actuality",
    );
  });

  test("marks Paper OCR lines that differ", () => {
    render(<OcrDiff original={"alpha\nbeta"} extracted={"alpha\nbcta"} />);
    const highlighted = document.querySelectorAll(".bg-\\[var\\(--document-highlight\\)\\]");
    expect(highlighted.length).toBeGreaterThanOrEqual(2);
  });

  test("filters Zleek quick switching contexts", () => {
    const onValueChange = vi.fn();
    render(
      <QuickSwitcher
        items={[
          { id: "prod", label: "Production" },
          { id: "stage", label: "Staging" },
        ]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "stag" } });
    expect(screen.queryByText("Production")).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "Staging" }));
    expect(onValueChange).toHaveBeenCalledWith("stage");
  });

  test("keeps neutral product patterns reusable outside a theme", () => {
    const onCommit = vi.fn();
    render(
      <>
        <ProductEmptyState title="Nothing here yet" />
        <InlineEdit value="Original" onCommit={onCommit} />
      </>,
    );

    expect(screen.getByText("Nothing here yet")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit value" }), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onCommit).toHaveBeenCalledWith("Updated");
  });

  test("makes Pop completion and checklist rewards state-driven", () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <CompletionRing value={3} max={4} />
        <RewardChecklist
          items={[
            { id: "profile", label: "Complete profile", checked: true },
            { id: "share", label: "Share project", checked: false },
          ]}
          onCheckedChange={onCheckedChange}
        />
      </>,
    );

    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("3");
    fireEvent.click(screen.getByRole("checkbox", { name: "Share project" }));
    expect(onCheckedChange).toHaveBeenCalledWith("share", true);
  });

  test("makes Pulse selection and expansion spatial but controlled", () => {
    const onValueChange = vi.fn();
    render(
      <>
        <SpatialSegmentedControl
          value="one"
          items={[
            { id: "one", label: "One" },
            { id: "two", label: "Two" },
          ]}
          onValueChange={onValueChange}
        />
        <ExpandingCard title="Details">Expanded content</ExpandingCard>
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Two" }));
    expect(onValueChange).toHaveBeenCalledWith("two");

    const trigger = screen.getByRole("button", { name: /Details/ });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Expanded content")).toBeTruthy();
  });
});

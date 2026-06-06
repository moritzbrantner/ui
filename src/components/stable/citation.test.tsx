import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  CitationAudioContext,
  CitationExcerpt,
  CitationHeader,
  CitationItem,
  CitationList,
  CitationMarker,
  CitationMeta,
  CitationMetaItem,
  CitationPdfContext,
  CitationReference,
  CitationStatusBadge,
  CitationTextContext,
  CitationTitle,
  CitationYouTubeContext,
  type CitationData,
} from "../../index";

const citations = [
  {
    id: "paper",
    title: "Attention Is All You Need",
    authors: ["Vaswani", "Shazeer"],
    source: "NeurIPS",
    issued: "2017",
    locator: "section 3",
    url: "https://arxiv.org/abs/1706.03762",
    excerpt: "The Transformer allows for significantly more parallelization.",
    context:
      "The surrounding discussion compares the architecture against recurrent and convolutional models.",
    status: "supporting",
  },
  {
    id: "notes",
    title: "Evaluation notes",
    publisher: "Research Ops",
    accessed: "May 18, 2026",
    note: "Internal source used for methodology only.",
    status: "cited",
  },
] satisfies CitationData[];

describe("Citation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders data-driven citation lists with source metadata", () => {
    render(<CitationList citations={citations} data-testid="citations" />);

    const list = screen.getByTestId("citations");
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(screen.getByText("Attention Is All You Need")).toBeTruthy();
    expect(screen.getByText("Evaluation notes")).toBeTruthy();
    expect(screen.queryByText(/Vaswani/)).toBeNull();
    expect(screen.queryByText(/Shazeer/)).toBeNull();
    expect(screen.queryByText("NeurIPS")).toBeNull();
    expect(screen.queryByText("section 3")).toBeNull();
    expect(screen.queryByText("Supporting")).toBeNull();
    expect(
      screen.getByText("The Transformer allows for significantly more parallelization."),
    ).toBeTruthy();

    const header = document.querySelector('[data-slot="citation-header"]');
    const trigger = within(header as HTMLElement).getByRole("button", { name: /show context/i });

    fireEvent.click(trigger);

    const context = document.querySelector('[data-slot="citation-context"]');

    expect(context?.textContent).toContain("Supporting");
    expect(context?.textContent).toContain("Vaswani");
    expect(context?.textContent).toContain("Shazeer");
    expect(context?.textContent).toContain("NeurIPS");
    expect(context?.textContent).toContain("section 3");
  });

  test("allows generated top-row status icons and badge icons to be hidden", () => {
    render(<CitationList citations={citations.slice(0, 1)} showStatusIcon={false} />);

    const header = document.querySelector('[data-slot="citation-header"]');

    expect(header?.querySelector('[data-slot="citation-status-badge"]')).toBeNull();

    fireEvent.click(within(header as HTMLElement).getByRole("button", { name: /show context/i }));

    const context = document.querySelector('[data-slot="citation-context"]');

    expect(context?.textContent).toContain("Supporting");

    const { container } = render(<CitationStatusBadge status="cited" showIcon={false} />);

    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("Cited")).toBeTruthy();
  });

  test("expands citation excerpts to reveal context", () => {
    render(<CitationList citations={citations.slice(0, 1)} />);

    const trigger = screen.getByRole("button", { name: /show context/i });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector('[data-slot="citation-context"]')).toBeNull();

    fireEvent.click(trigger);

    const context = document.querySelector('[data-slot="citation-context"]');

    expect(screen.getByRole("button", { name: /hide context/i })).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(context?.textContent).toContain(
      "The surrounding discussion compares the architecture against recurrent and convolutional models.",
    );
  });

  test("renders full text context for text-only citations and scrolls the cited passage into view", () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    render(
      <CitationList
        citations={[
          {
            id: "statement",
            title: "Research note",
            citedText: "the quoted claim",
            contextStartText: "The complete source paragraph",
            contextEndText: "qualifying context.",
            fullText:
              "Opening section. The complete source paragraph starts earlier, includes the quoted claim, and continues with qualifying context. Closing section.",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show context/i }));

    const context = document.querySelector('[data-slot="citation-context"]');
    const highlight = document.querySelector('[data-slot="citation-text-highlight"]');

    expect(context?.textContent).toContain("The complete source paragraph starts earlier");
    expect(context?.textContent).toContain("continues with qualifying context.");
    expect(context?.textContent).not.toContain("Opening section.");
    expect(context?.textContent).not.toContain("Closing section.");
    expect(highlight?.textContent).toBe("the quoted claim");
    expect(scrollIntoView).toHaveBeenCalled();
  });

  test("supports ranged text citations with omissions and added clarification words", () => {
    render(
      <CitationList
        citations={[
          {
            id: "edited-quote",
            title: "Edited research note",
            fullText:
              "Opening context. The reviewer wrote that the ranking change stayed stable after checking Friday's audit log and backfill traces before release. Follow-up context.",
            citedText: "the ranking change stayed stable",
            contextStartText: "The reviewer wrote",
            contextEndText: "before release.",
            textParts: [
              { type: "added", text: "The reviewer" },
              { text: " wrote that " },
              { type: "highlight", text: "the ranking change stayed stable" },
              { text: " " },
              {
                type: "hidden",
                text: "after checking Friday's audit log and backfill traces",
              },
              { text: " before release." },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("[...]")).toBeTruthy();
    expect(screen.getByText("[The reviewer]")).toBeTruthy();
    expect(screen.queryByText(/Friday's audit log/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /show context/i }));

    const excerpt = document.querySelector('[data-slot="citation-excerpt"]');
    const hiddenText = document.querySelector('[data-slot="citation-text-hidden"]');

    expect(excerpt?.textContent).toContain("[The reviewer] wrote that");
    expect(excerpt?.textContent).toContain("after checking Friday's audit log");
    expect(excerpt?.textContent).not.toContain("Opening context.");
    expect(excerpt?.textContent).not.toContain("Follow-up context.");
    expect(hiddenText?.className).toContain("animate-in");
  });

  test("loads audio, youtube, and pdf citation context at cited locations", () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);

    render(
      <CitationList
        citations={[
          {
            id: "audio",
            title: "Interview recording",
            excerpt: "The speaker confirms the release date.",
            contextSource: {
              type: "audio",
              src: "/audio/interview.mp3",
              startTime: 83,
              endTime: 101,
              title: "Interview recording",
            },
          },
          {
            id: "youtube",
            title: "Demo video",
            excerpt: "The workflow is shown in the demo.",
            contextSource: {
              type: "youtube",
              videoId: "dQw4w9WgXcQ",
              startTime: 42,
              title: "Demo video",
            },
          },
          {
            id: "pdf",
            title: "Launch report",
            excerpt: "The report lists the rollout criteria.",
            contextSource: {
              type: "pdf",
              src: "/docs/report.pdf",
              page: 7,
              search: "rollout criteria",
              title: "Launch report",
            },
          },
        ]}
      />,
    );

    const triggers = screen.getAllByRole("button", { name: /show context/i });

    fireEvent.click(triggers[0]);
    const audio = document.querySelector("audio");
    expect(load).toHaveBeenCalled();
    expect(audio?.getAttribute("src")).toBe("/audio/interview.mp3");
    expect(audio?.currentTime).toBe(83);

    fireEvent.click(triggers[1]);
    const youtube = screen.getByTitle("Demo video");
    expect(youtube.getAttribute("src")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&start=42",
    );

    fireEvent.click(triggers[2]);
    const pdf = screen.getByTitle("Launch report");
    expect(pdf.getAttribute("src")).toBe("/docs/report.pdf#page=7&search=rollout%20criteria");
  });

  test("renders linked titles and inline citation references", () => {
    render(
      <div>
        Source-grounded claim
        <CitationReference label="1" href="#paper" />
        <CitationList citations={citations} />
      </div>,
    );

    expect(screen.getByRole("link", { name: "1" }).getAttribute("href")).toBe("#paper");
    expect(
      screen.getByRole("link", { name: /Attention Is All You Need/ }).getAttribute("href"),
    ).toBe("https://arxiv.org/abs/1706.03762");
  });

  test("supports slot composition and forwarded class names", () => {
    render(
      <CitationList className="custom-list" data-testid="custom-list">
        <CitationItem className="custom-item">
          <CitationHeader>
            <CitationMarker>A</CitationMarker>
            <div>
              <CitationTitle>Manual citation</CitationTitle>
              <CitationMeta>
                <CitationMetaItem>Manual source</CitationMetaItem>
              </CitationMeta>
            </div>
            <CitationStatusBadge status="disputed" />
          </CitationHeader>
          <CitationExcerpt>Manual excerpt.</CitationExcerpt>
        </CitationItem>
      </CitationList>,
    );

    expect(screen.getByTestId("custom-list").className).toContain("custom-list");
    expect(screen.getByRole("listitem").className).toContain("custom-item");
    expect(screen.getByText("Manual citation")).toBeTruthy();
    expect(screen.getByText("Disputed")).toBeTruthy();
  });

  test("supports composed citation context source components", () => {
    render(
      <div>
        <CitationTextContext
          text="Full source text with a cited sentence."
          citedText="cited sentence"
        />
        <CitationAudioContext src="/clip.mp3" title="Audio clip" active={false} />
        <CitationYouTubeContext videoId="abc123" title="Video clip" startTime={9} />
        <CitationPdfContext src="/paper.pdf" title="Paper" page={2} />
      </div>,
    );

    expect(screen.getByText(/Full source text/)).toBeTruthy();
    expect(screen.getByText("Audio clip")).toBeTruthy();
    expect(screen.getByTitle("Video clip").getAttribute("src")).toContain("start=9");
    expect(screen.getByTitle("Paper").getAttribute("src")).toBe("/paper.pdf#page=2");
  });
});

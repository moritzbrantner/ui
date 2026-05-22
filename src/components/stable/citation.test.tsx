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
    expect(screen.getByText(/Vaswani/)).toBeTruthy();
    expect(screen.getByText(/Shazeer/)).toBeTruthy();
    expect(screen.getByText("NeurIPS")).toBeTruthy();
    expect(screen.getByText("section 3")).toBeTruthy();
    expect(
      screen.getByText("The Transformer allows for significantly more parallelization."),
    ).toBeTruthy();
    expect(screen.getByText("Supporting")).toBeTruthy();
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
            fullText:
              "The complete source paragraph starts earlier, includes the quoted claim, and continues with qualifying context.",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show context/i }));

    const context = document.querySelector('[data-slot="citation-context"]');
    const highlight = document.querySelector('[data-slot="citation-text-highlight"]');

    expect(context?.textContent).toContain("The complete source paragraph starts earlier");
    expect(context?.textContent).toContain("continues with qualifying context.");
    expect(highlight?.textContent).toBe("the quoted claim");
    expect(scrollIntoView).toHaveBeenCalled();
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

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import {
  CitationExcerpt,
  CitationHeader,
  CitationItem,
  CitationList,
  CitationMarker,
  CitationMeta,
  CitationMetaItem,
  CitationNote,
  CitationReference,
  CitationStatusBadge,
  CitationTitle,
  type CitationData,
} from "./citation";

const citations = [
  {
    id: "text",
    title: "Research note excerpt",
    kind: "text",
    publisher: "Research Ops",
    issued: "2026",
    citedText: "ranking changes should be staged behind a review flag",
    fullText:
      "The complete note says ranking changes should be staged behind a review flag until source-grounded regressions have been checked against the weekly audit set.",
    status: "cited",
  },
  {
    id: "paper",
    title: "Attention Is All You Need",
    authors: ["Vaswani", "Shazeer", "Parmar"],
    source: "NeurIPS",
    issued: "2017",
    locator: "section 3",
    url: "https://arxiv.org/abs/1706.03762",
    excerpt: "The Transformer allows for significantly more parallelization.",
    context:
      "The surrounding section explains that self-attention connects all token positions directly, reducing the number of sequential operations needed during training.",
    status: "supporting",
  },
  {
    id: "audio",
    title: "Launch interview",
    kind: "audio",
    source: "Customer research call",
    locator: "1:23-1:41",
    excerpt: "The account owner describes the reporting workflow as their daily checkpoint.",
    contextSource: {
      type: "audio",
      src: "/audio/research-call.mp3",
      startTime: 83,
      endTime: 101,
      title: "Customer research call",
      transcript:
        "Transcript: The account owner describes the reporting workflow as their daily checkpoint before reviewing downstream tasks.",
    },
    status: "cited",
  },
  {
    id: "youtube",
    title: "Workflow demo",
    kind: "youtube",
    source: "Product demo",
    locator: "0:42",
    excerpt: "The demo shows reviewers opening cited evidence from the result row.",
    contextSource: {
      type: "youtube",
      videoId: "dQw4w9WgXcQ",
      startTime: 42,
      title: "Workflow demo",
    },
    status: "supporting",
  },
  {
    id: "pdf",
    title: "Dataset release notes",
    kind: "pdf",
    source: "Archive export",
    locator: "appendix B, p. 7",
    excerpt: "The release notes define the audit fields used for regression checks.",
    contextSource: {
      type: "pdf",
      src: "/docs/dataset-release-notes.pdf",
      page: 7,
      search: "audit fields",
      title: "Dataset release notes",
    },
    status: "missing",
  },
] satisfies CitationData[];

function CitationPreview() {
  return (
    <div className="grid max-w-3xl gap-6">
      <p className="text-sm leading-6 text-foreground">
        Dense retrieval quality should be reviewed against source-grounded evidence
        <CitationReference label="1" href="#citation-paper" /> before changing ranking thresholds.
      </p>

      <CitationList citations={citations} />

      <CitationList compact>
        <CitationItem>
          <CitationHeader>
            <CitationMarker>A</CitationMarker>
            <div className="min-w-0">
              <CitationTitle>Custom citation layout</CitationTitle>
              <CitationMeta>
                <CitationMetaItem>Manual source</CitationMetaItem>
                <CitationMetaItem>p. 42</CitationMetaItem>
              </CitationMeta>
            </div>
            <CitationStatusBadge status="disputed" />
          </CitationHeader>
          <CitationExcerpt>Conflicting evidence needs explicit treatment.</CitationExcerpt>
          <CitationNote>Reviewer requested a stronger source.</CitationNote>
        </CitationItem>
      </CitationList>
    </div>
  );
}

const meta = {
  title: "Components/Data Display/Citation",
  component: CitationPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof CitationPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Research note excerpt")).toBeVisible();
    await expect(canvas.getByText("Attention Is All You Need")).toBeVisible();
    await expect(canvas.getByText("Launch interview")).toBeVisible();
    await expect(canvas.getByText("Workflow demo")).toBeVisible();
    await expect(canvas.getByText("Custom citation layout")).toBeVisible();
    await expect(canvas.getByText("Disputed")).toBeVisible();
    await userEvent.click(canvas.getAllByRole("button", { name: "Show context" })[0]);
    await expect(canvas.getByText(/complete note says ranking changes/)).toBeVisible();
  },
};

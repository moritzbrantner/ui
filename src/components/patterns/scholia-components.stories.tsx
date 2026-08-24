import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Button } from "../stable/button";
import {
  DescriptionList,
  DescriptionListDetail,
  DescriptionListItem,
  DescriptionListTerm,
} from "../stable/description-list";
import { ScholiaSourceWorkbench } from "./scholia-source-workbench";
import { SourcePassageHighlight } from "./source-passage";

const meta = {
  title: "Design System/Scholia/Source Workbench",
  component: ScholiaSourceWorkbench,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    designSystem: "scholia",
  },
} satisfies Meta<typeof ScholiaSourceWorkbench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AristotleChangePassage: Story = {
  args: {
    title: "Change as actuality",
    original: "ἡ τοῦ δυνάμει ὄντος ἐντελέχεια",
  },
  render: () => (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-8">
      <ScholiaSourceWorkbench
        title="Change as actuality"
        description="A source-first reading surface that keeps the text, translation, apparatus, and interpretive notes visibly distinct."
        source="Aristotle, Physics III.1"
        locator="201a10–11"
        original={
          <p>
            ἡ τοῦ <SourcePassageHighlight>δυνάμει ὄντος</SourcePassageHighlight>, ᾗ τοιοῦτον,
            ἐντελέχεια κίνησίς ἐστιν.
          </p>
        }
        originalLabel="Greek text"
        originalLanguage="Ancient Greek"
        originalLanguageCode="grc"
        translation="The actuality of what exists potentially, insofar as it is such, is change."
        translationLanguage="English"
        translationLanguageCode="en"
        toolbar={
          <>
            <Button size="sm" variant="secondary">
              Compare readings
            </Button>
            <Button size="sm" variant="ghost">
              Copy locator
            </Button>
          </>
        }
        actions={<Button size="sm">Open source</Button>}
        metadata={
          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTerm>Work</DescriptionListTerm>
              <DescriptionListDetail>Physics</DescriptionListDetail>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Book</DescriptionListTerm>
              <DescriptionListDetail>III.1</DescriptionListDetail>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Locator</DescriptionListTerm>
              <DescriptionListDetail>201a10–11</DescriptionListDetail>
            </DescriptionListItem>
          </DescriptionList>
        }
        apparatus={[
          {
            id: "actuality",
            witness: "Key term",
            reading: "ἐντελέχεια",
            locator: "201a10",
            note: "Rendered here as actuality",
          },
          {
            id: "qualification",
            witness: "Qualifier",
            reading: "ᾗ τοιοῦτον",
            locator: "201a10–11",
            note: "Preserves the insofar-as qualification",
          },
        ]}
        notes={[
          {
            id: "scope",
            label: "Interpretive caution",
            title: "Weakest faithful reading",
            content:
              "The surface records the definitional relation without deciding between compatible metaphysical interpretations.",
            tone: "commentary",
          },
          {
            id: "translation",
            label: "Translation note",
            title: "Actuality",
            content:
              "The rendering keeps the technical term visible so a consuming application can present alternatives.",
            locator: "201a10",
            tone: "translation",
          },
        ]}
        className="mx-auto max-w-7xl"
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Change as actuality")).toBeVisible();
    await expect(canvas.getByText("Weakest faithful reading")).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Critical apparatus" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Compare readings" })).toBeVisible();
  },
};

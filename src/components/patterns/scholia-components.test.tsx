import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  ApparatusList,
  ScholarlyNote,
  ScholiaSourceWorkbench,
  SourcePassage,
  SourcePassageColumns,
  SourcePassageHeader,
  SourcePassageHighlight,
  SourcePassageLocator,
  SourcePassageText,
  SourcePassageTitle,
} from "../../index";

describe("Scholia source components", () => {
  test("renders a semantic parallel source passage and forwards props", () => {
    render(
      <SourcePassage className="custom-passage" data-testid="passage">
        <SourcePassageHeader>
          <SourcePassageTitle>Physics III.1</SourcePassageTitle>
          <SourcePassageLocator>201a10–11</SourcePassageLocator>
        </SourcePassageHeader>
        <SourcePassageColumns>
          <SourcePassageText label="Source text" language="Ancient Greek" lang="grc">
            ἡ τοῦ <SourcePassageHighlight>δυνάμει ὄντος</SourcePassageHighlight> ἐντελέχεια
          </SourcePassageText>
          <SourcePassageText label="Translation" language="English" lang="en">
            The actuality of what exists potentially.
          </SourcePassageText>
        </SourcePassageColumns>
      </SourcePassage>,
    );

    const passage = screen.getByTestId("passage");
    expect(passage.tagName).toBe("ARTICLE");
    expect(passage.className).toContain("custom-passage");
    expect(screen.getByText("Physics III.1")).toBeTruthy();
    expect(screen.getByText("201a10–11")).toBeTruthy();
    expect(document.querySelector('[lang="grc"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="source-passage-highlight"]')).toBeTruthy();
  });

  test("renders apparatus entries and scholarly note semantics", () => {
    render(
      <div>
        <ApparatusList
          entries={[
            {
              id: "a",
              witness: "Reading A",
              reading: "ἐντελέχεια",
              locator: "201a10",
              note: "Primary reading",
            },
          ]}
        />
        <ScholarlyNote
          title="Translation choice"
          label="Commentary"
          locator="201a10"
          tone="translation"
          className="custom-note"
          data-testid="note"
        >
          The rendering keeps actuality distinct from completed activity.
        </ScholarlyNote>
      </div>,
    );

    expect(screen.getByText("Reading A")).toBeTruthy();
    expect(screen.getByText("ἐντελέχεια")).toBeTruthy();
    expect(screen.getByTestId("note").tagName).toBe("ASIDE");
    expect(screen.getByTestId("note").getAttribute("data-tone")).toBe("translation");
    expect(screen.getByTestId("note").className).toContain("custom-note");
  });

  test("composes source data without owning corpus workflow state", () => {
    render(
      <ScholiaSourceWorkbench
        title="Change as actuality"
        source="Aristotle, Physics III.1"
        locator="201a10–11"
        original="ἡ τοῦ δυνάμει ὄντος ἐντελέχεια"
        originalLanguage="Ancient Greek"
        originalLanguageCode="grc"
        translation="The actuality of what exists potentially, insofar as it is such, is change."
        translationLanguage="English"
        translationLanguageCode="en"
        metadata={
          <dl aria-label="Source metadata">
            <dt>Edition</dt>
            <dd>Reference text</dd>
          </dl>
        }
        apparatus={[
          {
            id: "term",
            witness: "Term",
            reading: "ἐντελέχεια",
            note: "Rendered as actuality",
          },
        ]}
        notes={[
          {
            id: "scope",
            label: "Interpretive caution",
            title: "Keep the weakest faithful reading",
            content: "The presentation does not choose among compatible formal interpretations.",
            tone: "commentary",
          },
        ]}
        data-testid="workbench"
      />,
    );

    expect(screen.getByTestId("workbench").getAttribute("data-slot")).toBe(
      "scholia-source-workbench",
    );
    expect(screen.getByRole("heading", { name: "Critical apparatus" })).toBeTruthy();
    expect(screen.getByText("Keep the weakest faithful reading")).toBeTruthy();
    expect(screen.getByText("Reference text")).toBeTruthy();
  });
});

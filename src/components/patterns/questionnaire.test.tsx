import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Questionnaire,
  QuestionnairePollResults,
  QuestionnaireQuestion,
  QuestionnaireSingleChoice,
  QuestionnaireTextAnswer,
} from "./questionnaire";

const options = [
  { value: "focused", label: "Focused", description: "Keep the decision narrow." },
  { value: "balanced", label: "Balanced", description: "Show a few useful alternatives." },
  { value: "broad", label: "Broad", description: "Show a wider range." },
];

const pollResults = [
  { value: "yes", label: "Yes", count: 62 },
  { value: "maybe", label: "Maybe", count: 25 },
  { value: "no", label: "No", count: 13 },
];

describe("questionnaire", () => {
  test("renders progress, heading, content, footer, and forwarded props", () => {
    render(
      <Questionnaire
        title="Preference setup"
        description="Tell us what works for you."
        currentStep={2}
        totalSteps={4}
        footer={<button type="button">Continue</button>}
        className="custom-questionnaire"
        data-testid="questionnaire"
      >
        <div>Question content</div>
      </Questionnaire>,
    );

    const questionnaire = screen.getByTestId("questionnaire");
    const progress = screen.getByRole("progressbar", { name: "Questionnaire progress" });

    expect(questionnaire.className).toContain("custom-questionnaire");
    expect(screen.getByRole("heading", { name: "Preference setup" })).toBeTruthy();
    expect(screen.getByText("Tell us what works for you.")).toBeTruthy();
    expect(screen.getByText("Question content")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Continue" })).toBeTruthy();
    expect(progress.getAttribute("aria-valuenow")).toBe("2");
    expect(progress.getAttribute("aria-valuemax")).toBe("4");
  });

  test("clamps progress to the supported step range", () => {
    const { rerender } = render(<Questionnaire currentStep={0} totalSteps={3} />);

    expect(
      screen
        .getByRole("progressbar", { name: "Questionnaire progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("1");

    rerender(<Questionnaire currentStep={9} totalSteps={3} />);

    expect(
      screen
        .getByRole("progressbar", { name: "Questionnaire progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("3");
  });

  test("composes native single-choice answers inside the question shell", () => {
    render(
      <QuestionnaireQuestion legend="How much choice do you want?">
        <QuestionnaireSingleChoice options={options} defaultValue="balanced" />
      </QuestionnaireQuestion>,
    );

    const focused = screen.getByRole("radio", { name: /Focused/ }) as HTMLInputElement;
    const balanced = screen.getByRole("radio", { name: /Balanced/ }) as HTMLInputElement;

    expect(balanced.checked).toBe(true);
    expect(focused.checked).toBe(false);

    fireEvent.click(focused);

    expect(focused.checked).toBe(true);
    expect(balanced.checked).toBe(false);
  });

  test("supports card, list, scale, pop, and pulse answer presentations", () => {
    const { rerender } = render(
      <QuestionnaireSingleChoice data-testid="choice" options={options} variant="cards" />,
    );

    expect(screen.getByTestId("choice").getAttribute("data-variant")).toBe("cards");

    rerender(<QuestionnaireSingleChoice data-testid="choice" options={options} variant="list" />);
    expect(screen.getByTestId("choice").getAttribute("data-variant")).toBe("list");

    rerender(
      <QuestionnaireSingleChoice
        data-testid="choice"
        options={options}
        variant="scale"
        scaleStartLabel="Low"
        scaleEndLabel="High"
      />,
    );
    expect(screen.getByTestId("choice").getAttribute("data-variant")).toBe("scale");
    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();

    rerender(<QuestionnaireSingleChoice data-testid="choice" options={options} variant="pop" />);
    expect(screen.getByTestId("choice").getAttribute("data-variant")).toBe("pop");

    rerender(<QuestionnaireSingleChoice data-testid="choice" options={options} variant="pulse" />);
    expect(screen.getByTestId("choice").getAttribute("data-variant")).toBe("pulse");
  });

  test("renders an accessible open-ended answer field", () => {
    render(
      <QuestionnaireQuestion legend="Tell us more">
        <QuestionnaireTextAnswer
          label="Your answer"
          name="details"
          hint="Optional context helps us understand your answer."
          defaultValue="Initial thought"
        />
      </QuestionnaireQuestion>,
    );

    const answer = screen.getByRole("textbox", { name: "Your answer" }) as HTMLTextAreaElement;
    const describedBy = answer.getAttribute("aria-describedby") ?? "";

    expect(answer.value).toBe("Initial thought");
    expect(describedBy).toContain("hint");
    expect(screen.getByText("Optional context helps us understand your answer.")).toBeTruthy();
  });

  test("renders poll percentages as a composable child of a question", () => {
    render(
      <QuestionnaireQuestion legend="Would you use it again?" data-testid="question">
        <QuestionnaireSingleChoice options={options} defaultValue="focused" />
        <QuestionnairePollResults
          results={pollResults}
          selectedValue="yes"
          caption="100 responses"
          variant="pulse"
        />
      </QuestionnaireQuestion>,
    );

    const question = screen.getByTestId("question");
    const yesResult = screen.getByRole("progressbar", { name: "Yes" });

    expect(question.contains(yesResult)).toBe(true);
    expect(yesResult.getAttribute("aria-valuenow")).toBe("62");
    expect(screen.getByRole("progressbar", { name: "Maybe" }).getAttribute("aria-valuenow")).toBe(
      "25",
    );
    expect(screen.getByRole("progressbar", { name: "No" }).getAttribute("aria-valuenow")).toBe(
      "13",
    );
    expect(screen.getByText("100 responses")).toBeTruthy();
  });

  test("uses explicit percentages when supplied and clamps unsafe values", () => {
    render(
      <QuestionnairePollResults
        results={[
          { value: "high", label: "High", count: Number.NaN, percentage: 140 },
          { value: "low", label: "Low", count: -5, percentage: -20 },
        ]}
      />,
    );

    expect(screen.getByRole("progressbar", { name: "High" }).getAttribute("aria-valuenow")).toBe(
      "100",
    );
    expect(screen.getByRole("progressbar", { name: "Low" }).getAttribute("aria-valuenow")).toBe(
      "0",
    );
  });

  test("exposes question descriptions and validation errors to assistive technology", () => {
    render(
      <QuestionnaireQuestion
        legend="Required choice"
        description="Choose the closest answer."
        error="Select one option to continue."
      >
        <QuestionnaireSingleChoice options={options} required />
      </QuestionnaireQuestion>,
    );

    const group = screen.getByRole("group", { name: "Required choice" });
    const describedBy = group.getAttribute("aria-describedby") ?? "";
    const focused = screen.getByRole("radio", { name: /Focused/ });

    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy).toContain("description");
    expect(describedBy).toContain("error");
    expect(focused.getAttribute("required")).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toBe("Select one option to continue.");
  });
});

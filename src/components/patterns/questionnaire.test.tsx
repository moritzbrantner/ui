import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Questionnaire, QuestionnaireQuestion } from "./questionnaire";

const options = [
  { value: "focused", label: "Focused", description: "Keep the decision narrow." },
  { value: "balanced", label: "Balanced", description: "Show a few useful alternatives." },
  { value: "broad", label: "Broad", description: "Show a wider range." },
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

  test("supports uncontrolled answer selection and reports value changes", () => {
    const onValueChange = vi.fn();

    render(
      <QuestionnaireQuestion
        legend="How much choice do you want?"
        options={options}
        defaultValue="balanced"
        onValueChange={onValueChange}
      />,
    );

    const focused = screen.getByRole("radio", { name: /Focused/ }) as HTMLInputElement;
    const balanced = screen.getByRole("radio", { name: /Balanced/ }) as HTMLInputElement;

    expect(balanced.checked).toBe(true);
    expect(focused.checked).toBe(false);

    fireEvent.click(focused);

    expect(focused.checked).toBe(true);
    expect(balanced.checked).toBe(false);
    expect(onValueChange).toHaveBeenCalledWith("focused");
  });

  test("supports controlled value and all three presentation variants", () => {
    const { rerender } = render(
      <QuestionnaireQuestion legend="Cards" options={options} value="focused" variant="cards" />,
    );

    expect(screen.getByRole("group", { name: "Cards" }).getAttribute("data-variant")).toBe("cards");
    expect((screen.getByRole("radio", { name: /Focused/ }) as HTMLInputElement).checked).toBe(true);

    rerender(
      <QuestionnaireQuestion legend="List" options={options} value="balanced" variant="list" />,
    );

    expect(screen.getByRole("group", { name: "List" }).getAttribute("data-variant")).toBe("list");

    rerender(
      <QuestionnaireQuestion
        legend="Scale"
        options={options}
        value="broad"
        variant="scale"
        scaleStartLabel="Low"
        scaleEndLabel="High"
      />,
    );

    expect(screen.getByRole("group", { name: "Scale" }).getAttribute("data-variant")).toBe("scale");
    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
  });

  test("exposes descriptions and validation errors to assistive technology", () => {
    render(
      <QuestionnaireQuestion
        legend="Required choice"
        description="Choose the closest answer."
        options={options}
        required
        error="Select one option to continue."
      />,
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

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompassIcon, FocusIcon, Layers3Icon } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../stable/button";
import { Questionnaire, QuestionnaireQuestion, type QuestionnaireOption } from "./questionnaire";

const preferenceOptions = [
  {
    value: "focused",
    label: "Focused",
    description: "Show one clear recommendation and keep secondary choices out of the way.",
    leading: <FocusIcon />,
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Give me a strong default plus a few alternatives I can compare.",
    leading: <Layers3Icon />,
  },
  {
    value: "exploratory",
    label: "Exploratory",
    description: "Let me browse a wider range of possibilities before I decide.",
    leading: <CompassIcon />,
  },
] satisfies QuestionnaireOption[];

const workflowOptions = [
  {
    value: "quick",
    label: "A quick recommendation",
    description: "I want the questionnaire to get me to a useful answer fast.",
  },
  {
    value: "guided",
    label: "A guided comparison",
    description: "Ask enough questions to explain why an answer fits me.",
  },
  {
    value: "thorough",
    label: "A thorough assessment",
    description: "I am happy to answer more questions for a more precise result.",
  },
] satisfies QuestionnaireOption[];

const scaleOptions = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: String(value),
  ariaLabel:
    value === 1
      ? "1 – strongly disagree"
      : value === 5
        ? "5 – strongly agree"
        : `${value} out of 5`,
})) satisfies QuestionnaireOption[];

function ChoiceCardsPrototype() {
  const [value, setValue] = React.useState("balanced");

  return (
    <Questionnaire
      title="What kind of recommendations do you prefer?"
      description="A visual answer-card pattern for onboarding, preference capture, and recommendation engines."
      className="max-w-[900px]"
    >
      <QuestionnaireQuestion
        legend="Choose the experience that feels most useful"
        description="You can change this later."
        name="recommendation-style"
        value={value}
        onValueChange={setValue}
        options={preferenceOptions}
        variant="cards"
        columns={3}
      />
    </Questionnaire>
  );
}

function GuidedQuestionPrototype() {
  const [value, setValue] = React.useState("guided");

  return (
    <Questionnaire
      title="Shape your questionnaire"
      description="A compact, step-by-step version for flows where the user should concentrate on one question at a time."
      currentStep={2}
      totalSteps={5}
      progressLabel="Question 2 of 5"
      className="max-w-[640px]"
      footer={
        <>
          <Button variant="ghost">Back</Button>
          <Button disabled={!value}>Continue</Button>
        </>
      }
    >
      <QuestionnaireQuestion
        legend="How much guidance do you want?"
        name="guidance-level"
        value={value}
        onValueChange={setValue}
        options={workflowOptions}
        variant="list"
      />
    </Questionnaire>
  );
}

function ScalePrototype() {
  const [value, setValue] = React.useState("4");

  return (
    <Questionnaire
      title="Quick assessment"
      description="A Likert-style version for ratings, confidence, agreement, and lightweight scoring."
      className="max-w-[640px]"
    >
      <QuestionnaireQuestion
        legend="The recommendations matched what I was looking for."
        description="Select the answer that best describes your experience."
        name="recommendation-fit"
        value={value}
        onValueChange={setValue}
        options={scaleOptions}
        variant="scale"
        scaleStartLabel="Strongly disagree"
        scaleEndLabel="Strongly agree"
      />
    </Questionnaire>
  );
}

const meta = {
  title: "Components/Forms & Inputs/Questionnaire",
  component: Questionnaire,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Questionnaire>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ChoiceCards: Story = {
  render: () => <ChoiceCardsPrototype />,
  play: async ({ canvas, userEvent }) => {
    const exploratory = canvas.getByRole("radio", { name: "Exploratory" });

    await userEvent.click(exploratory);

    await expect(exploratory).toBeChecked();
  },
};

export const GuidedSingleQuestion: Story = {
  render: () => <GuidedQuestionPrototype />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar", { name: "Questionnaire progress" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    await expect(canvas.getByRole("button", { name: "Continue" })).toBeEnabled();
  },
};

export const LikertScale: Story = {
  render: () => <ScalePrototype />,
  play: async ({ canvas, userEvent }) => {
    const stronglyAgree = canvas.getByRole("radio", { name: "5 – strongly agree" });

    await userEvent.click(stronglyAgree);

    await expect(stronglyAgree).toBeChecked();
  },
};

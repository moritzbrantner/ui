import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompassIcon, FocusIcon, Layers3Icon } from "lucide-react";
import { expect } from "storybook/test";

import { PopTheme } from "../../themes/pop";
import { PulseTheme } from "../../themes/pulse";
import { Button } from "../stable/button";
import {
  Questionnaire,
  QuestionnairePollResults,
  QuestionnaireQuestion,
  QuestionnaireSingleChoice,
  QuestionnaireTextAnswer,
  type QuestionnaireOption,
  type QuestionnairePollResult,
} from "./questionnaire";

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

const pollOptions = [
  { value: "yes", label: "Yes, definitely" },
  { value: "maybe", label: "Maybe, with some changes" },
  { value: "no", label: "No, not for me" },
] satisfies QuestionnaireOption[];

const pollResults = [
  { value: "yes", label: "Yes, definitely", count: 746 },
  { value: "maybe", label: "Maybe, with some changes", count: 301 },
  { value: "no", label: "No, not for me", count: 157 },
] satisfies QuestionnairePollResult[];

function ChoiceCardsPrototype() {
  return (
    <Questionnaire
      title="What kind of recommendations do you prefer?"
      description="A visual answer-card pattern for onboarding, preference capture, and recommendation engines."
      className="max-w-[900px]"
    >
      <QuestionnaireQuestion
        id="recommendation-style-question"
        legend="Choose the experience that feels most useful"
        description="You can change this later."
      >
        <QuestionnaireSingleChoice
          name="recommendation-style"
          defaultValue="balanced"
          options={preferenceOptions}
          variant="cards"
          columns={3}
        />
      </QuestionnaireQuestion>
    </Questionnaire>
  );
}

function GuidedQuestionPrototype() {
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
          <Button>Continue</Button>
        </>
      }
    >
      <QuestionnaireQuestion id="guidance-level-question" legend="How much guidance do you want?">
        <QuestionnaireSingleChoice
          name="guidance-level"
          defaultValue="guided"
          options={workflowOptions}
          variant="list"
        />
      </QuestionnaireQuestion>
    </Questionnaire>
  );
}

function ScalePrototype() {
  return (
    <Questionnaire
      title="Quick assessment"
      description="A Likert-style version for ratings, confidence, agreement, and lightweight scoring."
      className="max-w-[640px]"
    >
      <QuestionnaireQuestion
        id="recommendation-fit-question"
        legend="The recommendations matched what I was looking for."
        description="Select the answer that best describes your experience."
      >
        <QuestionnaireSingleChoice
          name="recommendation-fit"
          defaultValue="4"
          options={scaleOptions}
          variant="scale"
          scaleStartLabel="Strongly disagree"
          scaleEndLabel="Strongly agree"
        />
      </QuestionnaireQuestion>
    </Questionnaire>
  );
}

function PopOpenEndedPrototype() {
  return (
    <PopTheme className="max-w-[680px]">
      <Questionnaire
        title="Say it in your own words"
        description="The same questionnaire structure can host an open-ended answer without changing the question shell."
      >
        <QuestionnaireQuestion
          id="recommendation-notes-question"
          legend="What would make this recommendation feel perfect for you?"
        >
          <QuestionnaireTextAnswer
            id="recommendation-notes"
            label="Your answer"
            name="recommendation-notes"
            placeholder="For example: fewer choices, more context, or a completely different direction…"
            hint="Write as much or as little as you need."
            variant="pop"
          />
        </QuestionnaireQuestion>
      </Questionnaire>
    </PopTheme>
  );
}

function PulsePollPrototype() {
  return (
    <PulseTheme className="max-w-[680px]">
      <Questionnaire
        title="Community pulse"
        description="A compact poll can reveal aggregate results directly inside the same question."
      >
        <QuestionnaireQuestion
          id="recommendation-poll-question"
          legend="Would you use this recommendation again?"
        >
          <QuestionnaireSingleChoice
            name="recommendation-poll"
            defaultValue="yes"
            options={pollOptions}
            variant="pulse"
          />
          <QuestionnairePollResults
            results={pollResults}
            selectedValue="yes"
            caption="1,204 responses"
            variant="pulse"
          />
        </QuestionnaireQuestion>
      </Questionnaire>
    </PulseTheme>
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
    await expect(
      canvas.getByRole("progressbar", { name: "Questionnaire progress" }),
    ).toHaveAttribute("aria-valuenow", "2");
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

export const PopOpenEnded: Story = {
  render: () => <PopOpenEndedPrototype />,
  play: async ({ canvas, userEvent }) => {
    const answer = canvas.getByRole("textbox", { name: "Your answer" });

    await userEvent.type(answer, "Give me fewer, more opinionated options.");

    await expect(answer).toHaveValue("Give me fewer, more opinionated options.");
  },
};

export const PulsePollResults: Story = {
  render: () => <PulsePollPrototype />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Yes, definitely" })).toBeChecked();
    await expect(canvas.getByRole("progressbar", { name: "Yes, definitely" })).toHaveAttribute(
      "aria-valuenow",
      "62",
    );
  },
};

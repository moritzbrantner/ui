import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, GiftIcon, LightbulbIcon, SparklesIcon, TrophyIcon } from "lucide-react";
import * as React from "react";
import { expect, waitFor, within } from "storybook/test";

import { UiTheme } from "../../themes";
import { MotionButton } from "./theme-motion";
import {
  AddToCollection,
  AnimatedCounter,
  CelebrationProvider,
  ProgressPop,
  RewardBurst,
  SuccessPop,
  type PopRewardLevel,
} from "./pop-rewards";

const rewardLevelCopy: Record<PopRewardLevel, string> = {
  subtle: "Routine acknowledgement",
  satisfying: "Meaningful completion",
  celebration: "Genuine milestone",
};

function PopRewardPlayground() {
  const [level, setLevel] = React.useState<PopRewardLevel>("satisfying");
  const [rewardKey, setRewardKey] = React.useState<number | null>(null);
  const [rewardTarget, setRewardTarget] = React.useState<"add" | "complete" | "milestone" | null>(
    null,
  );
  const [ideas, setIdeas] = React.useState([
    { id: 1, label: "Sketch the first screen" },
    { id: 2, label: "Name the core interaction" },
  ]);
  const [progress, setProgress] = React.useState(40);
  const [success, setSuccess] = React.useState<{
    title: string;
    description: string;
  } | null>(null);

  const triggerReward = React.useCallback((target: "add" | "complete" | "milestone") => {
    setRewardTarget(target);
    setRewardKey((current) => (current ?? 0) + 1);
  }, []);

  const addIdea = () => {
    const nextId = ideas.length + 1;

    setIdeas((current) => [...current, { id: nextId, label: `Shape rewarding moment ${nextId}` }]);
    setProgress((current) => Math.min(current + 15, 90));
    setSuccess(null);
    triggerReward("add");
  };

  const completeGoal = () => {
    setProgress((current) => Math.max(current, 75));
    setSuccess({
      title: "Goal completed",
      description: "The reward confirms a meaningful action without interrupting the next one.",
    });
    triggerReward("complete");
  };

  const celebrateMilestone = () => {
    setProgress(100);
    setSuccess({
      title: "Milestone reached",
      description: "Celebration intensity is reserved for something the person genuinely achieved.",
    });
    triggerReward("milestone");
  };

  return (
    <UiTheme
      theme="pop"
      data-testid="pop-reward-playground"
      className="grid w-[min(960px,calc(100vw-2rem))] gap-5 rounded-[var(--ui-radius-overlay)] border bg-background p-4 text-foreground shadow-[var(--ui-shadow-surface)] sm:p-6"
    >
      <CelebrationProvider level={level}>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <GiftIcon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Pop reward playground</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Reward real progress with a short anticipation, impact, payoff, and settlement rhythm.
            Nothing loops, blocks the next action, or invents urgency.
          </p>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Reward intensity</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Reward intensity">
            {(Object.keys(rewardLevelCopy) as PopRewardLevel[]).map((rewardLevel) => (
              <MotionButton
                key={rewardLevel}
                type="button"
                size="sm"
                variant={level === rewardLevel ? "default" : "outline"}
                aria-pressed={level === rewardLevel}
                onClick={() => setLevel(rewardLevel)}
              >
                {rewardLevelCopy[rewardLevel]}
              </MotionButton>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <section className="grid content-start gap-4 rounded-[var(--ui-radius-surface)] border bg-card p-4 text-card-foreground">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <LightbulbIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Idea collection</h3>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-lg font-semibold text-foreground">
                <AnimatedCounter value={ideas.length} data-testid="idea-count" />
              </div>
            </div>

            <div className="grid gap-2" aria-label="Collected ideas">
              {ideas.map((idea) => (
                <AddToCollection
                  key={idea.id}
                  itemKey={idea.id}
                  data-testid={`idea-${idea.id}`}
                  className="rounded-[var(--ui-radius-control)] border bg-background px-3 py-2.5 text-sm shadow-xs"
                >
                  {idea.label}
                </AddToCollection>
              ))}
            </div>

            <RewardBurst rewardKey={rewardTarget === "add" ? rewardKey : null} className="w-fit">
              <MotionButton type="button" onClick={addIdea}>
                <SparklesIcon data-icon="inline-start" />
                Add idea
              </MotionButton>
            </RewardBurst>
          </section>

          <section className="grid content-start gap-4 rounded-[var(--ui-radius-surface)] border bg-card p-4 text-card-foreground">
            <div className="flex items-center gap-2">
              <TrophyIcon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Project momentum</h3>
            </div>

            <ProgressPop
              value={progress}
              label="Reward system progress"
              rewardKey={rewardTarget === "milestone" ? rewardKey : null}
            />

            <div className="flex flex-wrap gap-2">
              <RewardBurst
                rewardKey={rewardTarget === "complete" ? rewardKey : null}
                className="w-fit"
              >
                <MotionButton type="button" variant="outline" onClick={completeGoal}>
                  <CheckIcon data-icon="inline-start" />
                  Complete goal
                </MotionButton>
              </RewardBurst>
              <RewardBurst
                rewardKey={rewardTarget === "milestone" ? rewardKey : null}
                level="celebration"
                className="w-fit"
              >
                <MotionButton type="button" onClick={celebrateMilestone}>
                  <TrophyIcon data-icon="inline-start" />
                  Reach milestone
                </MotionButton>
              </RewardBurst>
            </div>

            <SuccessPop
              open={success !== null}
              level={rewardTarget === "milestone" ? "celebration" : undefined}
              title={success?.title ?? "Reward ready"}
              description={success?.description}
              action={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  <CheckIcon className="size-3.5" aria-hidden="true" />
                  Earned feedback
                </span>
              }
            />
          </section>
        </div>
      </CelebrationProvider>
    </UiTheme>
  );
}

const meta = {
  title: "Design System/Motion/Pop Rewards",
  component: PopRewardPlayground,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Event-driven Pop reward primitives with subtle, satisfying, and celebration intensity. Product state, reward timing, and whether an achievement is meaningful remain app-owned.",
      },
    },
  },
} satisfies Meta<typeof PopRewardPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const playground = within(canvas.getByTestId("pop-reward-playground"));

    await userEvent.click(playground.getByRole("button", { name: "Add idea" }));
    await expect(playground.getByTestId("idea-count")).toHaveAttribute("data-value", "3");
    await waitFor(() => expect(playground.getByTestId("idea-3")).toHaveStyle({ opacity: "1" }));

    await userEvent.click(playground.getByRole("button", { name: "Complete goal" }));
    const success = playground.getByRole("status");
    await expect(success).toHaveTextContent("Goal completed");
    await waitFor(() => expect(success).toHaveStyle({ opacity: "1" }));
  },
};

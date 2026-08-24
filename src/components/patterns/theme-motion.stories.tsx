import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import * as React from "react";
import { expect, within } from "storybook/test";

import { UiTheme } from "../../themes";
import {
  MotionButton,
  MotionTabs,
  MotionTabsContent,
  MotionTabsList,
  MotionTabsTrigger,
  MotionToast,
  UiMotionProvider,
  type UiMotionProfileName,
} from "./theme-motion";

function MotionProfileDemo({ profile }: { profile: UiMotionProfileName }) {
  const [toastOpen, setToastOpen] = React.useState(false);
  const isPop = profile === "pop";

  return (
    <UiTheme
      theme={profile}
      data-slot={`${profile}-motion-demo`}
      data-testid={`${profile}-motion-demo`}
      className="grid min-h-[430px] gap-5 rounded-[var(--ui-radius-overlay)] border bg-background p-5 shadow-[var(--ui-shadow-surface)]"
    >
      <UiMotionProvider profile={profile}>
        <div className="grid content-start gap-5">
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              {isPop ? (
                <SparklesIcon className="size-5 text-primary" />
              ) : (
                <ZapIcon className="size-5 text-primary" />
              )}
              <h2 className="text-lg font-semibold">{isPop ? "Pop" : "Pulse"} motion</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPop
                ? "Playful lift and spring feedback for creator-facing surfaces."
                : "Faster spatial movement for selection-heavy and kinetic interfaces."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MotionButton onClick={() => setToastOpen(true)}>Show {profile} toast</MotionButton>
            <MotionButton variant="outline">Hover and press</MotionButton>
          </div>

          <MotionTabs defaultValue="motion">
            <MotionTabsList>
              <MotionTabsTrigger value="motion">Motion</MotionTabsTrigger>
              <MotionTabsTrigger value="tokens">Tokens</MotionTabsTrigger>
              <MotionTabsTrigger value="accessibility">Accessibility</MotionTabsTrigger>
            </MotionTabsList>
            <MotionTabsContent
              value="motion"
              className="rounded-[var(--ui-radius-surface)] bg-muted/45 p-4"
            >
              The active indicator uses a shared Motion layout identity.
            </MotionTabsContent>
            <MotionTabsContent
              value="tokens"
              className="rounded-[var(--ui-radius-surface)] bg-muted/45 p-4"
            >
              The recipe mirrors the style-owned CSS motion tokens.
            </MotionTabsContent>
            <MotionTabsContent
              value="accessibility"
              className="rounded-[var(--ui-radius-surface)] bg-muted/45 p-4"
            >
              Reduced-motion preferences keep opacity feedback while removing spatial movement.
            </MotionTabsContent>
          </MotionTabs>

          <div className="mt-auto min-h-28">
            <MotionToast
              open={toastOpen}
              onOpenChange={setToastOpen}
              title={`${isPop ? "Creator kit" : "Interaction flow"} ready`}
              description="Motion remains state-driven, interruptible, and local to the component."
              action={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <CheckIcon className="size-3.5" />
                  Motion confirmed
                </span>
              }
            />
          </div>
        </div>
      </UiMotionProvider>
    </UiTheme>
  );
}

function PopAndPulseMotionDemo() {
  return (
    <div className="grid w-[min(1100px,calc(100vw-2rem))] gap-5 lg:grid-cols-2">
      <MotionProfileDemo profile="pop" />
      <MotionProfileDemo profile="pulse" />
    </div>
  );
}

const meta = {
  title: "Design System/Motion/Pop and Pulse",
  component: PopAndPulseMotionDemo,
  tags: ["autodocs", "test"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Motion-enhanced Button, Tabs, and Toast patterns for the Pop and Pulse styles. The stable CSS primitives remain the lightweight baseline.",
      },
    },
  },
} satisfies Meta<typeof PopAndPulseMotionDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SideBySide: Story = {
  play: async ({ canvas, userEvent }) => {
    const pulseDemo = within(canvas.getByTestId("pulse-motion-demo"));
    const tokensTab = pulseDemo.getByRole("tab", { name: "Tokens" });

    await userEvent.click(tokensTab);
    await expect(tokensTab).toHaveAttribute("data-state", "active");
    await expect(pulseDemo.getByText(/mirrors the style-owned CSS motion tokens/)).toBeVisible();

    await userEvent.click(pulseDemo.getByRole("button", { name: "Show pulse toast" }));
    await expect(pulseDemo.getByRole("status")).toHaveTextContent("Interaction flow ready");
  },
};

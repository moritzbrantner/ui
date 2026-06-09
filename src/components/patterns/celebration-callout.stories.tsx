import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "../stable/button";
import { CelebrationCallout, type CelebrationCalloutTone } from "./celebration-callout";

const tones = [
  "celebratory",
  "primary",
  "success",
  "info",
  "warning",
] as const satisfies readonly CelebrationCalloutTone[];

const meta = {
  title: "Components/Feedback/Celebration Callout",
  component: CelebrationCallout,
  tags: ["autodocs", "test"],
  args: {
    title: "Workspace ready",
    description: "The shared setup is complete and ready for the next step.",
    tone: "celebratory",
  },
  argTypes: {
    tone: {
      control: "select",
      options: tones,
    },
  },
} satisfies Meta<typeof CelebrationCallout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Milestone: Story = {
  render: () => (
    <CelebrationCallout
      title="Your workspace is ready"
      description="Invite collaborators, review the defaults, and start building with the shared system."
      action={
        <Button>
          Continue
          <ArrowRightIcon />
        </Button>
      }
      secondaryAction={<Button variant="ghost">Review later</Button>}
      className="w-[min(680px,calc(100vw-2rem))]"
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Your workspace is ready")).toBeTruthy();
    await expect(canvas.getByRole("button", { name: /Continue/ })).toBeTruthy();
    await expect(canvas.getByRole("button", { name: "Review later" })).toBeTruthy();
  },
};

export const Progress: Story = {
  render: () => (
    <CelebrationCallout
      title="Profile almost complete"
      description="Add the last details to make the shared profile easier to recognize."
      progress={72}
      action={<Button>Finish setup</Button>}
      className="w-[min(680px,calc(100vw-2rem))]"
    />
  ),
};

export const Complete: Story = {
  render: () => (
    <CelebrationCallout
      title="Launch checklist complete"
      description="Every required step is finished and ready for handoff."
      icon={<CheckIcon aria-hidden="true" className="size-5" />}
      tone="success"
      progress={100}
      action={<Button>Open summary</Button>}
      className="w-[min(680px,calc(100vw-2rem))]"
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="celebration-callout"][data-complete="true"]'),
    ).toBeTruthy();
  },
};

export const ToneVariants: Story = {
  render: () => (
    <div className="grid w-[min(760px,calc(100vw-2rem))] gap-3">
      {tones.map((tone) => (
        <CelebrationCallout
          key={tone}
          tone={tone}
          title={`${toneLabel(tone)} moment`}
          description="Reusable milestone surface with token-backed tone styling."
          progress={tone === "success" ? 100 : undefined}
        />
      ))}
    </div>
  ),
};

function toneLabel(tone: CelebrationCalloutTone) {
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}

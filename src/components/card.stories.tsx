import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { MoreHorizontalIcon, PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

type QueueCardDemoProps = {
  onProcess?: () => void;
};

function QueueCardDemo({ onProcess = () => undefined }: QueueCardDemoProps) {
  const [runningJobs, setRunningJobs] = useState(18);
  const [waitingJobs, setWaitingJobs] = useState(7);
  const [paused, setPaused] = useState(false);

  function processNextJob() {
    if (waitingJobs === 0 || paused) {
      return;
    }

    setRunningJobs((current) => current + 1);
    setWaitingJobs((current) => current - 1);
    onProcess();
  }

  return (
    <Card className="w-[380px] max-w-[calc(100vw-2rem)]">
      <CardHeader>
        <CardTitle>Inference queue</CardTitle>
        <CardDescription>Promote waiting work into active workers.</CardDescription>
        <CardAction>
          <Button
            variant={paused ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={paused ? "Resume queue" : "Pause queue"}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Running</span>
            <Badge>{runningJobs} jobs</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Waiting</span>
            <Badge variant={waitingJobs === 0 ? "outline" : "secondary"}>{waitingJobs} jobs</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={paused ? "outline" : "default"}>{paused ? "Paused" : "Running"}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRunningJobs(18);
            setWaitingJobs(7);
            setPaused(false);
          }}
        >
          <RotateCcwIcon />
          Reset
        </Button>
        <Button size="sm" disabled={paused || waitingJobs === 0} onClick={processNextJob}>
          Process next
        </Button>
      </CardFooter>
    </Card>
  );
}

const meta = {
  title: "Components/Data Display/Card",
  component: Card,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Inference queue</CardTitle>
        <CardDescription>Current batch status across workers.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Running</span>
            <Badge>18 jobs</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Waiting</span>
            <Badge variant="secondary">7 jobs</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Updated just now</span>
        <Button size="sm">Open queue</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card size="sm" className="w-[320px]">
      <CardHeader>
        <CardTitle>Model health</CardTitle>
        <CardDescription>Latency and availability summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-semibold">99.8%</span>
          <span className="pb-1 text-sm text-muted-foreground">available</span>
        </div>
      </CardContent>
    </Card>
  ),
};

export const InteractiveQueue: StoryObj<typeof QueueCardDemo> = {
  render: (args) => <QueueCardDemo {...args} />,
  args: {
    onProcess: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Process next" }));
    await expect(args.onProcess).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText("19 jobs")).toBeVisible();
    await expect(canvas.getByText("6 jobs")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Pause queue" }));
    await expect(canvas.getByText("Paused")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Process next" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "Resume queue" }));
    await expect(canvas.getByRole("button", { name: "Process next" })).toBeEnabled();
  },
};

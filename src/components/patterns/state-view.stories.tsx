import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn } from "storybook/test";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "../stable/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
  StateViewActions,
  StateViewDescription,
  StateViewTitle,
  SuccessState,
} from "./state-view";

type RetryStateDemoProps = {
  onRetry?: () => void;
};

function RetryStateDemo({ onRetry = () => undefined }: RetryStateDemoProps) {
  const [state, setState] = useState<"error" | "loading" | "success">("error");

  if (state === "loading") {
    return (
      <LoadingState label="Retrying package metadata">
        <StateViewTitle>Retrying package metadata</StateViewTitle>
        <StateViewDescription>
          Checking the registry again with the current filters.
        </StateViewDescription>
        <StateViewActions>
          <Button size="sm" onClick={() => setState("success")}>
            Complete retry
          </Button>
        </StateViewActions>
      </LoadingState>
    );
  }

  if (state === "success") {
    return (
      <SuccessState>
        <StateViewTitle>Packages loaded</StateViewTitle>
        <StateViewDescription>
          The registry returned the latest package metadata.
        </StateViewDescription>
        <StateViewActions>
          <Button variant="outline" size="sm" onClick={() => setState("error")}>
            Show error
          </Button>
        </StateViewActions>
      </SuccessState>
    );
  }

  return (
    <ErrorState>
      <StateViewTitle>Could not load packages</StateViewTitle>
      <StateViewDescription>
        The package registry returned an unavailable response.
      </StateViewDescription>
      <StateViewActions>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            onRetry();
            setState("loading");
          }}
        >
          <RefreshCwIcon />
          Retry
        </Button>
      </StateViewActions>
    </ErrorState>
  );
}

const meta = {
  title: "Components/Data Display/State View",
  component: EmptyState,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => (
    <EmptyState>
      <StateViewTitle>No packages found</StateViewTitle>
      <StateViewDescription>Try adjusting your filters or search query.</StateViewDescription>
      <StateViewActions>
        <Button variant="outline" size="sm">
          Reset filters
        </Button>
      </StateViewActions>
    </EmptyState>
  ),
};

export const Loading: Story = {
  render: () => <LoadingState label="Loading package metadata" />,
};

export const Error: Story = {
  render: () => (
    <ErrorState>
      <StateViewTitle>Could not load packages</StateViewTitle>
      <StateViewDescription>
        The package registry returned an unavailable response.
      </StateViewDescription>
      <StateViewActions>
        <Button variant="destructive" size="sm">
          <RefreshCwIcon />
          Retry
        </Button>
      </StateViewActions>
    </ErrorState>
  ),
};

export const Offline: Story = {
  render: () => <OfflineState />,
};

export const RetryFlow: StoryObj<typeof RetryStateDemo> = {
  render: (args) => <RetryStateDemo {...args} />,
  args: {
    onRetry: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText("Retrying package metadata")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Complete retry" }));
    await expect(canvas.getByText("Packages loaded")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Show error" }));
    await expect(canvas.getByRole("button", { name: "Retry" })).toBeVisible();
  },
};

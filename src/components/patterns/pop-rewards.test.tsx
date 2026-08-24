import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  AddToCollection,
  AnimatedCounter,
  CelebrationProvider,
  ProgressPop,
  RewardBurst,
  SuccessPop,
  popRewardRecipes,
} from "./pop-rewards";

describe("Pop rewards", () => {
  test("keeps the three reward levels deliberate and progressively expressive", () => {
    expect(popRewardRecipes.subtle.particleCount).toBe(4);
    expect(popRewardRecipes.satisfying.particleCount).toBe(8);
    expect(popRewardRecipes.celebration.particleCount).toBe(12);
    expect(popRewardRecipes.celebration.particleDistance).toBeGreaterThan(
      popRewardRecipes.satisfying.particleDistance,
    );
  });

  test("inherits reward intensity and renders deterministic burst particles", () => {
    render(
      <CelebrationProvider level="satisfying" reducedMotion="never">
        <RewardBurst rewardKey={1}>
          <button type="button">Add idea</button>
        </RewardBurst>
      </CelebrationProvider>,
    );

    expect(screen.getByRole("button", { name: "Add idea" })).toBeTruthy();
    expect(
      document.querySelector('[data-slot="reward-burst"]')?.getAttribute("data-reward-level"),
    ).toBe("satisfying");
    expect(document.querySelectorAll('[data-slot="reward-burst-particle"]')).toHaveLength(8);
  });

  test("suppresses decorative bursts when celebrations are disabled", () => {
    render(
      <CelebrationProvider enabled={false} reducedMotion="never">
        <RewardBurst rewardKey={1}>Static content</RewardBurst>
      </CelebrationProvider>,
    );

    expect(document.querySelectorAll('[data-slot="reward-burst-particle"]')).toHaveLength(0);
  });

  test("renders state-controlled success feedback without owning its lifetime", () => {
    const { rerender } = render(
      <CelebrationProvider reducedMotion="always">
        <SuccessPop open={false} title="Goal completed" />
      </CelebrationProvider>,
    );

    expect(screen.queryByRole("status")).toBeNull();

    rerender(
      <CelebrationProvider reducedMotion="always">
        <SuccessPop open title="Goal completed" description="That moved the project forward." />
      </CelebrationProvider>,
    );

    expect(screen.getByRole("status").textContent).toContain("Goal completed");
    expect(screen.getByRole("status").getAttribute("data-reward-level")).toBe("satisfying");
  });

  test("announces counters and exposes accessible progress semantics", () => {
    const { rerender } = render(
      <CelebrationProvider reducedMotion="always">
        <AnimatedCounter value={2} data-testid="counter" />
        <ProgressPop value={30} max={60} label="Collection progress" />
      </CelebrationProvider>,
    );

    expect(screen.getByTestId("counter").getAttribute("data-value")).toBe("2");
    expect(
      screen
        .getByRole("progressbar", { name: "Collection progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("30");
    expect(screen.getByText("50%")).toBeTruthy();

    rerender(
      <CelebrationProvider reducedMotion="always">
        <AnimatedCounter value={3} data-testid="counter" />
        <ProgressPop value={60} max={60} label="Collection progress" rewardKey="complete" />
      </CelebrationProvider>,
    );

    expect(screen.getByTestId("counter").getAttribute("data-value")).toBe("3");
    expect(
      screen
        .getByRole("progressbar", { name: "Collection progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("60");
  });

  test("marks newly added collection items without owning collection state", () => {
    render(
      <CelebrationProvider level="celebration" reducedMotion="always">
        <AddToCollection itemKey="idea-4">Fourth idea</AddToCollection>
      </CelebrationProvider>,
    );

    const item = screen.getByText("Fourth idea");

    expect(item.getAttribute("data-slot")).toBe("add-to-collection");
    expect(item.getAttribute("data-item-key")).toBe("idea-4");
    expect(item.getAttribute("data-reward-level")).toBe("celebration");
  });
});

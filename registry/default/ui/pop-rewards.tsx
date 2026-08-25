"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionConfigProps,
  type Transition,
} from "motion/react";

import { cn } from "@/registry/default/lib/cn";
import { UiMotionProvider } from "@/registry/default/ui/theme-motion";

type PopRewardLevel = "subtle" | "satisfying" | "celebration";

type PopRewardRecipe = {
  particleCount: number;
  particleDistance: number;
  particleDuration: number;
  entryOffset: number;
  entryScale: number;
  overshootScale: number;
  transition: Transition;
};

const popRewardRecipes = {
  subtle: {
    particleCount: 4,
    particleDistance: 18,
    particleDuration: 0.32,
    entryOffset: 5,
    entryScale: 0.97,
    overshootScale: 1.018,
    transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.62 },
  },
  satisfying: {
    particleCount: 8,
    particleDistance: 29,
    particleDuration: 0.48,
    entryOffset: 9,
    entryScale: 0.92,
    overshootScale: 1.045,
    transition: { type: "spring", stiffness: 430, damping: 27, mass: 0.7 },
  },
  celebration: {
    particleCount: 12,
    particleDistance: 44,
    particleDuration: 0.72,
    entryOffset: 15,
    entryScale: 0.84,
    overshootScale: 1.075,
    transition: { type: "spring", stiffness: 360, damping: 22, mass: 0.76 },
  },
} as const satisfies Record<PopRewardLevel, PopRewardRecipe>;

type PopRewardContextValue = {
  enabled: boolean;
  level: PopRewardLevel;
  reducedMotion: MotionConfigProps["reducedMotion"];
};

const PopRewardContext = React.createContext<PopRewardContextValue>({
  enabled: true,
  level: "satisfying",
  reducedMotion: "user",
});

type CelebrationProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
  level?: PopRewardLevel;
  reducedMotion?: MotionConfigProps["reducedMotion"];
};

function CelebrationProvider({
  children,
  enabled = true,
  level = "satisfying",
  reducedMotion = "user",
}: CelebrationProviderProps) {
  return (
    <UiMotionProvider profile="pop" reducedMotion={reducedMotion}>
      <PopRewardContext.Provider value={{ enabled, level, reducedMotion }}>
        {children}
      </PopRewardContext.Provider>
    </UiMotionProvider>
  );
}

function usePopReward(level?: PopRewardLevel) {
  const context = React.useContext(PopRewardContext);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion =
    context.reducedMotion === "always" ||
    (context.reducedMotion === "user" && prefersReducedMotion === true);
  const resolvedLevel = level ?? context.level;

  return {
    enabled: context.enabled,
    level: resolvedLevel,
    recipe: popRewardRecipes[resolvedLevel],
    shouldReduceMotion,
  };
}

const particleDirections = [
  [0, -1],
  [0.72, -0.72],
  [1, 0],
  [0.72, 0.72],
  [0, 1],
  [-0.72, 0.72],
  [-1, 0],
  [-0.72, -0.72],
  [0.38, -0.92],
  [0.92, 0.38],
  [-0.38, 0.92],
  [-0.92, -0.38],
] as const;

type RewardBurstProps = Omit<React.ComponentProps<"span">, "key"> & {
  rewardKey: React.Key | null;
  level?: PopRewardLevel;
};

function RewardBurst({ rewardKey, level, className, children, ...props }: RewardBurstProps) {
  const reward = usePopReward(level);
  const showBurst = reward.enabled && !reward.shouldReduceMotion && rewardKey !== null;

  return (
    <span
      data-slot="reward-burst"
      data-reward-level={reward.level}
      className={cn("relative inline-grid", className)}
      {...props}
    >
      {children}
      <AnimatePresence initial={false}>
        {showBurst ? (
          <motion.span
            key={rewardKey}
            data-slot="reward-burst-particles"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-20 size-0"
          >
            {particleDirections.slice(0, reward.recipe.particleCount).map(([x, y], index) => (
              <motion.span
                key={`${x}-${y}`}
                data-slot="reward-burst-particle"
                className={cn(
                  "absolute -top-1 -left-1 size-2 rounded-full bg-primary shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_58%,transparent)]",
                  index % 3 === 1 && "bg-chart-2",
                  index % 3 === 2 && "bg-chart-4",
                )}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                animate={{
                  x: x * reward.recipe.particleDistance,
                  y: y * reward.recipe.particleDistance,
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, 1, 0.8, 0.35],
                }}
                transition={{
                  duration: reward.recipe.particleDuration,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.012,
                }}
              />
            ))}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

type SuccessPopProps = Omit<HTMLMotionProps<"div">, "title"> & {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  level?: PopRewardLevel;
};

function SuccessPop({
  open,
  title,
  description,
  action,
  level,
  className,
  ...props
}: SuccessPopProps) {
  const reward = usePopReward(level);
  const initial = reward.shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: reward.recipe.entryOffset, scale: reward.recipe.entryScale };
  const animate = reward.shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: [1, reward.recipe.overshootScale, 1] };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="success-pop"
          data-slot="success-pop"
          data-reward-level={reward.level}
          role="status"
          aria-live="polite"
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[var(--ui-radius-overlay)] border border-primary/25 bg-primary/10 p-4 text-foreground shadow-[var(--ui-shadow-interactive)]",
            className,
          )}
          initial={initial}
          animate={animate}
          exit={reward.shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: 0.98 }}
          transition={reward.recipe.transition}
          {...props}
        >
          <motion.svg
            data-slot="success-pop-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 size-6 overflow-visible rounded-full bg-primary p-1 text-primary-foreground"
            initial={reward.shouldReduceMotion ? false : { scale: 0.7, rotate: -12 }}
            animate={reward.shouldReduceMotion ? undefined : { scale: [0.7, 1.13, 1], rotate: 0 }}
            transition={reward.recipe.transition}
          >
            <motion.path
              d="m6.5 12.5 3.3 3.2 7.7-8"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              initial={reward.shouldReduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reward.recipe.particleDuration, ease: "easeOut" }}
            />
          </motion.svg>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{title}</div>
            {description ? (
              <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
            ) : null}
            {action ? <div className="mt-2 flex flex-wrap items-center gap-2">{action}</div> : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type AnimatedCounterProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number;
  format?: (value: number) => React.ReactNode;
  locale?: string | string[];
  level?: PopRewardLevel;
};

function AnimatedCounter({
  value,
  format,
  locale = "en-US",
  level,
  className,
  ...props
}: AnimatedCounterProps) {
  const reward = usePopReward(level);
  const previousValue = React.useRef(value);
  const direction = value >= previousValue.current ? 1 : -1;
  const renderedValue = format ? format(value) : value.toLocaleString(locale);

  React.useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <span
      data-slot="animated-counter"
      data-reward-level={reward.level}
      data-value={value}
      aria-live="polite"
      aria-atomic="true"
      className={cn("relative inline-grid overflow-hidden tabular-nums", className)}
      {...props}
    >
      <span className="sr-only">{renderedValue}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          aria-hidden="true"
          className="col-start-1 row-start-1"
          initial={
            reward.shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: direction * reward.recipe.entryOffset, scale: 0.9 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reward.shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: direction * -reward.recipe.entryOffset, scale: 0.94 }
          }
          transition={reward.recipe.transition}
        >
          {renderedValue}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type ProgressPopProps = Omit<React.ComponentProps<"div">, "children"> & {
  value: number;
  max?: number;
  label?: React.ReactNode;
  rewardKey?: React.Key | null;
  level?: PopRewardLevel;
  showValue?: boolean;
};

function ProgressPop({
  value,
  max = 100,
  label = "Progress",
  rewardKey = null,
  level,
  showValue = true,
  className,
  ...props
}: ProgressPopProps) {
  const reward = usePopReward(level);
  const labelId = React.useId();
  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clampedValue / safeMax) * 100);
  const showReward = reward.enabled && !reward.shouldReduceMotion && rewardKey !== null;

  return (
    <div
      data-slot="progress-pop"
      data-reward-level={reward.level}
      className={cn("grid gap-2", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span id={labelId} className="font-medium text-foreground">
          {label}
        </span>
        {showValue ? (
          <span className="tabular-nums text-muted-foreground">{percentage}%</span>
        ) : null}
      </div>
      <div
        data-slot="progress-pop-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clampedValue}
        className="relative h-3 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          data-slot="progress-pop-fill"
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={reward.shouldReduceMotion ? { duration: 0 } : reward.recipe.transition}
        />
        <AnimatePresence initial={false}>
          {showReward ? (
            <motion.span
              key={rewardKey}
              data-slot="progress-pop-reward"
              aria-hidden="true"
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/70 to-transparent"
              initial={{ left: "-35%", opacity: 0 }}
              animate={{ left: "105%", opacity: [0, 1, 0] }}
              transition={{ duration: reward.recipe.particleDuration, ease: "easeOut" }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

const defaultMilestones = [25, 50, 75, 100] as const;

type MilestoneProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  value: number;
  max?: number;
  label?: React.ReactNode;
  milestones?: readonly number[];
  level?: PopRewardLevel;
  showValue?: boolean;
};

function MilestoneProgress({
  value,
  max = 100,
  label = "Progress",
  milestones = defaultMilestones,
  level,
  showValue = true,
  className,
  ...props
}: MilestoneProgressProps) {
  const reward = usePopReward(level);
  const labelId = React.useId();
  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clampedValue / safeMax) * 100);
  const normalizedMilestones = React.useMemo(
    () =>
      [...new Set(milestones.map((milestone) => Math.min(Math.max(milestone, 0), 100)))]
        .filter((milestone) => milestone > 0)
        .sort((a, b) => a - b),
    [milestones],
  );
  const previousPercentage = React.useRef(percentage);
  const [celebratedMilestone, setCelebratedMilestone] = React.useState<number | null>(null);

  React.useEffect(() => {
    const crossedMilestone = normalizedMilestones
      .filter((milestone) => previousPercentage.current < milestone && percentage >= milestone)
      .at(-1);

    if (crossedMilestone !== undefined) {
      setCelebratedMilestone(crossedMilestone);
    }

    previousPercentage.current = percentage;
  }, [normalizedMilestones, percentage]);

  return (
    <div
      data-slot="milestone-progress"
      data-reward-level={reward.level}
      data-milestone={celebratedMilestone ?? undefined}
      className={cn("grid gap-2.5", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span id={labelId} className="font-medium text-foreground">
          {label}
        </span>
        {showValue ? (
          <span className="tabular-nums text-muted-foreground">{percentage}%</span>
        ) : null}
      </div>

      <div
        data-slot="milestone-progress-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clampedValue}
        aria-valuetext={`${percentage}% complete`}
        className="relative h-3 rounded-full bg-muted"
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <motion.div
            data-slot="milestone-progress-fill"
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={reward.shouldReduceMotion ? { duration: 0 } : reward.recipe.transition}
          />
          <AnimatePresence initial={false}>
            {reward.enabled &&
            !reward.shouldReduceMotion &&
            celebratedMilestone !== null &&
            percentage >= celebratedMilestone ? (
              <motion.span
                key={celebratedMilestone}
                data-slot="milestone-progress-sweep"
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/75 to-transparent"
                initial={{ left: "-35%", opacity: 0 }}
                animate={{ left: "105%", opacity: [0, 1, 0] }}
                transition={{ duration: reward.recipe.particleDuration, ease: "easeOut" }}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {normalizedMilestones.map((milestone) => {
          const reached = percentage >= milestone;
          const active = celebratedMilestone === milestone && reached;

          return (
            <motion.span
              key={milestone}
              data-slot="milestone-progress-marker"
              data-milestone={milestone}
              data-state={reached ? "reached" : "upcoming"}
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-muted-foreground/35 shadow-xs",
                reached && "bg-primary",
              )}
              style={{ left: `${milestone}%` }}
              initial={false}
              animate={
                active && reward.enabled && !reward.shouldReduceMotion
                  ? {
                      scale: [1, reward.recipe.overshootScale * 1.45, 1],
                      boxShadow: [
                        "0 0 0 0 color-mix(in oklch,var(--primary)_0%,transparent)",
                        "0 0 0 7px color-mix(in oklch,var(--primary)_22%,transparent)",
                        "0 0 0 0 color-mix(in oklch,var(--primary)_0%,transparent)",
                      ],
                    }
                  : { scale: 1 }
              }
              transition={reward.recipe.transition}
            />
          );
        })}
      </div>
    </div>
  );
}

type RewardLoaderStatus = "loading" | "success";

type RewardLoaderProps = Omit<React.ComponentProps<"span">, "children"> & {
  status: RewardLoaderStatus;
  label?: React.ReactNode;
  successLabel?: React.ReactNode;
  level?: PopRewardLevel;
  showLabel?: boolean;
};

function RewardLoader({
  status,
  label = "Loading",
  successLabel = "Complete",
  level,
  showLabel = true,
  className,
  ...props
}: RewardLoaderProps) {
  const reward = usePopReward(level);
  const previousStatus = React.useRef(status);
  const [completionKey, setCompletionKey] = React.useState(0);

  React.useEffect(() => {
    if (previousStatus.current === "loading" && status === "success") {
      setCompletionKey((current) => current + 1);
    }

    previousStatus.current = status;
  }, [status]);

  const renderedLabel = status === "success" ? successLabel : label;
  const rewardKey = status === "success" && completionKey > 0 ? completionKey : null;

  return (
    <span
      data-slot="reward-loader"
      data-status={status}
      data-reward-level={reward.level}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn("inline-flex items-center gap-2 text-sm font-medium", className)}
      {...props}
    >
      <RewardBurst rewardKey={rewardKey} level={level}>
        <span className="relative grid size-6 place-items-center" aria-hidden="true">
          <AnimatePresence initial={false} mode="wait">
            {status === "loading" ? (
              <motion.svg
                key="loading"
                data-slot="reward-loader-spinner"
                viewBox="0 0 24 24"
                className="size-5 text-primary"
                initial={{ opacity: 0 }}
                animate={reward.shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: reward.shouldReduceMotion ? 1 : 0.84 }}
                transition={
                  reward.shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        rotate: { duration: 0.8, ease: "linear", repeat: Infinity },
                        opacity: { duration: 0.12 },
                      }
                }
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="34 18"
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="success"
                data-slot="reward-loader-success"
                viewBox="0 0 24 24"
                className="size-6 rounded-full bg-primary p-1 text-primary-foreground"
                initial={reward.shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
                animate={
                  reward.shouldReduceMotion
                    ? { opacity: 1 }
                    : {
                        opacity: 1,
                        scale: [0.72, reward.recipe.overshootScale * 1.08, 1],
                      }
                }
                transition={reward.recipe.transition}
              >
                <motion.path
                  d="m6.5 12.5 3.3 3.2 7.7-8"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  initial={reward.shouldReduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: reward.shouldReduceMotion ? 0 : reward.recipe.particleDuration,
                    ease: "easeOut",
                  }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
      </RewardBurst>

      {showLabel ? <span>{renderedLabel}</span> : <span className="sr-only">{renderedLabel}</span>}
    </span>
  );
}

type AddToCollectionProps = HTMLMotionProps<"div"> & {
  itemKey: React.Key;
  level?: PopRewardLevel;
};

function AddToCollection({
  itemKey,
  level,
  className,
  layout = "position",
  children,
  ...props
}: AddToCollectionProps) {
  const reward = usePopReward(level);

  return (
    <motion.div
      data-slot="add-to-collection"
      data-reward-level={reward.level}
      data-item-key={String(itemKey)}
      className={cn("min-w-0", className)}
      layout={layout}
      initial={
        reward.shouldReduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: reward.recipe.entryOffset,
              scale: reward.recipe.entryScale,
              rotate: reward.level === "celebration" ? -1.5 : 0,
            }
      }
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      exit={reward.shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
      transition={reward.recipe.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export {
  AddToCollection,
  AnimatedCounter,
  CelebrationProvider,
  MilestoneProgress,
  ProgressPop,
  RewardBurst,
  RewardLoader,
  SuccessPop,
  popRewardRecipes,
};
export type {
  AddToCollectionProps,
  AnimatedCounterProps,
  CelebrationProviderProps,
  MilestoneProgressProps,
  PopRewardLevel,
  PopRewardRecipe,
  ProgressPopProps,
  RewardBurstProps,
  RewardLoaderProps,
  RewardLoaderStatus,
  SuccessPopProps,
};

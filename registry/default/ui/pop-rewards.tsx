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
  level?: PopRewardLevel;
};

function AnimatedCounter({ value, format, level, className, ...props }: AnimatedCounterProps) {
  const reward = usePopReward(level);
  const previousValue = React.useRef(value);
  const direction = value >= previousValue.current ? 1 : -1;
  const renderedValue = format ? format(value) : value.toLocaleString();

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
        <span className="font-medium text-foreground">{label}</span>
        {showValue ? (
          <span className="tabular-nums text-muted-foreground">{percentage}%</span>
        ) : null}
      </div>
      <div
        data-slot="progress-pop-track"
        role="progressbar"
        aria-label={typeof label === "string" ? label : "Progress"}
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
  ProgressPop,
  RewardBurst,
  SuccessPop,
  popRewardRecipes,
};
export type {
  AddToCollectionProps,
  AnimatedCounterProps,
  CelebrationProviderProps,
  PopRewardLevel,
  PopRewardRecipe,
  ProgressPopProps,
  RewardBurstProps,
  SuccessPopProps,
};

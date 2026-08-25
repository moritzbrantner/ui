"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/registry/default/lib/cn";
import { AnimatedCounter, RewardBurst } from "@/registry/default/ui/pop-rewards";

type AchievementUnlockProps = HTMLMotionProps<"section"> & {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  rewardKey?: React.Key | null;
  action?: React.ReactNode;
};

function AchievementUnlock({
  open,
  title,
  description,
  icon,
  rewardKey = "achievement",
  action,
  className,
  ...props
}: AchievementUnlockProps) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.section
          data-slot="achievement-unlock"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: [1, 1.035, 1] }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[var(--ui-radius-overlay)] border bg-card p-4 shadow-[var(--ui-shadow-interactive)]",
            className,
          )}
          {...props}
        >
          <RewardBurst rewardKey={rewardKey} level="celebration">
            <span className="grid size-11 place-items-center rounded-full bg-[var(--ui-celebratory-accent)] text-xl">
              {icon ?? "★"}
            </span>
          </RewardBurst>
          <div className="grid min-w-0 gap-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Achievement unlocked
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="text-sm text-foreground/80">{description}</p> : null}
            {action ? <div className="pt-2">{action}</div> : null}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

type StreakIndicatorProps = React.ComponentProps<"div"> & {
  days: number;
  label?: React.ReactNode;
  best?: number;
};

function StreakIndicator({
  days,
  label = "day streak",
  best,
  className,
  ...props
}: StreakIndicatorProps) {
  return (
    <div
      data-slot="streak-indicator"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="text-lg">
        🔥
      </span>
      <strong className="tabular-nums">
        <AnimatedCounter value={days} />
      </strong>
      <span className="text-sm">{label}</span>
      {best !== undefined ? (
        <span className="border-l pl-2 text-xs text-muted-foreground">best {best}</span>
      ) : null}
    </div>
  );
}

type CompletionRingProps = React.ComponentProps<"div"> & {
  value: number;
  max?: number;
  label?: React.ReactNode;
  size?: number;
};

function CompletionRing({
  value,
  max = 100,
  label = "Complete",
  size = 88,
  className,
  ...props
}: CompletionRingProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((clamped / safeMax) * 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      data-slot="completion-ring"
      role="progressbar"
      aria-label={typeof label === "string" ? label : "Completion"}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={`${percentage}% complete`}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--ui-progress-track)"
          strokeWidth="7"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--ui-progress-fill)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - percentage / 100) }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </svg>
      <span className="grid justify-items-center leading-none">
        <strong className="text-lg tabular-nums">{percentage}%</strong>
        <span className="mt-1 text-[0.65rem] text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

type RewardChecklistItem = {
  id: string;
  label: React.ReactNode;
  checked: boolean;
};

type RewardChecklistProps = React.ComponentProps<"div"> & {
  items: readonly RewardChecklistItem[];
  onCheckedChange?: (id: string, checked: boolean) => void;
  title?: React.ReactNode;
};

function RewardChecklist({
  items,
  onCheckedChange,
  title = "Checklist",
  className,
  ...props
}: RewardChecklistProps) {
  const completeCount = items.filter((item) => item.checked).length;
  const allComplete = items.length > 0 && completeCount === items.length;
  return (
    <div
      data-slot="reward-checklist"
      className={cn("grid gap-3 rounded-[var(--ui-radius-surface)] border bg-card p-4", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <RewardBurst rewardKey={allComplete ? completeCount : null} level="celebration">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {completeCount}/{items.length}
          </span>
        </RewardBurst>
      </div>
      <div className="grid gap-1">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--ui-radius-control)] px-2 py-1.5 hover:bg-muted/45"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) => onCheckedChange?.(item.id, event.currentTarget.checked)}
              className="size-4 accent-primary"
            />
            <span className={cn("text-sm", item.checked && "text-muted-foreground line-through")}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

type ShareSuccessCardProps = React.ComponentProps<"article"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  preview?: React.ReactNode;
  actions?: React.ReactNode;
};

function ShareSuccessCard({
  title,
  description,
  preview,
  actions,
  className,
  ...props
}: ShareSuccessCardProps) {
  return (
    <article
      data-slot="share-success-card"
      className={cn(
        "grid overflow-hidden rounded-[var(--ui-radius-overlay)] border bg-card shadow-[var(--ui-shadow-surface)]",
        className,
      )}
      {...props}
    >
      {preview ? <div className="min-h-36 bg-muted">{preview}</div> : null}
      <div className="grid gap-2 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Ready to share
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
      </div>
    </article>
  );
}

type ReactionBurstProps = React.ComponentProps<"button"> & {
  reaction: React.ReactNode;
  count: number;
  active?: boolean;
};

function ReactionBurst({
  reaction,
  count,
  active = false,
  className,
  children,
  ...props
}: ReactionBurstProps) {
  return (
    <RewardBurst rewardKey={active ? count : null} level="subtle">
      <button
        data-slot="reaction-burst"
        type="button"
        aria-pressed={active}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3 text-sm transition",
          active && "border-primary bg-primary/10",
          className,
        )}
        {...props}
      >
        <span aria-hidden="true">{reaction}</span>
        {children}
        <span className="tabular-nums text-muted-foreground">{count}</span>
      </button>
    </RewardBurst>
  );
}

export {
  AchievementUnlock,
  CompletionRing,
  ReactionBurst,
  RewardChecklist,
  ShareSuccessCard,
  StreakIndicator,
};
export type {
  AchievementUnlockProps,
  CompletionRingProps,
  ReactionBurstProps,
  RewardChecklistItem,
  RewardChecklistProps,
  ShareSuccessCardProps,
  StreakIndicatorProps,
};

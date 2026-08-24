"use client";

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionConfigProps,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { XIcon } from "lucide-react";

import { cn } from "@/registry/default/lib/cn";
import { buttonVariants } from "@/registry/default/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsProps,
  type TabsTriggerProps,
} from "@/registry/default/ui/tabs";

type UiMotionProfileName = "pop" | "pulse";

type UiMotionRecipe = {
  button: {
    hover: TargetAndTransition;
    tap: TargetAndTransition;
    transition: Transition;
  };
  indicator: {
    transition: Transition;
  };
  toast: {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    exit: TargetAndTransition;
    transition: Transition;
  };
};

const uiMotionRecipes = {
  pop: {
    button: {
      hover: { y: -2, scale: 1.028 },
      tap: { scale: 0.965 },
      transition: { type: "spring", stiffness: 480, damping: 28, mass: 0.7 },
    },
    indicator: {
      transition: { type: "spring", stiffness: 430, damping: 31, mass: 0.72 },
    },
    toast: {
      initial: { opacity: 0, y: 12, scale: 0.94 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -6, scale: 0.98 },
      transition: { type: "spring", stiffness: 410, damping: 30, mass: 0.78 },
    },
  },
  pulse: {
    button: {
      hover: { y: -2.5, scale: 1.02 },
      tap: { scale: 0.94 },
      transition: { type: "spring", stiffness: 560, damping: 24, mass: 0.64 },
    },
    indicator: {
      transition: { type: "spring", stiffness: 520, damping: 26, mass: 0.68 },
    },
    toast: {
      initial: { opacity: 0, x: 18, scale: 0.92 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: 12, scale: 0.96 },
      transition: { type: "spring", stiffness: 500, damping: 27, mass: 0.7 },
    },
  },
} as const satisfies Record<UiMotionProfileName, UiMotionRecipe>;

const UiMotionProfileContext = React.createContext<UiMotionProfileName>("pop");

type UiMotionProviderProps = {
  children: React.ReactNode;
  profile: UiMotionProfileName;
  reducedMotion?: MotionConfigProps["reducedMotion"];
};

function UiMotionProvider({ children, profile, reducedMotion = "user" }: UiMotionProviderProps) {
  return (
    <MotionConfig reducedMotion={reducedMotion}>
      <UiMotionProfileContext.Provider value={profile}>{children}</UiMotionProfileContext.Provider>
    </MotionConfig>
  );
}

function useUiMotionRecipe(profile?: UiMotionProfileName) {
  const inheritedProfile = React.useContext(UiMotionProfileContext);
  const resolvedProfile = profile ?? inheritedProfile;

  return {
    profile: resolvedProfile,
    recipe: uiMotionRecipes[resolvedProfile],
  };
}

type MotionButtonProps = HTMLMotionProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    motionProfile?: UiMotionProfileName;
  };

function MotionButton({
  className,
  variant = "default",
  size = "default",
  motionProfile,
  disabled,
  ...props
}: MotionButtonProps) {
  const { profile, recipe } = useUiMotionRecipe(motionProfile);

  return (
    <motion.button
      data-slot="motion-button"
      data-motion-profile={profile}
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      initial={false}
      whileHover={disabled ? undefined : recipe.button.hover}
      whileTap={disabled ? undefined : recipe.button.tap}
      transition={recipe.button.transition}
      {...props}
    />
  );
}

type MotionTabsContextValue = {
  indicatorId: string;
  profile: UiMotionProfileName;
  recipe: UiMotionRecipe;
  value?: string;
};

const MotionTabsContext = React.createContext<MotionTabsContextValue | null>(null);

type MotionTabsProps = TabsProps & {
  motionProfile?: UiMotionProfileName;
};
type MotionTabsListProps = TabsListProps;
type MotionTabsTriggerProps = TabsTriggerProps;
type MotionTabsContentProps = TabsContentProps;

function MotionTabs({
  value,
  defaultValue,
  onValueChange,
  motionProfile,
  ...props
}: MotionTabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const { profile, recipe } = useUiMotionRecipe(motionProfile);
  const indicatorId = React.useId();
  const resolvedValue = value ?? uncontrolledValue;
  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <MotionTabsContext.Provider
      value={{
        indicatorId: `ui-motion-tabs-${indicatorId}`,
        profile,
        recipe,
        value: resolvedValue,
      }}
    >
      <Tabs
        data-slot="motion-tabs"
        data-motion-profile={profile}
        value={resolvedValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </MotionTabsContext.Provider>
  );
}

function MotionTabsList({ className, ...props }: MotionTabsListProps) {
  return <TabsList data-slot="motion-tabs-list" className={className} {...props} />;
}

function MotionTabsTrigger({ className, value, children, ...props }: MotionTabsTriggerProps) {
  const context = React.useContext(MotionTabsContext);

  if (!context) {
    throw new Error("MotionTabsTrigger must be used within MotionTabs.");
  }

  const active = context.value === value;

  return (
    <TabsTrigger
      data-slot="motion-tabs-trigger"
      data-motion-profile={context.profile}
      className={cn(
        "isolate overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none",
        className,
      )}
      value={value}
      {...props}
    >
      {active ? (
        <motion.span
          data-slot="motion-tabs-indicator"
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[inherit] bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
          layoutId={context.indicatorId}
          transition={context.recipe.indicator.transition}
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-[var(--ui-control-gap)]">
        {children}
      </span>
    </TabsTrigger>
  );
}

function MotionTabsContent({ className, ...props }: MotionTabsContentProps) {
  return <TabsContent data-slot="motion-tabs-content" className={className} {...props} />;
}

type MotionToastProps = Omit<HTMLMotionProps<"div">, "title"> & {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  motionProfile?: UiMotionProfileName;
};

function MotionToast({
  open,
  onOpenChange,
  title,
  description,
  action,
  motionProfile,
  className,
  ...props
}: MotionToastProps) {
  const { profile, recipe } = useUiMotionRecipe(motionProfile);
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? { opacity: 0 } : recipe.toast.initial;
  const exit = shouldReduceMotion ? { opacity: 0 } : recipe.toast.exit;

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="ui-motion-toast"
          data-slot="motion-toast"
          data-motion-profile={profile}
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-auto relative grid w-full max-w-sm gap-1 overflow-hidden rounded-[var(--ui-radius-overlay)] border bg-background p-4 pr-12 shadow-[var(--ui-shadow-overlay,var(--ui-shadow-surface))]",
            className,
          )}
          initial={initial}
          animate={recipe.toast.animate}
          exit={exit}
          transition={recipe.toast.transition}
          {...props}
        >
          <div className="text-sm font-semibold">{title}</div>
          {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
          {action ? <div className="mt-2 flex items-center gap-2">{action}</div> : null}
          {onOpenChange ? (
            <button
              type="button"
              data-slot="motion-toast-close"
              aria-label="Close notification"
              className="absolute top-1.5 right-1.5 inline-flex size-10 items-center justify-center rounded-[var(--ui-radius-control)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[var(--ui-focus-ring-width)] focus-visible:ring-ring/50"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export {
  MotionButton,
  MotionTabs,
  MotionTabsContent,
  MotionTabsList,
  MotionTabsTrigger,
  MotionToast,
  UiMotionProvider,
  uiMotionRecipes,
};
export type {
  MotionButtonProps,
  MotionTabsContentProps,
  MotionTabsListProps,
  MotionTabsProps,
  MotionTabsTriggerProps,
  MotionToastProps,
  UiMotionProfileName,
  UiMotionProviderProps,
  UiMotionRecipe,
};

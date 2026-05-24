type LegacyMotionProps = {
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  layout?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  transition?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  initial?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  animate?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  exit?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  whileHover?: unknown;
  /** @deprecated Motion props are accepted for one release but no longer drive runtime animation. */
  whileTap?: unknown;
};

const glassMotionTransition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.6,
} satisfies Record<string, unknown>;

const glassSurfaceMotion = {
  layout: true,
  transition: glassMotionTransition,
} satisfies LegacyMotionProps;

const glassInteractiveMotion = {
  layout: true,
  whileHover: { y: -1, scale: 1.012 },
  whileTap: { scale: 0.99 },
  transition: glassMotionTransition,
} satisfies LegacyMotionProps;

export { glassInteractiveMotion, glassMotionTransition, glassSurfaceMotion };
export type { LegacyMotionProps };

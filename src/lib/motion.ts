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

/**
 * @deprecated No longer functional. Framer Motion has been removed.
 * Kept for one release to avoid hard breaking changes. Remove spreads of this object.
 */
const glassMotionTransition: Record<string, never> = {};

/**
 * @deprecated No longer functional. Framer Motion has been removed.
 * Kept for one release to avoid hard breaking changes. Remove spreads of this object.
 */
const glassSurfaceMotion: LegacyMotionProps = {};

/**
 * @deprecated No longer functional. Framer Motion has been removed.
 * Kept for one release to avoid hard breaking changes. Remove spreads of this object.
 */
const glassInteractiveMotion: LegacyMotionProps = {};

export { glassInteractiveMotion, glassMotionTransition, glassSurfaceMotion };
export type { LegacyMotionProps };

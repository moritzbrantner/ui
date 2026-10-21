# Visual Grammar

The design system should vary themes through a small set of deliberate visual dimensions instead of accumulating isolated component values.

## Dimensions

Every built-in theme should make an explicit choice for each dimension:

| Dimension         | Questions                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Typography        | What is the hierarchy for display, heading, body, control, caption, and numeric text?          |
| Density           | Is the theme compact, default, or comfortable? Which control and table rhythms follow from it? |
| Spacing           | Which reference spacing steps drive surfaces, controls, groups, and page layout?               |
| Shape             | How do controls, surfaces, overlays, and pills relate instead of choosing radii independently? |
| Elevation         | When should borders, shadows, translucency, or flat surfaces communicate hierarchy?            |
| Color             | Which reference ramps produce semantic surface, text, action, status, and data colors?         |
| Motion            | Which interactions move, how far, how quickly, and which properties are safe to animate?       |
| Surface treatment | Is the theme solid, glassy, paper-like, editorial, or otherwise distinct?                      |

## Token architecture

Use three conceptual layers when extending the token system:

1. **Reference tokens** define reusable scales: spacing steps, typography sizes/leading, radii, elevation levels, and color ramps.
2. **Semantic tokens** describe meaning: primary action, muted text, elevated surface, dense control, document annotation, warning state.
3. **Component tokens** exist only when a component genuinely needs to diverge from the semantic defaults.

Prefer derivation over adding another isolated number. A component token that always equals a semantic token is an alias, not a new design decision.

## Reference spacing

`--ui-space-{0,1,2,3,4,5,6,7,8,9,10,11,12,14,16}` is the reference spacing scale: step `n` is `n × 0.25rem`. Bobba's semantic control, table, surface, menu, toolbar, and button spacing tokens derive from it. Other themes keep their own values where they deliberately differ.

## Density profiles

Three density profiles override the semantic control, table, and surface rhythm tokens (`--ui-control-*`, `--ui-table-row-height`, `--ui-table-cell-padding-x`, `--ui-surface-*`) from the reference scale:

- `compact`: operational tables, command surfaces, editor tools, and high-information layouts.
- `default`: general product applications and reusable patterns. Equals Bobba's own rhythm.
- `comfortable`: reading, document, and lower-frequency interaction surfaces.

Opt in with `data-ui-density="compact" | "default" | "comfortable"` on any element. Put the attribute on or inside a `data-ui-theme` scope, since a nested theme scope restates its own rhythm. Without the attribute, each theme keeps its own default rhythm: Atlas, Paper, and Scholia are compact; Studio, Pop, and Pulse are comfortable; Bobba and Zleek are default. Studio can mix compact controls with spacious canvases by putting `data-ui-density="compact"` on its tool panels.

## Typography ladder

A small reusable ladder replaces component-specific font sizes. Each role defines `--ui-text-<role>-size`, `-leading`, `-weight`, and `-tracking`, and is available as the Tailwind utility `text-ui-<role>`:

| Role         | Size      | Line height | Weight | Tracking |
| ------------ | --------- | ----------- | ------ | -------- |
| `display`    | 3rem      | 1.05        | 700    | -0.03em  |
| `heading-1`  | 2.25rem   | 1.15        | 600    | -0.025em |
| `heading-2`  | 1.5rem    | 1.25        | 600    | -0.02em  |
| `heading-3`  | 1.25rem   | 1.35        | 600    | -0.01em  |
| `title`      | 1rem      | 1.5rem      | 600    | 0        |
| `body`       | 1rem      | 1.75rem     | 400    | 0        |
| `body-small` | 0.875rem  | 1.5rem      | 400    | 0        |
| `control`    | 0.875rem  | 1.25rem     | 500    | 0        |
| `caption`    | 0.75rem   | 1rem        | 500    | 0.01em   |
| `mono`       | 0.8125rem | 1.25rem     | 400    | 0        |

Pair roles with the theme font families (`font-heading`, `font-body`, `font-control`, `font-mono`). `--ui-text-measure` (70ch) is the recommended maximum line length for reading text: `max-w-(--ui-text-measure)`.

## Performance rules

Style quality includes rendering cost.

- Prefer `transform` and `opacity` for animated movement.
- Treat large backdrop filters, animated gradients, large blurred shadows, and repeated paint-heavy effects as opt-in and benchmarked.
- Reduced-motion and reduced-transparency behavior remain part of the theme contract.
- JSDOM render benchmarks cover React/runtime regressions; real Chromium measurements cover CSS selector matching, style recalculation, layout, and browser task cost.

## Reference specimen

`Design System/Style Specimen` is the visual comparison surface. It renders identical content and component structure for all built-in themes. Changes to typography, density, spacing, shape, elevation, motion, or surface treatment should be evaluated there before adding theme-specific examples.

A theme should not be considered more mature merely because it has more tokens. It should be possible to explain its choices across the visual dimensions above and see those choices consistently in the reference specimen.

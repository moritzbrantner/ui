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

## Density profiles

The next token expansion should support three coherent density profiles:

- `compact`: operational tables, command surfaces, editor tools, and high-information layouts.
- `default`: general product applications and reusable patterns.
- `comfortable`: reading, document, and lower-frequency interaction surfaces.

Themes may choose a default profile while components can opt into a different profile when their domain requires it. Atlas should generally bias compact; Paper and Scholia should generally bias comfortable reading surfaces; Studio can mix compact controls with spacious canvases.

## Typography ladder

The system needs a small reusable ladder rather than component-specific font sizes:

- display
- heading-1
- heading-2
- heading-3
- title
- body
- body-small
- control
- caption
- mono/numeric

Each role should define size, line height, weight, and tracking where relevant. Reading roles should also define a recommended measure instead of allowing arbitrary line lengths.

## Performance rules

Style quality includes rendering cost.

- Prefer `transform` and `opacity` for animated movement.
- Treat large backdrop filters, animated gradients, large blurred shadows, and repeated paint-heavy effects as opt-in and benchmarked.
- Reduced-motion and reduced-transparency behavior remain part of the theme contract.
- JSDOM render benchmarks cover React/runtime regressions; real Chromium measurements cover CSS selector matching, style recalculation, layout, and browser task cost.

## Reference specimen

`Design System/Style Specimen` is the visual comparison surface. It renders identical content and component structure for all built-in themes. Changes to typography, density, spacing, shape, elevation, motion, or surface treatment should be evaluated there before adding theme-specific examples.

A theme should not be considered more mature merely because it has more tokens. It should be possible to explain its choices across the visual dimensions above and see those choices consistently in the reference specimen.

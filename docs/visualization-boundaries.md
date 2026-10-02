# Visualization package boundaries

`@moritzbrantner/ui` is a design system, not the owner of specialized visualization engines.

The specialized packages are independently installable products with their own runtime, styling,
accessibility, performance, and release contracts:

- `@moritzbrantner/tables` owns table/data-grid behavior, virtualization, table data transforms, and
  table-specific interaction contracts.
- `@moritzbrantner/charts` owns chart data transforms, chart interaction/rendering helpers, and
  chart-specific presentation primitives.
- `@moritzbrantner/diagrams` owns diagram models, layouts, interactions, rendering, and
  diagram-specific presentation primitives.

## Dependency direction

The specialized packages must not require `@moritzbrantner/ui` as a runtime or peer dependency.
They may expose package-owned CSS variables and standalone styles, and consuming applications may
choose to map those variables to a UI theme.

`@moritzbrantner/ui` may depend on or integrate with the specialized packages when a design-system
adapter is genuinely useful. That dependency direction is intentionally one-way: UI integrations
must not become a prerequisite for using the specialized package.

`@moritzbrantner/viz-engine` may be shared by visualization packages only for renderer-agnostic
algorithms or contracts that are genuinely common. It must not become a replacement design system
or a home for arbitrary shared React primitives.

## What remains in ui

`@moritzbrantner/ui` continues to own generic primitives and state-light presentation patterns such
as buttons, inputs, cards, search fields, simple lists, and lightweight data-display affordances.
Those components may display tabular or numeric information, but they must not grow into competing
chart, table, or diagram engines.

A component belongs in a specialized package when its API is primarily shaped by that problem
domain: columns/rows and virtualization for tables, axes/series/domains for charts, or nodes/edges
and layout for diagrams.

## Integration rule

Applications should be able to choose either of these compositions:

```text
app -> charts/tables/diagrams
```

or:

```text
app -> ui
app -> charts/tables/diagrams
ui  -> optional visualization adapters
```

The inverse dependency is forbidden:

```text
charts/tables/diagrams -> ui
```

This boundary lets the specialized packages evolve their APIs, rendering strategies, performance
work, and styling without being constrained by the design-system package.

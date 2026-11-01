# @moritzbrantner/ui

## Unreleased

### Patch Changes

- `FilterChip`'s accessible name is now its visible text with an action prefix, for example "Clear filter: Status Ready". Before, it was "Clear status filter", which axe-core 4.14 reports as `label-content-name-mismatch`. Locators that used the old name need updating.
- More accessible names now contain their visible text, for axe-core 4.14's `label-content-name-mismatch`. Locators that used the old names need updating:
  - **FilterBar control trigger:** "Filter Status" becomes "Filter Status Active" when a summary is shown.
  - **DocumentViewer reset-zoom button:** "100%, reset zoom" (was "Reset zoom").
  - **Gantt task bars without a `taskRenderer`:** "Discovery 40%, Apr 1 to Apr 10".
  - **AccountMenu trigger:** "AL Open account menu", the avatar text followed by the label.
  - **Calendar day buttons:** the visible day number and events, followed by react-day-picker's full date label.

### Minor Changes

- The glass shine sweep on buttons, cards, page headers, surfaces and toasts is now a `transform`-animated `::after` layer instead of an animated `background-position`, so hover and open states composite instead of repainting (Zleek's measured interaction cost was dominated by the old sweep). These hosts now get `position: relative`, `isolation: isolate` and `overflow: clip`, so content overflowing a button or page header is clipped. Overlays, alerts, toolbars, navbars, action bars and dropzones keep the `background-position` sweep. Pulse and Pop buttons, interactive cards and toasts show no shine, as before.
- **Breaking token change:** the moving highlight is split out of `--glass-surface-gradient` and `--glass-overlay-gradient` into `--glass-shine-gradient`, and `--glass-background-size`, `--glass-background-position` and `--glass-background-position-hover` are replaced by the unitless `--glass-shine-width` (band width as a multiple of the host width), `--glass-shine-from` and `--glass-shine-to` (background-position-style alignment: `0` aligns left edges, `1` right edges). There are no compatibility aliases: custom themes must move the band layer into `--glass-shine-gradient` and convert, for example, `240% 100%` / `-120% 0` / `120% 0` to `2.4` / `-1.2` / `1.2`.
- Add typography, spacing, and density foundations. Reference spacing tokens `--ui-space-{0…16}` (`n × 0.25rem`) now drive Bobba's control, table, surface, and toolbar rhythm. A typography ladder (`--ui-text-{display,heading-1,heading-2,heading-3,title,body,body-small,control,caption,mono}-{size,leading,weight,tracking}` plus `--ui-text-measure`) is exposed as Tailwind `text-ui-<role>` utilities. `data-ui-density="compact" | "default" | "comfortable"` overrides control, table, and surface rhythm for a subtree in every theme. Other themes retain their existing appearance. `UiThemeProfile["density"]` uses `"default"` instead of `"balanced"`. Dark token blocks now restate only mode-dependent tokens. Paper and Scholia now default to comfortable density; dense consumers can opt into compact.
- Add a shadcn-compatible source registry as an opt-in distribution path alongside the package, with seven pilot items, deterministic source synchronization, upstream schema validation, and GitHub Pages publishing.
- Add the first theme-owned registry slice for Scholia, with a typed theme manifest, complete source-installable theme styles, source passage, critical apparatus, scholarly note components, and a source workbench block.
- Add explicit Motion-powered Pop and Pulse profiles with reduced-motion policy, motion-enhanced Button, Tabs, and Toast patterns, Storybook demos, typed theme manifests, and source-installable registry themes.
- Add an event-driven Pop reward system with three intensity levels, bursts, success feedback, animated counters, progress rewards, collection entry motion, and an interactive Storybook playground.

### Distribution

- Retire npm publishing: the publish workflow, `publishConfig` and `publish:registry` are removed. Install the package as a commit-pinned git dependency (`git+https://github.com/moritzbrantner/ui.git#<sha>` listed in `trustedDependencies`); `prepare` builds `dist`. Versions already on npm stay there.

## 1.1.0

### Minor Changes

- Add public `CelebrationCallout` and `LiveIndicator` pattern components with registry metadata, Storybook coverage, focused tests, and package contract coverage.
- Extend generated theme CSS and token metadata with motion extras, display density roles, status aliases, overlay action tokens, and richer `pop` and `pulse` theme scopes.
- Reuse shared `FilterBar` controls inside `DataGrid` column filters, including exported filter value helpers for text, number, date range, and boolean filtering.
- Improve breadcrumb sizing by removing fixed minimum dimensions while preserving accessible hit targets.
- Parallelize visual checks and centralize mobile usability report writing for faster release verification.

## 1.0.0

### Minor Changes

- Remove deprecated no-op Framer Motion compatibility props from stable primitives. Consumers should remove legacy props such as `layout`, `transition`, `initial`, `animate`, `exit`, `whileHover`, and `whileTap` from UI primitives.

## 0.10.0

### Minor Changes

- Remove the stable chart family, including `ChartAreaGraph`, `ChartBarGraph`, `ChartDonutGraph`, `ChartHistogramGraph`, `ChartLineGraph`, `ChartPretext`, `ChartPretextText`, `ChartSparkline`, `FunnelChart`, and `OrgChart`, along with the `chart`, `funnel-chart`, and `org-chart` component subpaths.
- Remove the labs UML diagram surface, including `UmlDiagram`, `UmlClassDiagram`, `UmlStateDiagram`, `getUmlDiagramBounds`, and the `uml-diagram` component subpath.
- Drop the Recharts dependency after removing the chart component family.
- Keep chart color tokens available for non-chart components such as `Infographic`, `Gantt`, and themed shell surfaces.
- Harden release confidence with passing package export checks, consumer package verification, Storybook build coverage, build-size checks, package dry-run output, and isolated benchmark verification.
- Migration: move chart, funnel, org chart, and UML/editor-specific visualization behavior to app-owned code or a dedicated visualization package.

## 0.9.1

### Patch Changes

- Fix release verification blockers for Storybook accessibility checks, package benchmarks, visual overlay focus handling, and Unlighthouse chart dashboard performance.

## 0.9.0

### Minor Changes

- Add public `TagInput`, `DisclosurePanel`, `ResourceList`, `ViewHeader`, `DetailsPanel`, and `ConfirmAction` components for reusable app surfaces.
- Add `@moritzbrantner/ui/social` for chat, social actions, social feed, and profile summary components, and remove the old chat box API.
- Add focused `@moritzbrantner/ui/data`, `@moritzbrantner/ui/shell`, and `@moritzbrantner/ui/media` entrypoints; data-page, app-shell, and media-editing components are no longer exported from root or patterns/labs barrels.
- Remove the legacy `DataTable` API; use `DataGrid` from `@moritzbrantner/ui/data` or `@moritzbrantner/ui/components/data/data-grid`.
- Remove UI labs workflow editor surfaces; use `@moritzbrantner/workflow-editor/react` for workflow editing UI.
- Remove the UI labs timeline editor; use `@moritzbrantner/timeline-editor/react` for timeline editing UI.
- Expand chart, org-chart, and UML interactions with keyboard navigation and selection coverage.
- Improve `Citation` support for ranged excerpts with omissions and additions.
- Tighten responsive behavior across root-public stable and pattern components.
- Replace stale selector styling with Radix `data-state` variants and add a package check to prevent regressions.
- Add Unlighthouse audits to release verification, consolidate stable primitive Storybook coverage, and refine lab component performance benchmarks.

## 0.8.0

### Minor Changes

- Breaking: component subpaths are tiered; later releases move data, shell, social, and media surfaces to focused public entrypoints.
- Migration: replace flat component subpaths with tiered paths, such as `@moritzbrantner/ui/components/stable/button`.
- Add a typed component registry, tier barrels, tier-aware package checks, token metadata centralization, and migration documentation.

## 0.7.0

### Minor Changes

- Add composed action menu APIs on top of the existing low-level menu primitives.
- Add right-click `ContextActionMenu` for contextual target actions.
- Add mobile `ActionSheet` backed by `MobileSlide`.
- Add `ResponsiveActionMenu` for desktop dropdown and mobile sheet composition.
- Add read-only `HoverPreview` for hover and focus previews.
- Expand tests, Storybook coverage, visual checks, docs, coverage tracking, and package contract checks for the new menu layer.

## 0.6.0

### Minor Changes

- Add `FilterBar` composition components for app-owned search and active filter state.
- Add deterministic QueryBuilder IDs, operator label overrides, empty-state copy, and exported query helper constructors.
- Add WorkflowBuilder viewport control plus connection lifecycle and validation hooks.
- Expand primitive Storybook coverage, focused tests, visual checks, docs, and package-contract assertions.

## 0.5.4

### Patch Changes

- Add explicit client/server package entrypoints plus server-only theme entrypoints for metadata-safe consumption.
- Expand package, consumer bundle, Storybook, visual, build-size, benchmark, and release verification guardrails.
- Add and refine Gantt, UML diagram, chart, terminal, resizable-tabs, spinner, typography, and workflow component coverage.
- Add GitHub Pages deployment support and tighten CI/publish release checks.

## 0.5.2

### Patch Changes

- Refresh the UI package release with the current package test layout and release verification guardrails.

## 0.5.0

### Minor Changes

- Add the newest UI workflow components, including data grids, asset browsers, annotation canvases, document workflows, theme and language switchers, avatar initials, and image cropper components.
- Move the foundation workflow components into the UI package and remove the separate Foundation UI package surface.

## 0.4.0

### Minor Changes

- Document the UI package, add theme and component subpath exports, verify built package exports, and standardize motion imports.
- Remove Foundation UI stories and Storybook-only Foundation package aliases from the UI package Storybook.

## 0.3.1

### Patch Changes

- Release every package in the workspace.

## 0.3.0

### Minor Changes

- [`0ce32d3`](https://github.com/moritzbrantner/platform-packages/commit/0ce32d343359c34f751aaf54f8be63e769f63fa5) - Extract the shared UI primitives and storytelling runtime into publishable platform packages.

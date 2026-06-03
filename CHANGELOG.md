# @moritzbrantner/ui

## 0.9.2

### Patch Changes

- Add mobile usability release audits and skip verification for documented mobile exceptions.
- Improve Storybook release stability with cache-bust reload handling, stable input stories, and simplified story metadata.
- Harden release verification around Bun-only package checks, consumer package checks, package styles, coverage fallback behavior, and Unlighthouse Chromium sandbox options.
- Refine mobile navigation, primitive form controls, overlay behavior, charts, resizable surfaces, media controls, and composed pattern stories for release readiness.

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

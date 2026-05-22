# @moritzbrantner/ui

## 0.8.0

### Minor Changes

- Breaking: component subpaths are now tiered under `components/stable`, `components/patterns`, `components/labs`, and `components/legacy`.
- Breaking: `labs` and `legacy` components are no longer root-exported; root and client exports contain only stable and pattern components plus shared helpers and theme client APIs.
- Migration: replace flat component subpaths with tiered paths, such as `@moritzbrantner/ui/components/stable/button` and `@moritzbrantner/ui/components/patterns/data-grid`.
- Legacy: `DataTable` is deprecated for app data pages and remains available only from legacy paths; use `DataGrid` for new data-page work.
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

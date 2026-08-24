# ADR 0006: Add typed theme manifests and a Scholia registry slice

## Status

Accepted.

## Context

The package has published themes with distinct tokens, profiles, stylesheets, and Storybook
showcases. The source registry introduced by ADR 0005 has only one shared foundation and a small
default component catalog. Nothing machine-readable connects a theme's purpose and tokens to the
components or installable compositions that express it.

Theme-specific source distribution must not move product workflows into the design system.
Applications still own source loading, corpus identity, interpretation state, routing, persistence,
permissions, and mutations.

## Decision

Add typed, server-safe theme manifests that connect:

- a published theme's intent and package stylesheet;
- the semantic tokens that most strongly define it;
- source-registry theme and component items;
- source-registry blocks that demonstrate the theme as a coherent composition.

Theme manifests are introduced incrementally. `uiThemeManifests` is intentionally partial until a
theme has a reviewed source-owned slice.

Scholia is the first slice. It provides:

- `scholia-theme`, containing the complete generated Tailwind foundation and Scholia light/dark
  token contract;
- `source-passage`, `apparatus-list`, and `scholarly-note` as reusable state-light pattern
  components;
- `scholia-source-workbench` as an installable block that composes source text, translation,
  apparatus, metadata, and notes.

Package component source and generated theme CSS remain canonical. Registry copies are produced by
`scripts/sync-registry.ts`, and normal registry verification rejects drift.

The workbench accepts content and presentation slots only. It does not select an edition, resolve a
locator, choose an interpretation, fetch a corpus, or persist annotations.

## Consequences

- A theme can now manifest its ideas through an auditable installation contract rather than only a
  stylesheet or showcase.
- Consumers may install the entire Scholia slice or choose its components independently.
- The npm package and source registry continue to expose the same state-light component contracts.
- Adding another themed slice requires a typed manifest, a complete theme item, reviewed components,
  at least one coherent block, source synchronization, and registry validation.
- Theme manifests do not imply that every component is exclusive to one theme; they identify the
  components and compositions that best express a theme.

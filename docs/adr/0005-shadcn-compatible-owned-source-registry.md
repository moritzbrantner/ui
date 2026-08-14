# ADR 0005: Add a shadcn-compatible owned-source registry

## Status

Accepted.

## Context

`@moritzbrantner/ui` currently distributes shared React components as a versioned package. That model is useful for stable primitives, coordinated theme changes, and consumers that want centrally managed upgrades. It is less useful when an application needs to inspect, adapt, or permanently own a component implementation.

shadcn's registry model provides a second distribution mode: install source files into the consuming repository, then let that repository own the result. Adopting that ownership model does not require adopting shadcn's visual defaults or replacing the existing package.

The Moritz UI visual and product rules still apply:

- Surfaces communicate real structure; cards are not the default container.
- Prominent metrics support a decision, threshold, comparison, trend, or action.
- Semantic tokens and named variants carry visual decisions.
- Components remain state-light; applications own product workflows and side effects.

## Decision

Maintain two deliberate distribution modes from the same repository:

1. The npm package remains the compatibility and centrally managed distribution path.
2. A shadcn-compatible registry provides source-owned installation for applications that need local adaptation.

The registry starts with a small, representative set: the `cn` utility, the foundational theme tokens, `Button`, `Input`, `Label`, `DescriptionList`, and `MetricStrip`.

Package source remains canonical. `scripts/sync-registry.ts` creates registry source files using deterministic import rewriting, and CI rejects registry drift. Registry source files are committed because public GitHub registries resolve files directly from the repository.

The registry uses the upstream shadcn schemas and the pinned shadcn CLI to build static catalog and item JSON. GitHub Pages publishes those JSON files under Storybook's `/r/` path.

## Consequences

- Consumers can choose central upgrades or local ownership component by component.
- Existing package import paths and releases remain intact.
- Registry components preserve Moritz UI semantics rather than inheriting generic shadcn styling.
- Adding a registry-backed component requires declaring dependencies and a target path, synchronizing its source, and passing the registry build.
- Registry-installed source may diverge after installation; that is an explicit benefit and responsibility of local ownership.
- The registry catalog should expand in reviewed slices, starting with stable components and then state-light patterns with clear dependency graphs.

# Contributing to `@moritzbrantner/ui`

`@moritzbrantner/ui` is the workspace design-system package. It should stay focused on reusable UI, not application workflows.

## Boundaries

Belongs in `@moritzbrantner/ui`:

- Design tokens and theme metadata.
- Primitive controls.
- Shared composed components.
- Layout primitives.
- Accessibility and interaction helpers that apply across projects.

Belongs outside `@moritzbrantner/ui`:

- Auth flows.
- Profile screens.
- Upload management flows.
- Settings pages.
- Data-entry workflows.
- Product-specific empty states or onboarding flows.

Use consuming app packages for product patterns that compose the design system with contracts, runtime data, roles, pages, or application behavior. Generic menus can live in `@moritzbrantner/ui` only when they remain state-free and contract-free.

See [docs/design-system.md](./docs/design-system.md) for app-scale usage recipes, import boundaries, and package ownership rules.

## Component checklist

Before exporting a component:

- It accepts `className`.
- It forwards standard DOM props.
- It uses `data-slot`.
- It uses semantic tokens from `styles.css`.
- It exposes variants for intentional design states.
- It does not expose arbitrary visual knobs.
- It has Storybook coverage.
- It has focused tests for rendering and important accessibility behavior.
- It lives in the correct tier under `src/components/stable`, `src/components/patterns`, `src/components/data`, `src/components/shell`, `src/components/social`, `src/components/media`, or `src/components/labs`.
- It is listed in `src/component-registry.ts` with the correct public subpath, Storybook files, and test files.
- It is exported from its tier barrel. Only `stable` and `patterns` components are root-exported through `src/index.ts`.

Tier policy:

- `stable`: primitives and low-level controls with strict contract checks.
- `patterns`: state-light composed components for reusable app workflows.
- `data`: shared table, filter, search, list, and bulk-selection surfaces; not root-exported.
- `shell`: app chrome and navigation surfaces; not root-exported.
- `social`: chat, feed, social-action, and profile-summary surfaces; not root-exported.
- `media`: image editing and media manipulation surfaces; not root-exported.
- `labs`: experimental public components; not root-exported.

New component subpaths must be tiered, for example `@moritzbrantner/ui/components/stable/button` or `@moritzbrantner/ui/components/data/data-grid`. Do not add compatibility wrappers for the removed flat `@moritzbrantner/ui/components/*` paths.

## Registry checklist

Registry distribution is opt-in. A component can remain package-only until its dependency graph and local-ownership story are clear.

Before adding a registry item:

- Keep `src/` as the canonical implementation.
- Add the source mapping to `scripts/sync-registry.ts`.
- Declare the item, npm dependencies, registry dependencies, and target placeholder in `registry/default/registry.json`.
- Use `@ui/`, `@lib/`, or `@hooks/` targets so consumer aliases remain configurable.
- Run `bun run sync:registry` after changing mapped source.
- Run `bun run verify:registry` to reject drift and validate the upstream schema through the pinned shadcn CLI.
- Install the built item into a disposable consumer before expanding a complex dependency graph.

Do not hand-edit generated files in `registry/default/lib`, `registry/default/styles`, or `registry/default/ui`.

Before adding a themed registry slice:

- Add a typed manifest that connects theme intent, defining tokens, components, and blocks.
- Include the complete generated theme contract rather than a hand-maintained token subset.
- Keep theme components state-light and independently installable where practical.
- Include at least one coherent `registry:block` composition.
- Document which workflow and data responsibilities remain in consuming applications.

## Storybook checklist

Every release-blocking public tier component must appear in Storybook through a registry-listed file.

Dedicated `*.stories.tsx` files are preferred for components that should be directly discoverable in the sidebar. Aggregate catalog stories can supplement coverage, but they should not be the only place a component is demonstrated when the component stands on its own.

Cover these states when they apply:

- Default.
- Variants.
- Sizes.
- Disabled.
- Error or invalid.
- Loading.
- Keyboard and focus behavior.
- Light and dark rendering.

## Release checklist

For the full release flow, see [docs/release.md](./docs/release.md). At minimum, run these commands before release:

```sh
bun run check-types
bun run lint
bun run test
bun run build
bun run test:storybook
bun run test:package
bun pm pack --dry-run --ignore-scripts
```

`bun run publish:registry` runs the full local release contract and then publishes to the public package registry. Use it only after the changelog and `package.json` version describe the intended release.

## Token metadata

Token names, categories, and built-in theme values belong in `src/token-metadata.ts`. Run `bun run generate:tokens` after token changes and include the generated CSS and token documentation updates in the same change.

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

Use `@moritzbrantner/frontend-ui` for product patterns that compose the design system with contracts, runtime data, roles, pages, or application behavior. Generic menus can live in `@moritzbrantner/ui` only when they remain state-free and contract-free.

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
- It lives in the correct tier under `src/components/stable`, `src/components/patterns`, `src/components/labs`, or `src/components/legacy`.
- It is listed in `src/component-registry.ts` with the correct public subpath, Storybook files, and test files.
- It is exported from its tier barrel. Only `stable` and `patterns` components are root-exported through `src/index.ts`.

Tier policy:

- `stable`: primitives and low-level controls with strict contract checks.
- `patterns`: state-light composed components for reusable app workflows.
- `labs`: experimental public components; not root-exported.
- `legacy`: deprecated public components; not root-exported and must include `deprecatedSince` plus `migration`.

New component subpaths must be tiered, for example `@moritzbrantner/ui/components/stable/button` or `@moritzbrantner/ui/components/patterns/data-grid`. Do not add compatibility wrappers for the removed flat `@moritzbrantner/ui/components/*` paths.

## Storybook checklist

Every `stable` and `patterns` component must appear in Storybook through a registry-listed file.

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
npm pack --dry-run --ignore-scripts --json
```

`bun run publish:npm` runs the full local release contract and then publishes to the public npm registry. Use it only after the changelog and `package.json` version describe the intended release.

## Token metadata

Token names and categories belong in `src/token-metadata.ts`. CSS is still manually authored in `styles.css`, theme CSS entrypoints, and `theme-scopes.css`; do not introduce CSS generation until the dedicated token source-of-truth pass.

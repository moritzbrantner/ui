# Source Registry

Moritz UI supports a shadcn-compatible source registry alongside the published `@moritzbrantner/ui` package.

Use the package when an application benefits from centralized upgrades and stable public entrypoints. Use the registry when an application should own and adapt the component source. Both paths use the same design tokens, component semantics, accessibility expectations, and state-light ownership boundary.

## Install from GitHub

Because the repository is public and has a root `registry.json`, no registry setup is required:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/button
bunx shadcn@4.18.0 add moritzbrantner/ui/description-list
bunx shadcn@4.18.0 add moritzbrantner/ui/metric-strip
```

## Optional Pages namespace

From an application with a `components.json` file:

```sh
bunx shadcn@4.18.0 registry add @moritz=https://moritzbrantner.github.io/ui/r/{name}.json
```

The equivalent manual configuration is:

```json
{
  "registries": {
    "@moritz": "https://moritzbrantner.github.io/ui/r/{name}.json"
  }
}
```

Install through the configured namespace:

```sh
bunx shadcn@4.18.0 add @moritz/button
bunx shadcn@4.18.0 add @moritz/description-list
bunx shadcn@4.18.0 add @moritz/metric-strip
```

The CLI installs transitive registry items such as `cn` and `moritz-theme`. Same-repository dependencies use full GitHub item addresses as required by shadcn's GitHub registry resolver. The resulting files belong to the consuming application and can be edited there.

## Current pilot catalog

| Item               | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| `cn`               | Conditional class merging and Tailwind conflict resolution.     |
| `moritz-theme`     | Compact control, focus, radius, motion, and interaction tokens. |
| `button`           | Intentional action variants and sizes.                          |
| `input`            | Compact text input with focus and invalid states.               |
| `label`            | Accessible form labeling.                                       |
| `description-list` | Dense semantic facts without card repetition.                   |
| `metric-strip`     | One contextual surface for decision-relevant metrics.           |

## Maintainer workflow

Package source is canonical. Do not hand-edit files under `registry/default/lib` or `registry/default/ui`.

After changing a registry-backed source file:

```sh
bun run sync:registry
bun run verify:registry
```

To add another item:

1. Choose a stable or state-light component with a clear application-independent contract.
2. Add its source-to-registry mapping in `scripts/sync-registry.ts`.
3. Add its item and complete dependency graph in `registry/default/registry.json`.
4. Prefer `@ui/`, `@lib/`, and `@hooks/` targets so consuming aliases remain configurable.
5. Run the sync and verification commands.
6. Test installation into a disposable consumer with the built item JSON.

Build the static registry locally with:

```sh
bun run build:registry
```

The default output is `public/r`. The Pages build writes the same catalog to `storybook-static/r`, next to Storybook.

## Design boundary

The registry is a distribution mechanism, not a second design system. Do not add arbitrary `rounded`, `shadow`, `color`, or spacing props to make copied components more configurable. Consumers can edit owned source when they need a product-specific exception; shared defaults should remain semantic and restrained.

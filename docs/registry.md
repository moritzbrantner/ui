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
bunx shadcn@4.18.0 add @moritz/scholia-source-workbench
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
| `tabs`             | Accessible tabs used by source-owned motion patterns.           |

## Pop and Pulse motion slice

Pop and Pulse retain their generated CSS motion tokens as the lightweight baseline. The optional
`theme-motion` item installs Motion-enhanced Button, Tabs, and state-controlled Toast patterns for
interfaces that need interruptible springs, shared layout movement, and presence transitions.

| Item           | Type      | Purpose                                                              |
| -------------- | --------- | -------------------------------------------------------------------- |
| `pop-theme`    | Theme     | Pop foundation, light/dark tokens, and expressive CSS motion values. |
| `pulse-theme`  | Theme     | Pulse foundation, light/dark tokens, and kinetic CSS motion values.  |
| `tabs`         | Component | Source-owned accessible tab primitive.                               |
| `theme-motion` | Component | Pop/Pulse provider, Button, Tabs, and accessible Toast patterns.     |
| `pop-rewards`  | Component | Earned reward feedback with three event-driven intensity levels.     |

Install one style and the shared Motion source:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/pop-theme
bunx shadcn@4.18.0 add moritzbrantner/ui/theme-motion
```

Install the complete Pop reward slice—including the Pop theme and shared Motion source—with:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/pop-rewards
```

The item provides `CelebrationProvider`, `RewardBurst`, `SuccessPop`, `AnimatedCounter`,
`ProgressPop`, and `AddToCollection`. Consuming applications own achievement rules, persistence,
timers, sounds, haptics, and notification queues. The components accept explicit state and reward
keys so feedback remains interruptible, testable, and tied to real user accomplishments.

Replace `pop-theme` with `pulse-theme` for kinetic interfaces. The `theme-motion` item declares
`motion` as an npm dependency and installs its Button and Tabs registry dependencies. The typed
`popThemeManifest` and `pulseThemeManifest` expose the same relationship to templates and tooling.
Reduced-motion handling defaults to the user's device preference, and continuous animation remains
reserved for meaningful live or loading state.

## Scholia themed slice

Scholia is the first registry slice that connects a complete theme, theme-defining components, and
an installable composition through a typed manifest.

| Item                       | Type      | Purpose                                                                |
| -------------------------- | --------- | ---------------------------------------------------------------------- |
| `scholia-theme`            | Theme     | Complete Tailwind foundation and Scholia light/dark token contract.    |
| `source-passage`           | Component | Parallel source and translation with locator and highlight slots.      |
| `apparatus-list`           | Component | Critical-apparatus witnesses, readings, locators, and editorial notes. |
| `scholarly-note`           | Component | Annotation, commentary, translation, and textual-variant notes.        |
| `scholia-source-workbench` | Block     | Source, translation, apparatus, metadata, and notes in one workbench.  |

Install the full source-owned composition:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/scholia-source-workbench
```

The block installs its transitive theme and component items. Import the installed
`styles/scholia.css` once in the consuming application. Source loading, edition selection,
interpretation state, routing, persistence, and actions remain app-owned.

The server-safe `scholiaThemeManifest` records the same installation contract for tooling and
templates.

## Maintainer workflow

Package source is canonical. Do not hand-edit files under `registry/default/lib`,
`registry/default/styles`, or `registry/default/ui`.

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

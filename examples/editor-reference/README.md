# Canonical editor reference

[EditorReference.tsx](./EditorReference.tsx) is the single executable reference. It imports supported public package entrypoints and is rendered by the **Components / Editors / Editor Workbench / Reference** Storybook story. Use the Studio theme. The example shows outliner selection, viewport feedback, exact XYZ/rotation editing, direct rotation manipulation, precise time entry, command discovery, and native resizable/tabbed docks.

The example owns its small object fixtures, selection, values, commands, and layout. These remain outside the package implementation. Panel placement and native percentage layout maps are separate from object data; consuming apps may serialize them and choose their persistence mechanism. The reference retains native layout state across responsive presentation changes. Restore panel layout is a presentation operation and does not reset edited objects or time.

The outliner uses the public Labs `TreeView` entrypoint. UI maintainers own its upgrades in this maintained example; a consuming app adopting it must explicitly own Labs upgrades or select a component tier matching its compatibility needs.

## Run the reference

Use the repository-pinned Bun 1.3.12 and its frozen lockfile. Browser setup uses the repository's matching Playwright Chromium installation:

```sh
bun install --frozen-lockfile
bunx playwright install chromium
bun run test:storybook src/components/patterns/editor-workbench.stories.tsx
bun run test:visual visual/editor-reference.spec.ts
```

The existing browser harness starts Storybook. It checks exact edits, pointer/exact value convergence, command/shortcut discovery, selection and empty states, panel movement/restoration, and representative light/dark mobile/tablet/desktop widths. The mobile usability audit discovers the registered story automatically. `bun run verify:release` is the distinct completion gate.

Storybook and the producer's TypeScript configuration resolve public self-imports to source for development. Those checks do not establish distributed-package adoption. The packed consumer verification is a separate boundary; root coding-tooling #273 tracks the clean, executable consumer/setup pilot. Do not substitute a source alias for that evidence.

## Interaction and ownership

Numeric display precision formats the field without rounding fixture values. The time scrubber uses continuous native range values so its DOM value preserves the precise accepted time. The rotation dial declares a 0.001-degree increment; dial and exact entry update one accepted rotation. The preview is a small fixture visualization, not a geometry, scene, or timeline implementation.

Commands execute only within the focused workbench. Mod+K opens command discovery; visible buttons expose commands and shortcut help on touch. Bare command keys do not replace text editing. Consuming apps own their command semantics and validation.

The older PR #45 supplies the sound workbench/command composition. Its separate inspector wrapper is superseded by the existing public `InspectorPanel` and property controls introduced by #57. No second editor shell or inspector implementation is required.

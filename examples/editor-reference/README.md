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

Storybook and the producer's TypeScript configuration resolve public self-imports to source for development. Those checks do not establish distributed-package adoption. The separate packed consumer verifier imports `@moritzbrantner/ui/examples/editor-reference` from the actual archive into a disposable Vite app. It compiles without producer aliases, builds, and exercises exact numeric entry and keyboard commands in the existing Playwright harness. Run `bun run verify:consumer:editor`; it is included in the hosted browser and release gates. The example has compiled JavaScript and declaration exports; its canonical source imports the supported component entrypoints. Consumers load the actual distributed JavaScript without producer aliases.

## Interaction and ownership

Numeric display precision formats the field without rounding fixture values. The time scrubber uses continuous native range values so its DOM value preserves the precise accepted time. The rotation dial declares a 0.001-degree increment; dial and exact entry update one accepted rotation. The preview is a small fixture visualization, not a geometry, scene, or timeline implementation.

Commands execute only within the focused workbench. Mod+K opens command discovery; visible buttons expose commands and shortcut help on touch. Bare command keys do not replace text editing. Consuming apps own their command semantics and validation.

The older PR #45 supplies the sound workbench/command composition. Its separate inspector wrapper is superseded by the existing public `InspectorPanel` and property controls introduced by #57. No second editor shell or inspector implementation is required.

## Standalone scaffold

The existing `editor-consumer` generator creates Vite/React app files in a prepared consumer that imports this published example. The source-owned [consumer-package.json](./consumer-package.json) declares its archive dependency; its TypeScript configuration contains no producer aliases or parent config. Bun 1.3.12 and an installed `coding-tooling` CLI are explicit setup prerequisites. `coding-tooling` is a source-development tool; the generated app does not require it or a sibling checkout to compile or run.

From this repository, choose an empty disposable target and supply an archive after building the package:

```sh
bun run build
mkdir -p .cache/editor-consumer
bun pm pack --ignore-scripts --filename .cache/editor-consumer/ui.tgz
cp examples/editor-reference/consumer-package.json .cache/editor-consumer/package.json
(cd .cache/editor-consumer && bun install && bun install --frozen-lockfile)
coding-tooling generate plan editor-consumer --target .cache/editor-consumer --json
coding-tooling generate editor-consumer --target .cache/editor-consumer --json
cd .cache/editor-consumer
bun run check-types
bun run build
bun run dev
```

Archive creation and dependency installation are explicit setup/acquisition steps. Use a fresh target; do not overwrite a pre-existing archive or manifest. The generator checks the UI package version at the selected consumer target after explicit installation and creates the app files atomically; identical output is a no-op, and conflicting source content prevents any scaffold write. Empty generator postconditions do not claim app behavior: the separate native compile/build/browser commands establish that evidence. Preserve the generated lockfile for subsequent frozen installs.

UI maintainers own the fixture, dependency pins and Labs outliner upgrades. Products own any documents or commands they replace it with. A package/API change must pass the example's own compile and behavior checks; this reference does not claim arbitrary consumer compatibility.

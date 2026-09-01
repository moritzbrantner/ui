# Local generators

Repository-local generators live under `.coding-tooling/generators/` and encode repeated `ui` repository mechanics without turning repository-specific structure into shared convention policy.

## `ui-component`

`ui-component` creates the initial scaffold for a public component:

```sh
coding-tooling generate ui-component \
  --input name=StatusBadge \
  --input tier=stable \
  --input storyCategory="Data Display" \
  --input client=false
```

The generator accepts only the existing public tiers: `stable`, `patterns`, `data`, `shell`, `social`, `collaboration`, `media`, and `labs`. `internal` is intentionally excluded. Story categories are likewise restricted to the categories configured in Storybook.

Generation creates the component source and a Storybook story, then adds the exact public re-export to the tier barrel. Stories are tagged `autodocs` and `test`, so they participate in the repository's Storybook smoke/a11y test project.

The `client` boolean is required. `true` selects the committed client template with `"use client";`; `false` selects the server-compatible template. This is committed-template selection, not a conditional template language.

The source scaffold deliberately leaves `TODO(GEN-GAP:semantic-root)`. The generated `<div>` is only a mechanically valid placeholder. The implementing agent must choose the correct semantic HTML element or UI primitive before treating the component as complete.

Generator postconditions run formatting and type checking. Full `lint` is intentionally not a generation postcondition: the repository's design-system verification requires a `componentRegistry` entry for every public component, and registry status, rationale, and meaningful test coverage are semantic maintenance decisions that the generator must not invent. After resolving the component's semantics, add the appropriate `componentRegistry` metadata, update generated documentation with `bun run generate:components`, and run the normal repository validation.

Shadcn source-registry promotion is a separate lifecycle decision and is not performed by this generator.

## `ui-component-test`

`ui-component-test` stages a separate behavioral test only after an implementing agent has decided that an existing public component has meaningful user-observable behavior worth testing:

```sh
coding-tooling generate ui-component-test \
  --input name=StatusBadge \
  --input tier=stable
```

The generator accepts the same closed public tier set as `ui-component`. Before writing anything, an exact `file` prerequisite requires `src/components/<tier>/<name>.tsx` to exist. A missing source therefore fails structurally without creating an orphan test.

The generated `.test.tsx` intentionally contains a Vitest `test.todo` with `TODO(GEN-GAP:test-behavior)`. It does not invent an assertion, interaction, snapshot, or product behavior merely to make a test file exist. The implementing agent should replace that gap with meaningful React Testing Library/user-observable tests when the component contract warrants them.

Storybook remains the baseline render/a11y smoke surface. This generator is for additional behavioral/unit evidence, not a requirement that every component receive a dedicated `.test.tsx`.

Generation is idempotent when the exact scaffold already exists and conflicts rather than overwriting different existing test content. Its focused postconditions run formatting, type checking, and the unit-test suite.

## Production dogfood: `VisuallyHidden`

The first real component created through both local generators is `VisuallyHidden` in the stable tier. `ui-component` created the source, tested Storybook surface, and stable barrel export. `ui-component-test` then created a separate behavioral test scaffold after its exact source-file prerequisite passed.

The generated semantic gaps behaved as intended: the implementing agent replaced the placeholder `div` with a `span`, added the stable `sr-only` contract, and replaced the pending test with assertions for semantic element choice, class merging, DOM-prop forwarding, and the `data-slot` contract. The Storybook scaffold was also refined into an accessible button-label example rather than leaving an empty-looking hidden-only canvas.

Two boundaries were confirmed rather than automated away. `componentRegistry` metadata remains semantic because tier status, rationale, and evidence are maintenance decisions; it was added after the component contract was resolved. Shadcn source-registry promotion remains a separate lifecycle decision and was not performed.

The first barrel insertion also exposed that the initial `typescript-barrel-export` implementation reordered pre-existing exports while adding one new line. That was broader than the intended mutation boundary. `coding-tooling` issue #45 fixed the operation to preserve all existing export order and insert only the requested export, and this dogfood change restores the pre-existing `stable.ts` order.

One performance friction remains: the `ui-component-test` `test:unit` postcondition currently executes the repository-wide unit suite because postconditions cannot yet target only the generated test file. That is acceptable for this first adoption but is a candidate for a later, separately justified focused-check capability rather than a reason to add arbitrary command execution to generators.

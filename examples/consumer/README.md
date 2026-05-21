# `@moritzbrantner/ui` consumer example

This is a minimal external-app shape for checking the package API after `@moritzbrantner/ui` has been built.

```sh
cd packages/ui
bun run build
cd examples/consumer
bun install
bun run build
```

The example includes a root-import compatibility fixture and a bundle-sensitive subpath fixture. `bun run verify:consumer` builds both and enforces JS bundle budgets for the subpath fixture.

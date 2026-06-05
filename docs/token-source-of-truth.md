# Token Source Of Truth

`src/token-metadata.ts` is the source for token names, categories, descriptions, and built-in theme token values.

Run `bun run generate:tokens` after changing token metadata. The generator updates:

- `styles.css`
- theme CSS files under `zleek/`, `bobba/`, `atlas/`, `studio/`, and `paper/`
- `theme-scopes.css`
- `docs/tokens.md`

`bun run verify:tokens` checks that generated token artifacts are current and then verifies token coverage across published stylesheets.

The base component normalization layers in the stylesheets remain authored CSS; token declarations and token documentation are generated from metadata.

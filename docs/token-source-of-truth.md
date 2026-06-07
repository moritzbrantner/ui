# Token Source Of Truth

`src/token-names.ts` is the lightweight runtime source for token names. `src/token-metadata.ts` is the source for token categories, descriptions, and built-in theme token values.

Run `bun run generate:tokens` after changing token metadata. The generator updates:

- `styles.css`
- `base.css`
- theme CSS files under `zleek/`, `bobba/`, `atlas/`, `studio/`, `paper/`, and `pop/`
- `theme-scopes.css`
- `docs/tokens.md`

`bun run verify:tokens` checks that generated token artifacts are current and then verifies token coverage across published stylesheets.

The base component normalization layers in the stylesheets remain authored CSS; token declarations and token documentation are generated from metadata. `base.css` is the generated shared layer imported by `styles.css`, `theme-scopes.css`, and every one-theme stylesheet, but it does not provide concrete theme token values by itself. Apps should import exactly one concrete stylesheet such as `@moritzbrantner/ui/styles.css`, `@moritzbrantner/ui/atlas/styles.css`, or `@moritzbrantner/ui/pop/styles.css`.

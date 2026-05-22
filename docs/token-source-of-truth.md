# Token Source Of Truth

`src/token-metadata.ts` is the current source for token names, categories, and token-related TypeScript types.

This pass centralizes token metadata only. CSS remains manually authored in `styles.css`, theme CSS files, and `theme-scopes.css`.

A future pass should generate these outputs from a canonical token source:

- `styles.css`
- theme CSS files under `zleek/`, `bobba/`, `atlas/`, `studio/`, and `paper/`
- `theme-scopes.css`
- token documentation

CSS and documentation generation are explicitly out of scope for `0.8.0`.

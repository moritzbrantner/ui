# Agent Instructions

## Purpose and ownership

`@moritzbrantner/ui` is a publishable Bun/TypeScript React design-system package. It owns shared Tailwind 4 tokens and themes, state-light components, public package contracts, Storybook coverage, and source-owned registry distribution.

Keep routing, auth and permissions, server state, persistence, product workflows, product copy, and side effects in consuming applications.

## Source contract

- `src/` is canonical package source. Respect the stable, patterns, data, shell, social, media, and labs public tiers and their existing export boundaries.
- Public components accept `className`, forward applicable DOM props, expose stable `data-slot` hooks, use semantic tokens, and express deliberate visual choices through named variants.
- Keep focused component tests and stories beside the component at the narrowest useful scope.
- Token names, categories, and built-in values live in `src/token-metadata.ts`. Run `bun run generate:tokens` after token changes.
- Registry distribution is opt-in. Change mapped package source and `scripts/sync-registry.ts`, then run `bun run sync:registry`; never edit generated registry source directly.
- Update benchmark baselines with `bun run bench:update` only when intentionally accepting a measured change.

## Generated and protected paths

Do not hand-edit:

- `dist/`, `coverage/`, `storybook-static/`, `playwright-report/`, `test-results/`, `public/r/`, `.cache/`, or package archives;
- `registry/default/lib/`, `registry/default/styles/`, or `registry/default/ui/`;
- `bun.lock` or `examples/consumer/bun.lock` outside Bun dependency operations.

## Validation

- Install: `bun install --frozen-lockfile`
- Focused unit tests: `bun run test`
- Types: `bun run check-types`
- Static package and generated-contract checks: `bun run lint`
- Formatting check: `bun run format:check`
- Build: `bun run build`
- Full confidence contract: `bun run verify`

Validate progressively: run the narrowest affected test first, then types, lint, build, and broader browser or release checks when their surfaces are affected. `bun run verify:release` is expensive and includes Storybook, coverage, Playwright visual/mobile checks, Unlighthouse, consumer verification, build-size checks, benchmarks, and package dry-run validation.

Visual tests require Chromium and start Storybook on port 6007. Install the browser once with `bunx playwright install chromium`.

## Release boundary

Implementation and publication are separate. Before a release or tag, run `bun run verify:release`, inspect `bun run pack:dry`, and ensure the version and changelog describe the intended release. Use `bun run publish:registry` only for an explicitly authorized registry release.

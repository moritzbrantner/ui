# Release Runbook

`@moritzbrantner/ui` is not published to npm for now; versions already on npm stay there. Consumers
install a commit-pinned git dependency (`git+https://github.com/moritzbrantner/ui.git#<sha>`, listed
in `trustedDependencies`), and `prepare` (`scripts/prepare-git-install.ts`) builds `dist/` during
that install. `bun run verify:git-install` checks that path for the current pushed commit.

## Prepare

1. Bump `package.json` to the next semver version. The design-system verifier reads this version and checks the top `CHANGELOG.md` release heading.

2. Add a matching top entry in `CHANGELOG.md` that calls out public component/API changes, verification changes, and migration notes. If the top version has not been merged to `main` yet, update that prepared top entry instead of adding another version heading.

3. Check `src/component-registry.ts` for any public API moves and make sure new focused tiers have story and test coverage.

## Verify

Install the Playwright browser once before local visual or Unlighthouse checks:

```sh
bunx playwright install chromium
```

Run the full release contract:

```sh
bun run verify:release
```

`verify:release` stops at the first failing command. Fix that failure first, then rerun the
full contract so the later checks still get a clean pass.

For Storybook interaction failures, keep assertions aligned with browser timing:

- Assert portal-mounted overlay content with `screen`, not `canvas`.
- Use a story-local zero delay or `waitFor` for delayed hover/focus content.
- Avoid immediate `getBy*` or `getAllBy*` assertions after async interactions unless the UI is synchronous.

For the common tooltip-style failure loop, use:

```sh
bun run test:storybook
bun run verify:release
bun run bench
```

When bisecting release failures locally, run the checks in this order:

```sh
bun run check:hygiene
bun run check-types
bun run lint
bun run test
bun run build
bun run test:package
bun run build-storybook
bun run test:storybook
bun run test:coverage
bun run test:visual
bun run test:mobile-usability
bun run test:unlighthouse
bun run verify:consumer
bun run verify:build-size
bun run bench
bun run pack:dry
```

Run `bun run bench` by itself, not alongside Storybook, Playwright, Unlighthouse, or other browser-heavy checks.
Benchmarks read the built `dist` entrypoints, so run `bun run build` first when invoking
`bun run bench` outside the full release contract.

For persisted local evidence from the fast checks, run:

```sh
bun run verify:results
```

This writes unit test and benchmark summaries under `benchmark-results/`. CI uploads
`benchmark-results` from the performance validation job. Benchmark baselines and run
artifacts have different jobs: `bench/baselines/*.json` are acceptance thresholds,
`benchmark-results/*.json` and `benchmark-results/*.md` are run evidence, and
`bun run bench:update` should only be used when intentionally accepting new performance
baselines.

Visual and mobile usability checks start their own Storybook server on port `6007`.
Stop any existing local Storybook process on that port before running the release contract.

Inspect the package contents:

```sh
bun run pack:dry
```

## Release

There is no publish step. After `bun run verify:release` and `bun run pack:dry` pass, merge the
version bump to `main`; that commit is the release consumers pin. CI uses
`bun run verify:release:ci`, which measures coverage with a real Node runtime instead of the local
Bun coverage fallback.

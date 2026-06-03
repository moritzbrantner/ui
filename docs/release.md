# Release Runbook

This package publishes directly to the public package registry as `@moritzbrantner/ui`.

## Prepare

1. Confirm the registry version that is already published:

   ```sh
   bun pm view @moritzbrantner/ui version dist-tags
   ```

2. Bump `package.json` to the next semver version and update `expectedPackageVersion` in `scripts/verify-design-system.ts`.

3. Add a matching top entry in `CHANGELOG.md` that calls out public component/API changes, verification changes, and migration notes. If a prepared local version has not been published yet, update that prepared top entry instead of preserving an unpublished version heading.

4. Check `src/component-registry.ts` for any public API moves and make sure new focused tiers have story and test coverage.

## Verify

Install the Playwright browser once before local visual or Unlighthouse checks:

```sh
bunx playwright install chromium
```

Run the full release contract:

```sh
bun run verify:release
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

Inspect the package contents:

```sh
bun run pack:dry
```

## Publish

After `bun run verify:release` and `bun run pack:dry` pass, authenticate for the registry and publish:

```sh
bun run publish:registry
```

The GitHub publish workflow can also publish on a `v*` tag or manual dispatch when `NPM_TOKEN` is configured. CI uses `bun run verify:release:ci`, which measures coverage with a real Node runtime instead of the local Bun coverage fallback.

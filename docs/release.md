# Release Runbook

This package publishes directly to the public npm registry as `@moritzbrantner/ui`.

## Prepare

1. Confirm the npm version that is already published:

   ```sh
   npm view @moritzbrantner/ui version dist-tags --json
   ```

2. Bump `package.json` to the next semver version and update `expectedPackageVersion` in `scripts/verify-design-system.ts`.

3. Add a matching top entry in `CHANGELOG.md` that calls out public component/API changes, verification changes, and migration notes.

4. Keep `DataTable` legacy metadata at its original `deprecatedSince` version unless the deprecation itself changes.

## Verify

Install the Playwright browser once before local visual or Unlighthouse checks:

```sh
bunx playwright install chromium
```

Run the full release contract:

```sh
bun run verify:release
```

Inspect the package contents:

```sh
bun run pack:dry
```

## Publish

After `bun run verify:release` and `bun run pack:dry` pass, authenticate with npm and publish:

```sh
bun run publish:npm
```

The GitHub publish workflow can also publish on a `v*` tag or manual dispatch when `NPM_TOKEN` is configured. CI uses `npm run verify:release:ci`, which measures coverage with a real Node runtime instead of the local Bun coverage fallback.

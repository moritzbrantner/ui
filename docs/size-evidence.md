# Package size evidence

`bun run size:budget` builds the production ESM package, runs the existing public-entry, chunk, lean-theme and 880 KiB total-JS limits, and compares its selected JavaScript files with `.performance/baselines/ui-js.json`. The performance CI job uses its existing build once and runs `bun run verify:size` plus `bun run test:size-evidence`. Release verification runs the same verification after its build.

The declaration in `.performance/size.json` selects all `.js` files below `dist/`, requires `dist/index.js`, names the ES2022 target and production/minified mode, and fingerprints Bun, the installed tsup/esbuild versions, the lockfile, both TypeScript configurations, build configuration, manifest and tool-version probe. No inferred file selection or new byte limit is introduced. The existing absolute limits remain blocking; the baseline's signed delta is reported separately without a new growth threshold.

The collector is the public `coding-tooling/size-evidence` API, consumed as a development dependency at the exact implementation Git revision. No registry publication or hidden sibling checkout is needed. Collection hashes the actual files. This evidence concerns raw distribution bytes; it does not measure compressed transfers, CPU, memory or latency.

Verification never updates the committed baseline. Missing tools, output or baseline return unavailable; incompatible target/profile/features, toolchains or build inputs return incomparable and a nonzero exit status. `benchmark-results/size-evidence.json` retains the complete measurement and comparison for CI inspection.

To intentionally accept a new baseline, run `bun run size:baseline:update` and review the diff. This explicit command builds, runs the existing limits, and writes the versioned measurement only if collection passes. Repeating it for identical observations preserves the baseline bytes and modification time. Budget failures cannot refresh a baseline. Do not accept a new baseline merely to hide an unexplained change.

`bun run test:size-evidence` exercises the real producer command against a disposable copy of its built package. It verifies a zero-delta comparison, no-op repeat update, missing baseline, changed build identity and JSX configuration, temporary-file symlink rejection, oversize rejection, preservation after a rejected update and unavailable installed tool support. Run it after building and creating the reviewed baseline. These are package-tooling acceptance cases; browser behavior remains covered by the existing browser suites.

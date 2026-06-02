# Mobile Usability Audit

`bun run test:mobile-usability` runs a release-blocking Playwright audit against public
non-labs Storybook stories at `360x568`.

The audit discovers stories from `src/component-registry.ts`, includes `stable`, `patterns`,
`data`, `shell`, `social`, and `media`, and skips deprecated or `labs` entries. It opens each
included story at:

```text
/iframe.html?id=<story-id>&globals=designSystem:bobba;theme:light
```

## Findings

Failures are written to:

- `test-results/mobile-usability/report.json`
- `test-results/mobile-usability/report.md`

Each finding includes the component, tier, story ID, category, message, selector when available,
bounding box when available, and a screenshot path when Playwright captured one.

Categories map to the decision that usually fixes the issue:

- `render`: fix the story/component render path, failed import, or browser error.
- `document-overflow`: fix the mobile layout so the document does not scroll horizontally.
- `internal-scroll`: add or repair a component-owned scroll container for wide data surfaces.
- `target-size`: enlarge the interactive target to at least `40px`, or `36px` high for text inputs.
- `target-actionability`: remove obstruction, disabled state, or offscreen positioning.
- `text-clipping`: let labels wrap, shorten labels, or use an icon-only control with a name.
- `overlay`: constrain menus, sheets, popovers, and navbar menus inside the viewport.
- `keyboard-focus`: keep tab focus visible and inside the viewport.

## Resolution Choices

Use one of these decisions for every finding:

- Fix mobile layout when the component should be naturally usable at `360x568`.
- Add a mobile variant when the desktop presentation is valid but needs a separate compact story.
- Use an internal scroll container for dense tables, graphs, calendars, and comparison surfaces.
- Mark desktop/web-only with a reason only when mobile use is not a supported behavior.
- Replace with an alternative component when the component cannot meet the target affordance.

## Desktop Or Web-Only Stories

Stories may be skipped only when the story name/title/id clearly says `desktop` or `web`, or when
the story has an explicit parameter:

```ts
parameters: {
  mobileUsability: {
    skip: true,
    reason: "Desktop-only editing surface that requires a wide pointer-driven canvas."
  }
}
```

Run `bun run verify:mobile-usability-skips` to check skip reasons. The verifier fails when a skip
has no reason, a reason shorter than 20 characters, or no desktop/web-only intent.

## Allowances

Allowances live in `visual/mobile-usability-config.ts`.

Use `internalScrollStories` for complex components that own horizontal scrolling inside a visible
container. The document must still avoid horizontal overflow.

Use `denseControlStories` only for stories intentionally showing many compact controls for coverage.
Every allowance must include a reason.

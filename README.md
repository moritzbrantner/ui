# @moritzbrantner/ui

Shared Tailwind 4 React UI primitives, layout components, and global theme styles for the platform packages workspace.

## Design System Role

`@moritzbrantner/ui` is the low-level design-system package. It owns shared tokens, primitives, composed components, theme metadata, Storybook coverage, and package-consumption guarantees.

Keep product workflows in higher-level app packages. Complete frontend surfaces, pages, navigation composition, roles, auth/session state, admin/account/settings/profile workflows, and other app-specific behavior should compose `@moritzbrantner/ui` instead of living in it.

Generic visual affordances such as `AccountMenu` and `NotificationMenu` live in this package only when they stay state-free and contract-free. Apps own the menu content, routing, auth/session state, notification state, and backend behavior.

## Install

```sh
bun add @moritzbrantner/ui
```

The package is published to the public package registry for the `@moritzbrantner` scope, so consumers can install it with their normal Bun registry configuration.

## Development Workflow

This repository uses Bun as the package manager and task runner. CI currently installs Bun `1.3.12` and Node `24`.

Set up the package from a clean checkout:

```sh
bun install --frozen-lockfile
```

For daily component work, run Storybook:

```sh
bun run dev
```

Fast local tests:

```sh
bun run test
```

Format and static checks:

```sh
bun run format:check
bun run lint
```

Production build:

```sh
bun run build
```

Full local confidence check:

```sh
bun run verify
```

`bun run verify` reports repository hygiene first, then runs the release verification contract. The heavy checks include Storybook tests, coverage, Playwright visual tests, Unlighthouse performance and usability audits, the consumer example build, benchmarks, build-size checks, and a Bun package dry run. Install the local Playwright browser before running visual or Unlighthouse tests for the first time:

```sh
bunx playwright install chromium
```

Run the Storybook-based Unlighthouse audit by itself with:

```sh
bun run test:unlighthouse
```

The audit builds Storybook, serves the static output locally, checks representative component stories, and writes the generated report to `unlighthouse-report/`.

`bun run test:coverage` runs the local coverage helper. When Bun's `node` shim cannot expose V8 coverage APIs, it falls back to the unit suite and reports that coverage was not measured; CI runs the same release contract with the configured runtime.

Run `bun run bench` by itself, not in parallel with Storybook, Playwright, or other browser-heavy checks. The benchmark verifier retries failed samples once to filter transient host load, but repeat failures should be treated as release signals.

## Styles

Import exactly one concrete UI stylesheet for the app. Theme stylesheets provide Tailwind setup, animation helpers, component normalization, and theme tokens. They no longer opt Tailwind into scanning this package's component source strings by default.

```ts
import "@moritzbrantner/ui/styles.css";
```

Use Zleek globally when the app should use the glass-styled theme:

```ts
import "@moritzbrantner/ui/zleek/styles.css";
```

The Bobba subpath is an alias for the default stylesheet:

```ts
import "@moritzbrantner/ui/bobba/styles.css";
```

Additional visual systems are available for specific product surfaces:

```ts
import "@moritzbrantner/ui/atlas/styles.css";
import "@moritzbrantner/ui/studio/styles.css";
import "@moritzbrantner/ui/paper/styles.css";
import "@moritzbrantner/ui/scholia/styles.css";
import "@moritzbrantner/ui/pop/styles.css";
import "@moritzbrantner/ui/pulse/styles.css";
```

Use `bobba` for default platform apps, `zleek` for polished glass shells, `atlas` for dense dashboards and analytics, `studio` for creative production and editing surfaces, `paper` for document or research-heavy interfaces, `scholia` for scholarly archives and reference workbenches, `pop` for Studio-adjacent public creator surfaces with brighter color and delight-burst feedback, and `pulse` for kinetic interaction choreography across open, close, expand, collapse, and selection flows.

When an app renders components from `@moritzbrantner/ui`, also import the explicit component source opt-in:

```ts
import "@moritzbrantner/ui/atlas/styles.css";
import "@moritzbrantner/ui/component-sources.css";
```

Theme-only consumers can omit `component-sources.css`:

```ts
import "@moritzbrantner/ui/atlas/styles.css";
import { AtlasTheme, uiTheme } from "@moritzbrantner/ui/atlas";
```

Use `@moritzbrantner/ui/theme-scopes.css` only when multiple built-in themes must intentionally coexist in one document. Pair it with `component-sources.css` only if the app also renders package components.

`base.css` is the generated shared layer for Tailwind, animation helpers, compatibility variants, and component normalization. It is exported for tooling and advanced composition, but it generally should not be the only stylesheet an app imports because it does not provide concrete theme token values or package component source scanning. Apps should import exactly one concrete stylesheet such as `@moritzbrantner/ui/styles.css`, `@moritzbrantner/ui/atlas/styles.css`, or `@moritzbrantner/ui/pulse/styles.css`.

Token metadata and built-in theme token values live in `src/token-metadata.ts`. Run `bun run generate:tokens` after token changes to update generated CSS and [token docs](./docs/tokens.md).

## Components

Components are organized into support tiers:

- `stable`: primitives and low-level controls with the strongest API expectations.
- `patterns`: state-light composed components for common app layouts and workflows.
- `data`: data grids, resource lists, filters, search fields, and selection toolbars.
- `shell`: app chrome, page shell, navigation, account, and notification surfaces.
- `social`: state-light social, chat, feed, action, and profile summary components.
- `media`: image cropper and filter editing surfaces.
- `labs`: experimental components that are public only through explicit labs paths and can change faster.

See the generated [component catalog](./docs/components.md) for every public component, support tier, import path, and story/test coverage record.

Root imports expose only `stable` and `patterns` components, plus `cn` and theme client APIs:

```tsx
import { Button, Card, CardContent } from "@moritzbrantner/ui";

export function Example() {
  return (
    <Card>
      <CardContent>
        <Button>Refresh</Button>
      </CardContent>
    </Card>
  );
}
```

Component subpaths are preferred for bundle-sensitive comprehensive apps:

```tsx
import { Button } from "@moritzbrantner/ui/components/stable/button";
import { DataGrid } from "@moritzbrantner/ui/components/data/data-grid";
import { Chat } from "@moritzbrantner/ui/components/social/chat";
import { cn } from "@moritzbrantner/ui/server";
```

Focused component tiers are not root-exported. Import them deliberately:

```tsx
import { PageShell } from "@moritzbrantner/ui/components/shell/app-layout";
import { ImageCropper } from "@moritzbrantner/ui/components/media/image-cropper";
import { Timeline } from "@moritzbrantner/ui/components/labs/timeline";
```

Data, shell, social, and media components are exposed through `@moritzbrantner/ui/<tier>` and `@moritzbrantner/ui/components/<tier>/*`; they are not root-exported.

### Source-owned installation

The package also publishes a shadcn-compatible source registry for apps that should own and adapt component implementations:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/button
```

This is a distribution choice, not a separate visual system. Registry items preserve the same semantic tokens, restrained surfaces, state-light ownership boundary, and component contracts as the npm package. The initial catalog includes foundational controls plus `DescriptionList` and `MetricStrip`, which encode the preferred alternatives to repeated information cards.

Scholia is the first complete themed slice. Install its source-first workbench and transitive theme
and component dependencies with:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/scholia-source-workbench
```

Install the complete theme or individual scholarly components independently when a consuming app
needs a smaller source-owned surface:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/scholia-theme
bunx shadcn@4.18.0 add moritzbrantner/ui/source-passage
bunx shadcn@4.18.0 add moritzbrantner/ui/apparatus-list
bunx shadcn@4.18.0 add moritzbrantner/ui/scholarly-note
```

`scholiaThemeManifest` provides the matching typed contract for theme intent, defining tokens,
registry components, and blocks. Import it from `@moritzbrantner/ui/scholia/server`,
`@moritzbrantner/ui/server`, or the shared theme metadata entrypoints.

See [the source registry guide](./docs/registry.md) for the catalog, maintainer workflow, and migration policy.

### Pop and Pulse motion

The stable primitives keep their lightweight CSS interaction states. Apps that want richer,
interruptible UI movement can opt into the explicit Motion patterns for `pop` or `pulse`:

```tsx
import "@moritzbrantner/ui/pop/styles.css";
import {
  MotionButton,
  MotionTabs,
  MotionTabsContent,
  MotionTabsList,
  MotionTabsTrigger,
  MotionToast,
  UiMotionProvider,
} from "@moritzbrantner/ui/components/patterns/theme-motion";

export function MotionExample() {
  return (
    <UiMotionProvider profile="pop">
      <MotionButton>Start creating</MotionButton>
      <MotionTabs defaultValue="draft">
        <MotionTabsList>
          <MotionTabsTrigger value="draft">Draft</MotionTabsTrigger>
          <MotionTabsTrigger value="share">Share</MotionTabsTrigger>
        </MotionTabsList>
        <MotionTabsContent value="draft">Draft content</MotionTabsContent>
        <MotionTabsContent value="share">Share content</MotionTabsContent>
      </MotionTabs>
      <MotionToast open title="Creator kit ready" />
    </UiMotionProvider>
  );
}
```

`UiMotionProvider` defaults to `reducedMotion="user"`. Pop uses playful lift and spring feedback;
Pulse uses faster spatial movement for selection-heavy interfaces. Product page transitions,
route choreography, fetching, persistence, and notification queues remain app-owned.

Source-own the same primitives and install Motion transitively through the registry:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/pop-theme
bunx shadcn@4.18.0 add moritzbrantner/ui/theme-motion
```

Use `pulse-theme` instead when the consuming surface needs the Pulse motion personality.
`popThemeManifest` and `pulseThemeManifest` connect each stylesheet, Motion profile, and registry
item for tooling and templates.

#### Earned Pop rewards

Pop also provides an event-driven reward layer for interactions that deserve more than routine
press feedback. The application owns the achievement, lifetime, and reward key; the UI package
only renders deterministic feedback:

```tsx
import {
  AnimatedCounter,
  CelebrationProvider,
  ProgressPop,
  RewardBurst,
  SuccessPop,
} from "@moritzbrantner/ui/components/patterns/pop-rewards";

export function ProjectReward({
  completed,
  rewardKey,
  taskCount,
}: {
  completed: boolean;
  rewardKey: number | null;
  taskCount: number;
}) {
  return (
    <CelebrationProvider level="satisfying">
      <RewardBurst rewardKey={rewardKey}>
        <button type="button">Complete task</button>
      </RewardBurst>
      <AnimatedCounter value={taskCount} />
      <ProgressPop value={taskCount} max={10} rewardKey={rewardKey} label="Project progress" />
      <SuccessPop
        open={completed}
        title="Task completed"
        description="That moved the project forward."
      />
    </CelebrationProvider>
  );
}
```

Use `subtle` for routine acknowledgement, `satisfying` for meaningful completion, and
`celebration` only for genuine milestones. `RewardBurst` is decorative, `SuccessPop` is announced
as status, counters and progress expose semantic values, and reduced-motion preferences remove
spatial reward effects. Avoid random rewards, artificial streak pressure, manufactured urgency,
and continuous celebration.

Install the complete source-owned Pop reward slice with:

```sh
bunx shadcn@4.18.0 add moritzbrantner/ui/pop-rewards
```

This transitively installs `pop-theme` and `theme-motion`.

Migration examples:

| Old                                           | New                                                 |
| --------------------------------------------- | --------------------------------------------------- |
| `@moritzbrantner/ui/components/button`        | `@moritzbrantner/ui/components/stable/button`       |
| `@moritzbrantner/ui/components/data-grid`     | `@moritzbrantner/ui/components/data/data-grid`      |
| `@moritzbrantner/ui/components/chat`          | `@moritzbrantner/ui/components/social/chat`         |
| `@moritzbrantner/ui/components/image-cropper` | `@moritzbrantner/ui/components/media/image-cropper` |

0.10.0 removes the stable chart, funnel chart, org chart, and labs UML diagram surfaces from this package. Move chart, funnel, org chart, and UML/editor-specific visualization behavior to app-owned code or a dedicated visualization package.

## Menu Patterns

Use `ActionMenu` for button-triggered command menus. Use `ContextActionMenu` for right-click or contextual target actions. Use `ActionSheet` for touch-first mobile action menus. Use `ResponsiveActionMenu` when the same trigger should open a desktop dropdown and a mobile slide sheet. Use `HoverPreview` for read-only hover and focus previews.

Use low-level `DropdownMenu`, `ContextMenu`, `Menubar`, `NavigationMenu`, `Popover`, `Sheet`, or `MobileSlide` for custom structures beyond the composed APIs, including nested submenus.

Row actions: put `ActionMenu` on a desktop table row action button, and wrap the row or row affordance with `ContextActionMenu` for right-click actions. Keep mutations, fetching, permissions, analytics, and route changes in the app through callbacks.

Mobile filter and action sheets: use `ActionSheet` with checkbox and radio menu items. Keep URL state, persistence, and backend query contracts in the consuming app.

Responsive overflow menus: use `ResponsiveActionMenu` with the same `items` array for desktop and mobile. Force `mode` only in tests and stories; use the default `"auto"` mode in app code.

Hover previews: use `HoverPreview` for person, file, and status summaries. Do not hide required actions inside hover-only UI.

## Comprehensive App Usage

Use the root import for compatibility and examples:

```tsx
import { Button, PageShell, DataGrid } from "@moritzbrantner/ui";
```

Use the explicit client entrypoint as a convenience client barrel. It mirrors the root component policy, so focused tiers and labs remain excluded:

```tsx
import { Button, CommandPalette, Dialog } from "@moritzbrantner/ui/client";
```

Use component subpaths for bundle-sensitive app surfaces:

```tsx
import "@moritzbrantner/ui/atlas/styles.css";
import "@moritzbrantner/ui/component-sources.css";

import { AtlasTheme, uiTheme } from "@moritzbrantner/ui/atlas";
import { Button } from "@moritzbrantner/ui/components/stable/button";
import { DataGrid } from "@moritzbrantner/ui/components/data/data-grid";
import { cn } from "@moritzbrantner/ui/server";
```

Use the server entrypoint for `cn`, `themeConfig`, `createUiTheme`, and theme metadata in server code:

```ts
import { cn, createUiTheme, themeConfig } from "@moritzbrantner/ui/server";
```

Every app should import one concrete theme stylesheet, usually `@moritzbrantner/ui/styles.css`. Theme-specific stylesheets such as `@moritzbrantner/ui/atlas/styles.css`, `@moritzbrantner/ui/scholia/styles.css`, `@moritzbrantner/ui/pop/styles.css`, and `@moritzbrantner/ui/pulse/styles.css` replace that default when a product surface needs a different visual system. Add `@moritzbrantner/ui/component-sources.css` when the app renders package components. Use `@moritzbrantner/ui/theme-scopes.css` only when multiple built-in themes must coexist in one document.

## Do Not Put Here

Keep app-specific behavior in consuming packages:

- Auth and session flows.
- Route-aware menus.
- Settings, admin, account, and profile pages.
- Upload execution and transport logic.
- Data fetching, cache policy, and API contracts.
- Product-specific onboarding, empty-state copy, or workflow decisions.

## Recipes

- App shell: combine `Navbar`, `PageShell`, `PageHeader`, `PageContent`, `Surface`, `CommandPalette`, `NotificationMenu`, `AccountMenu`, `LanguageSwitcher`, and `ThemeModeSwitch`.
- Data page: use `SearchField`, `DataGrid`, `StateView`, and app-owned server state for sorting, filtering, pagination, loading, empty, and error states.
- Filtered data page: use `FilterBar` for search and active filter display, `DataGrid` for rows, and `QueryBuilder` only when the app needs nested boolean filters; keep fetching, URL state, and backend query contracts in the app.
- Validated form: use `FormSection`, `Field`, `FieldError`, `ValidationSummary`, and `FormActions`; keep validation rules and submit side effects in the app.
- Upload queue: use `Dropzone` and `UploadQueue`; keep file storage, retries, cancellation, and transport in the app.
- Row actions: use `ActionMenu` for click or ellipsis menus and `ContextActionMenu` for right-click menus; keep mutation and fetch logic in the app callbacks.
- Mobile filters and actions: use `ActionSheet` with checkbox or radio items; keep URL state and backend query contracts in the app.
- Responsive overflow menu: use `ResponsiveActionMenu` with a shared `items` array, and reserve forced `mode` values for tests and stories.
- Hover preview: use `HoverPreview` for read-only summaries; keep required commands available through click, focus, context, or touch surfaces.
- Command palette: pass app-owned actions to `CommandPalette`; keep routing and permissions outside this package.
- Workflow editor: use `@moritzbrantner/workflow-editor/react` for graph editing surfaces; keep execution, persistence, permissions, and run state in the app.
- Theme switching: wire `ThemeModeSwitch` to the app theme provider and import exactly one UI stylesheet.
- Non-happy paths: compose `EmptyState`, `LoadingState`, `ErrorState`, and `OfflineState` with app-owned messages and retry callbacks.

## Component Contract

Public components should accept `className`, forward standard DOM props, expose stable `data-slot` hooks, and use variants for intentional design choices. Avoid arbitrary visual props such as `color`, `rounded`, `shadow`, or custom spacing knobs; those decisions should come from design tokens and named variants.

```tsx
<Button variant="secondary" size="sm">
  Save
</Button>
```

## Component Editor

`ComponentEditorProvider`, `EditableComponent`, `ComponentEditorPanel`, and `buildJsxSnippet` support interactive integration galleries. Wrap preview components with metadata, render the panel beside them, and users can click a preview, adjust supported props with inspector controls, then copy JSX.

```tsx
import {
  Button,
  ComponentEditorPanel,
  ComponentEditorProvider,
  EditableComponent,
  buildJsxSnippet,
  type EditableComponentDefinition,
} from "@moritzbrantner/ui";

const buttonDefinition: EditableComponentDefinition = {
  id: "primary-button",
  label: "Button",
  importName: "Button",
  importFrom: "@moritzbrantner/ui",
  controls: [
    { id: "variant", label: "Variant", type: "select", value: "default" },
    { id: "label", label: "Label", type: "text", value: "Save" },
  ],
  buildSnippet: (values) =>
    buildJsxSnippet({
      importName: "Button",
      importFrom: "@moritzbrantner/ui",
      props: { variant: values.variant },
      children: String(values.label),
    }),
};

export function IntegrationGallery() {
  return (
    <ComponentEditorProvider defaultSelectedId="primary-button">
      <EditableComponent definition={buttonDefinition}>
        {(values) => <Button variant={values.variant as "default"}>{values.label}</Button>}
      </EditableComponent>
      <ComponentEditorPanel />
    </ComponentEditorProvider>
  );
}
```

## Composed Patterns

The package also includes reusable state-light patterns for common application surfaces:

- `StateView`, `EmptyState`, `LoadingState`, `ErrorState`, and `OfflineState` for consistent non-happy-path panels.
- `SearchField`, `SelectionToolbar`, `FilterBar`, `ResourceList`, and `DataGrid` through `@moritzbrantner/ui/data` for data-page composition.
- `PageShell`, `Navbar`, `AccountMenu`, and `NotificationMenu` through `@moritzbrantner/ui/shell` for reusable app chrome.
- `FormSection`, `FieldGrid`, `FormActions`, and `ValidationSummary` for repeated form structure.
- `TagInput` for editable string lists with keyboard and remove affordances.
- `QueryBuilder` for nested boolean filter editing while it remains in labs.
- `ViewHeader`, `DetailsPanel`, `DisclosurePanel`, and `ConfirmAction` for reusable view, detail, disclosure, and confirmation surfaces.
- `CommandPalette`, `UploadQueue`, `ShortcutList`, `ShortcutHelpDialog`, and `WorkbenchLayout` for generic tool surfaces.
- `Chat`, `SocialActionGroup`, `SocialPost`, and `ProfileSummary` through `@moritzbrantner/ui/social` for reusable social surfaces.
- `ImageCropper` and `ImageFilterEditor` through `@moritzbrantner/ui/media` for reusable media editing surfaces.

These components render UI state and slots only. Keep fetching, routing, upload execution, auth/session state, and product-specific workflows in consuming packages.

## Theme Metadata

`UiTheme`, `BobbaTheme`, `ZleekTheme`, `AtlasTheme`, `StudioTheme`, `PaperTheme`, `ScholiaTheme`, `PopTheme`, and `PulseTheme` add theme metadata classes and `data-ui-theme` attributes around a subtree. They do not scope CSS tokens by themselves; the active visual theme still comes from the single stylesheet imported by the app.

```tsx
import { UiTheme, type UiThemeName } from "@moritzbrantner/ui";

export function Shell({ theme }: { theme: UiThemeName }) {
  return (
    <UiTheme theme={theme} className="contents">
      <main>Application content</main>
    </UiTheme>
  );
}
```

Theme metadata is also available from subpaths. Use single-theme subpaths for bundle-sensitive client surfaces:

```ts
import { themeConfig, uiThemeNames } from "@moritzbrantner/ui/themes";
import { AtlasTheme, uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas";
import { ScholiaTheme, uiTheme as scholiaTheme } from "@moritzbrantner/ui/themes/scholia";
import { PopTheme, uiTheme as popTheme } from "@moritzbrantner/ui/themes/pop";
import { PulseTheme, uiTheme as pulseTheme } from "@moritzbrantner/ui/themes/pulse";
```

Import classes are intentionally split:

- Compatibility/convenience component barrels: `@moritzbrantner/ui` and `@moritzbrantner/ui/client`.
- Lean single-theme wrappers and metadata: `@moritzbrantner/ui/<theme>` and `@moritzbrantner/ui/themes/<theme>`.
- Multi-theme client wrappers and metadata: `@moritzbrantner/ui/themes`.
- Server-only metadata: `@moritzbrantner/ui/<theme>/server` and `@moritzbrantner/ui/server`.

The theme root subpaths are lean entrypoints. They intentionally do not export components, `UiTheme`, or `themeConfig`; import components through subpaths and use `@moritzbrantner/ui/themes` or `@moritzbrantner/ui/server` when a surface needs the full theme registry.

```ts
import { uiTheme as zleekTheme } from "@moritzbrantner/ui/zleek";
import { uiTheme as bobbaTheme } from "@moritzbrantner/ui/bobba";
import { uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas";
import { uiTheme as studioTheme } from "@moritzbrantner/ui/studio";
import { uiTheme as paperTheme } from "@moritzbrantner/ui/paper";
import { uiTheme as scholiaTheme } from "@moritzbrantner/ui/scholia";
import { uiTheme as popTheme } from "@moritzbrantner/ui/pop";
import { uiTheme as pulseTheme } from "@moritzbrantner/ui/pulse";
```

Use metadata-only theme server subpaths for server code:

```ts
import { uiTheme as zleekTheme } from "@moritzbrantner/ui/zleek/server";
import { uiTheme as bobbaTheme } from "@moritzbrantner/ui/bobba/server";
import { uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas/server";
import { uiTheme as studioTheme } from "@moritzbrantner/ui/studio/server";
import { uiTheme as paperTheme } from "@moritzbrantner/ui/paper/server";
import { uiTheme as scholiaTheme } from "@moritzbrantner/ui/scholia/server";
import { uiTheme as popTheme } from "@moritzbrantner/ui/pop/server";
import { uiTheme as pulseTheme } from "@moritzbrantner/ui/pulse/server";
```

Storybook uses the same theme registry for its design-system toolbar and for the per-style component catalog stories.

## Storybook Pages

Storybook is deployed to GitHub Pages from `.github/workflows/pages.yml` on every push to `main`, and can also be deployed manually with the `workflow_dispatch` trigger.

In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The workflow builds `storybook-static` with `bun run build-storybook` and publishes that directory as the Pages artifact, including the grouped Storybook sidebar.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), [docs/design-system.md](./docs/design-system.md), and [docs/release.md](./docs/release.md) for package boundaries, component requirements, and release checks.

## Release Checks

Publishing goes directly to the public package registry. For a local publish, authenticate for the registry, run the release checks, then publish:

```sh
bun run publish:registry
```

The `.github/workflows/publish.yml` workflow can also publish on `v*` tags or manual dispatch. Configure npm trusted publishing for `moritzbrantner/ui` with workflow filename `publish.yml`, environment `npm`, and `npm publish` allowed:

```sh
npm trust github @moritzbrantner/ui --repo moritzbrantner/ui --file publish.yml --env npm --allow-publish
```

As a fallback, add an `NPM_TOKEN` secret with publish access to the GitHub `npm` environment.

Before tagging, dispatching, or publishing manually, run:

```sh
bun run verify:release
```

To inspect the package contents without publishing:

```sh
bun run pack:dry
```

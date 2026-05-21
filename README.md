# @moritzbrantner/ui

Shared Tailwind 4 React UI primitives, layout components, and global theme styles for the platform packages workspace.

## Design System Role

`@moritzbrantner/ui` is the low-level design-system package. It owns shared tokens, primitives, composed components, theme metadata, Storybook coverage, and package-consumption guarantees.

Keep product workflows in higher-level packages such as `@moritzbrantner/frontend-ui`. Complete frontend surfaces, pages, navigation composition, roles, auth/session state, admin/account/settings/profile workflows, and other app-specific behavior should compose `@moritzbrantner/ui` instead of living in it.

Generic visual affordances such as `AccountMenu` and `NotificationMenu` live in this package only when they stay state-free and contract-free. Apps and `@moritzbrantner/frontend-ui` own the menu content, routing, auth/session state, notification state, and backend behavior.

## Install

```sh
bun add @moritzbrantner/ui
```

The package is published to GitHub Packages for the `@moritzbrantner` scope, so consumers need registry access configured for that scope.

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

`bun run verify` reports repository hygiene first, then runs the release verification contract. The heavy checks include Storybook tests, coverage, Playwright visual tests, the consumer example build, benchmarks, build-size checks, and an npm pack dry run. Install the local Playwright browser before running visual tests for the first time:

```sh
bunx playwright install chromium
```

If installation or CI cannot read GitHub Packages, make sure `GH_PACKAGES_TOKEN` is available for the `@moritzbrantner` scope configured in `.npmrc`.

## Styles

Import exactly one UI stylesheet for the app. Theme tokens are global CSS custom properties, so different UI themes are not intended to coexist on the same page.

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
```

Use `atlas` for dense dashboards and analytics, `studio` for creative tooling, and `paper` for document or research-heavy interfaces.

## Components

Root imports are best for compatibility and examples:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@moritzbrantner/ui";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package status</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Refresh</Button>
      </CardContent>
    </Card>
  );
}
```

Component subpaths are preferred for bundle-sensitive comprehensive apps:

```tsx
import { Button } from "@moritzbrantner/ui/components/button";
import { DataGrid } from "@moritzbrantner/ui/components/data-grid";
import { cn } from "@moritzbrantner/ui/server";
```

## Comprehensive App Usage

Use the root import for compatibility and examples:

```tsx
import { Button, PageShell, DataGrid } from "@moritzbrantner/ui";
```

Use the explicit client entrypoint as a convenience client barrel. It can include the full component surface, so prefer component subpaths when bundle size matters:

```tsx
import { Button, CommandPalette, Dialog } from "@moritzbrantner/ui/client";
```

Use component subpaths for bundle-sensitive app surfaces:

```tsx
import "@moritzbrantner/ui/atlas/styles.css";

import { Button } from "@moritzbrantner/ui/components/button";
import { DataGrid } from "@moritzbrantner/ui/components/data-grid";
import { uiTheme } from "@moritzbrantner/ui/atlas/server";
import { cn } from "@moritzbrantner/ui/server";
```

Use the server entrypoint for `cn`, `themeConfig`, `createUiTheme`, and theme metadata in server code:

```ts
import { cn, createUiTheme, themeConfig } from "@moritzbrantner/ui/server";
```

Every app should import one stylesheet, usually `@moritzbrantner/ui/styles.css`. Theme-specific stylesheets such as `@moritzbrantner/ui/atlas/styles.css` replace that default when a product surface needs a different visual system. `UiTheme` and `themeConfig` provide metadata classes and attributes; they do not fetch data or switch global CSS by themselves.

## Do Not Put Here

Keep app-specific behavior in consuming packages:

- Auth and session flows.
- Route-aware menus.
- Settings, admin, account, and profile pages.
- Upload execution and transport logic.
- Data fetching, cache policy, and API contracts.
- Product-specific onboarding, empty-state copy, or workflow decisions.

## Recipes

- App shell: combine `PlatformNavbar`, `PageShell`, `PageHeader`, `PageContent`, `Surface`, `CommandPalette`, `NotificationMenu`, `AccountMenu`, `LanguageSwitcher`, and `ThemeModeSwitch`.
- Data page: use `SearchField`, `DataGrid`, `StateView`, and app-owned server state for sorting, filtering, pagination, loading, empty, and error states.
- Validated form: use `FormSection`, `Field`, `FieldError`, `ValidationSummary`, and `FormActions`; keep validation rules and submit side effects in the app.
- Upload queue: use `Dropzone` and `UploadQueue`; keep file storage, retries, cancellation, and transport in the app.
- Command palette: pass app-owned actions to `CommandPalette`; keep routing and permissions outside this package.
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
- `SearchField`, `SelectionToolbar`, `FormSection`, `FieldGrid`, `FormActions`, and `ValidationSummary` for repeated search, selection, and form structure.
- `CommandPalette`, `UploadQueue`, `ShortcutList`, `ShortcutHelpDialog`, and `WorkbenchLayout` for generic tool surfaces.

These components render UI state and slots only. Keep fetching, routing, upload execution, auth/session state, and product-specific workflows in consuming packages.

`DataTable` remains available as a legacy/simple table helper. Prefer `DataGrid` for app data pages that need controlled server state, manual sorting/filtering/pagination, row selection, and loading/error/empty states.

## Theme Metadata

`UiTheme`, `BobbaTheme`, `ZleekTheme`, `AtlasTheme`, `StudioTheme`, and `PaperTheme` add theme metadata classes and `data-ui-theme` attributes around a subtree. They do not scope CSS tokens by themselves; the active visual theme still comes from the single stylesheet imported by the app.

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

Theme metadata is also available from subpaths. The full theme subpaths are client/full-package convenience entrypoints:

```ts
import { themeConfig, uiThemeNames } from "@moritzbrantner/ui/themes";
import { uiTheme as zleekTheme } from "@moritzbrantner/ui/zleek";
import { uiTheme as bobbaTheme } from "@moritzbrantner/ui/bobba";
import { uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas";
import { uiTheme as studioTheme } from "@moritzbrantner/ui/studio";
import { uiTheme as paperTheme } from "@moritzbrantner/ui/paper";
```

Use metadata-only theme server subpaths for server code and bundle-sensitive theme metadata:

```ts
import { uiTheme as zleekTheme } from "@moritzbrantner/ui/zleek/server";
import { uiTheme as bobbaTheme } from "@moritzbrantner/ui/bobba/server";
import { uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas/server";
import { uiTheme as studioTheme } from "@moritzbrantner/ui/studio/server";
import { uiTheme as paperTheme } from "@moritzbrantner/ui/paper/server";
```

Storybook uses the same theme registry for its design-system toolbar and for the per-style component catalog stories.

## Storybook Pages

Storybook is deployed to GitHub Pages from `.github/workflows/pages.yml` on every push to `main`, and can also be deployed manually with the `workflow_dispatch` trigger.

In the repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. The workflow builds `storybook-static` with `bun run build-storybook` and publishes that directory as the Pages artifact, including the grouped Storybook sidebar.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/design-system.md](./docs/design-system.md) for package boundaries, component requirements, and release checks.

## Release Checks

Publishing is handled by `.github/workflows/publish.yml` on `v*` tags or manual workflow dispatch. There is no local `release` script because publishing requires GitHub Packages credentials and should go through the workflow.

Before tagging or dispatching a publish, run:

```sh
bun run verify:release
```

To inspect the package contents without publishing:

```sh
bun run pack:dry
```

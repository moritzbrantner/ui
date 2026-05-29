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

The package is published to the public npm registry for the `@moritzbrantner` scope, so consumers can install it with their normal npm/Bun registry configuration.

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

`bun run verify` reports repository hygiene first, then runs the release verification contract. The heavy checks include Storybook tests, coverage, Playwright visual tests, Unlighthouse performance and usability audits, the consumer example build, benchmarks, build-size checks, and an npm pack dry run. Install the local Playwright browser before running visual or Unlighthouse tests for the first time:

```sh
bunx playwright install chromium
```

Run the Storybook-based Unlighthouse audit by itself with:

```sh
bun run test:unlighthouse
```

The audit builds Storybook, serves the static output locally, checks representative component stories, and writes the generated report to `unlighthouse-report/`.

`bun run test:coverage` is a local fallback when Bun's `node` shim cannot expose V8 coverage APIs. It runs the unit suite and reports that coverage was not measured. Release coverage must use `npm run test:coverage:real` with a real Node runtime, which CI gets from `actions/setup-node`.

Run `bun run bench` by itself, not in parallel with Storybook, Playwright, or other browser-heavy checks. The benchmark verifier retries failed samples once to filter transient host load, but repeat failures should be treated as release signals.

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

Token metadata now lives in `src/token-metadata.ts`. CSS is still manually authored in this release; see [docs/token-source-of-truth.md](./docs/token-source-of-truth.md) for the current source-of-truth status and the deferred generation plan.

## Components

Components are organized into support tiers:

- `stable`: primitives and low-level controls with the strongest API expectations.
- `patterns`: state-light composed components for common app layouts and workflows.
- `data`: data grids, resource lists, filters, search fields, and selection toolbars.
- `shell`: app chrome, page shell, navigation, account, and notification surfaces.
- `social`: state-light social, chat, feed, action, and profile summary components.
- `media`: image cropper and filter editing surfaces.
- `labs`: experimental components that are public only through explicit labs paths and can change faster.

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

Migration examples:

| Old                                              | New                                                   |
| ------------------------------------------------ | ----------------------------------------------------- |
| `@moritzbrantner/ui/components/button`           | `@moritzbrantner/ui/components/stable/button`         |
| `@moritzbrantner/ui/components/data-grid`        | `@moritzbrantner/ui/components/data/data-grid`        |
| `@moritzbrantner/ui/components/chat`             | `@moritzbrantner/ui/components/social/chat`           |
| `@moritzbrantner/ui/components/image-cropper`    | `@moritzbrantner/ui/components/media/image-cropper`   |

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

import { Button } from "@moritzbrantner/ui/components/stable/button";
import { DataGrid } from "@moritzbrantner/ui/components/data/data-grid";
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
- `PageShell`, `PlatformNavbar`, `AccountMenu`, and `NotificationMenu` through `@moritzbrantner/ui/shell` for reusable app chrome.
- `FormSection`, `FieldGrid`, `FormActions`, and `ValidationSummary` for repeated form structure.
- `TagInput` for editable string lists with keyboard and remove affordances.
- `QueryBuilder` for nested boolean filter editing while it remains in labs.
- `ViewHeader`, `DetailsPanel`, `DisclosurePanel`, and `ConfirmAction` for reusable view, detail, disclosure, and confirmation surfaces.
- `CommandPalette`, `UploadQueue`, `ShortcutList`, `ShortcutHelpDialog`, and `WorkbenchLayout` for generic tool surfaces.
- `Chat`, `SocialActionGroup`, `SocialPost`, and `ProfileSummary` through `@moritzbrantner/ui/social` for reusable social surfaces.
- `ImageCropper` and `ImageFilterEditor` through `@moritzbrantner/ui/media` for reusable media editing surfaces.

These components render UI state and slots only. Keep fetching, routing, upload execution, auth/session state, and product-specific workflows in consuming packages.

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

See [CONTRIBUTING.md](./CONTRIBUTING.md), [docs/design-system.md](./docs/design-system.md), and [docs/release.md](./docs/release.md) for package boundaries, component requirements, and release checks.

## Release Checks

Publishing goes directly to the public npm registry. For a local publish, authenticate with npm, run the release checks, then publish:

```sh
bun run publish:npm
```

The `.github/workflows/publish.yml` workflow can also publish on `v*` tags or manual dispatch when the repository has an `NPM_TOKEN` secret with publish access.

Before tagging, dispatching, or publishing manually, run:

```sh
bun run verify:release
```

To inspect the package contents without publishing:

```sh
bun run pack:dry
```

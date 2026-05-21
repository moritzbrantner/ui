# Design System Guide

`@moritzbrantner/ui` owns reusable UI primitives, layout components, state-light composed components, theme metadata, Tailwind 4 styles, Storybook coverage, and package-consumption checks.

## Import Boundaries

Use `@moritzbrantner/ui` for compatibility and examples. Use `@moritzbrantner/ui/client` as a convenience client barrel when importing from one broad client surface is acceptable. It can include the full component surface, so use component subpaths for bundle-sensitive comprehensive apps. Use `@moritzbrantner/ui/server` for server-safe helpers and theme metadata such as `cn`, `themeConfig`, `uiThemeNames`, and `createUiTheme`.

```tsx
import { Button } from "@moritzbrantner/ui/components/button";
import { DataGrid } from "@moritzbrantner/ui/components/data-grid";
import { uiTheme } from "@moritzbrantner/ui/atlas/server";
import { cn, themeConfig } from "@moritzbrantner/ui/server";
```

## Styles And Themes

Import exactly one global stylesheet in an app:

```ts
import "@moritzbrantner/ui/styles.css";
```

Theme-specific stylesheets such as `@moritzbrantner/ui/atlas/styles.css`, `@moritzbrantner/ui/studio/styles.css`, and `@moritzbrantner/ui/paper/styles.css` replace the default stylesheet for product surfaces with different visual needs. `UiTheme` and the theme metadata exports add classes and attributes; they do not load stylesheets or own theme persistence.

Existing theme subpaths such as `@moritzbrantner/ui/zleek` and `@moritzbrantner/ui/atlas` remain full client convenience entrypoints. Use metadata-only subpaths such as `@moritzbrantner/ui/zleek/server`, `@moritzbrantner/ui/bobba/server`, `@moritzbrantner/ui/atlas/server`, `@moritzbrantner/ui/studio/server`, and `@moritzbrantner/ui/paper/server` in server code.

## App Recipes

App shell: compose `PlatformNavbar`, `PageShell`, `PageHeader`, `PageContent`, `Surface`, `CommandPalette`, `NotificationMenu`, `AccountMenu`, `LanguageSwitcher`, and `ThemeModeSwitch`. Apps provide route state, menu item content, account data, and callbacks.

Data page: prefer `DataGrid` over legacy `DataTable` for controlled server state, manual sorting/filtering/pagination, row selection, and loading/error/empty states. Apps own fetching, cache state, URL state, and backend contracts.

Filtered data page: compose `FilterBar` for search and active filter display with `DataGrid` for rows. Use `QueryBuilder` only when the app needs nested boolean filters. Apps own fetching, URL state, backend query contracts, and persistence.

Validated form: compose `FormSection`, `Field`, `FieldError`, `ValidationSummary`, and `FormActions`. Apps own schema validation, submit behavior, persistence, and error mapping.

Upload queue: compose `Dropzone` and `UploadQueue`. Apps own transport, file storage, retries, cancellation, and progress events.

Command palette: pass app-owned command groups to `CommandPalette`. Apps own routing, permissions, and side effects.

Workflow editor: use `WorkflowBuilder` for graph layout, viewport control, selection, and connection interaction. Apps own execution, persistence, permissions, run state, and backend workflow contracts.

Theme switching: wire `ThemeModeSwitch` to the app theme provider or controlled state. `Toaster` accepts an optional `theme` prop and otherwise follows `next-themes`.

Non-happy paths: compose `EmptyState`, `LoadingState`, `ErrorState`, `OfflineState`, and `StateViewActions` with app-owned copy and retry callbacks.

## Component Contract

Public components should accept `className`, forward DOM props where they render DOM, expose stable `data-slot` values, use semantic tokens from the published stylesheets, and avoid arbitrary visual knobs. If a wrapper cannot satisfy a rule because it delegates to a third-party primitive or provider, the verifier allowlist must include a reason.

## Do Not Put Here

Do not add auth flows, route-aware menus, settings/admin/profile pages, upload execution, data fetching, API contracts, product onboarding, or backend-specific state machines to this package. Put those in consuming applications or higher-level UI packages.

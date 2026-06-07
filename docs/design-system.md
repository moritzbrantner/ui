# Design System Guide

`@moritzbrantner/ui` owns reusable UI primitives, layout components, state-light composed components, theme metadata, Tailwind 4 styles, Storybook coverage, and package-consumption checks.

## Import Boundaries

Use `@moritzbrantner/ui` for `stable` and generic `patterns` components, `cn`, and theme client APIs. Use `@moritzbrantner/ui/client` as the matching client convenience barrel. Neither root nor client exports focused tiers or `labs`.

Use tiered component subpaths for bundle-sensitive comprehensive apps. Use `@moritzbrantner/ui/server` for server-safe helpers and theme metadata such as `cn`, `themeConfig`, `uiThemeNames`, and `createUiTheme`.

```tsx
import { Button } from "@moritzbrantner/ui/components/stable/button";
import { DataGrid } from "@moritzbrantner/ui/components/data/data-grid";
import { PageShell } from "@moritzbrantner/ui/components/shell/app-layout";
import { Chat } from "@moritzbrantner/ui/components/social/chat";
import { ImageCropper } from "@moritzbrantner/ui/components/media/image-cropper";
import { Timeline } from "@moritzbrantner/ui/components/labs/timeline";
import { cn, themeConfig } from "@moritzbrantner/ui/server";
import { uiTheme } from "@moritzbrantner/ui/themes/atlas";
```

Component tiers:

- `stable`: primitives and low-level controls with the strongest support and contract checks.
- `patterns`: state-light composed UI for common app workflows.
- `data`: state-light data grid, resource list, filter, search, and selection UI.
- `shell`: state-light app chrome, page shell, account, notification, and navigation UI.
- `social`: state-light chat, social actions, social feed, and profile summary UI.
- `media`: state-light image cropper and image filter editing UI.
- `labs`: experimental public components. They are not root-exported and may change faster.

Migration examples:

| Old                                           | New                                                 |
| --------------------------------------------- | --------------------------------------------------- |
| `@moritzbrantner/ui/components/button`        | `@moritzbrantner/ui/components/stable/button`       |
| `@moritzbrantner/ui/components/data-grid`     | `@moritzbrantner/ui/components/data/data-grid`      |
| `@moritzbrantner/ui/components/chat`          | `@moritzbrantner/ui/components/social/chat`         |
| `@moritzbrantner/ui/components/image-cropper` | `@moritzbrantner/ui/components/media/image-cropper` |

## Styles And Themes

Import exactly one global stylesheet in an app:

```ts
import "@moritzbrantner/ui/styles.css";
```

Theme-specific stylesheets such as `@moritzbrantner/ui/atlas/styles.css`, `@moritzbrantner/ui/studio/styles.css`, `@moritzbrantner/ui/paper/styles.css`, and `@moritzbrantner/ui/pop/styles.css` replace the default stylesheet for product surfaces with different visual needs. Each theme stylesheet imports the shared generated `base.css` layer and only its own token blocks. `base.css` is exported for tooling and advanced composition, but it generally should not be the only stylesheet an app imports because it does not provide concrete theme token values.

Import classes are intentionally split:

- Compatibility and convenience: `@moritzbrantner/ui`, `@moritzbrantner/ui/client`, and legacy client theme subpaths such as `@moritzbrantner/ui/atlas`.
- Optimized client theme wrappers and metadata: `@moritzbrantner/ui/themes/<theme>`, such as `@moritzbrantner/ui/themes/atlas` and `@moritzbrantner/ui/themes/pop`.
- Server-only metadata: `@moritzbrantner/ui/<theme>/server` and `@moritzbrantner/ui/server`.

Apps should still import exactly one concrete stylesheet such as `@moritzbrantner/ui/styles.css`, `@moritzbrantner/ui/atlas/styles.css`, or `@moritzbrantner/ui/pop/styles.css`.

## App Recipes

App shell: import `Navbar`, `PageShell`, `PageHeader`, `PageContent`, `Surface`, `NotificationMenu`, and `AccountMenu` from `@moritzbrantner/ui/shell`. Compose with `CommandPalette`, `LanguageSwitcher`, and `ThemeModeSwitch`. Apps provide route state, menu item content, account data, and callbacks.

Data page: import `DataGrid`, `ResourceList`, `FilterBar`, `SearchField`, and `SelectionToolbar` from `@moritzbrantner/ui/data` for controlled server state, manual sorting/filtering/pagination, row selection, and loading/error/empty states. Apps own fetching, cache state, URL state, and backend contracts.

Filtered data page: compose `FilterBar` for search and active filter display with `DataGrid` for rows. Use `QueryBuilder` only when the app needs nested boolean filters. Apps own fetching, URL state, backend query contracts, and persistence.

List and detail views: compose `ViewHeader`, `ResourceList`, `DetailsPanel`, `DisclosurePanel`, and `ConfirmAction` for reusable view structure, list rows, detail drawers or panels, expandable sections, and destructive or irreversible confirmations. Apps own route changes, data loading, permissions, and mutation side effects.

Validated form: compose `FormSection`, `Field`, `FieldError`, `ValidationSummary`, and `FormActions`. Apps own schema validation, submit behavior, persistence, and error mapping.

Upload queue: compose `Dropzone` and `UploadQueue`. Apps own transport, file storage, retries, cancellation, and progress events.

Command palette: pass app-owned command groups to `CommandPalette`. Apps own routing, permissions, and side effects.

Workflow editor: use `@moritzbrantner/workflow-editor/react` for graph editing surfaces. Apps own execution, persistence, permissions, run state, and backend workflow contracts.

Theme switching: wire `ThemeModeSwitch` to the app theme provider or controlled state. `Toaster` accepts an optional `theme` prop and otherwise follows `next-themes`.

Menu patterns: use `ActionMenu` for button-triggered command menus, `ContextActionMenu` for right-click or contextual target actions, `ActionSheet` for touch-first mobile action menus, `ResponsiveActionMenu` when one trigger should open a desktop dropdown and a mobile slide sheet, and `HoverPreview` for read-only hover and focus previews. Use low-level `DropdownMenu`, `ContextMenu`, `Menubar`, `NavigationMenu`, `Popover`, `Sheet`, or `MobileSlide` for custom structures beyond the composed APIs, including nested submenus.

Row actions: place `ActionMenu` on a desktop table row action button and wrap the row or row affordance with `ContextActionMenu` for right-click actions. Apps own mutation, fetch, permission, analytics, and routing behavior through callbacks.

Mobile filter and action sheets: compose `ActionSheet` with checkbox and radio menu items. Apps own URL state, persistence, and backend query contracts.

Responsive overflow menus: compose `ResponsiveActionMenu` with the same `items` array for desktop and mobile. Force `mode` only in tests and stories; use the default `"auto"` mode in app code.

Hover previews: use `HoverPreview` for person, file, and status summaries. Do not hide required actions inside hover-only UI.

Non-happy paths: compose `EmptyState`, `LoadingState`, `ErrorState`, `OfflineState`, and `StateViewActions` with app-owned copy and retry callbacks.

## Component Contract

Public components should accept `className`, forward DOM props where they render DOM, expose stable `data-slot` values, use semantic tokens from the published stylesheets, and avoid arbitrary visual knobs. If a wrapper cannot satisfy a rule because it delegates to a third-party primitive or provider, the verifier allowlist must include a reason.

The typed component registry in `src/component-registry.ts` records the tier, public subpath, root-export policy, Storybook files, and test files for every public component. `stable`, `patterns`, `data`, `shell`, `social`, and `media` entries must list story and test coverage. `labs` entries may use catalog or family coverage while the APIs settle. The generated [component catalog](./components.md) publishes the registry as reviewer-friendly documentation.

## Token Source Status

Token names used at runtime live in `src/token-names.ts`; token categories, descriptions, and built-in theme values live in `src/token-metadata.ts`. Run `bun run generate:tokens` after token changes to update `base.css`, `styles.css`, theme CSS files, `theme-scopes.css`, and `docs/tokens.md`.

## Do Not Put Here

Do not add auth flows, route-aware menus, settings/admin/profile pages, upload execution, data fetching, API contracts, product onboarding, or backend-specific state machines to this package. Put those in consuming applications or higher-level UI packages.

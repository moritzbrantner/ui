# Component Boundary Review

## Scope

This first-pass review applies the project language in [CONTEXT.md](../CONTEXT.md) and the boundary ADRs in [docs/adr](./adr/) to high-risk public components. It reviews release-blocking `patterns`, `data`, `shell`, `social`, and `media` components in depth, then triages every `labs` component with labs-specific maturity criteria.

Simple `stable` primitives are out of scope unless a reviewed component exposes a boundary issue through a stable dependency. No source behavior, package exports, token names, CSS entrypoints, or generated docs were changed by this review.

## Review Criteria

1. **State-light boundary**: package components may own presentation state, visual structure, interaction affordances, theme tokens, and callbacks. Consuming apps own routing, auth, data fetching, persistence, permissions, analytics, backend contracts, durable records, and workflow state machines.
2. **Tier fit**: `patterns` must stay generic across apps. `data`, `shell`, `social`, and `media` may be domain-shaped but not domain-owned. `labs` may have unsettled contracts, but should not be treated as unfinished private code.
3. **Public contract**: public components should expose stable `data-slot` values, accept `className`, forward DOM props where they render DOM, export prop types, use semantic tokens, and avoid arbitrary visual knobs unless the prop is structural.
4. **Mobile and accessibility**: non-labs public components are mobile by default. Review flags target size, overflow, text clipping, overlay, keyboard focus, accessible names, roles, and state exposure using [mobile usability](./mobile-usability.md) and [responsive audit](./responsive-audit.md) as the standards.
5. **Coverage and maturity**: release-blocking tiers need story and test metadata in [src/component-registry.ts](../src/component-registry.ts). Labs components are classified by API stability, stories, tests, mobile behavior, and app-owned boundary clarity before any future promotion.

## Summary

| Decision      | Count |
| ------------- | ----: |
| keep          |    40 |
| change        |     3 |
| promote-later |     4 |
| keep-labs     |     4 |
| defer         |     0 |
| split-or-move |     0 |

## Findings

| Component              | Tier     | Decision      | Reason                                                                                                                                                                            | Follow-up                                                                                                                                                                 |
| ---------------------- | -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| action-menu            | patterns | keep          | Generic menu wrapper with item callbacks and no product workflow ownership.                                                                                                       | None.                                                                                                                                                                     |
| action-sheet           | patterns | keep          | Touch-first menu wrapper mirrors app-owned action items through callbacks.                                                                                                        | None.                                                                                                                                                                     |
| celebration-callout    | patterns | keep          | Presentational callout surface; no app-owned state or backend contract.                                                                                                           | None.                                                                                                                                                                     |
| command-palette        | patterns | keep          | App provides command groups and actions; component owns only dialog/search presentation.                                                                                          | None.                                                                                                                                                                     |
| connection-status      | patterns | keep          | Async pending state wraps app callbacks but does not perform sync/reconnect itself.                                                                                               | None.                                                                                                                                                                     |
| confirm-action         | patterns | keep          | Owns dialog open/pending presentation around an app-provided confirmation callback.                                                                                               | None.                                                                                                                                                                     |
| context-action-menu    | patterns | keep          | Context trigger and action rendering stay generic and callback-driven.                                                                                                            | None.                                                                                                                                                                     |
| details-panel          | patterns | keep          | Detail layout and tab presentation are generic; app owns record content.                                                                                                          | None.                                                                                                                                                                     |
| disclosure-panel       | patterns | keep          | Collapsible presentation primitive composed for app content.                                                                                                                      | None.                                                                                                                                                                     |
| dropzone               | patterns | keep          | File input/drop affordance forwards events; app owns upload execution.                                                                                                            | None.                                                                                                                                                                     |
| hover-preview          | patterns | keep          | Read-only hover/focus preview surface; no required actions hidden in package logic.                                                                                               | None.                                                                                                                                                                     |
| live-indicator         | patterns | keep          | Status indicator backed by semantic tokens and ARIA roles.                                                                                                                        | None.                                                                                                                                                                     |
| menu-actions           | patterns | keep          | Typed action schema/render helpers remain generic and side-effect free.                                                                                                           | None.                                                                                                                                                                     |
| responsive-action-menu | patterns | keep          | Desktop/mobile presentation switch over the same app-owned action items.                                                                                                          | None.                                                                                                                                                                     |
| shortcut-help          | patterns | keep          | Dialog presentation for app-owned shortcut content.                                                                                                                               | None.                                                                                                                                                                     |
| state-view             | patterns | keep          | Non-happy-path surface uses app-owned copy and retry/action callbacks.                                                                                                            | None.                                                                                                                                                                     |
| stepper                | patterns | keep          | Structural status display; app owns workflow transitions.                                                                                                                         | None.                                                                                                                                                                     |
| upload-queue           | patterns | keep          | Renders upload status and retry/cancel/remove callbacks; app owns transport, storage, and retry policy.                                                                           | None.                                                                                                                                                                     |
| view-header            | patterns | keep          | Header, actions, breadcrumbs, tabs, and badges compose app-owned navigation/content.                                                                                              | None.                                                                                                                                                                     |
| workbench-layout       | patterns | keep          | Layout shell owns pane presentation only.                                                                                                                                         | None.                                                                                                                                                                     |
| data-grid              | data     | keep          | Controlled rows, sorting, pagination, loading, error, and selection surfaces leave fetching/query contracts to apps.                                                              | None.                                                                                                                                                                     |
| filter-bar             | data     | keep          | Search/filter chips emit callbacks and do not persist URL/backend filters.                                                                                                        | None.                                                                                                                                                                     |
| resource-list          | data     | keep          | Composes filter, selection, and state surfaces around app-owned rows.                                                                                                             | None.                                                                                                                                                                     |
| search-field           | data     | keep          | Local input/debounce state is presentation state; app owns query persistence and fetching.                                                                                        | None.                                                                                                                                                                     |
| selection-toolbar      | data     | keep          | Selection count/action surface stays controlled by app-owned selected records.                                                                                                    | None.                                                                                                                                                                     |
| account-menu           | shell    | keep          | Displays app-provided user/menu data and callbacks without owning auth/session behavior.                                                                                          | None.                                                                                                                                                                     |
| app-layout             | shell    | keep          | Shell/page layout surface; route state and page content remain app-owned.                                                                                                         | None.                                                                                                                                                                     |
| notification-menu      | shell    | change        | Local "mark read" state changes unread indicators/counts after a menu action, which can be mistaken for durable notification state.                                               | `api-shape`, `docs`: decide whether optimistic local read state should be opt-in/renamed, or document it explicitly as presentation-only while callbacks own persistence. |
| mobile-app-navigation  | shell    | keep          | Mobile chrome derives tabs and controls drawer open state, while apps own routing through `renderLink` and `onNavigate`.                                                          | None.                                                                                                                                                                     |
| navbar                 | shell    | keep          | Responsive navigation surface keeps routing app-owned through link rendering and callbacks.                                                                                       | None.                                                                                                                                                                     |
| navbar-actions         | shell    | keep          | Composes optional language/theme/account/notification/login controls without owning session or route state.                                                                       | None.                                                                                                                                                                     |
| chat                   | social   | keep          | Message layout and log semantics are domain-shaped but not tied to a message backend.                                                                                             | None.                                                                                                                                                                     |
| social-actions         | social   | keep          | Social action presentation remains count/callback-driven.                                                                                                                         | None.                                                                                                                                                                     |
| social-feed            | social   | keep          | Post/comment/composer primitives render app-owned social data and callbacks.                                                                                                      | None.                                                                                                                                                                     |
| profile-summary        | social   | keep          | Profile summary surface renders app-provided identity/content.                                                                                                                    | None.                                                                                                                                                                     |
| animated-image         | media    | keep          | Hover/focus playback, preload, and reduced-motion handling are media presentation behavior.                                                                                       | None.                                                                                                                                                                     |
| image-carousel         | media    | keep          | Carousel owns slide presentation and autoplay timing; app owns media records and activation effects.                                                                              | None.                                                                                                                                                                     |
| image-cropper          | media    | keep          | Crop coordinates and pointer interactions are presentation editing state with callbacks for app persistence.                                                                      | None.                                                                                                                                                                     |
| image-filter-editor    | media    | keep          | Filter values and preview modes are controlled/uncontrolled presentation editing state.                                                                                           | None.                                                                                                                                                                     |
| image-gallery          | media    | keep          | Gallery selection/layout are structural media affordances; app owns selected media usage.                                                                                         | None.                                                                                                                                                                     |
| image-thumbnail-strip  | media    | keep          | Roving focus, selection, and scroll-on-select are presentation state.                                                                                                             | None.                                                                                                                                                                     |
| annotation-canvas      | labs     | keep-labs     | Advanced pointer-driven editing surface with app-owned annotations but unsettled canvas/mobile/a11y contract.                                                                     | Keep in labs; before promotion, define keyboard editing expectations and mobile/desktop support boundary.                                                                 |
| asset-browser          | labs     | keep-labs     | Broad asset-management surface is callback-driven, but search, selection, upload affordance, preview, and pseudo-virtualization make the public contract too broad for promotion. | Keep in labs; before promotion, narrow or document virtualization, upload affordance, and selection semantics.                                                            |
| component-editor       | labs     | keep-labs     | Design-system tooling surface generates JSX and writes to clipboard; useful but closer to package authoring/tooling than a generic app component.                                 | Keep in labs; do not promote until a concrete cross-app consumer exists and clipboard/snippet behavior is documented.                                                     |
| document-viewer        | labs     | promote-later | State-light document viewing/highlighting model looks viable, but registry has no test coverage.                                                                                  | `coverage`, `mobile`, `a11y`: add tests for page changes, zoom/search/highlight selection, and document wide-scroll behavior before promotion.                            |
| gantt                  | labs     | keep-labs     | Wide timeline geometry, hierarchy, dependency lines, and virtualization controls are advanced and likely desktop-heavy.                                                           | Keep in labs; before promotion, define mobile support as internal-scroll or desktop-only and add stronger keyboard/a11y expectations.                                     |
| logical-argument       | labs     | promote-later | Read-only argument display is state-light and has story/test coverage, but the domain language needs consumer validation before a release-blocking tier.                          | `docs`, `tier-change`: document target use cases and decide whether it belongs in `stable` as a display primitive or remains labs.                                        |
| query-builder          | labs     | promote-later | Controlled expression editing matches the state-light data boundary and is already referenced in app recipes, but API semantics are still specialized.                            | `api-shape`, `docs`, `mobile`: clarify expression schema ownership, operator extensibility, and mobile layout before moving to `data`.                                    |
| terminal               | labs     | change        | Public labs component has tests but no Storybook story, and it uses hard-coded terminal colors rather than semantic package tokens.                                               | `coverage`, `visual-contract`: add story coverage and decide whether the zinc terminal palette is an intentional visual contract or should be tokenized.                  |
| timeline               | labs     | change        | Public labs component has no Storybook or test coverage despite being a simple, likely promotable display primitive.                                                              | `coverage`, `tier-change`: add stories/tests, then decide whether it should move to `patterns` or `stable`.                                                               |
| tree-view              | labs     | promote-later | Controlled selection/expansion and ARIA tree behavior look mature, with story/test coverage.                                                                                      | `mobile`, `a11y`, `tier-change`: run focused keyboard/mobile review and consider promotion to `patterns` after contract hardening.                                        |

## Component Notes

### patterns/action-menu

- Decision: keep
- Evidence: [src/components/patterns/action-menu.tsx](../src/components/patterns/action-menu.tsx), [src/component-registry.ts](../src/component-registry.ts), [src/components/patterns/action-menu.test.tsx](../src/components/patterns/action-menu.test.tsx)
- Context check: state-light action trigger and menu presentation; app owns each action's side effects.
- Follow-up: none.

### patterns/action-sheet

- Decision: keep
- Evidence: [src/components/patterns/action-sheet.tsx](../src/components/patterns/action-sheet.tsx), [src/components/patterns/action-sheet.stories.tsx](../src/components/patterns/action-sheet.stories.tsx), [src/components/patterns/action-sheet.test.tsx](../src/components/patterns/action-sheet.test.tsx)
- Context check: mobile action presentation over app-owned items; fits the pattern tier.
- Follow-up: none.

### patterns/celebration-callout

- Decision: keep
- Evidence: [src/components/patterns/celebration-callout.tsx](../src/components/patterns/celebration-callout.tsx), [src/components/patterns/celebration-callout.stories.tsx](../src/components/patterns/celebration-callout.stories.tsx), [src/components/patterns/celebration-callout.test.tsx](../src/components/patterns/celebration-callout.test.tsx)
- Context check: presentational surface with semantic slots and app-provided actions/content.
- Follow-up: none.

### patterns/command-palette

- Decision: keep
- Evidence: [src/components/patterns/command-palette.tsx](../src/components/patterns/command-palette.tsx), [src/components/patterns/command-palette.stories.tsx](../src/components/patterns/command-palette.stories.tsx), [src/components/patterns/command-palette.test.tsx](../src/components/patterns/command-palette.test.tsx)
- Context check: `groups` and action callbacks are app-owned; command search/dialog presentation is package-owned.
- Follow-up: none.

### patterns/connection-status

- Decision: keep
- Evidence: [src/components/patterns/connection-status.tsx](../src/components/patterns/connection-status.tsx), [src/components/patterns/connection-status.test.tsx](../src/components/patterns/connection-status.test.tsx)
- Context check: component awaits app callbacks only to render pending feedback; it does not reconnect or sync itself.
- Follow-up: none.

### patterns/confirm-action

- Decision: keep
- Evidence: [src/components/patterns/confirm-action.tsx](../src/components/patterns/confirm-action.tsx), [src/components/patterns/confirm-action.stories.tsx](../src/components/patterns/confirm-action.stories.tsx)
- Context check: dialog open state and pending spinner are presentation state; irreversible mutation remains in `onConfirm`.
- Follow-up: none.

### patterns/context-action-menu

- Decision: keep
- Evidence: [src/components/patterns/context-action-menu.tsx](../src/components/patterns/context-action-menu.tsx), [src/components/patterns/context-action-menu.test.tsx](../src/components/patterns/context-action-menu.test.tsx)
- Context check: contextual trigger plus app-owned menu items/callbacks.
- Follow-up: none.

### patterns/details-panel

- Decision: keep
- Evidence: [src/components/patterns/details-panel.tsx](../src/components/patterns/details-panel.tsx), [src/components/patterns/details-panel.stories.tsx](../src/components/patterns/details-panel.stories.tsx)
- Context check: generic detail surface and tab callback; app owns entity data and persistence.
- Follow-up: none.

### patterns/disclosure-panel

- Decision: keep
- Evidence: [src/components/patterns/disclosure-panel.tsx](../src/components/patterns/disclosure-panel.tsx), [src/components/patterns/disclosure-panel.test.tsx](../src/components/patterns/disclosure-panel.test.tsx)
- Context check: collapsible presentation around app-owned content.
- Follow-up: none.

### patterns/dropzone

- Decision: keep
- Evidence: [src/components/patterns/dropzone.tsx](../src/components/patterns/dropzone.tsx), [src/components/patterns/dropzone.stories.tsx](../src/components/patterns/dropzone.stories.tsx), [src/components/patterns/upload-dropzone.test.tsx](../src/components/patterns/upload-dropzone.test.tsx)
- Context check: upload affordance only; consuming apps own transport and storage.
- Follow-up: none.

### patterns/hover-preview

- Decision: keep
- Evidence: [src/components/patterns/hover-preview.tsx](../src/components/patterns/hover-preview.tsx), [src/components/patterns/hover-preview.test.tsx](../src/components/patterns/hover-preview.test.tsx)
- Context check: read-only preview surface; no required action is hidden inside package-owned workflow.
- Follow-up: none.

### patterns/live-indicator

- Decision: keep
- Evidence: [src/components/patterns/live-indicator.tsx](../src/components/patterns/live-indicator.tsx), [src/components/patterns/live-indicator.test.tsx](../src/components/patterns/live-indicator.test.tsx)
- Context check: status/alert role and live theme tokens fit visual-contract ownership.
- Follow-up: none.

### patterns/menu-actions

- Decision: keep
- Evidence: [src/components/patterns/menu-actions.tsx](../src/components/patterns/menu-actions.tsx), [src/components/internal/menu-actions.ts](../src/components/internal/menu-actions.ts)
- Context check: menu action schema is generic and leaves execution to callbacks.
- Follow-up: none.

### patterns/responsive-action-menu

- Decision: keep
- Evidence: [src/components/patterns/responsive-action-menu.tsx](../src/components/patterns/responsive-action-menu.tsx), [src/components/patterns/responsive-action-menu.test.tsx](../src/components/patterns/responsive-action-menu.test.tsx)
- Context check: package owns responsive presentation; apps own action data and effects.
- Follow-up: none.

### patterns/shortcut-help

- Decision: keep
- Evidence: [src/components/patterns/shortcut-help.tsx](../src/components/patterns/shortcut-help.tsx), [src/components/patterns/shortcut-help.test.tsx](../src/components/patterns/shortcut-help.test.tsx)
- Context check: dialog content is app-provided; no route or command execution is owned here.
- Follow-up: none.

### patterns/state-view

- Decision: keep
- Evidence: [src/components/patterns/state-view.tsx](../src/components/patterns/state-view.tsx), [src/components/patterns/state-view.test.tsx](../src/components/patterns/state-view.test.tsx)
- Context check: status, empty, error, loading, and offline presentation with app-owned copy/actions.
- Follow-up: none.

### patterns/stepper

- Decision: keep
- Evidence: [src/components/patterns/stepper.tsx](../src/components/patterns/stepper.tsx), [src/components/patterns/status-stepper.test.tsx](../src/components/patterns/status-stepper.test.tsx)
- Context check: displays workflow state but does not advance or persist it.
- Follow-up: none.

### patterns/upload-queue

- Decision: keep
- Evidence: [src/components/patterns/upload-queue.tsx](../src/components/patterns/upload-queue.tsx), [src/components/patterns/upload-queue.test.tsx](../src/components/patterns/upload-queue.test.tsx)
- Context check: status rendering and `onRetry`/`onCancel`/`onRemove` callbacks keep transport app-owned.
- Follow-up: none.

### patterns/view-header

- Decision: keep
- Evidence: [src/components/patterns/view-header.tsx](../src/components/patterns/view-header.tsx), [src/components/patterns/view-header.stories.tsx](../src/components/patterns/view-header.stories.tsx)
- Context check: route/view meaning is supplied by app-owned breadcrumbs, actions, tabs, and badges.
- Follow-up: none.

### patterns/workbench-layout

- Decision: keep
- Evidence: [src/components/patterns/workbench-layout.tsx](../src/components/patterns/workbench-layout.tsx), [src/components/patterns/workbench-layout.test.tsx](../src/components/patterns/workbench-layout.test.tsx)
- Context check: pane layout and resize presentation only.
- Follow-up: none.

### data/data-grid

- Decision: keep
- Evidence: [src/components/data/data-grid.tsx](../src/components/data/data-grid.tsx), [src/components/data/data-grid/impl.tsx](../src/components/data/data-grid/impl.tsx), [src/components/data/data-grid.test.tsx](../src/components/data/data-grid.test.tsx)
- Context check: controlled data surface; sorting/filtering/pagination UI leaves fetching and backend query contracts to apps.
- Follow-up: none.

### data/filter-bar

- Decision: keep
- Evidence: [src/components/data/filter-bar.tsx](../src/components/data/filter-bar.tsx), [src/components/data/filter-bar.test.tsx](../src/components/data/filter-bar.test.tsx)
- Context check: search and active filter presentation with callbacks; URL/backend persistence remains app-owned.
- Follow-up: none.

### data/resource-list

- Decision: keep
- Evidence: [src/components/data/resource-list.tsx](../src/components/data/resource-list.tsx), [src/components/data/resource-list.stories.tsx](../src/components/data/resource-list.stories.tsx)
- Context check: app-owned resources, filters, selection, and state copy are composed into a generic list surface.
- Follow-up: none.

### data/search-field

- Decision: keep
- Evidence: [src/components/data/search-field.tsx](../src/components/data/search-field.tsx), [src/components/data/search-field.test.tsx](../src/components/data/search-field.test.tsx)
- Context check: controlled/uncontrolled text and debounce timing are presentation state; app owns query persistence and fetching.
- Follow-up: none.

### data/selection-toolbar

- Decision: keep
- Evidence: [src/components/data/selection-toolbar.tsx](../src/components/data/selection-toolbar.tsx), [src/components/data/selection-toolbar.test.tsx](../src/components/data/selection-toolbar.test.tsx)
- Context check: displays app-owned selection count and clear callback.
- Follow-up: none.

### shell/account-menu

- Decision: keep
- Evidence: [src/components/shell/account-menu.tsx](../src/components/shell/account-menu.tsx), [src/components/shell/account-and-notification-menu.test.tsx](../src/components/shell/account-and-notification-menu.test.tsx)
- Context check: user/menu data and destructive actions are app-owned; package owns menu presentation.
- Follow-up: none.

### shell/app-layout

- Decision: keep
- Evidence: [src/components/shell/app-layout.tsx](../src/components/shell/app-layout.tsx), [src/components/shell/app-layout.stories.tsx](../src/components/shell/app-layout.stories.tsx), [src/components/shell/layout-navigation.test.tsx](../src/components/shell/layout-navigation.test.tsx)
- Context check: shell, page, surface, and grid structure are reusable layout, not routing or auth.
- Follow-up: none.

### shell/notification-menu

- Decision: change
- Evidence: [src/components/shell/notification-menu.tsx](../src/components/shell/notification-menu.tsx), [src/components/shell/account-and-notification-menu.test.tsx](../src/components/shell/account-and-notification-menu.test.tsx)
- Context check: menu data/callbacks are app-owned, but local read tracking changes item unread presentation and count after "Mark read." That is probably optimistic presentation state, but the term "read" is also durable product state.
- Follow-up: `api-shape`, `docs`: decide whether local unread adjustment becomes opt-in, is renamed/documented as optimistic presentation, or is removed in favor of app-controlled unread updates.

### shell/mobile-app-navigation

- Decision: keep
- Evidence: [src/components/shell/mobile-app-navigation.tsx](../src/components/shell/mobile-app-navigation.tsx), [src/components/shell/layout-navigation.test.tsx](../src/components/shell/layout-navigation.test.tsx)
- Context check: drawer open state and derived tabs are presentation; `renderLink`, `href`, and `onNavigate` leave routing app-owned.
- Follow-up: none.

### shell/navbar

- Decision: keep
- Evidence: [src/components/shell/navbar.tsx](../src/components/shell/navbar.tsx), [src/components/shell/navbar/impl.tsx](../src/components/shell/navbar/impl.tsx), [src/components/shell/layout-navigation.test.tsx](../src/components/shell/layout-navigation.test.tsx)
- Context check: responsive navigation chrome with app-owned link rendering and callbacks.
- Follow-up: none.

### shell/navbar-actions

- Decision: keep
- Evidence: [src/components/shell/navbar-actions.tsx](../src/components/shell/navbar-actions.tsx), [src/components/shell/layout-navigation.test.tsx](../src/components/shell/layout-navigation.test.tsx)
- Context check: optional composed controls do not own login, account, notification, language, or theme provider state.
- Follow-up: none.

### social/chat

- Decision: keep
- Evidence: [src/components/social/chat.tsx](../src/components/social/chat.tsx), [src/components/social/chat-social.test.tsx](../src/components/social/chat-social.test.tsx)
- Context check: chat/message layout with ARIA log semantics; no transport, moderation, or message persistence.
- Follow-up: none.

### social/social-actions

- Decision: keep
- Evidence: [src/components/social/social-actions.tsx](../src/components/social/social-actions.tsx), [src/components/social/chat-social.test.tsx](../src/components/social/chat-social.test.tsx)
- Context check: social action buttons/counts stay callback-driven.
- Follow-up: none.

### social/social-feed

- Decision: keep
- Evidence: [src/components/social/social-feed.tsx](../src/components/social/social-feed.tsx), [src/components/social/social-components.test.tsx](../src/components/social/social-components.test.tsx)
- Context check: post/comment/composer primitives render app-owned social content and callbacks.
- Follow-up: none.

### social/profile-summary

- Decision: keep
- Evidence: [src/components/social/profile-summary.tsx](../src/components/social/profile-summary.tsx), [src/components/social/social-components.test.tsx](../src/components/social/social-components.test.tsx)
- Context check: identity/profile content is supplied by consuming apps.
- Follow-up: none.

### media/animated-image

- Decision: keep
- Evidence: [src/components/media/animated-image.tsx](../src/components/media/animated-image.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: hover/focus playback and reduced-motion response are presentation state.
- Follow-up: none.

### media/image-carousel

- Decision: keep
- Evidence: [src/components/media/image-carousel.tsx](../src/components/media/image-carousel.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: slide index, autoplay interval, and carousel API state are presentation state; app owns media records and activation effects.
- Follow-up: none.

### media/image-cropper

- Decision: keep
- Evidence: [src/components/media/image-cropper.tsx](../src/components/media/image-cropper.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: crop editing emits coordinates through callbacks and leaves image processing/storage to apps.
- Follow-up: none.

### media/image-filter-editor

- Decision: keep
- Evidence: [src/components/media/image-filter-editor.tsx](../src/components/media/image-filter-editor.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: preview/filter controls are state-light editing UI; app owns persistence and rendering pipeline use.
- Follow-up: none.

### media/image-gallery

- Decision: keep
- Evidence: [src/components/media/image-gallery.tsx](../src/components/media/image-gallery.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: selection and structural layout props are media presentation; selected media meaning stays app-owned.
- Follow-up: none.

### media/image-thumbnail-strip

- Decision: keep
- Evidence: [src/components/media/image-thumbnail-strip.tsx](../src/components/media/image-thumbnail-strip.tsx), [src/components/media/media-components.test.tsx](../src/components/media/media-components.test.tsx)
- Context check: roving focus, selected ID, and scroll-on-select are presentation state around app-owned media.
- Follow-up: none.

### labs/annotation-canvas

- Decision: keep-labs
- Evidence: [src/components/labs/annotation-canvas.tsx](../src/components/labs/annotation-canvas.tsx), [src/components/labs/annotation-canvas.stories.tsx](../src/components/labs/annotation-canvas.stories.tsx), [src/components/labs/annotation-canvas.test.tsx](../src/components/labs/annotation-canvas.test.tsx)
- Context check: annotations are app-owned through props/callbacks, but pointer canvas editing has unsettled keyboard/mobile/a11y expectations.
- Follow-up: keep in labs; define keyboard editing and mobile support before any promotion.

### labs/asset-browser

- Decision: keep-labs
- Evidence: [src/components/labs/asset-browser.tsx](../src/components/labs/asset-browser.tsx), [src/components/labs/asset-browser.stories.tsx](../src/components/labs/asset-browser.stories.tsx), [src/components/labs/asset-browser.test.tsx](../src/components/labs/asset-browser.test.tsx)
- Context check: callbacks preserve app-owned upload/open/selection effects, but the component covers a broad asset-management surface with search, selection, preview, and virtualization knobs.
- Follow-up: keep in labs; clarify virtualization and upload affordance contract before promotion.

### labs/component-editor

- Decision: keep-labs
- Evidence: [src/components/labs/component-editor.tsx](../src/components/labs/component-editor.tsx), [src/components/labs/component-editor.stories.tsx](../src/components/labs/component-editor.stories.tsx), [src/components/labs/component-editor.test.tsx](../src/components/labs/component-editor.test.tsx)
- Context check: component authoring/snippet generation is package tooling, not a common consuming-app workflow.
- Follow-up: keep in labs until cross-app consumer need is proven.

### labs/document-viewer

- Decision: promote-later
- Evidence: [src/components/labs/document-viewer.tsx](../src/components/labs/document-viewer.tsx), [src/components/labs/document-viewer.stories.tsx](../src/components/labs/document-viewer.stories.tsx), [src/component-registry.ts](../src/component-registry.ts)
- Context check: document pages/highlights/search/zoom are controlled or presentation state, but test coverage is absent and wide-page behavior needs mobile classification.
- Follow-up: add tests for page change, zoom, search, highlight selection, and state rendering; classify mobile behavior before promotion.

### labs/gantt

- Decision: keep-labs
- Evidence: [src/components/labs/gantt.tsx](../src/components/labs/gantt.tsx), [src/components/labs/gantt/impl.tsx](../src/components/labs/gantt/impl.tsx), [src/components/labs/gantt.test.tsx](../src/components/labs/gantt.test.tsx)
- Context check: read-only task timeline is state-light, but wide timeline geometry and virtualization create a complex public contract.
- Follow-up: keep in labs; define internal-scroll/mobile support and keyboard/a11y expectations before promotion.

### labs/logical-argument

- Decision: promote-later
- Evidence: [src/components/labs/logical-argument.tsx](../src/components/labs/logical-argument.tsx), [src/components/labs/logical-argument.stories.tsx](../src/components/labs/logical-argument.stories.tsx), [src/components/labs/logical-argument.test.tsx](../src/components/labs/logical-argument.test.tsx)
- Context check: read-only display surface is state-light and covered, but the domain vocabulary needs validation before release-blocking support.
- Follow-up: document target use cases and decide whether this is a `stable` display primitive or remains labs.

### labs/query-builder

- Decision: promote-later
- Evidence: [src/components/labs/query-builder.tsx](../src/components/labs/query-builder.tsx), [src/components/labs/query-builder/impl.tsx](../src/components/labs/query-builder/impl.tsx), [docs/design-system.md](./design-system.md)
- Context check: expression editing is state-light and already referenced for nested boolean filters, but schema/operator semantics remain a public API risk.
- Follow-up: clarify expression schema ownership, operator extension rules, validation responsibilities, and mobile layout before moving to `data`.

### labs/terminal

- Decision: change
- Evidence: [src/components/labs/terminal.tsx](../src/components/labs/terminal.tsx), [src/components/labs/terminal.test.tsx](../src/components/labs/terminal.test.tsx), [src/component-registry.ts](../src/component-registry.ts)
- Context check: display primitive is generic, but it has no story coverage and currently uses hard-coded zinc/emerald/amber/red classes as a visual contract.
- Follow-up: add Storybook coverage and decide whether terminal colors are intentionally fixed or should map to semantic tokens.

### labs/timeline

- Decision: change
- Evidence: [src/components/labs/timeline.tsx](../src/components/labs/timeline.tsx), [src/component-registry.ts](../src/component-registry.ts)
- Context check: timeline is a simple state-light display primitive, but it has neither story nor test coverage.
- Follow-up: add stories/tests, then decide whether it should promote to `patterns` or `stable`.

### labs/tree-view

- Decision: promote-later
- Evidence: [src/components/labs/tree-view.tsx](../src/components/labs/tree-view.tsx), [src/components/labs/tree-view.stories.tsx](../src/components/labs/tree-view.stories.tsx), [src/components/labs/tree-view.test.tsx](../src/components/labs/tree-view.test.tsx)
- Context check: selected/expanded state is controlled or presentation state, and ARIA tree semantics are already present.
- Follow-up: run focused keyboard/mobile review and consider promotion after hardening the public contract.

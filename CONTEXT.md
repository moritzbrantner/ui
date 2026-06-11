# Design System

`@moritzbrantner/ui` is the shared design-system context for reusable React UI across the moritzbrantner platform. It provides common language for package-owned UI surfaces and app-owned product behavior.

## Language

**State-light UI**:
Reusable UI that may own local presentation state and interaction affordances, while leaving product workflow state and backend contracts to consuming apps.
_Avoid_: Product workflow, app feature, backend flow

**Consuming App**:
An application or higher-level package that uses `@moritzbrantner/ui` to build a product surface. It owns product data, routing, auth, permissions, persistence, and side effects.
_Avoid_: Host, client app, downstream

**Public Component Tier**:
A named support category for public components that sets import boundaries and compatibility expectations.
_Avoid_: Folder, bucket, group

**Stable Component**:
A reusable primitive or low-level control with the strongest compatibility expectations.
_Avoid_: Base component, common component

**Pattern Component**:
A reusable state-light composition for common application workflows that remains generic across consuming apps.
_Avoid_: Product workflow, feature component

**Focused Tier**:
A public component tier for a narrower surface area such as data, shell, social, or media UI.
_Avoid_: Feature package, app module

**Labs Component**:
A public experimental component whose consumer contract is still settling. It is not unfinished code, but it may change faster than release-blocking tiers.
_Avoid_: Draft component, private component

**Published Theme**:
A supported visual contract for a concrete product surface or surface need.
_Avoid_: Skin, preset, colorway

**Studio Theme**:
A published theme for creative production, editing, media, and generation surfaces.
_Avoid_: Creator brand, media skin

**Pop Theme**:
A published theme that carries Studio's creative language into public-facing creator surfaces with brighter color, rounder polish, and delight-burst feedback.
_Avoid_: Playful consumer skin, Studio replacement, campaign theme

**Pulse Theme**:
A published theme for kinetic interaction surfaces where movement clarifies opening, closing, expansion, collapse, and selection changes.
_Avoid_: Realtime theme, status theme

**Visual Contract**:
The compatibility promise created by public styling behavior, including tokens, slots, layout behavior, and theme presentation.
_Avoid_: Look and feel, styling detail

**Presentation State**:
Transient UI state that exists to render or operate an interface affordance.
_Avoid_: Product state, workflow state

**Workflow State**:
Durable product state that represents a business process, backend lifecycle, permission outcome, or persisted user action.
_Avoid_: UI state, local state

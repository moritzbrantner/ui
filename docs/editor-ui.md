# Editor UI Contract

`@moritzbrantner/ui` is the shared presentation and interaction layer for editor-style applications. Editor repositories keep authority over their documents, selections, commands, persistence, rendering, and domain behavior; the UI package owns reusable controls and workbench interaction patterns that should not be reimplemented per editor.

This contract makes "editor" an explicit UI category rather than relying on the word alone to imply professional editing behavior.

## Ownership Boundary

Belongs in `@moritzbrantner/ui`:

- Exact-value input primitives and state-light combinations of direct and exact manipulation.
- Reusable property/inspector presentation.
- Workbench chrome, resizable panels, tabs, docking affordances, and layout interaction.
- Generic editor toolbars, outliners, status surfaces, command discovery, and keyboard/touch interaction helpers.
- Editor-focused theme tokens and accessibility behavior.

Belongs in an editor repository:

- The authoritative document or scene model.
- Selection meaning and domain-specific object identity.
- Commands, undo/redo semantics, validation, persistence, serialization, and collaboration.
- Rendering, simulation, timeline, graph, geometry, or media semantics.
- Which properties exist, their domain units and constraints, and when an edit is valid.
- Product-specific panel contents and workflow state.

Shared UI components receive controlled values and callbacks. They must not become a second source of truth for editor state.

## Interaction Model

### Exact input is a first-class path

Any numeric value that can affect a durable edit, command, serialized document, coordinate, transform, timing decision, or reproducible output must have an exact input path.

Examples include:

- positions, dimensions, scale, rotation, and camera values;
- timeline positions, durations, in/out points, frame numbers, and ranges;
- numeric effect parameters and thresholds;
- grid, snapping, simulation, or export parameters.

A slider, dial, drag handle, scrubber, gizmo, or canvas gesture may supplement exact entry for fast exploration. It must not be the only input mechanism when an exact value is meaningful.

Use `NumericInput` for exact entry and `Vector2Input`/`Vector3Input` for XY/XYZ values. `AngleInput` combines a dial with this shared exact input; inspector sliders use the same editing behavior.

### Direct manipulation and exact manipulation share one value

Pointer interaction and exact entry are two views of the same controlled value. They should converge on the same validation, snapping, command, and change callbacks rather than maintaining parallel state models.

Direct manipulation is optimized for speed and spatial feedback. Exact input is optimized for deterministic edits. Editors normally need both.

### Precision semantics are explicit

Numeric controls must expose the precision information the domain needs rather than guessing it from presentation:

- unit;
- step;
- coarse/fine adjustment behavior where useful;
- min/max constraints when they are domain constraints;
- display precision separately from authoritative numeric meaning when necessary.

Do not round authoritative editor data merely to match the displayed number of decimal places.

### Keyboard operation is part of the primary workflow

Primary editor operations must be keyboard-completable and commands must remain discoverable. Shortcuts accelerate commands but do not replace visible or searchable command access.

Numeric controls must support keyboard editing. Spatial controls need keyboard alternatives where the operation is part of a primary workflow.

### Touch changes the interaction, not the capability

Touch layouts may replace desktop hover, tiny handles, or keyboard-centric affordances with larger controls, sheets, or gestures. They should preserve the primary editing capability and provide an exact-value path for edits that require precision.

## Workbench And Panel Model

Use the existing shared workbench primitives instead of rebuilding static editor chrome:

- `WorkbenchLayout`, `WorkbenchCanvas`, `WorkbenchPanel`, and `WorkbenchToolbar` for the current state-light editor shell.
- `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` for resizable regions.
- The Studio theme for creative production/editing surfaces unless another established theme better matches the product.

Panel layout state is presentation state. A consuming app may persist it, but it is not part of the edited document unless that product explicitly makes layout part of its domain.

Future docking and tab APIs should extend this model rather than introduce a second editor-shell hierarchy.

## Inspector And Property Model

An inspector presents app-owned selection and property state. The UI package may own reusable property rows, sections, units, validation presentation, reset affordances, and exact input behavior.

The consuming editor owns:

- the selected objects;
- the property schema and domain meaning;
- validation and command creation;
- whether an edit applies immediately, previews, or requires confirmation;
- multi-selection merge/conflict semantics.

Generic shared inspector APIs must remain state-light and controlled.

## Control Selection

- Exact numeric edit: `NumericInput`.
- XY/XYZ edit: controlled `Vector2Input`/`Vector3Input`.
- Angle: `AngleInput`.
- Fast approximate adjustment with a meaningful exact value: direct control plus editable numeric
  input.
- Purely perceptual or intentionally approximate bounded adjustment: a slider may be sufficient.
- Resizable editor regions: existing resizable/workbench primitives.
- Selection properties: controlled inspector/property composition.
- Commands: visible action plus command/shortcut discovery.
- Mobile/touch: a touch-capable equivalent that preserves the edit and exact-value path.

Do not introduce a slider merely because a value is numeric. Choose a slider only when continuous approximate manipulation is itself the intended interaction.

## Information Density

Editor surfaces are work surfaces, not landing pages.

- Prefer compact, task-oriented layouts.
- Do not spend primary space on slogans, generic descriptions, decorative KPI cards, or instructional panels that do not change the user's next action.
- Keep persistent controls close to the content they affect.
- Empty panels should expose useful document state, a concrete action, or be omitted.
- Use visual hierarchy and panel structure to clarify ownership instead of wrapping every group in decorative surfaces.

## Reuse Threshold

Promote an editor control into `@moritzbrantner/ui` when its interaction contract is reusable independently of a specific editor domain. Keep domain-specific controls local until at least the presentation/interaction behavior can be expressed without importing domain models or duplicating domain authority.

This keeps the UI package a design system and interaction toolkit rather than a second application framework.

## Implementation Sequence

1. Define this contract and treat it as the editor UI baseline.
2. Add missing precision/property and editor-shell primitives without duplicating existing `AngleInput`, resizable, workbench, or inspector foundations.
3. Build a canonical reference workbench in Storybook that demonstrates the contract.
4. Migrate one real editor as the proving consumer before broad rollout.
5. Encode the durable cross-repository requirements in coding-agent conventions after the components and pilot validate the contract.

## Numeric Input Behavior

`NumericInput` accepts a controlled `value` and `onValueChange`, or an uncontrolled `defaultValue`. `null` represents an unset controlled value. Vector inputs require controlled readonly tuples and return a new tuple through `onValueChange`; other coordinates retain their authoritative precision.

Set `unit`, `step`, `smallStep`, `largeStep`, `min`, `max`, and `displayPrecision` explicitly where the editor domain requires them. Display precision formats an unfocused field only; focus reveals the full value and named form submission preserves it. The control does not change supplied data merely to match formatting or constraints.

Valid in-range decimal or scientific text emits a finite numeric edit immediately. Empty, incomplete, invalid, or out-of-range text remains a local draft. Enter or blur commits a valid draft within the declared bounds; invalid drafts revert to the accepted value. Escape discards the draft. A consuming app replacement supersedes a stale draft. Clearing an input never emits zero or `NaN`.

Arrow Up/Down uses `step`, Alt uses `smallStep`, and Shift uses `largeStep`. Page Up/Down uses `largeStep`; Home/End uses declared min/max when present. Defaults are step 1, small step one tenth of the step, and large step ten times the step. These increments do not quantize typed values. `AngleInput` keeps its existing circular snapping and wrapping semantics.

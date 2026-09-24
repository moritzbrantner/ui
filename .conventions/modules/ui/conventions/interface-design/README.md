# Interface design conventions

## UI-001 — Use surfaces to communicate structure, not to decorate every section

- Use raised surfaces for meaningful semantic units; otherwise use hierarchy, spacing, headings, separators, lists, tables, or rows.
- Do not turn ordinary counts, statuses, or metadata into decorative metric/KPI cards when the same information is clearer in context.

## UI-002 — Show information where it changes a decision

- Give prominence only to information that changes understanding or next action; do not repeat facts already visible.

## UI-005 — Make primary workflows keyboard-first and commands discoverable

- Make every primary workflow keyboard-completable.
- Use a central, discoverable command registry; shortcuts accelerate commands but are never their only access.

## UI-006 — Make interactive data views accessible and shareable

- Use charts only when interaction adds understanding; provide equivalent structured values.
- Make durable non-sensitive view state deep-linkable on shareable platforms.

## UI-007 — Make primary workflows work on touch and mobile

- Preserve primary tasks, hierarchy, state, and required actions on representative mobile and touch input.

## UI-008 — Make numeric editor controls precision-first

- Provide directly editable numeric values for precision-sensitive parameters, including dimensions, position, rotation, timing, cuts, simulation settings, and effect parameters. Do not use slider-only controls; a value label or tooltip is not exact entry.
- Sliders, dragging, handles, and scrubbers may supplement exact entry for coarse adjustment. Keep coarse and precise controls synchronized to the same authoritative value: dragging updates the editable value, typing an exact value updates the coarse control without quantizing it, and neither interaction creates a second source of truth.
- Keep units visible and make keyboard entry and fine adjustment available. Choose domain-appropriate precision, bounds, and increments; a slider's coarse step must not silently quantize an exact typed value. Integer counts and frame-aligned time are explicit domain constraints, not accidental slider restrictions.
- Preserve incomplete editing drafts without committing an empty string as zero, NaN, or an unintended intermediate value. Validate finite values and bounds before committing, support cancel/revert, and keep all input methods synchronized with the same authoritative state.
- Test exact fractional and negative entry, invalid/empty drafts, boundaries, keyboard commits/cancellation, and synchronization after presets or external changes. Reuse the shared numeric control where available rather than duplicating parsing and commit policy in every editor.
- Exception: purely coarse preference controls may remain sliders when exact values do not affect the task. Timeline scrubbing remains a direct manipulation affordance, but editing cut points and selecting exact frames still require precise entry or frame-step commands.

## UI-009 — Make functional screens task-first, not promotional

- On representative target viewports, put the primary task, current content or state, and frequent actions before generic introductions.
- Do not spend recurring workflow screens on hero slogans, marketing-style copy, product pitches, decorative banners, or generic explanatory prose.
- Prefer compact, scannable layouts. Whitespace and framing must improve hierarchy rather than push useful controls or results below the fold.
- Move architecture, implementation, privacy, or product explanation to documentation, help, or about surfaces unless it changes an immediate consent decision or next action.

## UI-010 — Make persistent UI earn its space

- Every persistent navigation item, toolbar control, panel, badge, or card must support a recurring task, a real destination, or decision-relevant state.
- Do not ship placeholder or unimplemented navigation, decorative controls, redundant chrome, or permanently visible status content that users cannot act on.
- Prefer fewer stable destinations to speculative app shells; surface secondary tasks contextually when they become relevant.

## UI-011 — Make empty states operational

- State what is absent and expose the most likely next action.
- Keep empty-state copy concise; do not turn empty states into marketing or generic onboarding explanations unless onboarding is itself the task.
- Reuse the normal creation, import, or discovery action instead of inventing an empty-state-only workflow.

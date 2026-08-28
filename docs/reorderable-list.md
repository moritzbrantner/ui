# Reorderable list implementation

`ReorderableList` currently uses `@dnd-kit/react` for sortable interaction. The implementation deliberately treats reordering as the product-neutral capability and dragging as one input method: consumers receive a controlled reorder callback, while dnd-kit provides pointer, touch, handle, and keyboard interaction semantics.

## Scope

The initial component is intentionally limited to flat lists with stable item IDs. Persistence, optimistic updates, server ordering, conflict resolution, and product workflows stay in consuming applications.

## Motion follow-up

Motion remains a candidate for a future implementation experiment because it is already part of this package. Do not replace dnd-kit solely to remove a dependency. Revisit the choice only when a Motion-based prototype can preserve the same public API and match the established keyboard reordering, focus behavior, touch/scroll behavior, drag-handle semantics, cancellation behavior, and reduced-motion expectations.

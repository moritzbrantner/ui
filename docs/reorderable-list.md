# Reorderable list implementation

`ReorderableList` currently uses `@dnd-kit/react` for sortable interaction. The implementation deliberately treats reordering as the product-neutral capability and dragging as one input method: consumers receive a controlled reorder callback, while dnd-kit provides pointer, touch, handle, and keyboard interaction semantics.

## Scope

The initial component is intentionally limited to flat lists with stable item IDs. Persistence, optimistic updates, server ordering, conflict resolution, and product workflows stay in consuming applications.

## Interaction contract

- `ReorderHandle` is the activation target. Buttons, links, inputs, and other interactive children elsewhere in the item remain normal controls rather than accidental drag targets.
- Keyboard users can focus the handle and use dnd-kit's keyboard sensor to pick up, move, and drop the item. Cancelling an operation does not emit `onReorder`.
- Pointer and touch dragging use the same handle. The handle disables browser touch gestures only on its own hit area so the surrounding list remains scrollable.
- Disabled items expose a disabled handle and cannot start a reorder operation.
- Consumers should use stable item IDs and update the rendered indexes after every accepted reorder.

## Persistence

`onReorder` reports the stable item ID plus its previous and next indexes. The UI package does not save that order. A consuming application can update local state optimistically, persist the resulting order through its mutation layer, and restore the previous state if persistence fails. Storybook includes a rollback example so this boundary remains testable without adding network behavior to the component.

## Motion follow-up

Motion remains a candidate for a future implementation experiment because it is already part of this package. Do not replace dnd-kit solely to remove a dependency. Revisit the choice only when a Motion-based prototype can preserve the same public API and match the established keyboard reordering, focus behavior, touch/scroll behavior, drag-handle semantics, cancellation behavior, and reduced-motion expectations.

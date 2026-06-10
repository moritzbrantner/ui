# State-light UI owns presentation, apps own workflows

`@moritzbrantner/ui` is a shared design-system package, not a product application layer. We will keep package components state-light: they may own reusable visual structure, presentation state, interaction affordances, theme tokens, and controlled callbacks, while consuming apps own routing, auth, data fetching, persistence, permissions, analytics, backend contracts, durable records, and workflow state machines.

This preserves cross-app reuse without baking one product's lifecycle or backend model into a public package that must remain semver-safe for registry consumers.

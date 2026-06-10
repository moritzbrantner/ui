# Keep a tiered public API

The package exposes stable primitives and generic patterns through the root API, while focused tiers such as data, shell, social, media, and labs stay behind explicit subpath imports. We considered expanding root exports for convenience and splitting focused tiers into separate packages, but the tiered API keeps common imports ergonomic while preserving bundle discipline and separate support expectations.

Labs remains public but experimental: components move into release-blocking tiers only after their API shape, stories, tests, mobile behavior, and app-owned boundaries are mature.

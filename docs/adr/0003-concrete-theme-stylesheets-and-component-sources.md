# Split concrete theme stylesheets from component sources

Apps should import exactly one concrete package stylesheet for their selected visual surface and add the component source stylesheet when they render package components. We keep this split so theme-only consumers can stay lean, while component consumers still get the Tailwind source coverage needed for package-rendered class names.

This makes published themes stable product-surface contracts rather than casual skins, and it avoids coupling every single-theme stylesheet to all package component source scanning.

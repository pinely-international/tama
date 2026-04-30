# Tama.js

Tama is a rootless UI rendering library built around direct DOM inflation, observable values, and replaceable primitives.
It is designed to feel familiar to React developers while keeping state, routing, lifecycle, and rendering as separate parts.

## Start Here

- [Getting Started](./learn/learn.md)
- [Building Apps](./learn/how-to-use/building-apps.md)
- [App Readiness Audit](./app-readiness-audit.md)
- [Specification](./specification.md)

## Core Ideas

- Components run once instead of rerendering on every state change.
- JSX inflates directly to DOM nodes or component-managed node groups.
- Any observable-like source can drive text, attributes, styles, and views.
- Routing, state modeling, and lifecycle stay modular rather than built in.
- Most behavior can be extended through classes, inflator adapters, and custom JSX attributes.

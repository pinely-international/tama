# `ComponentGroup`

When Tama inflates `<Component />`, the result is not required to be a single DOM element.
Instead, the component is represented by a component-managed insertion group.

That group is what lets Tama support:

- components without a single root element
- `null` views
- later `this.view.set(...)` swaps
- async and generator-based views

## Why It Exists

In React, a component usually resolves into a virtual tree that is reconciled later.
In Tama, the inflator works with real DOM nodes immediately.

To keep a stable attachment point for a component while still allowing its inner view to change, Tama wraps the component output in a node-group abstraction.

## Practical Consequences

- `inflator.inflate(<Component />)` may not give you a plain `HTMLElement`
- a component can render many sibling nodes without an extra wrapper
- when the component view becomes empty, the group can still preserve its place in the tree
- if you need a concrete DOM element, put a `ref` on that element rather than on the component as a whole

## Example

```tsx
function HeaderAndBody() {
  return (
    <>
      <header>Title</header>
      <main>Content</main>
    </>
  )
}

const inflator = new WebInflator
const view = inflator.inflate(<HeaderAndBody />)

document.body.append(view)
```

The inflated value is the component group that manages those sibling nodes.

## Relation To View Swapping

When you call `this.view.set(...)`, Tama keeps the component group stable and replaces the currently active inner children.
That is why a component can transition from one layout to another without having to own a wrapper element.

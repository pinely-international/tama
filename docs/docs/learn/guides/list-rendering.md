---
sidebar_position: 6
---

# List Rendering

Tama accepts arrays and iterables directly as children.
That makes list rendering easy to start with, but it is important to understand that the update model is not React's keyed reconciliation.

## Static Lists

Plain arrays work exactly as you would expect.

```tsx
<ul>
  {[1, 2, 3].map(item => <li>{item}</li>)}
</ul>
```

## Observable Lists

For lists that change over time, `StateArray` is the most convenient default from `@denshya/reactive`.

```tsx
import { StateArray } from "@denshya/reactive"

const items = new StateArray(["Milk", "Bread"])

function ShoppingList() {
  const rows = items.map(item => <li>{item}</li>)
  return <ul>{rows}</ul>
}
```

## Important Difference From React/Solid

When an iterable child source updates, Tama reinflates the next collection and replaces the previous rendered children as a whole.

That means:

- there is no built-in `key` prop contract
- list updates are not diffed item-by-item in the React sense
- DOM identity is only preserved if you preserve it yourself

## What To Do In Practice

The short version: use `StateArray` when the list itself is mutable, use `State` plus a new array value when you want to replace the whole list, and move row-specific state into stable model objects when item identity must survive list changes.

### Prefer `StateArray` For Mutable Collections

Use `StateArray` when you want list mutations such as `push`, `splice`, or `sort` to trigger updates directly.

```tsx
const items = new StateArray(["A", "B"])

items.push("C")
items.splice(1, 1)
```

### Replace Plain Arrays Explicitly

If a list lives inside `State`, treat the array as immutable. Build a new array and assign it back whenever the contents change.

```tsx
const items = new State(["A", "B"])

items.set(current => [...current, "C"])
```

### Keep Item State Outside The Rendered Row When Identity Matters

If a row needs to preserve local state, animation state, focus, or unmanaged DOM across list changes, store the row data in objects keyed by `id` instead of relying on row position.

```tsx
class TodoItem {
  constructor(readonly id: string, readonly title: State<string>) {}
}

const todos = new StateArray<TodoItem>([])

function TodoList() {
  return <ul>{todos.map(todo => <TodoRow todo={todo} />)}</ul>
}
```

## When Whole-List Replacement Is Fine

Whole-list replacement is often completely acceptable for:

- small lists
- filtered and sorted views
- admin tools
- dashboards where row identity is already modeled in store objects

It becomes more important to think about identity when you need preserved DOM state across frequent list changes like List Virtualization, but most of the time, the simplicity of whole-list replacement is a good tradeoff.

> *Premature optimization is the root of all evil. Start with the simplest thing that works, and only optimize if you have a real problem.*

## Related Guides

- [Building Apps](../how-to-use/building-apps.md)
- [Custom State](../custom/state.md)
- [Pre-inflation](./pre-rendering.md)

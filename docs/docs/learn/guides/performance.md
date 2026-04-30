---
sidebar_position: 17
---

# Performance

Tama performance work starts from a different baseline than React.
Components run once, and observable updates patch the DOM directly instead of triggering a rerender pass for the whole component.

That changes which optimizations matter.

## The First Rule

Measure before optimizing.

The most common Tama performance issues are not "too many rerenders".
They are usually:

- replacing large observable lists too often
- keeping too much data in one state object
- moving cached DOM unintentionally by reusing the same JSX object in multiple places
- doing expensive work in subscriptions that should live in derived state or model classes

## Use State Granularity Intentionally

Prefer state shaped around independent updates.

### Good

```tsx
const name = new State("")
const email = new State("")
const pending = new State(false)
```

### Heavier Than Needed

```tsx
const form = new State({
  name: "",
  email: "",
  pending: false,
})
```

The second pattern still works, but every whole-object replacement can trigger more downstream work than necessary.

If you do keep grouped state, prefer property selectors such as `state.$.field` or derived state with `.to(...)`.

## Derived State Beats Repeated Imperative Work

If a value depends on other reactive values, compute it once as derived state instead of recalculating it from multiple subscriptions.

```ts
const subtotal = new State(50)
const tax = new State(10)

const total = State.combine([subtotal, tax], (subtotal, tax) => subtotal + tax)
```

This keeps update paths explicit and easier to test.

## Timing Sacrifice

If a computed value or side-effect depends on multiple sources, it may be unintentionally triggered multiple times during updates.

In case if recieved updates cause unrelated effects or negatively impact performance, you can use `State.batch` to defer updates until the end of the batch.

```ts
const total = State.combine([subtotal, tax], (subtotal, tax) => subtotal + tax)
```

## Lists Are The Main Performance Boundary

Tama accepts iterables directly, but iterable updates are replaced as a whole.
There is no built-in keyed reconciliation contract.

That means list performance depends heavily on how you model identity.

### Prefer `StateArray` For Mutable Collections

```tsx
const products = new StateArray<Product>([])
```

### Keep Row Identity In Model Objects

```tsx
class ProductRowModel {
  constructor(
    readonly id: string,
    readonly title: State<string>,
    readonly price: State<number>,
  ) {}
}

const rows = new StateArray<ProductRowModel>([])
```

### Avoid Replacing Huge Lists For Tiny Item Changes

If only one item changed, prefer changing the state inside that item model instead of rebuilding the whole rendered list from plain objects.

## Reuse JSX Cache Intentionally

`WebInflator` caches inflated output per JSX object identity.
That is useful for repeated view swaps and pre-inflated layouts.

```tsx
const loadingView = <div>Loading...</div>

function Panel(this: Tama.Component) {
  this.view.set(loadingView)
}
```

But the same mechanism can surprise you if you reuse one JSX object in multiple places at the same time.
The cached node is the same DOM node, so attaching it elsewhere moves it.

### Good Use

- swapping between a small number of repeated views
- pre-inflating a layout used by one active branch at a time

### Risky Use

- returning the exact same JSX object from multiple concurrently mounted components

If you need distinct DOM instances, create fresh JSX values instead of reusing one cached object.

## Pre-Inflate When Swapping The Same Views Repeatedly

If a shell toggles between a few stable layouts, pre-inflating them can reduce repeated inflation work.

```tsx
function Shell(this: Tama.Component) {
  const summaryView = this.inflator.inflate(<section>Summary</section>)
  const detailsView = this.inflator.inflate(<section>Details</section>)

  this.view.set(summaryView)
}
```

Use this only when the same view instances are intentionally reused.

## Keep Expensive Side Effects Out Of Render Wiring

Tama components run once, so you can create functions freely inside them.
The performance risk is usually not function allocation.
It is doing heavy work inside subscriptions or event handlers that should live in:

- derived state
- store classes
- explicit lifecycle routines

## Mount Only What Matters

Conditional mounting is one of the easiest wins.
If a large subtree is not needed, keep it unmounted instead of hidden.

```tsx
<aside mounted={sidebarVisible}>...</aside>
```

This avoids keeping expensive DOM and lifecycle work alive unnecessarily.

## Validate Performance With Focused Tests

For performance-sensitive features, add tests for the behavior that matters:

- list replacement boundaries
- async view transitions between loading and ready states
- mount and unmount behavior for expensive regions

Then benchmark separately when the numbers matter.

## Practical Checklist

1. keep frequently changing values in granular state
2. use derived state instead of duplicated subscription logic
3. model list item identity explicitly
4. reuse cached JSX only when you really want the same node instance
5. unmount large inactive regions instead of just hiding them

Related guides:

- [List Rendering](./list-rendering.md)
- [Pre-inflation](./pre-rendering.md)
- [Testing](./testing.md)

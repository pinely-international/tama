---
sidebar_position: 5
---

# Custom State

Tama does not require `@denshya/reactive`.
It only needs values that match the small contracts the inflator understands.

## Minimum Useful Shape

For most UI work, a custom state object should expose:

- `subscribe(next)` so Tama can react to updates
- `get()` so Tama can read the current value immediately
- `set(...)` if the value should be writable from the DOM or from app logic

```ts
class State<T> {
  private value: T
  private readonly listeners = new Set<(value: T) => void>()

  constructor(initialValue: T) {
    this.value = initialValue
  }

  get() {
    return this.value
  }

  set(nextValue: T) {
    this.value = nextValue
    this.listeners.forEach(listener => listener(nextValue))
  }

  subscribe(listener: (value: T) => void) {
    this.listeners.add(listener)

    return {
      unsubscribe: () => void this.listeners.delete(listener)
    }
  }
}
```

## Where It Works

With a shape like that, Tama can use the value in:

- text children
- DOM properties such as `value`, `hidden`, or `disabled`
- attributes such as `src`, `href`, and ARIA fields
- style objects
- conditional mounting through guards

```tsx
const title = new State("Tama")
const pending = new State(false)

<h1>{title}</h1>
<button disabled={pending}>Save</button>
```

## Writable Inputs

If a bound value is writable, Tama can sync it in both directions on supported form controls.

```tsx
const email = new State("")

<input value={email} />
```

That pattern is the reason `set(...)` is strongly recommended even though read-only sources are still useful.

## Guarded Values

Tama also supports guarded values for conditional mounting.
The simplest option is to keep using `Mount.If(...)` and `Mount.Unless(...)`, but your own state objects can also participate if they expose a compatible guard.

```tsx
<img src={Mount.If(imageUrl)} alt="preview" />
```

Moreover, you can extend regular state objects to have a `required` getter that returns a guard, so you can use them directly without wrapping.

```tsx
class GuardedState<T> extends State<T> {
  get required() { return Mount.If(this) }
}

function Component() {
  const value = new GuardedState<string | null>("Hello")

  return (
    <div>
      <span>{value.required}</span>
      <button on={{ click: () => value.set(null) }}>Clear</button>
    </div>
  )
}
```

## Third-Party Stores

If your source library does not match Tama directly, wrap it instead of forcing Tama-specific behavior into the library itself.

Good wrappers usually:

- subscribe to the original store
- expose `get()` for the current snapshot
- optionally expose `set(...)` for writable sources

That keeps Tama modular and lets the same state source work in other environments.

## Implicit Subscription Disposal

JavaScript's garbage collection handles subscription cleanup implicitly in isolated components, but if you have a long-lived component that subscribes to external stores, you may want to implement explicit disposal to prevent memory leaks.

To make this simpler, you can use a helper API in Tama Components:

```tsx
const externalState = new State("initial")
function Component(this: Tama.Component) {
  function someUpdate() {
    // ...
  }

  // Automatically unsubscribes when the component is disposed.
  this.disposal.add(externalState.subscribe(someUpdate))

  return <div>...</div>
}
```

## Explicit Lifecycle Management

As implicit component disposal may be too ambiguous for some use cases, you can also hook the lifecycle of your component directly to manage subscriptions.

To hook to the lifecycle, you can use the element `ref` attribute and observers like `ResizeObserver` or `IntersectionObserver` to detect when the component is mounted or unmounted:

```tsx
function Component() {
  const mounted = new Set(false)

  function ref(element: HTMLElement) {
    const resizeObserver = new ResizeObserver(() => mounted.set(element.isConnected)).observe(element)

    return () => resizeObserver.disconnect()
  }

  return <div ref={[]}>...</div>
}
```

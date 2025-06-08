---
sidebar_position: 3
---

# Reactivity

[WICG Observable (Web Standard)](https://github.com/WICG/observable)

Proton adopts observable as another primitive. Any object that has `Symbol.subscribe` considered to be an observable.

Beyond that, it treats any object that has either `get` or `set` to be an accessor. Which can be combined with observable, getting an **Observable Accessor**.

> It might seem to be a problematic decision considering `Map` and `Set` built-ins, but this is a start to solving it and in practice it's almost never a problem.

---

There is no built-in state manager (in the library), Proton only handles Observables as is. Now creating data flows is your problem :) Joking, it always was, now it's separated from the "framework", so you can use any library that supports Observables. Like the one Denshya has - [Reactive](https://github.com/denshya/reactive).

```tsx
const regularText = "Static Value"
const observableText = {
  i: 0,
  get: () => "Initial",
  [Symbol.subscribe](next) {
    setInterval(() => next("Next: " + this.i++))
  }
}
```

## Custom State

To implement a state, all you need is this simple snippet.

```ts
class State<T> {
  private readonly callbacks = new Set<(value: T) => void>()
  private value: T

  constructor(initialValue: T) { this.value = initialValue }

  get(): T { return this.value }
  set(value: T): void {
    this.value = value
    this.dispatch(value)
  }

  private dispatch(value: T) {
    this.callbacks.forEach(callback => callback(value))
  }

  [Symbol.subscribe](next: (value: T) => void) {
    this.callbacks.add(next)
    return { unsubscribe: () => void this.callbacks.delete(next) }
  }
}
```

In practice it looks like this

```tsx
function ProductCard() {
  const title = new State("Title")
  const image = new State("Image source")

  return (
    <>
      <div className="product-card__title">{title}</div>
      <img className="product-card__image" src={image} alt="Preview" />

      <input value={title} />
      <input value={image} />
    </>
  )
}
```

To get started faster with this, try [`Reactive`](https://github.com/denshya/reactive) state library.

> [!NOTE]
> Observables are now implemented in Browsers. They can be used as it without any updates.
>
> ```tsx
> <div style={{ left: window.when("scroll").map(event => event.y + "px") }} />
> ```
>
> [Example Playground](https://stackblitz.com/edit/vitejs-vite-uepaaxp1?file=src%2FApp.tsx)

### Dual binding

Some elements may have binding in **two directions**, which means that [state **updates** element] and [element **updates** state].

This is common for user input elements just like `input` and `textarea`.

If you're using [`Reactive`](https://github.com/denshya/reactive) library, you can avoid this behavior with `readonly` method.

```tsx
function ProductCard() {
  const title = new State("Title")

  return (
    <>
      // User inputs won't update the `title`.
      <input value={title.readonly()} />
      // User inputs WILL update the `title`.
      <input value={title} />
    </>
  )
}

```

## Using `@denshya/reactive`

### `StateArray`

```tsx
import { State, StateArray } from "@denshya/reactive"
```

```tsx
function App() {
  const choice = new State(0)
  const items = new StateArray(Array(3).fill(0))

  setInterval(() => items.set(Array(Math.floor(Math.random() * 15)).fill(0)), 1000)

  return (
    <div>
      {items.map((_, index) => (
        <button disabled={choice.is(index)} on={{ click: () => choice.set(index) }}>{index}</button>
      ))}
    </div>
  )
}
```

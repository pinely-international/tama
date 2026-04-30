---
sidebar_position: 1
---

# Hooks

Tama does not ship React-style hooks.

That is not an omission in the sense of an unfinished `useState` clone.
It follows from the runtime model: Tama components run once, so there is no rerender loop that hook calls need to synchronize with.

## React Mental Mapping

| React hook | Tama replacement |
| --- | --- |
| `useState` | an observable state object such as `State` |
| `useEffect` | a direct function call, or `Lifecycle` plus `MountObserver` |
| `useContext` | `this.tree.context.provide(...)` and `this.tree.context.require(...)` |
| `useMemo` | a regular `const`, or a derived observable if the value must stay live |
| `useCallback` | a regular function declared once in the component |
| custom hooks | store classes, helper factories, or reusable state functions |

## Local Reusable Logic

If you would normally write a custom hook, prefer one of these patterns.

### Plain Factory Function

```tsx
import { State } from "@denshya/reactive"

function createCounter(initial = 0) {
  const count = new State(initial)

  return {
    count,
    increment: () => count.set(value => value + 1),
    decrement: () => count.set(value => value - 1),
  }
}

function CounterCard() {
  const counter = createCounter()

  return (
    <button type="button" on={{ click: counter.increment }}>
      {counter.count}
    </button>
  )
}
```

### Store Class

```tsx
import { State } from "@denshya/reactive"

class SessionStore {
  readonly user = new State<{ name: string } | null>(null)

  signOut() {
    this.user.set(null)
  }
}
```

Use this when the logic is shared across a subtree or across screens.

### Explicit Lifecycle Object

```tsx
import { Lifecycle, MountObserver, Ref } from "@denshya/proton"

function SearchField() {
  const inputRef = new Ref<HTMLInputElement | null>(null)
  const focusLifecycle = new Lifecycle(() => {
    inputRef.current?.focus()
  })

  return <input ref={[inputRef, MountObserver.with(focusLifecycle)]} />
}
```

## If You Still Want Hook-Like APIs

You can wrap these patterns in functions that begin with `use`, but they are ordinary functions, not a special Tama runtime feature.
There is no call-order contract like in React, and there are no Rules of Hooks enforced by Tama.

## Recommendation

Prefer framework-agnostic reusable logic where possible.
In Tama, that usually means:

- observable state classes
- small factories that return state and commands
- tree context for long-lived services
- `Lifecycle` only when work is tied to a mounted node

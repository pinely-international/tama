---
sidebar_position: 1
---

# Building Apps

You can build the same kinds of apps in Tama that you would normally build in React.
The main difference is that Tama keeps state, lifecycle, routing, and data fetching as separate primitives.

## The Shift From React

| If you reach for... | In Tama, use... |
| --- | --- |
| `useState` | an observable state object such as `State` from `@denshya/reactive` |
| `useEffect` | an explicit function call, or `Lifecycle` plus `MountObserver` when the work is tied to a DOM node |
| `useContext` | `this.tree.context.provide(...)` and `this.tree.context.require(...)` |
| `lazy()` and `Suspense` | async components, async generators, and `this.view.set(...)` loaders |
| route components | any router that exposes observable route state |

## Local State

```tsx
import { State } from "@denshya/reactive"

function CounterCard() {
  const count = new State(0)
  const label = count.to(count => count === 1 ? "click" : "clicks")

  return (
    <section>
      <button type="button" on={{ click: () => count.set(value => value + 1) }}>
        {count} {label}
      </button>
    </section>
  )
}
```

Because the component runs only once, creating state inside the component body is safe.

## Forms

Use observables for field values and errors.
You do not need a built-in form abstraction unless your app benefits from one.

For a fuller example with multiple fields, validation, and submit state, continue with the [Forms guide](./forms.md).

```tsx
import { State } from "@denshya/reactive"

function NewsletterForm() {
  const email = new State("")
  const error = new State("")
  const isSubmitting = new State(false)

  const submit = async (event: Event) => {
    event.preventDefault()
    error.set("")

    if (!email.get().includes("@")) {
      error.set("Please enter a valid email address")
      return
    }

    isSubmitting.set(true)
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email: email.get() }),
      })
    } finally {
      isSubmitting.set(false)
    }
  }

  return (
    <form on={{ submit }}>
      <input value={email} />
      {error.to(message => message ? <p>{message}</p> : null)}
      <button disabled={isSubmitting}>Join</button>
    </form>
  )
}
```

## Async Data

The most direct pattern is to keep request state explicit.

```tsx
import { State } from "@denshya/reactive"

type User = { id: string; name: string }

function UsersPage() {
  const users = new State<User[]>([])
  const status = new State<"idle" | "loading" | "ready" | "error">("idle")

  const load = async () => {
    status.set("loading")
    try {
      const response = await fetch("/api/users")
      users.set(await response.json())
      status.set("ready")
    } catch {
      status.set("error")
    }
  }

  void load()

  return status.to(state => {
    if (state === "loading") return <div>Loading...</div>
    if (state === "error") return <button on={{ click: load }}>Retry</button>

    return <ul>{users.get().map(user => <li>{user.name}</li>)}</ul>
  })
}
```

For larger apps, move this logic into a store or resource class and provide it through tree context.

## Shared Services And Context

Context is class-based.
Instead of creating a string key or React context object, you provide an instance and require it later.

```tsx
class SessionStore {
  readonly user = new State<{ name: string } | null>(null)
}

function AppShell(this: Tama.Component) {
  this.tree.context.provide(new SessionStore())
  return <Dashboard />
}

function Dashboard(this: Tama.Component) {
  const session = this.tree.context.require(SessionStore)
  return <h1>{session.user.to(user => user?.name ?? "Guest")}</h1>
}
```

## Layout Swaps And Shells

When the whole layout needs to change, use `this.view.set(...)` instead of introducing extra indirection.

```tsx
function Panel(this: Tama.Component) {
  this.view.set(<div>Summary</div>)

  setTimeout(() => {
    this.view.set(<div>Details</div>)
  }, 500)
}
```

## Routing

Tama does not impose a router.
That keeps routing replaceable, which matches the rest of the library.

- For small apps, a `State<URL>` plus `URLPattern` is enough.
- For file-based or shared routing, use `@denshya/router` and `@denshya/navigation`.
- The docs app and demo app both use this style.

Continue with the [Routing guide](./router.md).

## Lists

Tama accepts arrays and iterables directly as children.
For changing collections, prefer `StateArray` or explicit array replacement through `State.set(...)`.

The important difference from React is that iterable updates are replaced as a whole rather than keyed and reconciled item-by-item.

Continue with the [List Rendering guide](../guides/list-rendering.md).

## A Good Default Architecture

1. Keep domain data in observable store classes.
2. Use components for view composition and event wiring.
3. Provide long-lived stores through tree context.
4. Keep async request state explicit unless a dedicated library clearly helps.
5. Treat `this.view` as the shell-level tool for screen and layout swaps.

## Next Steps

- [Forms](./forms.md)
- [Routing](./router.md)
- [SSR](./ssr.md)
- [Hydration And Client Pickup](./hydration.md)
- [List Rendering](../guides/list-rendering.md)
- [Performance](../guides/performance.md)
- [Testing](../guides/testing.md)
# Routing

Tama does not ship a built-in router.
That is intentional: route state stays replaceable, just like state management and lifecycle helpers.

## Small Apps: A Tiny Router Is Enough

The `demos/simple` example uses a tiny router based on `State`, `history.pushState`, and `URLPattern`.

```tsx
import { State, StateOrPlain } from "@denshya/reactive"
import { Tama } from "@denshya/proton"

class WebNavigation {
  readonly current = new State(new URL(window.location.href))
  readonly result = new State<URLPatternResult | null>(null)

  constructor() {
    window.addEventListener("popstate", () => {
      this.current.set(new URL(window.location.href))
    })
  }

  navigate(path: string) {
    const url = new URL(path, window.location.origin)
    window.history.pushState(null, "", url)
    this.current.set(url)
  }

  test(pathPattern: string) {
    const result = new URLPattern(`*://*:*${pathPattern}`).exec(this.current.get())
    this.result.set(result)
    return result != null
  }
}

const navigation = new WebNavigation()

export class RouteContext extends State<URLPatternResult | null> { }

export function Route(this: Tama.Component, props: { path: string; children: unknown }) {
  let view: unknown
  let context: RouteContext | null = null

  const update = () => {
    if (!navigation.test(props.path)) return this.view.set(null)

    context ??= this.tree.context.provide(new RouteContext(null))
    context.set(navigation.result.get())

    view ??= this.inflator.inflate(props.children)
    this.view.set(view)
  }

  update()
  navigation.current.subscribe(update)
}

export function Link(props: { to: StateOrPlain<string>; children: unknown }) {
  return (
    <a
      href={props.to}
      on={{
        click: event => {
          event.preventDefault()
          navigation.navigate(State.get(props.to))
        },
      }}
    >
      {props.children}
    </a>
  )
}
```

This is already enough for a real application shell.

## Reusable Packages: `@denshya/router` + `@denshya/navigation`

For larger apps, the Denshya stack already includes small reusable packages for matching and navigation state.

### Route matching with `PathRouter`

```ts
import { PathRouter } from "@denshya/router"

const router = new PathRouter<() => Promise<unknown>>()

router.routes.push(
  { pattern: "/", filePath: "home", resource: () => import("./pages/home") },
  { pattern: "/products/:id", filePath: "product", resource: () => import("./pages/product") },
  { pattern: "/404", filePath: "404", resource: () => import("./pages/404") },
)
```

### Browser state with `RouteNavigation`

```ts
import { RouteNavigation } from "@denshya/navigation"

const navigation = new RouteNavigation(router)
```

`RouteNavigation` exposes:

- `match` as reactive route state
- `location` as reactive `URL` state
- `navigate(...)` for history updates
- `resolve(...)` and `toResolved(...)` for link building
- `isWithin(...)` and `whenWithin(...)` for active link logic

### Loading the current page

```tsx
function App() {
  const pageModule = navigation.match.to(match => match?.route.resource())

  async function* CurrentPage() {
    for await (const module of State.asyncIterableOf(pageModule)) {
      yield <module.default />
    }
  }

  return <CurrentPage />
}
```

This is close to the pattern used by the docs app in this repository.

## Reading Route Params

Because route matches are stored in context, children can consume params without prop-drilling.

```tsx
function ProductPage(this: Tama.Component) {
  const route = this.tree.context.require(RouteContext)
  const productId = route.to(route => route.pathname.groups.id)

  return <h1>Product: {productId}</h1>
}
```

## Bigger Apps

When you want file routing or shared router primitives, use the Denshya router packages:

- `@denshya/router` for route matching and file-path routing
- `@denshya/navigation` for navigation state and adapters

The docs app in this repository uses those packages to turn markdown files into routable pages.

One current implementation detail to keep in mind: `RouteNavigation` expects your router layer to provide a `404` route.

## Why Tama Works Well With Custom Routers

- Components only run once, so route listeners are easy to reason about.
- Route context is just tree context, so nested pages can read params directly.
- Async page components make route-level loading straightforward.
- `this.view.set(...)` gives layout shells a direct way to swap sections.

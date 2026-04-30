# Code Splitting

Tama does not need a special built-in lazy component.
Because components may be async, thus route-level and component-level code splitting can be done with a small helper.

## Component Level

```tsx
import { Tama } from "@denshya/proton"

function lazy<T extends JSX.ElementTypeConstructor>(importFactory: () => Promise<{ default: T } | T>) {
  return async function Lazy(this: Tama.Component) {
    this.view.set(<div>Loading...</div>)

    const Module = await importFactory() as { default?: T }
    if (Module.default) return <Module.default />

    return <Module />
  }
}

const SettingsPage = lazy(() => import("./SettingsPage"))
```

The component runs once, so the dynamic import is only triggered once for that inflated instance.

## Route Level

This pattern works especially well in route shells.

```tsx
const HomePage = lazy(() => import("./routes/HomePage"))
const AccountPage = lazy(() => import("./routes/AccountPage"))

function App() {
  return (
    <>
      <Route path="/"><HomePage /></Route>
      <Route path="/account"><AccountPage /></Route>
    </>
  )
}
```

## Async Generator Alternative

If you want an explicit loading phase without using `this`, use an async generator component.

```tsx
async function* AccountPage() {
  yield <div>Loading...</div>

  const module = await import("./AccountPageView")
  return <module.default />
}
```

## When To Use It

- split routes that are not needed for first paint
- split heavy editors, dashboards, and settings sections
- keep shared layout code in the main bundle and defer page bodies

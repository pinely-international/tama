# View Transitions

The current Tama source tree contains transition-related work, but the checked-in public `ViewAPI` in this checkout does not expose `this.view.transitions` as a stable documented app API yet.

Treat transition queues as experimental for now.

## What To Use Today

If you want browser View Transitions today, integrate the native API manually around the state change you control.

```tsx title="Dashboard.tsx"
import { State } from "@denshya/reactive"

const screens = ["Home", "Profile", "Settings"] as const

function Dashboard() {
  const index = new State(0)

  function nextScreen() {
    const update = () => index.set(value => (value + 1) % screens.length)

    if ("startViewTransition" in document) {
      document.startViewTransition(update)
      return
    }

    update()
  }

  return (
    <main className="dashboard">
      <button type="button" on={{ click: nextScreen }}>Next screen</button>
      {index.to(value => <section className="screen">{screens[value]}</section>)}
    </main>
  )
}
```

This keeps the transition logic in ordinary app code and avoids depending on internal transition queue wiring that is still settling.

## Current Status

- transition-related source files and specs exist in the repository
- the public guide should not assume `this.view.transitions` is available on the current `ViewAPI`
- for now, prefer manual browser View Transition integration or ordinary CSS animation around explicit state changes

For normal screen swaps without browser transitions, continue with [Changing Views](./changing-views.md).

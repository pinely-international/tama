---
title: View Transition Playground
sidebar_position: 5
---

Use the [Tama Elements StackBlitz template](https://stackblitz.com/edit/tama-elements-range) to try browser View Transitions with the current public Tama surface.

This demo intentionally avoids the experimental `this.view.transitions` queue described in older docs.

1. Open the linked template and replace the contents of `src/App.tsx` with the snippet below.
2. Save the file.
3. Click through the screens and adjust the CSS transition styling.

```tsx title="src/App.tsx"
import "./style.css"

import { State } from "@denshya/reactive"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function App() {
  const screens = ["Dashboard", "Billing", "Settings"]
  const index = new State(0)

  function nextScreen() {
    const update = () => index.set(value => (value + 1) % screens.length)

    document.startViewTransition?.(update) ?? update()
  }

  return (
    <main className="app">
      <header>
        <h1>Tama View Transitions</h1>
        <button type="button" on={{ click: nextScreen }}>Next screen</button>
      </header>
      <div className="stage">
        <section className="screen">{index.to(i => screens[i])}</section>
      </div>
    </main>
  )
}

export default App
```

```css title="src/style.css"
:root {
  color-scheme: dark;
  font-family: system-ui, sans-serif;
  background: radial-gradient(circle at top, #243b55 0%, #141e30 100%);
}

.app {
  min-height: 100vh;
  padding: 4rem;
  display: grid;
  gap: 3rem;
}

.stage {
  position: relative;
  height: 320px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.screen {
  display: grid;
  place-items: center;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: transform 160ms ease, opacity 160ms ease;
}

```

> Tip: For current Tama apps, prefer explicit state changes plus `document.startViewTransition(...)` when you want browser-native page animations.

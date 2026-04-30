---
sidebar_position: 1
---

# Getting Started

## Install

```bash
bun i @denshya/proton @denshya/reactive
bun i -D vite typescript
```

## Setup

Use `vite`

```json title="package.json"
{
  "type": "module",
  // ...
  "scripts": {
    "dev": "vite",
  },
  "dependencies": {
    // ...
  },
}
```

> [!TIP]
>Any bundler works (not just `vite`), no bundler plugins required.

Enable Tama JSX

```json title="tsconfig.json"
{
  "compilerOptions": {
    // ...
    "jsx": "react-jsx",
    "jsxImportSource": "@denshya/proton/jsx/virtual",
    // ...
  }
}
```

> [!NOTE]
> Any JSX may work well in TamaJs, it depends on deviations from React/Tama JSX, but you can fix them with [JSX customization](./custom/custom-jsx.md).

## Quick Start

### Code

```tsx title="/src/main.tsx"
import { State } from "@denshya/reactive"
import { WebInflator } from "@denshya/proton"

function RangeApp() {
  const progress = new State(50)

  return (
    <div>
      <input type="range" min="0" max="100" step="1" value={progress} />
      <progress value={progress} max="100">{progress} %</progress>
      <button type="button" on={{ click: () => progress.set(50) }}>Reset</button>
    </div>
  )
}

const inflator = new WebInflator
const appView = inflator.inflate(<RangeApp />)

document.getElementById("root")!.replaceChildren(appView)
```

### Start

```bash
bun dev
```

## React Developers: The Short Version

- Component functions run once.
- Signals and observables update the DOM directly.
- `return` defines the default view.
- `this.view.set(...)` swaps the current view later.
- `this.tree.context` replaces `useContext`.
- Async components and async generators are first-class.

## What Gets Inflated

Inflation turns JSX into DOM nodes.
Any inflate call outputs either a DOM node or a component-managed node group.

```js
inflator.inflate(123) // => Text
inflator.inflate(<div />) // => HTMLDivElement
inflator.inflate(<div mounted={new State(false)} />) // => Comment
inflator.inflate(<Component />) // => ComponentGroup
inflator.inflate(new Comment) // => Comment
```

Learn more about [`ComponentGroup`](./unwinding/component-group.md).

## What A Component Means In Tama

Compared with React:

- no hooks
- no rerender loop
- async and async generator components are allowed
- return values are not limited to JSX elements

```tsx
function Component() {
  return (...)
}
```

## JSX

Tama supports React-style JSX while still allowing custom attributes and direct DOM values.

```tsx
<div
  onClick={event => event.x}
  on={{ click: event => event.x }}
  ariaLabel="label"
  aria={{ ariaLabel: "label" }}
></div>
```

## Next Steps

- Start with [Building Apps](./how-to-use/building-apps.md) for the React-to-Tama workflow.
- Use [Routing](./how-to-use/router.md) when you need app navigation.
- Read [Reactivity](./unwinding/reactivity.md) for observable patterns.
- Use [Changing Views](./guides/changing-views.md) and [Async Views](./guides/async-views.md) for loaders and screen swaps.

[Playground](https://stackblitz.com/edit/tama-elements-range?file=src%2FApp.tsx)

```tsx
function ColorApp() {
  const pointerMoveX$ = window.when("pointermove").map(event => event.x)
  const background = pointerMoveX$.map(x => x > 500 ? "red" : "green")

  return (
    <div style={{ background }}>{pointerMoveX$}</div>
  )
}
```

#### Conditional mounting

```tsx
function ColorApp() {
  const mounted$ = window.when("pointermove").map(event => !!event.x)

  return (
    <div mounted={mounted$}>Visible</div>
  )
}
```

#### Lists

Supports plain array mapping just like in React, though doesn't require `key` attribute.

```tsx
<div>{[1, 2, 3].map(item => <span>{item}</span>)}</div>
```

Also supports observable iterable (e.g. Array, Set, ...).

```tsx
const items = new State([1, 2, 3])

<div>{items.map(items => items.map(item => <span>{item}</span>))}</div>
```

> [!NOTE]
> This is a bit confusing snippet, you can ease it by using [`StateArray`](./unwinding/reactivity.md#statearray).

## Extend Code

```tsx
import { State } from "@denshya/reactive"
```

```tsx
const PROGRESS_DEFAULT = 50

function App() {
  const progress = new State(PROGRESS_DEFAULT)

  return (
    <div style={{ display: "grid" }}>
      <input type="range" min="0" max="100" step="1" value={progress} />
      <progress value={progress} max="100">{progress} %</progress>
      <button disabled={progress.is(PROGRESS_DEFAULT)} on={{ click: () => progress.set(PROGRESS_DEFAULT) }}>Reset</button>

      <div>
        {Array.from({ length: 11 }, (_, index) => (
          <button on={{ click: () => progress.set(index * 10) }}>{index}</button>
        ))}
      </div>
    </div>
  )
}
```

> [!NOTE]
> You should acknowledge that this example uses `@denshya/reactive`, which is complementary, any **observable-based** state library works.

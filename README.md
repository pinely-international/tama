# Proton 🔵

Fast, Light weight (~5kb gzip), opt in Native Observables, Rootless, DOM-first, No configuration, Component-based UI library with Android-style View inflation.
Based on [No Framework Principle](https://dev.to/framemuse/no-framework-principle-arised-2n39).

[Playground](https://stackblitz.com/~/github.com/denshya/proton-template)

## Install

```bash
bun i @denshya/proton
```

For the JSX and types to work properly, you should add this to your `tsconfig.json`/`jsconfig.json`

```jsonc
{
  "compilerOptions": {
    // ...
    "jsx": "react-jsx",
    "jsxImportSource": "@denshya/proton/jsx/virtual",
    // ...
  }
}
```

## What is "Rootless"?

That is more-less novel wording, another good phrase is "Reversed Element Factory Ownership".
These all stand for a component (or element) factory function producing/providing ownership to owned elements rather than being a side-effects function,
which only modifies given element.

From querying the element and modifying

```js
const element = document.getElementById("id")
makeWidget(element)

function makeWidget(element) {
  element.style = "..."
  // ... Some other styling and structure
}
```

To creating desired element and sharing ownership

```js
function createWidget() { // returns element instead.
  const element = document.createElement("div")
  element.style = "..."
  // ... Some other styling and structure

  return element
}
```

This forces you to find the exact place where the new element should go, which may be tricky,
this what Proton solves with JSX while still letting you choose the place to attach or reattach Proton Component.

This allows you do to this: (Somewhat an alternative to Web Components)

```jsx
function Widget() {
  return <div style={...} /> // Some code.
}
Widget.Standalone = inflator.inflate(<Widget />)

const container = document.querySelector(".container")
container?.append(Widget.Standalone)
```

## Observables Allowed in JSX

The turning point is that JSX element attributes and children can consume [WICG Observables](https://github.com/WICG/observable),
meaning practically any library can be used as a State Manager.

```jsx
const text = new State("")

const button = document.getElementById("button")
button.append(inflate.inflate(<div>{text}</div>))
```

_Continue reading about_ [JSX Reactivity](https://denshya.github.io/proton/learn/unwinding/reactivity)

## Customization

Adding your own JSX Attribute for any element is as easy as never.

For example, **`classMods`** - it will ensure BEM for elements without anoying imports.

```jsx
inflator.jsxAttributes.set("classMods", context => {
  if (context.value == null) return
  context.bind("className", bem(context.props.className, context.value))
})
```

More about [customization](https://denshya.github.io/proton/category/custom-behavior)

## Fault Tolerance

Unlike to React - Proton will not propogate thrown errors to parents - errors in Children will not break Parents while you still can catch them.

```jsx
function Child() { throw new Error("Test") }
function Parent(this: Proton.Component) { return <div>123<Child /></div> }

document.body.append(inflate.inflate(<Parent />)) // Will render `123` without errors.
```

Learn how you [catch errors](https://denshya.github.io/proton/learn/guides/error)

## Open Internals

To maintain open internals this library uses Classes instead of Functions as factories and uses `private` identifier in TypeScript,
which gives you propert types while not stopping you from experimenting with internal variables and even allowing you to override them in convential way.

## Similar Libraries

If you want manage your components in a somewhat complex way (like in React), you can continue reading this, but otherwise you may want to consider these alternatives:

- <https://github.com/kitajs/html>
- <https://github.com/reactivehtml/rimmel>

## Frameworks Comparison

| Feature                   | Proton | SolidJS | Svelte | React | Vue | Angular |
| ------------------------- | :----: | :-----: | :----: | :---: | :-: | :-----: |
| Tiny size                 |   ✅   |   ✅    |   ✅   |  ❌   | ❌  |   ❌    |
| Virtual DOM               |   ❌   |   ❌    |   ❌   |  ✅   | ✅  |   ✅    |
| Reactivity via Signals    |   ✅   |   ✅    |   ✅   |  ❌   | ✅  |   ✅    |
| Two‑Way Data Binding      |   ✅   |   ❌    |   ✅   |  ❌   | ✅  |   ✅    |
| Component‑based           |   ✅   |   ✅    |   ✅   |  ✅   | ✅  |   ✅    |
| JSX Support               |   ✅   |   ✅    |   ❌   |  ✅   | ❌  |   ❌    |
| Server‑Side Rendering     |   ✅   |   ✅    |   ✅   |  ✅   | ✅  |   ✅    |
| Direct DOM Manipulation   |   ✅   |   ✅    |   ✅   |  ❌   | ❌  |   ❌    |
| Fine‑Grained Reactivity   |   ✅   |   ✅    |   ✅   |  ❌   | ❌  |   ❌    |
| TypeScript First          |   ✅   |   ✅    |   ❌   |  ❌   | ❌  |   ✅    |
| Immutable Data Focus      |   ❌   |   ✅    |   ❌   |  ✅   | ❌  |   ❌    |
| Compiled Output           |   ❌   |   ✅    |   ✅   |  ❌   | ❌  |   ❌    |
| Dependency Injection      |   ❌   |   ❌    |   ❌   |  ❌   | ❌  |   ✅    |
| State Management Built‑in |   ❌   |   ❌    |   ❌   |  ❌   | ✅  |   ✅    |
| Built‑in Animations       |   ❌   |   ❌    |   ✅   |  ❌   | ✅  |   ✅    |

## Getting Started

```tsx
function App() {
  return <div>Hello World!</div>
}

const inflator = new WebInflator
const AppView = inflator.inflate(<App />)

document.getElementById("root").replaceChildren(AppView)
```

## JSX

Proton supports React-like JSX, except that it maps directly to [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) elements and allows any value to be put into attributes or as children of **any elements**.

```xml
<div className="product-card">
  <h2>Title</h2>
  <p>Description</p>
  <img src="/static/product-card.jpg" />

  // You can put your weird staff.
  <aside id={new MyIdObject} />
</div>
```

Learn more about [Inflator](#inflator) to provide custom handlers.

## TypeScript

Report if there are anything uncovered for TypeScript.

## FAQ

<details>
  <summary>Does React hooks work in Proton?</summary>
  No, but it's very extesible so probably some enthusiasts might implement it. BTW, even though libraries from other "frameworks" won't work in Proton, libraries for Proton are supposed to work in other frameworks too.
</details>
<!-- <details>
  <summary>question?</summary>
  answer
</details> -->

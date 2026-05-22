# Open UI Rendering

This is an library for rendering your UI with familiar features such as JSX, Function Components and similar feeling to React,
while being widely open to extension and modification. It has very tiny initial build, but it may get bigger with more features you use.

The purpose of the library is to give a way to introduce something similar to React, but based on Granular Reactivity and with native DOM support.
It means you can return or put DOM elements directly into JSX, or **optionally** run components independently without creating a root.

You get generally more control over Lifecycle and such since the components only invoked once,
so it doesn't require deep thinking about the process, it's rather trivial, truly declarative and explicit.
In practice, this means easier debugging, but may require a few extra LoCs.

Almost every part of the library can be replaced with your own, if you don't like how States or Lifecycles are defined, you can rearrange it in your own way.
It's based on the principle that I came up with: a library should define borders where it takes control and where a developer is engaged.

<h4 align="center">TypeScript Support, Treeshakable, Based on the <a href="https://dev.to/framemuse/no-framework-principle-arised-2n39">No Framework Principle</a></h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@denshya/proton">
    <img src="https://img.shields.io/npm/v/@denshya/proton?color=007ec6" />
    <img alt="npm package minimized gzipped size" src="https://img.shields.io/bundlejs/size/@denshya/proton">
  </a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly" /></a>
  <a href="https://stackblitz.com/@FrameMuse/collections/tama"><img alt="Static Badge" src="https://img.shields.io/badge/Playground%20Available-1389fd?logo=lightning"></a>
</p>

## Install

```bash
bun i @denshya/proton
npm i @denshya/proton
pnpm i @denshya/proton
yarn add @denshya/proton
```

## What is "Rootless"?

It means you don't have to create a "root" like in React, or simply put, hijack an element to render the App.
But we usually still do it because it's simpler, though in this library you don't need to create a special root instance, you just inflate a component and add it to the document.

That is a novel wording, another good phrase is "Reversed Element Factory Ownership."
These ones stand for an element factory function providing ownership to internal elements rather than modifying external.

### We go

From querying the element and modifying it:

```js
const element = document.getElementById("id")
makeWidget(element)

function makeWidget(element) {
  element.style = "..."
  // ... Some other styling and structure
}
```

To creating the desired element and sharing ownership:

```js
function createWidget() { // returns an element instead.
  const element = document.createElement("div")
  element.style = "..."
  // ... Some other styling and structure

  return element
}
```

This requires finding a place where the new element should go, which gives more control, but needs "more effort".
This library solves it with JSX, but it still lets you choose the place to attach a Tama Component.

## This allows

To do this:

```jsx
function Widget() {
  return document.createElement("div")
}
Widget.Standalone = inflator.inflate(<Widget />)

const container = document.querySelector(".container")
container?.append(Widget.Standalone)
```

## DOM First & Easier Integration

Nodes are allowed in JSX, making it easier to integrate third-party libraries that are for VanillaJS.

```jsx
function Widget() {
  const button = document.getElementById("button")
  button.append("Click me")

  return <div style={...}>{button}</div>
}
```

## Observables Allowed in JSX

The turning point is that JSX element attributes and children can consume observable-like values with a `subscribe(...)` method,
meaning practically any library can be used as a State Manager.

```jsx
const text = new State("")

const button = document.getElementById("button")
button.append(inflate.inflate(<div>{text}</div>))

text.set("Some text")
```

_Continue reading about_ [JSX Reactivity](https://tama.denshya.dev/learn/unwinding/reactivity)

## Customization

Adding your own JSX Attribute for any element is as easy as ever.

For example, **`classMods`** - it will ensure BEM for elements without annoying imports.

```jsx
inflator.jsxAttributes.set("classMods", context => {
  if (context.value == null) return
  context.bind("className", bem(context.props.className, context.value))
})
```

More about [customization](https://tama.denshya.dev/category/custom-behavior)

## Fault Tolerance

Unlike React, Tama will not propagate thrown errors to parents - errors in Children will not break Parents, while you can still catch them.

```jsx
function Child() { throw new Error("Test") }
function Parent(this: Tama.Component) { return <div>123<Child /></div> }

document.body.append(inflate.inflate(<Parent />)) // Will render `123` without errors.
```

Learn how you can [catch errors](https://tama.denshya.dev/learn/guides/error)

## Open Internals

To maintain open internals, this library uses Classes instead of Functions as factories and uses the `private` identifier in TypeScript,
which gives you proper types while not stopping you from experimenting with internal variables and even allowing you to override them in a conventional way.

## Similar Libraries

If you want to manage your components in a somewhat complex way (like in React), you can continue reading this, but otherwise, you may want to consider these alternatives:

- <https://github.com/kitajs/html>
- <https://github.com/reactivehtml/rimmel>

## Why Tama over React?

It is very similar to React, it tries to simplify development as we know it in React.

|Feature|Description|
|-------|-----------|
|Extended Customization|Custom Attributes, Children Adapters, Element Transformation, Class extension|
|View transitions|Browser View Transitions can be integrated around your own state or view updates; built-in transition queue work is still settling in this checkout|
|No built-in State Manager|Any State Manager that supports a Signal-like interface **will just** work in Tama, while there is no enforcement of one|
|Signals/Observables Support|Support for observable-like values and signal-style state objects that expose subscribe/get semantics|
|No root elements|Any component can be **inflated** and attached anywhere|
|Components can be Async 😱 (Client side)|Await your values and delay/schedule the views with fallbacks and an initial view.|
|Top-level allowed|You can do anything in any scope, Tama doesn't put any constraints on where or from what something is initialized - enjoy!|
|Children don't crash Parents|An error in the subtree will not break the rendering of parents.|
|Return any value|Components can be returned with **any** value, no seriously, even DOM Nodes/Elements will work.|
|Class-based|Enables **tree-shaking**, **extensibility**, and **open internals**|

### React Inherited Features

|Feature|Description|
|-------|-----------|
|Tree Context|Explicit context sharing between subtree components|
|Conditional Rendering|Tama implements Conditional Mounting|
|Layouts Swapping|Conditionally changing the whole component layout|
|JSX|Tama supports React JSX, but it also has its own flavor|
|`ref` attribute|Access a DOM element when it's ready - supports refs merging as well|
|Event delegation|Tama subscribes to parents rather than directly to elements too (for lists) ([WIP](https://github.com/pinely-international/tama/issues/53))|
|SSR|Provides an extendable `JSXSerializer` and examples with full DOM support in DOM-less environments like servers|
|Portal|Portals are natural and very easy, you just use a component-scoped inflator|
|Error catching|Tama exposes a clear API to catch errors and others|

**Problems to solve:**

Tama isn't perfect, it's being developed.
<https://github.com/pinely-international/tama/milestones>

## Getting Started

```tsx
import { WebInflator } from "@denshya/proton"

function App() {
  return <div>Hello World!</div>
}

const inflator = new WebInflator
const AppView = inflator.inflate(<App />)

document.getElementById("root").replaceChildren(AppView)
```

## JSX

Tama supports JSX. It maps directly to [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) elements and allows any value to be put into attributes or as children of **any element**. And it has a different flavor compared to React JSX.

```xml
<div className="product-card">
  <h2>Title</h2>
  <p>Description</p>
  <img src="/static/product-card.jpg" />

  // You can put your weird stuff here.
  <aside id={new MyIdObject()} />
</div>
```

Learn more about how to provide [custom handlers](https://tama.denshya.dev/learn/custom/inflate).

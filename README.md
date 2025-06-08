# Proton 🔵

Fast, Light weight (~5kb gzip), Component-based, JSX UI library.

[Playground](https://stackblitz.com/~/github.com/denshya/proton-template)

## Motivation

Other libraries provide their own built-in “primitives” that you **have to** stick to.
They restrict extensibility in a favor of concealing implementation details and don't give any explicit controls.

This all makes it very difficult to build Web GAMES - this is the intial intention to build this package, eventually a potentiall to compete with React.
Another point is to create a library that can be used alongside with VanilaJS intuitively without deep learning.

## Pillars

- [No Framework](https://dev.to/framemuse/no-framework-principle-arised-2n39)
- Open Internals
- Fault Tolerance
- Customization

## Similar Libraries

If you want manage your components in a somewhat complex way (like in React), you can continue reading this, but otherwise you may want to consider these alternatives:

- <https://github.com/kitajs/html>

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

## Special Attributes (Events, Styles, Namespaces)

Proton defines several "special" attributes for [Intrinsic Elements](https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements) for convenience's sake.

```tsx
function MyApp() {
  return (
    <div
      style={{ display: "absolute" }}
      on={{ click: event => event.pointerId }}
    >
      // This element will be `SVGAElement` instead of `HTMLAnchorElement`
      <a ns="http://www.w3.org/2000/svg" />
    </div>
  )
}
```

`style` is special because it's extended to consume an Record object with various property types, including Observables.

## Inflator

A class that is responsible for creating a view representation held in memory.

## Built-in Helpers

### `Reconcile`

Currently not implemented, but this is a desired syntax

```tsx
const array = Observable([{a:1}, {a:2}, {a:3}])
array.set([{a:0}, {a:2}, {a:4}]) // Will trigger list reconciling, which will create 2 new elements, but will **reuse** the one with unchanged key (`{a:2}`).

const list = new Proton.Reconcile(array, { key: it => it.a })
list.key = it => it.b // Assigns a new `key` selector.

<div>{list.map((observableValue, index) => <span>{observableValue} {index}</span>)}</div>
```

### `Lazy`

It can be used for dynamic imports, but it is strongly recommended to implement this one in your own way as it's very simple and will give your users a much better UX.

```tsx
function Lazy(importFactory: () => Promise<unknown>) {
  return async function (this: Proton.Component) {
    this.view.set(<Loader />)
    const Module = await importFactory()
    return <Module />
  }
}

const UserProfile = Lazy(async () => (await import("pages/user-profile")).default)
<UserProfile />

```

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
